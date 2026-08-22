# SemVer y changelog

> El número de versión es una promesa que le haces a quien usa tu software. El
> changelog es la explicación de esa promesa. Los dos se pueden generar solos si
> los commits están bien escritos.

## 🎯 Objetivos

- Elegir el incremento correcto de versión y saber justificarlo
- Reconocer qué cuenta como *breaking change* y qué no
- Manejar el `0.x` y las preversiones sin engañar a nadie
- Escribir un changelog que alguien pueda leer para decidir si actualiza
- Entender qué automatiza `release-please` y qué sigue siendo tuyo

## 1. Qué problema resuelve

"¿Puedo actualizar de la 2.3.1 a la 2.4.0 sin leer nada?" Si tu versionado es
serio, la respuesta es sí. Si el número sube por capricho, quien te use tendrá
que leer el diff — y dejará de actualizar.

Todo lo de este archivo es la consecuencia lógica de la convención de commits: si
cada commit dice qué clase de cambio es, la versión y el changelog son
deducibles.

## 2. SemVer en tres números

```
MAYOR . MENOR . PARCHE
  │       │       └── Arreglos compatibles hacia atrás
  │       └────────── Funcionalidad nueva compatible hacia atrás
  └────────────────── Cambios que rompen compatibilidad
```

| Tipo de commit | Incremento |
|----------------|:----------:|
| `fix`, `perf` | PARCHE |
| `feat` | MENOR |
| Cualquiera con `!` o `BREAKING CHANGE:` | MAYOR |
| `docs`, `test`, `chore`, `ci`, `style`, `refactor` | Ninguno |

Regla de oro: **el incremento lo decide el impacto en quien usa el software**, no
el esfuerzo que costó. Un refactor de tres semanas que no cambia nada visible no
sube la versión; un mensaje de error que cambia de formato puede ser MAYOR si
alguien lo parsea.

## 3. Qué es un breaking change de verdad

Se subestima constantemente. Cuenta como rotura todo lo que obligue a quien te
usa a cambiar algo:

| Cambio | ¿Rompe? |
|--------|:-------:|
| Quitar o renombrar una función pública | ✅ |
| Añadir un parámetro obligatorio | ✅ |
| Cambiar el tipo de un campo de la respuesta | ✅ |
| Cambiar el formato de un error que se documentó | ✅ |
| Subir la versión mínima del runtime | ✅ |
| Cambiar un valor por defecto | ✅ Casi siempre |
| Añadir un campo nuevo a la respuesta | ❌ |
| Añadir un parámetro **opcional** | ❌ |
| Arreglar un fallo que alguien podría estar usando como funcionalidad | ⚠️ Depende |

Ese último caso —la ley de Hyrum: con suficientes usuarios, todo comportamiento
observable acaba siendo una dependencia de alguien— es el que genera las
discusiones. La salida honesta: documentarlo en el changelog aunque técnicamente
sea un `fix`.

## 4. El `0.x` y las preversiones

Mientras la versión mayor es `0`, SemVer dice explícitamente que **cualquier cosa
puede cambiar**. Es una etapa útil, y también una excusa cómoda para no
comprometerse: si tu software ya lo usa gente en producción, publicar la `1.0.0`
es un acto de honestidad, no una ceremonia.

Preversiones, para lo que aún no es estable:

```
1.0.0-alpha.1     pruebas internas
1.0.0-beta.2      pruebas con usuarios
1.0.0-rc.1        candidata a release
1.0.0             estable
```

Ordenan **antes** que la versión final (`1.0.0-rc.1 < 1.0.0`), y los gestores de
paquetes no las instalan salvo que se pidan explícitamente.

Y una regla que ahorra disgustos: **una versión publicada no se modifica nunca**.
Si te equivocas, se publica otra. Reemplazar el contenido de una etiqueta ya
descargada rompe cachés, builds reproducibles y confianza.

## 5. El changelog

Un changelog se escribe para quien va a **decidir si actualiza**, no para dejar
constancia del trabajo. De ahí salen sus reglas:

```markdown
# Changelog

## [2.4.0] - 2026-08-21

### Added
- Cálculo de multa por retraso en la devolución (#12)

### Fixed
- Devolver el mismo día ya no genera multa (#57)

### Changed
- `calcularMulta` devuelve centavos en vez de unidades

## [2.3.1] - 2026-08-01
...
```

| Regla | Por qué |
|-------|---------|
| Agrupado por tipo de cambio | Quien busca roturas mira una sección, no cincuenta líneas |
| Lo más nuevo arriba | Es lo que se lee |
| Enlaza issues y PRs | El detalle está ahí, no en el changelog |
| Escrito para quien usa, no para quien programa | "Ya no genera multa", no "corregido el `if` de la línea 42" |
| Los breaking changes, destacados y con migración | Es la única sección que alguien lee entera |
| Sin commits de `chore` ni de `ci` | No le afectan a nadie de fuera |

El formato de arriba es [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/),
que es la convención más extendida y la que generan las herramientas.

## 6. Qué se automatiza

Herramientas como `release-please` o `semantic-release` leen los commits desde la
última etiqueta, calculan el incremento, generan el `CHANGELOG.md`, crean la
etiqueta y publican la release. Todo eso se monta en la **Semana 14**.

Lo que **no** automatizan, y sigue siendo tuyo:

- Decidir si algo rompe compatibilidad (la máquina solo lee lo que tú marcaste)
- Escribir la guía de migración de un cambio mayor
- Elegir el momento de publicar
- Poner los `scope` correctos para que el changelog se agrupe bien

Dicho de otra forma: la automatización de la Semana 14 será tan buena como los
commits que escribas esta semana.

## 7. Antipatrones

| Antipatrón | Por qué duele | Qué hacer |
|------------|---------------|-----------|
| Subir MENOR en un cambio que rompe | Rompes builds ajenos en una actualización "segura" | MAYOR, y dilo |
| Versionar por esfuerzo | El número deja de significar nada | Por impacto en quien usa |
| Quedarse en `0.x` para siempre | Nadie se atreve a depender de ti | Publica la `1.0.0` |
| Cambiar el contenido de una versión publicada | Rompes builds reproducibles y cachés | Publica otra |
| Changelog con los mensajes de commit en crudo | Ilegible para quien no conoce el código | Escríbelo para quien usa |
| Changelog escrito el día de la release | Se olvida la mitad | Se genera de los commits |
| `BREAKING CHANGE` sin guía de migración | Sabe que se rompió, no qué hacer | Añade el antes y el después |
| Publicar sin etiqueta en Git | No hay punto de retorno ni diff comparable | Etiqueta anotada y firmada (Semana 14) |

## 8. Trucos

- **La sección de breaking changes primero**: es la que se lee, y ponerla arriba
  reduce las incidencias
- **Comprueba qué versión tocaría** antes de publicar:
  ```bash
  git log --oneline $(git describe --tags --abbrev=0)..HEAD \
    | grep -cE '(feat|BREAKING)'
  ```
- **`git describe --tags --abbrev=0`** te da la última etiqueta: es el punto de
  partida de cualquier cálculo de versión
- **Escribe la entrada del changelog en el PR**, no al final: quien hace el cambio
  es quien sabe explicarlo
- **Enlaza la comparación** entre versiones en el changelog:
  `/compare/v2.3.1...v2.4.0`
- **Si dudas entre MENOR y MAYOR, es MAYOR**: equivocarse hacia arriba solo
  cuesta un número; hacia abajo, cuesta la confianza

## 📚 Recursos Adicionales

- [Semantic Versioning 2.0.0](https://semver.org/lang/es/)
- [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/)
- [`release-please`](https://github.com/googleapis/release-please)
- [Hyrum's Law](https://www.hyrumslaw.com/)

## ✅ Checklist de Verificación

- [ ] Sabes decidir el incremento a partir de los commits
- [ ] Puedes nombrar tres cambios que rompen sin parecerlo
- [ ] Sabes qué significa realmente estar en `0.x`
- [ ] Tu changelog está escrito para quien usa el software
- [ ] Sabes qué parte del proceso no puede automatizarse
