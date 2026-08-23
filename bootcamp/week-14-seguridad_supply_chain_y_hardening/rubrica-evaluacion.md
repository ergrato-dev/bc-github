# Rúbrica de Evaluación — Semana 14: Cadena de suministro y hardening

## 📊 Distribución de Evidencias

| Tipo | Peso | Instrumento |
|------|:----:|-------------|
| Conocimiento 🧠 | 30% | Cuestionario de autoevaluación (10 preguntas) |
| Desempeño 💪 | 40% | Prácticas 01-04, verificadas por `verificar-semana.sh` |
| Producto 📦 | 30% | El estado de la cadena de suministro del repositorio y su documentación |

**Nota mínima para aprobar**: 70% en cada tipo de evidencia.

---

## 🧠 Conocimiento (30%)

| # | Pregunta |
|---|----------|
| 1 | ¿Por qué el primer paso ante un secreto filtrado es revocar y no limpiar la historia, y qué sigue estando fuera de tu alcance después de reescribirla? |
| 2 | ¿Qué deja registrado cada uno de los tres motivos de excepción de push protection, y cuál es el único honesto cuando el secreto era real? |
| 3 | ¿Por qué una cadena con formato de token pero inventada no dispara el bloqueo? |
| 4 | ¿Qué significa `validity: active` en una alerta de secret scanning y en qué cambia tu prioridad? |
| 5 | ¿Qué tres campos de un advisory deciden si tus usuarios reciben la alerta, y qué pasa si falta el tercero? |
| 6 | ¿Para qué sirve el fork privado temporal y qué error evita? |
| 7 | ¿En qué se diferencian el SBOM del grafo de dependencias y el SBOM del build, y cuál se puede firmar? |
| 8 | Si Sigstore no guarda ninguna clave privada, ¿qué se está verificando exactamente al comprobar una atestación? |
| 9 | ¿Qué diferencia de garantía hay entre verificar con `--owner`, con `--repo` y con `--signer-workflow`? |
| 10 | ¿Por qué perseguir un 10 en Scorecard es optimizar la métrica en vez del riesgo? |

<details>
<summary><strong>Respuestas</strong></summary>

1. Porque revocar es lo único que reduce el riesgo: mientras la credencial
   funcione, el secreto sigue siendo utilizable aunque el commit ya no esté
   referenciado. Después de reescribir la historia siguen fuera de tu alcance
   los **forks** —que son repositorios de otras personas—, los clones que ya
   existen, y los commits antiguos, accesibles por su SHA para quien lo tenga.
   La limpieza es higiene; la revocación es el remedio.
2. *It's used in tests* y *It's a false positive* crean una alerta **cerrada**
   con ese motivo; *I'll fix it later* crea una alerta **abierta**. Los tres
   dejan rastro con autor y fecha, consultable con
   `?is_bypassed=true`. El único honesto cuando el secreto era real es *I'll fix
   it later*, porque deja la alerta viva para que alguien rote la credencial.
3. Porque los patrones de proveedor no son solo una forma: incluyen una suma de
   comprobación. Una cadena aleatoria con el prefijo correcto no la supera y el
   escáner la descarta. Es la razón por la que hay que probar la protección con
   una credencial real y sin permisos, y por la que mucha gente cree tenerla
   activada sin haberla comprobado nunca.
4. Significa que GitHub ha preguntado al proveedor y la credencial **sigue
   funcionando ahora mismo**. Es la única emergencia real de la bandeja: se rota
   hoy. Las `inactive` son deuda documental —siguen en el historial y en la
   auditoría—, y `unknown` no significa inactivo, significa que nadie lo ha
   comprobado.
5. `package.ecosystem` con `package.name`, `vulnerable_version_range` y
   `patched_versions`. Si el nombre no coincide exactamente con el del registro,
   ningún grafo lo cruza y no se genera ninguna alerta. Si falta
   `patched_versions`, la alerta le llega al usuario con
   `first_patched_version: null`: la que no se puede arreglar actualizando.
6. Es un fork privado del repositorio, creado desde el advisory, donde se
   desarrolla el arreglo durante el embargo. Evita el error de **arreglar en
   abierto**: un commit público cuyo diff enseña dónde estaba el fallo y cómo
   explotarlo, días antes de que los usuarios tengan una versión a la que subir.
