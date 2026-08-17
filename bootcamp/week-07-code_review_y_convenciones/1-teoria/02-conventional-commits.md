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

## 5. Relación con SemVer y el changelog

```
MAYOR . MENOR . PARCHE
  │       │       └── fix, perf
  │       └────────── feat
  └────────────────── BREAKING CHANGE
```

Herramientas como `release-please` o `semantic-release` leen los commits desde
la última etiqueta, calculan el incremento, generan el `CHANGELOG.md` y publican
la release. Todo eso lo montarás en la **Semana 12**; la convención de hoy es lo
que lo hace posible.

Por eso importa el `scope` y por eso importan los tipos: son la materia prima
del changelog.

## 6. Con squash merge, el título del PR es el commit

Es la consecuencia práctica más importante y la que más se pasa por alto.

Si tu repositorio usa **squash** (Semana 06), lo que acaba en `main` es el
**título del PR**, no tus mensajes de commit locales. Entonces:

- La convención tiene que aplicarse al **título del PR**
- Validar commits locales está bien, pero no es lo que cuenta
- Hay que validar el título del PR en CI (práctica 02)

Con merge commit o rebase, se valida cada commit. Con squash, el título del PR.

## 7. Antipatrones

| Antipatrón | Por qué duele | Qué hacer |
|------------|---------------|-----------|
| `chore` para todo | El changelog sale vacío | Elige el tipo real |
| Scope por archivo (`feat(index.js)`) | No dice nada al lector | Scope por área del dominio |
| Descripción en pasado (`añadió`) | Rompe la convención de Git | Imperativo: `añade` |
| Breaking change sin marcar | Rompes a los usuarios sin aviso | `!` y `BREAKING CHANGE:` |
| Un commit con `feat` y `fix` juntos | El changelog no puede clasificarlo | Dos commits |
| Validar commits pero mergear con squash | Se valida lo que no cuenta | Valida el título del PR |
| Descripción de 200 caracteres | Se corta en todas las vistas | ≤ 72, el resto al cuerpo |

## 8. Trucos

- **Hook local de 10 líneas**, sin instalar dependencias:
  ```bash
  cat > .git/hooks/commit-msg <<'EOF'
  #!/usr/bin/env bash
  regex='^(feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert)(\([a-z0-9-]+\))?!?: .{1,72}$'
  head -1 "$1" | grep -qE "$regex" || {
    echo "Mensaje no convencional. Formato: tipo(scope): descripción"; exit 1; }
  EOF
  chmod +x .git/hooks/commit-msg
  ```
- **Los hooks no se clonan**: `.git/hooks` no se versiona. Guárdalo en
  `.githooks/` y configura `git config core.hooksPath .githooks`
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
- [ ] Tienes un hook local que valida el formato
- [ ] Si usas squash, validas el **título del PR**
