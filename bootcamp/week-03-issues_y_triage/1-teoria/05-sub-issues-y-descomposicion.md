# Sub-issues y descomposición del trabajo

> Un épico no se estima, no se asigna y no se cierra. Se parte. La pregunta útil
> no es "¿cómo lo estimo?" sino "¿en qué trozos independientes se corta?".

## 🎯 Objetivos

- Decidir cuándo algo es una casilla, un sub-issue o un issue suelto
- Partir un épico en piezas que se puedan cerrar por separado
- Crear y consultar sub-issues desde la interfaz, la REST API y GraphQL
- Conocer los límites reales de la jerarquía
- Evitar que la descomposición se convierta en burocracia

## 1. Qué problema resuelve

"Rehacer el módulo de préstamos" no es trabajo: es un titular. No se puede
asignar a una persona, no cabe en una iteración, y su barra de progreso está en
0 % durante seis semanas hasta que salta al 100 %.

Partirlo tiene tres efectos inmediatos: se puede repartir, se ve avanzar y se
puede parar a la mitad sin perderlo todo.

## 2. Los tres niveles

| | Casilla `- [ ]` | Sub-issue | Issue suelto |
|---|---|---|---|
| Qué es | Una línea del cuerpo | Un issue con padre | Un issue sin relación |
| Se asigna | No | Sí | Sí |
| Tiene estado propio | No | Sí | Sí |
| Aparece en el Project | No | Sí | Sí |
| Progreso en el padre | Cuenta en el cuerpo | Barra automática | — |
| Para qué | Pasos tuyos de una misma tarea | Trozos de un trabajo mayor | Trabajo independiente |

La regla de decisión, en una frase: **si lo va a hacer otra persona o en otro
momento, es un sub-issue.** Si es un paso tuyo dentro del mismo rato de trabajo,
es una casilla.

> [!NOTE]
> Las *tasklists* con sintaxis especial que hubo en beta ya no existen como
> funcionalidad aparte: hoy hay casillas de Markdown (que solo cuentan progreso
> dentro del cuerpo) y sub-issues (que son relaciones reales entre issues).

## 3. Cómo partir bien

Un buen sub-issue cumple tres cosas:

1. **Se puede cerrar solo**, sin esperar a sus hermanos
2. **Se puede probar**: tiene criterios de aceptación propios
3. **Cabe en una iteración**. Si no cabe, se vuelve a partir

Formas de cortar que funcionan, de mejor a peor:

| Corte | Ejemplo | Vale |
|-------|---------|:----:|
| Por caso de uso | "Devolver el mismo día", "Devolver con retraso" | ✅ Cada trozo entrega valor |
| Por regla de negocio | "Multa fija", "Multa proporcional" | ✅ |
| Por camino feliz y errores | "Préstamo correcto", "Socio con multas pendientes" | ✅ |
| Por capa técnica | "Modelo", "Servicio", "Controlador", "Tests" | ❌ Ningún trozo sirve suelto |
| Por persona | "La parte de Ana", "La parte de Luis" | ❌ No es trabajo, es reparto |

El corte por capas es el error más común, y se reconoce en que ningún sub-issue
se puede desplegar por su cuenta.

## 4. Sub-issues en la práctica

En la interfaz, al final de la descripción del issue padre: **Create sub-issue**
para uno nuevo, o el desplegable → **Add existing issue** para enganchar uno que
ya existe, incluso de otro repositorio.

El padre muestra el progreso solo (`3 de 7 completados`) y cada sub-issue enseña
un enlace de vuelta.

Desde la API REST:

```bash
# Listar los sub-issues de #42
gh api repos/{owner}/{repo}/issues/42/sub_issues --jq '.[] | "#\(.number) \(.state) \(.title)"'

# Enganchar el issue con id interno <ID> como sub-issue de #42
gh api repos/{owner}/{repo}/issues/42/sub_issues --method POST -F sub_issue_id=<ID>

# Quién es el padre de #57
gh api repos/{owner}/{repo}/issues/57/parent --jq '.number'
```

