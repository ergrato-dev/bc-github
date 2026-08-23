# Code scanning y CodeQL

> Dependabot mira lo que instalas. Code scanning mira lo que escribes. Son dos
> mitades del mismo problema, y la segunda es la que casi nadie cubre: puedes
> tener todas las dependencias al día y seguir concatenando una consulta SQL con
> lo que llega en un parámetro.

## 🎯 Objetivos

- Explicar en qué se diferencia un análisis de flujo de datos de un linter
- Activar el análisis por defecto y comprobarlo por API
- Decidir cuándo el análisis por defecto no basta y hay que pasar al avanzado
- Leer y triar una alerta de code scanning
- Saber qué es Copilot Autofix y qué sigue siendo tu responsabilidad

## 1. Qué problema resuelve

Un linter mira una línea y dice si tiene mala pinta. Un analizador de flujo de
datos mira **el camino** que recorre un valor desde que entra en el programa
hasta que se usa:

```
fuente (source)          ─►   propagación   ─►   sumidero (sink)
req.query.nombre                 …                db.query(...)
```

Si existe un camino desde una entrada controlable por un atacante hasta una
operación peligrosa, y por el camino nadie la sanea, hay vulnerabilidad. Eso se
llama **taint tracking**, y es lo que hace CodeQL.

La diferencia práctica: un linter no puede saber que el valor que llega a la
consulta viene de la petición HTTP tres funciones más arriba, en otro archivo.
CodeQL sí, porque no lee texto — construye una **base de datos relacional** del
código y lanza consultas contra ella.

Por eso también es lento comparado con un linter, y por eso no corre en cada
guardado sino en cada pull request.

## 2. Los dos montajes

| | Análisis por defecto (*default setup*) | Análisis avanzado (*advanced setup*) |
|---|---|---|
| Cómo se configura | Un ajuste, o una llamada `PATCH` | Un workflow en tu repositorio |
| Quién lo mantiene | GitHub | Tú |
| Personalizable | Lenguajes, suite y modelo de amenaza | Todo |
| Cuándo elegirlo | Siempre, para empezar | Cuando el otro se queda corto |

### Por defecto

```bash
# Ver la configuración actual y los lenguajes que GitHub detecta
gh api repos/{owner}/{repo}/code-scanning/default-setup

# Activarlo
gh api repos/{owner}/{repo}/code-scanning/default-setup --method PATCH \
  -f state=configured \
  -f query_suite=extended \
  -f 'languages[]=javascript-typescript'
```

Los campos que controlas:

| Campo | Valores | Qué cambia |
|-------|---------|------------|
| `state` | `configured`, `not-configured` | Encendido o apagado |
| `languages` | Los que GitHub detecte | Qué se analiza |
| `query_suite` | `default`, `extended` | Cuántas consultas se lanzan |
| `threat_model` | `remote`, `remote_and_local` | Qué se considera entrada no confiable |
| `runner_type` | `standard`, `labeled` | Runners de GitHub o propios |

`default` son consultas de alta precisión y pocos falsos positivos. `extended`
añade consultas menos precisas: encuentra más y se equivoca más. En un proyecto
que empieza, `extended` es asumible porque hay poco código; en uno grande, la
primera ejecución puede dar cientos de alertas y quemar al equipo.

`threat_model` decide qué cuenta como fuente de datos contaminados. Con `remote`
solo lo que llega por red; con `remote_and_local` también argumentos de línea de
comandos, variables de entorno, ficheros y bases de datos. La segunda opción está
en vista previa y solo para algunos lenguajes: consulta la documentación antes de
contar con ella.

El análisis por defecto corre en cada pull request y en cada push a la rama por
defecto, más un análisis semanal programado.

> [!NOTE]
> Los identificadores de lenguaje agrupan familias: `javascript-typescript`,
> `java-kotlin`, `c-cpp`. Hay alias históricos (`javascript`, `typescript`) que
> la API sigue aceptando. Existe además el lenguaje `actions`, que analiza tus
> propios workflows — el complemento natural de la Semana 11.

### Avanzado

Es un workflow tuyo, con tres pasos:

```yaml
name: CodeQL

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
  schedule:
    - cron: "24 5 * * 1"

permissions:
  contents: read

jobs:
  analizar:
    runs-on: ubuntu-latest
    permissions:
      security-events: write   # publicar los resultados
      actions: read
      contents: read
    strategy:
      fail-fast: false
      matrix:
        language: [javascript-typescript, actions]
    steps:
      - uses: actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683 # v4.2.2

      - uses: github/codeql-action/init@db488ddef3bf6cb639b32c2e9a7c0a7ea8271d28 # v4.37.8
        with:
          languages: ${{ matrix.language }}
          queries: security-extended

      - uses: github/codeql-action/analyze@db488ddef3bf6cb639b32c2e9a7c0a7ea8271d28 # v4.37.8
        with:
          category: "/language:${{ matrix.language }}"
```

Se pasa al avanzado cuando hace falta algo que el otro no da: consultas propias o
paquetes de la comunidad, un archivo de configuración con rutas excluidas, un
proceso de compilación no estándar en lenguajes compilados, o control sobre
cuándo y en qué runner se ejecuta.

> [!IMPORTANT]
> Activar el análisis por defecto **desactiva** el avanzado, y al revés. No
> conviven: son dos configuraciones de lo mismo. Cambiar de uno a otro no pierde
> las alertas, pero sí reinicia el historial de análisis.

Ojo también con el nombre de las suites: la API del análisis por defecto habla de
`default` y `extended`, mientras que en el workflow el input `queries` se escribe
`security-extended` o `security-and-quality`. Es la misma idea con dos
vocabularios.

