# El README y dónde vive la documentación

> El README no es documentación: es una portada. Confundir las dos cosas produce
> el README de 900 líneas que nadie lee y la wiki vacía que nadie encuentra.

## 🎯 Objetivos

- Escribir un README con estructura de embudo
- Elegir badges que informen en vez de decorar
- Decidir dónde va cada tipo de documentación: README, `docs/`, wiki o Pages
- Publicar el repositorio en GitHub Pages y saber qué límites tiene
- Mantener la documentación viva sin duplicarla

## 1. Qué problema resuelve

Toda documentación compite con el código por tu tiempo, así que hay poca. La
pregunta no es "¿cuánto documento?" sino "¿dónde pongo cada cosa para que se
mantenga sola?".

Regla de oro: **la documentación que no se revisa en un PR, envejece**. Todo lo
que puedas poner en el repositorio —README, `docs/`, comentarios— viaja con el
código, se revisa con el código y se rompe con el código. Todo lo que pongas
fuera (wiki, Notion, Confluence) tiene su propia vida y su propio olvido.

## 2. El README con estructura de embudo

El error clásico es escribir el README en el orden en que construiste el
proyecto. El lector necesita el orden inverso: de lo general a lo concreto.

```
1. Qué es           — una frase. Sin "este proyecto pretende"
2. Por qué existe   — el problema que resuelve, no las tecnologías
3. Cómo se ve       — captura, GIF o diagrama. Antes que cualquier instalación
4. Cómo se usa      — el comando mínimo para tener algo funcionando
5. Detalle          — configuración, API, arquitectura
6. Cómo contribuir  — enlace a CONTRIBUTING, no el texto entero
7. Licencia
```

Prueba objetiva: dale el README a alguien ajeno al proyecto y pregúntale, tras
diez segundos, qué hace. Si no lo sabe, el embudo está mal.

### Los tres párrafos que más se equivocan

| Sección | Error típico | Alternativa |
|---------|--------------|-------------|
| Primera frase | "Proyecto realizado para el bootcamp de..." | Qué hace y para quién |
| Instalación | Quince pasos con prerequisitos implícitos | El camino feliz completo, copiable de una vez |
| Estado | Nada, o un "en desarrollo" de hace tres años | Última versión, si acepta contribuciones y si está mantenido |

### El README es un producto con público

No escribes para "el que llegue": escribes para tres personas distintas. Quien
evalúa (¿me sirve?), quien usa (¿cómo lo arranco?) y quien contribuye (¿dónde
toco?). El embudo funciona porque las atiende en ese orden y cada una puede
parar de leer cuando tenga lo suyo.

## 3. Badges

Un badge es información, no adorno. Cada uno debe responder una pregunta que
alguien se hace de verdad: ¿está el CI en verde?, ¿qué licencia tiene?, ¿qué
versión es la última? Cinco badges informan; quince son ruido.

```markdown
[![CI](https://github.com/OWNER/REPO/actions/workflows/ci.yml/badge.svg)](https://github.com/OWNER/REPO/actions/workflows/ci.yml)
```

El badge de un workflow admite parámetros útiles:

```
.../badge.svg?branch=main&event=push
```

| Badge | Vale la pena si… |
|-------|------------------|
| Estado del CI | Tienes CI de verdad (Semana 09) |
| Licencia | Es un proyecto para usar |
| Última release | Publicas versiones (Semana 14) |
| Cobertura | El número lo genera el CI, no lo pones a mano |
| "Made with ❤️" | Nunca |

> [!TIP]
> Un badge roto (imagen que no carga, enlace a otro repo copiado) es peor que no
> tenerlo: es la primera señal de que el README está desatendido. Compruébalos al
> renombrar el repositorio o la rama por defecto.

## 4. Dónde va cada cosa

| Sitio | Para qué | Se versiona | Se busca |
|-------|----------|:-----------:|:--------:|
| `README.md` | Portada: qué, por qué, arranque rápido | ✅ | ✅ |
| `docs/` | Guías largas, arquitectura, decisiones, referencia | ✅ | ✅ |
| README por carpeta | Explicar un subsistema donde vive | ✅ | ✅ |
| Wiki | Notas volátiles, actas, borradores | ❌ (repo aparte) | ⚠️ Peor |
| GitHub Pages | Documentación publicada para gente de fuera | ✅ (la fuente) | ✅ |
| Discussions | Preguntas, propuestas, anuncios | ❌ | ✅ |

Los README de carpeta son la pieza más infrautilizada: GitHub renderiza el
`README.md` de **cada** directorio, así que la explicación vive al lado del
código que explica y se revisa en el mismo PR.

### Registros de decisiones

Un `docs/adr/` con un archivo por decisión (contexto, opciones, decisión,
consecuencias) responde la pregunta que ninguna otra documentación responde: *por
qué* está esto así. Cuesta quince minutos por decisión y evita que alguien
deshaga en junio lo que costó una semana en marzo.

