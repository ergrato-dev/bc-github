# CODEOWNERS a escala

> Responde la pregunta con la que empieza cada PR —**¿quién revisa esto?**— una
> sola vez y por escrito. Y de paso documenta quién sabe de qué.

## 🎯 Objetivos

- Usar `CODEOWNERS` como mapa de conocimiento, no solo de permisos
- Entender la regla de precedencia y por qué sorprende
- Escribir patrones que hagan lo que crees que hacen
- Detectar los errores que GitHub se calla
- Repartir la revisión sin crear cuellos de botella

## 1. Qué problema resuelve

Sin `CODEOWNERS`, cada PR empieza con "¿a quién se lo pido?", y la respuesta
suele ser "a quien esté disponible" — que es como se pierde el conocimiento de
las áreas. Con él, la asignación es automática y refleja una decisión pensada.

Se presentó en la [Semana 02](../../week-02-repositorio_como_producto/1-teoria/01-anatomia-de-un-repo.md);
aquí va la parte que importa cuando el repositorio crece.

## 2. El archivo

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

## 3. Patrones: la sintaxis exacta

Es la sintaxis de `.gitignore`, con dos diferencias que se olvidan:

| Patrón | Qué casa |
|--------|----------|
| `*` | Todo el repositorio |
| `/src/` | Todo lo que hay bajo `src/`, en la raíz |
| `src/` | Cualquier carpeta `src/`, a cualquier profundidad |
| `*.sql` | Cualquier archivo `.sql` |
| `/docs/*.md` | Los `.md` **directos** de `docs/`, no los de sus subcarpetas |
| `/infra/**` | Todo lo que cuelga de `infra/` |

Las dos diferencias con `.gitignore`: **no existe la negación con `!`**, y una
línea sin dueños (solo el patrón) **quita** los dueños heredados para esa ruta —
que es la única forma de decir "esto no tiene dueño".

## 4. Repartir sin crear cuellos de botella

| Situación | Efecto | Alternativa |
|-----------|--------|-------------|
| Una sola persona dueña de `*` | Todo pasa por ella; vacaciones = repositorio parado | Equipos, o varios dueños por área |
| Un equipo grande como dueño | GitHub pide revisión al equipo y alguien la coge | Bien: es lo que quieres |
| Dueños por archivo | Nadie mantiene el mapa y envejece en semanas | Por área del dominio |
| `CODEOWNERS` sin ruleset | Es una sugerencia: reparte, no bloquea | Ruleset con revisión de code owners (Semana 08) |

Con equipos, la asignación puede repartirse automáticamente entre sus miembros
(*code review assignment*), lo que evita que siempre revise la misma persona.

Y una regla de higiene: **`CODEOWNERS` se protege a sí mismo**. Si cualquiera
puede editarlo, cualquiera puede quitarse los revisores:

```
/.github/CODEOWNERS     @equipo-plataforma
```

## 5. Antipatrones

| Antipatrón | Por qué duele | Qué hacer |
|------------|---------------|-----------|
| `CODEOWNERS` con usuarios sin acceso | Se ignora en silencio | Comprueba `codeowners/errors` |
| Reglas de lo específico a lo general | Gana la última, no la más específica | General arriba, excepciones abajo |
| Un solo dueño para todo | Cuello de botella | Reparte por áreas |
| `CODEOWNERS` sin dueño propio | Cualquiera puede quitarse los revisores | Que lo posea el equipo de plataforma |
| Dueños por archivo | El mapa envejece en semanas | Por área del dominio |

## 6. Trucos

- **Valida `CODEOWNERS` siempre que lo toques**:
  `gh api repos/{owner}/{repo}/codeowners/errors --jq '.errors'`
- **`CODEOWNERS` puede vivir en `.github/`**, y así no ensucia la raíz
- **Equipos, no personas**, cuando puedas: `@org/equipo-backend` sobrevive a las
  bajas y a los cambios de proyecto
- **Una línea sin dueños** quita los heredados para esa ruta: es la única forma
  de excluir algo
- **Compruébalo con un PR de prueba**: la lista de revisores propuestos dice más
  que releer los patrones
- **Revísalo cada trimestre**: un dueño que ya no trabaja en esa área es peor que
  no tener dueño

## 📚 Recursos Adicionales

- [GitHub Docs — About code owners](https://docs.github.com/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners)
- [Scrum Guide — Definition of Done](https://scrumguides.org/scrum-guide.html#increment)
- [Atlassian — Definition of Done](https://www.atlassian.com/agile/project-management/definition-of-done)

## ✅ Checklist de Verificación

- [ ] `codeowners/errors` devuelve un array vacío
- [ ] Tus reglas van de lo general a lo específico
- [ ] `CODEOWNERS` se protege a sí mismo
- [ ] Ninguna persona es dueña única de todo el repositorio
