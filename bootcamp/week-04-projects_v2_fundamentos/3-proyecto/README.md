# Proyecto Semana 04 — El tablero de tu dominio

> Al terminar, tu backlog deja de ser una lista de issues y pasa a ser un plan
> que se puede mirar de cuatro formas distintas.

## 🎯 Objetivo

Montar el Project v2 de tu proyecto: campos propios, iteraciones, cuatro vistas
que responden preguntas reales y todo el backlog dentro.

## 📦 Qué añade esta capa

La Semana 03 llenó el repositorio de trabajo; esta lo **organiza**. Y es la base
de la siguiente: en la Semana 05 automatizarás este mismo project con Actions y
GraphQL, y sacarás métricas de flujo. Sin campos ni iteraciones, no hay nada que
medir.

## ✅ Requisitos verificables

Estos son exactamente los que comprueba `checks.json`:

1. [ ] Tienes un Project v2 con 12 o más items
2. [ ] El project tiene los campos `Priority`, `Size` y `Area`
3. [ ] El project tiene un campo de iteración con 3 o más iteraciones
4. [ ] El project tiene 4 o más vistas
5. [ ] `scripts/project-resumen.sh` está en el repositorio

## 🎨 Criterios de calidad

Lo que la API no ve:

- **Cada vista responde una pregunta** y su nombre lo dice. "Sprint actual", no
  "Board 2".
- **Los campos están rellenos.** Un `Priority` vacío en la mitad de los items
  significa que el campo sobra o que el backlog está abandonado.
- **`Status` describe tu flujo real**, no los tres valores por defecto. Con
  descripción en cada estado.
- **La iteración actual tiene trabajo asignado y es realista.** Doce items en un
  sprint de dos semanas para una persona no es un plan.
- **Las áreas son las de tu dominio**, no `frontend`/`backend` copiados.

## 💡 Adaptación a tu dominio

| Dominio | Campo `Area` | Qué mostrar en el roadmap |
|---------|--------------|---------------------------|
| 📖 Biblioteca | `prestamos`, `socios`, `catalogo` | Cuándo entra el cálculo de multas |
| 🏋️ Gimnasio | `reservas`, `socios`, `clases` | Cuándo está listo el control de aforo |
| 🎥 Cine | `butacas`, `funciones`, `ventas` | Cuándo se cierra la venta de entradas |
| 💊 Farmacia | `inventario`, `lotes`, `ventas` | Cuándo avisa de caducidades |

## 🚦 Cómo entregarlo

```bash
gh auth refresh -s project          # si aún no lo hiciste
./scripts/verificar-semana.sh 04 --repo <tu-usuario>/<tu-repo>
```

## 🧯 Errores comunes

| Error | Por qué pasa | Solución |
|-------|--------------|----------|
| `INSUFFICIENT_SCOPES` al verificar | Falta el scope `project` | `gh auth refresh -s project` |
| La comprobación no encuentra el project | Es de una organización, no de tu usuario | Este `checks.json` busca en `user(login:)`; crea el project bajo tu usuario |
| Menos de 12 items | El auto-add no añade lo que ya existía | Añade el backlog por lote (práctica 01, paso 6) |
| No hay campo de iteración | El CLI no lo crea | Créalo desde la web |
| Solo 2 vistas | Se crearon filtrando la misma vista una y otra vez | Cada pregunta, una vista nueva |
| Campos vacíos en la mitad de los items | Se crearon los campos pero no se rellenaron | Edición por lote desde la vista de tabla |
