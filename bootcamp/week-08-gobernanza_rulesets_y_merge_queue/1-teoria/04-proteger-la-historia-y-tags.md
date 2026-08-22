# Proteger la historia y los tags

> Las reglas menos vistosas y las que más desastres evitan: las que impiden que
> alguien borre una rama, reescriba `main` o mueva la etiqueta de una versión ya
> publicada.

## 🎯 Objetivos

- Configurar las reglas que protegen la historia y saber qué prohíbe cada una
- Proteger tags para que una versión publicada sea inmutable
- Entender qué son los push rulesets y por qué no los tienes
- Sustituir con un check de CI lo que la plataforma no ofrece como regla

## 1. Las reglas de historia

| Regla | Qué prohíbe | Por qué importa |
|-------|-------------|-----------------|
| `non_fast_forward` | `push --force` sobre la rama | Borra trabajo ajeno sin dejar rastro visible |
| `deletion` | Borrar la rama o el tag | Evita el borrado accidental, y el intencionado |
| `required_linear_history` | Commits de merge | Coherente con `squash` o `rebase` |
| `creation` | Crear refs que coincidan con el patrón | Reservar nombres: nadie crea `release/*` a mano |
| `update` | Mover refs que coincidan | Tags inmutables: nadie mueve `v1.2.3` |

Las dos primeras son las que todo repositorio debería tener desde el primer día:
no restringen el trabajo normal en absoluto, y cierran las dos formas de perder
historia de golpe.

```json
{
  "name": "historia-inmutable",
  "target": "branch",
  "enforcement": "active",
  "conditions": { "ref_name": { "include": ["~ALL"], "exclude": [] } },
  "rules": [
    { "type": "non_fast_forward" },
    { "type": "deletion" }
  ]
}
```

Un ruleset aparte para esto, con `~ALL`, es más limpio que meterlo en el de
`main`: se puede desactivar una capa sin tocar la otra
([Teoría 01](01-rulesets-vs-branch-protection.md)).

> [!NOTE]
> `non_fast_forward` prohíbe el force push, **no** el rebase: puedes rebasear tu
> rama de trabajo todo lo que quieras. Lo que no puedes es reescribir la historia
> de una rama protegida, que es justo lo que quieres impedir.

## 2. `required_linear_history`

Prohíbe que entren commits con dos padres. Va de la mano de la estrategia de
merge de la [Semana 06](../../week-06-pull_requests_a_fondo/1-teoria/05-estrategias-de-merge.md):

| Estrategia del repositorio | ¿Compatible? |
|----------------------------|:------------:|
| Squash | ✅ |
| Rebase and merge | ✅ |
| Merge commit | ❌ Incompatible |

Es la contradicción más común al escribir el primer ruleset: exigir historia
lineal y a la vez permitir el merge commit deja el botón sin ninguna opción
válida.

Lo que ganas: `git log --oneline main` es una lista, `git bisect` no se pierde en
bifurcaciones y revertir es un commit.

## 3. Rulesets de tag

Un target que casi nadie usa y que resuelve un problema real: **una versión
publicada no debe moverse**.

```json
{
  "name": "tags-de-version",
  "target": "tag",
  "enforcement": "active",
  "conditions": { "ref_name": { "include": ["refs/tags/v*"], "exclude": [] } },
  "rules": [
    { "type": "deletion" },
    { "type": "update" },
    { "type": "required_signatures" }
  ]
}
```

Traducción: los tags `v*` no se borran, no se mueven y van firmados. Con eso,
`v1.2.3` significa lo mismo hoy que dentro de tres años — que es la única forma
de que un build sea reproducible y de que una release firmada valga algo
(Semanas 13 y 14).

`creation` en un ruleset de tag es la otra mitad: impide que cualquiera cree
tags con ese patrón, dejando la publicación en manos del workflow de release.

## 4. Push rulesets: lo que no tienes

Los **push rulesets** (`target: "push"`) bloquean el push antes de que llegue al
repositorio, y traen tres reglas propias:

| Regla | Qué hace |
|-------|----------|
| `file_path_restriction` | Prohíbe tocar rutas concretas |
| `max_file_size` | Rechaza archivos por encima de N MB |
| `file_extension_restriction` | Prohíbe extensiones (`.exe`, `.zip`, `.pem`) |

