# Semana 01 — Git repaso y setup pro

> Sales de esta semana con Git bajo control quirúrgico, una identidad
> criptográfica en GitHub y el repositorio que vas a construir durante 21
> semanas ya en marcha.

## 🎯 Objetivos de la Semana

Al finalizar esta semana serás capaz de:

- Explicar la historia de Git como un **grafo de commits**, no como una lista
- Reescribir historia con `rebase -i` (squash, fixup, reword, drop) sin miedo
- Recuperar trabajo "perdido" con `reflog` — incluido un `reset --hard` fatal
- Encontrar el commit que introdujo un bug con `bisect`, de forma automática
- Trabajar en dos ramas a la vez con `worktree`, sin `stash` de por medio
- Configurar **commits firmados** con tu clave SSH y verlos como `Verified`
- Elegir el tipo de credencial correcto: `GITHUB_TOKEN`, fine-grained PAT, PAT clásico o GitHub App
- Operar GitHub desde la terminal con `gh`
- Tener creado y configurado tu **repositorio hilo conductor**

## 📋 Prerrequisitos

- Git 2.40+, `gh` 2.x y `jq` instalados y funcionando
- Cuenta de GitHub con 2FA activo
- [`docs/setup-entorno.md`](../../docs/setup-entorno.md) completado
- Git básico: `clone`, `add`, `commit`, `push`, `branch`, `merge`

## 🗂️ Estructura de la Semana

```
week-01-git_repaso_y_setup_pro/
├── 1-teoria/
│   ├── 01-modelo-mental-de-git.md      # Objetos, refs, HEAD, índice, el DAG
│   ├── 02-reescribir-historia.md       # amend, rebase -i, autosquash, --onto, force-with-lease
│   ├── 03-rescate-y-arqueologia.md     # reflog, fsck, stash, cherry-pick, pickaxe
│   ├── 04-bisect-y-worktree.md         # Búsqueda binaria del bug, varias ramas a la vez
│   ├── 05-identidad-y-firmas.md        # SSH, commits firmados, modo vigilante, email privado
│   ├── 06-gh-cli.md                    # gh, gh api, --json/--jq, alias y extensiones
│   └── 07-credenciales-y-tokens.md     # GITHUB_TOKEN, PAT, GitHub App, filtraciones
├── 2-practicas/
│   ├── 01-rescate-con-reflog.md     # Destruir trabajo y recuperarlo
│   ├── 02-historia-limpia.md        # rebase -i y autosquash
│   ├── 03-bisect-y-worktree.md      # Cazar un bug en 4 pasos
│   └── 04-firmas-y-gh.md            # Identidad criptográfica + gh
├── 3-proyecto/
│   └── README.md                    # Tu repositorio hilo conductor
├── 0-assets/
│   ├── 01-grafo-commits.svg
│   └── 02-flujo-firma-commits.svg
├── 4-recursos/
└── 5-glosario/
```

## 📝 Contenidos

### Teoría

| Archivo | Tema | Duración |
|---------|------|:--------:|
| [01-modelo-mental-de-git.md](1-teoria/01-modelo-mental-de-git.md) | Objetos, refs, índice, el grafo y cómo nombrar commits | 25 min |
| [02-reescribir-historia.md](1-teoria/02-reescribir-historia.md) | `amend`, `rebase -i`, `--autosquash`, `--onto`, forzar sin destruir | 25 min |
| [03-rescate-y-arqueologia.md](1-teoria/03-rescate-y-arqueologia.md) | `reflog`, `fsck`, `stash`, `cherry-pick`, buscar en la historia | 20 min |
| [04-bisect-y-worktree.md](1-teoria/04-bisect-y-worktree.md) | Búsqueda binaria del bug y varias ramas a la vez | 20 min |
| [05-identidad-y-firmas.md](1-teoria/05-identidad-y-firmas.md) | SSH, firmas, `Verified` y modo vigilante | 25 min |
| [06-gh-cli.md](1-teoria/06-gh-cli.md) | `gh`, `gh api`, salidas en JSON, alias y extensiones | 20 min |
| [07-credenciales-y-tokens.md](1-teoria/07-credenciales-y-tokens.md) | Los cuatro tipos de credencial y qué hacer ante una filtración | 20 min |

