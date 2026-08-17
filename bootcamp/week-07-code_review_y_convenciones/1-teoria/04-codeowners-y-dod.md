# CODEOWNERS y Definition of Done

> Dos documentos cortos que responden las dos preguntas que más tiempo consumen
> en un equipo: **¿quién revisa esto?** y **¿esto ya está hecho?**

## 🎯 Objetivos

- Usar `CODEOWNERS` como mapa de conocimiento, no solo de permisos
- Entender la regla de precedencia y por qué sorprende
- Escribir una Definition of Done comprobable
- Integrar la DoD donde de verdad se lee

## 1. Qué problema resuelve

Sin `CODEOWNERS`, cada PR empieza con "¿a quién se lo pido?". Sin DoD, cada PR
termina con "¿esto ya está?". Las dos preguntas se responden una sola vez, por
escrito.

## 2. `CODEOWNERS` a escala

Repaso de la Semana 02, ahora con la parte que importa cuando el repositorio
crece.

```
# Dueños por defecto
*                       @tu-usuario

# Por área del dominio
/src/prestamos/         @tu-usuario @persona-prestamos
/src/socios/            @persona-socios

# Infraestructura: nada entra sin revisión
/.github/workflows/     @equipo-plataforma
/.github/CODEOWNERS     @equipo-plataforma

# Por tipo de archivo
*.sql                   @equipo-datos
*.md                    @equipo-docs
```

### La regla que sorprende

**Gana la última regla que coincide**, no la más específica.

```
/src/                   @equipo-backend
*.md                    @equipo-docs
```

Con esas dos reglas, `/src/README.md` pertenece a `@equipo-docs`, porque `*.md`
está después. Si querías lo contrario, invierte el orden.

Consecuencia práctica: **de lo general a lo específico**. Los patrones amplios
arriba, las excepciones abajo.

### Errores silenciosos

Un `CODEOWNERS` con un usuario sin acceso al repositorio **se ignora sin avisar**
para esa regla:

```bash
gh api repos/{owner}/{repo}/codeowners/errors --jq '.errors'
```

Un array vacío es lo correcto. Compruébalo cada vez que lo edites.

### Como mapa de conocimiento

`CODEOWNERS` es también documentación: dice quién sabe de qué. Leerlo es la forma
más rápida de saber a quién preguntar. Por eso conviene que refleje la realidad
aunque no haya rulesets exigiendo nada.

## 3. Definition of Done

Una lista de condiciones que **todo** trabajo debe cumplir para considerarse
terminado. No es la lista de requisitos del issue (eso son los criterios de
aceptación): es lo transversal.

Ejemplo realista para tu repositorio:

```markdown
## Definition of Done

Un cambio está hecho cuando:

- [ ] Cumple los criterios de aceptación del issue
- [ ] Tiene tests que fallan si la lógica se rompe
- [ ] CI en verde
- [ ] Documentación actualizada si cambia el comportamiento visible
- [ ] Revisado por alguien distinto del autor
- [ ] Sin secretos, claves ni datos personales en el diff
- [ ] El issue se cierra automáticamente al mergear (`Fixes #N`)
```

### Reglas de una buena DoD

| Regla | Por qué |
|-------|---------|
| **Comprobable** | "Código de calidad" no se puede verificar; "tests en verde" sí |
| **Corta** | Más de 8 puntos y no se lee |
| **Transversal** | Lo específico de cada trabajo son criterios de aceptación |
| **Automatizada donde se pueda** | Lo que comprueba CI no hace falta que lo mire una persona |
| **Visible donde se usa** | En la plantilla de PR, no en una wiki |

## 4. Criterios de aceptación vs DoD

| | Criterios de aceptación | Definition of Done |
|---|---|---|
| Dónde | En cada issue | Una sola, para todo el proyecto |
| Qué describen | Qué tiene que hacer **esto** | Qué exige el proyecto **siempre** |
| Ejemplo | "Devolver el mismo día no genera multa" | "Tiene tests y CI en verde" |
| Cambian | Con cada issue | Casi nunca |

Los dos son necesarios. Confundirlos produce issues con veinte casillas
repetidas o una DoD que no dice nada.

## 5. Dónde vive cada cosa

| Documento | Ubicación | Quién lo lee |
|-----------|-----------|--------------|
| Convención de commits | `CONTRIBUTING.md` | Quien contribuye |
| Flujo de ramas | `CONTRIBUTING.md` | Quien contribuye |
| Proceso de review | `CONTRIBUTING.md` | Quien revisa |
| Definition of Done | Plantilla de PR + `CONTRIBUTING.md` | Autor y revisor, en cada PR |
| Dueños por área | `.github/CODEOWNERS` | GitHub, automáticamente |
| Criterios de aceptación | Cada issue | Autor y revisor |

Regla general: **el documento tiene que estar donde ocurre la decisión.** Una DoD
en una wiki que nadie abre no existe.

## 6. Antipatrones

| Antipatrón | Por qué duele | Qué hacer |
|------------|---------------|-----------|
| DoD de 20 puntos | Se marca todo sin leer | Máximo 8, todos comprobables |
| DoD con "código limpio" | No se puede verificar | Reglas concretas o linter |
| `CODEOWNERS` con usuarios sin acceso | Se ignora en silencio | Comprueba `codeowners/errors` |
| Reglas de lo específico a lo general | Gana la última, no la más específica | General arriba, excepciones abajo |
| Un solo dueño para todo | Cuello de botella | Reparte por áreas |
| DoD solo en la wiki | Nadie la abre | En la plantilla de PR |
| Repetir la DoD en cada issue | Ruido | La DoD es transversal; el issue lleva criterios propios |

## 7. Trucos

- **Valida `CODEOWNERS` siempre que lo toques**:
  `gh api repos/{owner}/{repo}/codeowners/errors --jq '.errors'`
- **`CODEOWNERS` puede vivir en `.github/`**, y así no ensucia la raíz
- **Equipos, no personas**, cuando puedas: `@org/equipo-backend` sobrevive a las
  bajas y a los cambios de proyecto
- **La DoD en la plantilla de PR** aparece precargada en cada PR sin esfuerzo
- **Marca en la DoD lo que ya comprueba CI**: "(automático)" al lado, para que
  nadie pierda tiempo verificándolo a mano
- **Revisa la DoD cada trimestre**: los puntos que siempre están en verde
  automáticamente pueden salir de la lista

## 📚 Recursos Adicionales

- [GitHub Docs — About code owners](https://docs.github.com/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners)
- [Scrum Guide — Definition of Done](https://scrumguides.org/scrum-guide.html#increment)
- [Atlassian — Definition of Done](https://www.atlassian.com/agile/project-management/definition-of-done)

## ✅ Checklist de Verificación

- [ ] `codeowners/errors` devuelve un array vacío
- [ ] Tus reglas van de lo general a lo específico
- [ ] Tu DoD tiene 8 puntos o menos, todos comprobables
- [ ] La DoD está en la plantilla de PR
