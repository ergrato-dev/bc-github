# Práctica 02 — La puerta de los reportes

> Hasta ahora tu repositorio se defiende de lo que entra. Esta práctica abre la
> puerta contraria: la que usa alguien de fuera para contarte, en privado, que
> encontró un fallo. Y ensaya el otro lado del mostrador de la Semana 13:
> escribir tú el advisory que a otros les llegará como alerta.

**Duración estimada**: 40 min
**Prerrequisitos**: [Teoría 05](../1-teoria/05-recibir-un-reporte-de-vulnerabilidad.md)
y [06](../1-teoria/06-los-advisories-del-repositorio.md).
[Práctica 01](01-secretos-que-no-entran.md) completada

> [!CAUTION]
> El advisory de esta práctica se queda en **borrador**. Publicarlo lo mandaría a
> la GitHub Advisory Database, que es una base de datos global real: un aviso
> inventado ahí genera alertas falsas a terceros y hay que retirarlo a mano. El
> Paso 6 lo deja en borrador a propósito, y ese es el entregable.

## Paso 1: Un `SECURITY.md` que se pueda seguir

**Por qué**: el que escribiste en la Semana 02 cumplía el expediente. Este tiene
que contestar cinco preguntas concretas, porque de eso depende que un reporte
llegue completo y no como «oye, creo que hay algo raro».

```bash
git switch -c docs/politica-de-seguridad

cat > SECURITY.md <<'EOF'
# Política de seguridad

## Versiones con soporte

| Versión | Soporte            |
| ------- | :----------------: |
| 1.x     | ✅ Correcciones de seguridad |
| < 1.0   | ❌ Sin soporte     |

## Reportar una vulnerabilidad

Usa el formulario privado de GitHub:

**https://github.com/<tu-usuario>/<tu-repo>/security/advisories/new**

No abras un issue público para un fallo de seguridad: el issue es visible desde
el primer segundo y deja sin margen a quien tiene que actualizar.

Incluye en el reporte:

- Versión afectada y cómo la instalaste
- Pasos para reproducirlo
- Impacto que esperas (qué puede hacer un atacante y con qué acceso previo)

## Qué puedes esperar

| Momento | Compromiso |
| --- | --- |
| 72 horas | Acuse de recibo |
| 7 días | Evaluación inicial y severidad propuesta |
| 30 días | Corrección publicada o plan público, coordinado contigo |

Publicamos un advisory con crédito a quien reporta, salvo que prefiera el
anonimato.

## Fuera de alcance

- Resultados de escáneres automáticos sin impacto demostrado
- Ataques que requieren acceso físico a la máquina del usuario
- Vulnerabilidades de dependencias que ya tienen advisory publicado
EOF

# Sustituye <tu-usuario> y <tu-repo> por los tuyos antes de commitear.
git add SECURITY.md
git commit -m "docs: politica de seguridad con canal de reporte privado"
git push -u origin docs/politica-de-seguridad
gh pr create --fill
gh pr merge --squash --delete-branch
```

**Verifica** que el archivo está en la rama por defecto y que enlaza el
formulario:

```bash
gh api repos/{owner}/{repo}/contents/SECURITY.md --jq '.content | @base64d' \
  | grep "security/advisories/new"
```

## Paso 2: Abrir el canal privado

**Por qué**: sin esto, la URL del `SECURITY.md` lleva a una página que no deja
reportar. El archivo y el ajuste solo sirven juntos.

```bash
gh api repos/{owner}/{repo}/private-vulnerability-reporting --method PUT
```

**Verifica**:

```bash
gh api repos/{owner}/{repo}/private-vulnerability-reporting --jq '.enabled'
```

Debe salir `true`. En la interfaz es **Settings → Advanced Security → Private
vulnerability reporting**.

Ahora míralo como lo ve quien reporta: abre
`https://github.com/<tu-usuario>/<tu-repo>/security/advisories` en el navegador y
comprueba que aparece el botón **Report a vulnerability**.

