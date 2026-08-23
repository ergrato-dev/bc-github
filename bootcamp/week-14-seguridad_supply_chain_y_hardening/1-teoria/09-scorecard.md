# Scorecard: auditar el conjunto

> Llevas trece semanas encendiendo controles de uno en uno. Scorecard hace la
> pregunta contraria: si alguien mirara tu repositorio desde fuera, sin conocerte
> y sin entrar en tu cuenta, **¿qué diría de lo seguro que es depender de ti?**

## 🎯 Objetivos

- Explicar qué mide Scorecard y qué no
- Interpretar los veinte checks y las categorías de riesgo
- Montar el workflow que publica los resultados en code scanning
- Distinguir los checks que dependen de ti de los que no
- Usar la puntuación como diagnóstico y no como objetivo

## 1. Qué problema resuelve

Antes de añadir una dependencia, la pregunta útil no es «¿tiene vulnerabilidades
conocidas?» —eso ya lo mira Dependabot— sino «¿qué prácticas tiene este proyecto
que hagan improbable que me metan código malicioso a través de él?».

**OpenSSF Scorecard** automatiza esa evaluación: analiza un repositorio público y
puntúa veinte prácticas de 0 a 10, cada una con su riesgo asociado. Sirve en las
dos direcciones: para evaluar dependencias ajenas y para que evalúen la tuya.

## 2. Los veinte checks

| Check | Riesgo | Qué mira |
|-------|:------:|----------|
| `Dangerous-Workflow` | Crítico | `pull_request_target` con checkout del PR, inyección de scripts |
| `Webhooks` | Crítico | Webhooks sin token de autenticación |
| `Binary-Artifacts` | Alto | Binarios commiteados que nadie puede revisar |
| `Branch-Protection` | Alto | Protección real de la rama por defecto |
| `Code-Review` | Alto | Si los cambios pasan por revisión |
| `Dependency-Update-Tool` | Alto | Dependabot o equivalente configurado |
| `Maintained` | Alto | Actividad reciente: ¿alguien vive aquí? |
| `Signed-Releases` | Alto | Releases con firma o procedencia verificable |
| `Token-Permissions` | Alto | `permissions` mínimas en los workflows |
| `Vulnerabilities` | Alto | Vulnerabilidades abiertas conocidas |
| `Fuzzing` | Medio | Pruebas con entradas aleatorias |
| `Packaging` | Medio | Publicación automatizada de paquetes |
| `Pinned-Dependencies` | Medio | Dependencias y actions ancladas por hash |
| `SAST` | Medio | Análisis estático en el ciclo |
| `SBOM` | Medio | SBOM publicado con el release |
| `Security-Policy` | Medio | `SECURITY.md` con instrucciones reales |
| `CI-Tests` | Bajo | Pruebas ejecutándose en los pull requests |
| `CII-Best-Practices` | Bajo | Insignia de buenas prácticas de la OpenSSF |
| `Contributors` | Bajo | Diversidad de organizaciones que contribuyen |
| `License` | Bajo | Licencia declarada y detectable |

De los veinte, **quince ya los has trabajado en el bootcamp**. Scorecard no
enseña nada nuevo: mide lo que ya montaste, con los ojos de un extraño.

## 3. Cómo se monta

```yaml
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
    runs-on: ubuntu-latest
    permissions:
      security-events: write   # subir el SARIF a code scanning
      id-token: write          # firmar los resultados publicados
      contents: read
    steps:
      - uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1
        with:
          persist-credentials: false

      - uses: ossf/scorecard-action@2d1146689b8cda280b9bc96326124645441f03bc # v2.4.4
        with:
          results_file: results.sarif
          results_format: sarif
          publish_results: true

      - uses: github/codeql-action/upload-sarif@db488ddef3bf6cb639b32c2e9a7c0a7ea8271d28 # v4.37.8
        with:
          sarif_file: results.sarif
          category: scorecard
```

Cuatro detalles que deciden si funciona:

- **`id-token: write`** hace falta solo para `publish_results: true`: los
  resultados publicados van firmados
- **`persist-credentials: false`** evita dejar el token de Actions en el
  `.git/config` del runner — y es, en sí mismo, una de las cosas que Scorecard
  puntúa
- **`category: scorecard`** separa esta serie de la de CodeQL, como cualquier
  otro SARIF de terceros (Semana 13)
- **El evento `branch_protection_rule`** hace que se reanalice cuando cambia la
  protección de ramas, que es uno de los checks

## 4. Qué significa `publish_results`

Con `publish_results: true`, el resultado se publica en la API pública de
Scorecard. Eso habilita la insignia del README y permite que cualquiera consulte
tu puntuación sin ejecutar nada.

Es una decisión, no un detalle: **publicar la puntuación es publicar el
diagnóstico**, incluidos los checks en rojo. Para un proyecto abierto suele
merecer la pena —es señal de que el mantenimiento se toma en serio—, pero
conviene saber lo que se está haciendo antes de activarlo.

