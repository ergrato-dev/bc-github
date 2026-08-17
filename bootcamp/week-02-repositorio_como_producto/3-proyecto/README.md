# Proyecto Semana 02 — Tu repositorio, presentable

> Al terminar, tu repositorio se explica solo: alguien que llega de fuera sabe
> qué es, cómo empezar y cómo contribuir, sin preguntarte nada.

## 🎯 Objetivo

Llevar el perfil de comunidad al 100%, normalizar el comportamiento de Git con
`.gitattributes`, enrutar revisores con `CODEOWNERS` y publicar el proyecto en
GitHub Pages.

## 📦 Qué añade esta capa

La Semana 01 creó el repositorio; esta lo convierte en algo que otra persona
puede usar. Y prepara el terreno de lo que viene: `CODEOWNERS` será obligatorio
con el ruleset de la Semana 08, y el sitio de Pages pasará a desplegarse desde
Actions en la Semana 11.

## ✅ Requisitos verificables

Estos son exactamente los que comprueba `checks.json`:

1. [ ] El perfil de comunidad está al 100%
2. [ ] Existe `.gitattributes` en la rama por defecto
3. [ ] Existe `CODEOWNERS` sin errores de validación
4. [ ] El repositorio tiene 3 o más topics
5. [ ] Tiene descripción y homepage configurados
6. [ ] GitHub Pages está desplegado (`status: built`)

## 🎨 Criterios de calidad

Lo que la API no ve:

- **El README pasa la prueba de los diez segundos.** Alguien ajeno entiende qué
  hace el proyecto sin leerlo entero.
- **La licencia está elegida, no copiada.** Puedes explicar en una frase qué
  obliga a quien use tu código.
- **El diagrama Mermaid dice algo.** Si se puede borrar sin perder información,
  sobra.
- **Los archivos de comunidad están escritos.** Un `CODE_OF_CONDUCT.md` sin
  correo de contacto o un `SECURITY.md` sin instrucciones de reporte son
  decoración.
- **Los topics son buscables.** `biblioteca`, `prestamos`, `reglas-de-negocio`,
  no `proyecto` ni `curso`.

## 💡 Adaptación a tu dominio

| Dominio | Diagrama que merece la pena | Topics |
|---------|----------------------------|--------|
| 📖 Biblioteca | Flujo de préstamo y devolución con multas | `biblioteca` `prestamos` `multas` |
| 🏋️ Gimnasio | Reserva de clase con aforo y lista de espera | `gimnasio` `reservas` `aforo` |
| 🎥 Cine | Selección de asiento y bloqueo temporal | `cine` `butacas` `reservas` |
| 💊 Farmacia | Control de lotes y caducidades | `farmacia` `inventario` `lotes` |

## 🚦 Cómo entregarlo

```bash
./scripts/verificar-semana.sh 02 --repo <tu-usuario>/<tu-repo>
```

## 🧯 Errores comunes

| Error | Por qué pasa | Solución |
|-------|--------------|----------|
| Perfil de comunidad en 83% | Falta un archivo o está en ruta no reconocida | `gh api repos/{owner}/{repo}/community/profile --jq '.files'` |
| `codeowners/errors` devuelve 404 | No existe el archivo | Créalo en `.github/CODEOWNERS` |
| `Unknown owner` | El usuario no tiene acceso al repositorio | Corrige el nombre o dale acceso |
| Pages en 404 | Falta `index.html` en la carpeta origen | Comprueba la ruta configurada |
| Topics rechazados | Llevan mayúsculas o espacios | Minúsculas y guiones |
| El diff se llenó de cambios tras `.gitattributes` | Es la renormalización, ocurre una vez | Commit aparte explicándolo |