7. El **del grafo** sale de los manifiestos y lockfiles del repositorio y
   describe lo que el repositorio declara; lo genera GitHub de forma continua y
   se exporta, pero no se puede atestar. El **del build** sale de escanear el
   artefacto ya construido, incluye lo que de verdad quedó dentro —hasta las
   librerías del sistema, si es una imagen— y es el que se firma con una
   atestación y se adjunta al release.
8. Que **esa identidad de workflow firmó eso, y quedó registrado a esa hora**. El
   token OIDC del workflow sirve para que Fulcio emita un certificado de vida
   muy corta; se firma con una clave efímera que se descarta, y la firma se
   ancla en el log de transparencia Rekor. No se verifica la posesión de una
   clave, se verifica una identidad y un instante.
9. `--owner` acepta cualquier atestación firmada por cualquier repositorio de ese
   propietario; `--repo` la acota a un repositorio; `--signer-workflow` exige que
   la firma venga de un archivo de workflow concreto. Cuanto más estrecha es la
   identidad exigida, menos sirve comprometer otro repositorio o añadir otro
   workflow para colar un artefacto.
10. Porque la puntuación mezcla checks de riesgo crítico con otros que dependen
    de cosas ajenas al riesgo —número de organizaciones que contribuyen, una
    insignia externa, fuzzing continuo—. Subir esos no hace más seguro el
    proyecto. Los proyectos grandes y bien mantenidos se mueven entre el 6 y el
    8; lo accionable es la lista de checks críticos y altos en rojo.

</details>

---

## 💪 Desempeño (40%)

| Práctica | Criterio | Puntos |
|----------|----------|:------:|
| 01 — Secretos que no entran | Las dos capas activas, bloqueo comprobado con credencial real **sin** saltárselo, revocación antes de la limpieza, higiene de secretos en el repositorio | 10 |
| 02 — La puerta de los reportes | `SECURITY.md` con las cinco respuestas y enlace al formulario, reporte privado activo, advisory en borrador bien formado con créditos | 10 |
| 03 — El inventario firmado | SBOM del grafo leído, SBOM del artefacto generado y atestado, verificación correcta y verificación fallida comprobada, SBOM en el release | 10 |
| 04 — La auditoría desde fuera | Scorecard publicando en code scanning, hallazgos leídos por riesgo, `Token-Permissions` y `Pinned-Dependencies` mejorados, mapa documentado | 10 |

---

## 📦 Producto (30%)

Verificable por API — 60 puntos:

| Criterio | Puntos |
|----------|:------:|
| Secret scanning y push protection activos, sin alertas abiertas ni bypasses | 10 |
| `SECURITY.md` en la raíz enlazando el formulario, y reporte privado activo | 10 |
| Advisory en borrador con paquete y `patched_versions`, y ninguno publicado | 10 |
| SBOM exportable y workflow que lo genera y lo atesta, con permisos en el job | 10 |
| Scorecard configurado, anclado por SHA y con análisis registrados | 10 |
| `.gitignore` con los secretos locales y README con el mapa de la cadena | 10 |

Calidad — 40 puntos:

| Criterio | Puntos |
|----------|:------:|
| El bloqueo se probó con una credencial real y se revocó antes de limpiar | 10 |
| El advisory declara un rango de versiones comprobado, no inventado | 10 |
| El SBOM describe el artefacto publicado y no el árbol del repositorio | 10 |
| Los plazos del `SECURITY.md` son sostenibles por una sola persona | 5 |
| El mapa del README lo entiende alguien ajeno al bootcamp | 5 |

### Penalizaciones

| Situación | Deducción |
|-----------|:---------:|
| Un secreto real vivo publicado en el repositorio | -100 (rotar y rehacer) |
| Advisory de práctica **publicado** en la base global | -50 |
| Push protection saltada durante la Práctica 01 | -40 |
| Historia reescrita antes de revocar la credencial | -30 |
| Secret scanning o push protection desactivadas al entregar | -25 |
| Atestación emitida sobre un artefacto distinto del publicado | -25 |
| `attestations: write` o `id-token: write` a nivel de workflow | -15 |
| Alguna action ajena sin anclar por SHA en los workflows nuevos | -15 |
| `SECURITY.md` sin canal de reporte utilizable | -15 |
| SBOM generado y no publicado en ningún sitio | -10 |
| Insignia de Scorecard sin que el análisis se ejecute de verdad | -10 |
| Checks de Scorecard perseguidos por número en vez de por riesgo | -10 |

---

← [Volver a la Semana 14](README.md)
