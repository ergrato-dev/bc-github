# Proyecto Semana 15 — Tu repositorio se audita solo

> Catorce semanas de configuración se deshacen en una tarde: alguien desactiva un
> check, caduca un secreto, se borra un ruleset «un momento». Esta semana pones a
> tu repositorio a vigilarse a sí mismo, y te llevas una herramienta que sirve
> para cualquier otro.

## 🎯 Objetivo

Convertir lo que hasta ahora comprobabas a mano —o comprobaba
`verificar-semana.sh` por ti— en **código tuyo, versionado y programado**: un
guion que interroga las dos APIs, un workflow que lo ejecuta cada semana y una
extensión de `gh` que te da el mismo resumen en cualquier repositorio.

## 📦 Qué añade esta capa

La Semana 14 dejó el repositorio demostrable desde fuera. Esta contesta la
pregunta que viene después: **¿quién comprueba, la semana que viene, que todo
eso sigue en pie?**

Al terminar tienes:

- **Una consulta GraphQL versionada** (`tools/consultas/auditoria.graphql`) que
  trae el estado del repositorio en una sola petición
- **Un guion de auditoría en TypeScript** con Octokit, que recoge de REST y de
  GraphQL, evalúa reglas puras y emite JSON o Markdown
- **Reintento y control de ritmo** por plugins: el guion se porta bien con la API
  sin que tú escribas una sola espera
- **Códigos de salida que significan cosas distintas**: `0` cumple, `1` hay
  hallazgos, `2` lo llamaste mal, `3` no se pudo auditar
- **Un workflow semanal** con `permissions` mínimas y el `GITHUB_TOKEN` del job
- **Un informe que llega a tres sitios**: el resumen de la ejecución, un artifact
  con el JSON y **un** issue que se actualiza, no cincuenta y dos al año
- **Una extensión de `gh` publicada** (`gh-auditoria`), con `--help`, salida en
  JSON, release y el topic que la hace descubrible

Y prepara la siguiente:

- **Semana 16**: webhooks y GitHub Apps — el mismo trabajo, pero reaccionando a
  eventos en vez de esperando al lunes, y con una identidad propia en vez del
  token del job

## ✅ Requisitos verificables

Son exactamente los que comprueba `checks.json`:

1. [ ] `tools/consultas/auditoria.graphql` está en la rama por defecto
2. [ ] La consulta usa variables tipadas (`$owner: String!`, `$repo: String!`)
3. [ ] Existe el label `auditoria`
4. [ ] Hay un issue abierto con ese label
5. [ ] Y **solo uno**: el informe actualiza, no acumula
6. [ ] Existe `tools/auditoria.ts`
7. [ ] Usa Octokit y pagina con `octokit.paginate`
8. [ ] Consulta GraphQL **y** REST (`vulnerability-alerts`)
9. [ ] El cliente lleva `plugin-throttling` y `plugin-retry`
10. [ ] Emite JSON además de Markdown (`--formato`)
11. [ ] Sale con código `3` cuando no pudo auditar
12. [ ] `package.json` declara `octokit`
13. [ ] `.github/workflows/auditoria.yml` con `cron` y `workflow_dispatch`
14. [ ] Con `permissions` explícitas e `issues: write`
15. [ ] Usando `secrets.GITHUB_TOKEN`, no un PAT
16. [ ] Sin ninguna action por tag flotante
17. [ ] El workflow se ha ejecutado al menos una vez
18. [ ] El repositorio `gh-auditoria` existe y es público
19. [ ] Con el topic `gh-extension`
20. [ ] Con el ejecutable `gh-auditoria` en la raíz
21. [ ] Con al menos un release
22. [ ] Y un README con el comando de instalación
23. [ ] Tu `README.md` explica la auditoría y enlaza la extensión
24. [ ] `tools/auditoria.ts` tiene contenido real (comprobado por GraphQL)

