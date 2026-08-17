# CLAUDE.md — bc-github

Bootcamp GitHub Zero to Master (21 semanas, 168h, ergrato-dev). Trata **GitHub
como plataforma de ingeniería**, no Git ni "subir código". Nivel de salida:
dueño de plataforma (rulesets, Actions, releases firmados, cadena de suministro,
automatización por API). Modalidad: **autoestudio asincrónico**.

Las convenciones de contenido pedagógico (estructura de semana, tono, malla,
checklist de nueva semana, reglas de seguridad del contenido) viven en
[`.github/copilot-instructions.md`](.github/copilot-instructions.md) — léelo
antes de crear o editar contenido de cualquier semana. No se duplican aquí.

## Prompts reutilizables

`.github/prompts/` tiene plantillas para tareas recurrentes — úsalas en vez de
generar contenido libre: `nueva-semana`, `nueva-teoria`, `nueva-practica`,
`nuevo-proyecto`, `checks-json`, `svg-diagrama`, `commit-message`.

## Skills y agentes

`.claude/skills/`: `verificar-estructura` (enlaces y navegación),
`verificar-comandos-gh` (que los comandos existan de verdad), `sincronizar-trucos`
(README de semana ↔ `docs/trucos-github.md`).

`.claude/agents/`: `curriculo-coherencia-reviewer` (malla ↔ semanas),
`seguridad-contenido-reviewer` (workflows y tokens de ejemplo).

## Estructura por semana

```
week-XX-tema/
├── README.md · rubrica-evaluacion.md (30% conocimiento / 40% desempeño / 30% producto)
├── checks.json (autograding declarativo)
├── 0-assets/ · 1-teoria/ · 2-practicas/ · 3-proyecto/ · 4-recursos/ · 5-glosario/
```

## Reglas que rompen fácil

- **Las prácticas son operaciones sobre GitHub, no código en `starter/`.** Solo
  las semanas 09-12 (Actions) y 15-16 (API) llevan código. En el resto, el
  entregable es el estado real de un repositorio y se verifica con `gh api`.
- **No inventes endpoints, flags ni nombres de features.** Es el fallo más
  probable en este repo: una API plausible pero inexistente pasa desapercibida
  en revisión y revienta cuando el estudiante la ejecuta. Si dudas, enlaza
  `docs.github.com` en vez de improvisar. Usa el skill `verificar-comandos-gh`.
- **Rulesets, no branch protection.** Branch protection clásica solo se menciona
  como legado. Projects (classic) está retirado: solo Projects v2. Fine-grained
  tokens por defecto; PAT clásico solo donde no hay alternativa.
- **Nunca un token con formato válido**, ni falso. `ghp_` + 36 caracteres
  dispara secret scanning en el propio repo. Usa `<TOKEN>` o `${{ secrets.X }}`.
- **Todo workflow de ejemplo declara `permissions`** y pinnea las actions de
  terceros por SHA con el tag en comentario.
- **Sin dominios únicos asignados** (a diferencia de `bc-expressjs`): es
  autoestudio, el estudiante elige su dominio en la Semana 01. Los ejemplos son
  genéricos y adaptables.
- **Un solo repo hilo conductor**, no un repo desechable por semana. Ver
  [`docs/proyecto-hilo-conductor.md`](docs/proyecto-hilo-conductor.md).
- **Si un entregable no se puede verificar por API, no es entregable
  obligatorio** — va a la rúbrica manual. Nunca metas lógica bash específica de
  una semana en `verificar-semana.sh`; declara la comprobación en `checks.json`.
- Antes de cerrar cualquier cambio: `bash scripts/verificar-enlaces.sh` sin
  errores. Los enlaces de navegación desde `bootcamp/week-NN/README.md` a la
  raíz son `../../README.md` (2 niveles).

## Enlaces

- [docs/](docs/README.md) — setup, proyecto, autograding, trucos, glosario
- [Checklist de nueva semana](.github/copilot-instructions.md) (sección final)
