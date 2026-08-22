# Rúbrica de Evaluación — Semana 10: Reutilización y actions propias

## 📊 Distribución de Evidencias

| Tipo | Peso | Instrumento |
|------|:----:|-------------|
| Conocimiento 🧠 | 30% | Cuestionario de autoevaluación (10 preguntas) |
| Desempeño 💪 | 40% | Prácticas 01-04, verificadas por `verificar-semana.sh` |
| Producto 📦 | 30% | CI factorizado + action publicada en `v1` |

**Nota mínima para aprobar**: 70% en cada tipo de evidencia.

---

## 🧠 Conocimiento (30%)

| # | Pregunta |
|---|----------|
| 1 | ¿Qué reutiliza un reusable workflow y qué reutiliza una composite action? |
| 2 | ¿Qué claves admite un job que solo tiene `uses:`, y cuáles son un error? |
| 3 | ¿Por qué el `env:` del workflow llamador no llega al reusable? |
| 4 | ¿Qué pasa con los permisos del `GITHUB_TOKEN` a lo largo de una cadena de llamadas? |
| 5 | ¿Por qué `shell:` es obligatorio en los `run:` de una composite action? |
| 6 | ¿Por qué una composite action no puede leer `secrets` y cómo se le pasa un token? |
| 7 | ¿Por qué existe `dist/` en las actions de JavaScript y cuándo puedes prescindir de él? |
| 8 | ¿Qué tres limitaciones tiene una action de Docker frente a una de JavaScript? |
| 9 | ¿Qué diferencia hay entre los tags `v1` y `v1.0.0`, y cuál se mueve? |
| 10 | ¿Qué cambios en una action obligan a subir la versión **mayor**? |

<details>
<summary><strong>Respuestas</strong></summary>

1. El reusable workflow reutiliza **jobs completos**, con su propio `runs-on`,
   su matriz y sus `needs`. La composite action reutiliza **steps**, y se
   ejecuta dentro del job de quien la llama, en su runner.
2. Admite `uses`, `with`, `secrets`, `needs`, `if`, `permissions`, `strategy` y
   `concurrency`. `runs-on`, `steps`, `container`, `services` y `env` son error
   de sintaxis.
3. Porque el reusable se ejecuta como un workflow independiente: solo recibe lo
   que se le pasa explícitamente por `inputs` y `secrets`. Lo que quieras que
   llegue, se declara como input.
4. Solo se pueden **mantener o reducir**, nunca ampliar. Si el reusable necesita
   `pull-requests: write`, tiene que concederlo el llamador; declararlo dentro no
   basta.
5. Porque en una composite action no hay un shell por defecto heredado del job:
   cada step tiene que declarar con qué se ejecuta. Es la causa número uno de
   fallo, y el mensaje de error no lo dice de forma evidente.
6. Por seguridad: una action de terceros no puede leerse los secretos de quien la
   usa. Se le pasa un token declarándolo como `input` y pasándoselo con
   `with: token: ${{ secrets.GITHUB_TOKEN }}`.
7. Porque el runner **no ejecuta `npm install`** antes de la action: descarga el
   repositorio y ejecuta `runs.main` tal cual. Si la action no tiene
   dependencias, `main` puede apuntar directamente al código fuente.
8. Solo corre en runners Linux; el arranque es mucho más lento (build o descarga
   de imagen); y está aislada del sistema de archivos del runner salvo por
   `/github/workspace`.
9. `v1.0.0` es inmutable y no se mueve nunca. `v1` es un puntero a la última
   `v1.x.x` compatible, y se reescribe en cada release.
10. Renombrar o eliminar un input, cambiar un valor por defecto, necesitar un
    permiso nuevo del `GITHUB_TOKEN` y dejar de soportar un runtime o un sistema
    operativo.

</details>

---

## 💪 Desempeño (40%)

| Práctica | Criterio | Puntos |
|----------|----------|:------:|
| 01 — Reusable workflow | `ci.yml` llama a `ci-reutilizable.yml` con un input, y el check `CI` sigue estable | 10 |
| 02 — Composite action | `preparar-entorno` en uso, con output `cache-hit` demostrado en dos runs | 10 |
| 03 — Action en JavaScript | La action etiqueta un PR real y devuelve su output; tests en verde | 10 |
| 04 — Publicar | Repositorio propio con `v1.0.0`, `v1`, release y consumo por SHA | 10 |

---

## 📦 Producto (30%)

Verificable por API — 60 puntos:

| Criterio | Puntos |
|----------|:------:|
| Workflow reutilizable con `workflow_call` e inputs, invocado desde `ci.yml` | 10 |
| Check `CI` con nombre estable y requerido por el ruleset | 10 |
| Composite action existente y en uso desde el workflow reutilizable | 10 |
| Repositorio `accion-tamano-pr` público con `action.yml` en la raíz | 10 |
| Tags `v1.0.0` y `v1` y una release publicada | 10 |
| La action se consume pinneada por SHA y hay un PR etiquetado | 10 |

Calidad — 40 puntos:

| Criterio | Puntos |
|----------|:------:|
| Todos los `inputs` con `description` y valor por defecto razonable | 10 |
| README de la action con inputs, outputs y `permissions` necesarios | 10 |
| El job agregador comprueba `needs.<job>.result` a mano | 10 |
| La composite action hace una sola cosa y no arrastra el pipeline entero | 5 |
| Los mensajes de error de la action explican qué falta (403, label ausente) | 5 |

### Penalizaciones

| Situación | Deducción |
|-----------|:---------:|
| Alguna action referenciada con `@main` | -15 |
| `dist/` desactualizado respecto a `src/` (si empaquetas) | -15 |
| Secreto o token escrito en un YAML o en el código de la action | -100 (rotar y rehacer) |
| Job agregador con `if: always()` y sin comprobar el resultado | -20 |
| Tag `v1.0.0` movido después de publicarse | -20 |
| Composite action sin `shell:` que se salvó por casualidad | -5 |
| README de la action sin la tabla de inputs | -10 |

---

← [Volver a la Semana 10](README.md)
