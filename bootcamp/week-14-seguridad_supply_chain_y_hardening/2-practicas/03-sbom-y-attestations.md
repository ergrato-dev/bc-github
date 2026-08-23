# Práctica 03 — El inventario firmado

> Tu repositorio ya publica un paquete. Al terminar esta práctica ese paquete
> llevará dos afirmaciones firmadas pegadas: de dónde salió —eso ya lo tenías
> desde la Semana 12— y **qué hay dentro**. Y las dos se podrán comprobar sin
> preguntarte a ti.

**Duración estimada**: 50 min
**Prerrequisitos**: [Teoría 07](../1-teoria/07-sbom.md) y
[08](../1-teoria/08-attestations.md). Semana 12 completada: `package.json` con
nombre y versión, y al menos un release publicado

## Paso 1: El SBOM que ya tienes

**Por qué**: antes de generar nada, conviene ver el inventario que GitHub
mantiene solo, para entender qué cubre y qué no.

```bash
gh api repos/{owner}/{repo}/dependency-graph/sbom \
  --jq '{formato: .sbom.spdxVersion, licencia: .sbom.dataLicense,
         herramientas: .sbom.creationInfo.creators,
         paquetes: (.sbom.packages | length)}'
```

**Verifica** que `formato` sale `SPDX-2.3` y que hay paquetes. Ahora mira los
identificadores, que son lo que cruza con las bases de vulnerabilidades:

```bash
gh api repos/{owner}/{repo}/dependency-graph/sbom \
  --jq '.sbom.packages[].externalRefs[]? | select(.referenceType == "purl") | .referenceLocator' \
  | head -5
```

Deben salir cadenas `pkg:npm/...`. Guárdalo en disco, que es como se usa el día
del incidente:

```bash
gh api repos/{owner}/{repo}/dependency-graph/sbom > /tmp/sbom-del-grafo.json
jq -r '.sbom.packages[].name' /tmp/sbom-del-grafo.json | grep -i "typescript" || echo "no está"
```

> [!NOTE]
> Si el endpoint devuelve `404`, tu repositorio no tiene manifiestos que GitHub
> reconozca. Comprueba que `package.json` y `pnpm-lock.yaml` están commiteados en
> la rama por defecto.

## Paso 2: El SBOM del artefacto

**Por qué**: el del grafo describe **el repositorio**. Lo que se publica es un
`.tgz`, y su inventario se saca escaneando el artefacto ya construido. Son dos
cosas distintas y solo la segunda se puede firmar.

```bash
git switch -c ci/cadena-de-suministro
mkdir -p .github/workflows

cat > .github/workflows/cadena-de-suministro.yml <<'EOF'
name: Cadena de suministro

on:
  release:
    types: [published]
  workflow_dispatch:

permissions:
  contents: read

jobs:
  sbom:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      id-token: write        # pedir el token OIDC para firmar
      attestations: write    # guardar la atestación en el repositorio
    steps:
      - uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1
        with:
          persist-credentials: false

      - uses: pnpm/action-setup@0977fd99725f1db4007ccb2928dbb4e90d06cc86 # v6.0.10
      - uses: actions/setup-node@820762786026740c76f36085b0efc47a31fe5020 # v7.0.0
        with:
          node-version: 22
          cache: pnpm

      - run: pnpm install --frozen-lockfile
      - run: pnpm build

      - name: Empaquetar
        id: empaquetar
        run: |
          pnpm pack --pack-destination ./artefactos
          echo "archivo=$(ls ./artefactos/*.tgz | head -1)" >> "$GITHUB_OUTPUT"

      - name: Generar el SBOM del artefacto
        uses: anchore/sbom-action@e22c389904149dbc22b58101806040fa8d37a610 # v0.24.0
        with:
          file: ${{ steps.empaquetar.outputs.archivo }}
          format: spdx-json
          output-file: sbom.spdx.json
          upload-release-assets: false

      - name: Atestar el SBOM
        uses: actions/attest@1e69f48acb82d1966a394da916b4c1698aa569d6 # v4.2.2
        with:
          subject-path: ${{ steps.empaquetar.outputs.archivo }}
          sbom-path: sbom.spdx.json

      - name: Publicar el artefacto y su inventario
        uses: actions/upload-artifact@043fb46d1a93c77aae656e7c1c64a875d1fc6a0a # v7.0.1
        with:
          name: paquete-y-sbom
          path: |
            ./artefactos/*.tgz
            sbom.spdx.json
EOF

git add .github/workflows/cadena-de-suministro.yml
git commit -m "ci: generar y atestar el SBOM del artefacto publicado"
git push -u origin ci/cadena-de-suministro
gh pr create --fill
gh pr merge --squash --delete-branch
```

