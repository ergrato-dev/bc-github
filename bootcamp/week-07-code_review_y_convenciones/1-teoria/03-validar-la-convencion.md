# Validar la convención automáticamente

> Una convención que depende de que la gente se acuerde no es una convención: es
> una intención. Lo que la sostiene es una comprobación que falla.

## 🎯 Objetivos

- Validar el mensaje de commit en local con un hook compartido por el repositorio
- Validar el **título del PR**, que es lo que cuenta si mergeas con squash
- Elegir entre una expresión regular propia y una herramienta hecha
- Convertir la validación en un check obligatorio
- Escribir mensajes de error que digan qué hacer

## 1. Qué problema resuelve

La convención de la [Teoría 02](02-conventional-commits.md) solo sirve si se
cumple **siempre**: un changelog generado a partir de commits donde el 20 % no
cumple no es un changelog, es una lista incompleta.

Y hay un detalle que decide dónde poner la validación: **con squash merge, lo que
llega a `main` es el título del PR**. Validar commits locales está bien para la
higiene diaria, pero lo que acaba en la historia es el título.

| Estrategia de merge | Qué hay que validar |
|---------------------|---------------------|
| Squash | El **título del PR** |
| Merge commit | Cada commit de la rama |
| Rebase | Cada commit de la rama |

## 2. Hook local: la primera barrera

Un hook `commit-msg` de diez líneas, sin instalar nada:

```bash
#!/usr/bin/env bash
# .githooks/commit-msg
regex='^(feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert)(\([a-z0-9-]+\))?!?: .{1,72}$'

if ! head -1 "$1" | grep -qE "$regex"; then
  cat >&2 <<'AYUDA'
✖ El mensaje no cumple Conventional Commits.

  Formato:  tipo(scope): descripción
  Tipos:    feat fix docs style refactor perf test build ci chore revert
  Ejemplo:  feat(prestamos): calcula la multa por retraso

  Rompe compatibilidad:  feat(api)!: cambia el formato de respuesta
AYUDA
  exit 1
fi
```

**Los hooks de `.git/hooks` no se clonan.** Para que el equipo los tenga, viven
en el repositorio y se apuntan con una configuración:

```bash
git config core.hooksPath .githooks
chmod +x .githooks/commit-msg
```

Esa línea de `git config` hay que ejecutarla una vez por clon: ponla en el
`CONTRIBUTING.md` y, si tienes un script de arranque, ahí.

> [!IMPORTANT]
> Un hook local es una **ayuda**, no un control: se salta con `--no-verify`, y
> quien clone y no configure `core.hooksPath` no lo tiene. La comprobación que
> manda es la de CI, porque nadie puede saltársela.

## 3. Validar el título del PR en CI

```yaml
name: Convención

on:
  pull_request:
    types: [opened, edited, synchronize, reopened]

permissions:
  contents: read

jobs:
  titulo:
    runs-on: ubuntu-latest
    timeout-minutes: 5
    steps:
      - name: Comprobar el título del PR
        env:
          TITULO: ${{ github.event.pull_request.title }}
        run: |
          regex='^(feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert)(\([a-z0-9-]+\))?!?: .{1,72}$'
          if ! printf '%s' "$TITULO" | grep -qE "$regex"; then
            echo "::error::El título del PR no cumple Conventional Commits: $TITULO"
            exit 1
          fi
```

Tres detalles que importan más de lo que parecen:

- **`types: [edited]`** es imprescindible: sin él, corriges el título y el check
  sigue en rojo
- **El título va por `env:`**, nunca interpolado dentro del `run:`. Un título con
  comillas o con `$(...)` sería ejecución de comandos en tu runner — la inyección
  que se estudia a fondo en la Semana 09
- **`::error::`** hace que el mensaje salga destacado en la interfaz del run

## 4. Herramientas hechas

| Opción | Qué aporta | Coste |
|--------|------------|-------|
| Expresión regular propia | Cero dependencias, control total | La mantienes tú |
| `commitlint` | Reglas configurables, mensajes buenos, ecosistema | Node y configuración |
| Una action de terceros | Un paso y listo | Dependencia externa que hay que pinnear |

