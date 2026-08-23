# Actions en JavaScript

> Cuando lo que necesitas no es una secuencia de comandos sino lógica —leer la
> API, decidir, escribir— el YAML deja de ser la herramienta. Una action de
> JavaScript arranca en milisegundos y corre en cualquier sistema operativo.

## 🎯 Objetivos

- Escribir una action de JavaScript con `action.yml` y su punto de entrada
- Leer inputs y escribir outputs, con toolkit y sin él
- Publicar anotaciones, resúmenes y fallos legibles
- Entender por qué hay que empaquetar el código y cuándo no hace falta
- Usar `pre` y `post` para lo que ocurre antes y después del job

## 1. Qué problema resuelve

Tres señales de que un `run:` se te ha quedado corto:

- Necesitas llamar a la API de GitHub y decidir según la respuesta
- El script tiene más de treinta líneas de `jq` y `bash`
- Lo mismo tiene que funcionar en Linux, macOS y Windows

Una action de JavaScript resuelve las tres. Es, además, el tipo de action más
extendido: casi todo lo que usas del Marketplace es JavaScript.

## 2. El `action.yml`

```yaml
name: Etiquetar tamaño del PR
description: Añade una label según cuántas líneas cambia el pull request
author: tu-usuario

branding:
  icon: tag
  color: blue

inputs:
  token:
    description: Token con permiso de escritura sobre pull requests
    required: true
  umbral-grande:
    description: Líneas a partir de las cuales el PR se considera grande
    required: false
    default: "400"

outputs:
  tamano:
    description: La etiqueta aplicada (xs, s, m, l, xl)

runs:
  using: node24
  main: dist/index.js
```

| Clave | Qué hace |
|-------|----------|
| `runs.using` | `node20` o `node24`. Node 24 es el runtime actual |
| `runs.main` | El archivo que se ejecuta |
| `runs.pre` / `runs.post` | Código que corre **antes** y **después** del job (§6) |
| `branding` | Icono y color en el Marketplace ([Teoría 07](07-versionar-publicar-y-compartir.md)) |
| `inputs.<x>.default` | Todo llega como cadena, también los números |

## 3. Entradas y salidas, sin dependencias

El contrato con el runner es de variables de entorno y archivos, así que se puede
escribir una action útil **sin instalar nada**:

```javascript
// src/index.mjs  — la extensión .mjs permite `await` en el nivel superior
import { appendFileSync, readFileSync } from "node:fs";

// Los inputs llegan como INPUT_<NOMBRE>: mayúsculas, y el resto del nombre igual
const token  = process.env.INPUT_TOKEN;
const umbral = Number(process.env["INPUT_UMBRAL-GRANDE"] ?? 400);
const repo   = process.env.GITHUB_REPOSITORY;
const evento = JSON.parse(readFileSync(process.env.GITHUB_EVENT_PATH, "utf8"));

const pr = evento.pull_request;
if (!pr) {
  console.log("Este evento no trae pull_request; no hay nada que etiquetar.");
  process.exit(0);
}

const lineas = pr.additions + pr.deletions;
const tamano = lineas > umbral ? "xl" : lineas > 100 ? "l" : "s";

const respuesta = await fetch(
  `https://api.github.com/repos/${repo}/issues/${pr.number}/labels`,
  {
    method: "POST",
    headers: {
      authorization: `Bearer ${token}`,
      accept: "application/vnd.github+json",
    },
    body: JSON.stringify({ labels: [`tamano:${tamano}`] }),
  },
);

if (!respuesta.ok) {
  // ::error:: convierte el mensaje en una anotación roja del run
  console.log(`::error::La API respondió ${respuesta.status}`);
  process.exit(1);
}

// Los outputs se escriben en un archivo, no se imprimen
appendFileSync(process.env.GITHUB_OUTPUT, `tamano=${tamano}\n`);
console.log(`::notice::PR de ${lineas} líneas etiquetado como ${tamano}`);
```

| Cómo se hace | Mecanismo |
|--------------|-----------|
| Leer un input | `process.env.INPUT_<NOMBRE>` (mayúsculas, `-` incluido tal cual) |
| Escribir un output | Añadir `clave=valor` a `$GITHUB_OUTPUT` |
| Leer el evento | `JSON.parse` de `$GITHUB_EVENT_PATH` |
| Fallar el step | `process.exit(1)` |
| Anotación | `::error::`, `::warning::`, `::notice::` por salida estándar |
| Resumen del run | Añadir Markdown a `$GITHUB_STEP_SUMMARY` |

## 4. Con el toolkit

En cuanto la action crece, `@actions/core` y `@actions/github` ahorran código y
casos límite (valores multilínea, enmascarado de secretos, paginación):

```javascript
import * as core from "@actions/core";
import * as github from "@actions/github";

const token = core.getInput("token", { required: true });
const umbral = Number(core.getInput("umbral-grande"));
const octokit = github.getOctokit(token);
const pr = github.context.payload.pull_request;

