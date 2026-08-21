# Licencias

> Sin licencia, tu código público es "todos los derechos reservados": nadie puede
> usarlo legalmente, ni siquiera para aprender.

## 🎯 Objetivos

- Elegir una licencia con criterio y saber qué obliga a quien te use
- Distinguir permisiva de copyleft, y saber cuándo importa la diferencia
- Comprobar que GitHub detecta tu licencia
- Entender qué pasa con las licencias de tus dependencias
- Saber por qué cambiar de licencia después es difícil

## 1. Qué problema resuelve

El copyright es automático: en el momento en que escribes código, es tuyo y nadie
más tiene permiso para copiarlo, modificarlo ni redistribuirlo. Publicarlo en
GitHub no cambia eso — solo permite verlo y hacer fork **dentro** de la
plataforma, porque lo dicen sus términos de servicio.

La licencia es el permiso explícito que le das al resto. Es un archivo de texto y
es la diferencia entre un repositorio que la gente puede usar y uno que solo
puede mirar.

> [!IMPORTANT]
> "Sin licencia" no significa "de dominio público": significa que aplica el
> copyright por defecto y **nadie tiene permiso para usarlo**. Un repositorio
> público sin `LICENSE` es un repositorio que ninguna empresa seria va a tocar.

## 2. El mapa

| Licencia | Puedes | Debes | Copyleft |
|----------|--------|-------|:--------:|
| **MIT** | Todo, incluido cerrar el código | Mantener el aviso de copyright | No |
| **Apache-2.0** | Todo | Aviso + declarar cambios; **concede patentes** | No |
| **BSD-3-Clause** | Todo | Aviso; no usar el nombre para promocionar | No |
| **MPL-2.0** | Todo | Los **archivos** modificados siguen MPL | Por archivo |
| **LGPL-3.0** | Enlazar desde software cerrado | Publicar los cambios de la propia librería | Débil |
| **GPL-3.0** | Todo | **Publicar los derivados con la misma licencia** | Fuerte |
| **AGPL-3.0** | Todo | Igual que GPL, **también si lo ofreces como servicio web** | Muy fuerte |
| **CC BY-SA 4.0** | Compartir y adaptar | Atribuir, misma licencia | Contenido, no código |
| **CC BY-NC 4.0** | Compartir y adaptar | Atribuir, **no comercial** | Contenido, no código |
| **Unlicense / CC0** | Todo | Nada | No |

Cómo decidir, en cuatro líneas:

- **Quiero adopción máxima** → MIT o Apache-2.0. Apache si te preocupan las patentes
- **Quiero que las mejoras vuelvan** → GPL-3.0. AGPL si el uso típico es SaaS
- **Es material educativo, no software** → Creative Commons
- **Es un proyecto de trabajo** → la que diga tu empresa. No la elijas tú

### MIT o Apache-2.0

Son casi lo mismo en lo que permiten y se diferencian en dos cosas:

| | MIT | Apache-2.0 |
|---|-----|------------|
| Longitud | 21 líneas, se lee entera | Varias páginas |
| Patentes | No dice nada | Concesión explícita, y se revoca si demandas |
| Cambios | No pide señalarlos | Hay que indicar los archivos modificados |
| Archivo extra | — | `NOTICE` para las atribuciones |

Si tu proyecto puede acercarse a algo patentable, o esperas que lo adopten
empresas grandes, Apache-2.0 es la que sus abogados prefieren.

### Por qué "no comercial" no es tan buena idea como suena

`CC BY-NC` prohíbe el uso comercial, pero nadie sabe exactamente dónde empieza:
¿un curso de pago?, ¿una empresa que lo usa internamente?, ¿un blog con anuncios?
Esa ambigüedad hace que muchas organizaciones lo descarten directamente. Para
material educativo que quieras que circule, `CC BY` o `CC BY-SA` funcionan mejor.

## 3. Ponerla y comprobar que se detecta

`Add file → Create new file → LICENSE` y GitHub ofrece un selector con las
plantillas rellenas.

```bash
gh api repos/{owner}/{repo} --jq '.license.spdx_id'   # MIT, Apache-2.0, NOASSERTION…
```

GitHub detecta la licencia comparando el texto con las plantillas conocidas. Si
la editas —cambiar el año está bien, reescribir párrafos no— puede pasar a
`NOASSERTION` y desaparecer de la barra lateral y de los filtros de búsqueda.

El identificador que devuelve es **SPDX**, el estándar que usan las herramientas
de inventario. Ese mismo identificador es el que se pone en la cabecera de un
archivo suelto cuando hace falta:

```javascript
// SPDX-License-Identifier: MIT
```

## 4. Tus dependencias también tienen licencia

Tu licencia rige **tu** código. El paquete que instalas trae la suya, y la
combinación puede no ser legal.

