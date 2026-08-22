# Práctica 03 — CODEOWNERS y Definition of Done

> Escribes quién revisa cada área y qué significa "hecho" en tu proyecto. Las
> dos cosas donde se pueden leer: en el repositorio y en cada PR.

**Duración estimada**: 40 min
**Prerrequisitos**: [Teoría 06](../1-teoria/06-codeowners.md) y [07](../1-teoria/07-definition-of-done.md)

## Contexto

Tienes un `CODEOWNERS` mínimo desde la Semana 02. Ahora que hay áreas reales en
tu dominio, toca convertirlo en un mapa de conocimiento, y escribir la DoD que
la Semana 08 hará obligatoria con un ruleset.

## Paso 1: Estructurar el código por áreas

**Por qué**: `CODEOWNERS` enruta por ruta. Sin estructura, no hay nada que
enrutar.

```bash
cd <tu-repo>
mkdir -p src/prestamos src/socios src/catalogo   # adapta a TU dominio

git mv src/index.js src/prestamos/index.js 2>/dev/null || true
cat > src/socios/index.js <<'EOF'
// Reglas de negocio del área de socios.
function puedePrestar(socio) {
  return socio.activo === true && (socio.multasPendientes ?? 0) === 0;
}
module.exports = { puedePrestar };
EOF

git add -A
git commit -qm "refactor: organiza el código por áreas del dominio"
```

**Verifica**:

```bash
git ls-files src/ | head
```

## Paso 2: `CODEOWNERS` por área

**Por qué**: de lo general a lo específico, porque **gana la última regla que
coincide**.

```bash
cat > .github/CODEOWNERS <<'EOF'
# Gana la ÚLTIMA regla que coincide, no la más específica.
# Por eso el orden va de lo general a lo específico.

# Dueño por defecto de todo el repositorio
*                        @<tu-usuario>

# Áreas del dominio
/src/prestamos/          @<tu-usuario>
/src/socios/             @<tu-usuario>
/src/catalogo/           @<tu-usuario>

# Documentación
/docs/                   @<tu-usuario>
*.md                     @<tu-usuario>

# Infraestructura: lo más sensible, al final para que gane
/.github/workflows/      @<tu-usuario>
/.github/CODEOWNERS      @<tu-usuario>
/.githooks/              @<tu-usuario>
EOF

git add .github/CODEOWNERS
git commit -qm "chore: enruta revisores por área del dominio"
git push -q
```

**Verifica** — este es el paso que casi nadie hace y que evita fallos
silenciosos:

```bash
gh api repos/{owner}/{repo}/codeowners/errors --jq '.errors'
# []
```

## Paso 3: Comprobar la regla de precedencia

**Por qué**: verlo una vez evita una hora de desconcierto en el futuro.

Según tu archivo, ¿quién es el dueño de `src/prestamos/README.md`?

- Coincide con `*` (línea 1)
- Coincide con `/src/prestamos/`
- Coincide con `*.md` — **y es la última**

Gana `*.md`. Si querías que lo llevara el dueño del área, `*.md` tendría que ir
**antes** que las reglas de `/src/`.

**Verifica**: reordena tu archivo si el resultado no es el que quieres, y vuelve
a comprobar los errores.

## Paso 4: Escribir la Definition of Done

**Por qué**: es lo que responde "¿esto ya está?" sin discusión.

```bash
cat >> CONTRIBUTING.md <<'EOF'

## Definition of Done

Un cambio está terminado cuando:

- [ ] Cumple los criterios de aceptación del issue
- [ ] Tiene tests que fallarían si la lógica se rompe
- [ ] CI en verde *(automático)*
- [ ] Título del PR con Conventional Commits *(automático)*
- [ ] Documentación actualizada si cambia el comportamiento visible
- [ ] Revisado por alguien distinto del autor
- [ ] Sin secretos, claves ni datos personales en el diff

Los puntos marcados como *(automático)* los comprueba CI: no hace falta
verificarlos a mano.

Esto es transversal a todo el proyecto. Lo específico de cada trabajo son los
**criterios de aceptación** del issue.
EOF

git add CONTRIBUTING.md
git commit -qm "docs: añade la Definition of Done del proyecto"
```

