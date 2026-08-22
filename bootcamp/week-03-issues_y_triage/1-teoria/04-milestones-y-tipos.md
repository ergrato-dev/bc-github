# Milestones e issue types

> Un milestone responde "¿en qué entrega cabe esto?". Un type responde "¿qué
> clase de trabajo es?". Confundirlos es la razón por la que muchos backlogs
> tienen quince labels que no sirven para nada.

## 🎯 Objetivos

- Distinguir milestone, iteración e issue type y usar cada uno donde toca
- Crear y cerrar milestones desde la terminal, con fechas de verdad
- Leer el progreso de un milestone sin abrir la interfaz
- Entender qué aportan los issue types a nivel de organización

## 1. Qué problema resuelve

Tres preguntas distintas que la gente contesta con labels porque no sabe que
tienen su propio sitio:

| Pregunta | Herramienta |
|----------|-------------|
| ¿En qué entrega va? | **Milestone** |
| ¿En qué sprint se trabaja? | **Iteración** de un Project (Semana 04) |
| ¿Qué clase de trabajo es? | **Issue type** de la organización |

Cada una tiene su ciclo: la entrega se cierra cuando se publica, el sprint pasa
cada dos semanas, y la clase de trabajo no cambia nunca.

## 2. La tabla que resuelve la confusión

| | Milestone | Iteración (Projects) | Type |
|---|---|---|---|
| Vive en | El repositorio | Un Project v2 | La organización |
| Responde a | ¿En qué entrega? | ¿En qué sprint? | ¿Qué clase de trabajo es? |
| Tiene fecha | Sí, una fecha límite | Sí, recurrente | No |
| Cuántos por issue | Uno | Uno | Uno |
| Progreso | Barra automática | Vistas y métricas | — |
| Cruza repositorios | No | Sí | Sí |

Las tres se pueden usar a la vez y no se pisan: un issue puede ser de tipo `Bug`,
estar en el milestone `v1.0` y planificarse en la iteración `Sprint 7`.

## 3. Milestones

Un milestone agrupa issues y PRs bajo una entrega con fecha. Su valor real no es
la agrupación: es la **barra de progreso** y la conversación que provoca cuando
la fecha se acerca y quedan doce issues abiertos.

```bash
gh api repos/{owner}/{repo}/milestones --method POST \
  -f title="v1.0 — Reglas de negocio" \
  -f due_on="2026-12-31T23:59:59Z" \
  -f description="Primera versión utilizable"

gh api repos/{owner}/{repo}/milestones --jq \
  '.[] | "\(.title): \(.closed_issues)/\(.open_issues + .closed_issues) — vence \(.due_on[0:10])"'

gh issue edit 42 --milestone "v1.0 — Reglas de negocio"
gh issue list --milestone "v1.0 — Reglas de negocio" --state open
```

Y cerrarlo cuando se entrega:

```bash
gh api repos/{owner}/{repo}/milestones/1 --method PATCH -f state=closed
```

### Cómo usarlos bien

- **Siempre con fecha.** Un milestone sin fecha es una etiqueta cara
- **Uno abierto, dos como mucho.** Tres milestones abiertos significa que no hay
  prioridad
- **Cuando llega la fecha, se cierra**, no se mueve. Lo que no entró se
  reasigna al siguiente: eso es información, y moverlo la borra
- Los PRs también pueden llevar milestone, y así el milestone refleja el trabajo
  real y no solo la intención

> [!TIP]
> Al cerrar un milestone, la lista de sus issues cerrados es el 80 % de las notas
> de release. En la Semana 14 se automatiza a partir de exactamente esto.

## 4. Issue types

Los **issue types** son una clasificación definida a nivel de **organización**
(`Bug`, `Feature`, `Task` de fábrica, y los que añadas) que se aplica igual en
todos sus repositorios.

Qué aportan frente a una label `type:`:

| | Label `type:bug` | Issue type `Bug` |
|---|---|---|
| Alcance | Un repositorio | Toda la organización |
| Consistencia | Cada repo la escribe a su manera | Una lista central |
| Filtrado | `label:"type:bug"` | `type:Bug`, también entre repositorios |
| Quién los define | Cualquiera con permisos | Administración de la organización |
| Disponible en cuentas personales | Sí | No — es una funcionalidad de organización |

Traducción práctica para este bootcamp: si trabajas en tu cuenta personal, usa la
familia de labels `type:`. Si algún día administras una organización con veinte
repositorios, los issue types son lo que evita que cada equipo invente su propia
palabra para "bug".

```bash
gh issue list --search "type:Bug is:open"
```

## 5. Antipatrones

| Antipatrón | Por qué duele | Qué hacer |
|------------|---------------|-----------|
| Milestone sin fecha | No crea urgencia ni sirve para planificar | Siempre con fecha |
| Milestone eterno que se va moviendo | Deja de significar entrega | Ciérralo y crea el siguiente |
| Cinco milestones abiertos | No hay prioridad, solo listas | Uno, dos como mucho |
| Usar milestones como sprints | Se mueven cada dos semanas y pierden sentido | Iteraciones del Project |
| Usar labels para la versión | Duplica el milestone y se desincroniza | Milestone |
| Milestone como cajón de "algún día" | Esconde el backlog real | Backlog es no tener milestone |
| Inventar issue types por repositorio | Rompe justo lo que aportan | Lista corta y central |

## 6. Trucos

- **Qué falta para cerrar la entrega**:
  ```bash
  gh issue list --milestone "v1.0 — Reglas de negocio" --state open \
    --json number,title --jq '.[] | "#\(.number) \(.title)"'
  ```
- **Reasignar de golpe lo que no entró**:
  ```bash
  gh issue list --milestone "v1.0" --state open --json number --jq '.[].number' \
    | xargs -I{} gh issue edit {} --milestone "v1.1"
  ```
- **Progreso de todos los milestones en una línea**:
  `gh api repos/{owner}/{repo}/milestones --jq '.[] | "\(.title) \(.closed_issues)/\(.open_issues + .closed_issues)"'`
- **Issues sin milestone**: `no:milestone` en la búsqueda — es tu backlog de
  verdad
- **Vencidos**: la interfaz marca en rojo los milestones con fecha pasada; la
  API te lo da con `.due_on` y una comparación
- **Ordenar milestones** en la interfaz por fecha de vencimiento, no por
  completado: así el que corre siempre está arriba

## 📚 Recursos Adicionales

- [GitHub Docs — About milestones](https://docs.github.com/issues/using-labels-and-milestones-to-track-work/about-milestones)
- [GitHub Docs — Managing issue types in an organization](https://docs.github.com/issues/tracking-your-work-with-issues/configuring-issues/managing-issue-types-in-an-organization)
- [REST API — Milestones](https://docs.github.com/rest/issues/milestones)

## ✅ Checklist de Verificación

- [ ] Tienes un milestone con fecha y varios issues asignados
- [ ] Sabes leer el progreso de un milestone desde la CLI
- [ ] Distingues milestone, iteración y type sin dudar
- [ ] Ningún dato de versión vive a la vez en un milestone y en una label
- [ ] Sabes qué harías al llegar la fecha con issues abiertos