Ojo a un detalle que cuesta media hora la primera vez: `sub_issue_id` es el **id
interno** del issue, no su número visible. Se saca así:

```bash
gh api repos/{owner}/{repo}/issues/57 --jq '.id'
```

Y en GraphQL, que es lo que necesitarás cuando quieras leer la jerarquía entera
de una vez (Semana 16):

```bash
gh api graphql -f query='
  query($owner:String!, $repo:String!, $numero:Int!) {
    repository(owner:$owner, name:$repo) {
      issue(number:$numero) {
        title
        subIssuesSummary { total completed percentCompleted }
        subIssues(first: 20) { nodes { number title state } }
      }
    }
  }' -F owner=OWNER -F repo=REPO -F numero=42
```

### Los límites

- **100 sub-issues** por issue padre
- **Ocho niveles** de anidamiento

Los dos son techos altísimos comparados con lo razonable: si un épico tiene más
de diez hijos, o si estás en el tercer nivel de anidamiento, el problema no es el
límite — es que estás modelando un proyecto entero dentro de un issue.

## 5. Épicos y Projects

La jerarquía de issues responde "de qué se compone esto". El Project (Semana 04)
responde "en qué estado está y cuándo se hace". Son ejes distintos y conviene no
mezclarlos:

- El **padre** no se asigna a nadie ni se mete en una iteración: se cierra solo
  cuando sus hijos están cerrados
- Los **hijos** son los que llevan assignee, iteración y estimación
- En el tablero, lo que se mueve son los hijos

## 6. Antipatrones

| Antipatrón | Por qué duele | Qué hacer |
|------------|---------------|-----------|
| Épico gigante sin partir | No se puede repartir ni estimar, y no avanza | Sub-issues por caso de uso |
| Partir por capas técnicas | Ningún trozo entrega nada | Partir por comportamiento |
| Sub-issues de quince minutos | Más gestión que trabajo | Casillas en el cuerpo |
| Tres niveles de anidamiento | Nadie encuentra nada | Un nivel; dos como excepción |
| Asignar el padre y los hijos | Doble contabilidad en el tablero | Solo los hijos |
| Cerrar el padre a mano con hijos abiertos | El progreso miente | Cierra los hijos |
| Duplicar la lista de hijos como casillas en el cuerpo | Dos listas que divergen | Solo la jerarquía |
| Usar el número visible como `sub_issue_id` | La API responde 404 y no sabes por qué | Usa el `id` interno |

## 7. Trucos

- **Convertir una casilla en issue**: al pasar el ratón sobre ella, la interfaz
  ofrece crear el issue ya enlazado
- **Progreso de un épico desde la CLI**:
  ```bash
  gh api repos/{owner}/{repo}/issues/42/sub_issues \
    --jq '[.[] | .state] | "cerrados: \([.[] | select(.=="closed")] | length)/\(length)"'
  ```
- **Plantilla de épico**: un formulario con un solo campo de texto ("qué hay que
  conseguir") y una casilla obligatoria que recuerde partirlo antes de empezar
- **Sub-issues entre repositorios**: se permiten, y son la forma de representar
  un trabajo que toca el backend y el frontend
- **Reordenar la lista de hijos**: el endpoint `sub_issues/priority` cambia el
  orden, que es el que verás en el padre
- **Encontrar huérfanos**: issues del milestone que no tienen padre ni hijos
  suelen ser lo que se cuela sin planificar

## 📚 Recursos Adicionales

- [GitHub Docs — Adding sub-issues](https://docs.github.com/issues/tracking-your-work-with-issues/using-issues/adding-sub-issues)
- [REST API — Sub-issues](https://docs.github.com/rest/issues/sub-issues)
- [GitHub Docs — About issues](https://docs.github.com/issues/tracking-your-work-with-issues/about-issues)

## ✅ Checklist de Verificación

- [ ] Has partido un épico en sub-issues que se cierran por separado
- [ ] Ninguno de tus cortes es "modelo / servicio / tests"
- [ ] Sabes listar los sub-issues de un issue desde la CLI
- [ ] Conoces los dos límites de la jerarquía
- [ ] El padre no está asignado a nadie
