# Proyecto Semana 06 — Tu primer ciclo completo de PRs

> Al terminar, nada entra a `main` sin pasar por un pull request revisado, y la
> historia del repositorio se lee como un relato.

## 🎯 Objetivo

Convertir el PR en la única puerta de entrada a `main`: plantilla, revisión con
sugerencias, estrategia de merge decidida y una pila de PRs encadenados.

## 📦 Qué añade esta capa

Hasta ahora empujabas a `main` directamente. Esta semana el trabajo pasa por un
proceso, y ese proceso se hará **obligatorio** en la Semana 08 con un ruleset:
sin PR aprobado y con los checks en verde, no se podrá mergear.

También es la semana que hace útil el `CODEOWNERS` de la Semana 02: aquí es
donde empieza a pedir revisores.

## ✅ Requisitos verificables

Estos son exactamente los que comprueba `checks.json`:

1. [ ] Existe `.github/pull_request_template.md`
2. [ ] Hay 3 o más pull requests mergeados
3. [ ] Solo hay una estrategia de merge habilitada
4. [ ] Las ramas se borran automáticamente al mergear
5. [ ] Hay comentarios de revisión de línea en algún PR
6. [ ] Existe un PR cuya base no es la rama por defecto (pila)

## 🎨 Criterios de calidad

Lo que la API no ve:

- **Cada PR cierra su issue con `Fixes #N`** en la descripción. La cadena
  issue → PR → commit es la memoria del proyecto.
- **Las descripciones dicen cómo probarlo.** Un revisor que tiene que adivinar
  cómo ejecutar tu cambio, no lo ejecuta.
- **Ningún PR pasa de 400 líneas** sin una razón escrita.
- **Los comentarios de revisión marcan severidad** (`bloqueante:`, `sugerencia:`,
  `nit:`) y al menos uno es una sugerencia aplicable.
- **La estrategia de merge está justificada en `CONTRIBUTING.md`**, no solo
  configurada.
- **La resolución del conflicto está explicada** en un comentario del PR.

## 💡 Adaptación a tu dominio

| Dominio | Tres PRs con sentido |
|---------|----------------------|
| 📖 Biblioteca | Cálculo de multa · consulta de historial · validación de socio |
| 🏋️ Gimnasio | Reserva de clase · control de aforo · cancelación |
| 🎥 Cine | Selección de butaca · bloqueo temporal · liberación por tiempo |
| 💊 Farmacia | Alta de lote · alerta de caducidad · descuento de stock |

La pila de dos PRs sale sola: el modelo primero, la operación que lo usa después.

## 🚦 Cómo entregarlo

```bash
./scripts/verificar-semana.sh 06 --repo <tu-usuario>/<tu-repo>
```

## 🧯 Errores comunes

| Error | Por qué pasa | Solución |
|-------|--------------|----------|
| El issue no se cierra al mergear | `Fixes #N` fuera de la descripción | `gh pr edit --body` |
| Tres estrategias habilitadas | Es el valor por defecto de GitHub | `gh repo edit --enable-merge-commit=false --enable-rebase-merge=false` |
| Commits `wip` en `main` | Squash con título por defecto | `--squash-merge-commit-message pr-title-description` |
| No hay comentarios de revisión | Se comentó en la conversación, no en el diff | Comenta sobre una línea en *Files changed* |
| La pila no cuenta | El segundo PR tiene base `main` | `gh pr edit --base <rama-del-primero>` |
| Diff duplicado tras mergear el primero de la pila | Efecto del squash | `git rebase --onto origin/main <base-vieja> <tu-rama>` |