**Verifica** que el workflow está en la rama por defecto:

```bash
gh api repos/{owner}/{repo}/contents/.github/workflows/cadena-de-suministro.yml \
  --jq '.content | @base64d' | grep -E "id-token|attestations|sbom-path"
```

Los tres detalles que deciden si esto funciona:

- **`id-token: write`** y **`attestations: write`** en el **job**, no en el
  workflow: sin el primero no hay identidad con la que firmar; sin el segundo la
  atestación no se puede guardar
- **`subject-path` apunta al archivo exacto que se publica.** Si vuelves a
  empaquetar después, el digest cambia y la atestación deja de casar
- **`upload-release-assets: false`** porque el disparador aquí es manual; si lo
  dejas en su valor por defecto, la action intenta adjuntar el SBOM al release y
  falla cuando no hay ninguno en contexto

## Paso 3: Ejecutarlo y mirar lo que salió

```bash
gh workflow run cadena-de-suministro.yml
gh run watch
```

**Verifica** en el resumen de la ejecución que aparece la atestación generada, y
por API que existe para el digest del artefacto:

```bash
gh run download --name paquete-y-sbom --dir ./descarga
DIGEST=$(sha256sum ./descarga/artefactos/*.tgz | cut -d' ' -f1)
echo "$DIGEST"

gh api "repos/{owner}/{repo}/attestations/sha256:$DIGEST" \
  --jq '.attestations[].bundle.dsseEnvelope.payloadType'
```

Debe salir `application/vnd.in-toto+json` una vez por atestación.

## Paso 4: Verificar de verdad

**Por qué**: leer el JSON de una atestación no comprueba ninguna firma. Solo
`gh attestation verify` valida la cadena entera contra la raíz de confianza de
Sigstore.

```bash
gh attestation verify ./descarga/artefactos/*.tgz \
  --repo <tu-usuario>/<tu-repo> \
  --predicate-type https://spdx.dev/Document/v2.3
```

**Verifica** que la salida confirma la verificación y nombra el workflow que
firmó. Y ahora la parte que enseña más — pedir un tipo de predicado que **no**
emitiste:

```bash
gh attestation verify ./descarga/artefactos/*.tgz \
  --repo <tu-usuario>/<tu-repo> \
  --predicate-type https://slsa.dev/provenance/v1
echo "código de salida: $?"
```

Falla, y falla bien: el artefacto de esta ejecución tiene atestación de SBOM pero
no de procedencia. El código de salida distinto de cero es lo que permite usar
esto como paso de CI en quien te consume.

Aprieta la identidad del firmante y compara:

```bash
gh attestation verify ./descarga/artefactos/*.tgz \
  --repo <tu-usuario>/<tu-repo> \
  --predicate-type https://spdx.dev/Document/v2.3 \
  --signer-workflow <tu-usuario>/<tu-repo>/.github/workflows/cadena-de-suministro.yml
```

`--repo` acepta cualquier workflow de tu repositorio; `--signer-workflow` exige
ese archivo concreto. Esa es la diferencia entre «alguien de esta casa lo firmó»
y «lo firmó este proceso».

## Paso 5: Leer el inventario firmado

**Por qué**: una atestación de SBOM sirve para algo concreto — contestar «¿este
artefacto trae X?» sin descomprimirlo ni fiarte de la página de descarga.

