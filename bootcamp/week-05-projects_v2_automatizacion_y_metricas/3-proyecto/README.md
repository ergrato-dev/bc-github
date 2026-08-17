# Proyecto Semana 05 — Tu tablero, automatizado y medido

> Al terminar, el tablero se mantiene solo y cada lunes aparece un informe con
> cómo va el proyecto.

## 🎯 Objetivo

Automatizar la entrada de trabajo al project y montar el circuito de métricas:
script, histórico e informe semanal publicado.

## 📦 Qué añade esta capa

La Semana 04 montó el tablero; esta hace que **no dependa de que alguien se
acuerde**. Y añade la primera capa de observabilidad del proyecto, que se
completará en la Semana 12 con las métricas de despliegue.

También es tu primer contacto con workflows de Actions. Se usan como receta: el
modelo completo llega en las semanas 09-11, y entonces volverás a estos
workflows para endurecerlos.

## ✅ Requisitos verificables

Estos son exactamente los que comprueba `checks.json`:

1. [ ] Existe `.github/workflows/project-automation.yml`
2. [ ] Existe `.github/workflows/informe-semanal.yml`
3. [ ] `scripts/metricas.sh` está en el repositorio
4. [ ] El secreto `PROJECT_TOKEN` está configurado
5. [ ] Hay al menos una ejecución de workflow completada con éxito
6. [ ] Existe al menos un issue con la label `type:informe`

## 🎨 Criterios de calidad

Lo que la API no ve:

- **El informe cabe en una pantalla.** Cuatro métricas, los atascados y el estado
  del sprint. Nada más.
- **Cada métrica se compara con la anterior.** Un número suelto no informa.
- **La automatización no decide por ti.** Añadir al tablero y poner estado
  inicial, sí; prioridad e iteración, no.
- **El PAT tiene caducidad y hay un recordatorio.** Un token eterno en un repo
  público es un riesgo, y uno caducado sin aviso es un tablero que miente.
- **Los IDs están en `vars`, no en `secrets`.** No son sensibles y así se
  depuran.

## 💡 Adaptación a tu dominio

| Dominio | Métrica propia que añadir al informe |
|---------|--------------------------------------|
| 📖 Biblioteca | Issues abiertos del área `prestamos` frente al total |
| 🏋️ Gimnasio | Bugs de `reservas` cerrados esta semana |
| 🎥 Cine | Tiempo medio de resolución de incidencias de `butacas` |
| 💊 Farmacia | Proporción de `type:bug` frente a `type:feature` en el backlog |

## 🚦 Cómo entregarlo

```bash
./scripts/verificar-semana.sh 05 --repo <tu-usuario>/<tu-repo>
```

## 🧯 Errores comunes

| Error | Por qué pasa | Solución |
|-------|--------------|----------|
| `Resource not accessible by integration` | `GITHUB_TOKEN` con Projects | Usa `PROJECT_TOKEN` |
| El PAT no tiene permiso de Projects | Está en *Account permissions*, no en Repository | Regenéralo |
| El workflow no aparece | No está en la rama por defecto | Push a `main` |
| El informe falla al hacer push | Falta `contents: write` | Añádelo a `permissions` |
| Métricas absurdas | Pocos datos, o `not_planned` incluidos | Espera datos y filtra los descartes |
| El tablero deja de llenarse semanas después | El PAT caducó | Rota el token; por eso está el issue recordatorio |
