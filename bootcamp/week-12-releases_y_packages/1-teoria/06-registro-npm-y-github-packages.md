# El registro npm: GitHub Packages y npmjs

> Publicar un paquete son dos decisiones antes de escribir una línea: en qué
> registro y con qué identidad. Las dos tienen respuesta distinta según quién lo
> vaya a instalar, y equivocarse obliga a republicar bajo otro nombre — porque
> una versión publicada no se reescribe.

## 🎯 Objetivos

- Elegir entre `npm.pkg.github.com` y `registry.npmjs.org` con criterio
- Publicar con `pnpm` desde un workflow, sin secretos propios
- Configurar `package.json` y `.npmrc` para que el registro correcto reciba el push
- Entender qué es *trusted publishing* y por qué sustituye al token del registro

> [!NOTE]
> El **registro** se llama registro npm y el formato del paquete es npm: eso no
> cambia. Lo que cambia es el gestor. Aquí, como en todo el bootcamp, se usa
> `pnpm`.

## 1. Qué problema resuelve

Un `git clone` no es una forma de distribuir una librería: obliga a construirla,
no resuelve versiones y no funciona como dependencia. Un registro sí, y añade
resolución de rangos, integridad por hash y una URL estable.

La pregunta es cuál:

| | GitHub Packages | npmjs.org |
|---|-----------------|-----------|
| Quién puede instalar | Requiere autenticarse **siempre**, incluso si es público | Cualquiera, sin cuenta |
| Nombre | Obligatoriamente `@propietario/nombre` | Libre o con scope |
| Credencial en CI | `GITHUB_TOKEN`, sin configurar nada | Token del registro o *trusted publishing* |
| Procedencia con `--provenance` | No | Sí |
| Encaja en | Paquetes internos de una organización | Cualquier cosa pública |

La consecuencia que decide casi todos los casos: **GitHub Packages exige
autenticación para instalar, aunque el paquete sea público**. Una librería
pensada para que la use gente de fuera va a npmjs; una compartida entre repos de
tu organización va a GitHub Packages.

## 2. El `package.json`

El nombre lleva scope obligatorio en GitHub Packages, y el scope es el
propietario del repositorio:

```json
{
  "name": "@tu-usuario/tu-repo",
  "version": "1.0.0",
  "packageManager": "pnpm@11.22.0",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/tu-usuario/tu-repo.git"
  },
  "files": ["dist", "README.md"],
  "publishConfig": {
    "registry": "https://npm.pkg.github.com"
  }
}
```

Tres campos que no son decorativos:

- **`publishConfig.registry`** evita el accidente clásico: publicar en npmjs algo
  que iba a GitHub Packages. Sin él se usa el registro por defecto
- **`files`** es la lista blanca de lo que entra en el paquete. Sin ella entra
  casi todo, incluidos los tests y ese `.env` que nadie recuerda
- **`packageManager`** fija la versión de pnpm; Corepack y `pnpm/action-setup` la
  leen de ahí, así que el CI y tu portátil usan la misma

## 3. Publicar en GitHub Packages

`pnpm/action-setup` va **antes** que `actions/setup-node` —el mismo orden de la
Semana 09—, y `registry-url` es lo que escribe el `.npmrc` del runner:

```yaml
jobs:
  publicar:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write
    steps:
      - uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1
      - uses: pnpm/action-setup@0977fd99725f1db4007ccb2928dbb4e90d06cc86 # v6.0.10
      - uses: actions/setup-node@820762786026740c76f36085b0efc47a31fe5020 # v7.0.0
        with:
          node-version: 22
          registry-url: https://npm.pkg.github.com
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm publish --no-git-checks
        env:
          NODE_AUTH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

Sin secretos propios: el `GITHUB_TOKEN` del run, con `packages: write`, ya
autoriza a publicar en el namespace del repositorio.

Dos detalles que hacen fallar el primer intento:

> [!IMPORTANT]
> **`NODE_AUTH_TOKEN` va en el `env` del step, no en el `with` de la action.**
> `setup-node` deja el `.npmrc` preparado para **leer** esa variable; si no
> existe, el publish falla con un `401` sin más explicación.

> [!IMPORTANT]
> **`--no-git-checks` no es opcional en CI.** `pnpm publish` comprueba que la
> rama sea la de publicación y que el árbol esté limpio; en un runner con el
> checkout en un tag eso no se cumple y aborta antes de intentar nada.

## 4. Publicar en npmjs

Cambia el registro y la credencial:

```yaml
      - uses: actions/setup-node@820762786026740c76f36085b0efc47a31fe5020 # v7.0.0
        with:
          node-version: 22
          registry-url: https://registry.npmjs.org
          cache: pnpm
      - run: pnpm publish --access public --no-git-checks
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

`--access public` es obligatorio la primera vez que se publica un paquete con
scope: por defecto npmjs los crea restringidos, y una cuenta gratuita no puede
tener paquetes restringidos, así que falla.

## 5. Procedencia: `--provenance`

Un paquete en npmjs no dice de dónde salió. Cualquiera con el token puede
publicar cualquier contenido bajo ese nombre. La procedencia rompe esa ceguera:

```yaml
    permissions:
      contents: read
      id-token: write        # el mismo de la Semana 11
    steps:
      - run: pnpm publish --provenance --access public --no-git-checks
```

