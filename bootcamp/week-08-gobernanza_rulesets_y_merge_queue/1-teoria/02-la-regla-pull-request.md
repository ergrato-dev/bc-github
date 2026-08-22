# La regla `pull_request`

> Es la regla central de toda la gobernanza: la que convierte "aquí trabajamos
> con PRs" en algo que la plataforma hace cumplir. Y la que más gente bloquea sin
> querer el primer día.

## 🎯 Objetivos

- Configurar cada parámetro sabiendo exactamente qué exige
- Elegir los valores correctos cuando trabajas en solitario
- Conectar la regla con los acuerdos de las Semanas 06 y 07
- Reconocer las combinaciones que se bloquean entre sí

## 1. Qué exige

```json
{
  "type": "pull_request",
  "parameters": {
    "required_approving_review_count": 1,
    "require_code_owner_review": true,
    "dismiss_stale_reviews_on_push": true,
    "require_last_push_approval": false,
    "required_review_thread_resolution": true,
    "allowed_merge_methods": ["squash"]
  }
}
```

Lo primero que hace, antes que cualquier parámetro: **prohibir el push directo** a
las ramas del target. A partir de ahí, cada parámetro añade una condición para
poder mergear el PR.

| Parámetro | Qué hace | Valor típico |
|-----------|----------|--------------|
| `required_approving_review_count` | Aprobaciones necesarias | 1 en equipo; **0 si trabajas solo** |
| `require_code_owner_review` | Exige al dueño del área ([Semana 07](../../week-07-code_review_y_convenciones/1-teoria/06-codeowners.md)) | `true` con `CODEOWNERS` |
| `dismiss_stale_reviews_on_push` | Invalida aprobaciones al llegar commits nuevos | `true` |
| `require_last_push_approval` | Quien empujó el último commit no aprueba su propio push | Equipos amplios |
| `required_review_thread_resolution` | No se mergea con hilos abiertos | `true` |
| `allowed_merge_methods` | `merge`, `squash`, `rebase` | Según la [Semana 06](../../week-06-pull_requests_a_fondo/1-teoria/05-estrategias-de-merge.md) |

## 2. Trabajando solo: el parámetro que te bloquea

> [!WARNING]
> `required_approving_review_count: 1` en un repositorio donde eres la única
> persona **bloquea todos tus PRs**: GitHub no te deja aprobar el tuyo. En
> autoestudio, ponlo a `0` y mantén el resto.

Poner el contador a 0 no vacía la regla. Sigues teniendo:

- Prohibido el push directo a `main` — que es el 80 % del valor
- Hilos de conversación resueltos antes de mergear
- Checks en verde ([Teoría 03](03-checks-y-firmas.md))
- Revisión de code owners **en cuanto haya un segundo colaborador**

Y el día que alguien más entre al repositorio, subir ese 0 a 1 es un carácter.

Lo mismo pasa con `require_last_push_approval: true`: en solitario, cualquier
push tuyo invalida la única aprobación posible. Déjalo en `false` hasta que haya
equipo.

## 3. Aprobaciones obsoletas

`dismiss_stale_reviews_on_push: true` invalida las aprobaciones cuando llegan
commits nuevos. Es la opción correcta casi siempre: sin ella, alguien puede
aprobar un PR de dos líneas y el autor empujar después otras doscientas.

Su coste es real y conviene conocerlo: obliga a **agrupar** los cambios en vez de
empujar de uno en uno, porque cada push manda a pedir revisión otra vez. Es
justo la disciplina que describe la
[Semana 06, Teoría 04](../../week-06-pull_requests_a_fondo/1-teoria/04-responder-a-la-review.md).

## 4. Métodos de merge: dos sitios, una decisión

`allowed_merge_methods` se solapa con la configuración del repositorio
(`gh repo edit --enable-squash-merge`). No son lo mismo:

