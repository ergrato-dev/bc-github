# Auto-merge y rama al día

> Lo que separa un PR aprobado de un PR mergeado suele ser que alguien esté
> mirando la pantalla en el momento justo. Eso se automatiza.

## 🎯 Objetivos

- Activar y usar auto-merge sin riesgo
- Entender qué exige "rama al día" y qué cuesta
- Actualizar la rama de un PR desde la CLI, con merge o con rebase
- Automatizar los PRs de dependencias sin bajar la guardia
- Saber cuándo el problema ya no se arregla con auto-merge

## 1. Qué problema resuelve

Un PR pequeño, aprobado, con el CI tardando ocho minutos. Quien lo abrió se va a
comer; quien lo aprobó, a otra cosa. El PR se mergea tres horas después, y para
entonces `main` ha avanzado y hay que actualizarlo otra vez.

Auto-merge cierra ese hueco: el PR se mergea **solo**, en cuanto se cumplen las
condiciones.

## 2. Auto-merge

```bash
gh repo edit --enable-auto-merge          # habilitarlo en el repositorio
gh pr merge 42 --auto --squash            # activarlo en un PR concreto
gh pr merge 42 --disable-auto             # desactivarlo
```

Qué espera antes de mergear: los **checks obligatorios** en verde y las
**aprobaciones requeridas**. Si algo falla, no mergea y el PR se queda esperando.

| Bueno para | Malo para |
|------------|-----------|
| PRs pequeños ya aprobados | Cambios delicados |
| CI que tarda | Cuando aún estás decidiendo |
| Dependabot y actualizaciones rutinarias | PRs sin revisión obligatoria |

> [!WARNING]
> Auto-merge con checks que **no** son obligatorios en un ruleset mergea en
> cuanto haya aprobación, **aunque el CI esté rojo**. La combinación segura es
> auto-merge **más** checks obligatorios (Semana 08). Sin lo segundo, lo primero
> es una forma automática de romper `main`.

Y un detalle de seguridad: si alguien empuja un commit nuevo al PR mientras el
auto-merge está activo, el ciclo vuelve a empezar — checks otra vez y, si el
ruleset descarta aprobaciones obsoletas, revisión otra vez.

## 3. "Rama al día": qué es y qué cuesta

Un ruleset puede exigir que la rama del PR contenga lo último de `main` antes de
mergear (*require branches to be up to date*). Sirve para evitar el fallo
silencioso clásico: dos PRs que pasan el CI por separado y rompen `main` al
juntarse.

El coste es real y crece con el equipo:

| Equipo | Efecto |
|--------|--------|
| 1-3 personas | Casi ninguno |
| 5-10 personas | Actualizas la rama varias veces al día |
| Más | Carrera constante: cada merge deja al resto desactualizado |

Cuando ese coste se nota, la respuesta no es quitar el requisito: es la **merge
queue** (Semana 08), que actualiza y prueba cada PR en orden sin que nadie
persiga a nadie.

## 4. Actualizar la rama

```bash
gh pr update-branch 42              # merge de la base en la rama del PR
gh pr update-branch 42 --rebase     # rebase de la rama sobre la base
```

Es lo mismo que el botón *Update branch* de la interfaz. Cuál usar:

| Método | Cuándo |
|--------|--------|
| Merge | La rama ya la ha visto alguien, o hay más gente encima |
| Rebase | La rama es solo tuya y quieres el diff limpio |

El detalle a tener en cuenta: **con rebase se reescribe la rama**, así que los
comentarios de línea de una revisión en curso pierden su ancla
([Teoría 04](04-responder-a-la-review.md)). Si ya te están revisando, merge.

Los conflictos que aparezcan al actualizar se resuelven como cualquier otro
([Teoría 07](07-conflictos-y-stacked.md)).

## 5. Borrar la rama al mergear

```bash
gh repo edit --delete-branch-on-merge
```

