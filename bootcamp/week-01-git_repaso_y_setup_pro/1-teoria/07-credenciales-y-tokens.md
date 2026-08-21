# Credenciales y tokens

> Un token es una copia de tus permisos que viaja sola. La pregunta correcta no
> es "¿cuál funciona?" sino "¿cuál es el que menos daño hace si se filtra?".

## 🎯 Objetivos

- Elegir el tipo de credencial correcto para cada situación
- Explicar por qué un token con más alcance del necesario es un riesgo, no una comodidad
- Configurar un fine-grained PAT con el mínimo de permisos
- Saber dónde vive cada credencial y cómo se guarda sin filtrarla
- Reaccionar a una filtración en el orden correcto

## 1. Qué problema resuelve

Cuando automatizas GitHub, algo tiene que autenticarse en tu nombre. Ese "algo"
acaba en un script, en una variable de entorno, en el CI o en el portátil de un
compañero. Todo lo que aprendas aquí se resume en dos ideas: **alcance mínimo** y
**vida corta**.

## 2. Los cuatro tipos de credencial

| Credencial | Vive | Alcance | Cuándo |
|------------|------|---------|--------|
| **`GITHUB_TOKEN`** | Solo durante un job de Actions | El repo del workflow, con los `permissions` que declares | Siempre que estés dentro de un workflow |
| **Fine-grained PAT** | Hasta su caducidad (obligatoria) | Repos concretos, permisos concretos | Scripts locales, automatización personal |
| **PAT clásico** | Hasta que lo revoques | **Todo lo que tú puedes hacer**, en todas tus organizaciones | Solo si algo no soporta fine-grained |
| **GitHub App** | Token de instalación, ~1 hora | Los repos instalados, con los permisos declarados | Automatización de equipo u organización |

Orden de preferencia, de mejor a peor:
**GitHub App > `GITHUB_TOKEN` > fine-grained PAT > PAT clásico.**

### `GITHUB_TOKEN`

Se inyecta solo en cada job de Actions. No lo creas, no lo guardas, no lo rotas:
caduca cuando el job termina.

```yaml
permissions:
  contents: read
  issues: write
```

Sus permisos por defecto los fija el repositorio o la organización, y pueden ser
de escritura. Declararlos explícitamente en **cada** workflow —empezando por
`permissions: {}` y añadiendo solo lo que falle— es la práctica correcta. Se
trabaja a fondo en las Semanas 09 y 11.

Una limitación que sorprende: **un evento disparado con `GITHUB_TOKEN` no dispara
otro workflow.** Es una protección contra bucles infinitos. Si necesitas
encadenar, hace falta una App o un PAT (Semana 11).

### Fine-grained PAT

`Settings → Developer settings → Personal access tokens → Fine-grained tokens`

- **Caducidad obligatoria**: ponla corta (30-90 días). El máximo es un año
- Selecciona **solo los repositorios** que necesita, nunca "all repositories"
- Permisos por recurso (`Contents: read`, `Issues: write`), no scopes globales
- En repos de una organización, un administrador tiene que **aprobarlo** antes de
  que funcione: es una funcionalidad, no un obstáculo

### PAT clásico

Un solo scope, `repo`, da lectura y escritura sobre **todos** tus repositorios
privados, los de tus organizaciones incluidos. Si se filtra, se filtró todo. Solo
donde no haya alternativa, y con caducidad.

```bash
gh auth status                       # qué scopes tiene el token que usas ahora
gh auth refresh -s workflow,read:org # añade solo lo que falte
```

Para este bootcamp bastan `repo`, `read:org`, `workflow` y `gist`. Nada más hasta
que algo devuelva un `403` — y entonces añades **ese** scope, no todos.

### GitHub App

Es la única credencial que no pertenece a una persona. La App se autentica con su
clave privada (un JWT), pide un **token de instalación** que caduca en una hora, y
actúa con los permisos declarados en su manifiesto.

| Ventaja | Por qué importa |
|---------|-----------------|
| No depende de nadie | El becario se va y la automatización sigue |
| Token de una hora | Una filtración caduca sola |
| Permisos declarados | Auditables, revisables en un PR |
| Límite de peticiones propio | Escala con la organización, no con tu cuenta |

Es lo correcto para cualquier automatización de equipo. Se construye en la
Semana 15.

## 3. Dónde vive cada credencial

```bash
gh auth setup-git       # gh se convierte en el credential helper de git
git config --global credential.helper   # ver cuál tienes
```

| Sitio | Seguridad |
|-------|-----------|
| Llavero del sistema (macOS Keychain, libsecret, Windows Credential Manager) | ✅ Lo mejor disponible |
| `gh` (usa el llavero si existe; si no, `~/.config/gh/hosts.yml` con permisos restrictivos) | ✅ Bien |
| Variable de entorno `GH_TOKEN` en la sesión | ⚠️ Aceptable en CI, se filtra en `ps` y en volcados |
| `.env` **fuera** del repo y en `.gitignore` | ⚠️ Aceptable en local |
| `credential.helper store` (texto plano en `~/.git-credentials`) | ❌ Evítalo |
| Un archivo del repositorio | ❌ Repo público = token público en segundos |
| El historial del shell | ❌ Y no te enteras |

