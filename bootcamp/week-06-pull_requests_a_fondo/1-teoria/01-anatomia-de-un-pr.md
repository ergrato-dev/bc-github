# Anatomía de un pull request

> Un PR no es "subir código": es una propuesta con contexto, una conversación y
> una decisión. Las tres cosas quedan escritas para siempre.

## 🎯 Objetivos

- Describir el ciclo de vida de un PR y sus estados
- Escribir descripciones que se revisan rápido
- Usar draft PRs con criterio
- Entender qué son los checks y qué bloquean

## 1. Qué problema resuelve

Sin PR, un cambio llega a `main` sin que nadie lo mire, sin CI y sin rastro de
por qué se hizo. Con PR, el cambio trae contexto (descripción), verificación
(checks) y una decisión registrada (review).

Y el efecto de largo plazo: dentro de dos años, `git blame` te lleva a un commit,
el commit a un PR, y el PR a la conversación donde se decidió. Esa cadena es la
memoria del proyecto.

## 2. Las cuatro partes

| Parte | Para qué |
|-------|----------|
| **Rama base ← rama de trabajo** | Qué se integra y dónde |
| **Descripción** | Qué cambia, por qué, cómo se prueba |
| **Checks** | Verificación automática (CI, seguridad, cobertura) |
| **Reviews** | El juicio humano y la decisión |

## 3. Estados

```
draft ──► open ──► [review] ──► approved ──► merged
   │        │                                  
   └────────┴──► closed (sin mergear)
```

| Estado | Qué significa |
|--------|---------------|
| **Draft** | Trabajo en curso. No se puede mergear y **no notifica a los revisores** |
| **Open** | Listo para revisión |
| **Approved / Changes requested** | Veredicto de un revisor |
| **Merged** | Integrado |
| **Closed** | Descartado sin integrar |

### Cuándo usar draft

- ✅ Quieres que corra CI pero aún no has terminado
- ✅ Quieres enseñar por dónde vas sin pedir revisión formal
- ✅ Quieres reservar el número de PR para enlazarlo desde un issue
- ❌ Para "protegerte" de que lo revisen: si está listo, ábrelo

```bash
gh pr create --draft --fill
gh pr ready 42            # pasar a listo
gh pr ready --undo 42     # volver a draft
```

## 4. La descripción

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

- **`Fixes #N` en la descripción**, no en un comentario: solo ahí cierra el issue.
- **"Cómo probarlo" no es opcional.** Un revisor que tiene que adivinar cómo
  ejecutar tu cambio, no lo ejecuta.
- **Señala lo dudoso tú mismo.** "He hecho X en vez de Y porque Z" ahorra una
  ronda entera de comentarios.

### La plantilla

`.github/pull_request_template.md` precarga esa estructura. Con secciones
mínimas: qué, por qué, cómo probarlo, checklist corto. Una plantilla de treinta
casillas se borra entera y no aporta nada.

## 5. Tamaño

Es la variable que más afecta a la calidad de una revisión:

| Líneas cambiadas | Qué pasa de verdad |
|------------------|--------------------|
| < 100 | Se revisa a fondo |
| 100-400 | Se revisa razonablemente |
| 400-1000 | Se revisa por encima |
| > 1000 | "LGTM 👍" |

Un PR gigante no recibe menos comentarios porque esté mejor: los recibe porque
nadie puede sostener la atención. Si el cambio es grande, apílalo (teoría 04).

## 6. Checks

Un **check** es un resultado publicado sobre el commit de cabeza del PR: CI,
análisis de seguridad, cobertura, linters.

| Estado | Significado |
|--------|-------------|
| ⏳ Pending | Corriendo |
| ✅ Success | Pasó |
| ❌ Failure | Falló |
| ⚪ Neutral / Skipped | No aplica |

Por sí solos **no bloquean nada**: bloquean cuando un ruleset los marca como
obligatorios (Semana 08). Hasta entonces son informativos.

```bash
gh pr checks 42
gh pr checks 42 --watch
```

## 7. Antipatrones

| Antipatrón | Por qué duele | Qué hacer |
|------------|---------------|-----------|
| PR sin descripción | El revisor tiene que reconstruir tu razonamiento | Qué, por qué, cómo probarlo |
| PR de 2000 líneas | No se revisa, se aprueba | Divídelo o apílalo |
| `Fixes #12` en un comentario | No cierra el issue | Va en la descripción |
| Draft eterno | Nadie sabe si esperar | Draft mientras trabajas activamente, no como parking |
| Mezclar formateo y lógica | El cambio real se pierde entre 500 líneas de espacios | Un PR para el formateo, otro para la lógica |
| Abrir el PR y desaparecer | Se queda parado y luego hay que rehacerlo | Responde en el día |
| Plantilla con 30 casillas | Se borra entera | 4-6 puntos, todos reales |

## 8. Trucos

- **Crear el PR con los commits ya escritos**: `gh pr create --fill` usa el
  título y el cuerpo de tus commits. Si escribiste buenos mensajes (Semana 01),
  ya tienes la descripción
- **Diff sin ruido de espacios**: `?w=1` en la URL
- **El diff como texto**: `.diff` o `.patch` al final de la URL — útil para
  aplicar el cambio en otro sitio con `git apply`
- **Ver qué toca antes de abrirlo**: `gh pr diff --name-only`
- **Reservar el número**: abre el PR en draft con el primer commit; el número ya
  se puede enlazar desde el issue
- **Cambiar la base sin cerrar nada**: *Edit* junto al título permite cambiar la
  rama base y el diff se recalcula solo
- **`gh pr status`** te da de un vistazo lo tuyo, lo que te toca revisar y lo que
  está esperando

## 📚 Recursos Adicionales

- [GitHub Docs — About pull requests](https://docs.github.com/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/about-pull-requests)
- [GitHub Docs — Draft pull requests](https://docs.github.com/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/changing-the-stage-of-a-pull-request)
- [Google — Small CLs](https://google.github.io/eng-practices/review/developer/small-cls.html)

## ✅ Checklist de Verificación

- [ ] Tienes plantilla de PR con qué, por qué y cómo probarlo
- [ ] Tus PRs cierran issues con `Fixes #N` en la descripción
- [ ] Sabes cuándo un PR debe ser draft
- [ ] Ninguno de tus PRs pasa de 400 líneas sin una buena razón
