# Recibir un reporte de vulnerabilidad

> Alguien encuentra un fallo de seguridad en tu proyecto un martes por la tarde.
> Lo que pase a continuación —si lo publica en un issue con la prueba de concepto
> incluida o si te llega en privado y te da margen para arreglarlo— no lo decide
> esa persona. Lo decides tú, antes, con un archivo y un ajuste.

## 🎯 Objetivos

- Escribir un `SECURITY.md` que se pueda seguir, no uno de adorno
- Activar el reporte privado y saber qué ve el que reporta
- Explicar qué es la divulgación coordinada y de dónde salen sus plazos
- Reconocer los errores que empujan a un investigador a publicar en abierto
- Comprobar por API que la puerta está de verdad abierta

## 1. Qué problema resuelve

Un investigador que encuentra algo en tu repositorio tiene tres opciones: buscar
un canal privado, abrir un issue público, o irse sin decir nada. Las dos últimas
son malas para todos, y las dos últimas son lo que pasa **por defecto** cuando no
hay canal.

GitHub ofrece dos piezas que se complementan:

| Pieza | Qué es | Dónde se ve |
|-------|--------|-------------|
| `SECURITY.md` | Un archivo con tus instrucciones de reporte | Pestaña **Security** → *Reporting a vulnerability* |
| **Reporte privado** (*private vulnerability reporting*) | Un formulario que crea un borrador de advisory privado | Botón *Report a vulnerability* en la misma pestaña |

El archivo dice **qué** hacer; el ajuste da el **dónde**. Con solo el archivo, el
reporte llega por correo y se gestiona a mano. Con solo el ajuste, el botón está
ahí pero nadie sabe qué esperar después.

## 2. Un `SECURITY.md` que sirve

GitHub lo busca en la raíz, en `.github/` o en `docs/`. Lo que casi nadie hace es
escribirlo con contenido accionable. Las cinco cosas que tiene que contestar:

| Pregunta | Ejemplo de respuesta concreta |
|----------|-------------------------------|
| **¿Qué versiones se mantienen?** | Una tabla: `1.x` sí, `0.x` no |
| **¿Cómo reporto?** | El enlace directo al formulario, no «escríbenos» |
| **¿Qué incluyo?** | Versión, pasos para reproducir, impacto esperado |
| **¿Cuándo me contestas?** | Un plazo real: «acuse en 72 h, arreglo o plan en 30 días» |
| **¿Qué queda fuera?** | Lo que no consideras vulnerabilidad, para no perder tiempo |

La plantilla mínima:

```markdown
# Política de seguridad

## Versiones con soporte

| Versión | Soporte |
| ------- | :-----: |
| 1.x     | ✅      |
| 0.x     | ❌      |

## Reportar una vulnerabilidad

Usa el formulario privado:
https://github.com/<tu-usuario>/<tu-repo>/security/advisories/new

No abras un issue público para un fallo de seguridad.

Incluye: versión afectada, pasos para reproducirlo e impacto que esperas.

## Qué puedes esperar

- Acuse de recibo en **72 horas**
- Evaluación inicial en **7 días**
- Arreglo o plan público en **30 días**, coordinado contigo antes de publicar
- Crédito en el advisory salvo que prefieras el anonimato

## Fuera de alcance

Resultados de escáneres automáticos sin impacto demostrado, ataques que exigen
acceso físico a la máquina, y vulnerabilidades de dependencias ya cubiertas por
un advisory publicado.
```

> [!NOTE]
> Esa URL —`/security/advisories/new`— es el enlace directo al formulario de
> reporte privado. Ponerla literalmente ahorra al investigador el paso que más
> gente abandona: encontrar el sitio.

## 3. Activar el reporte privado

En la interfaz: **Settings → Advanced Security → Private vulnerability
reporting → Enable**.

Por API, el ajuste tiene sus tres verbos:

```bash
# Comprobar
gh api repos/{owner}/{repo}/private-vulnerability-reporting --jq '.enabled'

# Activar
gh api repos/{owner}/{repo}/private-vulnerability-reporting --method PUT

# Desactivar
gh api repos/{owner}/{repo}/private-vulnerability-reporting --method DELETE
```

Es gratuito y funciona en repositorios públicos. Lo que ocurre cuando alguien lo
usa:

1. Rellena un formulario con resumen, descripción, versiones afectadas y
   severidad propuesta
2. Se crea un **advisory en estado `triage`**, visible solo para ti y para quien
   reporta
3. Se te notifica como administrador del repositorio
4. Dentro de ese advisory hay un hilo privado para hablar, y la posibilidad de
   crear un fork privado temporal para arreglarlo sin que se vea

