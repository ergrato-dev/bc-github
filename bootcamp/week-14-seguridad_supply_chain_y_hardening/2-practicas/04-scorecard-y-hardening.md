# Práctica 04 — La auditoría desde fuera

> Trece semanas encendiendo controles, y ahora la prueba: dejar que una
> herramienta externa mire tu repositorio sin saber nada de ti y ponga números.
> Lo interesante no es la nota. Es descubrir los dos o tres huecos que llevabas
> semanas sin ver porque estabas mirando desde dentro.

**Duración estimada**: 40 min
**Prerrequisitos**: [Teoría 09](../1-teoria/09-scorecard.md).
[Práctica 03](03-sbom-y-attestations.md) completada. Un ruleset activo en `main`
(Semana 08) y workflows con `permissions` (Semana 11)

## Paso 1: Mirar a otros antes de mirarte

**Por qué**: la puntuación en abstracto no dice nada. Con dos referencias
delante, sí.

```bash
for repo in cli/cli ossf/scorecard; do
  echo "== $repo"
  curl -s "https://api.scorecard.dev/projects/github.com/$repo" \
    | jq '{score, bajos: [.checks[] | select(.score < 7) | .name]}'
done
```

**Verifica** que ves dos puntuaciones y su lista de checks flojos. Fíjate en que
ninguno de los dos saca un 10: proyectos mantenidos a tiempo completo, con
revisión obligatoria y releases firmados, se mueven en la franja del 6 al 8. El
objetivo nunca fue el número.

## Paso 2: Montar el análisis

**Por qué**: el resultado tiene que aterrizar donde ya miras las alertas —la
pestaña Security— y no en un log que nadie abre.

```bash
git switch -c ci/scorecard

cat > .github/workflows/scorecard.yml <<'EOF'
name: Scorecard

on:
  branch_protection_rule:
  schedule:
    - cron: '31 5 * * 2'
  push:
    branches: [main]

permissions:
  contents: read

jobs:
  analisis:
    name: Analisis de Scorecard
    runs-on: ubuntu-latest
    permissions:
      contents: read
      security-events: write   # publicar el SARIF en code scanning
      id-token: write          # firmar los resultados publicados
    steps:
      - uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1
        with:
          persist-credentials: false

      - name: Ejecutar Scorecard
        uses: ossf/scorecard-action@2d1146689b8cda280b9bc96326124645441f03bc # v2.4.4
        with:
          results_file: results.sarif
          results_format: sarif
          publish_results: true

      - name: Subir los hallazgos a code scanning
        uses: github/codeql-action/upload-sarif@db488ddef3bf6cb639b32c2e9a7c0a7ea8271d28 # v4.37.8
        with:
          sarif_file: results.sarif
          category: scorecard
EOF

git add .github/workflows/scorecard.yml
git commit -m "ci: auditar el repositorio con OpenSSF Scorecard"
git push -u origin ci/scorecard
gh pr create --fill
gh pr merge --squash --delete-branch
gh run watch
```

**Verifica** que el análisis quedó registrado con su propia categoría:

```bash
gh api "repos/{owner}/{repo}/code-scanning/analyses?per_page=100" \
  --jq '[.[] | select(.tool.name == "Scorecard")] | .[0] | {herramienta: .tool.name, categoria: .category, creado: .created_at}'
```

> [!NOTE]
> `publish_results: true` publica tu puntuación en la API pública de Scorecard,
> incluidos los checks en rojo. Es lo habitual en proyectos abiertos y es lo que
> habilita la insignia del Paso 6, pero es una decisión: si prefieres no
> publicarla, ponlo en `false` y el resto de la práctica funciona igual.

## Paso 3: Leer el diagnóstico

**Por qué**: la puntuación global mezcla checks críticos con checks de adorno.
Lo que se trabaja es la lista por riesgo.

```bash
gh api "repos/{owner}/{repo}/code-scanning/alerts?state=open&per_page=100" \
  --jq '[.[] | select(.tool.name == "Scorecard") |
         {regla: .rule.id, severidad: .rule.security_severity_level, resumen: .rule.description}]'
```

