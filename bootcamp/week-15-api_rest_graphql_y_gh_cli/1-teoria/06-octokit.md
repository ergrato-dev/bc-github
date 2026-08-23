# Octokit: cuando el guion crece

> `gh api` es perfecto hasta la línea sesenta. A partir de ahí empiezas a escribir
> bucles con `jq`, a acumular JSON en variables de shell y a inventar tu propio
> reintento. Ese es el momento de cambiar de herramienta, no antes.

## 🎯 Objetivos

- Saber en qué punto conviene pasar de bash a Octokit
- Distinguir `octokit` de `@octokit/rest` y elegir sin dudar
- Paginar y consultar GraphQL desde TypeScript
- Añadir reintento y control de ritmo con dos plugins
- Autenticarse en local y en Actions sin guardar tokens

## 1. Qué problema resuelve

Octokit es el SDK oficial de GitHub. Frente a un guion de shell aporta cuatro
cosas que en bash se hacen mal:

| | `gh api` + `jq` | Octokit |
|--|----------------|---------|
| Una consulta suelta | ✅ Imbatible | Exagerado |
| Paginación | Manual y con trampas | `octokit.paginate()` |
| Reintento y ritmo | A mano | Plugins |
| Tipos y autocompletado | ❌ | ✅ TypeScript |
| Lógica (condiciones, agregación) | Frágil | Normal |
| Tests | ❌ | ✅ |

La regla práctica: **si el guion tiene condiciones, agrega datos de varias
llamadas o se va a mantener, pasa a Octokit. Si es una consulta, `gh api`.**

## 2. Qué paquete instalar

| Paquete | Qué trae | Cuándo |
|---------|----------|--------|
| `octokit` | REST + GraphQL + paginación + auth de App, todo junto | **El de por defecto** |
| `@octokit/rest` | Solo REST | Bundles pequeños, solo REST |
| `@octokit/graphql` | Solo GraphQL | Igual, al revés |
| `@octokit/plugin-throttling` | Respeta límites primario y secundario | Cualquier cosa que pagine |
| `@octokit/plugin-retry` | Reintenta `5xx` con backoff | Cualquier cosa en CI |

```bash
pnpm add octokit
pnpm add -D @types/node tsx
```

## 3. Las tres llamadas que vas a hacer

```ts
import { Octokit } from "octokit";

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

// 1. REST: un recurso
const { data: repo } = await octokit.rest.repos.get({
  owner: "cli",
  repo: "cli",
});
console.log(repo.full_name, repo.stargazers_count);

// 2. REST paginado: todas las páginas, sin bucle
const labels = await octokit.paginate(octokit.rest.issues.listLabelsForRepo, {
  owner: "cli",
  repo: "cli",
  per_page: 100,
});
console.log(labels.length);

// 3. GraphQL
const datos = await octokit.graphql<{
  repository: { issues: { totalCount: number } };
}>(
  `query($owner: String!, $repo: String!) {
     repository(owner: $owner, name: $repo) {
       issues(states: OPEN) { totalCount }
     }
   }`,
  { owner: "cli", repo: "cli" },
);
console.log(datos.repository.issues.totalCount);
```

Tres detalles que evitan las sorpresas del primer día:

- **`octokit.paginate` devuelve el array ya concatenado.** Es el equivalente
  correcto de `--paginate --slurp | jq add`, sin la trampa de contar páginas
- **`octokit.graphql` devuelve directamente el contenido de `data`**: no hay que
  escribir `.data` — y si hay `errors`, **lanza una excepción**
- **`per_page: 100` sigue siendo tuyo.** El SDK no lo pone por ti

Para colecciones grandes, `paginate.iterator()` procesa página a página sin
cargarlo todo en memoria:

```ts
for await (const { data: pagina } of octokit.paginate.iterator(
  octokit.rest.issues.listForRepo,
  { owner: "cli", repo: "cli", state: "all", per_page: 100 },
)) {
  for (const issue of pagina) procesar(issue);
}
```

## 4. Portarse bien, sin escribirlo tú

```ts
import { Octokit } from "octokit";
import { throttling } from "@octokit/plugin-throttling";
import { retry } from "@octokit/plugin-retry";

const OctokitEducado = Octokit.plugin(throttling, retry);

const octokit = new OctokitEducado({
  auth: process.env.GITHUB_TOKEN,
  userAgent: "auditoria-semana-15",
  throttle: {
    onRateLimit: (retryAfter, options, _octokit, reintentos) => {
      console.warn(`Límite alcanzado en ${options.method} ${options.url}`);
      return reintentos < 2; // dos reintentos, luego rendirse
    },
    onSecondaryRateLimit: (retryAfter, options) => {
      console.warn(`Límite secundario en ${options.url}: espero ${retryAfter}s`);
      return true;
    },
  },
});
```

