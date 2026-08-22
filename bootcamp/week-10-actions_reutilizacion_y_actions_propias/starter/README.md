# `starter/` — Semana 10

> Igual que en la Semana 09: esta semana hay código, porque una action no se
> aprende leyendo YAML ajeno.

Aquí hay **tres piezas incompletas**. Los bloques marcados con `# PASO N` están
comentados o a medias, y cada práctica te dice cuál completar y por qué.

| Pieza | Se completa en | Qué acaba siendo |
|-------|----------------|------------------|
| [`ci-reutilizable.yml`](ci-reutilizable.yml) | Prácticas 01 y 02 | El pipeline de la Semana 09, ahora invocable con parámetros |
| [`accion-preparar-entorno/`](accion-preparar-entorno/action.yml) | Práctica 02 | Composite action con los steps comunes de todos tus jobs |
| [`accion-tamano-pr/`](accion-tamano-pr/action.yml) | Prácticas 03 y 04 | Action de JavaScript que etiqueta los PR por tamaño |

## Cómo se usa

```bash
cd <tu-repo>

# Práctica 01
cp <ruta-al-bootcamp>/bootcamp/week-10-actions_reutilizacion_y_actions_propias/starter/ci-reutilizable.yml \
   .github/workflows/ci-reutilizable.yml

# Práctica 02
mkdir -p .github/actions/preparar-entorno
cp <ruta-al-bootcamp>/.../starter/accion-preparar-entorno/action.yml \
   .github/actions/preparar-entorno/action.yml

# Práctica 03
mkdir -p acciones
cp -r <ruta-al-bootcamp>/.../starter/accion-tamano-pr acciones/tamano-pr
```

A partir de ahí trabajas **en tu repositorio**, no aquí. Este directorio es el
punto de partida; el entregable es el estado de tus repositorios.

## La action de JavaScript

```
accion-tamano-pr/
├── action.yml            # el contrato: inputs, outputs, runtime
├── src/
│   ├── tamano.mjs        # la lógica pura ← lo que completas en la Práctica 03
│   └── index.mjs         # el pegamento: entorno, API, output
└── test/
    └── tamano.test.mjs   # los tests que describen el comportamiento
```

Al copiarla, los tests **fallan a propósito**: `calcularTamano` está a medias.

```bash
cd acciones/tamano-pr
node --test          # 2 pasan, 3 fallan
```

Completar el `PASO 1` de `src/tamano.mjs` hasta que pasen los cinco es la
Práctica 03. Es también el orden correcto de trabajo: la lógica se arregla en
local en segundos, no dentro de un runner.

## Lo que ya viene puesto (y por qué)

Cuatro cosas están escritas desde el principio porque son innegociables:

- **`permissions:` explícitas** en el workflow. Sin esa línea el `GITHUB_TOKEN`
  puede ser de escritura
- **Actions de terceros pinneadas por SHA**, con el tag en un comentario
- **`shell: bash`** en todos los `run:` de la composite action: ahí es
  obligatorio, y el error que sale si falta no lo dice claro
- **Los datos del payload por `env:`**, nunca interpolados dentro de un `run:`

## Versiones

Verificadas en agosto de 2026:

| Pieza | Versión | SHA |
|-------|---------|-----|
| `actions/checkout` | v7.0.1 | `3d3c42e5aac5ba805825da76410c181273ba90b1` |
| `actions/setup-node` | v7.0.0 | `820762786026740c76f36085b0efc47a31fe5020` |
| Runtime de la action JS | `node24` | — |

Comprueba tú mismo el SHA de un tag antes de copiarlo:

```bash
gh api repos/actions/checkout/tags --jq '.[] | select(.name=="v7.0.1") | .commit.sha'
```

---

← [Volver a la Semana 10](../README.md)
