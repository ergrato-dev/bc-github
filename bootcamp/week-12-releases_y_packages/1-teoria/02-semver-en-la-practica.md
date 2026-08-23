# SemVer en la práctica

> Versionado semántico no es «subir el número». Es un **contrato** con quien
> consume tu software: el número dice cuánto trabajo le va a costar actualizarse.
> Romperlo silenciosamente es la forma más rápida de que nadie vuelva a confiar
> en tus versiones.

## 🎯 Objetivos

- Aplicar `MAJOR.MINOR.PATCH` decidiendo por el impacto, no por el esfuerzo
- Reconocer qué es un cambio incompatible en tu propio proyecto
- Usar prerreleases y metadatos de build sin inventarse la sintaxis
- Traducir Conventional Commits a incrementos de versión

## 1. Qué problema resuelve

Sin contrato de versionado, actualizar una dependencia es una apuesta: hay que
leer el changelog entero —si existe— para saber si va a compilar. SemVer 2.0.0
convierte esa lectura en tres reglas:

```
MAJOR . MINOR . PATCH
  │      │        └── corrige un fallo sin cambiar el comportamiento público
  │      └── añade funcionalidad manteniendo la compatibilidad
  └── rompe la compatibilidad
```

El número que cambia lo decide **el impacto en quien consume**, nunca el esfuerzo
de quien programa. Una refactorización de tres semanas que no cambia una sola
firma pública es un `PATCH`. Renombrar un parámetro es un `MAJOR`.

## 2. Qué es «incompatible» en tu proyecto

La regla es abstracta hasta que defines tu **API pública**. Sin esa definición,
cada discusión de versión se decide por intuición.

| Proyecto | API pública | Cambio incompatible típico |
|----------|-------------|----------------------------|
| Librería | Las funciones exportadas y sus tipos | Quitar un export, cambiar un parámetro a obligatorio |
| CLI | Comandos, flags, formato de salida, códigos de salida | Renombrar un flag, cambiar `0` por `1` en un caso |
| Servicio HTTP | Rutas, esquemas de petición y respuesta | Quitar un campo de la respuesta |
| Imagen de contenedor | Variables de entorno, puertos, volúmenes, usuario | Cambiar el usuario a no-root |
| Action | Los `inputs` y `outputs` de `action.yml` | Hacer obligatorio un input que no lo era |

Escríbelo en el `README.md`. Es una frase, y decide todas las versiones futuras:

> La API pública de este proyecto son las funciones exportadas por `src/index.ts`.
> Todo lo demás es interno y puede cambiar en cualquier versión.

## 3. La zona `0.x`

En `0.y.z` no hay contrato: la especificación permite romper en cualquier
incremento. Es honesto mientras el diseño se está moviendo, y una excusa cuando
ya lleva dos años en producción.

Convención de facto, no normativa: en `0.x`, `MINOR` se comporta como el `MAJOR`
de después y `PATCH` como el `MINOR`.

> [!TIP]
> Publica el `1.0.0` en cuanto alguien que no seas tú dependa del proyecto. Un
> `0.x` eterno no protege de nada: solo traslada el riesgo a quien lo usa.

## 4. Prerreleases y metadatos

```
1.0.0-rc.1        prerelease: precede a 1.0.0
1.0.0-alpha.2     prerelease: precede a 1.0.0-rc.1
1.0.0+20260822    metadato de build: NO cuenta para la precedencia
1.0.0-rc.1+abc123 los dos a la vez
```

Dos reglas que casi nadie recuerda:

1. Un prerelease **siempre es menor** que la versión final: `1.0.0-rc.1 < 1.0.0`
2. El metadato de build (`+…`) se **ignora** al comparar: `1.0.0+a` y `1.0.0+b`
   son la misma versión, y publicar las dos es un error

Los identificadores del prerelease se comparan campo a campo: los numéricos por
valor, los alfanuméricos alfabéticamente. Por eso `rc.10 > rc.9`, pero
`rc10 < rc9` en una comparación alfabética. Usa siempre el punto.

## 5. De Conventional Commits a la versión

La Semana 07 dejó los commits con formato. Ese formato es exactamente lo que hace
falta para calcular la versión sin que nadie decida a mano:

| Commit | Incremento | Ejemplo |
|--------|:----------:|---------|
| `fix:` | PATCH | `fix: calcular bien la multa del último día` |
| `feat:` | MINOR | `feat: exportar el catálogo a CSV` |
| `feat!:` o footer `BREAKING CHANGE:` | MAJOR | `feat!: quitar el parámetro legacy` |
| `docs:`, `chore:`, `test:`, `refactor:`, `style:`, `ci:` | ninguno | no aparecen en el changelog |

