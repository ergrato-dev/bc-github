# Práctica 02 — Ver tu identidad OIDC por dentro

> Un workflow pide un carné firmado por GitHub y lo lee. Sin proveedor cloud,
> sin cuenta de AWS y sin gastar un euro: lo que se aprende aquí es qué dice ese
> carné, que es lo único que el otro lado va a mirar.

**Duración estimada**: 40 min
**Prerrequisitos**: [Teoría 04](../1-teoria/04-oidc-identidad-sin-secretos.md);
[Práctica 01](01-endurecer-los-workflows.md) completada

## Contexto

Toda la seguridad de OIDC está en la condición que escribes en el proveedor, y
esa condición compara claims. Si nunca has visto un token de tu repositorio, la
condición se escribe copiando de un blog y termina siendo demasiado ancha.

Al terminar tendrás un workflow que imprime tus claims en el resumen del run, y
sabrás en qué cambian según quién dispare el pipeline.

## Paso 1: Copiar el workflow y darle permiso de identidad

**Por qué**: sin `id-token: write` las variables `ACTIONS_ID_TOKEN_REQUEST_*` ni
siquiera existen en el runner. El permiso no da acceso a nada del repositorio:
solo permite **pedir** el token.

```bash
cp <ruta-al-bootcamp>/bootcamp/week-11-actions_seguridad_entornos_y_cd/starter/oidc-claims.yml \
   .github/workflows/oidc-claims.yml
```

Descomenta el bloque **PASO 1** (la línea `id-token: write` dentro de
`permissions:` del job).

**Verifica** que el permiso está donde debe —en el job, no en el workflow:

```bash
python3 -c "import yaml,sys; d=yaml.safe_load(open('.github/workflows/oidc-claims.yml')); print(d['jobs']['claims']['permissions'])"
```

Debe imprimir `{'contents': 'read', 'id-token': 'write'}`.

## Paso 2: Pedir el token y leer el payload

**Por qué**: el payload de un JWT es base64url sin cifrar. Poder leerlo no es un
fallo: la seguridad está en la firma. Pero el token completo **sí** es una
credencial mientras no caduque, y por eso se enmascara antes de tocarlo.

Descomenta el bloque **PASO 2** y empuja:

```bash
git add .github/workflows/oidc-claims.yml
git commit -m "ci: workflow para inspeccionar los claims OIDC"
git push
gh workflow run oidc-claims.yml --ref main
gh run watch
```

**Verifica** el resumen del run:

```bash
gh run list --workflow oidc-claims.yml --limit 1 --json databaseId --jq '.[0].databaseId' \
  | xargs -I{} gh run view {}
```

Abre el resumen en el navegador (`gh run view --web`) y localiza el `sub`. En un
`workflow_dispatch` sobre `main` tiene esta forma:

```text
repo:<tu-usuario>/<tu-repo>:ref:refs/heads/main
```

> [!NOTE]
> Si tu repositorio se creó a partir del 15 de julio de 2026, el `sub` incluye
> los IDs inmutables de la cuenta y del repositorio
> (`repo:usuario@12345/repo@67890:...`). No es un error: es la protección contra
> heredar confianza renombrando un repositorio. Consulta el formato con
> `gh api repos/{owner}/{repo}/actions/oidc/customization/sub`.

## Paso 3: Ver cómo cambia el `sub` con un environment

**Por qué**: `environment` es el claim más valioso que tienes, porque es el único
que no puede aparecer si el job no ha pasado por la puerta. Atar la confianza a
él es atarla a una aprobación humana.

Crea el environment y descomenta el bloque **PASO 3** del workflow:

```bash
gh api repos/{owner}/{repo}/environments/staging --method PUT --input - <<'JSON'
{ "wait_timer": 0, "prevent_self_review": false }
JSON
```

```bash
git commit -am "ci: pedir el token desde el environment staging"
git push
gh workflow run oidc-claims.yml --ref main
gh run watch
```

