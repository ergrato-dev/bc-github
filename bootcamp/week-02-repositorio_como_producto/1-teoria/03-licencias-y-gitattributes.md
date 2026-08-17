# Licencias, `.gitignore` y `.gitattributes`

> Sin licencia, tu código público es "todos los derechos reservados": nadie
> puede usarlo legalmente, ni siquiera para aprender.

## 🎯 Objetivos

- Elegir una licencia con criterio y saber qué obliga
- Escribir un `.gitignore` que no arrastre basura ni oculte lo importante
- Usar `.gitattributes` para EOL, `linguist` y diffs
- Enrutar revisores con `CODEOWNERS`

## 1. Qué problema resuelve

Tres archivos pequeños que deciden cosas grandes: quién puede usar tu código,
qué entra en la historia para siempre, y cómo se comporta Git con cada tipo de
archivo. Los tres se escriben una vez y se olvidan — por eso conviene escribirlos
bien.

## 2. Licencias

| Licencia | Puedes | Debes | Copyleft |
|----------|--------|-------|:--------:|
| **MIT** | Todo, incluido cerrar el código | Mantener el aviso de copyright | No |
| **Apache 2.0** | Todo | Aviso + declarar cambios; concede patentes | No |
| **BSD-3** | Todo | Aviso; no usar el nombre para promocionar | No |
| **GPL-3.0** | Todo | **Publicar los derivados con la misma licencia** | Fuerte |
| **AGPL-3.0** | Todo | Igual que GPL, **también si lo ofreces como servicio web** | Muy fuerte |
| **MPL-2.0** | Todo | Los archivos modificados siguen MPL | Por archivo |
| **CC BY-NC-SA 4.0** | Compartir y adaptar | Atribuir, no comercial, misma licencia | Contenido, no código |
| **Unlicense / CC0** | Todo | Nada | No |

Cómo decidir:

- **Quiero adopción máxima** → MIT o Apache 2.0. Apache si te preocupan las patentes.
- **Quiero que las mejoras vuelvan** → GPL-3.0. AGPL si el uso típico es SaaS.
- **Es material educativo, no software** → Creative Commons.
- **Es un proyecto de trabajo** → la que diga tu empresa. No la elijas tú.

> [!IMPORTANT]
> "Sin licencia" no significa "de dominio público": significa que el copyright
> por defecto aplica y **nadie tiene permiso para usarlo**. Un repo público sin
> LICENSE es un repo que nadie puede usar legalmente.

```bash
gh api repos/{owner}/{repo} --jq '.license.spdx_id'
```

Añadirla: `Add file → Create new file → LICENSE` y GitHub ofrece un selector con
plantillas.

## 3. `.gitignore`

Reglas prácticas:

- Ignora **artefactos**, no configuración. `node_modules/`, `dist/`, `*.log`
- **`.env` siempre**; `.env.example` nunca (`!.env.example`)
- Un `.gitignore` por proyecto, no uno global copiado de internet
- Lo específico de tu editor o tu SO va en tu **global**:
  ```bash
  git config --global core.excludesFile ~/.gitignore_global
  ```
- Lo temporal y personal de un repo concreto: `.git/info/exclude`, que no se
  commitea

Si un archivo ya está trackeado, añadirlo al `.gitignore` no lo saca:

```bash
git rm --cached archivo
```

