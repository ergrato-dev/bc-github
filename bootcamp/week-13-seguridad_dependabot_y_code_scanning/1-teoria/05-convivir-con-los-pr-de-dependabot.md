# Convivir con los pull requests de Dependabot

> Activar Dependabot es media hora. Convivir con él es el resto del proyecto. La
> pregunta no es «¿lo tengo activo?» sino «¿qué pasa cada lunes cuando aparecen
> cuatro pull requests que nadie pidió?». Si la respuesta es «se quedan ahí», el
> sistema no está funcionando, esté activado o no.

## 🎯 Objetivos

- Dirigir a Dependabot desde los comentarios del pull request
- Explicar por qué un workflow disparado por Dependabot tiene menos permisos
- Guardar credenciales donde Dependabot pueda leerlas
- Fusionar automáticamente lo aburrido sin abrir la puerta a lo peligroso
- Reconocer el patrón inseguro que aparece en casi todos los tutoriales

## 1. Qué problema resuelve

Los pull requests de Dependabot son distintos del resto: son muchos, casi todos
triviales, y el coste de revisarlos uno a uno supera el valor de revisarlos. Al
mismo tiempo, algunos **no** son triviales, y fusionarlos todos a ciegas es peor
que no tener Dependabot.

La solución no es elegir entre las dos, es **separarlos**: automatizar los
aburridos, dejar a la gente los que exigen una decisión.

## 2. Hablarle desde el pull request

Dependabot obedece comentarios en sus propios pull requests. Los que se usan a
diario:

| Comando | Qué hace |
|---------|----------|
| `@dependabot rebase` | Rebasa el pull request sobre la rama base actual |
| `@dependabot recreate` | Lo reconstruye desde cero, descartando ediciones |
| `@dependabot ignore this dependency` | Lo cierra y no vuelve a abrir PR de esa dependencia |
| `@dependabot ignore this major version` | Lo cierra y no vuelve a proponer esa mayor |
| `@dependabot ignore this minor version` | Igual, para esa menor |
| `@dependabot show <paquete> ignore conditions` | Comenta qué condiciones de ignorado hay guardadas |
| `@dependabot unignore <paquete>` | Borra las condiciones guardadas y reabre |
| `@dependabot unignore *` | Las borra todas para el grupo |

Las condiciones que crean los `ignore this ...` **no se escriben en tu
`dependabot.yml`**: se guardan del lado de GitHub. Por eso existe
`show ... ignore conditions`, y por eso una configuración de ignorados repartida
entre el archivo y los comentarios acaba siendo imposible de auditar.

> [!TIP]
> Si un ignorado va a durar, escríbelo en el `dependabot.yml`. El comentario es
> para lo temporal: queda fuera del control de versiones y nadie lo encuentra
> seis meses después.

## 3. Un actor con menos permisos

Cuando un evento de Dependabot dispara un workflow, pasan dos cosas que rompen
las suposiciones normales:

1. El `GITHUB_TOKEN` llega con **permisos de solo lectura**, aunque el
   repositorio esté configurado de otra forma
2. Los **secretos de Actions no están disponibles**. Solo lo están los secretos
   de Dependabot

```bash
# Los secretos de Dependabot son un almacén aparte
gh secret set NPM_TOKEN_LECTURA --app dependabot
gh secret list --app dependabot
```

Se leen con la misma sintaxis, `${{ secrets.NOMBRE }}`, pero salen de otro sitio.
Si un workflow lo usan Dependabot y las personas, el truco es guardar el secreto
con el **mismo nombre** en los dos almacenes.

Para subir permisos, el workflow los pide explícitamente:

```yaml
permissions:
  contents: read

jobs:
  auto-merge:
    runs-on: ubuntu-latest
    if: github.event.pull_request.user.login == 'dependabot[bot]'
    permissions:
      contents: write        # para fusionar
      pull-requests: write   # para aprobar y comentar
```

## 4. El patrón inseguro

Como el token es de solo lectura, muchos tutoriales «lo arreglan» cambiando el
disparador a `pull_request_target`. Ese evento **sí** trae permisos completos y
secretos… porque se ejecuta en el contexto de la rama base.

> [!WARNING]
> `pull_request_target` con `actions/checkout` apuntando al código del pull
> request ejecuta código no confiable con un token privilegiado y acceso a los
> secretos del repositorio. Es la vulnerabilidad clásica de GitHub Actions, y con
> Dependabot no hace ninguna falta: el pull request es de un bot, pero el
> contenido que trae es de un registro público que tú no controlas.
>
> Si necesitas ese evento para algo, no hagas checkout de la rama del PR y no
> ejecutes nada del código propuesto. Lo vimos en la Semana 11.

Lo correcto es `pull_request` con los permisos justos en el job, que es lo que
hace el ejemplo de la sección anterior.

## 5. Automatizar lo aburrido

`dependabot/fetch-metadata` lee el pull request y expone qué se está actualizando
y de qué tipo. Con eso se puede decidir sin adivinar por el título:

