# Práctica 02 — `.gitattributes` y CODEOWNERS

> Vas a arreglar el problema de los finales de línea antes de tenerlo, sacar los
> archivos generados de las estadísticas y enrutar revisores por ruta.

**Duración estimada**: 45 min
**Prerrequisitos**: [Teoría 01](../1-teoria/01-anatomia-de-un-repo.md) y [05](../1-teoria/05-gitignore-y-gitattributes.md)

## Contexto

Un compañero en Windows abre un PR y el diff muestra 400 líneas cambiadas en un
archivo que solo tocó una. Es CRLF contra LF. Se arregla en dos líneas, pero solo
si sabes que existe `.gitattributes`.

## Paso 1: Ver el problema antes de resolverlo

**Por qué**: conviene ver el síntoma una vez para reconocerlo después.

```bash
cd <tu-repo>
printf 'linea uno\r\nlinea dos\r\n' > crlf-demo.txt
git add crlf-demo.txt
git commit -qm "chore: archivo de demostración con CRLF"
git show HEAD --stat
file crlf-demo.txt
# ... with CRLF line terminators
```

**Verifica**:

```bash
git show HEAD:crlf-demo.txt | od -c | grep -c '\\r'
# > 0 : el CRLF está dentro del repositorio
```

## Paso 2: Normalizar con `.gitattributes`

**Por qué**: el repositorio guarda LF y cada máquina hace checkout con lo suyo.

```bash
cat > .gitattributes <<'EOF'
# Normaliza finales de línea: LF en el repositorio
* text=auto

# Estos SIEMPRE en LF: se ejecutan en runners Linux
*.sh  text eol=lf
*.yml text eol=lf
*.yaml text eol=lf

# Binarios: sin conversión ni diff textual
*.png binary
*.jpg binary
*.pdf binary
EOF

git add .gitattributes
git commit -qm "chore: normaliza finales de línea con .gitattributes"
```

Aplica la normalización a lo que ya estaba dentro:

```bash
git add --renormalize .
git status --short
git commit -qm "chore: renormaliza finales de línea del contenido existente"
```

**Verifica**:

```bash
git check-attr -a crlf-demo.txt
# crlf-demo.txt: text: auto
git show HEAD:crlf-demo.txt | od -c | grep -c '\\r'
# 0
```

Limpia la demo:

```bash
git rm -q crlf-demo.txt && git commit -qm "chore: elimina el archivo de demostración"
```

## Paso 3: Sacar los generados de las estadísticas

**Por qué**: un repositorio que dice ser "78% HTML" por una carpeta de cobertura
transmite lo contrario de lo que hace.

```bash
cat >> .gitattributes <<'EOF'

# Fuera de las estadísticas de lenguaje y colapsados en el diff
dist/*       linguist-generated=true
coverage/*   linguist-generated=true
*.lock       linguist-generated=true
docs/*       linguist-documentation=true
EOF

git commit -qam "chore: marca generados y documentación para linguist"
git push -q
```

**Verifica**:

```bash
gh api repos/{owner}/{repo}/languages
# los porcentajes deben reflejar tu código real (tarda unos minutos en recalcularse)
```

## Paso 4: `CODEOWNERS`

**Por qué**: sin él, un cambio en `.github/workflows/` puede mergearse sin que lo
vea nadie que entienda de CI.

```bash
mkdir -p .github
cat > .github/CODEOWNERS <<'EOF'
# Gana la ÚLTIMA regla que coincide, no la más específica.

# Dueño por defecto
*                     @<tu-usuario>

# Reglas de negocio del dominio
/src/                 @<tu-usuario>

# Infraestructura: nada entra aquí sin revisión
/.github/workflows/   @<tu-usuario>
/.github/CODEOWNERS   @<tu-usuario>
EOF

git add .github/CODEOWNERS
git commit -qm "chore: enruta revisores con CODEOWNERS"
git push -q
```

**Verifica**:

```bash
gh api repos/{owner}/{repo}/codeowners/errors --jq '.errors'
# []
```

Un array vacío significa que todos los usuarios y rutas son válidos. Si aparece
`Unknown owner`, ese usuario no tiene acceso al repositorio.

## Paso 5: Comprobar que enruta de verdad

**Por qué**: `CODEOWNERS` se ignora en silencio cuando está mal.

```bash
git switch -c test/codeowners
mkdir -p .github/workflows
echo "# workflow de prueba" > .github/workflows/prueba.yml
git add . && git commit -qm "chore: prueba de enrutado de CODEOWNERS"
git push -qu origin test/codeowners
gh pr create --fill
gh pr view --json reviewRequests --jq '.reviewRequests'
```

> [!NOTE]
> Si eres el único dueño y también el autor del PR, GitHub **no** se pide review
> a sí mismo. El enrutado se demuestra de verdad con un segundo usuario, o
> confiando en el endpoint de `codeowners/errors`.

Limpia:

```bash
gh pr close --delete-branch
git switch main
```

## Paso 6: `.git-blame-ignore-revs`

**Por qué**: en cuanto pases un formateador sobre todo el repo, `blame` deja de
servir. Se previene ahora.

```bash
cat > .git-blame-ignore-revs <<'EOF'
# Commits de formateo masivo, sin cambios funcionales.
# Añade aquí el SHA completo de cada reformateo.
EOF

git config blame.ignoreRevsFile .git-blame-ignore-revs
git add .git-blame-ignore-revs
git commit -qm "chore: prepara la lista de revisiones ignoradas por blame"
git push -q
```

**Verifica**:

```bash
git config --get blame.ignoreRevsFile
# .git-blame-ignore-revs
```

## ✅ Resultado

- [ ] `.gitattributes` con `text=auto` y reglas de `eol=lf`
- [ ] Generados y documentación marcados para `linguist`
- [ ] `CODEOWNERS` presente y con `errors` vacío
- [ ] `.git-blame-ignore-revs` creado y configurado
- [ ] `git check-attr -a` devuelve lo esperado en tus archivos

## 🧯 Si algo sale mal

| Síntoma | Causa | Solución |
|---------|-------|----------|
| `Unknown owner` en los errores | El usuario no existe o no tiene acceso | Corrige el nombre o dale acceso |
| `--renormalize` no cambia nada | No había CRLF que arreglar | Correcto, sigue |
| Diff enorme tras renormalizar | Es el efecto esperado, una sola vez | Commit aparte y explícalo en el mensaje |
| Los porcentajes de lenguaje no cambian | Se recalculan de forma diferida | Espera unos minutos |
| `CODEOWNERS` no pide review | Eres el autor, o no hay ruleset que lo exija | Semana 08: ruleset con *require review from Code Owners* |