**Verifica** que reconoces los nombres de las reglas: son los checks de la
teoría. Ordena tu trabajo así:

1. `Dangerous-Workflow` y `Webhooks` — riesgo crítico, se arreglan hoy
2. `Token-Permissions`, `Branch-Protection`, `Pinned-Dependencies` — riesgo alto
   o medio, y los tres dependen solo de ti
3. `Contributors`, `CII-Best-Practices`, `Fuzzing` — no los persigas en un
   proyecto personal

## Paso 4: Cerrar `Token-Permissions`

**Por qué**: es el check que mide si tus workflows piden el mínimo. Un workflow
sin bloque `permissions` recibe los permisos por defecto del repositorio, que
suelen incluir escritura sobre el contenido — y con eso, cualquier acción de
terceros que ejecutes puede commitear en tu rama.

Busca los que faltan:

```bash
for f in .github/workflows/*.yml; do
  grep -q "^permissions:" "$f" || echo "SIN permissions a nivel de workflow: $f"
done
```

Añade a cada uno que falte el bloque restrictivo arriba del todo, y los permisos
concretos en el job que los necesite:

```yaml
permissions:
  contents: read

jobs:
  publicar:
    permissions:
      contents: read
      packages: write     # solo aquí, solo lo que hace falta
```

**Verifica** que ninguno se quedó fuera:

```bash
git switch -c ci/permisos-minimos
git commit -am "ci: declarar permisos minimos en todos los workflows"
git push -u origin ci/permisos-minimos
gh pr create --fill
gh pr merge --squash --delete-branch

gh api repos/{owner}/{repo}/contents/.github/workflows --jq '.[].name'
```

## Paso 5: Cerrar `Pinned-Dependencies`

**Por qué**: una action referenciada por etiqueta puede cambiar de contenido sin
que cambie la referencia. Quien controle esa etiqueta ejecuta código en tu runner
con tus permisos — es el eslabón «build» del archivo 01, y es el más atacado.

Encuentra las que no están ancladas:

```bash
grep -rn "uses: .*@" .github/workflows/ \
  | grep -vE "@[0-9a-f]{40}" \
  | grep -v "actions/checkout@\|./.github/actions"
```

Para cada una, resuelve el SHA del tag que estés usando y sustitúyelo dejando el
tag en un comentario:

```bash
gh api repos/OWNER/ACTION/git/ref/tags/vX.Y.Z --jq '.object.sha + " " + .object.type'
```

Si `type` sale `tag` en vez de `commit`, es un tag anotado y hay que
desreferenciarlo:

```bash
gh api repos/OWNER/ACTION/git/tags/<sha-del-tag> --jq '.object.sha'
```

**Verifica** que no queda ninguna referencia flotante:

```bash
grep -rn "uses: .*@" .github/workflows/ | grep -vE "@[0-9a-f]{40}|\./\.github/actions" || echo "todo anclado"
```

> [!TIP]
> Anclar por SHA congela la versión, y una versión congelada envejece. Lo que
> hace que esto sea sostenible es el bloque `github-actions` del
> `.github/dependabot.yml` que montaste en la Semana 13: Dependabot abre el pull
> request que sube el SHA y actualiza el comentario del tag.

## Paso 6: Volver a medir

**Por qué**: un arreglo sin la medición posterior es una suposición.

```bash
gh workflow run scorecard.yml
gh run watch

gh api "repos/{owner}/{repo}/code-scanning/alerts?state=open&per_page=100" \
  --jq '[.[] | select(.tool.name == "Scorecard") | .rule.id] | sort'
```

**Verifica** que `Token-Permissions` y `Pinned-Dependencies` ya no aparecen, o
aparecen con menos hallazgos que antes.

Y añade la insignia al `README.md`, que es la parte pública del ejercicio:

```bash
git switch -c docs/insignia-scorecard
sed -i '1a\
\
[![OpenSSF Scorecard](https://api.scorecard.dev/projects/github.com/<tu-usuario>/<tu-repo>/badge)](https://scorecard.dev/viewer/?uri=github.com/<tu-usuario>/<tu-repo>)' README.md

# Sustituye <tu-usuario> y <tu-repo> antes de commitear.
git commit -am "docs: insignia de OpenSSF Scorecard"
git push -u origin docs/insignia-scorecard
gh pr create --fill
gh pr merge --squash --delete-branch
```

**Verifica** que la insignia carga:

```bash
curl -sI "https://api.scorecard.dev/projects/github.com/<tu-usuario>/<tu-repo>/badge" | head -1
```

La insignia tarda en aparecer la primera vez: necesita que el análisis con
`publish_results: true` haya terminado y se haya publicado.

## Paso 7: El mapa completo

**Por qué**: es el entregable que hace que las trece semanas anteriores se lean
como un sistema y no como una lista de features encendidas.

Actualiza la sección **Seguridad** que empezaste en la Semana 13:

```bash
git switch -c docs/mapa-de-seguridad

cat >> README.md <<'EOF'

### Cadena de suministro

| Eslabón | Control | Dónde |
| --- | --- | --- |
| Fuente | Ruleset con revisión y commits firmados | Ajustes del repositorio |
| Fuente | Push protection y secret scanning | Ajustes del repositorio |
| Dependencias | Dependabot y revisión de dependencias | `.github/dependabot.yml` |
| Dependencias | SBOM del artefacto publicado | `.github/workflows/cadena-de-suministro.yml` |
| Build | Permisos mínimos y actions ancladas por SHA | Todos los workflows |
| Build | CodeQL, incluido el lenguaje `actions` | `.github/workflows/codeql.yml` |
| Publicación | Atestaciones de procedencia y de SBOM | Semana 12 y `cadena-de-suministro.yml` |
| Consumo | `gh attestation verify` | Documentado arriba |
| Reporte | Política de seguridad y reporte privado | `SECURITY.md` |
| Todo | Auditoría externa continua | `.github/workflows/scorecard.yml` |
EOF

git commit -am "docs: mapa de controles de la cadena de suministro"
git push -u origin docs/mapa-de-seguridad
gh pr create --fill
gh pr merge --squash --delete-branch
```

**Verifica**:

```bash
gh api repos/{owner}/{repo}/contents/README.md --jq '.content | @base64d' \
  | grep -A12 "### Cadena de suministro"
```

## ⚠️ Problemas frecuentes

| Síntoma | Causa | Arreglo |
|---------|-------|---------|
| El job falla con `403` al subir el SARIF | Falta `security-events: write` | En el job |
| `publish_results` falla | Falta `id-token: write` | Los resultados publicados van firmados |
| No hay análisis de Scorecard | El repositorio es un fork | Scorecard no analiza forks |
| `Branch-Protection` puntúa bajo con ruleset activo | El check no ve toda la configuración con el token por defecto | Es un límite conocido; no lo persigas |
| La insignia da 404 | El análisis publicado aún no ha terminado | Esperar a que corra con `publish_results: true` |
| `Pinned-Dependencies` no baja | Quedan referencias por etiqueta | `grep` del Paso 5, incluidos los `docker://` |
| Muchas alertas nuevas de golpe | Es la primera ejecución | Ordenar por riesgo, no por cantidad |

## ✅ Resultado

- [ ] `scorecard.yml` corriendo, con permisos en el job y todo anclado por SHA
- [ ] Hay análisis de la herramienta `Scorecard` con `category: scorecard`
- [ ] Has leído los hallazgos ordenados por riesgo, no por número
- [ ] `Token-Permissions` y `Pinned-Dependencies` mejoraron tras arreglarlos
- [ ] La insignia está en el `README.md`
- [ ] El `README.md` tiene el mapa completo de la cadena de suministro

## ✅ Verificación de la semana

```bash
./scripts/verificar-semana.sh 14 --repo <tu-usuario>/<tu-repo>
```

---

← [Volver a la Semana 14](../README.md)
