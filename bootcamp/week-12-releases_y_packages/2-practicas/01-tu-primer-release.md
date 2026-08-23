# Práctica 01 — Tu primer release

> Tu repositorio pasa de tener commits a tener **versiones**. Al terminar hay un
> `v1.0.0` publicado, con notas generadas desde los pull requests, y un candado
> que impide que nadie —tú incluido— cambie lo que hay dentro.

**Duración estimada**: 50 min
**Prerrequisitos**: [Teoría 01](../1-teoria/01-tag-release-y-version.md),
[02](../1-teoria/02-semver-en-la-practica.md) y
[03](../1-teoria/03-notas-de-release-automaticas.md); Semana 08 (ruleset con
pull request obligatorio) y Semana 11 completadas

## Contexto

Hasta ahora tu repositorio publicaba un sitio: el estado de `main`. Un release es
otra cosa — un punto congelado al que alguien puede volver, con un número que
dice cuánto cuesta actualizarse desde el anterior.

## Paso 1: Declarar cuál es tu API pública

**Por qué**: sin esa frase, cada discusión de versión se decide por intuición y
el `MAJOR` acaba llegando por sorpresa.

Añade al `README.md` de tu repositorio, cerca del principio:

```markdown
## Versionado

Este proyecto sigue [SemVer 2.0.0](https://semver.org/lang/es/). La API pública
son las funciones exportadas por `src/index.js` y los comandos de la CLI. Todo
lo demás es interno y puede cambiar en cualquier versión.
```

**Verifica** que quedó en el repositorio:

```bash
gh api repos/{owner}/{repo}/readme --jq '.content | @base64d' | grep -A3 '## Versionado'
```

## Paso 2: Configurar las categorías de las notas

**Por qué**: sin `.github/release.yml`, las notas salen en una lista plana donde
un cambio incompatible pesa lo mismo que una corrección de tipografía.

Las etiquetas tienen que ser las que ya usas desde la Semana 03. Comprueba
cuáles son antes de escribir el archivo:

```bash
gh label list --limit 30
```

```bash
cat > .github/release.yml <<'YAML'
changelog:
  exclude:
    labels:
      - sin-changelog
    authors:
      - dependabot
  categories:
    - title: ⚠️ Cambios incompatibles
      labels:
        - breaking-change
    - title: ✨ Novedades
      labels:
        - enhancement
    - title: 🐛 Correcciones
      labels:
        - bug
    - title: 📦 Dependencias
      labels:
        - dependencies
    - title: 🧹 Otros
      labels:
        - "*"
YAML

git add .github/release.yml
git commit -m "chore: configurar las categorías de las notas de release"
git push
```

**Verifica** que GitHub lo acepta —el archivo no se valida hasta que se usa— y
previsualiza lo que saldría:

```bash
gh api repos/{owner}/{repo}/releases/generate-notes \
  --method POST -f tag_name=v1.0.0 --jq .body
```

Este comando **no crea nada**. Si tus PR fusionados no llevan etiquetas, todo
caerá en «Otros»: es la señal de que la taxonomía de la Semana 03 no se está
aplicando.

## Paso 3: El tag anotado y firmado

**Por qué**: un tag ligero no tiene autor ni fecha propios. Si alguien lo mueve,
no queda rastro de quién ni cuándo.

```bash
git switch main && git pull
git tag -s v1.0.0 -m "v1.0.0 — primera versión estable"
git push origin v1.0.0
```

**Verifica** que es anotado y que la firma está:

```bash
git cat-file -t v1.0.0      # debe imprimir: tag
git tag -v v1.0.0 2>&1 | tail -3
```

> [!NOTE]
> Si `git tag -s` falla, la Semana 01 dejó la firma configurada solo para
> commits. `git config --global tag.gpgSign true` la aplica también a los tags.

## Paso 4: Crear el release

**Por qué**: `--verify-tag` convierte un error silencioso —crear el release desde
la rama, apuntando a un commit que se moverá— en un fallo inmediato.

```bash
gh release create v1.0.0 \
  --verify-tag \
  --generate-notes \
  --title "v1.0.0" \
  --latest
```

**Verifica** el objeto completo:

```bash
gh api repos/{owner}/{repo}/releases/latest \
  --jq '{tag_name, draft, prerelease, target_commitish, autor: .author.login, notas: (.body | length)}'
```

`draft` en `false`, `prerelease` en `false` y `notas` con algo más de cuarenta
caracteres. Si el cuerpo está vacío, el `--generate-notes` no encontró pull
requests: revisa que tus cambios entraran por PR y no por push directo.

## Paso 5: Anteponer un resumen que se pueda leer

**Por qué**: la lista generada dice **qué** cambió. Quien la lee está decidiendo
**si** actualizar, y eso no se lo contesta ninguna lista.

> [!WARNING]
> `--notes-file` **sustituye** el cuerpo entero, no añade. Por eso el resumen se
> escribe primero y las notas generadas se le concatenan detrás.

```bash
cat > /tmp/resumen.md <<'TXT'
Primera versión estable. La API pública queda congelada hasta la 2.0.0: a
partir de aquí, cualquier cambio incompatible sube el número mayor y trae su
guía de migración.

TXT

gh release view v1.0.0 --json body --jq .body >> /tmp/resumen.md
gh release edit v1.0.0 --notes-file /tmp/resumen.md
```

**Verifica**:

```bash
gh release view v1.0.0 --json body --jq '.body[0:200]'
```

## Paso 6: Cerrar el candado

**Por qué**: mientras el release sea editable, «esto es la 1.0.0» es una
creencia. Con inmutabilidad, es un hecho comprobable.

```bash
gh api repos/{owner}/{repo}/immutable-releases --method PUT
```

**Verifica**:

```bash
gh api repos/{owner}/{repo}/immutable-releases
# {"enabled":true,"enforced_by_owner":false}

gh release list --limit 1 --json tagName,isImmutable
```

## Paso 7: Comprobar que el candado cierra de verdad

**Por qué**: una protección que no has visto actuar es una suposición.

> [!WARNING]
> El comando siguiente intenta **mover un tag publicado**. GitHub debe
> rechazarlo; ese rechazo es el resultado del ejercicio. Si tu repositorio no
> tuviera la inmutabilidad activa, el tag se movería de verdad y romperías a
> todo el que lo tuviera pinneado.

```bash
git tag -f -a v1.0.0 -m "intento de mover el tag"
git push -f origin v1.0.0
```

Debe fallar con un rechazo del lado del servidor. Deja tu tag local como estaba:

```bash
git tag -d v1.0.0
git fetch origin tag v1.0.0
git cat-file -t v1.0.0    # tag
```

## Paso 8 (opcional): El flujo de borrador

**Por qué**: con la inmutabilidad activa, **no se pueden añadir adjuntos a un
release ya publicado**. La única forma de publicar con binarios es montarlos
antes, en un borrador.

```bash
echo "contenido de ejemplo" > notas-tecnicas.txt
gh release create v1.0.1-rc.1 --draft --prerelease --generate-notes
gh release upload v1.0.1-rc.1 notas-tecnicas.txt
gh release edit v1.0.1-rc.1 --draft=false   # aquí se publica y se congela
```

**Verifica** que el adjunto está y que el release no es `latest`:

```bash
gh release view v1.0.1-rc.1 --json isDraft,isPrerelease,assets \
  --jq '{isDraft, isPrerelease, adjuntos: [.assets[].name]}'
gh release list --limit 3 --json tagName,isLatest,isPrerelease
```

`isLatest` no existe en `gh release view`: es un campo de la **lista**, porque
«el último» es una propiedad del conjunto, no del release.

Limpia después si no lo quieres en tu historia:

```bash
gh release delete v1.0.1-rc.1 --cleanup-tag --yes
```

## ✅ Resultado

- [ ] El `README.md` declara la API pública y el versionado
- [ ] `.github/release.yml` existe y el comodín `"*"` está el último
- [ ] `v1.0.0` es un tag anotado y firmado
- [ ] El release `v1.0.0` existe, es `latest` y no es borrador
- [ ] Sus notas empiezan con un resumen escrito por ti
- [ ] La inmutabilidad de releases está activa
- [ ] Has visto rechazado un intento de mover el tag

## 🔗 Siguiente

[Práctica 02 — Release automatizado](02-release-automatizado.md)

---

← [Volver a la Semana 12](../README.md)