### Prácticas

| Práctica | Qué haces | Duración |
|----------|-----------|:--------:|
| [01-rescate-con-reflog.md](2-practicas/01-rescate-con-reflog.md) | Borras trabajo a propósito y lo recuperas | 50 min |
| [02-historia-limpia.md](2-practicas/02-historia-limpia.md) | Conviertes 6 commits sucios en 2 legibles | 50 min |
| [03-bisect-y-worktree.md](2-practicas/03-bisect-y-worktree.md) | Encuentras el commit culpable con `bisect run` | 45 min |
| [04-firmas-y-gh.md](2-practicas/04-firmas-y-gh.md) | Firmas commits y operas GitHub desde la terminal | 45 min |

### Proyecto

Creas tu **repositorio hilo conductor**: público, con descripción, rama `main`,
commits firmados y tu perfil README. Es el repo que crece durante las 21
semanas. → [3-proyecto/README.md](3-proyecto/README.md)

## ⏱️ Distribución del Tiempo (8 horas)

| Actividad | Tiempo |
|-----------|-------:|
| Teoría (7 archivos) | 2 h 35 min |
| Práctica 01 — Rescate con reflog | 50 min |
| Práctica 02 — Historia limpia | 50 min |
| Práctica 03 — Bisect y worktree | 45 min |
| Práctica 04 — Firmas y `gh` | 45 min |
| Proyecto — Repositorio hilo conductor | 1 h 45 min |
| Revisión y verificación | 30 min |
| **Total** | **8 h** |

## 🎩 Trucos y atajos

| Truco | Cómo |
|-------|------|
| `reflog` es tu deshacer universal | `git reflog` guarda 90 días de todo movimiento de `HEAD`. Nada commiteado se pierde de verdad |
| Conflictos que se resuelven solos la segunda vez | `git config --global rerere.enabled true` — Git recuerda cómo resolviste un conflicto y lo reaplica |
| `push` sin `--set-upstream` | `git config --global push.autoSetupRemote true` |
| Commits de arreglo que se colocan solos | `git commit --fixup <sha>` + `git rebase -i --autosquash` |
| Diff que no te miente cuando mueves código | `git config --global diff.colorMoved zebra` |
| Dos ramas abiertas sin `stash` | `git worktree add ../hotfix main` — otra carpeta, mismo repo |
| Abrir en el navegador lo que estás mirando | `gh browse` (archivo actual: `gh browse src/index.ts`) |
| Ver cualquier cosa de la API sin salir de la terminal | `gh api user --jq .login` |
| Firmar sin GPG | `gpg.format = ssh` reutiliza tu clave SSH. Sube la **misma clave dos veces**: como `authentication` y como `signing` |

## 📌 Entregables

1. ✅ Práctica 01: capturas o log del rescate con `reflog`
2. ✅ Práctica 02: historia de 2 commits limpios a partir de 6 sucios
3. ✅ Práctica 03: `git bisect run` identificando el commit culpable
4. ✅ Práctica 04: `gh auth status` correcto y un commit `Verified`
5. ✅ Proyecto: repositorio hilo conductor creado, público, con descripción,
   rama `main`, al menos 3 commits firmados y tu perfil README publicado

## ✅ Verificación

```bash
./scripts/verificar-semana.sh 01 --repo <tu-usuario>/<tu-repo>
```

## 🔗 Navegación

| Anterior | Actual | Siguiente |
|----------|--------|-----------|
| [← Inicio del bootcamp](../../README.md) | **Semana 01: Git repaso y setup pro** | [Semana 02: Repositorio como producto →](../week-02-repositorio_como_producto/README.md) |
