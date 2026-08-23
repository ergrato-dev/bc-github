# SBOM: el inventario de lo que publicas

> Cuando se publicó la vulnerabilidad de Log4j, la pregunta que paralizó a
> equipos enteros durante días no fue «¿cómo lo arreglo?». Fue mucho más básica:
> **«¿lo tengo?»**. Un SBOM es la respuesta a esa pregunta escrita de antemano,
> en un formato que una máquina puede leer.

## 🎯 Objetivos

- Explicar qué es un SBOM y qué preguntas contesta que un `package.json` no
- Distinguir SPDX de CycloneDX y saber cuándo da igual cuál uses
- Leer un `purl` y entender por qué es la pieza que hace que todo cruce
- Diferenciar el SBOM que genera GitHub del que genera tu build
- Exportar el tuyo por interfaz, por API y desde un workflow

## 1. Qué problema resuelve

Tu `package.json` dice qué pediste. Tu `pnpm-lock.yaml` dice qué se resolvió. Un
**SBOM** (*Software Bill of Materials*) dice **qué hay dentro del artefacto que
publicaste**, en un formato estándar que no depende de tu gestor de paquetes.

Las tres diferencias que importan:

| | Manifiesto | Lockfile | SBOM |
|--|-----------|----------|------|
| Formato | Del ecosistema | Del gestor | **Estándar, entre ecosistemas** |
| Contiene | Lo que pediste | Lo que se resolvió | Lo que se empaquetó |
| Lo lee | Tu gestor | Tu gestor | **Cualquier herramienta, y tus clientes** |

La palabra clave es *entre ecosistemas*. Una imagen de contenedor tiene paquetes
de npm, paquetes del sistema operativo y binarios sueltos. Ningún manifiesto
cubre los tres; un SBOM sí.

## 2. Los dos formatos

| | **SPDX** | **CycloneDX** |
|--|---------|---------------|
| Origen | Linux Foundation | OWASP |
| Norma | ISO/IEC 5962 | Estándar de ECMA |
| Fuerte en | Licencias y cumplimiento | Seguridad y análisis de vulnerabilidades |
| Lo que emite GitHub | ✅ SPDX 2.3 | ❌ |

Para lo que hace esta semana, **da igual cuál elijas**: `actions/attest` acepta
los dos y detecta el formato solo. La razón práctica para usar SPDX es que es lo
que exporta GitHub, así que tu cadena entera habla el mismo idioma.

## 3. La pieza que lo hace funcionar: el `purl`

Un SBOM sin identificadores comunes es una lista de nombres, y los nombres
colisionan: `utils` existe en npm, en PyPI y en tu monorepo.

El **`purl`** (*package URL*) es el identificador que resuelve eso:

```
pkg:npm/%40scope/paquete@1.2.3
pkg:golang/github.com/charmbracelet/x/termios@v0.1.1
pkg:pypi/requests@2.31.0
```

`pkg:` + ecosistema + nombre + versión. Es el campo por el que se cruzan las
bases de vulnerabilidades con tu inventario, y es lo que hay que mirar cuando una
herramienta «no encuentra» un paquete que sí está.

En el SPDX de GitHub vive en `externalRefs`:

```bash
gh api repos/{owner}/{repo}/dependency-graph/sbom \
  --jq '.sbom.packages[].externalRefs[]? | select(.referenceType == "purl") | .referenceLocator'
```

## 4. Los dos SBOM de tu proyecto

No es lo mismo el que da GitHub que el que genera tu build, y confundirlos es el
malentendido habitual:

| | **SBOM del grafo (GitHub)** | **SBOM del build (tuyo)** |
|--|---------------------------|--------------------------|
| Sale de | Manifiestos y lockfiles del repositorio | Escanear el artefacto ya construido |
| Cubre | Dependencias declaradas | Lo que de verdad quedó dentro |
| Ve el sistema operativo de la imagen | ❌ | ✅ |
| Cuándo se genera | Continuamente | En cada build |
| Se puede atestar | ❌ | ✅ |

El primero contesta *«¿qué declara este repositorio?»*. El segundo contesta
*«¿qué hay dentro de este artefacto concreto?»*, que es la pregunta de la cadena
de suministro. Los dos son útiles; solo el segundo se puede firmar y entregar
junto al release.

## 5. Exportar el de GitHub

Por interfaz: **Insights → Dependency graph → Export SBOM**.

Por API:

```bash
gh api repos/{owner}/{repo}/dependency-graph/sbom > sbom.spdx.json

# Qué trae
gh api repos/{owner}/{repo}/dependency-graph/sbom \
  --jq '{version: .sbom.spdxVersion, licencia: .sbom.dataLicense, paquetes: (.sbom.packages | length)}'
```

