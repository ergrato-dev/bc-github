# Review a fondo

> Revisar bien no es encontrar fallos: es que el cambio entre antes y mejor. La
> herramienta tiene más funciones de las que casi nadie usa.

## 🎯 Objetivos

- Revisar con comentarios de línea y sugerencias aplicables
- Usar la revisión por lotes en vez de comentar de uno en uno
- Elegir entre `Comment`, `Approve` y `Request changes` con criterio
- Entender cómo interviene `CODEOWNERS` en la revisión

## 1. Qué problema resuelve

Una revisión mal hecha cuesta más que no revisar: bloquea al autor, genera
discusiones circulares y acaba en "LGTM" por agotamiento. Las herramientas de
review de GitHub están diseñadas para que la conversación converja rápido — si
se usan.

## 2. Los tres niveles de comentario

| Nivel | Dónde | Cuándo |
|-------|-------|--------|
| **Comentario de PR** | Pestaña *Conversation* | Algo general: enfoque, alcance |
| **Comentario de línea** | Sobre una línea del diff | Algo concreto y localizado |
| **Sugerencia** | Bloque especial en un comentario de línea | Sabes exactamente cómo debería quedar |

### Sugerencias aplicables

Es la función más infrautilizada de GitHub:

````markdown
```suggestion
  if (dias <= 0) return 0;
```
````

El autor la aplica con un botón, y se convierte en un commit. Se pueden agrupar
varias en un solo commit (*Add suggestion to batch*).

Regla práctica: **si puedes escribir la corrección, escríbela**. "Esto debería
validar la entrada" cuesta una ronda; una sugerencia, un clic.

Las sugerencias admiten varias líneas: selecciona un rango en el diff antes de
comentar.

## 3. Revisión por lotes

Comentar de uno en uno manda una notificación por comentario. Con quince
comentarios, el autor recibe quince correos y empieza a responder antes de que
termines.

Flujo correcto:

1. *Start a review* en el primer comentario
2. Añade todos los comentarios que quieras (quedan pendientes, solo tú los ves)
3. *Finish your review* con un veredicto y un resumen

Una sola notificación, y el autor lee todo junto con contexto.

## 4. Los tres veredictos

| Veredicto | Qué comunica | Cuándo |
|-----------|--------------|--------|
| **Comment** | Observaciones, sin bloquear ni aprobar | Dudas, o no eres quien decide |
| **Approve** | Por mí puede entrar | El cambio es correcto, aunque queden detalles menores |
| **Request changes** | No entra hasta que se arregle | Hay un fallo real, un riesgo o falta algo esencial |

`Request changes` es una herramienta contundente: bloquea el PR hasta que ese
mismo revisor lo levante. Úsalo para problemas reales, no para preferencias de
estilo. Para eso está `Comment` — o mejor, un linter.

> [!TIP]
> Marca la severidad en el propio comentario. Una convención sencilla y muy
> efectiva: `bloqueante:`, `sugerencia:`, `nit:` (detalle menor, no bloquea).
> El autor sabe al instante qué tiene que atender y qué es opcional.

## 5. Qué se revisa y qué no

| Sí se revisa | No se revisa (automatízalo) |
|--------------|------------------------------|
| ¿Resuelve el problema del issue? | Formato e indentación → formateador |
| ¿Hay casos límite sin cubrir? | Orden de imports → linter |
| ¿Se entenderá dentro de un año? | Comillas simples o dobles → configuración |
| ¿Introduce un riesgo de seguridad? | Errores de tipos → compilador |
| ¿El nombre dice lo que hace? | Cobertura mínima → CI |
| ¿Falta un test del caso que falla? | Tests que no pasan → CI |

Todo lo que pueda decidir una máquina, que lo decida una máquina. La revisión
humana es cara: gástala en lo que solo puede hacer una persona.

## 6. Cómo se revisa un PR grande

A veces el PR grande llega igual. Un orden que funciona:

1. **Lee la descripción y el issue** antes que el diff. Sin saber qué intenta
   hacer, todo comentario es sobre el cómo
2. **Mira la lista de archivos** (`gh pr diff 42 --name-only`): dónde toca dice
   mucho antes de leer una línea
3. **Empieza por los tests.** Dicen qué cree el autor que hace su código, y qué
   casos no contempló
4. **Luego el núcleo**, no el orden alfabético de archivos
5. **Marca *Viewed*** cada archivo terminado; la casilla se desmarca sola si el
   archivo cambia
6. **Si a la mitad no lo entiendes, para** y pide dividirlo. Es más útil que
   terminar una revisión superficial

Y el criterio de una sola frase: **¿me sentiría cómodo arreglando esto a las tres
de la mañana?** Si la respuesta es no, ahí hay un comentario que hacer.