```yaml
name: Auto-merge de Dependabot

on: pull_request

permissions:
  contents: read

jobs:
  automerge:
    runs-on: ubuntu-latest
    if: github.event.pull_request.user.login == 'dependabot[bot]'
    permissions:
      contents: write
      pull-requests: write
    steps:
      - id: meta
        uses: dependabot/fetch-metadata@25dd0e34f4fe68f24cc83900b1fe3fe149efef98 # v3.1.0

      - if: steps.meta.outputs.update-type == 'version-update:semver-patch'
        run: gh pr merge --auto --squash "$PR"
        env:
          PR: ${{ github.event.pull_request.html_url }}
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

Tres detalles que deciden si esto es seguro o temerario:

- **`--auto`** no fusiona: activa la fusión automática, que espera a que pasen
  los checks obligatorios del ruleset de la Semana 08. Sin required checks, esto
  fusiona sin CI y es exactamente lo que no quieres
- **Solo `semver-patch`**. Los `minor` y `major` siguen pasando por una persona.
  Los outputs de la action distinguen `version-update:semver-patch`,
  `semver-minor` y `semver-major`
- **El `if` mira `github.event.pull_request.user.login`**, no el título ni la
  rama: son falsificables por cualquiera que abra un PR

Una variante que aporta más de lo que parece: en vez de fusionar, **aprobar** el
pull request. Deja constancia de que la automatización lo miró y sigue exigiendo
que alguien pulse el botón cuando eso importa.

> [!NOTE]
> Si la rama base usa **merge queue**, el `GITHUB_TOKEN` no puede añadir el pull
> request a la cola. Ahí hace falta un token de usuario o una GitHub App
> (Semana 16), igual que pasaba con `release-please` en la Semana 12.

## 6. El ritmo humano

La automatización no cubre los `minor` y `major`. Para esos, lo que funciona es
un momento fijo y corto:

1. Una vez por semana, `gh pr list --app dependabot`
2. Los que el CI ha tumbado: se miran o se cierran con `@dependabot ignore`
3. Los `major`: se convierten en issue con su propia estimación, no se dejan
   abiertos «a ver si un día»
4. Nada se queda abierto más de dos semanas — es la condición para que GitHub no
   ponga a Dependabot en pausa (Teoría 03)

Cerrar un pull request es una decisión legítima. Dejarlo abierto no es ninguna.

## 7. Antipatrones

| Antipatrón | Por qué duele | Qué hacer |
|------------|---------------|-----------|
| `pull_request_target` con checkout del PR | Código ajeno con token privilegiado | `pull_request` y permisos por job |
| Auto-merge sin required checks | Se fusiona sin CI | Ruleset con checks obligatorios primero |
| Auto-merge de `minor` y `major` | Se cuela una ruptura sin que nadie lea nada | Solo `semver-patch` |
| Filtrar por el título del PR | Cualquiera puede abrir uno con ese título | `github.event.pull_request.user.login` |
| Guardar el token como secreto de Actions | Dependabot no lo ve; el workflow falla sin explicación | `gh secret set --app dependabot` |
| Ignorar por comentario lo permanente | Queda fuera del control de versiones | Al `dependabot.yml` |
| Dejar los PR abiertos indefinidamente | Dependabot se pausa y dejas de recibir arreglos | Cerrar o fusionar en dos semanas |

## 8. Trucos

- **`gh pr list --app dependabot`** filtra por app, no por autor: hay un flag
  específico y `--author` no sirve para esto
- **`gh pr checks <n>`** dice en dos líneas si un PR de Dependabot está listo,
  sin abrir el navegador
- **`steps.meta.outputs.dependency-names`** permite reglas por paquete: fusionar
  solo lo de `@types/*`, por ejemplo
- **Aprobar en vez de fusionar** es la versión conservadora de este workflow, y
  suele ser suficiente
- **`gh pr merge --auto` falla si la fusión automática no está permitida** en el
  repositorio: se activa una vez, en Settings o por API
- **Un `@dependabot recreate` arregla casi cualquier PR raro**: es más rápido que
  investigar por qué el diff se ve mal

## 📚 Recursos Adicionales

- [Dependabot pull request comment commands](https://docs.github.com/en/code-security/reference/supply-chain-security/dependabot-pull-request-comment-commands)
- [Automating Dependabot with GitHub Actions](https://docs.github.com/en/code-security/dependabot/working-with-dependabot/automating-dependabot-with-github-actions)
- [Troubleshooting Dependabot on GitHub Actions](https://docs.github.com/en/code-security/reference/supply-chain-security/troubleshoot-dependabot/dependabot-on-actions)
- [`dependabot/fetch-metadata`](https://github.com/dependabot/fetch-metadata)
- [Keeping your GitHub Actions and workflows secure: preventing pwn requests](https://securitylab.github.com/resources/github-actions-preventing-pwn-requests/)

## ✅ Checklist de Verificación

- [ ] Conoces los comandos de comentario y dónde se guardan sus efectos
- [ ] Sabes por qué el `GITHUB_TOKEN` llega de solo lectura
- [ ] Sabes dónde guardar un secreto que Dependabot deba leer
- [ ] Puedes explicar por qué `pull_request_target` no es la solución
- [ ] Tu auto-merge se limita a `semver-patch` y depende de checks obligatorios
- [ ] Tienes un ritmo semanal para lo que la automatización no cubre