try {
  const lineas = pr.additions + pr.deletions;
  const tamano = lineas > umbral ? "xl" : "s";

  await octokit.rest.issues.addLabels({
    ...github.context.repo,
    issue_number: pr.number,
    labels: [`tamano:${tamano}`],
  });

  core.setOutput("tamano", tamano);
  await core.summary.addHeading("Tamaño del PR").addRaw(`${lineas} líneas`).write();
} catch (error) {
  core.setFailed(error.message);
}
```

| Función | Para qué |
|---------|----------|
| `core.getInput(nombre, { required })` | Input, con validación |
| `core.getBooleanInput(nombre)` | Interpreta `'true'`/`'false'` de verdad |
| `core.setOutput` · `core.exportVariable` | Output · variable para los steps siguientes |
| `core.setFailed(msg)` | Falla el step con mensaje |
| `core.info` · `core.debug` · `core.warning` · `core.error` | Registro; `debug` solo con `ACTIONS_STEP_DEBUG` |
| `core.setSecret(valor)` | Enmascara ese valor en los logs |
| `core.summary` | Escribe en el resumen del run |
| `github.context` · `github.getOctokit` | El evento y un cliente autenticado |

## 5. Empaquetar: por qué existe `dist/`

El runner **no ejecuta `pnpm install`** antes de tu action: descarga el
repositorio en la ref pedida y ejecuta `runs.main` tal cual. Si tu código
importa `@actions/core` y `node_modules` no está ahí, falla.

Las dos salidas:

| Situación | Qué hacer |
|-----------|-----------|
| Tu action **no tiene dependencias** | `main: src/index.mjs` y listo |
| Tu action usa el toolkit o cualquier paquete | Empaquetar todo en un archivo y commitearlo |

El empaquetador estándar es [`@vercel/ncc`](https://github.com/vercel/ncc):

```bash
pnpm add -D @vercel/ncc
pnpm exec ncc build src/index.js -o dist
git add dist && git commit -m "build: regenera dist"
```

Sí: **el `dist/` se commitea**. Es la excepción a la regla de no versionar
artefactos, y trae su propio problema — que alguien cambie `src/` y olvide
regenerar `dist/`. Por eso el CI de la action comprueba que estén sincronizados
([Teoría 06](06-probar-y-mantener-una-action.md)).

## 6. `pre` y `post`

```yaml
runs:
  using: node24
  pre: dist/pre.js       # antes de que empiece el job
  main: dist/index.js
  post: dist/post.js     # al terminar el job, aunque haya fallado
  post-if: success()     # opcional: condición para el post
```

`post` es lo que usan las actions que **limpian**: `actions/cache` guarda la
caché ahí, y las que arrancan un servicio lo paran. Si tu action deja algo
encendido, el sitio de apagarlo es `post`, no un step que el usuario tenga que
acordarse de poner.

## 7. Antipatrones

| Antipatrón | Por qué duele | Qué hacer |
|------------|---------------|-----------|
| Olvidar regenerar `dist/` | La action ejecuta código viejo y nadie entiende por qué | Check de CI que lo compruebe |
| `console.log` para devolver un valor | Los outputs no se leen de la salida | `$GITHUB_OUTPUT` o `core.setOutput` |
| `process.exit(0)` tras un error | El step sale en verde con el trabajo sin hacer | `core.setFailed` |
| Imprimir el token para depurar | Queda en los logs del run | `core.setSecret` y nunca imprimirlo |
| Pedir el token como variable de entorno oculta | Quien te usa no sabe qué permisos necesitas | Input explícito y documentado |
| Dependencias enormes para dos funciones | `dist/` de megabytes que se descarga en cada job | Node puro cuando basta |
| `using: node20` en una action nueva | Runtime en cuenta atrás | `node24` |
| No manejar el caso "este evento no aplica" | Falla en workflows donde no hay PR | Salir en verde explicando por qué |

## 8. Trucos

- **Sin dependencias no hace falta empaquetar**: para una action pequeña, Node
  puro con `fetch` es menos código y menos mantenimiento
- **`::error file=src/x.js,line=12::mensaje`** deja la anotación **sobre la línea**
  del archivo en el PR
- **`core.summary`** convierte el run en un informe legible sin abrir logs
- **Depura con `ACTIONS_STEP_DEBUG`** y `core.debug`: los mensajes solo salen
  cuando hace falta
- **El evento entero está en disco**: `jq . "$GITHUB_EVENT_PATH"` en un step
  previo te enseña exactamente qué campos tienes
- **Prueba la lógica sin GitHub**: si separas el cálculo del acceso a la API,
  se prueba con `node --test` en dos líneas

## 📚 Recursos Adicionales

- [GitHub Docs — Create a JavaScript action](https://docs.github.com/actions/tutorials/create-actions/create-a-javascript-action)
- [GitHub Docs — Metadata syntax](https://docs.github.com/actions/reference/workflows-and-actions/metadata-syntax)
- [`actions/toolkit`](https://github.com/actions/toolkit) — `core`, `github`, `exec`, `cache`
- [`@vercel/ncc`](https://github.com/vercel/ncc)

## ✅ Checklist de Verificación

- [ ] Tu action lee inputs y escribe al menos un output
- [ ] Falla con un mensaje útil cuando algo va mal
- [ ] Sabes por qué existe `dist/` y cuándo puedes prescindir de él
- [ ] Sabes qué hace `post` y qué actions conocidas lo usan
- [ ] Ningún valor sensible aparece en los logs