| | Configuración del repositorio | `allowed_merge_methods` |
|---|---|---|
| Alcance | Todo el repositorio | Las ramas del ruleset |
| Quién la cambia | Quien administre el repositorio | Quien administre el ruleset |
| Se puede saltar | — | Los *bypass actors* ([Teoría 05](05-bypass-y-auditoria.md)) |

Lo coherente es que digan lo mismo. Si el repositorio permite `squash` y el
ruleset exige `merge`, el botón se queda sin opciones válidas y nadie entiende
por qué.

### La combinación imposible

`required_linear_history` ([Teoría 04](04-proteger-la-historia-y-tags.md)) y
`allowed_merge_methods: ["merge"]` son **incompatibles**: el commit de merge que
produce el segundo lo rechaza el primero. Es la contradicción más común al
escribir el primer ruleset a mano.

## 5. Qué no puede exigir

Cosas que la gente espera de esta regla y no están:

| Lo que quieres | Dónde se hace |
|----------------|---------------|
| Que el título del PR cumpla la convención | Un check requerido ([Semana 07, Teoría 03](../../week-07-code_review_y_convenciones/1-teoria/03-validar-la-convencion.md)) |
| Que la descripción no esté vacía | Un check requerido |
| Que el PR tenga menos de N líneas | Un check requerido |
| Que haya al menos un test nuevo | Un check requerido |
| Que apruebe una persona **concreta** | `CODEOWNERS` + `require_code_owner_review` |
| Que la rama esté al día | `strict_required_status_checks_policy` ([Teoría 03](03-checks-y-firmas.md)) |

El patrón se repite toda la semana: **lo que la plataforma no da como regla, se
convierte en un check de CI requerido**.

## 6. Antipatrones

| Antipatrón | Por qué duele | Qué hacer |
|------------|---------------|-----------|
| `required_approving_review_count: 1` trabajando solo | Nada se puede mergear | 0, y el resto igual |
| `require_last_push_approval` en solitario | Tu propio push invalida la aprobación | `false` hasta que haya equipo |
| Ruleset y repositorio con métodos de merge distintos | El botón se queda sin opciones | Que digan lo mismo |
| `required_linear_history` con `allowed_merge_methods: ["merge"]` | Contradicción: nada se mergea | Elige una historia |
| Sin `required_review_thread_resolution` | Se mergea con dudas colgando | Actívalo: es gratis |
| Esperar que la regla valide el título o el tamaño | No lo hace | Check de CI requerido |
| Aprobaciones obsoletas desactivadas | Se aprueba una cosa y entra otra | `dismiss_stale_reviews_on_push: true` |

## 7. Trucos

- **Empieza con la regla en un ruleset `disabled`** y léela en JSON antes de
  activarla ([Teoría 05](05-bypass-y-auditoria.md))
- **Comprueba qué exige hoy tu rama**:
  ```bash
  gh api repos/{owner}/{repo}/rules/branches/main \
    --jq '.[] | select(.type=="pull_request") | .parameters'
  ```
- **El día que entre alguien más**: sube el contador a 1 y activa
  `require_last_push_approval`; son dos ediciones de un JSON
- **`required_review_thread_resolution` es la regla con mejor relación
  coste-beneficio** de toda la semana: cuesta una línea y evita mergear con
  preguntas sin responder
- **Si te bloqueas**, `disabled` en el ruleset y vuelta a `active` después: queda
  en el historial, que es exactamente el punto

## 📚 Recursos Adicionales

- [GitHub Docs — Available rules for rulesets](https://docs.github.com/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/available-rules-for-rulesets)
- [REST API — Repository rules](https://docs.github.com/rest/repos/rules)

## ✅ Checklist de Verificación

- [ ] Sabes por qué `required_approving_review_count: 1` te bloquea trabajando solo
- [ ] Tu ruleset y tu repositorio permiten los mismos métodos de merge
- [ ] Sabes qué combinación de reglas es imposible de cumplir
- [ ] Sabes qué cosas hay que exigir con un check y no con esta regla