Sin esto, en seis meses tendrás doscientas ramas muertas. El commit sigue en la
historia y el PR sigue enlazándolo; la rama no aporta nada. Si alguna vez
necesitas volver, la rama se restaura desde el propio PR con un botón.

## 6. Dependencias: el caso de uso perfecto

Los PRs de actualización de dependencias son repetitivos, frecuentes y aburridos:
el sitio exacto donde la automatización gana.

```yaml
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: npm
    directory: "/"
    schedule:
      interval: weekly
    groups:
      dev-dependencies:
        dependency-type: development
```

Con auto-merge activado y checks obligatorios, un patch que pase el CI entra
solo. Dos cautelas que no hay que saltarse:

- **Solo con checks obligatorios de verdad.** Automatizar el merge de
  dependencias sin CI es instalar en producción lo que diga un tercero
- **Los cambios mayores, a mano.** Agrupar parches y revisar los saltos de
  versión mayor es lo razonable

Dependabot y la cadena de suministro se trabajan a fondo en la Semana 13.

## 7. Antipatrones

| Antipatrón | Por qué duele | Qué hacer |
|------------|---------------|-----------|
| Auto-merge sin checks obligatorios | Mergea con el CI en rojo | Ruleset con checks requeridos |
| Auto-merge en un cambio delicado | Se integra sin que nadie mire | A mano, y con testigo |
| "Rama al día" en un equipo grande sin merge queue | Carrera de actualizaciones | Merge queue (Semana 08) |
| Rebasear la rama con revisión en curso | Los comentarios pierden su ancla | Merge mientras te revisan |
| No borrar ramas | Cementerio de ramas | `--delete-branch-on-merge` |
| Auto-merge de dependencias sin tests | Instalas en producción lo que diga un tercero | CI obligatorio primero |
| Desactivar el requisito de rama al día porque molesta | Vuelven los fallos por integración | Merge queue |

## 8. Trucos

- **Activar auto-merge al abrir el PR**:
  `gh pr create --fill && gh pr merge --auto --squash`
- **Ver la configuración de merge del repositorio**:
  ```bash
  gh api repos/{owner}/{repo} --jq '{auto: .allow_auto_merge, borrar: .delete_branch_on_merge, squash: .allow_squash_merge}'
  ```
- **Saber si un PR está esperando por algo o por alguien**:
  `gh pr view 42 --json mergeStateStatus,reviewDecision`
- **Actualizar todas tus ramas de PR de golpe**:
  ```bash
  gh pr list --author @me --json number --jq '.[].number' \
    | xargs -I{} gh pr update-branch {}
  ```
- **Auto-merge no salta la revisión**: si el ruleset pide una aprobación, sigue
  haciendo falta; auto-merge solo elimina la espera
- **Si el PR lleva días con auto-merge activo**, es que algo no se cumple: mira
  `mergeStateStatus` en vez de esperar más

## 📚 Recursos Adicionales

- [GitHub Docs — Automatically merging a pull request](https://docs.github.com/pull-requests/collaborating-with-pull-requests/incorporating-changes-from-a-pull-request/automatically-merging-a-pull-request)
- [GitHub Docs — Keeping your pull request in sync](https://docs.github.com/pull-requests/collaborating-with-pull-requests/incorporating-changes-from-a-pull-request/keeping-your-pull-request-in-sync-with-the-base-branch)
- [GitHub Docs — Dependabot version updates](https://docs.github.com/code-security/dependabot/dependabot-version-updates)

## ✅ Checklist de Verificación

- [ ] Auto-merge está habilitado en tu repositorio y lo has usado en un PR
- [ ] Sabes por qué auto-merge sin checks obligatorios es peligroso
- [ ] Sabes actualizar la rama de un PR desde la CLI, y cuándo con rebase
- [ ] Las ramas se borran solas al mergear
- [ ] Sabes qué problema resuelve la merge queue que auto-merge no resuelve