## 5. Leer el resultado

Los hallazgos aterrizan en **Security → Code scanning**, filtrando por la
herramienta `Scorecard`:

```bash
gh api "repos/{owner}/{repo}/code-scanning/analyses?per_page=100" \
  --jq '[.[] | select(.tool.name == "Scorecard")] | .[0] | {creado: .created_at, categoria: .category}'

gh api "repos/{owner}/{repo}/code-scanning/alerts?state=open&per_page=100" \
  --jq '[.[] | select(.tool.name == "Scorecard")] | map(.rule.id)'
```

Cómo priorizar sin volverse loco: **por riesgo, no por puntuación**. Un
`Dangerous-Workflow` en rojo importa más que cinco checks bajos, y la puntuación
global mezcla ambos en un número que no distingue.

Para calibrar expectativas: el repositorio de `gh` —mantenido a tiempo completo
por GitHub, con revisión obligatoria, releases firmados y CI enorme— puntuaba
**6,8 sobre 10** en agosto de 2026. La puntuación de la API pública se consulta
sin autenticarse:

```bash
curl -s https://api.scorecard.dev/projects/github.com/cli/cli \
  | jq '{score, checks: [.checks[] | select(.score < 7) | {name, score}]}'
```

Si un proyecto así no llega al 7, un 10 no es el objetivo de nadie. El objetivo
son los checks concretos que están en rojo y que tú puedes cerrar.

## 6. Los checks que no dependen de ti

Tres siempre van a puntuar bajo en un proyecto de una persona, y está bien:

- **`Contributors`** mide contribuidores de varias organizaciones. Un proyecto
  personal tiene uno.
- **`CII-Best-Practices`** exige una insignia externa que hay que solicitar.
- **`Fuzzing`** espera integración con un servicio de fuzzing continuo.

Perseguir esos tres es optimizar la métrica en vez del riesgo. La lectura sana
del informe es la lista de checks **críticos y altos**: ahí sí, cada punto que
falta es un hueco real en el mapa del [archivo 01](01-la-cadena-de-suministro.md).

## 7. Antipatrones

| Antipatrón | Por qué duele | Qué hacer |
|------------|---------------|-----------|
| Perseguir el 10 | Optimiza la métrica, no la seguridad | Cerrar críticos y altos; ignorar el resto |
| Poner la insignia y no volver a mirar | Envejece y miente | El `cron` semanal ya reanaliza |
| Ignorar `Dangerous-Workflow` | Es el que compromete el repositorio entero | Es la primera fila que se arregla |
| Confundir puntuación con auditoría | No mira tu lógica de negocio | Es un diagnóstico externo, no un informe |
| `publish_results` sin pensarlo | Publica también lo que está en rojo | Decidirlo, no heredarlo del ejemplo |
| Usar la puntuación ajena como veredicto | Un 6 en un proyecto vivo vale más que un 8 abandonado | Mirar los checks, no el número |

## 8. Trucos

- **`scorecard.dev/viewer/?uri=github.com/OWNER/REPO`** enseña la puntuación
  publicada de cualquier proyecto: úsalo **antes** de añadir una dependencia
- **`api.scorecard.dev/projects/github.com/OWNER/REPO`** devuelve lo mismo en
  JSON, sin autenticación: sirve para comparar candidatos en un guion
- **`Token-Permissions` y `Pinned-Dependencies`** suelen ser los dos que más
  suben con menos trabajo, y ya sabes hacerlos desde la Semana 11
- **`persist-credentials: false`** en los checkouts es gratis y puntúa
- **El `cron` semanal es suficiente**: analizar en cada push no aporta nada y
  llena el historial de ejecuciones
- **Comparar tu informe con el de un proyecto grande** enseña más que el número
  propio: se ve qué prácticas se dan por sentadas fuera

## 📚 Recursos Adicionales

- [OpenSSF Scorecard](https://github.com/ossf/scorecard)
- [Scorecard — Documentación de los checks](https://github.com/ossf/scorecard/blob/main/docs/checks.md)
- [`ossf/scorecard-action`](https://github.com/ossf/scorecard-action)
- [Visor público de Scorecard](https://scorecard.dev/)
- [OpenSSF — Concise Guide for Developing More Secure Software](https://best.openssf.org/Concise-Guide-for-Developing-More-Secure-Software)

## ✅ Checklist de Verificación

- [ ] Sabes qué mide Scorecard y qué queda fuera de su alcance
- [ ] Puedes nombrar los dos checks de riesgo crítico
- [ ] Sabes qué permisos necesita el job y por qué `id-token: write`
- [ ] Entiendes qué implica `publish_results: true`
- [ ] Distingues los checks accionables de los que no dependen de ti
- [ ] Sabes consultar tus hallazgos de Scorecard por API
