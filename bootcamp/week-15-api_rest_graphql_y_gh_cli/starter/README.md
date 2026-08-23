# Starter — Semana 15

Código de partida de las Prácticas 03 y 04. **No se ejecuta desde aquí**: cada
archivo se copia a su sitio en **tu** repositorio y se completa descomentando los
bloques marcados con `PASO N`, en orden.

| Archivo | Dónde va | Práctica |
|---------|----------|----------|
| [`auditoria.ts`](auditoria.ts) | `tools/auditoria.ts` de tu repo | 03 |
| [`auditoria.yml`](auditoria.yml) | `.github/workflows/auditoria.yml` de tu repo | 03 |
| [`gh-auditoria`](gh-auditoria) | Raíz del repositorio `gh-auditoria` | 04 |

## Antes de empezar

`tools/auditoria.ts` lee la consulta que creaste en la Práctica 02:

```
tools/
├── auditoria.ts
└── consultas/
    └── auditoria.graphql
```

Si la consulta no está ahí, el guion falla con código 3 («no se pudo auditar»),
que es exactamente lo que tiene que hacer.

## Dependencias

```bash
pnpm add octokit
pnpm add -D tsx @octokit/plugin-throttling @octokit/plugin-retry
```

Y el atajo en `package.json`:

```json
{
  "scripts": {
    "auditoria": "tsx tools/auditoria.ts"
  }
}
```

## Ejecutar en local

```bash
export GITHUB_TOKEN=$(gh auth token)     # no escribas el token en ningún archivo
pnpm auditoria -- --repo <tu-usuario>/<tu-repo> --formato json
```

## Cómo leer los bloques

```ts
// ============================================
// PASO 3: recoger
// ============================================
// Descomenta: los workflows solo existen en REST
// const workflows = await octokit.paginate(...)
```

Descomenta **un bloque cada vez** y vuelve a ejecutar. Si descomentas los seis de
golpe y falla, no vas a saber cuál fue.

> [!NOTE]
> El guion sale con **0** si todo cumple, **1** si hay hallazgos, **2** si lo
> llamaste mal y **3** si no pudo auditar. Esa diferencia es la que evita que una
> auditoría rota lleve tres semanas pareciendo verde.

---

← [Volver a la Semana 15](../README.md)
