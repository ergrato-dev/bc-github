# Cultura de code review

> La herramienta la aprendiste la semana pasada. Lo que decide si el review
> funciona no es la herramienta: son los acuerdos.

## 🎯 Objetivos

- Definir qué se revisa a mano y qué se automatiza
- Escribir comentarios que mejoran el código sin desgastar a la persona
- Fijar tiempos de respuesta y tamaños razonables
- Resolver desacuerdos sin bloquear la entrega

## 1. Qué problema resuelve

Un equipo sin acuerdos de revisión acaba en uno de dos extremos: PRs aprobados
sin leer, o PRs bloqueados tres días por una discusión sobre comillas. Los dos
son fallos de proceso, no de personas.

Escribir las reglas cuesta una hora y ahorra esa discusión para siempre.

## 2. Para qué sirve realmente un review

En orden de valor:

1. **Detectar problemas que los tests no ven**: casos límite, decisiones de
   diseño, riesgos de seguridad
2. **Compartir conocimiento**: quien revisa aprende esa parte del sistema
3. **Mantener el código legible** por alguien distinto de quien lo escribió
4. **Dejar registro** de por qué se hizo así

Lo que **no** es: un control de calidad final, ni un examen, ni el sitio donde
se discute el estilo.

## 3. Qué revisa una persona y qué una máquina

| Lo revisa una máquina | Lo revisa una persona |
|-----------------------|-----------------------|
| Formato e indentación | ¿Resuelve el problema del issue? |
| Orden de imports | ¿Faltan casos límite? |
| Comillas, punto y coma | ¿Se entenderá dentro de un año? |
| Errores de tipos | ¿El nombre dice lo que hace? |
| Tests que fallan | ¿Introduce un riesgo? |
| Cobertura mínima | ¿Hay una forma más simple? |
| Secretos filtrados | ¿El alcance del PR es el correcto? |

Regla: **cada vez que comentes algo que podría comprobar una máquina, configura
la máquina.** Un comentario de estilo repetido tres veces es un linter que falta.

## 4. Cómo se escribe un comentario

Tres reglas que evitan casi toda la fricción:

**Comenta el código, no a la persona.**

- ✅ "Esta función hace dos cosas: calcular y persistir."
- ❌ "Siempre haces funciones que hacen dos cosas."

**Pregunta cuando no estés seguro.**

- ✅ "¿Qué pasa si `dias` es negativo?"
- ❌ "Falta validar la entrada."

La pregunta abre conversación; la orden la cierra. Y a veces la respuesta es
"ya está validado en la capa de arriba".

**Marca la severidad.**

```
bloqueante: la comparación no estricta acepta "3" como 3
sugerencia: filter expresa mejor la intención que el bucle
nit: el nombre `resultado` no aporta información (no bloquea)
```

Sin severidad, el autor no sabe qué es obligatorio: o lo hace todo, o no hace
nada.

## 5. Quién revisa

Elegir revisor no es "quien esté libre":

| Criterio | Cuándo aplica |
|----------|---------------|
| Quien conoce el área (`CODEOWNERS`) | Cambios en lógica delicada |
| Quien **no** conoce el área | Cuando quieres repartir conocimiento; añade tiempo, gana equipo |
| Dos revisores | Código crítico: seguridad, dinero, migraciones de datos |
| Quien pidió el cambio | Para validar que resuelve lo que pedía, no el código |

Dos casos particulares que conviene decidir de antemano:

- **Alguien nuevo en el equipo**: que revise desde el primer día es la forma más
  rápida de que aprenda el sistema, aunque su revisión no bloquee al principio
- **Trabajo en pareja**: si dos personas escribieron el código juntas, un tercero
  revisando aporta poco; lo honesto es decirlo en el PR y pedir revisión solo si
  el cambio es delicado

Y el caso incómodo: **revisar a alguien con más experiencia que tú**. Se hace
igual, preguntando. "No entiendo por qué hace falta esta parte" es un comentario
perfectamente válido, y muchas veces el más útil del PR.

## 6. Tiempos y tamaños

| Acuerdo | Valor razonable |
|---------|-----------------|
| Tamaño de PR | < 400 líneas |
| Primera respuesta a un PR | < 1 día laborable |
| Respuesta del autor a comentarios | < 1 día laborable |
| Rondas antes de hablar en directo | 2 |
| Aprobaciones necesarias | 1 (equipos pequeños), 2 (código crítico) |

