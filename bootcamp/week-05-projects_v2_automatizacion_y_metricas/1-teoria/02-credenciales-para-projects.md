# Credenciales para automatizar Projects

> Es el muro contra el que choca todo el mundo: el workflow está bien escrito, la
> mutación es correcta, y aun así responde `Resource not accessible by
> integration`. No es tu YAML: es el token.

## 🎯 Objetivos

- Explicar por qué `GITHUB_TOKEN` no puede tocar un Project v2
- Configurar un PAT fine-grained con el permiso exacto y nada más
- Montar la alternativa buena: una GitHub App que emite tokens de una hora
- Guardar, rotar y auditar la credencial sin sustos
- Diagnosticar los errores de permisos en menos de un minuto

## 1. Qué problema resuelve

Un project no vive en un repositorio: vive en tu **cuenta** o en una
**organización** ([Semana 04, Teoría 01](../../week-04-projects_v2_fundamentos/1-teoria/01-modelo-de-datos.md)).
El token que Actions inyecta en cada job tiene alcance sobre **el repositorio del
workflow**, y punto. Por eso falla, y por eso no hay ningún `permissions:` que lo
arregle: el permiso que falta no existe en ese token.

> [!IMPORTANT]
> **`GITHUB_TOKEN` no funciona con Projects v2.** No es una limitación de
> configuración: es de alcance. La solución es siempre otra credencial.

## 2. Las tres opciones

| Credencial | Alcance | Vida | Cuándo |
|------------|---------|------|--------|
| `GITHUB_TOKEN` | El repositorio | El job | Todo lo demás: issues, PRs, releases |
| **PAT fine-grained** | Los projects que le des | Hasta su caducidad | Automatización personal, un repositorio |
| **GitHub App** | Los recursos donde se instala | Token de ~1 hora | Equipos, organizaciones, varios repos |

Orden de preferencia: **App > PAT fine-grained**. El PAT es aceptable en un
proyecto personal; en cuanto haya más de una persona, la App es lo correcto,
porque no depende de la cuenta de nadie.

## 3. PAT fine-grained, paso a paso

`Settings → Developer settings → Personal access tokens → Fine-grained tokens`

1. **Resource owner**: tu usuario (o la organización, y entonces alguien tendrá
   que aprobarlo)
2. **Repository access**: solo el repositorio del workflow
3. **Permissions**:
   - `Projects: Read and write` — el que hace falta. Está en los permisos de
     **cuenta** si el project es tuyo, y en los de **organización** si es de una
   - `Issues: Read` — solo si el workflow lee labels o cuerpos
   - `Contents: Read` — solo si hace checkout
4. **Expiration**: 90 días. Apúntalo en el calendario el mismo día que lo creas

```bash
gh secret set PROJECT_TOKEN          # lo pide por entrada estándar, no queda en el historial
gh secret list
```

Y en el workflow:

```yaml
      - uses: actions/add-to-project@5afcf98fcd03f1c2f92c3c83f58ae24323cc57fd # v2.0.0
        with:
          project-url: https://github.com/users/<tu-usuario>/projects/<n>
          github-token: ${{ secrets.PROJECT_TOKEN }}
```

> [!WARNING]
> Un PAT en un secreto es un secreto de larga vida con permiso de escritura sobre
> tu planificación. Acótalo al mínimo, ponle caducidad y **no lo reutilices** en
> tres repositorios distintos: cuando toque revocarlo, querrás romper una sola
> cosa.

## 4. GitHub App: la opción que no caduca sola

Una App se autentica con su clave privada, pide un **token de instalación** que
vive una hora y actúa con los permisos que declaraste. Ventajas sobre el PAT:

- No pertenece a una persona: nadie se lleva la automatización al irse
- El token caduca en una hora: una filtración se apaga sola
- Sus permisos están declarados y son auditables
- Tiene su propio límite de peticiones

Montaje mínimo dentro de un workflow:

```yaml
    steps:
      - uses: actions/create-github-app-token@bcd2ba49218906704ab6c1aa796996da409d3eb1 # v3.2.0
        id: app-token
        with:
          app-id: ${{ vars.APP_ID }}
          private-key: ${{ secrets.APP_PRIVATE_KEY }}
          owner: ${{ github.repository_owner }}

      - uses: actions/add-to-project@5afcf98fcd03f1c2f92c3c83f58ae24323cc57fd # v2.0.0
        with:
          project-url: https://github.com/users/<tu-usuario>/projects/<n>
          github-token: ${{ steps.app-token.outputs.token }}
```