El `!` va antes de los dos puntos y puede acompañar a cualquier tipo:

```
feat(api)!: devolver 404 en vez de 200 con lista vacía

BREAKING CHANGE: los clientes que comprobaban la lista vacía con status 200
tienen que tratar el 404. Ver docs/migracion-v2.md.
```

Esa disciplina es la que la [teoría 04](04-release-please-y-el-pr-de-release.md)
convierte en automatización: nadie escribe el número de versión.

## 6. Rangos: cómo lo lee quien te consume

Publicar bien solo sirve si el consumidor expresa bien lo que acepta:

| Rango | Acepta | Uso |
|-------------|--------|-----|
| `^1.2.3` | `>=1.2.3 <2.0.0` | El defecto; confía en tu SemVer |
| `~1.2.3` | `>=1.2.3 <1.3.0` | Solo parches |
| `1.2.3` | Exactamente esa | Aplicaciones con lockfile |
| `*` | Cualquiera | Nunca |

Ojo con `^0.2.3`: en la zona cero se interpreta como `>=0.2.3 <0.3.0`. Es
el caret comportándose como tilde, precisamente porque `0.x` no da garantías.

## 7. Deprecar antes de romper

Un `MAJOR` bien hecho no sorprende a nadie, porque el aviso llegó una versión
antes:

1. En la `MINOR` anterior, marca lo que se va: aviso en tiempo de ejecución,
   `deprecationMessage` en una action, `@deprecated` en el tipo
2. Documenta el reemplazo **en el mismo aviso**, no en otra página
3. En la `MAJOR`, quítalo y escribe la guía de migración
4. Enlaza esa guía desde las notas del release

```js
export function calcularMulta(dias) {
  console.warn('[deprecado] calcularMulta(dias) se retira en la v2. Usa calcularSancion({ dias }).');
  return calcularSancion({ dias });
}
```

## 8. Antipatrones

| Antipatrón | Por qué duele | Qué hacer |
|------------|---------------|-----------|
| Versionar por esfuerzo | «Trabajamos mucho, es un 2.0» no informa de nada | Decidir por impacto |
| Romper en un `MINOR` | Rompe todos los `^` del ecosistema | `MAJOR`, o no romper |
| `0.x` perpetuo | El contrato nunca empieza | `1.0.0` cuando hay usuarios |
| Publicar `1.0.0+build1` y `1.0.0+build2` | Son la misma versión | El metadato no versiona |
| `v` dentro del `package.json` | `"version": "v1.0.0"` es inválido | La `v` solo va en el tag |
| Saltar números para «que parezca maduro» | Nadie se lo cree y rompe el cálculo automático | Incrementos de uno |
| Republicar la misma versión con otro contenido | Envenena cachés y lockfiles | Nueva versión, siempre |

## 9. Trucos

- **La `v` va en el tag, no en la versión.** Tag `v1.2.3`, `package.json`
  `1.2.3`. Es la convención que asumen `release-please` y `docker/metadata-action`
- **`pnpm version minor --sign-git-tag`** actualiza el `package.json`, hace el
  commit y crea el tag anotado y firmado en un solo comando
- **`pnpm dlx semver 1.0.0-rc.1 1.0.0 -r '^1.0.0'`** contesta discusiones de
  precedencia en un segundo
- **Ordenar tus tags como versiones**: `git tag --sort=-v:refname | head`, porque
  el orden alfabético pone `v1.10.0` antes que `v1.9.0`
- **Un `MAJOR` sin guía de migración no está terminado**: escríbela antes de
  taguear, no después

## 📚 Recursos Adicionales

- [Semantic Versioning 2.0.0](https://semver.org/lang/es/)
- [Conventional Commits 1.0.0](https://www.conventionalcommits.org/es/v1.0.0/)
- [npm — About semantic versioning](https://docs.npmjs.com/about-semantic-versioning)
- [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/)

## ✅ Checklist de Verificación

- [ ] Has escrito cuál es la API pública de tu proyecto
- [ ] Sabes decidir entre MAJOR, MINOR y PATCH por impacto
- [ ] Distingues un prerelease de un metadato de build
- [ ] Sabes qué tipo de commit produce cada incremento
- [ ] Tienes claro qué acepta un `^` y qué acepta en la zona `0.x`
