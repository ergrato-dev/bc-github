# 🤝 Cómo Contribuir

Este repositorio es el **material** del bootcamp, no el proyecto de nadie en
particular. Se aceptan contribuciones que mejoren el contenido: erratas,
comandos que ya no funcionan, features de GitHub que cambiaron, recursos
mejores.

> [!NOTE]
> Tu proyecto del bootcamp vive en **tu propio repositorio**, no aquí. Ver
> [`docs/proyecto-hilo-conductor.md`](docs/proyecto-hilo-conductor.md).

## Qué se acepta

| Tipo | Ejemplos | Prioridad |
| --- | --- | --- |
| **Corrección** | Comando `gh` que cambió de sintaxis, enlace roto, errata | Alta |
| **Actualización** | Una feature de GitHub cambió de nombre o de UI | Alta |
| **Recurso** | Artículo o video que explica mejor un tema de `4-recursos/` | Media |
| **Claridad** | Un paso de práctica que no se entiende sin contexto extra | Media |
| **Nuevo contenido** | Un tema faltante dentro del alcance de una semana | Baja — abre issue primero |

## Qué NO se acepta

- Cambios de estilo masivos (reformatear todos los `.md`).
- Traducciones parciales. `README_EN.md` es el único archivo espejo en inglés.
- Contenido de pago o de marca disfrazado de recurso.
- Ampliar el alcance de una semana por encima de sus 8 horas.

## Flujo

Este repo se rige por su propio contenido — practica lo que enseña:

```bash
# 1. Fork y clona
gh repo fork ergrato-dev/bc-github --clone

# 2. Rama desde main, nombre en inglés, kebab-case
git switch -c fix/week-09-cache-key-example

# 3. Commit con Conventional Commits (Semana 07)
git commit -m "fix(week-09): corrige la key de actions/cache en el ejemplo"

# 4. PR con contexto
gh pr create --fill --web
```

### Convenciones de commit

`<tipo>(<alcance>): <descripción en imperativo y minúscula>`

| Tipo | Uso aquí |
| --- | --- |
| `docs` | Cambios en teoría, README, glosario, recursos |
| `fix` | Un comando, workflow o enlace que estaba mal |
| `feat` | Contenido nuevo (práctica, sección, script) |
| `chore` | Mantenimiento del repo (CI, estructura) |

Alcance = la semana (`week-09`) o el área (`scripts`, `docs`).

## Antes de abrir el PR

```bash
./scripts/verificar-enlaces.sh      # enlaces relativos + estructura de semanas
```

Checklist:

- [ ] Los comandos nuevos los ejecutaste de verdad, no los dedujiste.
- [ ] Los archivos de teoría siguen bajo ~150 líneas (máximo duro: 200).
- [ ] Todo SVG nuevo en `0-assets/` está enlazado desde algún `.md`.
- [ ] La documentación está en español; el código y los identificadores, en inglés.
- [ ] Sin capturas de pantalla con tu email, tokens o nombres de repos privados.

## Reportar sin arreglar

Un issue bien escrito vale tanto como un PR. Usa las plantillas y sé concreto:
archivo, semana, qué esperabas, qué pasó.

## Licencia de tus aportes

Al contribuir aceptas que tu aporte se publique bajo
[CC BY-NC-SA 4.0](LICENSE), igual que el resto del material.
