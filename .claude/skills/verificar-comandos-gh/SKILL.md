---
name: verificar-comandos-gh
description: Comprueba que los comandos gh, endpoints REST/GraphQL, flags y nombres de features de GitHub citados en el material existan de verdad y hagan lo que el texto dice. Usar SIEMPRE después de escribir teoría o prácticas con comandos, y antes de dar por cerrada cualquier semana.
allowed-tools: Bash(gh *) Bash(jq*) Read Grep Glob WebFetch
---

# Verificar comandos `gh` y endpoints

El fallo más probable de este repo no es un enlace roto: es un **comando
plausible que no existe**. Pasa la revisión a ojo y revienta cuando el
estudiante lo ejecuta. Este skill lo caza.

## Qué revisar

### 1. Extraer los comandos del contenido

```bash
grep -rhoE '^\s*gh [a-z].*' bootcamp/week-NN-*/ | sort -u
```

### 2. Verificar cada subcomando y flag

```bash
gh <comando> --help
gh api --help
```

Si `gh` no reconoce el subcomando o el flag, el material está mal. No lo
"arregles" adivinando otro flag: busca en `gh <comando> --help` cuál es el real.

### 3. Verificar endpoints REST

```bash
gh api repos/ergrato-dev/bc-github --jq 'keys'
```

Errores típicos:

| Escrito | Real | Diferencia |
|---------|------|------------|
| `repos/{repo}/rules` | `repos/{repo}/rulesets` | `rules` devuelve las reglas *efectivas* de una rama, no los rulesets |
| `repos/{repo}/branches/main/protection` | — | Es branch protection clásica, no rulesets |
| `repos/{repo}/actions/secrets` | correcto | pero no lista los valores, solo los nombres |

Si un endpoint devuelve 404 en un repo donde debería existir, el endpoint está
mal escrito. Si devuelve 403, es un problema de scopes, no del material.

### 4. Verificar queries GraphQL

```bash
gh api graphql -f query='query { viewer { login } }'
```

Los campos de Projects v2, Discussions y sub-issues cambian: verifica cada campo
contra el esquema antes de darlo por bueno.

### 5. Verificar nombres de features

Contrastar contra `docs.github.com`. Trampas conocidas:

- **Rulesets** ≠ branch protection (branch protection es legado)
- **Projects v2** ≠ Projects classic (retirado)
- **Fine-grained PAT** ≠ PAT clásico
- **Code scanning** es el producto; **CodeQL** es un motor dentro de él
- **Artifact attestations** ≠ **npm provenance** (relacionados, distintos)
- **Merge queue** requiere que la rama esté protegida por un ruleset con checks

### 6. Verificar los `jq` de `checks.json`

```bash
jq -e . bootcamp/week-NN-*/checks.json          # JSON válido
```

Y cada expresión, contra un repo real:

```bash
gh api repos/<usuario>/<repo>/rulesets --jq 'map(select(.enforcement == "active")) | length > 0'
```

Debe imprimir `true` o `false`, nunca un objeto ni un error de jq.

## Cómo reportar

Una línea por hallazgo: archivo, línea, comando escrito, comando real. Si todo
está correcto, dilo en una línea y ya — no infles el informe.

## Lo que NO haces

- No opinas sobre redacción ni pedagogía.
- No ejecutas comandos que **escriban** (`--method POST/PATCH/DELETE`, `gh repo
  delete`, `gh ruleset`...) contra repos reales. Solo lectura.
- No inventas un comando alternativo si no puedes verificarlo: marca el hallazgo
  y enlaza la documentación.
