# Proyecto Semana 01 — Tu repositorio hilo conductor

> Al terminar existe el repositorio que vas a construir durante las 21 semanas:
> público, con identidad criptográfica y con tu perfil de GitHub presentable.

## 🎯 Objetivo

Crear el repositorio base de tu proyecto, con commits firmados desde el primer
día, y publicar tu perfil README.

## 📦 Qué añade esta capa

Es la capa cero: no hay nada previo. Todo lo demás —issues, project, rulesets,
CI, releases, seguridad— se monta encima de este repositorio. Por eso importa
arrancarlo bien: cambiar de repo en la semana 12 significa perder el histórico
de issues y PRs, que es la mitad del valor del portafolio.

Lee [`docs/proyecto-hilo-conductor.md`](../../../docs/proyecto-hilo-conductor.md)
antes de empezar.

## 🧭 Paso 0: elige tu dominio

Tu repositorio necesita un dominio concreto que te dure 21 semanas: biblioteca,
gimnasio, cine, farmacia, taller, hotel, lo que quieras. La única regla es que
puedas inventar issues creíbles, porque vas a escribir docenas.

Escríbelo en la descripción del repo. Es tu contrato contigo mismo.

## 🛠️ Cómo crearlo

```bash
gh repo create <tu-repo> --public --clone \
  --description "Gestión de <tu dominio> — proyecto del Bootcamp GitHub"
cd <tu-repo>

git switch -c main 2>/dev/null || git switch main
```

Añade algo de código: no es un bootcamp de programación, pero CI, CodeQL y los
releases necesitan algo que morder. Con esto basta:

```bash
mkdir -p src
cat > src/index.js <<'EOF'
// Reglas de negocio de <tu dominio>
function calcularX(entrada) {
  if (entrada <= 0) return 0;
  return entrada * 300;
}
module.exports = { calcularX };
EOF

echo "# <Tu dominio>" > README.md
git add . && git commit -m "feat: primeras reglas de negocio del dominio"
git push -u origin main
```

Haz al menos **tres commits firmados** — pequeños y con mensajes decentes, no
tres commits vacíos seguidos.

Y publica tu **perfil README**: un repositorio con el mismo nombre que tu
usuario, cuyo `README.md` se muestra en tu perfil.

```bash
gh repo create <tu-usuario> --public --clone --add-readme
```

## ✅ Requisitos verificables

Estos son exactamente los que comprueba `checks.json`:

1. [ ] El repositorio existe y es público
2. [ ] Tiene una descripción de más de 10 caracteres
3. [ ] Su rama por defecto se llama `main`
4. [ ] Tiene al menos 3 commits firmados (`verified`)
5. [ ] Tu perfil README existe (repositorio `<tu-usuario>/<tu-usuario>`)

## 🎨 Criterios de calidad

Lo que la API no ve y sí evalúa la rúbrica:

- La descripción dice **qué** es el proyecto, no "repo del bootcamp"
- Los mensajes de commit siguen el imperativo y explican el cambio
- El código, por mínimo que sea, es coherente con el dominio elegido
- El perfil README tiene contenido real: quién eres, qué haces, en qué trabajas.
  Un README de perfil vacío es peor que no tenerlo
- No hay ningún secreto, email personal no deseado ni ruta local en el historial

## 💡 Adaptación a tu dominio

| Dominio | Nombre de repo | Primera regla de negocio |
|---------|----------------|--------------------------|
| 📖 Biblioteca | `biblioteca-api` | `calcularMulta(diasRetraso)` |
| 🏋️ Gimnasio | `gestion-gimnasio` | `puedeReservar(socio, clase)` |
| 🎥 Cine | `cartelera` | `asientoDisponible(sala, butaca)` |
| 💊 Farmacia | `inventario-farmacia` | `estaPorVencer(lote, hoy)` |

## 🚦 Cómo entregarlo

```bash
./scripts/verificar-semana.sh 01 --repo <tu-usuario>/<tu-repo>
```

Guárdalo para no repetirlo cada semana:

```bash
echo "REPO=<tu-usuario>/<tu-repo>" > ~/.bc-github
```

## 🧯 Errores comunes

| Error | Por qué pasa | Solución |
|-------|--------------|----------|
| Commits sin `verified` | La firma no estaba activa al commitear | `git commit --amend --no-edit` y `push --force-with-lease` (rama tuya, sin PRs abiertos) |
| Rama `master` en vez de `main` | `init.defaultBranch` sin configurar | `git branch -m master main && git push -u origin main`, y cambia la rama por defecto en Settings |
| Repo privado | Se creó sin `--public` | `gh repo edit --visibility public --accept-visibility-change-consequences` |
| El perfil README no se ve | El nombre del repo no coincide **exactamente** con tu usuario | Renómbralo; distingue mayúsculas |
| Descripción vacía | Se omitió `--description` | `gh repo edit --description "..."` |
