# Diseñar un pipeline de CD

> Integración continua es "esto compila y pasa los tests". Entrega continua es
> "esto se puede publicar en cualquier momento con un clic". Despliegue continuo
> es "esto ya está publicado". Son tres cosas distintas y la mayoría de los
> equipos dice CD queriendo decir la segunda.

## 🎯 Objetivos

- Separar construir, validar, desplegar y verificar en jobs con una sola
  responsabilidad
- Aplicar *build once, deploy many* con artefactos
- Elegir disparador y estrategia de vuelta atrás antes de escribir el YAML
- Medir la frecuencia de despliegue con datos de la propia plataforma

## 1. Qué problema resuelve

El pipeline de las semanas 09 y 10 termina cuando los tests pasan. Entre eso y
"hay una versión publicada y sé cuál es" faltan cuatro decisiones que casi nunca
se toman de forma consciente: **qué se despliega**, **cuándo**, **quién
autoriza** y **cómo se vuelve atrás**.

Escribir un `deploy.yml` sin haberlas contestado produce el pipeline habitual:
uno que solo funciona hacia adelante.

## 2. Build once, deploy many

La regla más importante del CD, y la que más se incumple:

> El artefacto que se despliega es **exactamente** el que se probó. No se
> reconstruye por entorno.

Reconstruir para producción significa ejecutar `npm ci` otra vez, con otro reloj,
otra caché y quizá otra versión transitiva. Es un binario distinto que nadie ha
probado.

```yaml
permissions:
  contents: read

jobs:
  construir:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1
      - run: npm ci && npm run build
      - uses: actions/upload-artifact@043fb46d1a93c77aae656e7c1c64a875d1fc6a0a # v7.0.1
        with:
          name: sitio
          path: dist/

  desplegar:
    needs: construir
    runs-on: ubuntu-latest
    environment: production
    steps:
      - uses: actions/download-artifact@3e5f45b2cfb9172054b4087a40e8e0b5a5461e7c # v8.0.1
        with:
          name: sitio
```

El job de despliegue **no hace checkout**. No necesita el código: necesita el
artefacto. Cuando un job de despliegue empieza con un `checkout`, casi siempre es
que va a reconstruir algo.

## 3. Las cuatro etapas

| Etapa | Responsabilidad | Falla si… |
|-------|-----------------|-----------|
| **Construir** | Producir el artefacto, una sola vez | El build no es reproducible |
| **Validar** | Comprobar el artefacto, no el código fuente | Solo prueba lo que ya probó el CI |
| **Desplegar** | Llevar ese artefacto al destino | Hace algo más que copiar |
| **Verificar** | Comprobar que el destino responde | Nadie mira el resultado |

La etapa que más se olvida es la cuarta. Un despliegue sin *smoke test* es un
despliegue que no sabes si funcionó: el job sale verde porque la subida terminó,
no porque el sitio cargue.

```yaml
  verificar:
    needs: desplegar
    runs-on: ubuntu-latest
    steps:
      - name: Smoke test
        run: |
          CODIGO=$(curl -sS -o /dev/null -w '%{http_code}' "${{ needs.desplegar.outputs.url }}")
          [ "$CODIGO" = "200" ] || { echo "El sitio responde $CODIGO"; exit 1; }
```

## 4. Elegir el disparador

| Disparador | Cuándo tiene sentido | Riesgo |
|------------|----------------------|--------|
| `push` a `main` | Despliegue continuo real | Cada merge publica |
| `push` de tag `v*` | Publicación por versión (Semana 12) | Hay que acordarse de taguear |
| `workflow_dispatch` | Despliegue manual con inputs | Depende de la disciplina |
| `release: published` | El release es el evento de negocio | Encadena dos automatismos |
| `schedule` | Casi nunca para desplegar | Publica sin que nadie mire |

Combinar `push` a `main` con un environment que exige aprobación da lo mejor de
los dos: el pipeline llega **hasta la puerta** en cada merge, y la puerta la abre
una persona. Es la configuración de esta semana.

## 5. Volver atrás

Hay tres formas, en orden de preferencia:

1. **Redesplegar el artefacto anterior**: `gh run rerun <id-del-run-bueno>`.
   Segundos, y sin tocar el repositorio. Solo funciona mientras el artefacto
   siga vivo
2. **Revertir el commit y dejar que el pipeline despliegue**: limpio en la
   historia, tarda lo que tarde el build
3. **Arreglar hacia adelante**: la única opción cuando el problema no está en el
   artefacto sino en los datos

La opción 1 depende de la retención de artefactos, que en un repositorio público
llega hasta 90 días:

```bash
gh api repos/{owner}/{repo}/actions/permissions/artifact-and-log-retention
# {"days":90,"maximum_allowed_days":90}
```