## Paso 3: Redactar el advisory en borrador

**Por qué**: escribir uno enseña qué campos hacen que la alerta funcione. La
vulnerabilidad que vas a describir es la que ya arreglaste en la Práctica 03 de
la Semana 13 — la construcción de comando con datos de entrada.

```bash
gh api repos/{owner}/{repo}/security-advisories --method POST --input - <<'JSON'
{
  "summary": "Inyeccion de comando al construir la llamada de exportacion",
  "description": "Las versiones anteriores a la 1.1.0 construyen un comando de shell concatenando un parametro recibido del usuario sin validarlo ni escaparlo. Un atacante que controle ese parametro puede ejecutar comandos arbitrarios con los permisos del proceso. Corregido sustituyendo la construccion de la cadena por una llamada con argumentos separados.",
  "severity": "high",
  "cwe_ids": ["CWE-78"],
  "vulnerabilities": [
    {
      "package": { "ecosystem": "npm", "name": "<el-nombre-de-tu-paquete>" },
      "vulnerable_version_range": "< 1.1.0",
      "patched_versions": "1.1.0"
    }
  ],
  "start_private_fork": true
}
JSON
```

**Verifica** que existe y quedó en borrador:

```bash
gh api repos/{owner}/{repo}/security-advisories \
  --jq '.[] | {ghsa: .ghsa_id, estado: .state, severidad: .severity,
               paquete: .vulnerabilities[0].package.name,
               rango: .vulnerabilities[0].vulnerable_version_range,
               parche: .vulnerabilities[0].patched_versions}'
```

Los tres campos que decidirían si la alerta llega a alguien —`package.name`,
`vulnerable_version_range` y `patched_versions`— tienen que salir rellenos. Un
advisory sin `patched_versions` genera en el otro lado la alerta que no se puede
arreglar.

## Paso 4: El fork privado temporal

**Por qué**: es donde se arregla un fallo durante el embargo, sin que el commit
del arreglo enseñe públicamente dónde estaba el problema.

`start_private_fork: true` ya lo creó. Compruébalo desde la interfaz:

**Security → Advisories → tu borrador**. Abajo aparece el fork privado temporal
con un botón para clonarlo.

```bash
gh api repos/{owner}/{repo}/security-advisories \
  --jq '.[] | {ghsa: .ghsa_id, fork: .private_fork.full_name}'
```

**Verifica** que `fork` no es `null`. Ese repositorio es privado aunque el tuyo
sea público: los commits que hagas ahí no se ven desde fuera hasta que el
advisory se publica.

## Paso 5: Créditos

**Por qué**: casi siempre el fallo lo encuentra otra persona, y el crédito es lo
único que se lleva. Se declara en el advisory, no en el mensaje del commit.

```bash
GHSA=$(gh api repos/{owner}/{repo}/security-advisories --jq '.[0].ghsa_id')

gh api repos/{owner}/{repo}/security-advisories/$GHSA --method PATCH --input - <<JSON
{
  "credits": [
    { "login": "$(gh api user --jq .login)", "type": "finder" }
  ]
}
JSON
```

**Verifica**:

```bash
gh api repos/{owner}/{repo}/security-advisories/$GHSA \
  --jq '{ghsa: .ghsa_id, creditos: [.credits[]? | {login: .user.login, tipo: .type}]}'
```

El crédito nace en estado **pendiente**: la persona acreditada tiene que
aceptarlo antes de que aparezca en el advisory publicado. Para el ejercicio te
acreditas a ti mismo; en un caso real, `finder` es quien encontró el fallo y
`reporter` quien lo comunicó — pueden ser personas distintas, y a quien reporta
le importa la diferencia.

## Paso 6: Dejarlo en borrador, a propósito

**Por qué**: publicar es la única operación de esta semana que afecta a gente que
no eres tú.

```bash
gh api repos/{owner}/{repo}/security-advisories --jq '[.[] | select(.state == "draft")] | length'
```