Es decir: el reporte no es un correo, **es el principio del advisory**. La misma
pieza que se publica al final ya existe desde el minuto uno.

## 4. Divulgación coordinada

**Divulgación coordinada** (*coordinated disclosure*) es el acuerdo implícito
entre quien encuentra el fallo y quien lo mantiene: el hallazgo se mantiene
privado durante un plazo razonable mientras se arregla, y se publica después.

Los plazos habituales en la industria van de 30 a 90 días desde el reporte. No es
una ley: es una expectativa. Y la expectativa se rompe en las dos direcciones —un
mantenedor que no contesta en un mes, un investigador que publica en una semana—,
por lo que ponerlo por escrito en el `SECURITY.md` protege a los dos.

Lo que **no** debe hacerse durante el embargo:

- Corregir el fallo con un commit cuyo mensaje explique la vulnerabilidad. El
  commit es público; el advisory no. Ese es el error clásico: se arregla en
  abierto y el mensaje sirve de mapa
- Publicar el release del arreglo sin publicar el advisory el mismo día
- Discutir el detalle en un issue, aunque sea «sin dar detalles»

## 5. La respuesta que hay que tener escrita

Cuando llega un reporte, la primera contestación es casi siempre la misma y
conviene tenerla lista:

> Gracias por el reporte. Lo hemos recibido el <fecha> y lo estamos reproduciendo.
> Te confirmamos la evaluación inicial antes del <fecha + 7 días>. Si publicamos
> un advisory, ¿quieres aparecer en los créditos y con qué nombre?

Acusa recibo, pone una fecha, y resuelve lo de los créditos antes de que sea
urgente. Los tres puntos donde se pierde a un investigador son el silencio, el
plazo indefinido y no reconocer el trabajo.

## 6. Antipatrones

| Antipatrón | Por qué duele | Qué hacer |
|------------|---------------|-----------|
| `SECURITY.md` copiado sin adaptar | Manda a un correo que no existe | Enlace al formulario propio |
| Prometer plazos que no vas a cumplir | Se rompe la confianza y publican antes | Plazos que puedas sostener solo |
| Sin canal privado | Los fallos llegan como issues públicos | Activar el reporte privado |
| Contestar tarde o no contestar | Es la causa número uno de publicación unilateral | Acuse en 72 h aunque no haya análisis |
| Arreglar en abierto durante el embargo | El commit es el mapa del ataque | Fork privado temporal del advisory |
| Olvidar los créditos | El trabajo lo hizo otro | Preguntarlo en la primera respuesta |
| Tratar todo reporte como crítico | Se agota el tiempo en ruido | Sección «fuera de alcance» explícita |

## 7. Trucos

- **La URL `/security/advisories/new`** funciona en cualquier repositorio con el
  reporte privado activo: enlázala desde el README, no solo desde el `SECURITY.md`
- **`gh api repos/{owner}/{repo}/private-vulnerability-reporting --jq '.enabled'`**
  es la comprobación de una línea, y sirve para auditar todos tus repositorios en
  un bucle
- **La pestaña Security es pública**: cualquiera puede ver si tienes política de
  seguridad y advisories publicados. Es parte de tu reputación como mantenedor
- **Scorecard mira exactamente esto** en su check `Security-Policy`: tener el
  archivo, y que tenga instrucciones y no solo un título
- **Prueba tu propio formulario** desde otra cuenta o pídele a alguien que lo
  haga. Es la única forma de saber qué ve quien reporta

## 📚 Recursos Adicionales

- [Adding a security policy to your repository](https://docs.github.com/en/code-security/getting-started/adding-a-security-policy-to-your-repository)
- [Configuring private vulnerability reporting for a repository](https://docs.github.com/en/code-security/security-advisories/working-with-repository-security-advisories/configuring-private-vulnerability-reporting-for-a-repository)
- [Privately reporting a security vulnerability](https://docs.github.com/en/code-security/security-advisories/guidance-on-reporting-and-writing-information-about-vulnerabilities/privately-reporting-a-security-vulnerability)
- [About coordinated disclosure of security vulnerabilities](https://docs.github.com/en/code-security/security-advisories/guidance-on-reporting-and-writing-information-about-vulnerabilities/about-coordinated-disclosure-of-security-vulnerabilities)

## ✅ Checklist de Verificación

- [ ] Tu `SECURITY.md` contesta las cinco preguntas, con plazos que puedes cumplir
- [ ] Enlaza directamente a `/security/advisories/new`
- [ ] El reporte privado está activo y lo has comprobado por API
- [ ] Sabes qué se crea exactamente cuando alguien envía un reporte
- [ ] Entiendes qué no se puede hacer durante el embargo
- [ ] Tienes escrita la primera respuesta, créditos incluidos
