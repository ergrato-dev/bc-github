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

## 5. Tiempos y tamaños

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

## 6. Desacuerdos

Ocurren y no son un problema — bloquear la entrega, sí. Escalado sano:

1. El revisor explica **por qué**, no solo qué
2. El autor responde con su razonamiento
3. Si tras **dos rondas** no hay acuerdo: conversación directa, y la conclusión
   vuelve escrita al PR
4. Si sigue sin haberlo: decide quien tiene la responsabilidad de esa área
   (`CODEOWNERS`), y se anota la decisión

Principio útil: **quien discrepa aporta la alternativa**. "No me gusta" no es
una revisión.

## 7. Antipatrones

| Antipatrón | Por qué duele | Qué hacer |
|------------|---------------|-----------|
| Revisar estilo a mano | Desgasta y no aporta | Formateador y linter en CI |
| `Request changes` por preferencia | Bloquea sin motivo real | `nit:` y sigue |
| Aprobar sin leer | Falsa seguridad | Si no puedes, dilo |
| Discusiones de tres días en el PR | Bloquea la entrega | Dos rondas y se habla |
| Revisar solo el diff | Se pierde el contexto | `gh pr checkout` para cambios complejos |
| Sarcasmo o "obviamente" | Daña sin mejorar el código | Explica |
| Un solo revisor para todo | Cuello de botella y punto único de conocimiento | Reparte con `CODEOWNERS` |

## 8. Trucos

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
