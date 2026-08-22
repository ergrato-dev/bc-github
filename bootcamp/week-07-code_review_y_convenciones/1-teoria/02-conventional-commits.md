# Conventional Commits

> Una convención de tres líneas que te da changelog automático, versionado
> automático y una historia que se lee. Es la mejor relación coste/beneficio de
> todo el bootcamp.

## 🎯 Objetivos

- Escribir commits con el formato de la especificación
- Marcar breaking changes correctamente
- Relacionar tipos de commit con incrementos de SemVer
- Validar la convención automáticamente

## 1. Qué problema resuelve

Con historia libre, generar un changelog implica leer 200 commits y decidir
cuáles importan. Con una convención, el changelog **se genera solo** — y de paso
el número de versión, porque la máquina puede saber si hubo una rotura, una
funcionalidad o un arreglo.

Beneficio secundario, y no menor: obliga a pensar qué clase de cambio estás
haciendo antes de commitear.

## 2. El formato

```
<tipo>(<scope>)<!>: <descripción>

[cuerpo opcional]

[footer opcional]
```

```
feat(prestamos): calcula la multa por retraso de devolución

El reglamento fija 300 por día. Los importes van en centavos, por eso
no hay decimales.

Closes #12
```

Reglas:

- **Descripción**: imperativo, minúscula, sin punto final, ≤ 72 caracteres
- **Scope**: la parte del sistema, entre paréntesis y opcional
- **Cuerpo**: el **porqué**. El diff ya dice el qué
- **Footer**: `Closes #N`, `BREAKING CHANGE:`, `Co-authored-by:`

## 3. Los tipos

| Tipo | Cuándo | SemVer |
|------|--------|:------:|
| `feat` | Funcionalidad nueva | MINOR |
| `fix` | Corrección de un fallo | PATCH |
| `docs` | Solo documentación | — |
| `style` | Formato, sin cambio de comportamiento | — |
| `refactor` | Reestructurar sin cambiar comportamiento | — |
| `perf` | Mejora de rendimiento | PATCH |
| `test` | Añadir o corregir tests | — |
| `build` | Sistema de build o dependencias | — |
| `ci` | Configuración de CI | — |
| `chore` | Mantenimiento varios | — |
| `revert` | Revierte un commit anterior | — |

Con once tipos sobra. Añadir más los vuelve indistinguibles.

### Elegir el tipo

La pregunta que lo resuelve: **¿qué nota quien usa el software?**

- Puede hacer algo que antes no → `feat`
- Algo que fallaba ya no falla → `fix`
- No nota nada → `refactor`, `chore`, `test`, `docs`…

## 4. Breaking changes

Dos formas, ambas válidas:

```
feat(api)!: cambia el formato de respuesta de /prestamos
```

```
feat(api): cambia el formato de respuesta de /prestamos

BREAKING CHANGE: `fecha` pasa de timestamp a ISO 8601. Los clientes
que parseen números fallarán.
```

El `!` es visible de un vistazo; el footer permite explicar la migración. Lo
ideal es usar los dos.

Un breaking change fuerza **MAJOR** en SemVer. Es la señal más importante de
toda la convención: es la única que puede romperle el software a alguien.

## 5. El cuerpo y los footers, con detalle

La parte que casi nadie usa y que es la que da valor al changelog:

```
fix(prestamos)!: cobra la multa desde el primer día de retraso

Antes se aplicaba a partir del segundo día por un error de comparación
(`>` en vez de `>=`). El reglamento del artículo 14 no admite margen.

BREAKING CHANGE: los préstamos con un día de retraso pasan a tener multa.
Los importes históricos no se recalculan.
Refs: #12
Reviewed-by: @persona-prestamos
Co-authored-by: Nombre <nombre@ejemplo.com>
```

| Parte | Regla |
|-------|-------|
| Cuerpo | Separado del título por **una línea en blanco**. Explica el porqué |
| Footers | Al final, separados por una línea en blanco, formato `Clave: valor` |
| `BREAKING CHANGE:` | El único footer que se escribe con espacio y en mayúsculas |
| `Closes #N` / `Fixes #N` | Cierra el issue si el commit llega a la rama por defecto |
| `Co-authored-by:` | GitHub lo reconoce y atribuye el commit a las dos personas |
| `Signed-off-by:` | Lo añade `git commit -s` cuando el proyecto usa DCO |

