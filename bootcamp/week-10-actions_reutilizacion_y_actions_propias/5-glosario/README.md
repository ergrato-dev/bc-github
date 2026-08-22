# Glosario — Semana 10

## A

**`action.yml`** — El archivo de metadatos de una action: nombre, descripción,
`inputs`, `outputs`, `branding` y `runs`. Es el **contrato público**: cambiarlo
puede romper a quien la use. Para publicar en el Marketplace tiene que estar en
la **raíz** del repositorio.

**Autoprueba** — El workflow de una action que la ejecuta a sí misma con
`uses: ./`. Es la única prueba que comprueba lo que de verdad importa: que la
action funciona tal y como la ejecutará otra persona.

## B

**`branding`** — Icono (de Feather) y color que se muestran junto al nombre de la
action en el Marketplace. Dos líneas de YAML, y lo único puramente estético de
todo el `action.yml`.

## C

**Composite action** — Action cuyo `runs.using` es `composite`: una secuencia de
steps empaquetada. Se ejecuta **dentro** del job de quien la llama. Todo `run:`
suyo debe declarar `shell:`, y no tiene acceso al contexto `secrets`.

**Contrato** — El conjunto de `inputs`, `outputs` y **permisos necesarios** de una
action o de un reusable workflow. Es lo que hay que documentar y lo que decide si
un cambio es MENOR o MAYOR.

## D

**`deprecationMessage`** — Clave de un input que hace que el runner emita un aviso
cada vez que alguien lo use. La forma correcta de retirar un input: avisar en una
versión, retirarlo en la mayor siguiente.

**`dist/`** — El código empaquetado de una action de JavaScript, commiteado al
repositorio. Existe porque el runner **no instala dependencias**: ejecuta
`runs.main` tal cual. Si la action no tiene dependencias, no hace falta.

**Docker action** — Action cuyo `runs.using` es `docker`. Empaqueta el entorno
entero. Solo corre en runners Linux, arranca más lenta y ve el repositorio en
`/github/workspace`.

## G

**`github.action_path`** — Ruta del directorio de la action **en el runner**. Es
lo que hay que usar para invocar un script que viaja con la action; una ruta
relativa apunta al workspace del repositorio que la llama.

## I

**`inherit`** — Valor de `secrets:` en la llamada a un reusable workflow que le
pasa **todos** los secretos del llamador. Cómodo dentro de tu organización,
imprudente hacia código ajeno. No incluye los secretos de environment.

**Input** — Parámetro declarado en `action.yml` o en `on.workflow_call`. En las
actions **siempre llega como cadena**, también los números y los booleanos: por
eso las comparaciones se escriben `== 'true'`.

## M

**Marketplace** — El catálogo público de actions. Publicar exige repositorio
público, `action.yml` en la raíz, nombre único y 2FA. Es **opcional**: una action
en un repositorio público ya se puede usar sin publicarla.

## N

**`node24`** — Runtime actual para actions de JavaScript (`runs.using: node24`).
El anterior, `node20`, sigue funcionando pero está en cuenta atrás: las actions
nuevas se escriben ya en `node24`.

## P

**`post`** — Script que una action ejecuta **al terminar el job**, aunque haya
fallado. Es donde `actions/cache` guarda la caché y donde una action que arranca
un servicio lo apaga.

## R

**Reusable workflow** — Workflow con `on: workflow_call` que otro workflow invoca
con `jobs.<id>.uses:`. Reutiliza **jobs completos**. Solo puede vivir en
`.github/workflows/`, y la cadena de llamadas admite hasta diez niveles.

## S

**Starter workflow** — Plantilla que aparece al crear un workflow nuevo. Vive en
`workflow-templates/` del repositorio `.github` de la cuenta u organización, con
su archivo `.properties.json`. Se **copia**: no crea dependencia.

## T

**Tag móvil** — Etiqueta que se reescribe apuntando a la última versión
compatible (`v1` → `v1.4.2`). Es la única reescritura de historia aceptada por
convención del ecosistema. `v1.4.2` no se mueve jamás.

## U

**`uses: ./`** — Referencia a una action que vive en el propio repositorio
checkouteado. Sin `actions/checkout` previo, el runner responde que no encuentra
`action.yml`.

---

← [Volver a la Semana 10](../README.md)
