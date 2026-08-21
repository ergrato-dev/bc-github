# Práctica 01 — Un README que se lee

> Vas a reescribir el README de tu repositorio con estructura de embudo y a
> comprobar, con datos, que el perfil de comunidad está al 100%.

**Duración estimada**: 50 min
**Prerrequisitos**: [Teoría 01](../1-teoria/01-anatomia-de-un-repo.md) y [02](../1-teoria/02-readme-y-documentacion.md), repo de la Semana 01

## Contexto

Tu repositorio tiene un `README.md` con el nombre del proyecto y poco más. Vamos
a convertirlo en la portada que decide si alguien se queda.

## Paso 1: Medir el punto de partida

**Por qué**: sin línea base no sabes si mejoraste.

```bash
cd <tu-repo>
gh api repos/{owner}/{repo}/community/profile \
  --jq '{salud: .health_percentage, faltan: [.files | to_entries[] | select(.value == null) | .key]}'
```

**Verifica**: anota el número. Al final de la práctica debe ser 100.

## Paso 2: Escribir el embudo

**Por qué**: el lector necesita saber qué es antes que cómo se instala.

Reescribe `README.md` con este orden:

```markdown
# <Nombre del proyecto>

Una frase: qué es y para quién. Sin "este proyecto pretende".

## El problema

Dos o tres frases sobre el dolor real de tu dominio. Sin tecnologías todavía.

## Cómo se ve

Un diagrama Mermaid o una captura.

## Empezar

\`\`\`bash
git clone https://github.com/<tu-usuario>/<tu-repo>.git
cd <tu-repo>
node src/index.js
\`\`\`

## Detalle

Reglas de negocio, decisiones, estructura de carpetas.

## Contribuir

Ver [CONTRIBUTING.md](CONTRIBUTING.md).

## Licencia

<Licencia elegida> — ver [LICENSE](LICENSE).
```

**Verifica**:

```bash
head -5 README.md
# en las 5 primeras líneas debe quedar claro qué hace el proyecto
```

## Paso 3: Badges que informan

**Por qué**: un badge responde una pregunta real. Los demás sobran.

```markdown
[![License](https://img.shields.io/github/license/<tu-usuario>/<tu-repo>)](LICENSE)
[![Last commit](https://img.shields.io/github/last-commit/<tu-usuario>/<tu-repo>)](../../commits/main)
[![Issues](https://img.shields.io/github/issues/<tu-usuario>/<tu-repo>)](../../issues)
```

Máximo cinco. El de CI lo añadirás en la Semana 09.

**Verifica**: abre el README en GitHub — todos los badges cargan y ninguno
apunta a otro repositorio.

## Paso 4: Metadatos del repositorio

**Por qué**: la descripción y los topics son cómo te encuentran.

```bash
gh repo edit \
  --description "Gestión de <tu dominio> — reglas de negocio y API" \
  --add-topic <tu-dominio> \
  --add-topic javascript \
  --add-topic bootcamp-github
```

**Verifica**:

```bash
gh api repos/{owner}/{repo} --jq '{descripcion: .description, topics: .topics}'
```

## Paso 5: Completar los archivos de comunidad

**Por qué**: son los que suben el perfil al 100% y los que responden preguntas
antes de que te las hagan.

```bash
mkdir -p .github
```

Crea `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md` y `SECURITY.md`. **Escríbelos**, no
los copies: un `CODE_OF_CONDUCT.md` sin correo de contacto no sirve de nada.

Plantilla de PR:

```bash
cat > .github/PULL_REQUEST_TEMPLATE.md <<'EOF'
## Qué cambia

## Por qué

## Cómo probarlo

## Checklist

- [ ] Probado en local
- [ ] Documentación actualizada si hacía falta
EOF
```

**Verifica**:

```bash
git add . && git commit -m "docs: completa la documentación de comunidad" && git push
gh api repos/{owner}/{repo}/community/profile --jq .health_percentage
# 100
```

## Paso 6: La prueba de los diez segundos

**Por qué**: es la única métrica que importa y no la da ninguna API.

Enséñale el README a alguien que no conozca el proyecto. Diez segundos. Pregunta:
¿qué hace esto? Si no lo sabe, vuelve al paso 2.

## ✅ Resultado

- [ ] `community/profile` devuelve 100
- [ ] El README sigue la estructura de embudo
- [ ] Máximo 5 badges y todos funcionan
- [ ] Descripción y 3+ topics configurados
- [ ] Alguien ajeno entiende el proyecto en 10 segundos

```bash
./scripts/verificar-semana.sh 02 --repo <tu-usuario>/<tu-repo>
```

## 🧯 Si algo sale mal

| Síntoma | Causa | Solución |
|---------|-------|----------|
| `health_percentage` se queda en 83 | Falta un archivo o está en una ruta no reconocida | Mira el array `faltan` del paso 1 |
| Badge con "invalid" | El repo es privado o el nombre está mal escrito | Revisa usuario/repo en la URL del badge |
| Los topics no se guardan | Van en minúscula y con guiones | `gh repo edit --add-topic mi-topic` |
| El perfil tarda en actualizarse | Se cachea unos minutos | Espera y repite la consulta |
