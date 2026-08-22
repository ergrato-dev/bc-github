# Responder a una revisión

> La mitad del coste de un PR está después de la primera revisión. Cómo
> respondas decide si se cierra en una ronda o en cinco.

## 🎯 Objetivos

- Aplicar cambios sin que el revisor pierda el hilo de lo que ya miró
- Usar commits `fixup!` y saber cuándo aplastarlos
- Pedir de nuevo la revisión y resolver hilos con criterio
- Gestionar un desacuerdo sin bloquear la entrega
- Saber qué pasa con las aprobaciones cuando llegan commits nuevos

## 1. Qué problema resuelve

El PR ya está revisado y hay doce comentarios. La forma de responder decide dos
cosas: cuánto tarda la siguiente ronda y si el revisor tiene que volver a leerlo
todo desde cero.

Y hay una asimetría que conviene tener presente: **quien revisa te está dedicando
su tiempo**. Facilitarle la segunda pasada es la manera más barata de conseguir
que la haga pronto.

## 2. Cómo aplicar los cambios

La regla que más ayuda: **no reescribas la historia mientras hay una revisión en
curso**. Un `push --force` invalida los enlaces de los comentarios de línea y
obliga a releer el PR entero.

| Situación | Qué hacer |
|-----------|-----------|
| Revisión en curso, hay comentarios | Commits nuevos encima, uno por tema |
| Aún nadie ha mirado nada | Enmienda o rebasea libremente |
| Ya está aprobado y solo falta limpiar | Squash al mergear, que no toca la rama |

Si tu repositorio mergea con **squash** ([Teoría 05](05-estrategias-de-merge.md)),
la limpieza es gratis: los commits intermedios no llegan a `main`, así que no hay
ninguna razón para reescribir la rama durante la revisión.

### Commits `fixup!`

Cuando quieres que el commit final quede limpio **y** que el revisor vea el
cambio por separado:

```bash
git commit --fixup <sha-del-commit-original>
git push
# ...cuando la revisión termine, si mergeas con rebase:
git rebase -i --autosquash main
git push --force-with-lease
```

Durante la revisión, cada `fixup!` es un commit visible que se puede leer solo. Al
final desaparecen dentro de su commit destino
([Semana 01, Teoría 02](../../week-01-git_repaso_y_setup_pro/1-teoria/02-reescribir-historia.md)).

## 3. Contestar a cada comentario

Tres respuestas posibles, y las tres son válidas:

| Respuesta | Cuándo | Cómo se ve |
|-----------|--------|------------|
| **Hecho** | Estás de acuerdo | Aplica el cambio y responde con el enlace al commit |
| **No, porque…** | No estás de acuerdo | Explica el motivo en el hilo; no lo dejes sin responder |
| **Buen apunte, lo hago aparte** | Es válido pero fuera de alcance | Abre el issue y enlázalo en el hilo |

Lo que no vale es **cambiar algo sin decirlo** ni **dejar un comentario sin
respuesta**: el revisor no sabe si lo viste, y en la segunda pasada tendrá que
comprobarlo él.

Las **sugerencias aplicables** se aceptan con un botón, y se pueden agrupar en un
solo commit con *Add suggestion to batch* ([Teoría 03](03-review-a-fondo.md)).

## 4. Resolver hilos y volver a pedir revisión

```bash
gh pr comment 42 --body "Aplicados los cuatro comentarios; el de la caché lo dejo en #57"
gh pr edit 42 --add-reviewer usuario     # vuelve a pedirle revisión
gh pr view 42 --json reviewDecision,reviews
```

Convenciones que funcionan:

- **Resuelve quien abrió el hilo**, cuando le convence la respuesta. El autor
  responde y arregla; no cierra hilos ajenos
- **Un resumen al final**: un comentario con qué se cambió y qué no, para que la
  segunda pasada empiece orientada
- **Pide la revisión otra vez explícitamente.** GitHub no vuelve a notificar solo
  porque hayas empujado commits: hay que usar el botón de *re-request review* (el
  icono circular junto al nombre del revisor)

Y del otro lado: en *Files changed* está **Changes since your last review**, que
es lo que hace que la segunda pasada cueste dos minutos en vez de veinte.

## 5. Aprobaciones que se caen

Dos mecanismos que sorprenden la primera vez:

