# Las actualizaciones de seguridad

> Enterarte de una vulnerabilidad y arreglarla son dos problemas distintos. Las
> alertas resuelven el primero. Las actualizaciones de seguridad resuelven el
> segundo automáticamente y solo para eso: **la versión mínima que cierra la
> alerta**, ni una más. Es la diferencia entre un bot que te ayuda y un bot que
> te llena el repositorio de pull requests.

## 🎯 Objetivos

- Activar las actualizaciones de seguridad y comprobarlo por API
- Explicar qué pull request abre exactamente y por qué esa versión y no otra
- Reconocer los casos en los que Dependabot **no puede** arreglarlo
- Agrupar actualizaciones de seguridad sin perder la trazabilidad
- Entender qué significa que Dependabot esté «en pausa»

## 1. Qué problema resuelve

Tienes una alerta `high` sobre un paquete transitivo. Para arreglarla hay que
saber qué versión la parchea, si tu árbol admite esa versión, qué más se mueve al
subirla y si los tests siguen pasando. Eso son veinte minutos por alerta, y las
alertas llegan cuando llegan, no cuando tienes veinte minutos.

Las **actualizaciones de seguridad** (*Dependabot security updates*) hacen ese
trabajo: en cuanto se levanta una alerta con parche disponible, abren un pull
request que sube la dependencia **a la versión mínima que sale del rango
vulnerable**.

Que sea la mínima es la decisión de diseño importante: no te lleva a la última
versión, te saca del agujero. Cuanto menor el salto, menor la probabilidad de que
rompa algo y mayor la de que te atrevas a fusionarlo hoy.

## 2. Cómo se activa

```bash
# Activar
gh api repos/{owner}/{repo}/automated-security-fixes --method PUT

# Comprobar
gh api repos/{owner}/{repo}/automated-security-fixes
# {"enabled":true,"paused":false}

# Desactivar
gh api repos/{owner}/{repo}/automated-security-fixes --method DELETE
```

En la interfaz: **Settings → Advanced Security → Dependabot security updates**.

Dos requisitos previos, y si falta alguno el ajuste queda activo pero inerte:

1. El **grafo de dependencias** tiene que ver tu proyecto (Teoría 01)
2. Las **alertas** tienen que estar activas (Teoría 02) — sin alerta no hay nada
   que arreglar

También lo verás reflejado en el repositorio:

```bash
gh api repos/{owner}/{repo} --jq '.security_and_analysis.dependabot_security_updates.status'
# enabled
```

> [!NOTE]
> Ese campo aparece en `security_and_analysis` junto a los de secret scanning,
> que son de la Semana 14. Las alertas, en cambio, **no** salen ahí: se consultan
> con `vulnerability-alerts` o pidiendo la lista de alertas.

## 3. Qué pull request abre

Uno por alerta, con la rama `dependabot/npm_and_yarn/<paquete>-<version>`, y un
cuerpo que trae lo que necesitas para revisarlo sin salir de la página:

- El aviso completo: GHSA, severidad, rango vulnerable, versión parcheada
- El changelog y las notas de release del paquete, si el proyecto las publica
- Los commits que entran entre tu versión y la nueva
- Una puntuación de compatibilidad, calculada con los CI de otros repositorios
  públicos que ya hicieron ese mismo salto

Esa última es más útil de lo que parece: no dice que a ti te vaya a funcionar,
dice a cuánta gente le funcionó. Con un `pnpm-lock.yaml` commiteado, el pull
request actualiza también el lockfile, que es lo que de verdad se despliega.

Las actualizaciones de seguridad **no dependen de `dependabot.yml`**. Funcionan
sin ese archivo. El archivo es de la Teoría 04 y sirve para otra cosa: mantener
al día lo que *no* es vulnerable.

## 4. Cuándo no puede arreglarlo

Aquí es donde conviene tener expectativas correctas:

| Situación | Por qué falla | Qué hacer tú |
|-----------|---------------|--------------|
| No hay versión parcheada | El mantenedor no ha publicado arreglo | Mitigar, sustituir el paquete o asumir el riesgo por escrito |
| Transitiva que exige subir a la madre | Fuera de npm, Dependabot no toca la dependencia padre | Actualizar la madre a mano, o forzar la resolución |
| El salto es un `MAJOR` con ruptura | Abre el PR, pero tu CI lo tumba | Es trabajo humano: migración, no fusión |
| La dependencia no está en el grafo | Manifiesto no reconocido o lockfile ausente | Arreglar el grafo primero |
| El repositorio está en pausa | Nadie interactuaba con los PR | Reactivarlo desde la interfaz |

