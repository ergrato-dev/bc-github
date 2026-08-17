---
name: "checks.json de una semana"
description: "Genera el archivo checks.json de autograding de una semana: comprobaciones declarativas contra la API de GitHub que validan el repositorio del estudiante. Usar después de definir los entregables del proyecto semanal."
argument-hint: "Semana (ej: 13) y la lista de entregables que debe verificar"
mode: "agent"
---

# checks.json — Bootcamp GitHub

Genera las comprobaciones automáticas de una semana. Formato de referencia:
[`docs/autograding.md`](../../docs/autograding.md).

## Formato

```json
{
  "semana": "13",
  "titulo": "Seguridad: Dependabot y code scanning",
  "checks": [
    {
      "id": "dependabot-config",
      "descripcion": "Existe .github/dependabot.yml en la rama por defecto",
      "api": "repos/{repo}/contents/.github/dependabot.yml",
      "jq": ".type == \"file\"",
      "pista": "2-practicas/01-dependabot.md, paso 2"
    }
  ]
}
```

| Campo | Obligatorio | Notas |
|-------|:-----------:|-------|
| `id` | sí | kebab-case, estable — no lo renombres después |
| `descripcion` | sí | Texto que ve el estudiante; **igual** al requisito del proyecto |
| `api` | sí* | Endpoint REST; `{repo}` y `{owner}` se sustituyen |
| `graphql` | sí* | Query con variables `$owner` y `$repo` |
| `jq` | sí | Expresión que evalúa a booleano |
| `pista` | no | Archivo y paso que lo arregla |

\* Exactamente uno de `api` o `graphql`.

## Reglas

1. **Una comprobación, un hecho.** Si la descripción lleva una "y", son dos.
2. **`jq` devuelve booleano**: `length > 0`, nunca `length`.
3. **Cero lógica bash.** Si necesita código imperativo, el entregable está mal
   planteado: pásalo a la rúbrica manual.
4. **Prueba cada llamada antes de escribirla**:

   ```bash
   gh api repos/<usuario>/<repo>/rulesets --jq 'map(select(.enforcement == "active")) | length > 0'
   ```

5. **Solo lectura.** Nada de `--method POST`. El script nunca arregla nada.
6. **Un 404 es un fallo**, no un error — no hace falta manejarlo.
7. **De 3 a 6 comprobaciones por semana.** Menos no cubre; más se vuelve
   burocracia y desmotiva.
8. **Nada que dependa del tiempo** (fechas absolutas, "en los últimos 7 días"):
   el estudiante puede hacer la semana cuando quiera.
9. **Nada que dependa de terceros** (que un mantenedor haya mergeado tu PR). Eso
   va a la rúbrica.

## Endpoints útiles por área

| Área | Endpoint |
|------|----------|
| Repo | `repos/{repo}` |
| Contenido de un archivo | `repos/{repo}/contents/<ruta>` |
| Commits | `repos/{repo}/commits` |
| Labels | `repos/{repo}/labels` |
| Issues | `repos/{repo}/issues` |
| Milestones | `repos/{repo}/milestones` |
| Pull requests | `repos/{repo}/pulls?state=all` |
| Rulesets | `repos/{repo}/rulesets` |
| Workflows | `repos/{repo}/actions/workflows` |
| Runs | `repos/{repo}/actions/runs` |
| Releases | `repos/{repo}/releases` |
| Tags | `repos/{repo}/tags` |
| Pages | `repos/{repo}/pages` |
| Topics | `repos/{repo}/topics` |
| Análisis de seguridad | `repos/{repo}` → `.security_and_analysis` |

Projects v2, Discussions y sub-issues solo existen en **GraphQL**.

## Antes de entregar

- [ ] Cada `jq` probado a mano contra un repo real
- [ ] Las descripciones coinciden con los requisitos de `3-proyecto/README.md`
- [ ] Ninguna comprobación exige plan de pago
- [ ] `jq -e . checks.json` valida el JSON

## Datos de la semana

$input