| Tu proyecto | Dependencia GPL | Dependencia MIT |
|-------------|-----------------|-----------------|
| MIT | ⚠️ La GPL "contagia" al distribuir el conjunto | ✅ |
| GPL-3.0 | ✅ | ✅ |
| Propietario | ❌ Salvo excepción de enlazado | ✅ |

Cómo verlo sin volverse abogado:

- La pestaña **Insights → Dependency graph** lista dependencias y licencias
- `npm query`, `pip-licenses` o equivalentes generan el inventario desde la CLI
- Un inventario formal (SBOM) es parte de la cadena de suministro, en la Semana 13

Nada de esto sustituye a un abogado cuando el proyecto es comercial. Lo que sí
puedes garantizar es no ir a ciegas.

## 5. Contribuciones: DCO y CLA

Cuando alguien te manda un PR, ¿con qué derecho incorporas su código? Hay dos
mecanismos:

| | DCO | CLA |
|---|-----|-----|
| Qué es | Una firma `Signed-off-by:` en el commit | Un acuerdo firmado aparte |
| Fricción | Ninguna: `git commit -s` | Alta: hay que firmar antes del primer PR |
| Qué concede | Que quien contribuye tiene derecho a hacerlo | A veces, cesión de derechos al proyecto |
| Típico de | Proyectos comunitarios | Proyectos con empresa detrás |

Para un repositorio personal no necesitas ninguno de los dos, pero el DCO cuesta
un flag:

```bash
git commit -s -m "fix: corrige el cálculo de la multa"
```

GitHub puede exigirlo en los commits hechos desde la web:
`Settings → General → Require contributors to sign off on web-based commits`.

## 6. Cambiar de licencia después

Es el motivo real para elegir bien al principio: **el código es de quien lo
escribió**. Para relicenciar necesitas el permiso de todas las personas que hayan
contribuido, salvo que la licencia original ya lo permita o que un CLA te haya
cedido los derechos.

En un repositorio con cincuenta contribuciones, eso es un proyecto en sí mismo.
Y no basta con cambiar el archivo hoy: las versiones ya publicadas siguen bajo la
licencia que tenían — nadie pierde los derechos que ya le concediste.

## 7. Antipatrones

| Antipatrón | Por qué duele | Qué hacer |
|------------|---------------|-----------|
| Repositorio público sin LICENSE | Nadie puede usarlo legalmente | Elige una hoy |
| GPL en una librería que busca adopción amplia | Muchos equipos no pueden usarla | MIT o Apache-2.0 |
| Editar el texto de la licencia | Deja de detectarse (`NOASSERTION`) | Cambia solo el año y el titular |
| Copiar la licencia sin poner el titular | La cláusula de atribución queda coja | Nombre y año reales |
| "Free for non-commercial use" escrito a mano | No es una licencia, es una frase | Una licencia real, con nombre SPDX |
| Ignorar la licencia de las dependencias | Descubres el problema al vender el producto | Revisa el dependency graph |
| Suponer que puedes relicenciar cuando quieras | El código es de quien lo escribió | Elige bien al principio o usa DCO/CLA |

## 8. Trucos

- **Comparador oficial**: [choosealicense.com](https://choosealicense.com/), de la
  propia GitHub, con las tres o cuatro que de verdad se usan
- **Comprobar la licencia detectada**:
  `gh api repos/{owner}/{repo} --jq .license`
- **Buscar repos por licencia**: `license:mit language:typescript` en la búsqueda
- **Licencia distinta para código y contenido**: es común y perfectamente válido —
  MIT para `src/`, CC BY-SA para `docs/`, dicho en el README y con un
  `LICENSE-docs`
- **Plantilla desde la CLI**: `gh api /licenses/mit --jq .body > LICENSE` y
  rellenas el titular
- **El año no hace falta actualizarlo cada enero**: `2026` o `2026-presente` en el
  aviso es suficiente en la práctica

## 📚 Recursos Adicionales

- [choosealicense.com](https://choosealicense.com/) — comparador oficial de GitHub
- [SPDX License List](https://spdx.org/licenses/) — identificadores estándar
- [GitHub Docs — Licensing a repository](https://docs.github.com/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/licensing-a-repository)
- [Developer Certificate of Origin](https://developercertificate.org/)

## ✅ Checklist de Verificación

- [ ] Tu repositorio tiene `LICENSE` y `gh api … --jq .license.spdx_id` la detecta
- [ ] Puedes explicar en una frase qué obliga la licencia que elegiste
- [ ] Sabes qué diferencia hay entre MIT y Apache-2.0
- [ ] Has mirado las licencias de tus dependencias al menos una vez
- [ ] Sabes por qué relicenciar más adelante es difícil
