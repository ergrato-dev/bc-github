# Anatomía de un repositorio

> Diez segundos. Es lo que tarda alguien en decidir si tu repositorio merece la
> pena. Todo lo que decide en esos diez segundos es configurable.

## 🎯 Objetivos

- Enumerar los archivos que GitHub trata de forma especial y qué hace con cada uno
- Escribir un README con estructura de embudo
- Configurar descripción, topics y la barra lateral del repositorio
- Entender el *community profile* y por qué GitHub lo puntúa

## 1. Qué problema resuelve

Un repositorio sin README es una carpeta. GitHub, encima, penaliza: no aparece
en búsquedas por tema, no muestra nada en la portada y la gente que llega no
sabe si el proyecto está vivo.

La plataforma reconoce un conjunto de archivos por su nombre y les da tratamiento
especial. Conocerlos es la diferencia entre un repo que se explica solo y uno que
obliga a leer el código para entender qué hace.

## 2. Los archivos que GitHub trata especial

| Archivo | Dónde puede vivir | Qué hace GitHub con él |
|---------|-------------------|------------------------|
| `README.md` | raíz, `.github/`, `docs/` | Lo renderiza en la portada |
| `LICENSE` | raíz | Detecta la licencia y la muestra en la barra lateral |
| `CONTRIBUTING.md` | raíz, `.github/`, `docs/` | Enlace al abrir un issue o PR |
| `CODE_OF_CONDUCT.md` | ídem | Enlace en la barra lateral y en el perfil de comunidad |
| `SECURITY.md` | ídem | Pestaña *Security* → "Reporting a vulnerability" |
| `SUPPORT.md` | ídem | Enlace al abrir un issue |
| `FUNDING.yml` | `.github/` | Botón *Sponsor* |
| `CODEOWNERS` | raíz, `.github/`, `docs/` | Asigna revisores automáticamente |
| `.github/ISSUE_TEMPLATE/` | — | Plantillas y formularios de issue |
| `PULL_REQUEST_TEMPLATE.md` | raíz, `.github/` | Precarga la descripción de cada PR |
| `CITATION.cff` | raíz | Botón "Cite this repository" |
| `.gitattributes` | raíz | EOL, linguist, diffs |

![Archivos que GitHub trata de forma especial y dónde aparece cada uno](../0-assets/01-anatomia-repositorio.svg)

### El repositorio `.github` de tu cuenta

Un repositorio público llamado exactamente `.github` en tu usuario u
organización actúa como **plantilla por defecto**: cualquier repo tuyo sin
`CONTRIBUTING.md`, `CODE_OF_CONDUCT.md` o plantillas de issue hereda los de ahí.

Se escribe una vez y sirve para veinte repositorios.

## 3. El README con estructura de embudo

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

### Badges

Un badge es información, no adorno. Cada uno debe responder una pregunta que un
usuario se hace de verdad: ¿está el CI en verde?, ¿qué licencia tiene?, ¿qué
versión es la última? Cinco badges informan; quince son ruido.

```markdown
[![CI](https://github.com/OWNER/REPO/actions/workflows/ci.yml/badge.svg)](https://github.com/OWNER/REPO/actions/workflows/ci.yml)
```

## 4. Metadatos: descripción, topics y barra lateral

```bash
gh repo edit --description "Gestión de préstamos de biblioteca — API y reglas de negocio"
gh repo edit --add-topic biblioteca --add-topic typescript --add-topic api-rest
gh repo edit --homepage "https://tu-usuario.github.io/tu-repo"
```

Los **topics** son cómo te encuentra la gente: son el índice de GitHub. Tres a
seis, específicos. `javascript` no distingue tu repo de otros dos millones.

La descripción se lee en los resultados de búsqueda: es tu única frase de venta.

## 5. El community profile

`Insights → Community Standards` puntúa la presencia de README, LICENSE,
CONTRIBUTING, CODE_OF_CONDUCT, plantillas de issue y de PR.

```bash
gh api repos/{owner}/{repo}/community/profile --jq '{salud: .health_percentage, faltan: [.files | to_entries[] | select(.value == null) | .key]}'
```

No es una métrica de calidad del código; es una lista de comprobación de si tu
proyecto está listo para que alguien de fuera participe. Llegar al 100% cuesta
media hora y evita la mitad de las preguntas repetidas.

## 6. Antipatrones

| Antipatrón | Por qué duele | Qué hacer |
|------------|---------------|-----------|
| README que empieza por "Instalación" | El lector aún no sabe qué está instalando | Qué es y por qué, primero |
| Muro de 20 badges | Ninguno se lee | Máximo 5, todos accionables |
| Sin LICENSE | Legalmente nadie puede usar tu código | Elige una y ponla |
| Topics genéricos (`web`, `app`) | No te encuentra nadie | Específicos y de dominio |
| Documentación solo en la wiki | Las wikis no se clonan ni se buscan bien | El README es la puerta; la wiki, el anexo |
| Capturas en el repo a 4 MB | Clonar tarda una eternidad | Optimiza o usa `assets/` con imágenes ligeras |

## 7. Trucos

- **Ver el Markdown en crudo**: añade `?plain=1` a la URL del archivo
- **Enlace permanente a una línea**: pulsa `y` sobre un archivo y la rama se
  convierte en SHA; añade `#L10-L20` para un rango
- **Editor completo en el navegador**: pulsa `.` en cualquier repositorio
- **README por carpeta**: GitHub renderiza el `README.md` de cada directorio.
  Úsalo para explicar carpetas grandes en su sitio
- **Perfil personal**: un repo con el nombre de tu usuario muestra su README en
  tu perfil
- **Auditar tu comunidad en una línea**:
  ```bash
  gh api repos/{owner}/{repo}/community/profile --jq .health_percentage
  ```

## 📚 Recursos Adicionales

- [GitHub Docs — About READMEs](https://docs.github.com/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-readmes)
- [GitHub Docs — Community health files](https://docs.github.com/communities/setting-up-your-project-for-healthy-contributions/creating-a-default-community-health-file)
- [Make a README](https://www.makeareadme.com/)

## ✅ Checklist de Verificación

- [ ] Alguien ajeno entiende qué hace tu proyecto en 10 segundos
- [ ] Tu repositorio tiene descripción y 3+ topics específicos
- [ ] `community/profile` devuelve 100
- [ ] Todos los badges del README funcionan y apuntan a tu repo