## 3. Leer las alertas

```bash
gh api "repos/{owner}/{repo}/code-scanning/alerts?state=open&per_page=100" \
  --jq '.[] | {
    n: .number,
    regla: .rule.id,
    severidad: .rule.security_severity_level,
    archivo: .most_recent_instance.location.path,
    linea: .most_recent_instance.location.start_line,
    herramienta: .tool.name
  }'
```

| Campo | Valores | Para qué |
|-------|---------|----------|
| `state` | `open`, `dismissed`, `fixed` | Dónde está en el ciclo |
| `rule.security_severity_level` | `low`, `medium`, `high`, `critical` | Ordenar el trabajo |
| `rule.id` | Identificador de la consulta | Agrupar alertas del mismo tipo |
| `tool.name` | `CodeQL` u otra | Distinguir de las de terceros (Teoría 07) |
| `most_recent_instance.location` | Ruta y líneas | Dónde mirar |

Descartar es un `PATCH`, y los motivos son otros que los de Dependabot:

```bash
gh api repos/{owner}/{repo}/code-scanning/alerts/7 --method PATCH \
  -f state=dismissed \
  -f dismissed_reason="used in tests" \
  -f dismissed_comment="Fixture del test de integración; no llega ninguna entrada externa."
```

Los válidos son `false positive`, `won't fix`, `used in tests` y `mitigated` —
con espacios y apóstrofo, tal cual. Un análisis estático sin falsos positivos no
existe; lo que distingue a un equipo que lo usa de uno que lo apagó es que los
descarta con un motivo escrito en vez de ignorarlos.

## 4. Copilot Autofix

Para muchas alertas de CodeQL, GitHub propone un parche directamente en el pull
request: lee el flujo que detectó la consulta y sugiere el cambio, con una
explicación de por qué cierra el camino. En repositorios públicos está incluido.

Lo que no cambia: **la sugerencia es una propuesta**. Genera código que hay que
leer, que puede arreglar el síntoma sin arreglar el diseño, y que no sustituye a
un test. La forma sana de usarlo es como primer borrador de un arreglo que tú
entiendes, no como botón de «cerrar alerta».

## 5. Antipatrones

| Antipatrón | Por qué duele | Qué hacer |
|------------|---------------|-----------|
| Activar `extended` en un repo grande de golpe | Cientos de alertas y nadie mira ninguna | Empezar con `default` y subir |
| Descartar sin motivo | Se pierde el análisis y se repite | `dismissed_reason` y comentario |
| Tratar code scanning como linter | Se espera respuesta inmediata y ruido de estilo | Es SAST: corre por PR, no por guardado |
| Mantener los dos montajes «por si acaso» | No conviven; uno desactiva al otro | Elegir, y documentar por qué |
| Ir al avanzado sin necesitarlo | Se hereda un workflow que hay que mantener | Solo si el por defecto se queda corto |
| Aceptar Autofix sin leerlo | Se fusiona código que nadie entiende | Revisarlo como cualquier PR |
| Excluir rutas para bajar el número | Las alertas desaparecen, el riesgo no | Excluir solo lo generado o vendorizado |

## 6. Trucos

- **`--jq 'group_by(.rule.id) | map({regla: .[0].rule.id, n: length}) | sort_by(-.n)'`**
  enseña si tienes cien alertas o una regla repetida cien veces
- **El lenguaje `actions`** analiza tus propios workflows: inyecciones en `run`,
  `pull_request_target` mal usado, expresiones peligrosas
- **`code-scanning/analyses`** es el historial de ejecuciones: sirve para saber
  cuándo dejó de analizarse algo
- **Un `category` distinto por análisis** evita que un análisis pise al otro
  cuando hay varias herramientas o varios lenguajes
- **La alerta enlaza al camino completo**, paso a paso, en la interfaz: es la
  mejor herramienta de aprendizaje de la semana
- **Las alertas de code scanning aparecen como comentario en el PR** que las
  introduce; ahí es donde arreglarlas cuesta cinco minutos y no dos semanas

## 📚 Recursos Adicionales

- [About code scanning](https://docs.github.com/en/code-security/code-scanning/introduction-to-code-scanning/about-code-scanning)
- [Configuring default setup for code scanning](https://docs.github.com/en/code-security/code-scanning/enabling-code-scanning/configuring-default-setup-for-code-scanning)
- [Configuring advanced setup](https://docs.github.com/en/code-security/code-scanning/enabling-code-scanning/configuring-advanced-setup-for-code-scanning)
- [CodeQL query suites](https://docs.github.com/en/code-security/code-scanning/managing-your-code-scanning-configuration/codeql-query-suites)
- [REST — Code scanning](https://docs.github.com/en/rest/code-scanning/code-scanning)
- [About Copilot Autofix for CodeQL code scanning](https://docs.github.com/en/code-security/code-scanning/managing-code-scanning-alerts/responsible-use-autofix-code-scanning)
- [CodeQL — Supported languages and frameworks](https://codeql.github.com/docs/codeql-overview/supported-languages-and-frameworks/)

## ✅ Checklist de Verificación

- [ ] Sabes qué distingue el taint tracking de una regla de linter
- [ ] Tienes code scanning activo y lo has comprobado por API
- [ ] Sabes qué cambia entre `default` y `extended`, y qué cuesta cada uno
- [ ] Puedes explicar cuándo hace falta el análisis avanzado
- [ ] Conoces los cuatro motivos de descarte de code scanning
- [ ] Tienes claro qué garantiza Copilot Autofix y qué sigue siendo tuyo
