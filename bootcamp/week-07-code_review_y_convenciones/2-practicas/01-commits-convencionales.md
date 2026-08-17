# Práctica 01 — Commits convencionales

> Adoptas la convención, la escribes en `CONTRIBUTING.md` y la haces cumplir con
> un hook que se comparte con el repositorio.

**Duración estimada**: 45 min
**Prerrequisitos**: [Teoría 02](../1-teoria/02-conventional-commits.md)

## Contexto

Los hooks de `.git/hooks` no se clonan: si escribes el hook ahí, solo funciona
en tu máquina. Vamos a hacerlo versionado, para que cualquiera que clone el repo
lo tenga.

## Paso 1: Medir tu historia actual

**Por qué**: saber de dónde partes.

```bash
cd <tu-repo>
REGEX='^[a-f0-9]+ (feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert)(\([a-z0-9-]+\))?!?: '
TOTAL=$(git log --oneline -50 | wc -l)
MALOS=$(git log --oneline -50 | grep -vcE "$REGEX")
echo "$MALOS de $TOTAL commits no cumplen la convención"
```

**Verifica**: tienes un número de partida.

## Paso 2: El hook versionado

**Por qué**: `.git/hooks` no se versiona; `.githooks/` sí.

```bash
mkdir -p .githooks
cat > .githooks/commit-msg <<'EOF'
#!/usr/bin/env bash
# Valida que el mensaje siga Conventional Commits.
# Se activa con: git config core.hooksPath .githooks

regex='^(feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert)(\([a-z0-9-]+\))?!?: .{1,72}$'
primera=$(head -1 "$1")

# Los merges y los revert automáticos no siguen la convención
case "$primera" in
  "Merge "*|"Revert "*|fixup!*|squash!*) exit 0 ;;
esac

if ! printf '%s' "$primera" | grep -qE "$regex"; then
  cat >&2 <<'MSG'
❌ Mensaje de commit no convencional.

Formato:  tipo(scope): descripción
Tipos:    feat fix docs style refactor perf test build ci chore revert
Reglas:   imperativo, minúscula, sin punto final, máximo 72 caracteres

Ejemplos:
  feat(prestamos): calcula la multa por retraso
  fix(socios)!: cambia el formato del identificador
MSG
  exit 1
fi
EOF

chmod +x .githooks/commit-msg
git config core.hooksPath .githooks
```

**Verifica**:

```bash
git config --get core.hooksPath
# .githooks
```

## Paso 3: Probar que rechaza

**Por qué**: un hook que no has visto fallar no sabes si funciona.

```bash
echo "prueba" >> README.md
git add README.md
git commit -m "arreglos varios" || echo "✅ rechazado correctamente"
git commit -m "feat(docs): añade nota de prueba a README"
```

**Verifica**: el primer intento falla con el mensaje de ayuda; el segundo pasa.

## Paso 4: Probar los casos especiales

**Por qué**: un hook demasiado estricto se acaba desactivando.

```bash
git commit --allow-empty -m "Merge branch 'main'"           # debe pasar
git commit --allow-empty -m "fix!: rompe el formato de fecha" # debe pasar
git commit --allow-empty -m "Feat: mayúscula" || echo "✅ rechazado"
git reset --hard HEAD~2 2>/dev/null || true
```

**Verifica**: merges y `!` pasan; la mayúscula se rechaza.

## Paso 5: Documentar la convención

**Por qué**: el hook obliga; el documento explica.

Añade a `CONTRIBUTING.md`:

```markdown
## Convención de commits

Este repositorio usa [Conventional Commits](https://www.conventionalcommits.org/es/v1.0.0/).

\`\`\`
<tipo>(<scope>)<!>: <descripción>
\`\`\`

| Tipo | Cuándo | SemVer |
|------|--------|:------:|
| `feat` | Funcionalidad nueva | MINOR |
| `fix` | Corrección de un fallo | PATCH |
| `docs` | Solo documentación | — |
| `refactor` | Reestructurar sin cambiar comportamiento | — |
| `test` | Tests | — |
| `chore` | Mantenimiento | — |

**Breaking changes**: `feat!:` o `BREAKING CHANGE:` en el footer. Fuerza MAJOR.

**Scope**: el área del dominio (`prestamos`, `socios`), no el archivo.

### Activar la validación local

\`\`\`bash
git config core.hooksPath .githooks
\`\`\`

> Con squash merge, lo que llega a `main` es el **título del PR**. Se valida
> automáticamente en CI.
```

```bash
git add CONTRIBUTING.md .githooks/commit-msg
git commit -qm "docs: adopta Conventional Commits y añade hook de validación"
```

**Verifica**: el propio commit cumple la convención.

## Paso 6: Aviso al clonar

**Por qué**: `core.hooksPath` es configuración local; quien clone no la tendrá.

Añade a `CONTRIBUTING.md`, en la sección de primeros pasos:

```markdown
### Primer clonado

\`\`\`bash
git clone https://github.com/<tu-usuario>/<tu-repo>.git
cd <tu-repo>
git config core.hooksPath .githooks   # ← activa la validación de commits
\`\`\`
```

```bash
git commit -qam "docs: documenta la activación de los hooks tras clonar"
git push -q
```

**Verifica**:

```bash
gh api repos/{owner}/{repo}/contents/.githooks/commit-msg --jq .type
# "file"
```

## Paso 7: Comprobar la mejora

```bash
git log --oneline -10 | grep -vcE "$REGEX"
# 0 en los commits nuevos
```

**Verifica**: los commits desde que activaste el hook cumplen todos.

## ✅ Resultado

- [ ] `.githooks/commit-msg` versionado y ejecutable
- [ ] `core.hooksPath` configurado
- [ ] El hook rechaza mensajes malos y deja pasar merges y `!`
- [ ] Convención documentada en `CONTRIBUTING.md`
- [ ] Instrucción de activación tras clonar
- [ ] Tus últimos 10 commits cumplen

## 🧯 Si algo sale mal

| Síntoma | Causa | Solución |
|---------|-------|----------|
| El hook no se ejecuta | Falta `core.hooksPath` o el permiso de ejecución | `git config core.hooksPath .githooks && chmod +x .githooks/*` |
| Rechaza mensajes válidos | La regex no contempla tu caso | Ajústala; los merges ya están exentos |
| Bloquea un rebase | `fixup!` y `squash!` están exentos | Comprueba que los `case` del hook estén |
| Necesitas saltártelo puntualmente | Emergencia real | `git commit --no-verify`, y usa con moderación |
| En Windows falla | Fin de línea CRLF en el hook | `*.sh text eol=lf` en `.gitattributes` (Semana 02) |