## 5. GitHub Pages

`Settings → Pages`. Publica el contenido de un repositorio como sitio estático.

| Origen | Cuándo |
|--------|--------|
| **Deploy from a branch** (`main`, carpeta `/` o `/docs`) | Documentación en Markdown, sin build |
| **GitHub Actions** | Cualquier generador (Astro, MkDocs, Docusaurus…) — Semana 09 en adelante |

URL según el nombre del repositorio:

- `tu-usuario/tu-usuario.github.io` → `https://tu-usuario.github.io`
- Cualquier otro repo → `https://tu-usuario.github.io/nombre-del-repo`

```bash
gh api repos/{owner}/{repo}/pages --jq '{estado: .status, url: .html_url, origen: .build_type}'
```

Lo que hay que saber antes de usarlo en serio:

- Con "deploy from a branch" el sitio se genera con **Jekyll**. Si tu sitio no es
  Jekyll, un archivo vacío llamado `.nojekyll` en la raíz evita que Jekyll toque
  nada — es el motivo número uno por el que "no se ven las carpetas que empiezan
  por guion bajo"
- **Es público**: en las cuentas normales, el sitio de un repositorio privado
  también sería público, así que no publiques lo que no publicarías igualmente
- Hay límites blandos: alrededor de 1 GB de sitio y 100 GB de tráfico al mes
- Dominio propio: `CNAME` en el repositorio y el DNS apuntando a GitHub; después,
  **Enforce HTTPS**

## 6. Mantenerla viva

- **Un solo sitio para cada cosa.** Dos páginas que dicen lo mismo divergen en
  semanas; enlaza, no copies
- **Enlaces relativos** entre archivos del repo (`../docs/setup.md`), nunca URLs
  absolutas a tu propia rama: sobreviven a los renombrados de rama y funcionan en
  los forks
- **La documentación entra en la Definition of Done** (Semana 07): el PR que
  cambia el comportamiento cambia la documentación
- **Un comprobador de enlaces en CI** — este mismo bootcamp tiene el suyo:
  `scripts/verificar-enlaces.sh`

## 7. Antipatrones

| Antipatrón | Por qué duele | Qué hacer |
|------------|---------------|-----------|
| README que empieza por "Instalación" | El lector aún no sabe qué está instalando | Qué es y por qué, primero |
| README de 900 líneas | Nadie lo lee entero y nada se encuentra | Portada + `docs/` |
| Muro de 20 badges | Ninguno se lee | Máximo 5, todos accionables |
| Documentación solo en la wiki | No se clona, no se revisa, no se busca bien | El README es la puerta; la wiki, el anexo |
| Capturas de 4 MB en el repo | Clonar tarda una eternidad | Optimiza, o súbelas al comentario y enlaza |
| Enlaces absolutos a tu propia rama | Se rompen al renombrar y en los forks | Enlaces relativos |
| Instrucciones con rutas de menú | La interfaz cambia cada trimestre | El comando `gh` equivalente |
| Pages con material privado | El sitio es público aunque el repo no lo sea | No publiques lo que no sea público |

## 8. Trucos

- **Ver el Markdown en crudo**: añade `?plain=1` a la URL del archivo
- **Índice automático**: el icono de lista junto al título del archivo genera la
  tabla de contenidos, sin mantenerla a mano
- **Imagen que cambia con el tema del lector**:
  ```html
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="docs/logo-oscuro.png">
    <img src="docs/logo-claro.png" width="420" alt="Logo del proyecto">
  </picture>
  ```
- **Perfil personal**: un repositorio con el nombre de tu usuario muestra su
  README en tu perfil
- **`gh repo view`** imprime el README en la terminal; `gh repo view --web` lo
  abre en el navegador
- **Comprobar que Pages ha desplegado**:
  `gh api repos/{owner}/{repo}/pages/builds/latest --jq '.status'`
- **Plantilla mínima de ADR**: contexto, opciones consideradas, decisión,
  consecuencias. Cuatro encabezados, nada más

## 📚 Recursos Adicionales

- [GitHub Docs — About READMEs](https://docs.github.com/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-readmes)
- [GitHub Docs — About GitHub Pages](https://docs.github.com/pages/getting-started-with-github-pages/about-github-pages)
- [GitHub Docs — Adding a workflow status badge](https://docs.github.com/actions/how-tos/monitor-workflows/add-a-status-badge)
- [Make a README](https://www.makeareadme.com/)

## ✅ Checklist de Verificación

- [ ] Alguien ajeno entiende qué hace tu proyecto en 10 segundos
- [ ] Todos los badges del README funcionan y apuntan a tu repositorio
- [ ] Sabes decidir entre `docs/`, wiki y Pages para un contenido concreto
- [ ] Tu sitio de Pages está publicado y `gh api ... /pages` devuelve su URL
- [ ] Los enlaces internos de tu documentación son relativos
