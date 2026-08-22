# Práctica 03 — Artifacts y caché

> Un job que produce y otro que consume, y un CI que deja de reinstalar lo mismo
> en cada ejecución.

**Duración estimada**: 45 min
**Prerrequisitos**: [Práctica 02](02-matriz-de-versiones.md),
[Teoría 07](../1-teoria/07-artifacts-y-cache.md)

## Contexto

Tu CI corre en tres versiones de Node y no guarda nada: cada run empieza de cero
y cada job muere sin dejar rastro. Al terminar tendrás un informe descargable por
combinación de la matriz, un job que los recoge todos, y una caché que acierta.

## Paso 1: Dar al proyecto una dependencia y un lockfile

**Por qué**: sin lockfile **no hay caché posible** — la clave se calcula a partir
de él. Si tu proyecto todavía no tiene dependencias, la caché no es que no
acierte: es que no se puede configurar.

```bash
cd <tu-repo>
git switch -qc ci/artifacts-y-cache

corepack enable
pnpm init 2>/dev/null || true
pnpm add -D typescript
```

**Verifica**:

```bash
ls pnpm-lock.yaml package.json
pnpm exec tsc --version
```

> [!NOTE]
> `typescript` no es relleno: el hilo conductor del bootcamp dice que el
> proyecto es una librería en TypeScript, y en la Semana 12 vas a publicarla. Si
> tu proyecto ya tiene dependencias, sáltate este paso y usa las que tengas.

Y deja un script `test` declarado, que es lo que espera cualquiera que clone el
repositorio:

```bash
node -e '
const p = require("./package.json");
p.scripts = Object.assign({}, p.scripts, { test: "node --test" });
require("fs").writeFileSync("package.json", JSON.stringify(p, null, 2) + "\n");
'
git add package.json pnpm-lock.yaml
git commit -qm "build: añade typescript y el script de tests"
```

## Paso 2: Descomentar el PASO 4 — caché

**Por qué**: `pnpm/action-setup` tiene que ir **antes** que `setup-node`, y verlo
en el archivo es la mejor forma de que se te quede.

En `.github/workflows/ci.yml`, descomenta el bloque `PASO 4` y sustituye las dos
líneas de `package-manager-cache: false` por `cache: pnpm`:

```yaml
      - name: Instalar pnpm
        uses: pnpm/action-setup@0977fd99725f1db4007ccb2928dbb4e90d06cc86 # v6.0.10
        with:
          version: 10

      - name: Preparar Node
        id: node
        uses: actions/setup-node@820762786026740c76f36085b0efc47a31fe5020 # v7.0.0
        with:
          node-version: ${{ matrix.node }}
          cache: pnpm

      - name: Instalar dependencias
        run: pnpm install --frozen-lockfile
```

**Verifica** el orden antes de empujar, que es el fallo de este paso:

```bash
grep -n "action-setup\|setup-node" .github/workflows/ci.yml
# action-setup tiene que salir con un número de línea MENOR
```

## Paso 3: Ver el primer run sin acierto

```bash
git add .github/workflows/ci.yml
git commit -qm "ci: cachea las dependencias de pnpm"
git push -qu origin HEAD
gh pr create --fill
gh pr checks --watch
```

**Verifica**: en el log del step de Node aparece que **no** hubo acierto y que la
caché se guarda al final del job. Es lo esperado: la acabas de crear.

```bash
gh run view --log | grep -iE "cache (is not found|restored|saved)" | head
```

## Paso 4: Ver el segundo run con acierto

**Por qué**: el acierto es lo que hay que demostrar, no la configuración.

```bash
git commit -q --allow-empty -m "chore: segundo run para comprobar la caché"
git push -q
gh pr checks --watch
gh run view --log | grep -i "cache restored" | head -3
```

**Verifica**: `Cache restored from key: …`. Compara las duraciones:

```bash
gh run list --workflow=ci.yml --limit 4 \
  --json displayTitle,createdAt,updatedAt \
  --jq '.[] | {titulo: .displayTitle,
               segundos: (((.updatedAt|fromdate) - (.createdAt|fromdate)))}'
```

> [!NOTE]
> Si la diferencia es de dos segundos, la caché **no compensa** en tu proyecto
> todavía, y saberlo es parte del ejercicio. Con una sola dependencia no hay nada
> que ahorrar. Vuelve a medirlo en la Semana 12, cuando el proyecto tenga
> dependencias de verdad.

## Paso 5: Comprobar la caché desde fuera

```bash
gh cache list
```

**Verifica**: aparece una entrada por combinación de Node, con la clave, el
tamaño y la fecha de último acceso.

```bash
gh cache list --json key,sizeInBytes,ref --jq \
  '.[] | "\(.ref)  \(.key)  \(.sizeInBytes) bytes"'
```

