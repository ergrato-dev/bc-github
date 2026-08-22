# Abrir buenos pull requests

> El tiempo que tarda en revisarse tu PR lo decides tú, y casi todo se decide
> antes de abrirlo: en su tamaño y en su descripción.

## 🎯 Objetivos

- Escribir descripciones que se revisan rápido
- Elegir el tamaño de un PR a propósito, no por accidente
- Usar draft con criterio
- Montar una plantilla de PR que la gente no borre
- Abrir y editar PRs desde la terminal

## 1. Qué problema resuelve

Un PR mal presentado no se revisa peor: se revisa **más tarde**. Quien lo abre
mira el diff, no entiende el contexto, lo deja "para luego", y el PR se queda dos
días parado. Cuando por fin se revisa, `main` ha avanzado y hay conflictos.

Todo lo de este archivo va de reducir ese coste de arranque.

## 2. Tamaño: la variable que más importa

| Líneas cambiadas | Qué pasa de verdad |
|------------------|--------------------|
| < 100 | Se revisa a fondo |
| 100-400 | Se revisa razonablemente |
| 400-1000 | Se revisa por encima |
| > 1000 | "LGTM 👍" |

Un PR gigante no recibe menos comentarios porque esté mejor: los recibe porque
nadie sostiene la atención tanto rato. Si el cambio es grande, se **apila**
([Teoría 07](07-conflictos-y-stacked.md)).

Y una consecuencia medible: el tiempo hasta el merge crece más deprisa que el
tamaño. Es fácil de comprobar en tu propio repositorio con los datos de la
[Semana 05](../../week-05-projects_v2_automatizacion_y_metricas/1-teoria/05-calcular-metricas-con-la-api.md).

### Cómo dividir cuando parece indivisible

| Truco | Ejemplo |
|-------|---------|
| Separar formateo de lógica | Un PR con el `prettier`, otro con el cambio |
| Separar refactor de funcionalidad | "Extraigo la función" y luego "cambio su comportamiento" |
| Meter primero lo que no rompe nada | Tipos, constantes, tests que aún no se usan |
| Detrás de una bandera | El código entra apagado y se enciende en otro PR |

## 3. La descripción

Es lo primero que lee el revisor y lo que determina cuánto tarda.

```markdown
## Qué cambia

Añade el cálculo de multa por retraso en la devolución.

## Por qué

Fixes #12. El reglamento fija 300 por día; hasta ahora no se cobraba nada.

## Cómo probarlo

\`\`\`bash
node --test
\`\`\`

Casos cubiertos: 0 días (sin multa), 1 día (300), 10 días (3000).

## Notas para quien revise

He dejado `calcularMulta` sin redondeo porque los importes están en centavos.
```

Reglas:

- **`Fixes #N` en la descripción**, no en un comentario: solo ahí cierra el issue
  ([Semana 03, Teoría 01](../../week-03-issues_y_triage/1-teoria/01-anatomia-de-un-issue.md))
- **"Cómo probarlo" no es opcional.** Un revisor que tiene que adivinar cómo
  ejecutar tu cambio, no lo ejecuta
- **Señala lo dudoso tú mismo.** "He hecho X en vez de Y porque Z" ahorra una
  ronda entera de comentarios
- **Captura o GIF si toca interfaz.** Una imagen ahorra el checkout

### Autorrevisión antes de pedir revisión

Cuesta cinco minutos y quita la mitad de los comentarios: abre la pestaña *Files
changed* de tu propio PR y léelo como si fuera de otro. Ahí se ven los `console.log`
olvidados, el archivo que no querías subir y el bloque comentado. Puedes incluso
dejar comentarios tuyos explicando decisiones: se leen igual que los de un
revisor y evitan preguntas.

## 4. Draft

- ✅ Quieres que corra CI pero aún no has terminado
- ✅ Quieres enseñar por dónde vas sin pedir revisión formal
- ✅ Quieres reservar el número de PR para enlazarlo desde un issue
- ❌ Para "protegerte" de que lo revisen: si está listo, ábrelo

```bash
gh pr create --draft --fill
gh pr ready 42            # pasar a listo
gh pr ready --undo 42     # volver a draft
```