**Verifica** que el `sub` ha cambiado a:

```text
repo:<tu-usuario>/<tu-repo>:environment:staging
```

Y que ahora aparece el claim `environment: staging`, que antes no estaba.

## Paso 4: Cambiar la audiencia

**Por qué**: `aud` dice para quién es el token. Un proveedor que no comprueba la
audiencia acepta tokens emitidos para otro; por eso la condición de confianza
siempre exige un `aud` concreto.

```bash
gh workflow run oidc-claims.yml --ref main -f audiencia=sts.amazonaws.com
gh run watch
```

**Verifica** en el resumen que `aud` es ahora `sts.amazonaws.com` y que el `sub`
no ha cambiado: son dos cosas independientes y las dos se condicionan.

## Paso 5: Personalizar el `sub` y volver atrás

**Por qué**: la plantilla por defecto ata por rama o por environment. A veces
interesa atar por **workflow**, para que solo `deploy.yml` pueda desplegar,
venga de donde venga.

> [!WARNING]
> Cambiar el `sub` invalida todas las condiciones de confianza existentes en el
> mismo instante. Aquí no tienes ninguna todavía, que es exactamente por eso que
> se practica ahora y no el día del despliegue real.

```bash
gh api repos/{owner}/{repo}/actions/oidc/customization/sub --method PUT --input - <<'JSON'
{ "use_default": false, "include_claim_keys": ["repo", "context", "job_workflow_ref"] }
JSON
```

```bash
gh workflow run oidc-claims.yml --ref main
gh run watch
```

**Verifica** que el `sub` incluye ahora la referencia del workflow. Después,
**vuelve al valor por defecto**:

```bash
gh api repos/{owner}/{repo}/actions/oidc/customization/sub --method PUT -F use_default=true
gh api repos/{owner}/{repo}/actions/oidc/customization/sub
```

Debe devolver `"use_default": true`.

## Paso 6: Escribir la condición de confianza

**Por qué**: es el entregable real de esta práctica. El YAML es fácil; la
condición es donde se cometen los errores que nadie ve hasta que alguien los
aprovecha.

Crea `docs/confianza-oidc.md` en tu repositorio con la política que **usarías**
para desplegar a producción desde tu repositorio, rellenando tus datos reales:

```json
{
  "Effect": "Allow",
  "Principal": { "Federated": "arn:aws:iam::<ID-CUENTA>:oidc-provider/token.actions.githubusercontent.com" },
  "Action": "sts:AssumeRoleWithWebIdentity",
  "Condition": {
    "StringEquals": {
      "token.actions.githubusercontent.com:aud": "sts.amazonaws.com",
      "token.actions.githubusercontent.com:sub": "repo:<tu-usuario>/<tu-repo>:environment:production"
    }
  }
}
```

Y debajo, en tres líneas, responde: **por qué `StringEquals` y no
`StringLike`**, y **qué permitiría de más** la condición
`repo:<tu-usuario>/<tu-repo>:*`.

**Verifica**:

```bash
git add docs/confianza-oidc.md
git commit -m "docs: condicion de confianza OIDC del despliegue"
git push
gh api repos/{owner}/{repo}/contents/docs/confianza-oidc.md --jq '.type'
```

## ✅ Resultado

- [ ] `oidc-claims.yml` en tu repositorio, con `id-token: write` solo en el job
- [ ] Has leído los claims de un token emitido para tu repositorio
- [ ] Sabes cómo cambia el `sub` al declarar `environment:`
- [ ] Has cambiado la audiencia y visto el efecto
- [ ] Has personalizado el `sub` y lo has devuelto a `use_default: true`
- [ ] `docs/confianza-oidc.md` con tu condición y por qué es estrecha

## 🔗 Siguiente

[Práctica 03 — Environments y Pages](03-environments-y-pages.md)

---

← [Volver a la Semana 11](../README.md)
