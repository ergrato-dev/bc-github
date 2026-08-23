# La vida de un secreto filtrado

> El día que se te escapa una credencial, la pregunta no es «¿cómo borro esto?».
> Es «¿qué se puede hacer con ella ahora mismo, y cómo hago que deje de poder
> hacerse?». Todo lo demás —la historia, el commit, la vergüenza— es secundario y
> además no urge.

## 🎯 Objetivos

- Ejecutar la respuesta en el orden correcto y saber por qué ese orden
- Explicar por qué reescribir la historia no elimina un secreto de GitHub
- Estimar el alcance de una filtración con lo que da la API
- Reconocer las decisiones que empeoran el incidente
- Escribir un cierre de alerta que sirva dentro de un año

## 1. Qué problema resuelve

La reacción instintiva ante un secreto publicado es borrarlo: quitar la línea,
hacer un `push --force`, respirar. Esa secuencia deja el sistema exactamente
igual de comprometido que antes y además destruye la evidencia.

El orden correcto tiene cuatro pasos y **empieza por el proveedor, no por Git**:

| # | Paso | Por qué va aquí |
|:-:|------|-----------------|
| 1 | **Revocar** la credencial en el servicio que la emitió | Es lo único que reduce el riesgo de verdad |
| 2 | **Emitir** una nueva y ponerla donde toca | Restaura el servicio; ya sin prisa |
| 3 | **Evaluar** qué se hizo con la antigua | Es la parte que se salta todo el mundo |
| 4 | **Limpiar y prevenir** | La historia, el `.gitignore`, el control que faltó |

## 2. Paso 1 — Revocar

Revocar es una operación del **proveedor**, no de GitHub. Un token de GitHub se
borra en la configuración de tokens; una clave de AWS se desactiva en IAM; una de
Stripe se rota en su panel.

Para credenciales de GitHub:

```bash
# Los tokens propios se listan y se borran desde la configuración web:
#   Settings → Developer settings → Personal access tokens
# Las claves de despliegue y los secretos del repositorio, por API:
gh api repos/{owner}/{repo}/keys --jq '.[] | {id, title, read_only}'
gh secret list
```

> [!WARNING]
> Revocar rompe lo que estuviera usando esa credencial: un despliegue, un cron,
> un compañero. **Rómpelo igualmente.** Un token comprometido en producción no es
> un servicio funcionando, es un incidente en curso. Avisa, revoca, y luego
> repara con la credencial nueva.

## 3. Paso 2 — Emitir la nueva

Dos reglas que convierten el incidente en una mejora:

- **Menos permisos que la anterior.** Casi siempre la credencial filtrada podía
  más de lo que necesitaba. Es el momento barato de arreglarlo.
- **Que no vuelva a poder pegarse en un archivo.** Si era un secreto de CI, va a
  `gh secret set`. Si era para desplegar, la Semana 11 ya te enseñó a no tenerla:
  **OIDC** cambia el secreto de larga vida por un token de vida corta que se
  emite en cada ejecución.

Un secreto que no existe no se puede filtrar. Es la única defensa perfecta de
toda la semana.

## 4. Paso 3 — Evaluar el alcance

Aquí es donde se distingue una respuesta seria de un borrado nervioso. Tres
preguntas, y todas tienen dónde mirarse:

**¿Cuánto tiempo estuvo viva?** Del commit que la introdujo a la revocación:

```bash
gh api repos/{owner}/{repo}/secret-scanning/alerts/1/locations \
  --jq '.[] | {commit: .details.commit_sha, ruta: .details.path}'
git show --no-patch --format='%aI %an' <sha-del-commit>
```

**¿Se usó?** El registro de auditoría de la organización (Semana 17) lo dice para
credenciales de GitHub; para las de un tercero, el log del proveedor. Buscas
accesos desde direcciones o a horas que no cuadran.

**¿Estaba en más sitios?** El campo `multi_repo` de la alerta dice si el mismo
secreto aparece en otros repositorios tuyos, y es donde aparecen los `.env`
copiados entre proyectos.

El resultado de este paso es una frase escrita, no una sensación: *«activa
durante 40 minutos en un repositorio público, sin accesos anómalos en el log del
proveedor»*. Esa frase es la que va en el `resolution_comment`.

## 5. Paso 4 — Limpiar y prevenir

Ahora sí, la historia. Y con una expectativa realista: **reescribir la historia
no borra el secreto de GitHub**.

Cuando reescribes y fuerzas el push, los commits antiguos dejan de estar
referenciados por una rama, pero:

- Siguen accesibles por su SHA durante un tiempo, y cualquiera que lo tenga —de
  un correo de notificación, de un comentario— puede pedirlos
- **Los forks no se reescriben.** Un fork es un repositorio de otra persona
- Cualquiera que clonó tiene una copia completa, y no hay API para eso
- Los servicios que archivan repositorios públicos ya lo tienen

Por eso la limpieza es **higiene, no remedio**. Es correcta y hay que hacerla —la
Semana 18 cubre `git filter-repo` y sus advertencias—, pero llega después de que
el riesgo ya esté neutralizado por la revocación.

Lo que sí cierra el incidente de verdad es la prevención:

