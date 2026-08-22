# Probar y mantener una action

> El día que publicas una action dejas de tener un script y pasas a tener un
> producto: alguien depende de ella, y cada cambio tuyo puede romperle el CI.

## 🎯 Objetivos

- Montar el CI de la propia action: tests, autoprueba y comprobación de `dist/`
- Probar la action con casos reales en varios sistemas operativos
- Documentar el contrato de entradas y salidas
- Deprecar un input sin romper a nadie
- Mantenerla viva cuando el runtime y las dependencias cambian

## 1. Qué problema resuelve

Una action se rompe de formas que el desarrollo normal no tiene:

| Fallo típico | Cómo se detecta |
|--------------|-----------------|
| `dist/` desactualizado | Solo cuando alguien la usa y ejecuta código viejo |
| Funciona en Linux y falla en Windows | Cuando lo reporta un tercero |
| Un input renombrado | En el CI de quien te usa, no en el tuyo |
| El runtime deja de estar soportado | Con un aviso de deprecación que nadie lee |

Todos son evitables con el mismo remedio: **la action se prueba a sí misma en su
propio repositorio**.

## 2. El CI de una action

Tres capas, de más barata a más lenta:

```yaml
name: CI

on:
  pull_request:
  push:
    branches: [main]

permissions:
  contents: read

jobs:
  unidad:
    runs-on: ubuntu-latest
    timeout-minutes: 5
    steps:
      - uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1
      - uses: actions/setup-node@820762786026740c76f36085b0efc47a31fe5020 # v7.0.0
        with:
          node-version: "24"
      - run: npm ci
      - run: node --test

  dist-al-dia:
    runs-on: ubuntu-latest
    timeout-minutes: 5
    steps:
      - uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1
      - uses: actions/setup-node@820762786026740c76f36085b0efc47a31fe5020 # v7.0.0
        with:
          node-version: "24"
      - run: npm ci
      - run: npx ncc build src/index.js -o dist
      - name: Comprobar que dist coincide con src
        shell: bash
        run: |
          if ! git diff --quiet dist; then
            echo "::error::dist/ está desactualizado. Ejecuta 'npm run build' y commitea."
            git diff --stat dist
            exit 1
          fi

  autoprueba:
    strategy:
      fail-fast: false
      matrix:
        os: [ubuntu-latest, windows-latest, macos-latest]
    runs-on: ${{ matrix.os }}
    timeout-minutes: 10
    steps:
      - uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1
      - id: probar
        uses: ./                       # ← la action de este mismo repositorio
        with:
          umbral-grande: "10"
      - shell: bash
        env:
          TAMANO: ${{ steps.probar.outputs.tamano }}
        run: |
          : "${TAMANO:?la action no devolvió ningún tamaño}"
          echo "La action devolvió: $TAMANO"
```

| Job | Qué protege |
|-----|-------------|
| `unidad` | La lógica, sin GitHub de por medio |
| `dist-al-dia` | Que el código publicado sea el código escrito |
| `autoprueba` | Que la action **funcione de verdad**, en los tres sistemas |

`uses: ./` es la pieza clave: la action se ejecuta desde su propio repositorio,
igual que la ejecutará quien te use.

## 3. Separar la lógica del acceso a la API

Lo que hace que una action se pueda probar en dos líneas:

```javascript
// src/tamano.js — sin GitHub, sin red, sin entorno
export function calcularTamano(lineas, umbral) {
  if (lineas > umbral) return "xl";
  if (lineas > 100) return "l";
  if (lineas > 30) return "m";
  return "s";
}
```

```javascript
// test/tamano.test.js
import { test } from "node:test";
import assert from "node:assert/strict";
import { calcularTamano } from "../src/tamano.js";

test("un PR por encima del umbral es xl", () => {
  assert.equal(calcularTamano(500, 400), "xl");
});

test("el umbral es exclusivo", () => {
  assert.equal(calcularTamano(400, 400), "l");
});
```

El `index.js` queda como pegamento: lee entorno, llama a la lógica, escribe
outputs. Esa parte la cubre la autoprueba; el resto, los tests unitarios.

## 4. Documentar el contrato

Los `inputs` y `outputs` son la API pública de tu action. El `README.md` necesita
exactamente tres cosas:

````markdown
## Uso

```yaml
- uses: tu-usuario/accion-tamano-pr@v1
  with:
    token: ${{ secrets.GITHUB_TOKEN }}
```

## Entradas

| Nombre | Obligatorio | Por defecto | Qué hace |
|--------|:-----------:|-------------|----------|
| `token` | sí | — | Token con `pull-requests: write` |
| `umbral-grande` | no | `400` | Líneas a partir de las que el PR es grande |