Para un repositorio personal, la expresión regular sobra y no envejece. En un
equipo con reglas más finas (scopes permitidos, longitud del cuerpo,
mayúsculas), `commitlint` con su configuración convencional ahorra tiempo.

```bash
# .commitlintrc.json
{ "extends": ["@commitlint/config-conventional"] }
```

Sea cual sea, si es de terceros: **fíjala por SHA** con el tag en comentario
(Semana 11).

## 5. Hacerlo obligatorio

Un check que se puede ignorar no valida nada. El paso final es marcarlo como
**check obligatorio** en el ruleset de `main` (Semana 08): el PR deja de poder
mergearse hasta que esté en verde.

Y el nombre que se exige en el ruleset es el del **job**, no el del workflow:

```bash
gh pr checks 42 --json name,state
```

De ahí sale el nombre exacto que hay que escribir en el ruleset.

## 6. Qué hacer con la historia anterior

Adoptar la convención no obliga a reescribir el pasado — y **no deberías**
reescribir historia publicada
([Semana 01, Teoría 02](../../week-01-git_repaso_y_setup_pro/1-teoria/02-reescribir-historia.md)).

Lo razonable: la convención aplica **desde hoy**, el changelog se genera desde la
primera etiqueta que la cumple, y se anota en `CONTRIBUTING.md` desde cuándo rige.

```bash
# ¿Cuántos de los últimos 30 commits no cumplen?
git log --oneline -30 \
  | grep -vcE '^[a-f0-9]+ (feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert)'
```

## 7. Antipatrones

| Antipatrón | Por qué duele | Qué hacer |
|------------|---------------|-----------|
| Validar commits y mergear con squash | Validas lo que no llega a `main` | Valida el título del PR |
| Hook sin `types: [edited]` en el workflow | Corriges el título y sigue en rojo | Añádelo |
| Interpolar `${{ github.event.pull_request.title }}` en el `run:` | Inyección de comandos | Pásalo por `env:` |
| Check no obligatorio | Se mergea igual y nadie se entera | Ruleset con check requerido |
| Solo hook local | Se salta con `--no-verify` | CI además del hook |
| Mensaje de error sin ejemplo | Quien lo recibe no sabe qué escribir | Formato, tipos y un ejemplo |
| Reescribir la historia para "adaptarla" | Rompes clones y enlaces por cosmética | Desde hoy en adelante |
| Regex distinta en el hook y en CI | Pasa en local y falla en CI | Una sola fuente, o cópiala con cuidado |

## 8. Trucos

- **Misma expresión regular en los dos sitios**: guárdala en un archivo
  (`.githooks/regex.txt`) y léela desde ambos para que no se separen
- **Plantilla de mensaje**: `git config commit.template .gitmessage` precarga la
  estructura en el editor
- **`git commit --fixup`** genera un mensaje que ya cumple
- **Autocorrección barata**: si el título del PR es lo que cuenta, la CLI puede
  arreglarlo sin abrir el navegador — `gh pr edit 42 --title "fix(api): ..."`
- **Comprueba el nombre del check** con `gh pr checks` antes de escribirlo en el
  ruleset: adivinarlo es el error más común de la Semana 08
- **Prueba el workflow con `workflow_dispatch`** mientras lo escribes, para no
  abrir cinco PRs de prueba

## 📚 Recursos Adicionales

- [Conventional Commits 1.0.0](https://www.conventionalcommits.org/es/v1.0.0/)
- [`commitlint`](https://commitlint.js.org/)
- [Pro Git — Git Hooks](https://git-scm.com/book/es/v2/Personalización-de-Git-Git-Hooks)
- [GitHub Docs — Workflow commands (`::error::`)](https://docs.github.com/actions/reference/workflows-and-actions/workflow-commands)

## ✅ Checklist de Verificación

- [ ] Tienes un hook `commit-msg` en el repositorio, no solo en tu `.git/`
- [ ] Un workflow valida el título del PR, con `types: [edited]`
- [ ] El título nunca se interpola dentro del `run:`
- [ ] Sabes qué nombre exacto tendrá que exigir el ruleset
- [ ] El mensaje de error explica el formato y da un ejemplo