Bajar la retención reduce la superficie de un artefacto filtrado y también tu
ventana de rollback. Es un intercambio consciente, no un ajuste por defecto.

> [!NOTE]
> Decidir la vuelta atrás **antes** del primer despliegue es lo que separa un
> pipeline de un experimento. Escríbela en el README del proyecto: qué comando,
> quién lo ejecuta y cómo se comprueba que funcionó.

## 6. Un destino, dos puertas

En el plan Free con repositorios públicos hay un sitio de Pages por repositorio.
No hay dos hosts, así que no se pueden montar dos entornos de verdad sin salirse
del plan.

Lo honesto es no fingirlo. Lo que sí se puede montar —y es lo que hace la
[práctica 04](../2-practicas/04-cd-con-promocion.md)— es la **mecánica completa
de la promoción** con un solo destino:

| Environment | Qué representa aquí | Qué se practica de verdad |
|-------------|---------------------|---------------------------|
| `staging` | Validación del artefacto ya construido | Variables de environment, historia de despliegues, `needs` |
| `github-pages` | El sitio publicado | Revisores, política de ramas, aprobación por API |

Cuando mañana tengas dos destinos reales, lo único que cambia es el step que
publica. El resto del pipeline —artefacto único, puertas, registro, rollback— ya
está montado y ya lo has usado.

## 7. Medir sin hoja de cálculo

Las dos métricas DORA que salen gratis de la API, enlazando con la Semana 05:

```bash
# Frecuencia de despliegue: cuántos despliegues con éxito este mes
gh api --paginate "repos/{owner}/{repo}/deployments?environment=github-pages" \
  --jq '[.[] | select(.created_at > "2026-08-01")] | length'

# Lead time aproximado: del commit al despliegue
gh api "repos/{owner}/{repo}/deployments?environment=github-pages" \
  --jq '.[0] | {sha: .sha[0:7], desplegado: .created_at}'
```

No hace falta un panel: hace falta que el número exista y que alguien lo mire una
vez al mes.

## 8. Antipatrones

| Antipatrón | Por qué duele | Qué hacer |
|------------|---------------|-----------|
| Reconstruir en cada entorno | Despliegas algo que nadie probó | Un artefacto, varios destinos |
| `checkout` en el job de despliegue | Señal de que va a reconstruir | Descargar el artefacto |
| Desplegar sin smoke test | Verde no significa disponible | Cuarta etapa siempre |
| Sin plan de rollback | Se improvisa con el sitio caído | Decidirlo y escribirlo antes |
| Un solo job que hace todo | No se puede reintentar una parte | Cuatro jobs con `needs` |
| Credenciales de despliegue como secreto de repositorio | Cualquier rama las usa | Environment + OIDC |
| `cancel-in-progress: true` en el despliegue | Destino a medias | `false` |
| Desplegar desde el portátil "solo esta vez" | Se pierde el registro y la historia | Siempre por el pipeline |

## 9. Trucos

- **`gh run rerun <id>` sobre el run bueno** es el rollback más rápido que vas a
  tener; ten el id a mano
- **La `url` del environment sale de un output**, así aparece enlazada en el run
  y en la portada del repositorio
- **`timeout-minutes` en el job de despliegue**: un despliegue colgado bloquea la
  cola de `concurrency`
- **Un artefacto por commit, con el SHA en el nombre**: `sitio-${{ github.sha }}`
  hace obvio qué se desplegó
- **`if: github.ref == 'refs/heads/main'`** en el job de despliegue evita
  sorpresas si alguien copia el workflow a otra rama
- **Guarda el `run_id` del último despliegue bueno** en el resumen del job:
  `echo "Rollback: gh run rerun $GITHUB_RUN_ID" >> "$GITHUB_STEP_SUMMARY"`

## 📚 Recursos Adicionales

- [Deploying with GitHub Actions](https://docs.github.com/en/actions/how-tos/deploy/deploy-to-third-party-platforms)
- [Using concurrency](https://docs.github.com/en/actions/concepts/workflows-and-actions/concurrency)
- [Storing and sharing data from a workflow](https://docs.github.com/en/actions/tutorials/store-and-share-data)
- [Publishing with a custom GitHub Actions workflow (Pages)](https://docs.github.com/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site#publishing-with-a-custom-github-actions-workflow)

## ✅ Checklist de Verificación

- [ ] Sabes distinguir integración, entrega y despliegue continuos
- [ ] Tu pipeline construye una vez y despliega ese artefacto
- [ ] Tienes una cuarta etapa que comprueba que el destino responde
- [ ] Sabes cómo vas a volver atrás y cuánto dura esa opción
- [ ] Puedes contar tus despliegues del mes con un solo comando
