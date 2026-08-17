# 🔒 Política de Seguridad

Este repositorio es **material educativo**, no un producto en producción. Aun
así, enseña técnicas de seguridad (tokens, OIDC, secret scanning, cadena de
suministro) y por eso trata los reportes de seguridad con seriedad.

## Qué reportar

| Tipo | Ejemplo | Canal |
| --- | --- | --- |
| Secreto expuesto en este repo | Un token real en un ejemplo de workflow | **Privado** (ver abajo) |
| Ejemplo que enseña una práctica insegura | Un workflow con `pull_request_target` + checkout del PR sin advertencia | Issue público |
| Dependencia vulnerable en un `starter/` | Alerta de Dependabot | Issue público |
| Enlace a una action de terceros comprometida | Action sin pin de SHA que cambió de dueño | **Privado** |

Regla: si publicarlo aumenta el daño, va en privado. Si publicarlo solo mejora
el material, va en issue público.

## Cómo reportar en privado

1. **Preferido**: pestaña `Security` → `Report a vulnerability` (private
   vulnerability reporting). Es el mismo mecanismo que se estudia en la
   Semana 14.
2. Alternativa: correo a **elparcheti@gmail.com** con asunto
   `[SECURITY] bc-github`.

Incluye: archivo y línea, impacto concreto, y pasos para reproducirlo.

**Tiempo de respuesta esperado**: primer acuse en 7 días naturales.

## Si filtras un secreto haciendo las prácticas

Va a pasarle a alguien. El orden correcto es:

1. **Revoca/rota el secreto primero.** Un token filtrado se considera
   comprometido desde el segundo en que tocó un repo público, aunque borres el
   commit.
2. Luego limpia la historia (`git filter-repo`, ver Semana 18).
3. Activa **push protection** para que no vuelva a ocurrir (Semana 14).

Nunca al revés. Borrar el commit sin rotar el secreto solo te da una falsa
sensación de seguridad — el commit sigue accesible por su SHA y por los forks.

## Fuera de alcance

- Vulnerabilidades en GitHub como producto → repórtalas a
  [GitHub Bug Bounty](https://bounty.github.com/), no aquí.
- Vulnerabilidades en dependencias upstream (Node, npm, actions de terceros) →
  repórtalas al proyecto correspondiente; aquí solo actualizamos la referencia.