En npm sí puede resolver una transitiva sin tocar la directa, porque el árbol lo
permite. En otros ecosistemas, no. Es la limitación que más sorprende a quien
llega de otro lenguaje.

## 5. Agruparlas

Por defecto, una alerta es un pull request. Con quince alertas, quince pull
requests, quince ejecuciones de CI y quince revisiones. Se agrupan desde
`dependabot.yml` con `applies-to: security-updates`:

```yaml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
    groups:
      seguridad-npm:
        applies-to: security-updates
        patterns:
          - "*"
```

Un solo pull request con todas las subidas de seguridad de npm. El compromiso es
real y hay que entenderlo:

- **A favor**: una revisión, una ejecución de CI, un merge
- **En contra**: si una de las quince rompe el build, se bloquean las quince

La regla práctica: **agrupa por lo que revisarías junto**. Las de desarrollo en
un grupo, las de producción en otro, y las `major` fuera de cualquier grupo
porque cada una necesita su propia conversación.

## 6. La pausa

El campo `paused` del endpoint no es un ajuste tuyo: lo pone GitHub. Cuando un
repositorio acumula pull requests de Dependabot que nadie mira durante mucho
tiempo, GitHub deja de generarlos y avisa. Es una medida contra el ruido: un
repositorio con cuarenta PR abandonados no está más seguro que uno sin ninguno,
y sí más difícil de revisar.

```bash
gh api repos/{owner}/{repo}/automated-security-fixes --jq '.paused'
```

Si sale `true`, el problema no es de configuración: es que el flujo de trabajo no
está funcionando. Se reactiva desde la interfaz del repositorio, pero reactivarlo
sin cambiar la costumbre solo reinicia el reloj.

## 7. Antipatrones

| Antipatrón | Por qué duele | Qué hacer |
|------------|---------------|-----------|
| Activar y no mirar | Los PR se acumulan y Dependabot se pausa | Un momento fijo a la semana, o auto-merge (Teoría 05) |
| Fusionar sin CI verde | Se cierra una vulnerabilidad y se abre una regresión | Checks obligatorios en el ruleset de la Semana 08 |
| Agruparlo todo en un grupo | Una rotura bloquea quince arreglos | Grupos por lo que revisarías junto |
| Cerrar el PR sin arreglar | La alerta sigue abierta y ya no habrá otro PR | Descartar la alerta con motivo, o arreglar |
| Esperar que arregle transitivas fuera de npm | No puede si hay que subir la madre | Actualizar la madre a mano |
| Confundirlas con version updates | Son sistemas distintos con activación distinta | Seguridad: siempre; versiones: `dependabot.yml` |

## 8. Trucos

- **`gh pr list --app dependabot`** lista solo sus pull requests — hay un flag
  específico para apps, y `--author` no sirve para esto
- **`gh api repos/{owner}/{repo}/automated-security-fixes --jq '.paused'`** es la
  comprobación que nadie hace y explica el «ya no me llegan PR»
- **Cerrar el pull request de una alerta la deja huérfana**: Dependabot no lo
  reabre. Si no lo vas a fusionar, descarta la alerta con su motivo
- **La puntuación de compatibilidad es una señal, no un permiso**: sigue haciendo
  falta que tus tests pasen
- **Un grupo con `patterns: ["*"]` y `applies-to: security-updates`** es la
  configuración mínima que quita el 80 % del ruido
- **Si un PR de seguridad se queda desactualizado**, `@dependabot rebase` en un
  comentario es más rápido que cerrarlo y esperar

## 📚 Recursos Adicionales

- [About Dependabot security updates](https://docs.github.com/en/code-security/dependabot/dependabot-security-updates/about-dependabot-security-updates)
- [Configuring Dependabot security updates](https://docs.github.com/en/code-security/dependabot/dependabot-security-updates/configuring-dependabot-security-updates)
- [REST — Automated security fixes](https://docs.github.com/en/rest/repos/repos#enable-automated-security-fixes)
- [Optimizing PR creation for version updates](https://docs.github.com/en/code-security/tutorials/secure-your-dependencies/optimizing-pr-creation-version-updates)

## ✅ Checklist de Verificación

- [ ] Tienes las actualizaciones de seguridad activas y lo has comprobado por API
- [ ] Sabes por qué el PR sube a la versión mínima que parchea, no a la última
- [ ] Puedes enumerar tres casos en los que Dependabot no puede arreglarlo
- [ ] Sabes agrupar actualizaciones de seguridad y qué se pierde al hacerlo
- [ ] Entiendes qué significa `paused` y por qué no se arregla reactivando
- [ ] Distingues actualizaciones de seguridad de actualizaciones de versión
