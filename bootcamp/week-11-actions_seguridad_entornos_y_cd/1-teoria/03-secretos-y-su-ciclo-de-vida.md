# Secretos: alcance, fugas y rotación

> Un secreto en Actions no es una caja fuerte: es un valor que se descifra y se
> entrega a un proceso que ejecuta código de terceros. Todo lo que puedes
> controlar es **quién lo recibe**, **cuánto vale** y **cuánto dura**.

## 🎯 Objetivos

- Elegir el alcance correcto: repositorio, environment o variable
- Saber qué enmascara GitHub en los logs y qué no
- Reconocer las cinco formas habituales de filtrar un secreto
- Rotar un secreto en el orden correcto
- Entender por qué una credencial cloud de larga vida es el peor secreto posible

## 1. Qué problema resuelve

El pipeline necesita hablar con cosas que no son GitHub: un registro, un
proveedor cloud, una API. Eso implica una credencial, y una credencial en un
repositorio público es un ejercicio de gestión de riesgo, no de criptografía.

La pregunta útil no es "¿está cifrado?" —lo está—, sino **qué pasa el día que se
filtre**. La respuesta depende de tres decisiones que se toman antes: alcance,
duración y privilegios.

## 2. Los tres contenedores

| | Variable | Secreto de repositorio | Secreto de environment |
|---|---|---|---|
| Visible en logs | Sí | Enmascarado | Enmascarado |
| Quién lo lee | Cualquier job | Cualquier job | Solo jobs con `environment:` |
| Protegido por revisores | No | No | **Sí** |
| Uso correcto | Nombres, URLs, flags | Servicios de test, tokens de lectura | Credenciales de producción |

```bash
gh variable set SITE_ENTORNO --body "staging"
gh secret set TOKEN_LECTURA                      # pide el valor por stdin
gh secret set TOKEN_DESPLIEGUE --env production  # solo tras pasar la puerta
gh secret list --env production
```

La regla de oro: **si el secreto puede cambiar producción, vive en un
environment**. Es la única forma de que su uso pase por una aprobación
([teoría 05](05-environments-como-puerta-de-despliegue.md)).

### Los límites reales

| Límite | Valor |
|--------|-------|
| Tamaño de un secreto | 48 KB |
| Secretos por repositorio | 100 |
| Secretos por environment | 100 |
| Nombre | Alfanumérico y `_`, sin empezar por número ni por `GITHUB_` |

Si necesitas más de 48 KB, no es un secreto: es un archivo cifrado en el
repositorio cuya clave sí es un secreto.

## 3. El enmascarado y sus agujeros

GitHub sustituye por `***` las apariciones **literales** del valor de un secreto
en los logs. Eso cubre el descuido más común y ninguno de los demás:

```yaml
      - run: echo "${{ secrets.TOKEN }}"            # sale ***
      - run: echo "${{ secrets.TOKEN }}" | base64   # sale el token en base64
      - run: echo "${{ secrets.TOKEN }}" | rev      # sale al revés, sin enmascarar
      - run: env                                    # variables enteras, formatos varios
```

La documentación lo dice sin adornos: el enmascarado **no está garantizado**,
porque hay infinitas transformaciones posibles de un valor.

Para valores que tú generas dentro del run —un token temporal, la respuesta de
una API— el enmascarado se pide a mano:

```yaml
      - run: |
          TOKEN_TEMPORAL=$(./pedir-token.sh)
          echo "::add-mask::$TOKEN_TEMPORAL"
          echo "TOKEN_TEMPORAL=$TOKEN_TEMPORAL" >> "$GITHUB_ENV"
```

El `::add-mask::` va **antes** de cualquier uso. Después ya es tarde: lo que
salió, salió.

## 4. Las cinco fugas habituales

1. **`set -x` o `bash -x`** en un script que recibe el secreto como argumento:
   la traza imprime la línea entera antes de ejecutarla
2. **El secreto como argumento de línea de comandos**: aparece en la lista de
   procesos y en cualquier traza. Por eso `curl -H "Authorization: ..."` con el
   valor incrustado está prohibido en este bootcamp: se pasa por variable de
   entorno
3. **Artefactos**: subir `./dist` entero incluye el `.env` que generó el build.
   En un repositorio público el artefacto es descargable
4. **Logs de depuración**: `ACTIONS_STEP_DEBUG` imprime contextos completos.
   Actívalo, depura, **bórralo**
5. **Un PR de un fork**: no recibe secretos —eso lo cubre GitHub—, pero sí puede
   modificar un script que se ejecuta en un workflow posterior que sí los tiene

Las cinco tienen la misma consecuencia: el secreto está quemado. No hay forma de
"desimprimir" un log.

## 5. Rotar: el orden importa

> [!IMPORTANT]
> **Primero se rota, después se limpia.** Borrar el log, el commit o el artefacto
> antes de invalidar la credencial solo consigue que dejes de ver el problema que
> el atacante ya tiene.

El orden correcto, siempre:

1. **Revocar** la credencial filtrada en el sistema que la emitió
2. **Emitir** una nueva y actualizarla donde se use (`gh secret set`)
3. **Comprobar** que el pipeline vuelve a funcionar con la nueva
4. **Limpiar** el rastro: borrar el artefacto, borrar los logs del run, reescribir
   la historia si el secreto está en un commit
5. **Buscar el uso**: si el proveedor lo permite, revisar qué hizo esa credencial
   entre la fuga y la revocación

Los pasos 1 a 3 se hacen en minutos. El 4 puede llevar horas y no arregla nada
por sí solo.

```bash
gh secret set TOKEN_DESPLIEGUE --env production   # paso 2
gh api repos/{owner}/{repo}/actions/runs/<id>/logs --method DELETE   # paso 4
```

## 6. El peor secreto posible

Una clave de acceso permanente a un proveedor cloud reúne las cuatro cosas que no
quieres:

- **No caduca**: sigue siendo válida cuando ya nadie recuerda que existe
- **Es amplia**: casi siempre tiene más permisos de los que el pipeline usa
- **Es estática**: el mismo valor en el CI, en el portátil de alguien y en un
  documento de onboarding
- **Es difícil de auditar**: el proveedor ve "esta clave", no "este workflow de
  este repositorio en esta rama"

La respuesta no es guardarla mejor. Es **no tenerla**: que el proveedor confíe en
la identidad del run y emita una credencial temporal en cada ejecución. Eso es
OIDC, y es la [teoría 04](04-oidc-identidad-sin-secretos.md).

## 7. Dónde no llega un secreto

Cuatro sitios donde el contexto `secrets` sencillamente no existe, y que explican
la mitad de los "llega vacío" de esta semana:

| Sitio | Qué pasa | Cómo se resuelve |
|-------|----------|------------------|
| Una composite action | No hay contexto `secrets` | Se declara un `input` y se le pasa el valor |
| Un reusable workflow | Solo recibe lo declarado en `on.workflow_call.secrets` | Declararlo, o `inherit` para lo propio |
| Un job sin `environment:` | Los secretos de environment llegan vacíos | Añadir la clave `environment:` al job |
| Un PR desde un fork | No se entrega ningún secreto | Es lo correcto: no lo "arregles" con `pull_request_target` |

En los tres primeros casos el síntoma es idéntico —una variable vacía y un 401
más adelante—, así que merece la pena descartarlos en ese orden antes de sospechar
del proveedor.

## 8. Antipatrones

| Antipatrón | Por qué duele | Qué hacer |
|------------|---------------|-----------|
| Credencial de producción como secreto de repositorio | Cualquier workflow, cualquier rama | Secreto de environment |
| `secrets: inherit` hacia un repositorio ajeno | Entregas todo tu llavero | Declarar uno a uno |
| Un secreto compartido entre staging y producción | La puerta de producción deja de servir | Uno por entorno |
| `echo` del secreto "para comprobar que llega" | Queda en el log para siempre | Comprobar `if [ -z "$TOKEN" ]` |
| Guardar un JSON de credenciales entero | Se filtra en bloque y se rota en bloque | El campo mínimo, o mejor, OIDC |
| Borrar el log y dar el incidente por cerrado | La credencial sigue viva | Rotar primero |
| Secretos en `env:` a nivel de workflow | Llegan a todos los jobs, incluidos los que no los necesitan | `env:` en el step |

## 9. Trucos

- **Comprobar que un secreto existe sin imprimirlo**:
  `if [ -z "$TOKEN" ]; then echo "falta el secreto"; exit 1; fi`
- **`gh secret list --env production`** te dice qué hay sin revelar nada
- **Un secreto por uso**: si dos sistemas comparten credencial, rotarla implica
  coordinar dos despliegues
- **Los secretos no llegan a `if:` a nivel de job**: no se pueden usar en
  condiciones de workflow; usa una variable o comprueba dentro del step
- **Antes de subir un artefacto, mira qué hay dentro**:
  `unzip -l` sobre el artefacto descargado del run anterior
- **La caducidad es una funcionalidad**: si el proveedor permite emitir tokens de
  90 días, úsalos; la rotación forzada evita el secreto eterno

## 📚 Recursos Adicionales

- [Using secrets in GitHub Actions](https://docs.github.com/actions/how-tos/write-workflows/choose-what-workflows-do/use-secrets)
- [Secrets reference — límites y nombres](https://docs.github.com/actions/reference/security/secrets)
- [Workflow commands — `add-mask`](https://docs.github.com/actions/reference/workflows-and-actions/workflow-commands#masking-a-value-in-a-log)
- [Security hardening — secrets](https://docs.github.com/actions/reference/security/secure-use#using-secrets)

## ✅ Checklist de Verificación

- [ ] Sabes cuándo un valor debe ser variable y cuándo secreto
- [ ] Puedes explicar por qué `base64` rompe el enmascarado
- [ ] Sabes usar `::add-mask::` para un valor generado en el run
- [ ] Conoces el orden correcto de una rotación
- [ ] Puedes decir por qué una clave cloud estática es el peor secreto