```bash
jq '{formato: .spdxVersion, paquetes: (.packages | length)}' ./descarga/sbom.spdx.json

jq -r '.packages[].name' ./descarga/sbom.spdx.json | sort | head -20
```

**Verifica** que la lista tiene tus dependencias de producción y **no** las de
desarrollo. Si aparecen los paquetes de test, estás escaneando el árbol del
repositorio en vez del artefacto: revisa que el `file:` del Paso 2 apunta al
`.tgz`.

## Paso 6: Entregárselo a quien lo consume

**Por qué**: un SBOM que vive en los artifacts de una ejecución caduca y hace
falta iniciar sesión para bajarlo. En el release está para siempre y es público.

```bash
ULTIMO=$(gh release list --limit 1 --json tagName --jq '.[0].tagName')
gh release upload "$ULTIMO" ./descarga/sbom.spdx.json --clobber
```

**Verifica**:

```bash
gh release view "$ULTIMO" --json assets --jq '.assets[].name'
```

Y compruébalo como lo haría un extraño, sin autenticarse:

```bash
gh release download "$ULTIMO" --pattern "sbom.spdx.json" --dir /tmp/comprobacion
jq -r '.creationInfo.creators[]' /tmp/comprobacion/sbom.spdx.json
```

## Paso 7: Documentar qué se firma

**Por qué**: un consumidor solo verifica si sabe que hay algo que verificar y con
qué comando.

Añade al `README.md`:

````bash
git switch -c docs/verificar-lo-que-publico

cat >> README.md <<'EOF'

## Verificar lo que publicas

Cada release lleva un SBOM en formato SPDX y una atestación firmada que lo ata
al artefacto:

```bash
gh release download <tag> --pattern "*.tgz" --pattern "sbom.spdx.json"

gh attestation verify <archivo>.tgz \
  --repo <tu-usuario>/<tu-repo> \
  --predicate-type https://spdx.dev/Document/v2.3
```

Si la verificación falla, el artefacto no es el que se publicó aquí.
EOF

git add README.md
git commit -m "docs: explicar como verificar el artefacto y su inventario"
git push -u origin docs/verificar-lo-que-publico
gh pr create --fill
gh pr merge --squash --delete-branch
````

**Verifica**:

```bash
gh api repos/{owner}/{repo}/contents/README.md --jq '.content | @base64d' \
  | grep -A3 "Verificar lo que publicas"
```

## ⚠️ Problemas frecuentes

| Síntoma | Causa | Arreglo |
|---------|-------|---------|
| `403` al atestar | Falta `attestations: write` o `id-token: write` | Los dos, en el job |
| La verificación no encuentra atestaciones | El artefacto se reconstruyó y su digest cambió | Verificar el mismo archivo que se atestó |
| `predicate-type` no casa | Pediste procedencia y hay SBOM, o al revés | El SPDX 2.3 es `https://spdx.dev/Document/v2.3` |
| Aviso de deprecación en el log | Estás usando `actions/attest-sbom` | `actions/attest` con `sbom-path` |
| El SBOM trae dependencias de desarrollo | Se escaneó el repositorio, no el artefacto | `file:` apuntando al `.tgz` |
| La action falla al subir al release | `upload-release-assets` por defecto en `true` | Ponerlo en `false` fuera del evento de release |
| `404` en el SBOM del grafo | Sin manifiestos reconocidos en la rama por defecto | Commitear `package.json` y el lockfile |

## ✅ Resultado

- [ ] Has exportado y leído el SBOM del grafo, con sus `purl`
- [ ] `cadena-de-suministro.yml` genera el SBOM del artefacto y lo atesta
- [ ] Los permisos de escritura viven en el job, no en el workflow
- [ ] La verificación pasa con `--predicate-type` de SPDX
- [ ] Has visto fallar la verificación con un predicado que no emitiste
- [ ] El SBOM está adjunto al último release y se baja sin autenticarse
- [ ] El `README.md` explica cómo verificarlo

## ✅ Verificación de la semana

```bash
./scripts/verificar-semana.sh 14 --repo <tu-usuario>/<tu-repo>
```

---

← [Volver a la Semana 14](../README.md)