Plantillas por lenguaje: [github/gitignore](https://github.com/github/gitignore).

## 4. `.gitattributes`

Es el archivo menos conocido y el que más problemas evita.

```gitattributes
# Normaliza finales de línea: LF en el repositorio, nativo al hacer checkout
* text=auto

# Archivos que siempre son LF, aunque el equipo trabaje en Windows
*.sh text eol=lf
*.yml text eol=lf

# Binarios: sin conversión ni diff textual
*.png binary
*.pdf binary

# Excluir generados de las estadísticas de lenguaje y colapsarlos en el diff
dist/*      linguist-generated=true
*.lock      linguist-generated=true

# Marcar documentación para que no cuente como código
docs/*      linguist-documentation=true

# Que el repo no se lleve archivos de desarrollo al exportar
.github/    export-ignore
```

| Atributo | Para qué |
|----------|----------|
| `text=auto` | Fin de la guerra CRLF/LF entre Windows y Linux |
| `eol=lf` | Fuerza LF (obligatorio en scripts que corren en runners Linux) |
| `binary` | Sin diff ni conversión |
| `linguist-generated` | Fuera de las estadísticas y colapsado en el diff del PR |
| `linguist-vendored` | Igual, para dependencias incluidas |
| `linguist-language=X` | Corrige la detección de lenguaje |
| `diff=<driver>` | Diffs con contexto de función para un lenguaje concreto |
| `export-ignore` | Excluye del tarball de release |

> [!TIP]
> Si tu repositorio dice que es 78% HTML por culpa de una carpeta `coverage/`,
> `linguist-generated=true` lo arregla.

## 5. `CODEOWNERS`

Enruta revisores por ruta. Puede vivir en la raíz, en `.github/` o en `docs/`.

```
# Dueños por defecto de todo el repo
*                   @tu-usuario

# Por área
/src/reglas/        @tu-usuario @otra-persona
/.github/workflows/ @equipo-plataforma
/docs/              @equipo-docs

# Por extensión
*.sql               @equipo-datos
```

- Gana la **última** regla que coincide, no la más específica.
- Sin un ruleset que exija review de code owners, es solo una sugerencia
  (lo haremos obligatorio en la Semana 08).
- Los equipos se escriben `@org/equipo` y deben tener acceso de escritura.

```bash
gh api repos/{owner}/{repo}/codeowners/errors --jq '.errors'
```

## 6. Antipatrones

| Antipatrón | Por qué duele | Qué hacer |
|------------|---------------|-----------|
| Repo público sin LICENSE | Nadie puede usarlo legalmente | Elige una |
| GPL en una librería para adopción amplia | Muchos equipos no pueden usarla | MIT o Apache |
| `.env` commiteado | Secretos públicos para siempre | `.gitignore` + rotar lo filtrado |
| `.gitignore` global con reglas del proyecto | El resto del equipo no las tiene | Reglas del proyecto en el repo |
| Sin `text=auto` en equipos mixtos | Diffs de archivos enteros por CRLF | `* text=auto` desde el día 1 |
| `CODEOWNERS` con usuarios sin acceso | Se ignora en silencio | Verifica con el endpoint de `errors` |

## 7. Trucos

- **Por qué se ignora un archivo**: `git check-ignore -v ruta/al/archivo`
- **Ver los atributos efectivos**: `git check-attr -a ruta/al/archivo`
- **Arreglar EOL de todo el repo tras añadir `.gitattributes`**:
  ```bash
  git add --renormalize .
  ```
- **Ignorar un reformateo masivo en `blame`**: crea `.git-blame-ignore-revs` con
  los SHAs y GitHub lo respeta automáticamente
- **Diffs de Markdown por párrafo**: `*.md diff=markdown` en `.gitattributes`
- **Comprobar la licencia detectada**: `gh api repos/{owner}/{repo} --jq .license`

## 📚 Recursos Adicionales

- [choosealicense.com](https://choosealicense.com/) — comparador oficial de GitHub
- [github/gitignore](https://github.com/github/gitignore) — plantillas
- [Pro Git — Attributes](https://git-scm.com/book/en/v2/Customizing-Git-Git-Attributes)
- [GitHub Docs — CODEOWNERS](https://docs.github.com/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners)

## ✅ Checklist de Verificación

- [ ] Tu repositorio tiene LICENSE y `gh api ... --jq .license.spdx_id` la detecta
- [ ] `.gitattributes` con `* text=auto` y los generados marcados
- [ ] `CODEOWNERS` sin errores según el endpoint de validación
- [ ] `git check-ignore -v` te explica cualquier archivo ignorado