- **Aprobaciones obsoletas**: si el ruleset tiene activado *dismiss stale
  approvals*, cualquier commit nuevo invalida las aprobaciones anteriores y hay
  que volver a pedirlas (Semana 08). Es deseable en repositorios serios, y es la
  razón de agrupar los cambios en vez de empujar de uno en uno
- **Descartar una revisión**: quien tenga permisos puede descartar un
  `Request changes` que bloquea, dejando constancia del motivo

```bash
gh api repos/{owner}/{repo}/pulls/42/reviews/<id>/dismissals \
  --method PUT -f message="El revisor está de vacaciones; lo asume el equipo de plataforma" \
  -f event=DISMISS
```

Descartar es una herramienta legítima y **deja rastro público**. Lo que no es
legítimo es usarla para saltarse una objeción real.

## 6. Cuando no estás de acuerdo

| Paso | Qué hacer |
|------|-----------|
| 1 | Comprueba si es una preferencia o un problema. Si es preferencia, decide rápido y sigue |
| 2 | Argumenta **una vez**, por escrito, con el porqué |
| 3 | Si sigue el desacuerdo tras dos rondas, se habla en directo — no en el hilo |
| 4 | Si no hay acuerdo, decide quien tenga la responsabilidad del área (`CODEOWNERS`) |
| 5 | La decisión, sea cual sea, se escribe en el PR |

Tres cosas que ayudan mucho: separar "esto está mal" de "yo lo haría distinto",
aceptar rápido lo que da igual (guardas crédito para lo que importa), y recordar
que un PR bloqueado tres días cuesta más que casi cualquier detalle discutido.

## 7. Antipatrones

| Antipatrón | Por qué duele | Qué hacer |
|------------|---------------|-----------|
| `push --force` con revisión en curso | Los comentarios pierden su ancla y hay que releer todo | Commits encima |
| Cambiar algo sin responder al hilo | El revisor no sabe si lo viste | Responde siempre, aunque sea "hecho" |
| Resolver tus propios hilos | Cierras la conversación de otro | Resuelve quien lo abrió |
| Empujar de uno en uno | Cada push invalida aprobaciones y notifica | Agrupa y avisa una vez |
| No volver a pedir revisión | El PR se queda parado esperando a nadie | *Re-request review* |
| Discutir cinco rondas en el hilo | Bloquea la entrega | Dos rondas y se habla |
| Aceptar todo sin pensar | Se pierden decisiones buenas por evitar fricción | Argumenta una vez |
| Aprovechar la ronda para meter otra cosa | El revisor tiene que empezar de cero | PR aparte |

## 8. Trucos

- **Resumen de cierre**: un comentario final con "hecho / no hecho / aparte en
  #57" es lo que más acorta la segunda ronda
- **`gh pr diff 42`** para releer tu propio cambio antes de decir que está listo
- **Enlaza el commit** que responde a cada comentario: pegar el SHA basta, GitHub
  lo convierte en enlace
- **`git commit --fixup`** mantiene la trazabilidad durante la revisión y la
  limpieza al final
- **Si el PR ha cambiado mucho**, dilo en un comentario: "el enfoque cambió, mejor
  releer entero" es mejor que dejar que lo descubra
- **Marca lo que sí vas a hacer aparte** abriendo el issue en el momento, no
  "luego": si no, no se abre
- **Comprueba el veredicto actual**:
  `gh pr view 42 --json reviewDecision --jq .reviewDecision`

## 📚 Recursos Adicionales

- [GitHub Docs — Incorporating feedback in your pull request](https://docs.github.com/pull-requests/collaborating-with-pull-requests/reviewing-changes-in-pull-requests/incorporating-feedback-in-your-pull-request)
- [GitHub Docs — Dismissing a pull request review](https://docs.github.com/pull-requests/collaborating-with-pull-requests/reviewing-changes-in-pull-requests/dismissing-a-pull-request-review)
- [Google — Handling pushback in code reviews](https://google.github.io/eng-practices/review/developer/handling-comments.html)

## ✅ Checklist de Verificación

- [ ] No fuerzas el push mientras hay una revisión en curso
- [ ] Todos los comentarios de tus PRs tienen respuesta
- [ ] Sabes volver a pedir la revisión después de aplicar cambios
- [ ] Sabes qué pasa con las aprobaciones cuando llegan commits nuevos
- [ ] Tienes una regla propia para cortar un desacuerdo que se alarga
