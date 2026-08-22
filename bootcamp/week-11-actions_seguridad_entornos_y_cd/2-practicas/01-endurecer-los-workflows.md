# Práctica 01 — Endurecer los workflows que ya tienes

> No escribes ningún workflow nuevo. Coges los de las semanas 09 y 10, los
> auditas y los dejas en un estado en el que un descuido futuro no pueda abrir un
> agujero.

**Duración estimada**: 50 min
**Prerrequisitos**: [Teoría 01](../1-teoria/01-superficie-de-ataque-de-un-pipeline.md)
y [02](../1-teoria/02-pinning-y-dependencias-del-workflow.md); el CI de la Semana
10 en verde

## Contexto

Tu repositorio tiene ya cuatro o cinco workflows y una action publicada. Cada
`uses:` es una dependencia ejecutable con acceso a tu `GITHUB_TOKEN`. Esta
práctica cierra las dos fronteras que faltan: **qué código corre** y **con qué
permisos nace** cuando alguien —tú, dentro de tres meses— se olvide de
declararlos.

Todos los comandos se ejecutan **dentro de tu repositorio clonado**: `gh`
rellena `{owner}` y `{repo}` solo.

## Paso 1: Fotografía del estado actual

**Por qué**: hay que saber de dónde se parte para poder demostrar que cambió
algo. Estos cuatro ajustes viven en la API, no en el repositorio: no se ven en
ningún archivo.

```bash
gh api repos/{owner}/{repo}/actions/permissions
gh api repos/{owner}/{repo}/actions/permissions/workflow
gh api repos/{owner}/{repo}/actions/permissions/fork-pr-contributor-approval
gh api repos/{owner}/{repo}/actions/permissions/artifact-and-log-retention
```

Guarda la salida; al final de la práctica compararás.

**Verifica** cuántas dependencias sin pinnear tienes:

```bash
grep -rn "uses:" .github/workflows .github/actions \
  | grep -v "@[0-9a-f]\{40\}" \
  | grep -v "uses: *[\./]"
```

Cada línea que salga es una action ajena que puede cambiar sin que tú hagas nada.

## Paso 2: El token por defecto, de solo lectura

**Por qué**: sin esto, un workflow que no declare `permissions:` recibe un token
de **escritura** sobre tu repositorio. Es la red que te salva el día que se te
olvide, y se te va a olvidar.

```bash
gh api repos/{owner}/{repo}/actions/permissions/workflow --method PUT \
  -f default_workflow_permissions=read \
  -F can_approve_pull_request_reviews=false
```

**Verifica**:

```bash
gh api repos/{owner}/{repo}/actions/permissions/workflow
```

Debe devolver exactamente:

```json
{"default_workflow_permissions":"read","can_approve_pull_request_reviews":false}
```

> [!NOTE]
> Si alguno de tus workflows escribía algo (etiquetar un PR, comentar), ahora
> necesita declarar su `permissions:` explícitamente a nivel de job. Eso es lo
> correcto: el permiso se pide donde se usa, no se hereda por defecto.

## Paso 3: Pinnear todas las actions por SHA

**Por qué**: un tag es un puntero mutable. En marzo de 2025, reescribir los tags
de una action popular filtró los secretos de miles de repositorios sin que nadie
mergeara nada.

Para cada línea que salió en el paso 1, resuelve el SHA de la versión que estás
usando:

```bash
gh api repos/<owner>/<action>/tags \
  --jq '.[] | select(.name == "<tag>") | .commit.sha'
```

Y deja la línea así, con el tag en el comentario:

```yaml
      - uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1
```

**Verifica** que no queda ninguna sin pinnear:

```bash
grep -rn "uses:" .github/workflows .github/actions \
  | grep -v "@[0-9a-f]\{40\}" \
  | grep -v "uses: *[\./]" \
  | wc -l
```

Debe imprimir `0`. Las referencias locales (`./…`) no llevan ref: ya apuntan al
commit en curso.

## Paso 4: Dependabot para que los pines no se pudran

**Por qué**: un SHA no cambia, y ese es justo el problema: también congela los
parches de seguridad. Dependabot abre el PR con el SHA nuevo y el comentario
actualizado.

```bash
cp <ruta-al-bootcamp>/bootcamp/week-11-actions_seguridad_entornos_y_cd/starter/dependabot.yml \
   .github/dependabot.yml
```

Descomenta el bloque **PASO 5** del archivo (grupos, prefijo de commit y label).
Si ya tenías un `.github/dependabot.yml` de otra semana, añade el bloque
`github-actions` a la lista `updates:` en vez de sobrescribirlo.

```bash
git add .github/dependabot.yml
git commit -m "ci: mantener las actions al día con Dependabot"
git push
```

**Verifica** que GitHub lo ha leído sin errores de sintaxis:

```bash
gh api repos/{owner}/{repo}/contents/.github/dependabot.yml --jq '.content | @base64d' \
  | grep -c "package-ecosystem: github-actions"
```

La configuración aparece además en *Insights → Dependency graph → Dependabot*, y
el primer PR llega en el siguiente ciclo semanal.

## Paso 5: Hacer obligatorio el pinning

**Por qué**: lo del paso 3 es un estado; esto lo convierte en una regla. A partir
de aquí, un `uses:` con tag flotante **falla al arrancar** en vez de ejecutarse.

```bash
gh api repos/{owner}/{repo}/actions/permissions --method PUT \
  -F enabled=true -f allowed_actions=all -F sha_pinning_required=true
```

**Verifica**:

```bash
gh api repos/{owner}/{repo}/actions/permissions
# {"enabled":true,"allowed_actions":"all","sha_pinning_required":true}
```

Ahora comprueba que **no has roto nada**: lanza tu CI y espera a que termine.

```bash
git commit --allow-empty -m "ci: comprobar la politica de pinning"
git push
gh run watch
```

> [!IMPORTANT]
> Los **reusable workflows** siguen pudiéndose referenciar por tag: la política
> aplica a las actions. Si un job tuyo falla al arrancar por una referencia local
> a una action del propio repositorio, cámbiala por la sintaxis
> `uses: $/.github/actions/<nombre>` de julio de 2026, que resuelve al mismo
> commit sin necesitar `checkout`. Y si necesitas volver atrás mientras lo
> arreglas, el mismo comando con `-F sha_pinning_required=false`.

## Paso 6: Provocar el fallo a propósito

**Por qué**: reconocer el mensaje una vez ahorra media hora la próxima, y demuestra
que la política está viva.

En una rama desechable, cambia **una** action de `ci.yml` a un tag flotante —por
ejemplo, `actions/checkout@<SHA> # v7.0.1` pasa a ser `actions/checkout@v7`— y
empuja:

```bash
git switch -qc ci/probar-politica-pinning
# edita una sola linea de .github/workflows/ci.yml
git commit -am "ci: referencia flotante a proposito"
git push -u origin ci/probar-politica-pinning
gh pr create --fill
gh run watch
```

**Verifica** el mensaje:

```bash
gh run list --branch ci/probar-politica-pinning --limit 1 --json databaseId \
  --jq '.[0].databaseId' | xargs -I{} gh run view {} --log-failed | head -20
```

El run falla **antes** de ejecutar un solo step: la política se evalúa al
resolver el workflow. Cierra el PR y borra la rama.

```bash
gh pr close --delete-branch
git switch main
```

## Paso 7: Forks y retención

**Por qué**: tu repositorio es público. Cualquiera puede abrir un PR, y ese PR
puede ejecutar workflows en tu CI. Y los artefactos de un repositorio público son
descargables por cualquiera durante 90 días.

```bash
gh api repos/{owner}/{repo}/actions/permissions/fork-pr-contributor-approval \
  --method PUT -f approval_policy=all_external_contributors

gh api repos/{owner}/{repo}/actions/permissions/artifact-and-log-retention \
  --method PUT -F days=30
```

**Verifica**:

```bash
gh api repos/{owner}/{repo}/actions/permissions/fork-pr-contributor-approval
gh api repos/{owner}/{repo}/actions/permissions/artifact-and-log-retention
```

## Paso 8: Analizar los workflows en local

**Por qué**: el ciclo "commit → push → esperar → error de sintaxis" cuesta cinco
minutos cada vez. Estas dos herramientas lo cuestan una vez.

```bash
# Sintaxis, expresiones, contextos inexistentes (shellcheck incluido)
docker run --rm -v "$PWD":/repo -w /repo rhysd/actionlint:latest -color

# Seguridad: inyección, pines flotantes, permisos excesivos
uvx zizmor .github/workflows/     # o: pipx install zizmor && zizmor .github/workflows/
```

**Verifica**: arregla lo que salga o anótalo. `zizmor` clasifica por confianza;
no todo hallazgo es un fallo, pero todos merecen una respuesta consciente.

## ✅ Resultado

- [ ] `default_workflow_permissions` es `read`
- [ ] Los workflows no pueden aprobar pull requests
- [ ] Cero `uses:` ajenos sin SHA, todos con el tag en comentario
- [ ] `.github/dependabot.yml` con el ecosistema `github-actions`
- [ ] `sha_pinning_required` en `true`, y el CI sigue en verde
- [ ] Has visto el error que produce una referencia flotante
- [ ] Aprobación obligatoria para contribuidores externos
- [ ] `actionlint` y `zizmor` ejecutados al menos una vez

## 🔗 Siguiente

[Práctica 02 — OIDC y claims](02-oidc-y-claims.md)

---

← [Volver a la Semana 11](../README.md)