### Qué mirar en los tests

| Pregunta | Por qué |
|----------|---------|
| ¿Falla el test si rompo el código a propósito? | Un test que siempre pasa no prueba nada |
| ¿Cubre el caso límite del issue? | Es el caso que provocó todo esto |
| ¿Se entiende qué comprueba por el nombre? | El nombre del test es documentación |
| ¿Depende del orden de ejecución o del reloj? | Test intermitente asegurado |

## 7. Revisar desde la terminal

```bash
gh pr diff 42                       # el diff completo
gh pr diff 42 --name-only           # solo los archivos
gh pr checkout 42                   # traerlo y probarlo de verdad
gh pr view 42 --comments            # el hilo entero

gh pr review 42 --approve --body "Se ve bien, gracias."
gh pr review 42 --comment --body "Dos dudas sobre el redondeo."
gh pr review 42 --request-changes --body "Falta el caso de 0 días."
```

Los comentarios **de línea** siguen siendo más cómodos en la interfaz: `gh` no
tiene una forma ergonómica de anclarlos. Lo habitual es leer y probar en la
terminal, y comentar en la web.

## 8. `CODEOWNERS` en la revisión

Definido en la Semana 02, aquí es donde actúa: al abrir un PR que toca una ruta
con dueño, GitHub pide revisión a ese dueño automáticamente.

Sin un ruleset que exija *require review from Code Owners*, es solo una
sugerencia. Con él, el PR no se mergea sin esa aprobación (Semana 08).

```bash
gh pr view 42 --json reviewRequests --jq '.reviewRequests'
```

## 9. Resolver conversaciones

Cada hilo de comentario de línea se puede marcar como **resuelto**. Convenciones
que funcionan:

- Resuelve **quien abrió** el hilo, cuando le convence la respuesta
- El autor responde y arregla; no cierra hilos ajenos
- Un hilo sin resolver = algo pendiente. Si están todos resueltos, el PR está listo

Un ruleset puede exigir que **no queden conversaciones abiertas** para mergear.
Es una regla barata que evita mergear con dudas colgando.

## 10. Antipatrones

| Antipatrón | Por qué duele | Qué hacer |
|------------|---------------|-----------|
| Comentar de uno en uno | Bombardeas de notificaciones | *Start a review* |
| `Request changes` por estilo | Bloquea por una preferencia | `Comment`, o un linter |
| "Esto está mal" sin explicar | El autor no sabe qué hacer | Explica el porqué o manda una sugerencia |
| Revisar 2000 líneas de una | La atención no llega | Pide dividir el PR |
| Aprobar sin leer | Peor que no revisar: da falsa seguridad | Si no puedes, dilo |
| Discutir tres días en el PR | Bloquea la entrega | Dos rondas y se habla en directo |
| Revisar el estilo cuando hay un fallo de lógica | Se pierde lo importante | Lo bloqueante primero |

## 11. Trucos

- **Solo lo nuevo desde tu última revisión**: en *Files changed*, el desplegable
  *Changes since your last review*
- **Ocultar los generados**: `linguist-generated=true` en `.gitattributes` los
  colapsa en el diff
- **Marcar archivos como vistos**: la casilla *Viewed* de cada archivo; se
  desmarca sola si el archivo cambia
- **Sugerencia multilínea**: selecciona un rango de líneas antes de comentar
- **Traerlo a local para probarlo**: `gh pr checkout 42`, la única forma honesta
  de revisar algo complejo
- **`?w=1`** para que un reformateo no oculte el cambio real
- **Lo que te toca revisar**: `gh pr list --search "review-requested:@me"`
- **Revisar desde la terminal**:
  `gh pr review 42 --approve --body "Se ve bien, gracias."`

## 📚 Recursos Adicionales

- [GitHub Docs — Reviewing proposed changes](https://docs.github.com/pull-requests/collaborating-with-pull-requests/reviewing-changes-in-pull-requests/reviewing-proposed-changes-in-a-pull-request)
- [GitHub Docs — Incorporating feedback](https://docs.github.com/pull-requests/collaborating-with-pull-requests/reviewing-changes-in-pull-requests/incorporating-feedback-in-your-pull-request)
- [Google — Code Review Developer Guide](https://google.github.io/eng-practices/review/)
- [Conventional Comments](https://conventionalcomments.org/)

## ✅ Checklist de Verificación

- [ ] Has usado *Start a review* en vez de comentarios sueltos
- [ ] Has mandado al menos una sugerencia aplicable
- [ ] Sabes cuándo `Request changes` y cuándo `Comment`
- [ ] No revisas nada que pueda decidir un linter
- [ ] Sabes por dónde empezar cuando el PR es grande
- [ ] Has traído un PR a local con `gh pr checkout` para revisarlo
