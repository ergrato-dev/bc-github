<p align="center">
  <img src="assets/bootcamp-header.svg" alt="GitHub Bootcamp Zero to Master" width="800">
</p>

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-CC%20BY--NC--SA%204.0-lightgrey.svg" alt="License CC BY-NC-SA 4.0"></a>
  <a href="#"><img src="https://img.shields.io/badge/weeks-21-yellow.svg" alt="21 Weeks"></a>
  <a href="#"><img src="https://img.shields.io/badge/hours-168-orange.svg" alt="168 Hours"></a>
  <a href="#"><img src="https://img.shields.io/badge/GitHub-181717?logo=github&logoColor=white" alt="GitHub"></a>
  <a href="#"><img src="https://img.shields.io/badge/gh_CLI-2.x-58A6FF?logo=github&logoColor=white" alt="gh CLI"></a>
  <a href="#"><img src="https://img.shields.io/badge/Actions-2088FF?logo=githubactions&logoColor=white" alt="GitHub Actions"></a>
</p>

<p align="center">
  <a href="README.md"><img src="https://img.shields.io/badge/🇪🇸_Español-0969DA?style=for-the-badge&logoColor=white" alt="Spanish Version"></a>
</p>

---

> [!NOTE]
> The course material itself (theory, exercises, glossaries) is written in
> **Spanish**. This file is an English overview of the program.

## 📋 Overview

A **21-week (~5 months)** bootcamp on **GitHub as an engineering platform** —
not as "the place where I push code". Built for fullstack developers moving
toward **DevOps / Platform Engineering**: by the end you are the person who
designs the repo rulesets, writes the team's custom actions, signs the releases
and locks down the supply chain.

It is **asynchronous self-study**: every week ships automated verification of
your deliverables against the real GitHub API.

### 🎯 Outcomes

By the end of the bootcamp you will be able to:

- ✅ Use Git surgically (`rebase -i`, `reflog`, `bisect`, `worktree`)
- ✅ Turn a repository into a product: docs, templates, CODEOWNERS, Pages
- ✅ Design issue taxonomies and triage flows that scale
- ✅ Model work in **GitHub Projects v2** and automate it over GraphQL
- ✅ Master the Pull Request cycle: review, suggestions, merge queue, stacked PRs
- ✅ Govern repos with **rulesets**, required checks and signed commits
- ✅ Write production-grade **GitHub Actions**: matrices, caching, reusables, custom actions
- ✅ Deploy without long-lived secrets using **OIDC** and protected environments
- ✅ Publish versioned releases to **GHCR** and npm with verifiable provenance
- ✅ Close the supply chain: Dependabot, CodeQL, secret scanning, attestations
- ✅ Automate GitHub through **REST, GraphQL, the `gh` CLI and GitHub Apps**
- ✅ Administer organizations: teams, roles, policies and the audit log
- ✅ Operate monorepos and huge repos (path filters, partial clone, LFS, `filter-repo`)
- ✅ Contribute to open source for real and maintain a community
- ✅ Work in **Codespaces** and with **Copilot** (code review, agents, Models)

---

## 🗓️ Program Structure

|          Phase          | Weeks | Hours | Main Topics                                          |
| :---------------------: | :---: | :---: | ---------------------------------------------------- |
| **Platform Foundations**|  1-3  |  24h  | Pro setup, repo as a product, issues and triage      |
| **Collaboration**       |  4-8  |  40h  | Projects v2, Pull Requests, code review, rulesets    |
| **Automation**          | 9-12  |  32h  | Actions in depth, CD with OIDC, releases and packages|
| **Security**            | 13-14 |  16h  | Dependabot, CodeQL, secret scanning, supply chain    |
| **Programmability**     | 15-16 |  16h  | REST/GraphQL, `gh` CLI, webhooks, GitHub Apps        |
| **Scale & Community**   | 17-20 |  32h  | Organizations, monorepos, OSS, Codespaces + Copilot  |
| **Capstone**            |  21   |   8h  | Final project: production-grade repository           |

**Total: 21 weeks** | **168 hours**

---

## 📚 Weekly Content

