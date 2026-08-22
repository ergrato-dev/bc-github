// El pegamento: lee el entorno, llama a la lógica, escribe el output.
// Todo lo que sea decidir vive en tamano.mjs, que sí se puede probar.

import { appendFileSync, readFileSync } from "node:fs";
import { calcularTamano } from "./tamano.mjs";

const token = process.env.INPUT_TOKEN;
const umbral = Number(process.env["INPUT_UMBRAL-GRANDE"] ?? 400);
const repo = process.env.GITHUB_REPOSITORY;

const evento = JSON.parse(readFileSync(process.env.GITHUB_EVENT_PATH, "utf8"));
const pr = evento.pull_request;

// Un evento sin pull_request no es un error: es que esta action no aplica.
if (!pr) {
  console.log("::notice::Este evento no trae pull_request; no hay nada que etiquetar.");
  process.exit(0);
}

const lineas = pr.additions + pr.deletions;
const tamano = calcularTamano(lineas, umbral);

const respuesta = await fetch(
  `https://api.github.com/repos/${repo}/issues/${pr.number}/labels`,
  {
    method: "POST",
    headers: {
      authorization: `Bearer ${token}`,
      accept: "application/vnd.github+json",
      "x-github-api-version": "2022-11-28",
    },
    body: JSON.stringify({ labels: [`tamano:${tamano}`] }),
  },
);

if (!respuesta.ok) {
  const cuerpo = await respuesta.text();
  if (respuesta.status === 403) {
    console.log(
      "::error::403 al etiquetar. El workflow necesita 'permissions: pull-requests: write'.",
    );
  } else if (respuesta.status === 404) {
    console.log(
      `::error::404 al etiquetar. ¿Existe la label 'tamano:${tamano}' en el repositorio?`,
    );
  } else {
    console.log(`::error::La API respondió ${respuesta.status}: ${cuerpo}`);
  }
  process.exit(1);
}

appendFileSync(process.env.GITHUB_OUTPUT, `tamano=${tamano}\n`);
appendFileSync(
  process.env.GITHUB_STEP_SUMMARY ?? "/dev/null",
  `### Tamaño del PR\n\n${lineas} líneas → \`tamano:${tamano}\`\n`,
);
console.log(`::notice::PR de ${lineas} líneas etiquetado como ${tamano}`);