### Scopes que sirven

El `scope` es la parte del sistema afectada, y es lo que agrupa el changelog. Un
buen conjunto de scopes se parece al dominio del proyecto (`prestamos`, `socios`,
`catalogo`), no a su estructura de carpetas (`utils`, `helpers`, `index`).

En un monorepo, el scope suele ser el paquete (`feat(api):`, `fix(web):`), y ahí
sí conviene fijar la lista de scopes permitidos en la validación
([Teoría 03](03-validar-la-convencion.md)).

### Revertir

```
revert: feat(prestamos): calcula la multa por retraso

This reverts commit a1b2c3d4.
```

`git revert` genera un mensaje que empieza por `Revert "..."`; si quieres que el
changelog lo recoja, renómbralo al formato de arriba.

## 6. Qué versión sale de esto

Cada tipo de commit se traduce en un incremento de versión, y de ahí sale el
changelog. La relación completa —qué cuenta como rotura, qué pasa en `0.x`, cómo
se escribe el changelog— está en la [Teoría 04](04-semver-y-changelog.md).

```
MAYOR . MENOR . PARCHE
  │       │       └── fix, perf
  │       └────────── feat
  └────────────────── BREAKING CHANGE
```

## 7. Con squash merge, el título del PR es el commit

Es la consecuencia práctica más importante y la que más se pasa por alto.

Si tu repositorio usa **squash** (Semana 06), lo que acaba en `main` es el
**título del PR**, no tus mensajes de commit locales. Entonces:

- La convención tiene que aplicarse al **título del PR**
- Validar commits locales está bien, pero no es lo que cuenta
- Hay que validar el título del PR en CI (práctica 02)

Con merge commit o rebase, se valida cada commit. Con squash, el título del PR.

## 8. Antipatrones

| Antipatrón | Por qué duele | Qué hacer |
|------------|---------------|-----------|
| `chore` para todo | El changelog sale vacío | Elige el tipo real |
| Scope por archivo (`feat(index.js)`) | No dice nada al lector | Scope por área del dominio |
| Descripción en pasado (`añadió`) | Rompe la convención de Git | Imperativo: `añade` |
| Breaking change sin marcar | Rompes a los usuarios sin aviso | `!` y `BREAKING CHANGE:` |
| Un commit con `feat` y `fix` juntos | El changelog no puede clasificarlo | Dos commits |
| Validar commits pero mergear con squash | Se valida lo que no cuenta | Valida el título del PR |
| Descripción de 200 caracteres | Se corta en todas las vistas | ≤ 72, el resto al cuerpo |

## 9. Trucos

- **La validación automática está en la [Teoría 03](03-validar-la-convencion.md)**:
  hook `commit-msg` compartido y comprobación del título del PR en CI
- **`git commit --fixup`** genera automáticamente un mensaje válido
- **Plantilla de mensaje**: `git config commit.template .gitmessage` te precarga
  la estructura en el editor
- **Revertir con convención**: `git revert` genera `Revert "..."`; renómbralo a
  `revert: ...` si quieres que el changelog lo recoja
- **Comprobar tu historia**:
  ```bash
  git log --oneline -30 | grep -vcE '^[a-f0-9]+ (feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert)'
  ```
  Cuenta cuántos commits **no** cumplen.

## 📚 Recursos Adicionales

- [Conventional Commits 1.0.0](https://www.conventionalcommits.org/es/v1.0.0/)
- [Semantic Versioning 2.0.0](https://semver.org/lang/es/)
- [Angular Commit Message Format](https://github.com/angular/angular/blob/main/CONTRIBUTING.md#commit)

## ✅ Checklist de Verificación

- [ ] Tus últimos 10 commits cumplen la convención
- [ ] Sabes marcar un breaking change de las dos formas
- [ ] Sabes escribir cuerpo y footers, y para qué sirve cada footer
- [ ] Si usas squash, validas el **título del PR**
