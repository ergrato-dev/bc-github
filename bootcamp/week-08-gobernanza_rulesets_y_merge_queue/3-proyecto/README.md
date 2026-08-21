# Proyecto Semana 08 — `main` protegida de verdad

> Al terminar, las reglas de tu proyecto dejan de depender de que alguien las
> recuerde. Las aplica la plataforma, y están escritas como código en tu propio
> repositorio.

## 🎯 Objetivo

Convertir los acuerdos de la Semana 07 en reglas técnicas que no se pueden
saltar, y añadir una segunda puerta —el environment— para lo que sale a
producción.

## 📦 Qué añade esta capa

La Semana 07 escribió el contrato: Conventional Commits, CODEOWNERS, Definition
of Done, proceso de review. Todo eso seguía siendo voluntario. Esta semana el
contrato se vuelve obligatorio.

Y prepara tres semanas de golpe:

- **Semana 09**: cada workflow que escribas puede convertirse en un check
  requerido. El patrón de la Práctica 03 es el que vas a repetir
- **Semana 11**: el environment `production` es donde entrará el despliegue real
  por OIDC, sin secretos de larga vida
- **Semana 12**: los releases firmados necesitan una `main` que nadie pueda
  reescribir

## ✅ Requisitos verificables

Estos son exactamente los que comprueba `checks.json`:

1. [ ] Existe al menos un ruleset en modo `active`
2. [ ] El ruleset está versionado en `.github/rulesets/main-proteccion.json`
3. [ ] `main` exige pull request antes de mergear
4. [ ] `main` exige revisión de code owners
5. [ ] `main` no admite force push
6. [ ] `main` no se puede borrar
7. [ ] `main` exige al menos un status check
8. [ ] `main` exige commits firmados
9. [ ] Existe `.github/workflows/tamano-de-archivos.yml`
10. [ ] Hay un environment con revisores obligatorios
11. [ ] Ese environment limita desde qué ramas se despliega
12. [ ] `CONTRIBUTING.md` documenta la gobernanza de `main`

## 🎨 Criterios de calidad

Lo que la API no ve:

- **Las reglas corresponden a los acuerdos de la Semana 07**, no a una lista
  copiada de un repositorio de empresa. Si en la 07 elegiste squash, aquí hay
  `allowed_merge_methods: ["squash"]`; si elegiste merge commits, aquí **no** hay
  `required_linear_history`.
- **`bypass_actors` está vacío, o cada entrada está justificada por escrito.** Un
  bypass `always` para tu propio usuario invalida el trabajo de toda la semana.
- **Los `context` de los checks requeridos existen de verdad.** Los leíste con
  `gh pr checks --json name`, no los dedujiste del nombre del archivo.
- **`CONTRIBUTING.md` explica qué se exige y por qué**, no solo qué. Quien llegue
  al repositorio tiene que saber a qué atenerse antes de que se lo rechacen.
- **Sabes decir por qué no has activado merge queue.** Con datos de tu repo:
  cuántos PRs mergeas al día y cuánto tarda tu CI.
- **El secreto del environment no aparece en ningún log.** Ni siquiera
  enmascarado.

## 💡 Adaptación a tu dominio

La gobernanza es la parte menos dependiente del dominio de todo el bootcamp: las
reglas son las mismas para una biblioteca que para una farmacia. Lo que sí cambia
es qué áreas de `CODEOWNERS` acaban siendo críticas.

| Dominio | Ruta que más conviene proteger | Por qué |
|---------|-------------------------------|---------|
| 📖 Biblioteca | `/src/prestamos/` | Ahí viven las multas y los plazos |
| 🏋️ Gimnasio | `/src/reservas/` | Concurrencia y aforo |
| 🎥 Cine | `/src/butacas/` | Doble venta de la misma butaca |
| 💊 Farmacia | `/src/lotes/` | Caducidades: un error tiene consecuencias reales |

En los cuatro casos, `.github/workflows/` y `.github/rulesets/` son lo más
sensible del repositorio: quien puede cambiar las reglas puede saltárselas.

## 🚦 Cómo entregarlo

```bash
./scripts/verificar-semana.sh 08 --repo <tu-usuario>/<tu-repo>
```

## 🧯 Errores comunes

| Error | Por qué pasa | Solución |
|-------|--------------|----------|
| Te bloqueas a ti mismo | `required_approving_review_count: 1` trabajando solo | Ponlo a 0; el resto de la regla sigue haciendo su trabajo |
| PRs colgados para siempre | Un `context` requerido que ningún check reporta | Léelo con `gh pr checks --json name` |
| No puedes pushear nada | Firmas obligatorias sin firmar | `disabled` el ruleset, arregla la firma, reactiva |
| Bypass "temporal" que se queda | Es más cómodo que arreglar la causa | `disabled` y volver a `active` deja historial; el bypass no |
| El environment no protege nada | Lo creó el workflow al vuelo | Créalo tú antes, con sus reglas |
| El ruleset solo existe en Settings | Se configuró por la UI | Expórtalo al JSON y versiónalo |
| Buscar las push rules durante una hora | Requieren Team+ y repo privado | Un check requerido cubre el caso real |

## 🔗 Navegación

← [Volver a la Semana 08](../README.md)
