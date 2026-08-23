/**
 * Auditoría del repositorio — Semana 15.
 *
 * Copia este archivo a `tools/auditoria.ts` de tu repositorio y ve
 * descomentando los bloques en orden, siguiendo la Práctica 03.
 *
 * Ejecutar:  GITHUB_TOKEN=$(gh auth token) pnpm tsx tools/auditoria.ts --repo OWNER/REPO
 *
 * Códigos de salida: 0 todo cumple · 1 hay hallazgos · 2 uso incorrecto ·
 *                    3 no se pudo auditar
 */

import { readFileSync } from "node:fs";
import { Octokit } from "octokit";

// ============================================
// PASO 1: cliente educado (teoría 04 y 06)
// ============================================
// Descomenta las dos importaciones y el plugin para que el guion respete los
// límites de la API en vez de estrellarse contra ellos.
//
// import { throttling } from "@octokit/plugin-throttling";
// import { retry } from "@octokit/plugin-retry";
//
// const OctokitEducado = Octokit.plugin(throttling, retry);

const [, , ...args] = process.argv;
const repoArg = args[args.indexOf("--repo") + 1];
const formato = args.includes("--formato") ? args[args.indexOf("--formato") + 1] : "markdown";

if (!repoArg || !repoArg.includes("/")) {
  console.error("Uso: auditoria.ts --repo OWNER/REPO [--formato json|markdown]");
  process.exit(2);
}
const [owner, repo] = repoArg.split("/");

// ============================================
// PASO 2: el cliente
// ============================================
// Sustituye `new Octokit(...)` por `new OctokitEducado(...)` y añade el bloque
// `throttle` cuando hayas descomentado el PASO 1.
//
// const octokit = new OctokitEducado({
//   auth: process.env.GITHUB_TOKEN,
//   userAgent: "auditoria-semana-15",
//   throttle: {
//     onRateLimit: (_retryAfter, options, _octokit, reintentos) => {
//       console.warn(`Límite primario en ${options.method} ${options.url}`);
//       return reintentos < 2;
//     },
//     onSecondaryRateLimit: (retryAfter, options) => {
//       console.warn(`Límite secundario en ${options.url}: espero ${retryAfter}s`);
//       return true;
//     },
//   },
// });

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

// ============================================
// PASO 3: recoger — todo lo que la API sabe, sin juzgar nada
// ============================================
async function recoger() {
  const consulta = readFileSync(
    new URL("./consultas/auditoria.graphql", import.meta.url),
    "utf8",
  );

  const grafo = await octokit.graphql<GrafoRespuesta>(consulta, { owner, repo });

  // Descomenta: los workflows solo existen en REST (teoría 01)
  // const workflows = await octokit.paginate(octokit.rest.actions.listRepoWorkflows, {
  //   owner,
  //   repo,
  //   per_page: 100,
  // });

  // Descomenta: endpoint que contesta con el código de estado, no con el cuerpo
  // let dependabot = false;
  // try {
  //   const r = await octokit.request("GET /repos/{owner}/{repo}/vulnerability-alerts", {
  //     owner,
  //     repo,
  //   });
  //   dependabot = r.status === 204;
  // } catch {
  //   dependabot = false; // 404 = desactivado, y es una respuesta válida
  // }

  // Al descomentar los dos bloques de arriba, este `return` se queda en
  // `return { grafo, workflows, dependabot };` — los valores de relleno solo
  // están para que el guion arranque antes de completarlo.
  return {
    grafo,
    workflows: [] as { name: string; state: string; path: string }[],
    dependabot: false,
  };
}

// ============================================
// PASO 4: evaluar — funciones puras, sin red
// ============================================
type Estado = Awaited<ReturnType<typeof recoger>>;
type Regla = { id: string; descripcion: string; ok: (e: Estado) => boolean };

const reglas: Regla[] = [
  {
    id: "repo-publico",
    descripcion: "El repositorio es público",
    ok: (e) => !e.grafo.repository.isPrivate,
  },
  {
    id: "tiene-licencia",
    descripcion: "El repositorio declara una licencia",
    ok: (e) => Boolean(e.grafo.repository.licenseInfo?.spdxId),
  },
  // Descomenta estas reglas a medida que las entiendas (Práctica 03, paso 4):
  // {
  //   id: "ruleset-activo",
  //   descripcion: "Hay al menos un ruleset en modo active",
  //   ok: (e) => e.grafo.repository.rulesets.nodes.some((r) => r.enforcement === "ACTIVE"),
  // },
  // {
  //   id: "sin-alertas-de-dependencias",
  //   descripcion: "No hay alertas de Dependabot abiertas",
  //   ok: (e) => e.grafo.repository.vulnerabilityAlerts.totalCount === 0,
  // },
  // {
  //   id: "dependabot-activo",
  //   descripcion: "Las alertas de Dependabot están activadas",
  //   ok: (e) => e.dependabot,
  // },
  // {
  //   id: "ci-presente",
  //   descripcion: "Hay al menos un workflow activo",
  //   ok: (e) => e.workflows.some((w) => w.state === "active"),
  // },
  // {
  //   id: "hay-release",
  //   descripcion: "El repositorio tiene al menos un release publicado",
  //   ok: (e) => e.grafo.repository.releases.nodes.length > 0,
  // },
];

// ============================================
// PASO 5: presentar — JSON primero, Markdown derivado
// ============================================
function aMarkdown(informe: Informe): string {
  const linea = (h: Informe["hallazgos"][number]) =>
    `| ${h.cumple ? "✅" : "❌"} | \`${h.id}\` | ${h.descripcion} |`;
  return [
    `## Auditoría de \`${informe.repo}\``,
    "",
    `Generado: ${informe.fecha} · Cumple ${informe.cumplidas} de ${informe.total}`,
    "",
    "| | Regla | Descripción |",
    "|:-:|-------|-------------|",
    ...informe.hallazgos.map(linea),
    "",
  ].join("\n");
}

async function main() {
  const estado = await recoger();
  const hallazgos = reglas.map((r) => ({
    id: r.id,
    descripcion: r.descripcion,
    cumple: r.ok(estado),
  }));

  const informe: Informe = {
    repo: `${owner}/${repo}`,
    fecha: new Date().toISOString(),
    total: hallazgos.length,
    cumplidas: hallazgos.filter((h) => h.cumple).length,
    hallazgos,
  };

  console.log(formato === "json" ? JSON.stringify(informe, null, 2) : aMarkdown(informe));

  // Hay hallazgos → 1. Nunca 0 «para que el workflow salga verde».
  process.exit(informe.cumplidas === informe.total ? 0 : 1);
}

type Informe = {
  repo: string;
  fecha: string;
  total: number;
  cumplidas: number;
  hallazgos: { id: string; descripcion: string; cumple: boolean }[];
};

type GrafoRespuesta = {
  repository: {
    nameWithOwner: string;
    isPrivate: boolean;
    licenseInfo: { spdxId: string } | null;
    rulesets: { nodes: { name: string; enforcement: string }[] };
    vulnerabilityAlerts: { totalCount: number };
    releases: { nodes: { tagName: string }[] };
  };
};

main().catch((error) => {
  console.error(`No se pudo auditar: ${error instanceof Error ? error.message : error}`);
  process.exit(3); // distinto de 1: «roto» no es lo mismo que «no cumple»
});
