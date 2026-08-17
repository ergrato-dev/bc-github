# Proyecto Semana 07 — Las reglas del repositorio, escritas

> Al terminar, tu repositorio no depende de que alguien recuerde cómo se hacen
> las cosas: está escrito, y buena parte se comprueba solo.

## 🎯 Objetivo

Dejar por escrito y automatizado el contrato del proyecto: convención de
commits, flujo de ramas, proceso de review, dueños por área y Definition of
Done.

## 📦 Qué añade esta capa

La Semana 06 te dio las herramientas; esta las convierte en acuerdos. Y prepara
la 08: un ruleset solo puede exigir lo que ya está definido. Sin convención no
hay nada que validar; sin DoD no hay nada que requerir.

También prepara la Semana 12: el changelog automático y el versionado se
alimentan **exclusivamente** de los mensajes que empiezas a escribir hoy.

## ✅ Requisitos verificables

Estos son exactamente los que comprueba `checks.json`:

1. [ ] Existe `.githooks/commit-msg` versionado
2. [ ] Existe `.github/workflows/validar-pr.yml`
3. [ ] `CODEOWNERS` existe y no tiene errores de validación
4. [ ] La plantilla de PR incluye la Definition of Done
5. [ ] `scripts/auditoria-prs.sh` está en el repositorio
6. [ ] Hay 3 o más PRs mergeados con título convencional

## 🎨 Criterios de calidad

Lo que la API no ve:

- **`CONTRIBUTING.md` es un documento útil**, no un formulario: convención,
  flujo de ramas elegido **y por qué**, proceso de review, DoD y umbrales.
- **La DoD tiene 8 puntos o menos y todos son comprobables.** Si aparece "código
  de calidad", sobra.
- **El flujo de ramas está justificado.** "GitHub flow porque no mantenemos
  varias versiones en producción y el CI tarda menos de 5 minutos" es una
  justificación; "GitHub flow" no.
- **Las reglas de `CODEOWNERS` van de lo general a lo específico**, coherentes
  con que gana la última.
- **La auditoría terminó en acciones**, no en observaciones.

## 💡 Adaptación a tu dominio

| Dominio | Áreas de `CODEOWNERS` | Scope típico de commit |
|---------|----------------------|------------------------|
| 📖 Biblioteca | `/src/prestamos/`, `/src/socios/`, `/src/catalogo/` | `feat(prestamos):` |
| 🏋️ Gimnasio | `/src/reservas/`, `/src/socios/`, `/src/clases/` | `fix(reservas):` |
| 🎥 Cine | `/src/butacas/`, `/src/funciones/`, `/src/ventas/` | `feat(butacas):` |
| 💊 Farmacia | `/src/inventario/`, `/src/lotes/`, `/src/ventas/` | `fix(lotes):` |

## 🚦 Cómo entregarlo

```bash
./scripts/verificar-semana.sh 07 --repo <tu-usuario>/<tu-repo>
```

## 🧯 Errores comunes

| Error | Por qué pasa | Solución |
|-------|--------------|----------|
| El hook no se ejecuta | `.git/hooks` no se versiona | `.githooks/` + `git config core.hooksPath .githooks` |
| Validas commits pero mergeas con squash | Lo que llega a `main` es el título del PR | Valida el título en CI |
| `codeowners/errors` con `Unknown owner` | Usuario sin acceso al repositorio | Corrige el nombre |
| El dueño no es el esperado | Gana la última regla, no la más específica | Reordena de general a específico |
| DoD de 20 puntos | Se marca todo sin leer | Máximo 8, todos comprobables |
| Títulos de PR sin convención en PRs viejos | El workflow es posterior | Los nuevos ya cumplen; no reescribas la historia |