```json
{ "version": "SPDX-2.3", "licencia": "CC0-1.0", "paquetes": 219 }
```

Tres límites que conviene saber antes de enseñárselo a nadie:

- **Depende del grafo**: si el repositorio no tiene manifiestos reconocidos, el
  endpoint devuelve `404`. No es un fallo del comando
- **No incluye dependientes**, solo dependencias
- **No refleja un artefacto**: refleja el repositorio en este momento

## 6. Generar el del build

En un workflow, el SBOM se genera escaneando lo construido, no el repositorio.
La herramienta habitual en el ecosistema es Syft, empaquetada como action:

```yaml
- name: Generar el SBOM del artefacto
  uses: anchore/sbom-action@e22c389904149dbc22b58101806040fa8d37a610 # v0.24.0
  with:
    path: ./dist
    format: spdx-json
    output-file: sbom.spdx.json
```

Ese archivo es el que se ata al artefacto con una atestación —el
[archivo 08](08-attestations.md)— y el que se sube al release para que un
consumidor pueda pedirlo sin pedirte permiso.

> [!NOTE]
> Un SBOM del build sobre `./dist` describe **el paquete**, no la imagen. Si lo
> que publicas es un contenedor, escanea la imagen: la mitad interesante del
> inventario —la distribución base y sus librerías del sistema— solo aparece ahí.

## 7. Para qué sirve de verdad

Un SBOM que se genera y nadie consulta es un archivo caro. Las tres preguntas que
justifica:

1. **«¿Tengo X?»** — la pregunta del día del incidente, contestada con `grep`
   sobre un archivo en vez de con una tarde de arqueología
2. **«¿Qué licencias estoy distribuyendo?»** — la que llega desde legal, y la
   razón por la que SPDX guarda `licenseConcluded` por paquete
3. **«¿Cambió algo entre estas dos versiones?»** — comparar el SBOM de `v1.2.0`
   con el de `v1.3.0` enseña las dependencias nuevas, que es donde entran los
   ataques de cadena de suministro

## 8. Antipatrones

| Antipatrón | Por qué duele | Qué hacer |
|------------|---------------|-----------|
| Generar el SBOM y no publicarlo | No sirve a quien consume tu artefacto | Adjuntarlo al release |
| Generar del repositorio y llamarlo del artefacto | No cubre lo que se empaquetó | Escanear lo construido |
| Un SBOM por proyecto, no por versión | Deja de ser cierto en el siguiente commit | Uno por release, versionado |
| Ignorar el `purl` | Nada cruza con las bases de avisos | Comprobar que los `externalRefs` están |
| SBOM sin firmar | Cualquiera puede darte otro | Atestarlo (archivo 08) |
| Escanear el `node_modules` de desarrollo | Mete cien paquetes que no se distribuyen | Escanear el artefacto final |

## 9. Trucos

- **`--jq '.sbom.packages[].name'`** convierte el SBOM en una lista plana para
  `grep`, que es el 90 % del uso real
- **`diff <(...) <(...)`** entre dos SBOM de dos releases enseña exactamente qué
  dependencias entraron
- **`.sbom.creationInfo.creators`** dice qué herramienta lo generó — útil cuando
  recibes uno de otro y quieres saber si es de fiar
- **`404` en el endpoint del SBOM** casi siempre significa «este repositorio no
  tiene manifiestos», no «no tienes permiso»
- **El SBOM del grafo es gratis y ya existe**: exportarlo cuesta un comando y ya
  contesta la pregunta del incidente

## 📚 Recursos Adicionales

- [Exporting a software bill of materials for your repository](https://docs.github.com/en/code-security/supply-chain-security/understanding-your-software-supply-chain/exporting-a-software-bill-of-materials-for-your-repository)
- [REST — Dependency graph SBOM](https://docs.github.com/en/rest/dependency-graph/sboms)
- [SPDX — Especificación](https://spdx.github.io/spdx-spec/)
- [CycloneDX](https://cyclonedx.org/)
- [package-url — Especificación del `purl`](https://github.com/package-url/purl-spec)
- [`anchore/sbom-action`](https://github.com/anchore/sbom-action)

## ✅ Checklist de Verificación

- [ ] Sabes qué contesta un SBOM que no contesta tu lockfile
- [ ] Distingues SPDX de CycloneDX y sabes cuál emite GitHub
- [ ] Puedes leer un `purl` y decir de qué ecosistema es
- [ ] Distingues el SBOM del grafo del SBOM del build
- [ ] Has exportado el tuyo por API y sabes por qué puede dar `404`
- [ ] Sabes qué escanear cuando lo que publicas es una imagen
