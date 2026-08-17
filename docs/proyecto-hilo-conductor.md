# 🧵 Proyecto Hilo Conductor

Las 21 semanas construyen **un solo repositorio tuyo**. No hay 21 repos
desechables: hay uno que empieza vacío en la Semana 01 y termina siendo un repo
production-grade que puedes enseñar en una entrevista.

---

## 1. Elige tu dominio

Tu repositorio necesita un dominio real. No importa cuál — importa que sea
concreto y que te dure 21 semanas sin aburrirte.

| Dominio | Recurso principal | Ejemplo de issue real |
| --- | --- | --- |
| 📖 Biblioteca | Libros, préstamos | "Un préstamo vencido no notifica" |
| 🏋️ Gimnasio | Miembros, rutinas | "Permitir reservar clase con cupo lleno" |
| 🎥 Cine | Funciones, asientos | "Doble reserva del mismo asiento" |
| 🛠️ Taller | Órdenes de trabajo | "Falta historial de piezas cambiadas" |
| 💊 Farmacia | Inventario, lotes | "Alertar medicamentos por vencer" |
| 🏞️ Hotel | Habitaciones, reservas | "Overbooking en temporada alta" |

O el tuyo propio. La única regla: **que puedas inventar issues creíbles**, porque
vas a escribir docenas.

> [!TIP]
> Elige algo que conozcas de la vida real. Los issues salen solos y el
> repositorio se lee como un proyecto de verdad, no como un ejercicio.

## 2. El software

El repositorio necesita **algo de código** para que CI, CodeQL, releases y
packages tengan qué morder. No es un bootcamp de programación: el código puede
ser mínimo.

Mínimo suficiente: una librería o CLI en **TypeScript** con

- 3-5 funciones con lógica de tu dominio
- tests con el runner nativo de Node (`node:test`) o Vitest
- un `package.json` publicable

Ejemplo (dominio biblioteca): `calcularMulta(diasRetraso)`,
`estaDisponible(libro)`, `puedePrestar(socio)`. Suficiente para que haya tests
que fallen, PRs que revisar y releases que versionar.

> [!NOTE]
> ¿Ya tienes un proyecto propio? Úsalo, siempre que sea **público** y puedas
> reescribir su historia sin drama. Es la mejor opción: aplicas las 21 semanas
> sobre algo que te importa.

## 3. Qué capa añade cada semana

| Semana | Capa que se añade a tu repo |
| :--: | --- |
| 01 | El repo existe, público, con commits firmados y descripción |
| 02 | README, LICENSE, `.gitignore`, `.gitattributes`, CODEOWNERS, topics, Pages |
| 03 | Issue forms, taxonomía de labels, milestone, primeros issues reales |
| 04 | Project v2 con campos, vistas y roadmap |
| 05 | Automatización del project + panel de métricas |
| 06 | Primeros PRs con review propio, plantilla de PR, estrategia de merge elegida |
| 07 | `CONTRIBUTING.md`, Conventional Commits, CODEOWNERS enrutando revisores |
| 08 | Ruleset en `main` con required checks y commits firmados |
| 09 | Workflow de CI con matriz, caché y artifacts |
| 10 | Reusable workflow + una action propia publicada |
| 11 | Despliegue a Pages por Actions con `permissions` mínimas y environment |
| 12 | Primer release `v1.0.0` con changelog automático + imagen en GHCR |
| 13 | `dependabot.yml` + CodeQL activo y en verde |
| 14 | Push protection, `SECURITY.md`, attestations, Scorecard |
| 15 | Script de auditoría de tu repo con `gh api` + una extensión de `gh` |
| 16 | Bot de triage propio reaccionando a issues |
| 17 | Organización con teams y un ruleset de organización |
| 18 | Path filters en CI y un ejercicio de reescritura de historia |
| 19 | Discussions abiertas + una contribución real a un proyecto ajeno |
| 20 | `devcontainer.json` + Copilot code review activo |
| 21 | Auditoría completa y `v2.0.0` |

## 4. Reglas del repositorio

1. **Público.** Todo el bootcamp asume repo público — es donde las features son
   gratis y donde se puede verificar por API.
2. **Un solo repo.** Salvo la Semana 10 (action propia) y la 17 (organización),
   que crean repos auxiliares.
3. **Nunca secretos reales.** Ni de prueba. Es un repo público indexado.
4. **La historia se conserva.** No borres y recrees el repo: el histórico de
   issues, PRs y releases *es* el entregable. La única reescritura permitida es
   la de la Semana 18, y con backup.

## 5. Crearlo (Semana 01)

```bash
gh repo create <tu-repo> --public --clone \
  --description "Gestión de <tu dominio> — proyecto del Bootcamp GitHub"
cd <tu-repo>
```

Guarda el nombre completo: lo vas a pasar a todas las verificaciones.

```bash
echo "REPO=<tu-usuario>/<tu-repo>" > ~/.bc-github
./scripts/verificar-semana.sh 01 --repo <tu-usuario>/<tu-repo>
```

## 6. Cómo se ve al final

Al terminar la Semana 21 tu repositorio tiene:

- Historia de commits firmados y convencionales, legible
- Issues y PRs enlazados, con labels y milestones que significan algo
- Un Project v2 con métricas de flujo
- Ruleset protegiendo `main` con checks obligatorios
- CI en matriz, caché, artifacts y despliegue automático
- Una action propia publicada en Marketplace
- Releases versionados con changelog, imagen en GHCR y procedencia verificable
- CodeQL, Dependabot y secret scanning activos y verdes
- Un bot propio automatizando el triage
- Un devcontainer que levanta el proyecto en Codespaces en un clic

Eso no es un ejercicio. Es un portafolio.