- El `.gitignore` que faltaba
- Push protection activada (el [archivo 03](03-push-protection.md))
- El secreto movido a `gh secret set`, o eliminado con OIDC
- La alerta cerrada como `revoked` con el alcance escrito

## 6. Cerrar la alerta

```bash
gh api repos/{owner}/{repo}/secret-scanning/alerts/1 --method PATCH \
  -f state=resolved \
  -f resolution=revoked \
  -f resolution_comment="Rotado 2026-08-22 14:10 UTC. Activo 38 min. Sin accesos anómalos en el log del proveedor. Origen: .env sin ignorar; añadido a .gitignore."
```

Ese comentario tiene las cuatro cosas que alguien va a querer dentro de un año:
**cuándo**, **cuánto tiempo**, **qué se comprobó** y **qué cambió para que no se
repita**.

## 7. Dónde se revoca cada cosa

El paso 1 solo es rápido si sabes de antemano dónde se pulsa. La tabla que
conviene tener escrita **antes** del incidente, con las credenciales que de
verdad usa tu proyecto:

| Credencial | Dónde se revoca | Cómo se comprueba que murió |
|------------|-----------------|-----------------------------|
| PAT de GitHub | Settings → Developer settings → Personal access tokens | Cualquier `gh api user` con él devuelve `401` |
| Secreto de Actions | `gh secret delete NOMBRE` | `gh secret list` ya no lo lista |
| Clave de despliegue | `gh api repos/{owner}/{repo}/keys/ID --method DELETE` | `gh api repos/{owner}/{repo}/keys` |
| Token de npm | Panel de npm → Access Tokens | `npm whoami` con ese token en el `.npmrc` devuelve error |
| Credencial de nube | El IAM del proveedor | Una llamada de solo lectura devuelve error de autenticación |
| Webhook secret | Ajustes del webhook en el repositorio | Las entregas empiezan a fallar la firma |

Y el inventario, para cuando no sabes cuál se filtró:

```bash
gh secret list
gh variable list
gh api repos/{owner}/{repo}/keys --jq '.[] | {id, title, read_only}'
gh api repos/{owner}/{repo}/hooks --jq '.[] | {id, url: .config.url}'
```

> [!TIP]
> Si al revisar esa lista encuentras credenciales que ya nadie usa, bórralas hoy.
> Una credencial olvidada es una filtración que aún no ha ocurrido, y no cuesta
> nada quitarla del inventario.

## 8. Antipatrones

| Antipatrón | Por qué duele | Qué hacer |
|------------|---------------|-----------|
| Limpiar la historia antes de revocar | El token sigue vivo mientras tanto | Revocar es el paso 1, sin excepciones |
| `push --force` y silencio | Sin evaluación no sabes si te usaron | Escribir el alcance antes de cerrar |
| No revocar «porque el repo es privado» | Privado hoy no es privado siempre | Un secreto commiteado es un secreto rotado |
| Emitir la nueva con los mismos permisos | Se repite el error con otro nombre | Reducir el alcance al rotar |
| Cerrar como `false_positive` un secreto real | Se pierde el rastro del incidente | `revoked` con comentario |
| Borrar el repositorio para «limpiarlo» | Destruye la evidencia y no revoca nada | Nunca; el histórico es el entregable |
| Creer que un fork se limpia solo | Es el repositorio de otra persona | Contactar, o asumir que está fuera |

## 9. Trucos

- **Cronometra la respuesta.** El único número que mejora con la práctica es el
  minuto entre «me di cuenta» y «está revocada»
- **`gh secret list`** y **`gh api repos/{owner}/{repo}/keys`** son el inventario
  de lo que hay que rotar cuando no sabes cuál se filtró
- **`multi_repo: true`** convierte un incidente de un repositorio en uno de
  varios: mira ese campo antes de dar nada por cerrado
- **Ensáyalo una vez con una credencial de usar y tirar.** Un plan de respuesta
  que nunca se ha ejecutado es una hipótesis
- **Si el secreto era de un socio de GitHub y el repositorio es público**, el
  proveedor probablemente ya lo revocó — compruébalo, no lo supongas

## 📚 Recursos Adicionales

- [Removing sensitive data from a repository](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository)
- [Managing alerts from secret scanning](https://docs.github.com/en/code-security/secret-scanning/managing-alerts-from-secret-scanning/resolving-alerts)
- [Best practices for preventing data leaks](https://docs.github.com/en/code-security/getting-started/best-practices-for-preventing-data-leaks-in-your-organization)
- [Using OIDC to authenticate without long-lived secrets](https://docs.github.com/en/actions/security-for-github-actions/security-hardening-your-deployments/about-security-hardening-with-openid-connect)

## ✅ Checklist de Verificación

- [ ] Puedes recitar los cuatro pasos en orden y justificar por qué revocar es el primero
- [ ] Sabes dónde se revoca cada tipo de credencial que usas
- [ ] Puedes estimar el tiempo de exposición con la API y con Git
- [ ] Entiendes por qué reescribir la historia no elimina el secreto de GitHub
- [ ] Sabes qué cuatro datos lleva un `resolution_comment` útil
- [ ] Tienes identificado qué secreto de tu proyecto podría desaparecer con OIDC
