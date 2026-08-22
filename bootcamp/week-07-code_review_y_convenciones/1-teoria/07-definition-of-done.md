# Definition of Done

> La otra pregunta que consume tiempo en cada PR: **¿esto ya está hecho?** Se
> responde una sola vez, por escrito, y en el sitio donde alguien la va a leer.

## 🎯 Objetivos

- Escribir una Definition of Done comprobable y corta
- Distinguirla de los criterios de aceptación de cada issue
- Colocarla donde se usa, no donde se archiva
- Automatizar los puntos que puede comprobar una máquina
- Mantenerla viva sin que se convierta en burocracia

## 1. Qué problema resuelve

Sin acuerdo, "hecho" significa cosas distintas para cada persona: para quien
programa, que el código funciona; para quien revisa, que tiene tests; para quien
lo pidió, que está desplegado y documentado. Esa diferencia se descubre siempre
tarde, y siempre discutiendo.

La **Definition of Done** es la lista de condiciones que cumple **todo** trabajo
del proyecto, sea el que sea, antes de considerarse terminado.

## 2. Una DoD que funciona

```markdown
## Definition of Done

Un cambio está hecho cuando:

- [ ] Cumple los criterios de aceptación del issue
- [ ] Tiene tests que fallan si la lógica se rompe
- [ ] CI en verde *(automático)*
- [ ] Documentación actualizada si cambia el comportamiento visible
- [ ] Revisado por alguien distinto del autor *(automático con CODEOWNERS)*
- [ ] Sin secretos ni datos personales en el diff *(automático con secret scanning)*
- [ ] El issue se cierra al mergear (`Fixes #N`)
```

| Regla | Por qué |
|-------|---------|
| **Comprobable** | "Código de calidad" no se puede verificar; "tests en verde" sí |
| **Corta** | Más de 8 puntos y se marca todo sin leer |
| **Transversal** | Lo específico de cada trabajo son criterios de aceptación |
| **Automatizada donde se pueda** | Lo que comprueba CI no lo tiene que mirar una persona |
| **Visible donde se usa** | En la plantilla de PR, no en una wiki |
| **Acordada** | Una DoD que impone una persona se ignora en dos semanas |

Marcar los puntos automáticos con "(automático)" evita que la gente pierda tiempo
verificando a mano lo que ya está verificado — y deja a la vista qué falta por
automatizar.

## 3. Criterios de aceptación o DoD

| | Criterios de aceptación | Definition of Done |
|---|---|---|
| Dónde | En cada issue | Una sola, para todo el proyecto |
| Qué describen | Qué tiene que hacer **esto** | Qué exige el proyecto **siempre** |
| Ejemplo | "Devolver el mismo día no genera multa" | "Tiene tests y CI en verde" |
| Cambian | Con cada issue | Casi nunca |
| Los escribe | Quien pide el trabajo | El equipo, una vez |

Los dos son necesarios. Confundirlos produce issues con veinte casillas repetidas
o una DoD que no dice nada.

## 4. Dónde vive cada acuerdo

| Documento | Ubicación | Quién lo lee |
|-----------|-----------|--------------|
| Convención de commits | `CONTRIBUTING.md` | Quien contribuye |
| Flujo de ramas | `CONTRIBUTING.md` | Quien contribuye |
| Proceso de review | `CONTRIBUTING.md` | Quien revisa |
| **Definition of Done** | **Plantilla de PR** + `CONTRIBUTING.md` | Autor y revisor, en cada PR |
| Dueños por área | `.github/CODEOWNERS` | GitHub, automáticamente |
| Criterios de aceptación | Cada issue | Autor y revisor |

Regla general: **el documento tiene que estar donde ocurre la decisión.** Una DoD
en una wiki que nadie abre no existe.

## 5. De la lista al ruleset

Una casilla marcada a mano es una declaración de intenciones; un check obligatorio
es una garantía. La progresión natural de una DoD es que sus puntos vayan
migrando de la lista a la automatización:

| Punto de la DoD | Cómo se convierte en garantía |
|-----------------|-------------------------------|
| CI en verde | Check obligatorio en el ruleset (Semana 08) |
| Revisado por otra persona | Aprobaciones requeridas + `CODEOWNERS` (Semana 08) |
| Sin secretos en el diff | Push protection (Semana 13) |
| Convención de commits | Check del título del PR ([Teoría 03](03-validar-la-convencion.md)) |
| Sin conversaciones abiertas | Regla del ruleset (Semana 08) |
| Documentación actualizada | Difícil: se queda en la lista, y está bien |

Cuando un punto pasa a ser automático, **no se quita de la DoD**: se marca como
automático. Sigue explicando qué exige el proyecto, aunque ya no dependa de que
alguien se acuerde.

## 6. Mantenerla viva

- **Revísala cada trimestre**, en diez minutos: qué se automatizó, qué punto no
  se marca nunca, qué falta
- **Si un punto se salta sistemáticamente**, o sobra o el proceso está roto: las
  dos cosas hay que hablarlas
- **Si un incidente se cuela por un hueco**, ese hueco es candidato a punto
  nuevo — pero solo si es transversal, no si fue un caso raro
- **Que quepa en la pantalla.** Una DoD que hay que desplazar para leer no se lee

## 7. Antipatrones

| Antipatrón | Por qué duele | Qué hacer |
|------------|---------------|-----------|
| DoD de 20 puntos | Se marca todo sin leer | Máximo 8, todos comprobables |
| DoD con "código limpio" | No se puede verificar | Reglas concretas o linter |
| DoD solo en la wiki | Nadie la abre | En la plantilla de PR |
| Repetir la DoD en cada issue | Ruido | Es transversal; el issue lleva sus criterios |
| Puntos que ya comprueba CI sin marcar | Se verifica dos veces | Etiqueta "(automático)" |
| DoD impuesta sin acuerdo | Se ignora en dos semanas | Se acuerda y se revisa |
| Añadir un punto tras cada incidente | Acaba con 25 y deja de servir | Solo si es transversal |
| Marcar las casillas sin hacerlo | Peor que no tenerla: da falsa seguridad | Automatiza lo que puedas |

## 8. Trucos

- **La DoD en la plantilla de PR** aparece precargada en cada PR sin esfuerzo
- **Marca lo automático** para que nadie pierda tiempo verificándolo
- **Un punto por línea, en imperativo comprobable**: "tiene tests", no
  "está bien probado"
- **Enlaza desde la DoD** a lo que cada punto significa (la convención, la guía
  de tests): la lista queda corta y el detalle está a un clic
- **Empieza con cinco puntos**. Es más fácil añadir uno que quitar diez
- **Cuando un punto se automatice**, cambia la casilla por "(automático)" en el
  mismo PR que lo automatiza

## 📚 Recursos Adicionales

- [Scrum Guide — Definition of Done](https://scrumguides.org/scrum-guide.html#increment)
- [Atlassian — Definition of Done](https://www.atlassian.com/agile/project-management/definition-of-done)
- [GitHub Docs — Pull request templates](https://docs.github.com/communities/using-templates-to-encourage-useful-issues-and-pull-requests/creating-a-pull-request-template-for-your-repository)

## ✅ Checklist de Verificación

- [ ] Tu DoD tiene 8 puntos o menos, todos comprobables
- [ ] Está en la plantilla de PR, no solo en `CONTRIBUTING.md`
- [ ] Los puntos automáticos están marcados como tales
- [ ] Distingues DoD de criterios de aceptación
- [ ] Sabes qué puntos podrías convertir en check obligatorio en la Semana 08
