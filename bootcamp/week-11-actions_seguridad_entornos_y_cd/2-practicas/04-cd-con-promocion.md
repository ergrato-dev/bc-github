# Práctica 04 — Promoción, cola y vuelta atrás

> El artefacto que se publica es el que se validó, los despliegues no se pisan y
> volver a la versión anterior cuesta un comando. Es lo que separa un workflow
> que despliega de un pipeline de CD.

**Duración estimada**: 45 min
**Prerrequisitos**: [Teoría 07](../1-teoria/07-disenar-un-pipeline-de-cd.md);
[Práctica 03](03-environments-y-pages.md) completada y el sitio publicado

## Contexto

En el plan Free hay **un** sitio de Pages por repositorio, así que no vas a tener
dos hosts. Lo que sí vas a tener es la mecánica completa: un artefacto único que
pasa por una primera puerta de validación (`staging`), llega a una segunda con
revisor (`github-pages`) y se puede volver a poner tal cual si algo sale mal.
Cuando mañana haya dos destinos reales, lo único que cambia es el step que
publica.

## Paso 1: El environment de validación y su variable

**Por qué**: las diferencias legítimas entre entornos son datos, no ramas ni
copias del YAML. Van en variables de environment.

```bash
gh api repos/{owner}/{repo}/environments/staging --method PUT --input - <<'JSON'
{ "wait_timer": 0, "prevent_self_review": false }
JSON

gh variable set SITE_ENTORNO --env staging --body "validacion"
```

**Verifica**:

```bash
gh api repos/{owner}/{repo}/environments --jq '.environments[].name'
gh variable list --env staging
```

## Paso 2: Validar el artefacto, no el código

**Por qué**: el CI ya probó el código fuente. Lo que nadie ha comprobado todavía
es que el **artefacto** —lo que de verdad se va a publicar— contenga lo que debe.

Descomenta los bloques **PASO 1** (el `environment: staging` del job `validar`)
y **PASO 2** (abrir el tar y comprobarlo) de `deploy-pages.yml`.

```bash
git commit -am "ci: validar el artefacto antes de desplegarlo"
git push
gh run watch     # aprueba el despliegue cuando se detenga
```

**Verifica** que el job de validación dejó registro y que la variable llegó:

```bash
gh api "repos/{owner}/{repo}/deployments?environment=staging" \
  --jq '.[0] | {id, sha: .sha[0:7], created_at}'
```

En el resumen del run debe aparecer `Artefacto validado para validacion`.

## Paso 3: Romper la validación a propósito

**Por qué**: una puerta que nunca ha parado nada no se sabe si funciona. Y aquí
se ve lo que significa `needs:`: si la validación falla, el despliegue **no
ocurre**, no es que ocurra y se deshaga.

En una rama, rompe el sellado de la versión:

```bash
git switch -qc ci/probar-validacion
sed -i 's/__VERSION__/desconocida/' sitio/index.html
git commit -am "test: romper el sellado de version a proposito"
git push -u origin ci/probar-validacion
```

Ese workflow solo corre en `main`, así que lánzalo a mano sobre tu rama:

```bash
gh workflow run deploy-pages.yml --ref ci/probar-validacion
gh run watch
```

**Verifica** que `validar` falla con el `grep` del SHA y que `desplegar` aparece
como *skipped*:

```bash
gh run list --workflow deploy-pages.yml --limit 1 --json databaseId --jq '.[0].databaseId' \
  | xargs -I{} gh run view {} --json jobs --jq '.jobs[] | {name, conclusion}'
```

Limpia:

```bash
git switch main
git branch -D ci/probar-validacion
git push origin --delete ci/probar-validacion
```

## Paso 4: Ver la cola de despliegues

**Por qué**: `cancel-in-progress: false` no es una preferencia de estilo. Con
`true`, dos merges seguidos dejan el sitio a medio actualizar y el segundo run
"gana" sin que nadie haya validado esa mezcla.

Lanza dos despliegues casi a la vez:

```bash
git commit --allow-empty -m "chore: primer despliegue de la cola"
git push
git commit --allow-empty -m "chore: segundo despliegue de la cola"
git push
gh run list --workflow deploy-pages.yml --limit 2 --json databaseId,status,createdAt
```

**Verifica**: el segundo run queda en `queued` mientras el primero está en curso o
esperando aprobación, y **no** cancela al primero. Aprueba los dos, en orden.

## Paso 5: Rollback en un comando

**Por qué**: la vuelta atrás se decide antes del primer despliegue, no durante el
incidente. Con *build once*, volver atrás es volver a publicar un artefacto que
ya existe.

Localiza el run bueno anterior y relánzalo:

```bash
gh run list --workflow deploy-pages.yml --status success --limit 5 \
  --json databaseId,displayTitle,createdAt

gh run rerun <id-del-run-bueno>
gh run watch
```

**Verifica** que el sitio volvió a la versión anterior:

```bash
URL=$(gh api repos/{owner}/{repo}/pages --jq .html_url)
curl -sS "$URL" | grep -o '<dd>[a-f0-9]\{7\}</dd>'
```

El SHA publicado debe ser el del run que relanzaste, no el de `HEAD`.

> [!IMPORTANT]
> Esta vía depende de que el artefacto siga vivo. En la Práctica 01 bajaste la
> retención a 30 días: esa es tu ventana real de rollback rápido. Pasado ese
> plazo, la vuelta atrás es revertir el commit y esperar al build.

## Paso 6: Documentar el procedimiento

**Por qué**: un rollback que solo está en la cabeza de alguien no existe a las
tres de la mañana.

Añade a `docs/despliegue.md` de tu repositorio:

- La URL del sitio y qué environment lo publica
- Quién aprueba y qué se comprueba antes de aprobar
- El comando exacto de rollback y cómo se verifica que funcionó
- Cuánto dura la ventana de rollback rápido

```bash
git add docs/despliegue.md
git commit -m "docs: procedimiento de despliegue y rollback"
git push
```

## Paso 7: Tus dos métricas

**Por qué**: la frecuencia de despliegue no se estima, se cuenta. Y ya tienes los
datos, sin montar nada.

```bash
# Despliegues registrados en producción
gh api --paginate "repos/{owner}/{repo}/deployments?environment=github-pages" --jq 'length'

# Del commit al despliegue, en el último
gh api "repos/{owner}/{repo}/deployments?environment=github-pages" \
  --jq '.[0] | {sha: .sha[0:7], desplegado: .created_at}'
```

**Verifica**: apunta los dos números en `docs/despliegue.md`. En la Semana 21
volverás a mirarlos.

## ✅ Resultado

- [ ] Environment `staging` con la variable `SITE_ENTORNO`
- [ ] El job `validar` abre el artefacto y comprueba el sellado
- [ ] Has visto el despliegue saltarse cuando la validación falla
- [ ] Has visto dos despliegues encolarse sin cancelarse
- [ ] Has hecho un rollback con `gh run rerun` y lo has verificado
- [ ] `docs/despliegue.md` con el procedimiento y la ventana de rollback
- [ ] Sabes cuántos despliegues llevas y de qué commit es el último

---

← [Volver a la Semana 11](../README.md)