Un draft **no notifica** a los revisores y **no se puede mergear**: eso es
exactamente lo que lo hace útil, y también lo que lo convierte en un parking si
te olvidas de él.

## 5. La plantilla

`.github/pull_request_template.md` precarga la estructura para todo el mundo.

```markdown
## Qué cambia

## Por qué

Fixes #

## Cómo probarlo

## Checklist
- [ ] Tests que cubren el cambio
- [ ] Documentación actualizada si hacía falta
```

Con secciones mínimas: qué, por qué, cómo probarlo, y un checklist corto. Una
plantilla de treinta casillas se borra entera y no aporta nada.

Se pueden tener **varias** en `.github/PULL_REQUEST_TEMPLATE/` y elegirlas con
`?template=nombre.md` en la URL, aunque para casi todo el mundo una basta. Y a
diferencia de los issues, **los PRs no admiten formularios YAML**: aquí solo hay
Markdown ([Semana 03, Teoría 02](../../week-03-issues_y_triage/1-teoria/02-issue-forms-yaml.md)).

## 6. Abrir el PR desde la terminal

```bash
gh pr create --fill                       # título y cuerpo desde los commits
gh pr create --fill-first                 # solo el primer commit
gh pr create --draft --base main --title "..." --body-file .github/notas.md
gh pr create --web                        # abre el navegador con todo precargado

gh pr edit 42 --add-reviewer usuario --add-label "type:feature" --milestone "v1.0"
gh pr edit 42 --add-assignee @me
```

`--fill` es el argumento definitivo a favor de escribir buenos mensajes de commit
([Semana 07](../../week-07-code_review_y_convenciones/1-teoria/02-conventional-commits.md)):
si los commits están bien, la descripción del PR ya está escrita.

## 7. Antipatrones

| Antipatrón | Por qué duele | Qué hacer |
|------------|---------------|-----------|
| PR sin descripción | El revisor reconstruye tu razonamiento | Qué, por qué, cómo probarlo |
| PR de 2000 líneas | No se revisa, se aprueba | Divídelo o apílalo |
| `Fixes #12` en un comentario | No cierra el issue | En la descripción |
| Mezclar formateo y lógica | El cambio real se pierde entre 500 líneas | Dos PRs |
| Abrir el PR y desaparecer | Se queda parado y luego hay conflictos | Responde en el día |
| Plantilla con 30 casillas | Se borra entera | 4-6 puntos, todos reales |
| No leer tu propio diff | Comentarios que te podrías haber ahorrado | Autorrevisión de cinco minutos |
| Título tipo "cambios" | La lista de PRs se vuelve inútil | El título es la línea del changelog |

## 8. Trucos

- **`gh pr create --fill`** convierte buenos commits en una buena descripción
- **Reservar el número**: abre el PR en draft con el primer commit; ya puedes
  enlazarlo desde el issue
- **Empezar por el issue**: `gh issue develop 12 --checkout` crea la rama ya
  vinculada
- **Ver el diff antes de abrirlo**: `git diff main...HEAD --stat`
- **`--web` cuando quieras revisar la descripción larga** en el navegador antes
  de enviar
- **Marca los archivos generados** con `linguist-generated=true` para que se
  colapsen en el diff (Semana 02)
- **Si el PR crece a mitad**, pásalo a draft mientras lo divides: es más honesto
  que dejar a alguien revisando algo que va a cambiar

## 📚 Recursos Adicionales

- [GitHub Docs — Creating a pull request](https://docs.github.com/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/creating-a-pull-request)
- [GitHub Docs — Pull request templates](https://docs.github.com/communities/using-templates-to-encourage-useful-issues-and-pull-requests/creating-a-pull-request-template-for-your-repository)
- [Google — Small CLs](https://google.github.io/eng-practices/review/developer/small-cls.html)
- [Manual de `gh pr create`](https://cli.github.com/manual/gh_pr_create)

## ✅ Checklist de Verificación

- [ ] Tienes plantilla de PR con qué, por qué y cómo probarlo
- [ ] Tus PRs cierran issues con `Fixes #N` en la descripción
- [ ] Ninguno de tus PRs pasa de 400 líneas sin una buena razón
- [ ] Te lees tu propio diff antes de pedir revisión
- [ ] Sabes abrir un PR completo sin salir de la terminal