Fíjate en el `ref`: las cachés que estás creando pertenecen a **este PR**. Solo
las restaurarán las reejecuciones de este PR, hasta que mergees y `main` cree las
suyas.

## Paso 6: Descomentar el PASO 5 — artifacts

**Por qué**: un informe que solo existe en el log no se puede comparar entre
versiones ni adjuntar a nada.

Primero, que el CI **produzca** algo. Añade un step antes del upload:

```yaml
      - name: Generar el informe de tests
        if: ${{ !cancelled() }}
        shell: bash
        run: |
          mkdir -p informe
          node --test --test-reporter=tap 2>&1 | tee "informe/tests-node-${{ matrix.node }}.tap"
```

> [!IMPORTANT]
> `shell: bash` no es decorativo: fuerza `pipefail`. Sin él, el código de salida
> que cuenta es el de `tee`, y **los tests fallidos saldrían en verde**. Es el
> fallo silencioso de la [Teoría 01](../1-teoria/01-modelo-de-ejecucion.md).

Ahora descomenta el bloque `PASO 5` del starter: el `upload-artifact` dentro del
job de tests y el job `resumen` completo.

**Verifica** el nombre del artifact:

```bash
grep -A3 "upload-artifact" .github/workflows/ci.yml | grep "name:"
# name: informe-node-${{ matrix.node }}
```

Si el nombre no lleva `${{ matrix.node }}`, los tres jobs de la matriz intentarán
subir `informe` y el segundo fallará. Es el error más común de los artifacts.

## Paso 7: Comprobarlo entero

```bash
git add -A
git commit -qm "ci: publica el informe de tests como artifact"
git push -q
gh pr checks --watch
```

**Verifica** tres cosas:

```bash
RUN_ID=$(gh run list --workflow=ci.yml --limit 1 --json databaseId --jq '.[0].databaseId')

# 1. Hay un artifact por versión de la matriz
gh api repos/{owner}/{repo}/actions/runs/$RUN_ID/artifacts \
  --jq '[.artifacts[] | {nombre: .name, bytes: .size_in_bytes}]'

# 2. Se pueden descargar
gh run download "$RUN_ID" --dir /tmp/informes && find /tmp/informes -type f

# 3. El job `resumen` los recogió todos
gh run view "$RUN_ID" --log --job \
  "$(gh run view "$RUN_ID" --json jobs --jq '.jobs[] | select(.name=="Resumen") | .databaseId')" \
  | tail -20
```

Y abre la página del run en el navegador: el resumen que escribiste en
`$GITHUB_STEP_SUMMARY` aparece arriba del todo, sin abrir un solo log.

```bash
gh run view "$RUN_ID" --web
```

## Paso 8: Ajustar la retención y mergear

**Por qué**: 90 días de informes de CI son 90 días de almacenamiento por algo que
nadie va a mirar pasada una semana.

Comprueba que el `upload-artifact` lleva `retention-days: 7` —viene en el
starter— y mergea:

```bash
gh pr merge --squash --delete-branch
git switch -q main && git pull -q
```

**Verifica**: tras el merge, `main` ejecuta el workflow y crea **sus** cachés.
A partir de ahí, las ramas nuevas sí aciertan desde el primer run:

```bash
gh cache list --json key,ref --jq '.[] | "\(.ref)  \(.key)"'
```

## ✅ Resultado

- [ ] El proyecto tiene `pnpm-lock.yaml` versionado
- [ ] `pnpm/action-setup` va antes que `setup-node`
- [ ] Has visto un run sin acierto y otro con `Cache restored`
- [ ] Sabes si la caché compensa **en tu proyecto**, con números
- [ ] Un artifact por combinación de la matriz, descargable
- [ ] El job `resumen` descarga todos y escribe en `$GITHUB_STEP_SUMMARY`
- [ ] `retention-days` ajustado

## 🧯 Si algo sale mal

| Síntoma | Causa | Solución |
|---------|-------|----------|
| `Dependencies lock file is not found` | No hay lockfile, o `cache:` sin él | Paso 1, o `package-manager-cache: false` |
| `Unable to locate executable file: pnpm` | `setup-node` antes de `action-setup` | Invierte el orden |
| La caché nunca acierta | La `key` cambia cada run | La gestiona `setup-node`; no la toques a mano aquí |
| `Conflict: an artifact with this name already exists` | Nombre repetido en la matriz | Mete `${{ matrix.node }}` en el nombre |
| El artifact llega vacío | `path` mal, y `if-no-files-found` en `warn` | `error` y revisa la ruta |
| El informe no se sube cuando fallan los tests | `success()` implícito | `if: ${{ !cancelled() }}` |
| Tests fallidos con el job en verde | Tubería sin `pipefail` | `shell: bash` |
| `resumen` no encuentra artifacts | Falta `needs: test` | Sin `needs` arranca en paralelo |