> [!WARNING]
> Nunca pongas un token en la línea de comandos —`curl -H "Authorization: Bearer
> <TOKEN>"`— porque queda en el historial del shell, en la lista de procesos y en
> las capturas de pantalla. Si tienes que usar `curl`, pásalo por stdin:
> `curl -H @- <<< "Authorization: Bearer $TOKEN"`. O usa `gh api`, que gestiona la
> credencial por ti.

## 4. Límites de peticiones según la credencial

| Credencial | Límite aproximado |
|------------|-------------------|
| Sin autenticar | 60 peticiones/hora por IP |
| PAT (clásico o fine-grained) | 5.000 peticiones/hora |
| `GITHUB_TOKEN` en Actions | 1.000 peticiones/hora **por repositorio** |
| GitHub App instalada en una organización | Escala con el número de repos y usuarios |

Además hay **límites secundarios** que no se cuentan por hora: ráfagas de
escrituras, peticiones concurrentes, creación de contenido. La respuesta correcta
a un `403` con `Retry-After` es esperar ese tiempo, no reintentar en bucle.

```bash
gh api rate_limit --jq '.rate'
```

Cifras y detalles actualizados en
[Rate limits for the REST API](https://docs.github.com/rest/using-the-rest-api/rate-limits-for-the-rest-api).

## 5. Cuando se filtra un token

El orden importa, y casi todo el mundo lo hace al revés:

1. **Revoca el token.** `Settings → Developer settings → Tokens → Revoke`. Un
   token revocado es papel mojado, esté donde esté
2. **Crea el nuevo** y actualiza donde hiciera falta
3. **Revisa qué se hizo con él**: `Settings → Security log` de tu cuenta o de la
   organización
4. **Y solo entonces**, limpia la historia si quieres. Reescribir el repositorio
   **no** invalida el token ni lo borra de los forks y las cachés

GitHub ayuda por su cuenta: **secret scanning** detecta tokens en repos públicos
y avisa al proveedor (los suyos los revoca automáticamente), y **push protection**
rechaza el push antes de que el secreto llegue al servidor. Se configura en la
Semana 13.

> [!CAUTION]
> Este es el motivo de la regla del repositorio: **nunca escribas un token con
> formato válido**, ni siquiera inventado, ni siquiera en un ejemplo. Un literal
> con el prefijo real y la longitud real dispara el escáner y genera una alerta
> falsa que alguien tendrá que investigar. En los ejemplos se escribe `<TOKEN>` o
> `${{ secrets.MI_TOKEN }}`.

## 6. Antipatrones

| Antipatrón | Por qué duele | Qué hacer |
|------------|---------------|-----------|
| PAT clásico con todos los scopes | Una filtración compromete tu cuenta entera | Fine-grained acotado a un repo |
| Tokens sin caducidad | Un secreto eterno es un secreto olvidado | 30-90 días |
| Token en `.env` commiteado | Repo público = token público en segundos | Llavero, o `gh` |
| PAT dentro de un workflow | `GITHUB_TOKEN` ya está ahí y caduca solo | `GITHUB_TOKEN` + `permissions` |
| Compartir un PAT en el equipo | No sabes quién hizo qué y no se puede revocar por persona | GitHub App |
| Un token "de servicio" en la cuenta de una persona | Se va la persona, se cae la automatización | GitHub App o cuenta de máquina |
| Reintentar en bucle tras un `403` | Te ganas un bloqueo más largo | Respeta `Retry-After` |
| Limpiar la historia antes de revocar | El token sigue siendo válido mientras tanto | Revocar **primero** |

## 7. Trucos

- **Auditar tus tokens**: `Settings → Developer settings` muestra la fecha del
  último uso de cada uno. El que no se usa hace tres meses, se borra
- **Caducidad corta sin dolor**: apunta en el calendario la renovación el día que
  creas el token, no el día que caduque
- **Un token por automatización**, nunca uno compartido: así revocarlo solo rompe
  una cosa y sabes cuál
- **Probar qué puede hacer un token**: `GH_TOKEN=<TOKEN> gh api user --jq .login`
  y luego el endpoint concreto; el `403` te dice exactamente qué permiso falta
- **Ver los scopes de un token clásico** sin abrir el navegador:
  `gh api user --include 2>&1 | grep -i x-oauth-scopes`
- **Deploy keys** para dar acceso de solo lectura a **un** repositorio desde un
  servidor: es más acotado que cualquier PAT
- **En Actions, empieza por `permissions: {}`** y añade lo que falle. Es el
  camino más rápido al mínimo real

## 📚 Recursos Adicionales

- [GitHub Docs — Tipos de autenticación](https://docs.github.com/authentication/keeping-your-account-and-data-secure/about-authentication-to-github)
- [GitHub Docs — Managing personal access tokens](https://docs.github.com/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens)
- [GitHub Docs — About GitHub Apps](https://docs.github.com/apps/overview)
- [GitHub Docs — Rate limits](https://docs.github.com/rest/using-the-rest-api/rate-limits-for-the-rest-api)

## ✅ Checklist de Verificación

- [ ] Puedes explicar cuándo NO usar un PAT clásico
- [ ] Tu PAT tiene caducidad y está limitado a repos concretos
- [ ] Sabes dónde guarda `gh` tu credencial en tu máquina
- [ ] Sabes cuál es el primer paso ante una filtración
- [ ] `gh api rate_limit` te responde y sabes leer el resultado