**Verifica** que sale `1` o más y que **ninguno** está en `published`:

```bash
gh api repos/{owner}/{repo}/security-advisories --jq '[.[] | select(.state == "published")] | length'
```

Debe salir `0`. Para tu propia referencia, el comando que lo publicaría —el que
**no** vas a ejecutar aquí— es:

```bash
# NO ejecutar en esta práctica.
# gh api repos/{owner}/{repo}/security-advisories/$GHSA --method PATCH -f state=published
```

Y el orden del día en que sí se ejecuta, en un caso real: arreglo fusionado →
versión parcheada publicada en el registro → advisory publicado → anuncio.

## Paso 7: Ensayar la primera respuesta

**Por qué**: el momento en que se pierde a un investigador es el silencio de los
primeros días. Tener la respuesta escrita convierte 20 minutos de redacción en
dos.

Crea `.github/RESPUESTA-SEGURIDAD.md` con tu plantilla:

```bash
git switch -c docs/plantilla-de-respuesta
mkdir -p .github

cat > .github/RESPUESTA-SEGURIDAD.md <<'EOF'
# Plantilla de primera respuesta a un reporte de seguridad

> Se pega en el hilo privado del advisory, dentro de las 72 horas.

Gracias por el reporte, recibido el <fecha>.

Estamos reproduciendo el problema y te confirmamos la evaluación inicial antes
del <fecha + 7 días>.

Tres cosas mientras tanto:

1. ¿Puedes confirmar la versión exacta en la que lo reprodujiste?
2. Si publicamos un advisory, ¿quieres aparecer en los créditos? ¿Con qué nombre?
3. ¿Tienes una fecha límite propia para hacerlo público?

Trabajamos con divulgación coordinada: publicamos el advisory el mismo día que
la versión con el arreglo, y te avisamos antes.
EOF

git add .github/RESPUESTA-SEGURIDAD.md
git commit -m "docs: plantilla de primera respuesta a reportes de seguridad"
git push -u origin docs/plantilla-de-respuesta
gh pr create --fill
gh pr merge --squash --delete-branch
```

**Verifica**:

```bash
gh api repos/{owner}/{repo}/contents/.github/RESPUESTA-SEGURIDAD.md --jq '.name'
```

La pregunta 3 es la que casi nadie hace y la que más problemas evita: saber desde
el principio si quien reporta tiene su propio plazo de publicación.

## ⚠️ Problemas frecuentes

| Síntoma | Causa | Arreglo |
|---------|-------|---------|
| `403` al activar el reporte privado | No eres administrador del repositorio | Solo el propietario puede |
| `422` al crear el advisory | Falta `summary`, `description` o `vulnerabilities` | Los tres son obligatorios |
| `422` con `severity` y `cvss_vector_string` | Son mutuamente excluyentes | Uno de los dos, no ambos |
| El ecosistema es rechazado | No está en la lista cerrada | `npm`, `pip`, `actions`… o `other` |
| `private_fork` sale `null` | Se creó sin `start_private_fork` | Se puede crear después desde la interfaz |
| El botón *Report a vulnerability* no aparece | El ajuste no está activo | Paso 2 |
| El advisory no aparece por API | Los borradores requieren permisos de escritura | Autenticarse como propietario |

## ✅ Resultado

- [ ] `SECURITY.md` contesta las cinco preguntas y enlaza `/security/advisories/new`
- [ ] El reporte privado está activo (`enabled: true`)
- [ ] Existe un advisory en estado `draft` con paquete, rango y versión parcheada
- [ ] Tiene un crédito declarado
- [ ] **Ningún** advisory en estado `published`
- [ ] Hay una plantilla de primera respuesta escrita

## ✅ Verificación de la semana

```bash
./scripts/verificar-semana.sh 14 --repo <tu-usuario>/<tu-repo>
```

---

← [Volver a la Semana 14](../README.md)