El tiempo de respuesta importa más de lo que parece: un PR parado bloquea a su
autor, envejece contra `main` y acumula conflictos. Revisar rápido es más
valioso que revisar exhaustivamente.

## 7. Desacuerdos

Ocurren y no son un problema — bloquear la entrega, sí. Escalado sano:

1. El revisor explica **por qué**, no solo qué
2. El autor responde con su razonamiento
3. Si tras **dos rondas** no hay acuerdo: conversación directa, y la conclusión
   vuelve escrita al PR
4. Si sigue sin haberlo: decide quien tiene la responsabilidad de esa área
   (`CODEOWNERS`), y se anota la decisión

Principio útil: **quien discrepa aporta la alternativa**. "No me gusta" no es
una revisión.

## 8. Medir si la revisión funciona

Tres números, sacados con lo de la
[Semana 05](../../week-05-projects_v2_automatizacion_y_metricas/1-teoria/05-calcular-metricas-con-la-api.md):

| Métrica | Qué revela |
|---------|-----------|
| Tiempo hasta la **primera** revisión | Si es de días, el proceso está roto ahí |
| Tamaño mediano de PR | Predice casi todo lo demás |
| Rondas por PR | Más de dos, de forma sistemática, indica falta de acuerdos |

```bash
gh pr list --state merged --limit 50 \
  --json number,additions,deletions,createdAt,mergedAt \
  --jq '[.[] | {n: .number,
                lineas: (.additions + .deletions),
                horas: (((.mergedAt|fromdate) - (.createdAt|fromdate)) / 3600 | floor)}]
        | sort_by(-.lineas)'
```

Lo que **no** se mide: comentarios por persona, ni revisiones hechas por cada
uno. En cuanto la revisión se convierte en una cuota, aparecen las revisiones de
cumplido.

## 9. Antipatrones

| Antipatrón | Por qué duele | Qué hacer |
|------------|---------------|-----------|
| Revisar estilo a mano | Desgasta y no aporta | Formateador y linter en CI |
| `Request changes` por preferencia | Bloquea sin motivo real | `nit:` y sigue |
| Aprobar sin leer | Falsa seguridad | Si no puedes, dilo |
| Discusiones de tres días en el PR | Bloquea la entrega | Dos rondas y se habla |
| Revisar solo el diff | Se pierde el contexto | `gh pr checkout` para cambios complejos |
| Sarcasmo o "obviamente" | Daña sin mejorar el código | Explica |
| Un solo revisor para todo | Cuello de botella y punto único de conocimiento | Reparte con `CODEOWNERS` |

## 10. Trucos

- **Automatiza lo repetido**: si comentas lo mismo tres veces, escribe la regla
- **Empieza por lo bloqueante**: si hay un fallo de lógica, no comentes nombres
  de variables en el mismo pase
- **Reconoce lo bueno**: "buena idea lo del early return" cuesta cinco segundos y
  cambia el tono de todo el hilo
- **Revisa en dos pasadas**: primero el enfoque general, luego el detalle. Si el
  enfoque está mal, el detalle sobra
- **`gh pr checkout` para cualquier cambio no trivial**: leer un diff no es
  ejecutar el código
- **Deja constancia de la decisión**: si algo se habló fuera del PR, escríbelo
  en el PR. Si no está ahí, no existió

## 📚 Recursos Adicionales

- [Google — Code Review Developer Guide](https://google.github.io/eng-practices/review/)
- [How to Do Code Reviews Like a Human](https://mtlynch.io/human-code-reviews-1/)
- [Conventional Comments](https://conventionalcomments.org/)

## ✅ Checklist de Verificación

- [ ] Tu `CONTRIBUTING.md` dice qué se revisa y qué se automatiza
- [ ] Usas prefijos de severidad en los comentarios
- [ ] Tienes un acuerdo escrito de tiempo de respuesta
- [ ] Nada de lo que comentas podría comprobarlo un linter
- [ ] Sabes a quién pedir revisión según el tipo de cambio
- [ ] Has medido alguna vez el tiempo hasta la primera revisión de tus PRs
