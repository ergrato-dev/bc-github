# Práctica 01 — Secretos que no entran

> Vas a intentar publicar una credencial de verdad en tu repositorio público y a
> ver cómo el servidor te lo impide. Después la revocarás igualmente, porque ese
> es el orden correcto y conviene tenerlo en los dedos antes de necesitarlo un
> martes a las once de la noche.

**Duración estimada**: 50 min
**Prerrequisitos**: [Teoría 02](../1-teoria/02-secret-scanning.md),
[03](../1-teoria/03-push-protection.md) y
[04](../1-teoria/04-la-vida-de-un-secreto-filtrado.md). Tu repositorio del
bootcamp, público, clonado en local

> [!IMPORTANT]
> En esta práctica vas a crear un token real. Créalo **sin ningún permiso** y con
> **caducidad de 1 día**, no lo pegues en ningún sitio salvo donde dicen los
> pasos, y bórralo en el Paso 5. Un token sin permisos no puede leer ni escribir
> nada, pero se sigue tratando como una credencial: el objetivo de la práctica es
> practicar el reflejo, no correr riesgo.

## Paso 1: Ver el estado de partida

**Por qué**: antes de cambiar nada conviene saber qué hay encendido. Los cuatro
ajustes de secret scanning viven en el mismo objeto del repositorio.

```bash
gh api repos/{owner}/{repo} --jq '.security_and_analysis'
```

**Verifica** que ves un objeto con `secret_scanning` y
`secret_scanning_push_protection`. En un repositorio público el primero suele
venir ya activado; el segundo puede estar en `disabled`.

## Paso 2: Encender las dos capas

**Por qué**: secret scanning mira lo que ya está dentro; push protection impide
que entre. Son ajustes distintos y hacen falta los dos.

```bash
gh api repos/{owner}/{repo} --method PATCH \
  -F 'security_and_analysis[secret_scanning][status]=enabled' \
  -F 'security_and_analysis[secret_scanning_push_protection][status]=enabled' \
  --jq '.security_and_analysis'
```

**Verifica**:

```bash
gh api repos/{owner}/{repo} \
  --jq '.security_and_analysis | {escaneo: .secret_scanning.status, proteccion: .secret_scanning_push_protection.status}'
```

```json
{ "escaneo": "enabled", "proteccion": "enabled" }
```

En la interfaz, lo mismo está en **Settings → Advanced Security**.

## Paso 3: Fabricar el intento

**Por qué**: un control que nunca ha dicho que no, no está demostrado. Y hace
falta un token **real**: los patrones de GitHub llevan una suma de comprobación,
así que una cadena inventada del estilo `ghp_1234...` no dispara nada. Comprobar
la protección con una cadena falsa es el error que hace creer a mucha gente que
la tienen activada cuando no.

Crea el token, en la web:

1. **Settings → Developer settings → Personal access tokens → Fine-grained tokens**
2. **Generate new token**
3. Nombre: `prueba-push-protection`
4. Expiration: **1 día**
5. Repository access: **Only select repositories** → tu repositorio del bootcamp
6. Permissions: **ninguno**. Déjalo todo en *No access*
7. **Generate token** y cópialo

Ahora mételo en un archivo y haz el commit:

```bash
git switch -c chore/probar-push-protection

cat > src/config-temporal.ts <<'EOF'
// Archivo de prueba de la Semana 14. Se borra al terminar la práctica.
export const TOKEN = "PEGA_AQUI_EL_TOKEN";
EOF

# Sustituye el marcador por el token que acabas de copiar, con tu editor.
# No uses sed con el token en la línea de comandos: quedaría en el historial del shell.

git add src/config-temporal.ts
git commit -m "chore: probar la proteccion de push"
```

**Verifica** que el commit existe en local:

```bash
git log -1 --stat
```

## Paso 4: Ver la puerta cerrarse

**Por qué**: este es el momento de la práctica. El push se rechaza en el
servidor, antes de aceptar ningún objeto.

```bash
git push -u origin chore/probar-push-protection
```

**Verifica** que la salida trae un bloque como este:

```
remote: —— GitHub Secret Protection ——————————————————————
remote: Resolve the following secrets before pushing again.
remote:
remote:   —— GitHub Personal Access Token ————————————————
remote:    locations:
remote:      - commit: <sha>
remote:        path: src/config-temporal.ts:2
```

Fíjate en tres cosas antes de seguir:

- Nombra el **tipo** de secreto, no solo «hay algo raro»
- Señala **el commit**, no el archivo de trabajo
- Ofrece una URL para permitirlo, con los tres motivos de excepción

> [!WARNING]
> **No abras esa URL.** Saltarse la protección aquí publicaría el token en un
> repositorio público y convertiría el ejercicio en un incidente real. Los tres
> motivos ya los conoces de la teoría; el ejercicio es no usarlos.

## Paso 5: Responder en el orden correcto

**Por qué**: el token existe desde que lo generaste. Que el push fallara no lo
desactiva. Primero se revoca, después se limpia — es el orden del
[archivo 04](../1-teoria/04-la-vida-de-un-secreto-filtrado.md) y aquí se ensaya
sin coste.

**Primero, revocar.** En **Settings → Developer settings → Personal access
tokens → Fine-grained tokens**, borra `prueba-push-protection`.

**Después, limpiar el commit.**