| Week | Topic                                     | Description                                                        |
| :--: | ----------------------------------------- | ------------------------------------------------------------------ |
|  01  | `git_repaso_y_setup_pro`                  | Surgical Git, SSH/signed commits, `gh` CLI, tokens, profile        |
|  02  | `repositorio_como_producto`               | README, LICENSE, CODEOWNERS, GFM Markdown, search, Pages           |
|  03  | `issues_y_triage`                         | YAML issue forms, labels, milestones, sub-issues, triage           |
|  04  | `projects_v2_fundamentos`                 | Data model, fields, views, roadmap, built-in workflows             |
|  05  | `projects_v2_automatizacion_y_metricas`   | Projects GraphQL API, insights, DORA-lite metrics                  |
|  06  | `pull_requests_a_fondo`                   | Draft, review, suggestions, merge strategies, stacked PRs          |
|  07  | `code_review_y_convenciones`              | Review culture, Conventional Commits, CODEOWNERS, GitHub flow      |
|  08  | `gobernanza_rulesets_y_merge_queue`       | Rulesets, required checks, push rules, environments, merge queue   |
|  09  | `actions_fundamentos`                     | Events, contexts, expressions, matrices, artifacts, cache, debugging|
|  10  | `actions_reutilizacion_y_actions_propias` | Reusable workflows, composite, JS/Docker actions, Marketplace      |
|  11  | `actions_seguridad_entornos_y_cd`         | `permissions`, SHA pinning, OIDC, environments, self-hosted runners|
|  12  | `releases_y_packages`                     | SemVer, release-please, GHCR, npm publish, provenance              |
|  13  | `seguridad_dependabot_y_code_scanning`    | Dependabot version updates, CodeQL, third-party SARIF              |
|  14  | `seguridad_supply_chain_y_hardening`      | Secret scanning, push protection, advisories, SBOM, attestations   |
|  15  | `api_rest_graphql_y_gh_cli`               | Octokit, REST vs GraphQL, `gh api --jq`, `gh` extensions           |
|  16  | `webhooks_apps_y_bots`                    | Webhooks + HMAC, GitHub Apps vs PAT, triage bots, ChatOps          |
|  17  | `organizaciones_teams_y_politicas`        | Roles, teams, org rulesets, audit log, Actions policies            |
|  18  | `monorepos_y_repos_a_escala`              | Path filters, sparse-checkout, LFS, submodules, `git filter-repo`  |
|  19  | `oss_y_comunidad`                         | Forks and upstream, real contribution, Discussions, maintenance    |
|  20  | `codespaces_devcontainers_y_copilot`      | `devcontainer.json`, prebuilds, Copilot code review, agents, Models|
|  21  | `proyecto_final_repo_production_grade`    | Integration and audit of the previous 20 weeks                     |

Each week folder contains:

```
bootcamp/week-XX-topic/
├── README.md                 # Objectives, content, timing, tricks, deliverables
├── rubrica-evaluacion.md     # Grading rubric
├── checks.json               # Automated verification (gh api)
├── 0-assets/                 # SVG diagrams
├── 1-teoria/                 # Theory
├── 2-practicas/              # Guided exercises
├── 3-proyecto/               # Weekly layer of your continuous project
├── 4-recursos/               # ebooks-free / videografia / webgrafia
└── 5-glosario/               # Key terms
```

---

## 🛠️ Tooling

| Tool                  | Version   | Purpose                                  |
| --------------------- | --------- | ---------------------------------------- |
| Git                   | **2.40+** | Version control                          |
| GitHub CLI (`gh`)     | **2.x**   | Driving GitHub from the terminal         |
| `jq`                  | **1.6+**  | Processing API responses                 |
| Node.js               | **22+**   | Demo stack for workflows and actions     |
| pnpm                  | **10.x**  | Package manager for the demo stack       |
| Docker                | **26+**   | Container actions, GHCR, devcontainers   |
| `act` *(optional)*    | **0.2.x** | Running workflows locally                |
| `git-filter-repo`     | **2.x**   | History rewriting (Week 18)              |

**Account required**: GitHub **Free** is enough. All practice happens on
**public repositories**, where Actions, rulesets, CodeQL, secret scanning,
Projects v2, Pages and GHCR are available at no cost. Team/Enterprise-only
features (SAML, EMU, advanced runner groups) are covered conceptually in Week 17.

---

## 🚀 Quick Start

```bash
git clone https://github.com/ergrato-dev/bc-github.git
cd bc-github

gh auth login
gh auth status
./scripts/verificar-semana.sh --doctor

cd bootcamp/week-01-git_repaso_y_setup_pro
```

The whole bootcamp builds **one repository of your own**, week by week. Read
[`docs/proyecto-hilo-conductor.md`](docs/proyecto-hilo-conductor.md) first.

## ✅ Automated Verification

```bash
./scripts/verificar-semana.sh 01 --repo your-user/your-repo
```

Each week declares its checks in `checks.json`; the script turns them into
`gh api` calls against your real repository. See
[`docs/autograding.md`](docs/autograding.md).

---

## 📊 Methodology

- 🎯 **One growing repo**: every week adds a real layer to your project
- 🧩 **Deliberate practice**: operations on GitHub, not passive reading
- 🔬 **Reverse engineering**: read large public repos and understand their choices
- 🎩 **Accumulated tricks**: [`docs/trucos-github.md`](docs/trucos-github.md) grows with you
- 🤖 **API verification**: the repo's real state is the only valid proof

**Weekly time split (8h)**: theory 2h · practice 3-4h · project 2-3h

**Assessment**: knowledge 30% · performance 40% · product 30% — 70% minimum in each.

---

## ⚠️ Disclaimer

Educational material provided **"as is"**, with no warranties. GitHub's UI and
features change constantly — the official documentation always wins. Ruleset,
permission and workflow examples are illustrative: review them against your own
policies before applying them to an organization repo. Actions, Codespaces,
Copilot and Packages have quotas and pricing that change; the exercises are
designed for the Free plan on public repositories. You are responsible for your
own repositories, tokens and credentials.

## 📄 License

**[CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/)** —
share and adapt with attribution, non-commercial, same license. See [LICENSE](LICENSE).

---

<p align="center">
  <strong>🎓 GitHub Bootcamp - Zero to Master</strong><br>
  <em>From using GitHub to owning the platform</em>
</p>

<p align="center">
  <a href="bootcamp/week-01-git_repaso_y_setup_pro">Start Week 1</a> •
  <a href="docs">Documentation</a> •
  <a href="https://github.com/ergrato-dev/bc-github/issues">Report an Issue</a>
</p>