Eso implementa el archivo [04](04-limites-y-cortesia.md) entero: respeta
`Retry-After`, distingue los dos límites y reintenta los `5xx` con backoff. Es la
razón principal para usar el SDK en algo que corre solo.

> [!NOTE]
> `userAgent` no es decorativo: identifica tu guion en los logs de GitHub y ayuda
> cuando hay que explicar de dónde salía el tráfico.

## 5. Autenticación

| Entorno | Cómo | Nota |
|---------|------|------|
| Tu máquina | `auth: process.env.GITHUB_TOKEN` con `export GITHUB_TOKEN=$(gh auth token)` | El token nunca se escribe en un archivo |
| Actions | `auth: process.env.GITHUB_TOKEN` con `env: GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}` | Efímero y con `permissions` acotadas |
| GitHub App | `createAppAuth` con id de app y clave privada | Semana 16 |

```bash
export GITHUB_TOKEN=$(gh auth token)   # no queda en ningún archivo
pnpm tsx tools/auditoria.ts
```

> [!CAUTION]
> Nunca un token literal en el código, ni en un `.env` commiteado. Un `ghp_`
> seguido de 36 caracteres en un repositorio público lo detecta secret scanning
> —lo viste en la Semana 14— y lo detectan también los que rastrean GitHub en
> busca de credenciales.

## 6. Octokit sin instalar nada: `actions/github-script`

Dentro de un workflow, hay un Octokit ya autenticado y listo:

```yaml
- uses: actions/github-script@3a2844b7e9c422d3c10d287c895573f7108da1b3 # v9.0.0
  with:
    script: |
      const abiertos = await github.paginate(github.rest.issues.listForRepo, {
        owner: context.repo.owner,
        repo: context.repo.repo,
        state: "open",
        per_page: 100,
      });
      core.summary
        .addHeading("Issues abiertos")
        .addRaw(`Hay ${abiertos.length} abiertos.`)
        .write();
```

`github` es el cliente, `context` trae el evento y el repositorio, y `core`
escribe en el resumen del job. Para veinte líneas de lógica es la opción más
corta; para doscientas, un archivo TypeScript de verdad que puedas testear.

## 7. Antipatrones

| Antipatrón | Por qué duele | Qué hacer |
|------------|---------------|-----------|
| Octokit para una consulta suelta | `package.json` y `node_modules` para un `curl` | `gh api` |
| Bucle `while` con `page++` | El SDK ya lo hace, y mejor | `octokit.paginate` |
| Sin plugin de throttling en un cron | Se come el cupo y falla el domingo | `Octokit.plugin(throttling, retry)` |
| Token literal en el código | Se filtra en el primer push | Variable de entorno |
| `paginate` sobre 50 000 issues | Memoria y tiempo | `paginate.iterator()` |
| Ignorar los tipos y usar `any` | Pierdes la razón principal de usar el SDK | Tipar las respuestas de GraphQL |
| `github-script` con doscientas líneas | No hay tests ni editor | Archivo propio con `tsx` |

## 8. Trucos

- **`gh auth token`** exporta el token de `gh` a una variable de entorno: el guion
  de Octokit usa tu sesión sin crear un PAT nuevo
- **`octokit.request("GET /repos/{owner}/{repo}", {...})`** llama a cualquier
  endpoint aunque no haya método tipado para él — el escape hatch del SDK
- **`octokit.rest.rateLimit.get()`** al principio y al final de un guion mide el
  coste real de tu auditoría
- **Tipar la respuesta de `octokit.graphql<T>()`** convierte el JSON en algo que
  el editor autocompleta: es donde más se nota TypeScript aquí
- **`octokit.paginate` acepta una función de mapeo** como tercer argumento, para
  quedarte solo con lo que necesitas y no acumular megas en memoria

## 📚 Recursos Adicionales

- [`octokit.js` — README](https://github.com/octokit/octokit.js)
- [Scripting with the REST API and JavaScript](https://docs.github.com/en/rest/guides/scripting-with-the-rest-api-and-javascript)
- [`@octokit/plugin-throttling`](https://github.com/octokit/plugin-throttling.js)
- [`@octokit/plugin-retry`](https://github.com/octokit/plugin-retry.js)
- [`actions/github-script`](https://github.com/actions/github-script)

## ✅ Checklist de Verificación

- [ ] Sabes en qué punto un guion deja de ser trabajo para `gh api`
- [ ] Eliges entre `octokit` y `@octokit/rest` sin pensarlo
- [ ] Usas `octokit.paginate` en vez de escribir el bucle
- [ ] Tu cliente lleva `throttling` y `retry` si corre solo
- [ ] El token llega por variable de entorno, nunca en el código
- [ ] Sabes cuándo `github-script` es suficiente y cuándo no