> [!IMPORTANT]
> Requieren **GitHub Team o superior** y un repositorio **privado o interno**. En
> el escenario de este bootcamp —Free, público, cuenta personal— **no están
> disponibles**. Verificado en agosto de 2026 contra
> [About rulesets](https://docs.github.com/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/about-rulesets).

Lo mismo pasa con las **metadata rules** (`commit_message_pattern`,
`commit_author_email_pattern`, `branch_name_pattern`), que exigen organización en
GitHub Enterprise.

## 5. El sustituto: un check de CI requerido

Todo lo anterior se puede exigir igual, con otra herramienta: un workflow que
falla y un check requerido. Es el patrón que cierra la semana y el puente hacia
la Semana 09.

```yaml
name: Higiene del repositorio

on:
  pull_request:

permissions:
  contents: read

jobs:
  higiene:                       # ← el context del ruleset
    runs-on: ubuntu-latest
    timeout-minutes: 5
    steps:
      - uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1
        with:
          fetch-depth: 0

      - name: Nadie toca .github/workflows sin etiqueta
        env:
          BASE: ${{ github.event.pull_request.base.sha }}
          HEAD: ${{ github.event.pull_request.head.sha }}
        run: |
          if git diff --name-only "$BASE" "$HEAD" | grep -q '^\.github/workflows/'; then
            echo "::error::Este PR toca workflows: pide revisión de plataforma"
            exit 1
          fi

      - name: Sin archivos de más de 5 MB
        run: |
          grande=$(git diff --name-only "$BASE" "$HEAD" \
            | xargs -r -I{} sh -c 'test -f "{}" && find "{}" -size +5M' | head -1)
          [ -z "$grande" ] || { echo "::error::Archivo demasiado grande: $grande"; exit 1; }
```

| Lo que no tienes como regla | Sustituto en CI |
|-----------------------------|-----------------|
| `file_path_restriction` | `git diff --name-only` + `grep` |
| `max_file_size` | `find -size +5M` sobre los archivos del diff |
| `file_extension_restriction` | `grep -E '\.(exe|zip|pem)$'` sobre el diff |
| `commit_message_pattern` | Validar el título del PR ([Semana 07](../../week-07-code_review_y_convenciones/1-teoria/03-validar-la-convencion.md)) |
| `branch_name_pattern` | Comprobar `github.head_ref` en el mismo job |

La diferencia práctica: un push ruleset **rechaza el push**; un check requerido
**bloquea el merge**. Para proteger `main` es equivalente, y además el mensaje de
error lo escribes tú.

## 6. Antipatrones

| Antipatrón | Por qué duele | Qué hacer |
|------------|---------------|-----------|
| No proteger contra `deletion` "porque nadie borraría `main`" | Un script con un `-X DELETE` sí | Es gratis: actívalo |
| `required_linear_history` con merge commits permitidos | Nada se puede mergear | Elige una historia |
| Tags sin proteger | Alguien mueve `v1.2.3` y los builds dejan de ser reproducibles | Ruleset de tag |
| Meterlo todo en un ruleset | No puedes desactivar una capa sin tocar el resto | Uno por intención |
| Buscar las push rules durante una tarde | No están en tu plan | Check de CI |
| Check de higiene sin `fetch-depth: 0` | `git diff` contra la base falla | Historia completa |
| Interpolar `github.head_ref` dentro del `run:` | Inyección de comandos | Pásalo por `env:` |

## 7. Trucos

- **Un ruleset `historia-inmutable` con `~ALL`** desde el primer día: no molesta a
  nadie y evita los dos desastres irreversibles
- **Protege los tags el mismo día que publiques la primera release**
- **Comprueba qué reglas tiene un tag**:
  `gh api repos/{owner}/{repo}/rules/branches/main` tiene su equivalente para
  refs concretas en el endpoint de rules
- **El mensaje de error del check lo escribes tú**: aprovéchalo para decir qué
  hacer, no solo qué falló
- **`::error::` en un workflow** destaca el mensaje en la interfaz del run
- **Prueba el check con un PR que lo viole a propósito** antes de exigirlo: un
  check que nunca ha fallado no sabes si funciona

## 📚 Recursos Adicionales

- [GitHub Docs — Available rules for rulesets](https://docs.github.com/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/available-rules-for-rulesets)
- [GitHub Docs — About rulesets](https://docs.github.com/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/about-rulesets)
- [GitHub Docs — Creating rulesets for tags](https://docs.github.com/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/creating-rulesets-for-a-repository)

## ✅ Checklist de Verificación

- [ ] Tienes `non_fast_forward` y `deletion` activos
- [ ] Tu historia lineal (o no) es coherente con tu método de merge
- [ ] Sabes por qué proteger los tags importa para las releases
- [ ] Sabes qué reglas de push no tienes y con qué las sustituyes
- [ ] Has visto fallar tu check de higiene con un PR que lo viola