Con ese flag se pide un token OIDC al mismo emisor de la Semana 11, se firma una
declaración de procedencia con Sigstore y se sube junto al paquete. npmjs enseña
entonces, en la página del paquete, **desde qué repositorio, qué commit y qué
workflow** lo construyeron.

Requisitos, todos comprobables antes de intentarlo:

| Requisito | Por qué |
|-----------|---------|
| `id-token: write` | Sin el token OIDC no hay nada que firmar |
| Runner alojado por GitHub | Un runner propio no obtiene identidad verificable |
| `repository` en `package.json` apuntando al repo real | El registro compara la URL con el emisor, distinguiendo mayúsculas |
| Registro npmjs | GitHub Packages no admite procedencia |

Para GitHub Packages la procedencia se consigue por otra vía: atestiguando el
`.tgz` con `actions/attest-build-provenance`, como hace la
[teoría 07](07-procedencia-verificable.md).

## 6. *Trusted publishing*

Es la evolución: en vez de guardar un token del registro en un secreto, se
registra en npmjs qué repositorio y qué workflow tienen permiso para publicar ese
paquete. El workflow se identifica con OIDC y **no hay token que robar ni que
rotar**.

```yaml
    permissions:
      id-token: write
      contents: read
    steps:
      - run: pnpm publish --access public --no-git-checks   # sin NODE_AUTH_TOKEN
```

Con *trusted publishing* la procedencia se genera sola: el flag `--provenance`
sobra. Es exactamente el mismo razonamiento que llevó de los secretos a OIDC en
la Semana 11, aplicado al registro en vez de a la nube.

## 7. Lo que no se puede deshacer

Una versión publicada es inmutable por diseño en los dos registros. Despublicar
en npmjs solo funciona dentro de las 72 horas y con condiciones, y en GitHub
Packages borrar una versión de un paquete público requiere que no la haya
descargado nadie de fuera.

De ahí tres hábitos, en este orden:

```bash
pnpm pack                 # genera el .tgz y dice qué archivos mete
tar -tzf *.tgz | head -30 # mirarlo de verdad la primera vez
pnpm publish --dry-run --no-git-checks   # todo menos subir
```

`pnpm publish --dry-run` hace la validación completa —incluida la de
procedencia— sin publicar. Es el paso que separa «creo que está bien» de «está
bien».

## 8. Antipatrones

| Antipatrón | Por qué duele | Qué hacer |
|------------|---------------|-----------|
| Un token del registro de larga vida en un secreto | Se filtra, se olvida, no caduca | *Trusted publishing* |
| `NODE_AUTH_TOKEN` fuera del `env` del step | `401` sin explicación | En el `env` de `pnpm publish` |
| Sin `publishConfig.registry` | Publicas en el registro equivocado | Declararlo siempre |
| Sin `files` en el `package.json` | Se filtra lo que no debía salir | Lista blanca explícita |
| Publicar sin mirar el `.tgz` | Igual, y ya no se deshace | `pnpm pack` y `tar -tzf` |
| `--provenance` sin `id-token: write` | Falla al pedir el token y el mensaje no lo dice | Los dos juntos |
| Esperar que GitHub Packages sea instalable sin login | «Es público» no significa anónimo | npmjs si el público es abierto |
| `version` editada a mano con `release-please` activo | El manifiesto deja de cuadrar | Solo el PR de release la toca |

## 9. Trucos

- **`pnpm view @scope/paquete versions --json`** lista todo lo publicado: la
  forma más rápida de comprobar que la publicación llegó
- **`pnpm publish --dry-run`** hace todo menos subir, validación de procedencia
  incluida
- **`.npmrc` con `provenance=true`** evita repetir el flag y lo hace visible en
  el repositorio
- **El scope en minúsculas**: el registro rechaza mayúsculas en el nombre del
  paquete, aunque tu usuario de GitHub las tenga
- **`pnpm install --frozen-lockfile` y nunca `pnpm install` a secas en CI**:
  falla si el lockfile no cuadra, en vez de arreglarlo por su cuenta
- **La comparación de `repository` distingue mayúsculas**: si tu usuario las
  tiene, cópialo tal cual o la procedencia se rechaza
- **`pnpm version minor --sign-git-tag`** sube la versión y crea el tag anotado y
  firmado en un solo comando, cuando publicas a mano

## 📚 Recursos Adicionales

- [Working with the npm registry](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-npm-registry)
- [`pnpm publish`](https://pnpm.io/cli/publish)
- [pnpm en integración continua](https://pnpm.io/continuous-integration)
- [npm — Generating provenance statements](https://docs.npmjs.com/generating-provenance-statements)
- [npm — Trusted publishers](https://docs.npmjs.com/trusted-publishers)

## ✅ Checklist de Verificación

- [ ] Sabes elegir registro según quién va a instalar el paquete
- [ ] Sabes por qué GitHub Packages exige login incluso siendo público
- [ ] Puedes publicar sin ningún secreto propio en el registro de GitHub
- [ ] Conoces los cuatro requisitos de `--provenance`
- [ ] Sabes por qué `--no-git-checks` hace falta en CI
- [ ] Compruebas el contenido del paquete antes de publicarlo