> [!NOTE]
> La comprobación 24 se declara con `graphql` en vez de `api`: es el ejemplo, en
> tu propio autograding, de que las dos APIs conviven. Puedes leer cómo funciona
> en [`docs/autograding.md`](../../../docs/autograding.md).

> [!IMPORTANT]
> Las comprobaciones 18 a 22 leen el **repositorio de la extensión**, que es el
> único auxiliar de esta semana. Tiene que llamarse exactamente `gh-auditoria` y
> ser tuyo: el prefijo `gh-` es parte del contrato de las extensiones, no una
> convención de este bootcamp.

## 🎨 Criterios de calidad

Lo que la API no ve:

- **Las reglas son accionables.** Auditar quince cosas que nadie va a arreglar
  enseña a ignorar el informe entero, y entonces el hallazgo que importaba pasa
  desapercibido con los demás
- **Cada API hace lo que solo ella puede.** Si sacas los workflows con veinte
  llamadas REST pudiendo… no puedes: no están en GraphQL. Pero si cuentas issues
  paginando en vez de con `totalCount`, ahí sí te estás equivocando
- **El guion no miente cuando está roto.** Un `catch` que devuelve «todo bien» es
  peor que no auditar: parece verde durante meses
- **La salida nativa es JSON.** El Markdown se deriva; al revés, el informe no se
  puede comparar entre semanas
- **El token es el del job.** Un PAT tuyo en un secreto tiene tus permisos sobre
  **todos** tus repositorios; el `GITHUB_TOKEN` solo los declarados sobre este
- **La extensión se puede usar sin leer el código.** `--help`, argumentos con
  nombre, errores a `stderr` y códigos de salida distintos
- **El informe se lee.** Un issue actualizado que alguien mira vale más que un
  artifact perfecto que nadie descarga

## 📐 Cómo se ve al terminar

```
<tu-repo>/
├── .github/workflows/
│   ├── ci.yml · release.yml · codeql.yml · scorecard.yml   # Semanas 09-14
│   └── auditoria.yml            # ← lunes 06:17 UTC + workflow_dispatch
├── tools/
│   ├── auditoria.ts             # ← Octokit: REST + GraphQL + reglas
│   └── consultas/
│       └── auditoria.graphql    # ← una consulta, cost 1
├── package.json                 # ← dependencia octokit + script "auditoria"
└── README.md                    # ← cómo auditarlo y dónde está la extensión

<tu-usuario>/gh-auditoria/        # repositorio auxiliar (extensión de gh)
├── gh-auditoria                 # ← ejecutable, mismo nombre que el repo
└── README.md                    # ← instalación y ejemplo de salida
   topics: gh-extension · release v1.0.0

En el repositorio, y no en el código:
  label "auditoria"                       → creado por API
  issue "Auditoría del repositorio"       → uno solo, actualizado cada semana
```

## 🔍 Autoevaluación

Antes de dar la semana por cerrada, contesta sin mirar:

1. ¿Por qué `gh api --paginate --jq 'length'` no te da el total?
2. ¿Qué dos condiciones tiene que cumplir una consulta para que `--paginate` la recorra?
3. ¿Por qué `-f query=@archivo.graphql` no funciona y `-F` sí?
4. ¿Cuánto cuesta en GraphQL traer 100 issues con 10 comentarios cada uno, y cuánto en REST?
5. ¿Qué diferencia hay entre el límite primario y el secundario, y cómo avisa cada uno?
6. ¿Cuántas peticiones por hora tiene el `GITHUB_TOKEN` de un job?
7. ¿Por qué un error de GraphQL llega con `HTTP 200`?
8. ¿Qué diferencia el código de salida `1` del `3` en tu guion, y por qué importa?
9. ¿Qué tres reglas tiene que cumplir un repositorio para ser una extensión de `gh`?
10. ¿Qué estás autorizando exactamente al ejecutar `gh extension install` de un tercero?

## ✅ Verificación

```bash
./scripts/verificar-semana.sh 15 --repo <tu-usuario>/<tu-repo>
```

---

← [Volver a la Semana 15](../README.md)
