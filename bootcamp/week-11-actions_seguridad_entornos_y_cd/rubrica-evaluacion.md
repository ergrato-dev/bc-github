# Rúbrica de Evaluación — Semana 11: Seguridad, entornos y CD

## 📊 Distribución de Evidencias

| Tipo | Peso | Instrumento |
|------|:----:|-------------|
| Conocimiento 🧠 | 30% | Cuestionario de autoevaluación (10 preguntas) |
| Desempeño 💪 | 40% | Prácticas 01-04, verificadas por `verificar-semana.sh` |
| Producto 📦 | 30% | Pipeline de CD con puerta, sitio publicado y procedimiento documentado |

**Nota mínima para aprobar**: 70% en cada tipo de evidencia.

---

## 🧠 Conocimiento (30%)

| # | Pregunta |
|---|----------|
| 1 | ¿Qué cuatro procedencias de código conviven en un mismo run y por qué importa? |
| 2 | ¿Qué protege `default_workflow_permissions: read` que no protege declarar `permissions:` en cada workflow? |
| 3 | ¿Por qué un tag no es una versión, y qué demostró el incidente de marzo de 2025? |
| 4 | ¿A qué referencias aplica `sha_pinning_required` y cuáles quedan fuera? |
| 5 | ¿Por qué `base64` rompe el enmascarado de un secreto en los logs? |
| 6 | ¿Qué hace exactamente `id-token: write` y qué no hace? |
| 7 | ¿Qué permitiría de más una condición de confianza con `sub: repo:OWNER/REPO:*`? |
| 8 | ¿Qué cuatro cosas provoca la clave `environment:` en un job? |
| 9 | ¿Por qué `cancel-in-progress` debe ser `false` en un job de despliegue? |
| 10 | ¿Por qué el job que despliega no debe hacer `checkout`? |

<details>
<summary><strong>Respuestas</strong></summary>

1. Tu repositorio, las actions de terceros, las dependencias del build y el
   payload del evento. Las cuatro se ejecutan en el mismo proceso, con las mismas
   variables y el mismo `GITHUB_TOKEN`: si una es hostil, lo es el run entero.
2. Protege del **olvido**. Declarar `permissions:` protege los workflows que ya
   existen; el ajuste del repositorio protege los que se escriban después, o los
   que copie alguien de un blog sin ese bloque.
3. Un tag es un puntero mutable que controla el autor de la action. En marzo de
   2025 se reescribieron los tags de `tj-actions/changed-files` para apuntar a
   código que volcaba la memoria del runner en el log: más de veinte mil
   repositorios ejecutaron código nuevo sin cambiar una línea.
4. Aplica a las **actions**: cualquier `uses:` de una action debe ser un SHA
   completo, incluidas las de GitHub y las de tu propia organización. Los
   **reusable workflows** siguen pudiéndose referenciar por tag.
5. Porque GitHub enmascara las apariciones **literales** del valor. Cualquier
   transformación —base64, invertirlo, trocearlo— produce una cadena distinta que
   el runner no reconoce. La documentación dice explícitamente que el enmascarado
   no está garantizado.
6. Permite **pedir** un JWT de identidad al emisor de GitHub. No concede ningún
   permiso sobre el repositorio: lo que ese token abra lo decide la política de
   confianza del proveedor externo.
7. Cualquier rama, cualquier pull request y cualquier tag de ese repositorio.
   Basta con que alguien pueda ejecutar un workflow desde una rama para obtener la
   credencial cloud. La condición correcta ata a un environment o a una ref
   concreta.
8. Pone a disposición los secretos y variables de ese environment; aplica sus
   reglas de protección **antes** del primer step; registra un deployment
   consultable por API; y enlaza la `url` en el run y en el repositorio.
9. Porque cancelar un despliegue a mitad deja el destino en un estado que nadie
   ha probado. En CI conviene cancelar el run viejo; en CD, encolar.
10. Porque no necesita el código: necesita el artefacto que ya se construyó y se
    validó. Un `checkout` en ese job casi siempre significa que va a reconstruir,
    y lo reconstruido es un binario que nadie ha probado.

</details>

---

## 💪 Desempeño (40%)

| Práctica | Criterio | Puntos |
|----------|----------|:------:|
| 01 — Endurecer | Token por defecto en `read`, cero `uses:` sin SHA, `sha_pinning_required` activo y CI en verde | 10 |
| 02 — OIDC | Claims leídos, `sub` comparado con y sin environment, condición de confianza escrita y justificada | 10 |
| 03 — Environments y Pages | Sitio publicado, environment con revisor y aprobación hecha por API | 10 |
| 04 — Promoción | Validación del artefacto, fallo provocado, cola de despliegues y rollback verificado | 10 |

---

## 📦 Producto (30%)

Verificable por API — 60 puntos:

| Criterio | Puntos |
|----------|:------:|
| Políticas del repositorio: token `read`, sin aprobar PR, forks aprobados a mano | 10 |
| `sha_pinning_required` activo y `dependabot.yml` con `github-actions` | 10 |
| `oidc-claims.yml` con `id-token: write` y `sub` en su valor por defecto | 10 |
| `deploy-pages.yml` con permisos mínimos, sin tags flotantes y sin cancelación | 10 |
| Pages publicado por workflow y construido | 10 |
| Environments `github-pages` (revisor + ramas protegidas) y `staging`, con despliegue registrado | 10 |

Calidad — 40 puntos:

| Criterio | Puntos |
|----------|:------:|
| Los permisos se amplían solo en el job que los necesita | 10 |
| `docs/despliegue.md` permite ejecutar el rollback sin preguntarte nada | 10 |
| La condición OIDC de `docs/confianza-oidc.md` es estrecha y está justificada | 10 |
| El job de despliegue no hace `checkout` y publica el artefacto validado | 5 |
| Los pines por SHA llevan el tag en comentario | 5 |

### Penalizaciones

| Situación | Deducción |
|-----------|:---------:|
| Un secreto o token impreso en un log, aunque se haya borrado después | -100 (rotar y rehacer) |
| Credencial de despliegue como secreto de repositorio en vez de environment | -25 |
| Condición de confianza OIDC con `*` en el `sub` | -20 |
| `permissions` de escritura a nivel de workflow "para simplificar" | -20 |
| Alguna action ajena sin pinnear por SHA | -15 |
| Job de despliegue que reconstruye en vez de descargar el artefacto | -15 |
| `cancel-in-progress: true` en el despliegue | -10 |
| Environment sin revisores en el destino publicado | -10 |
| Aprobar el despliegue con un comentario vacío o irrelevante | -5 |
| Runner self-hosted registrado en el repositorio público | -25 |

---

← [Volver a la Semana 11](README.md)