**Verifica**: siete puntos, todos comprobables. Ninguno dice "código de calidad".

## Paso 5: Llevar la DoD a la plantilla de PR

**Por qué**: una DoD que hay que ir a buscar no se usa.

```bash
cat > .github/pull_request_template.md <<'EOF'
## Qué cambia

<!-- Una o dos frases. -->

## Por qué

<!-- Fixes #N -->

## Cómo probarlo

```bash
node --test
```

## Notas para quien revise

<!-- Decisiones dudosas, alternativas descartadas, dónde mirar primero. -->

---

### Definition of Done

- [ ] Cumple los criterios de aceptación del issue
- [ ] Tiene tests que fallarían si la lógica se rompe
- [ ] Documentación actualizada si cambia el comportamiento visible
- [ ] Sin secretos ni datos personales en el diff

> CI y convención del título se comprueban automáticamente.
EOF

git add .github/pull_request_template.md
git commit -qm "docs: integra la Definition of Done en la plantilla de PR"
git push -q
```

**Verifica**:

```bash
gh api repos/{owner}/{repo}/contents/.github/pull_request_template.md \
  --jq '.content | @base64d' | grep -c "Definition of Done"
# 1
```

## Paso 6: Probarlo con un PR real

**Por qué**: comprobar que la plantilla se precarga y que `CODEOWNERS` enruta.

```bash
git switch -qc feat/validar-socio
cat >> src/socios/index.js <<'EOF'

function tieneMultasPendientes(socio) {
  return (socio.multasPendientes ?? 0) > 0;
}
module.exports.tieneMultasPendientes = tieneMultasPendientes;
EOF
git commit -qam "feat(socios): añade comprobación de multas pendientes"
git push -qu origin HEAD
gh pr create --fill
gh pr view --json reviewRequests,body --jq '{revisores: .reviewRequests, dod: (.body | contains("Definition of Done"))}'
```

**Verifica**: la plantilla aparece precargada con la DoD.

> [!NOTE]
> Si eres el único dueño y también el autor, GitHub **no** se pide revisión a sí
> mismo: `reviewRequests` saldrá vacío. El enrutado se demuestra con
> `codeowners/errors` vacío y con un segundo colaborador.

## Paso 7: Documentar el proceso de review

**Por qué**: cierra las reglas de la semana.

```bash
cat >> CONTRIBUTING.md <<'EOF'

## Proceso de review

- **Tamaño**: por debajo de 400 líneas. CI avisa si te pasas.
- **Primera respuesta**: en menos de un día laborable.
- **Severidad en los comentarios**: `bloqueante:`, `sugerencia:`, `nit:`.
- **`Request changes`** solo para problemas reales, nunca para preferencias de
  estilo (para eso está el linter).
- **Desacuerdos**: dos rondas de comentarios; si no hay acuerdo, se habla en
  directo y la conclusión vuelve escrita al PR.
- **Qué no se revisa a mano**: formato, orden de imports, tipos y tests. Eso lo
  comprueba CI.
EOF

git add CONTRIBUTING.md
git commit -qm "docs: documenta el proceso de code review"
git push -q
gh pr merge --squash --delete-branch
```

## ✅ Resultado

- [ ] Código organizado por áreas del dominio
- [ ] `CODEOWNERS` por área, de lo general a lo específico
- [ ] `codeowners/errors` devuelve `[]`
- [ ] DoD de 7 puntos, todos comprobables, en `CONTRIBUTING.md`
- [ ] DoD integrada en la plantilla de PR
- [ ] Proceso de review documentado

## 🧯 Si algo sale mal

| Síntoma | Causa | Solución |
|---------|-------|----------|
| `Unknown owner` | El usuario no tiene acceso | Corrige el nombre o dale acceso |
| El dueño no es el que esperabas | Gana la última regla, no la más específica | Reordena |
| La plantilla no se precarga | No está en la rama por defecto | Push a `main` |
| `reviewRequests` vacío | Eres autor y dueño a la vez | Es correcto |
| `codeowners/errors` da 404 | El archivo no existe en esa rama | Comprueba la ruta |