> [!WARNING]
> `git reset --hard` descarta el commit **y** cualquier cambio sin guardar del
> árbol de trabajo. Comprueba antes con `git status` que no tienes nada más a
> medio hacer en esta rama; si lo tienes, guárdalo con `git stash` primero.

```bash
git reset --hard HEAD~1
git switch main
git branch -D chore/probar-push-protection
```

**Verifica** que no queda rastro ni del archivo ni del commit:

```bash
git log --oneline -3
ls src/config-temporal.ts 2>&1     # debe decir que no existe
```

Y que el token está muerto de verdad: si intentas usarlo, la API contesta `401`.

## Paso 6: Comprobar que no hay nada que limpiar

**Por qué**: la consecuencia de que el bloqueo funcione es que **no hay alerta**.
Es la diferencia entre esta semana y la 13: aquí el trabajo que se ahorra es el
que no llegó a existir.

```bash
gh api "repos/{owner}/{repo}/secret-scanning/alerts" --jq 'length'
```

**Verifica** que sale `0`. Y la consulta que se hace en una auditoría de verdad
—quién se ha saltado la protección alguna vez—:

```bash
gh api "repos/{owner}/{repo}/secret-scanning/alerts?is_bypassed=true" \
  --jq '[.[] | {n: .number, tipo: .secret_type_display_name, quien: .push_protection_bypassed_by.login}]'
```

Debe salir `[]`. Guárdate esa consulta: es la primera que se corre al auditar un
repositorio ajeno.

## Paso 7: Quitar el suelo resbaladizo

**Por qué**: la protección atrapa formatos conocidos. Lo que de verdad reduce las
filtraciones es que el secreto no llegue nunca al árbol de trabajo.

```bash
git switch -c chore/higiene-de-secretos

cat >> .gitignore <<'EOF'

# Secretos locales
.env
.env.*
!.env.example
*.pem
*.key
EOF

cat > .env.example <<'EOF'
# Copia este archivo a .env y rellena los valores.
# .env está en .gitignore y no debe subirse nunca.
API_BASE_URL=https://api.example.com
API_TOKEN=<TOKEN>
EOF

git add .gitignore .env.example
git commit -m "chore: ignorar secretos locales y documentar las variables"
git push -u origin chore/higiene-de-secretos
gh pr create --fill
gh pr merge --squash --delete-branch
```

**Verifica**:

```bash
gh api repos/{owner}/{repo}/contents/.gitignore --jq '.content | @base64d' | grep -A5 "Secretos locales"
```

El `.env.example` no es decoración: es lo que hace que nadie tenga que preguntar
qué variables existen, que es justo cuando alguien se inventa un archivo con
valores reales.

## Paso 8 (opcional): Patrones genéricos

**Por qué**: los patrones de proveedor no cubren la contraseña de tu base de
datos, porque no tiene formato reconocible. Los patrones **no proveedor** buscan
formas genéricas —claves privadas, cadenas de conexión— a costa de más ruido.

```bash
gh api repos/{owner}/{repo} --method PATCH \
  -F 'security_and_analysis[secret_scanning_non_provider_patterns][status]=enabled' \
  --jq '.security_and_analysis.secret_scanning_non_provider_patterns'
```

**Verifica** el estado y, un rato después, si aparecieron alertas nuevas:

```bash
gh api "repos/{owner}/{repo}/secret-scanning/alerts?state=open" \
  --jq '[.[] | {n: .number, tipo: .secret_type_display_name, validez: .validity}]'
```

Si el ajuste no está disponible en tu repositorio, la API contesta con un error
en vez de aplicarlo — es un ajuste que depende del plan y del tipo de
repositorio. No forma parte de los entregables por esa razón; si te funciona,
déjalo activado y clasifica las alertas que salgan.

## ⚠️ Problemas frecuentes

| Síntoma | Causa | Arreglo |
|---------|-------|---------|
| El push pasa sin bloquear | La cadena no era un token real, o falta activar la protección | Paso 2 y Paso 3: token de verdad |
| Sigue bloqueando después de borrar la línea | El secreto está en el commit anterior del mismo push | `git reset --hard HEAD~1`, no un commit nuevo |
| `422` en el `PATCH` de los ajustes | Sintaxis anidada mal escrita | Comillas alrededor de `'a[b][c]=valor'` |
| No aparece la alerta esperada | El bloqueo funcionó: no hay filtración | Es el resultado correcto |
| `403` al leer las alertas | Repositorio ajeno | Estos endpoints solo funcionan sobre los tuyos |
| El token no se puede borrar | Estás mirando los clásicos, no los *fine-grained* | Son dos listas distintas |
| `.env` sigue apareciendo en `git status` | Ya estaba rastreado antes del `.gitignore` | `git rm --cached .env` |

## ✅ Resultado

- [ ] `secret_scanning` y `secret_scanning_push_protection` en `enabled`
- [ ] Has visto el bloqueo con un token real y has leído el mensaje entero
- [ ] **No** has usado la URL de excepción
- [ ] Revocaste el token **antes** de limpiar el commit
- [ ] Cero alertas de secret scanning y cero bypasses en el repositorio
- [ ] `.gitignore` cubre `.env`, `*.pem` y `*.key`, y hay un `.env.example`

## ✅ Verificación de la semana

```bash
./scripts/verificar-semana.sh 14 --repo <tu-usuario>/<tu-repo>
```

---

← [Volver a la Semana 14](../README.md)