Lo que hay que preparar una vez: crear la App (`Settings → Developer settings →
GitHub Apps`), darle el permiso de **Projects: Read and write**, instalarla en tu
cuenta u organización, y guardar su `App ID` como variable y su clave privada
como secreto. La App completa —incluida la parte de servidor— se construye en la
Semana 15.

## 5. IDs: variables, no secretos

Los identificadores del project (`PVT_…`, `PVTF_…`, IDs de opción) **no son
sensibles**: son públicos en cuanto alguien mira el project. Guardarlos como
secretos solo consigue que no puedas verlos en los logs cuando algo falla.

```bash
gh variable set PROJECT_ID --body "PVT_kwHOA..."
gh variable set PRIORITY_FIELD_ID --body "PVTSSF_lADO..."
gh variable list
```

```yaml
        env:
          PROJECT_ID: ${{ vars.PROJECT_ID }}
```

Regla: **secretos lo que da acceso; variables lo que solo identifica.**

## 6. Diagnóstico rápido

| Error | Causa | Arreglo |
|-------|-------|---------|
| `Resource not accessible by integration` | Estás usando `GITHUB_TOKEN` | PAT o App |
| `INSUFFICIENT_SCOPES` | Token de usuario sin `project` | `gh auth refresh -s project` |
| `Could not resolve to a node` | El token no ve ese project, o el ID es de otro tipo | Comprueba permiso y prefijo del ID |
| Funcionaba y hoy no, sin cambios | PAT caducado | Renuévalo y apunta la fecha |
| La organización lo bloquea | El PAT fine-grained está pendiente de aprobación | Que un administrador lo apruebe |

Comprobación en treinta segundos, desde tu máquina, con el mismo token:

```bash
GH_TOKEN=<TOKEN> gh api graphql -f query='{ viewer { login } }'
GH_TOKEN=<TOKEN> gh project list --owner @me
```

Si eso funciona en local y falla en el workflow, el problema es el secreto (mal
copiado, mal nombrado) y no el permiso.

## 7. Antipatrones

| Antipatrón | Por qué duele | Qué hacer |
|------------|---------------|-----------|
| Insistir con `GITHUB_TOKEN` y `permissions:` | El permiso que falta no existe ahí | PAT o App |
| PAT clásico con scope `project` | Da acceso a todo lo tuyo | Fine-grained acotado |
| PAT sin caducidad "para que no falle" | Secreto eterno con escritura | 90 días y recordatorio |
| El mismo PAT en cinco repositorios | Revocarlo rompe cinco cosas | Uno por automatización |
| IDs guardados como secretos | No puedes depurar y no aportan seguridad | `vars` |
| Token de la cuenta personal para el equipo | Se va la persona, se cae el tablero | GitHub App |
| Imprimir el token para depurar | Queda en los logs del run | Comprueba en local con `GH_TOKEN` |

## 8. Trucos

- **Recordatorio de caducidad**: crea un issue con fecha objetivo el día que
  creas el PAT. Es el único método que funciona
- **Probar el permiso sin lanzar el workflow**:
  `GH_TOKEN=<TOKEN> gh project item-list <n> --owner @me`
- **Rotación sin corte**: crea el token nuevo, actualiza el secreto, comprueba un
  run, y **después** revoca el viejo
- **Auditoría**: `Settings → Developer settings` muestra el último uso de cada
  token; el que lleva meses sin usarse, se borra
- **Un secreto por entorno**: si algún día tienes un project de pruebas, no
  compartas credencial con el de verdad
- **`gh secret set --repo`** para configurarlo desde otra carpeta sin cambiar de
  directorio

## 📚 Recursos Adicionales

- [GitHub Docs — Automating Projects using Actions](https://docs.github.com/issues/planning-and-tracking-with-projects/automating-your-project/automating-projects-using-actions)
- [GitHub Docs — Fine-grained personal access tokens](https://docs.github.com/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens)
- [`actions/create-github-app-token`](https://github.com/actions/create-github-app-token)
- [GitHub Docs — About GitHub Apps](https://docs.github.com/apps/overview)

## ✅ Checklist de Verificación

- [ ] Puedes explicar por qué `GITHUB_TOKEN` no sirve para Projects
- [ ] Tu `PROJECT_TOKEN` tiene caducidad y está acotado a un repositorio
- [ ] Los IDs del project están en `vars`, no en `secrets`
- [ ] Sabes comprobar un token en local antes de culpar al workflow
- [ ] Sabes qué le pedirías a una GitHub App para sustituir el PAT
