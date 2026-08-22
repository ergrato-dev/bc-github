# `starter/` — Semana 09

> Las semanas de Actions (09-12) sí llevan código, porque escribir YAML desde
> cero mirando la documentación no enseña nada que no enseñe copiar YAML.

Aquí hay **dos workflows incompletos**. El formato es el de las semanas de
código del bootcamp: los bloques marcados con `# PASO N` están **comentados**, y
cada práctica te dice cuál descomentar y por qué.

| Archivo | Se completa en | Qué acaba haciendo |
|---------|----------------|--------------------|
| [`ci.yml`](ci.yml) | Prácticas 01, 02 y 03 | El CI real de tu repositorio: tests en matriz, caché y artifacts |
| [`roto.yml`](roto.yml) | Práctica 04 | Un workflow con cuatro fallos deliberados, para depurar |

## Cómo se usa

```bash
cd <tu-repo>
mkdir -p .github/workflows
cp <ruta-al-bootcamp>/bootcamp/week-09-actions_fundamentos/starter/ci.yml \
   .github/workflows/ci.yml
```

A partir de ahí trabajas **en tu repositorio**, no aquí. Este directorio es el
punto de partida; el entregable es el estado de tu repo, como todas las semanas.

## Lo que ya viene puesto (y por qué)

Tres cosas están escritas desde el principio porque son innegociables, no un
paso opcional que se descomenta:

- **`permissions:` explícitas.** Sin esta línea el `GITHUB_TOKEN` es de
  escritura. Un CI solo necesita leer
- **Actions de terceros pinneadas por SHA**, con el tag en un comentario. Un tag
  se puede mover a otro commit; un SHA no
- **Los datos del payload pasan por `env:`**, nunca interpolados dentro de un
  `run:` — interpolarlos es una inyección de comandos

## Versiones

Las actions van pinneadas a las versiones vigentes en agosto de 2026. Si al
copiarlas hay una versión más nueva, actualiza el SHA **y** el comentario del
tag. Comprobar cuál es la última:

```bash
gh api repos/actions/checkout/releases/latest --jq '.tag_name'
gh api repos/actions/checkout/tags --jq '.[0] | "\(.name) \(.commit.sha)"'
```

---

← [Volver a la Semana 09](../README.md)
