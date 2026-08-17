# Insights y reportes

> GitHub trae gráficos hechos. Sirven para lo que sirven: conviene saber dónde
> acaban y cuándo hay que construirse el informe uno mismo.

## 🎯 Objetivos

- Configurar gráficos de Insights sobre campos propios
- Conocer los límites de los Insights nativos
- Publicar informes automáticos como issues
- Guardar el histórico para tener series temporales

## 1. Qué problema resuelve

Alguien pregunta "¿cómo va?" cada semana. Responder implica mirar el tablero,
contar, y escribir un resumen. Es trabajo repetitivo, mecánico y perfectamente
automatizable — y automatizado además queda **fechado y archivado**, que es lo
que permite ver tendencias.

## 2. Insights nativos

`Project → Insights`. Dos tipos de gráfico:

| Tipo | Qué muestra | Bueno para |
|------|-------------|------------|
| **Current chart** | Foto de ahora, agrupada por un campo | "¿Cuánto hay en cada estado?" |
| **Historical chart** | Evolución en el tiempo (burn-up) | "¿Estamos cerrando más de lo que abrimos?" |

Configurables: filtro, eje X, agrupación y tipo (barras, líneas, apiladas).

Gráficos que merece la pena tener:

1. **Items por estado** — barras, agrupado por `Status`, filtro `is:open`
2. **Carga por persona** — barras, agrupado por `Assignees`, filtro `is:open -status:Hecho`
3. **Burn-up del sprint** — histórico, filtro `iteration:@current`
4. **Deuda por área** — barras, agrupado por `Area`, filtro `is:open label:"type:bug"`

## 3. Dónde acaban los Insights

| Límite | Consecuencia |
|--------|--------------|
| Solo datos del project | Lo que no está en el tablero no se ve |
| Sin métricas de tiempo | No calculan lead time ni cycle time |
| Sin exportación programada | No hay serie temporal descargable |
| Histórico limitado en el plan Free | La ventana de datos es corta |
| No se pueden incrustar | No hay imagen que pegar en un README |

Traducción: para "cuánto hay de cada cosa", Insights. Para "cuánto tardamos" y
para "cómo evolucionamos", informe propio.

## 4. El informe como issue

Un informe automático publicado como **issue** tiene tres ventajas sobre un
panel: queda fechado, se puede comentar y se busca.

```yaml
name: Informe semanal

on:
  schedule:
    - cron: "0 8 * * 1"     # lunes 08:00 UTC
  workflow_dispatch:

permissions:
  contents: read
  issues: write

jobs:
  informe:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Calcular métricas y publicar
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: bash scripts/informe-semanal.sh
```

Aquí sí basta `GITHUB_TOKEN`: escribir un issue **sí** está en el alcance del
repositorio. Solo Projects queda fuera.

> [!NOTE]
> `cron` en Actions va en **UTC** y no es puntual: en horas de carga puede
> retrasarse bastante. Para un informe semanal da igual; para algo con hora
> exacta, no lo uses.

## 5. Guardar el histórico

Un informe en un issue es legible; una serie temporal en un fichero es
analizable. Haz las dos cosas:

```bash
echo "$(date +%Y-%m-%d),$LEAD_TIME,$THROUGHPUT,$WIP" >> metricas/historico.csv
```

Commitea el CSV desde el workflow. En seis meses tienes veintiséis puntos y
puedes ver la tendencia — que es lo único que de verdad se interpreta.

## 6. Qué poner en el informe

Corto y accionable:

```markdown
## Semana del 17 al 23 de agosto

| Métrica | Esta semana | Anterior |
|---------|------------:|---------:|
| Cerrados | 7 | 5 |
| Abiertos nuevos | 4 | 9 |
| Lead time (mediana) | 6 d | 8 d |
| WIP | 3 | 6 |

### Atascados (>14 días sin actividad)

- #42 Cálculo de multa — sin asignar

### Sprint actual

12 items · 5 hechos · 4 en curso · 3 sin empezar
```

Cuatro números, una lista de atascos y el estado del sprint. Un informe de dos
pantallas no lo lee nadie.

## 7. Antipatrones

| Antipatrón | Por qué duele | Qué hacer |
|------------|---------------|-----------|
| Informe de dos pantallas | Nadie lo lee | 4 métricas y los atascos |
| Métrica sin comparación | Un número suelto no dice nada | Siempre contra la semana anterior |
| Informe por correo | Se pierde y no se busca | Issue: queda, se comenta, se busca |
| Panel que nadie mira | Trabajo tirado | Que llegue solo, donde ya miras |
| Medir sin umbral | No dispara ninguna acción | "Si el WIP > 6, no empezamos nada más" |
| Gráficos por defecto sin configurar | Agrupan por `Status` y poco más | Configúralos con tus campos |

## 8. Trucos

- **Exportar una vista a CSV**: `···` → *Export view data*. Rápido para un
  análisis puntual en una hoja de cálculo
- **`workflow_dispatch` junto a `schedule`**: te deja lanzar el informe a mano
  para probarlo sin esperar al lunes
- **Los `schedule` se desactivan** tras 60 días sin actividad en el repo: si tu
  informe deja de llegar, esa es la causa
- **Etiqueta los informes** (`type:informe`) y tendrás la serie navegable con un
  filtro
- **Cierra el informe anterior** al publicar el nuevo: la lista de issues
  abiertos se mantiene limpia
- **Enlaza el informe desde el README** con un badge o un enlace a la búsqueda:
  `../../issues?q=label%3Atype%3Ainforme`

## 📚 Recursos Adicionales

- [GitHub Docs — About insights for Projects](https://docs.github.com/issues/planning-and-tracking-with-projects/viewing-insights-from-your-project/about-insights-for-projects)
- [GitHub Docs — Events that trigger workflows: `schedule`](https://docs.github.com/actions/using-workflows/events-that-trigger-workflows#schedule)
- [`github/issue-metrics`](https://github.com/github/issue-metrics)

## ✅ Checklist de Verificación

- [ ] Tienes al menos un gráfico de Insights configurado con un campo propio
- [ ] Tu informe semanal se publica solo y cabe en una pantalla
- [ ] Guardas el histórico en un CSV commiteado
- [ ] Cada métrica del informe se compara con la semana anterior