## Salidas

| Nombre | Qué devuelve |
|--------|--------------|
| `tamano` | La etiqueta aplicada: `s`, `m`, `l` o `xl` |

## Permisos necesarios

```yaml
permissions:
  pull-requests: write
```
````

Ese bloque de `permissions` es el que más se agradece: sin él, quien te use
descubre el permiso que falta a base de errores 403.

## 5. Deprecar sin romper

Cuando un input cambia de nombre o deja de tener sentido:

```yaml
inputs:
  umbral:
    description: "Obsoleto: usa umbral-grande"
    required: false
    deprecationMessage: "El input 'umbral' se retirará en la v3. Usa 'umbral-grande'."
```

`deprecationMessage` hace que el runner emita un aviso cada vez que alguien lo
use. El ciclo honesto es:

1. Añadir el nuevo, mantener el viejo funcionando y marcarlo como obsoleto
2. Dejar pasar al menos una versión menor
3. Retirarlo **solo** en un cambio mayor, documentado en el changelog
   ([Semana 07](../../week-07-code_review_y_convenciones/1-teoria/04-semver-y-changelog.md))

## 6. Mantenimiento continuo

| Qué se mueve | Cómo enterarte |
|--------------|----------------|
| El runtime (`node20` → `node24`) | Avisos de deprecación en los logs de los runs |
| Las actions que usas dentro | Dependabot con `package-ecosystem: github-actions` |
| Las dependencias de npm | Dependabot con `package-ecosystem: npm` |
| La API de GitHub | Changelog de GitHub y fallos en la autoprueba |

```yaml
# .github/dependabot.yml de la action
version: 2
updates:
  - package-ecosystem: github-actions
    directory: "/"
    schedule: { interval: weekly }
  - package-ecosystem: npm
    directory: "/"
    schedule: { interval: weekly }
```

Y la comprobación que más avisa de que algo se ha movido bajo tus pies: un
workflow programado semanal que ejecute la autoprueba aunque nadie toque el
repositorio. Recuerda que un `schedule` se desactiva tras 60 días sin actividad
([Semana 05](../../week-05-projects_v2_automatizacion_y_metricas/1-teoria/03-automatizacion-con-actions.md)).

## 7. Antipatrones

| Antipatrón | Por qué duele | Qué hacer |
|------------|---------------|-----------|
| Publicar sin autoprueba | El primer usuario es tu tester | `uses: ./` en el CI |
| No comprobar `dist/` | Se publica código que no es el del repositorio | Job `dist-al-dia` |
| Probar solo en Linux | Rompe en Windows y te enteras por un issue | Matriz de tres sistemas |
| Toda la lógica en `index.js` | No se puede probar sin GitHub | Separar cálculo de entorno |
| Renombrar un input sin avisar | Rompes a todos tus usuarios de golpe | `deprecationMessage` y versión mayor |
| README sin la tabla de inputs | Se leen el código para usarte | Documenta el contrato |
| No decir qué permisos hace falta conceder | Todos descubren el 403 por su cuenta | Bloque `permissions` en el README |
| Dependencias sin actualizar durante un año | Se acumulan hasta que actualizar es un proyecto | Dependabot semanal |

## 8. Trucos

- **`uses: ./` es la mejor prueba que existe** y cuesta seis líneas
- **Un script `npm run build`** con `ncc` evita que cada uno lo genere distinto
- **Comprueba el output en la propia autoprueba**: `: "${VALOR:?mensaje}"` falla
  el step si vino vacío
- **`act` sirve para iterar**, no para dar por buena una action: imágenes
  distintas y sin tus secretos
- **Marca la action como no soportada en Windows** en el README si es de Docker,
  antes de que alguien lo descubra
- **Guarda un workflow de ejemplo** en `examples/`: es documentación que se puede
  copiar y que además puedes ejecutar

## 📚 Recursos Adicionales

- [GitHub Docs — Metadata syntax (`deprecationMessage`)](https://docs.github.com/actions/reference/workflows-and-actions/metadata-syntax)
- [GitHub Docs — Dependabot version updates](https://docs.github.com/code-security/dependabot/dependabot-version-updates)
- [`actions/toolkit` — guías de pruebas](https://github.com/actions/toolkit)
- [Node.js — `node:test`](https://nodejs.org/api/test.html)

## ✅ Checklist de Verificación

- [ ] Tu action se ejecuta a sí misma en su CI con `uses: ./`
- [ ] Un job comprueba que `dist/` está al día
- [ ] La lógica se puede probar sin llamar a la API
- [ ] El README documenta inputs, outputs y permisos necesarios
- [ ] Sabes cómo deprecar un input sin romper a quien te usa
