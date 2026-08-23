# Secret scanning

> Un secreto en el historial no es un descuido: es una credencial pública. En un
> repositorio público, el tiempo entre el `git push` y el primer uso automatizado
> de esa credencial se mide en segundos, no en horas — hay bots suscritos al
> firehose de eventos de GitHub cuyo único trabajo es probar lo que aparece.

## 🎯 Objetivos

- Explicar qué escanea GitHub, dónde y con qué patrones
- Distinguir patrones de proveedor, patrones genéricos y patrones propios
- Leer una alerta de secret scanning campo a campo desde la API
- Entender qué es una comprobación de validez y qué no promete
- Saber qué hace el programa de socios cuando aparece un token tuyo

## 1. Qué problema resuelve

Un secreto se cuela por rutas que no parecen peligrosas: un archivo `.env` que se
añade con `git add .`, un token pegado en un test para «probar rápido», una
captura de pantalla en un comentario, un log de CI subido como artifact.

**Secret scanning** busca credenciales en todo el repositorio y en todo lo que le
cuelga, no solo en la rama por defecto:

- Todo el **historial de Git**, en todas las ramas
- **Issues**: título, cuerpo y comentarios
- **Pull requests**: título, cuerpo, comentarios y descripciones
- **Discussions** y **wikis**
- Los **títulos y cuerpos** de los releases

Es decir: borrar el archivo no cierra nada. El secreto sigue en el objeto de Git
al que apunta el commit anterior, y ahí es donde el escáner lo encuentra.

## 2. Los tres tipos de patrón

| Tipo | Qué detecta | Disponibilidad |
|------|-------------|----------------|
| **De proveedor** (*partner patterns*) | Formatos registrados por más de cien servicios: GitHub, AWS, Stripe, Slack, Google, npm… | Gratis en repositorios públicos |
| **No proveedor** (*non-provider patterns*) | Formas genéricas: claves privadas, cadenas de conexión, contraseñas HTTP | Ajuste aparte del repositorio |
| **Propios** (*custom patterns*) | Expresiones regulares tuyas: el formato de token de tu propia API | Requiere GitHub Secret Protection |

Los de proveedor son el 90 % del valor y no hay nada que configurar: en un
repositorio **público** el escaneo corre solo y es gratuito. Los genéricos se
activan aparte porque son mucho más ruidosos —una cadena larga y aleatoria puede
ser una clave o puede ser un hash— y esa decisión es tuya.

> [!NOTE]
> Casi toda la documentación de secret scanning está escrita desde **GitHub
> Secret Protection**, que es de pago para repositorios privados. Lo que hace
> esta semana funciona gratis porque tu repositorio del bootcamp es público. Si
> una página insiste en licencias, comprueba a qué tipo de repositorio se
> refiere.

## 3. Encenderlo y comprobarlo

El estado vive en el objeto del repositorio, junto al resto de la seguridad:

```bash
gh api repos/{owner}/{repo} --jq '.security_and_analysis'
```

```json
{
  "secret_scanning": { "status": "enabled" },
  "secret_scanning_push_protection": { "status": "enabled" },
  "secret_scanning_non_provider_patterns": { "status": "disabled" },
  "secret_scanning_validity_checks": { "status": "disabled" }
}
```

Se cambia con un `PATCH` sobre el mismo objeto:

```bash
gh api repos/{owner}/{repo} --method PATCH \
  -F 'security_and_analysis[secret_scanning][status]=enabled' \
  -F 'security_and_analysis[secret_scanning_push_protection][status]=enabled'
```

En la interfaz: **Settings → Advanced Security**.

## 4. Anatomía de una alerta

```bash
gh api "repos/{owner}/{repo}/secret-scanning/alerts?state=open" \
  --jq '.[] | {
    n: .number,
    tipo: .secret_type_display_name,
    validez: .validity,
    bypass: .push_protection_bypassed,
    publico: .publicly_leaked,
    multi: .multi_repo
  }'
```

Los campos que deciden qué haces:

| Campo | Valores | Qué te dice |
|-------|---------|-------------|
| `state` | `open`, `resolved` | Si sigue viva |
| `resolution` | `false_positive`, `wont_fix`, `revoked`, `used_in_tests`, `pattern_edited`, `pattern_deleted` | Por qué se cerró |
| `secret_type` | Identificador del patrón | Qué proveedor emitió la credencial |
| `validity` | `active`, `inactive`, `unknown` | Si el secreto **todavía funciona** |
| `push_protection_bypassed` | Booleano | Si alguien decidió meterlo a propósito |
| `publicly_leaked` | Booleano | Si el secreto se ha visto en un repositorio público |
| `multi_repo` | Booleano | Si aparece en más de un repositorio tuyo |
| `secret` | La credencial | Solo si tu token tiene permiso para verla |

Dos matices que cambian el orden de trabajo:

- `resolution` solo acepta cuatro valores al escribir: `false_positive`,
  `wont_fix`, `revoked` y `used_in_tests`. Los otros dos los pone GitHub cuando
  se edita o se borra el patrón que generó la alerta.
- **`validity: active` es la única emergencia de la lista.** Significa que la
  credencial funciona ahora mismo.

Y hay un endpoint aparte que casi nadie usa y que responde la pregunta más útil
—*¿dónde está?*—:

```bash
gh api repos/{owner}/{repo}/secret-scanning/alerts/1/locations \
  --jq '.[] | {tipo: .type, commit: .details.commit_sha, ruta: .details.path}'
```

Una misma alerta puede tener muchas localizaciones: el commit que lo introdujo,
el comentario donde se pegó, la descripción del pull request donde se copió.

## 5. Comprobaciones de validez

Una **comprobación de validez** (*validity check*) es GitHub preguntándole al
proveedor si esa credencial sigue viva. No adivina: hace una llamada de solo
lectura contra la API del servicio y guarda el resultado en `validity`.

Sirve para ordenar el trabajo. En una bandeja con treinta alertas heredadas, las
`active` son las que hay que rotar hoy; las `inactive` son deuda documental.

Lo que **no** promete:

- No cubre todos los tipos de secreto — solo los proveedores que participan
- `unknown` no significa «inactivo», significa que nadie lo ha comprobado
- Una credencial `inactive` **sigue estando en tu historial** y sigue contando en
  una auditoría

## 6. El programa de socios

Cuando el escáner encuentra un token de un proveedor participante en un
repositorio **público**, no se limita a abrirte una alerta: **avisa al
proveedor**. Muchos responden revocando la credencial automáticamente en
segundos.

Es la razón por la que un token de GitHub filtrado en un repositorio público
suele estar muerto antes de que tú leas el correo. Y es también la razón por la
que esto **no** es un plan de respuesta:

- Solo funciona con proveedores que participan
- Solo funciona en repositorios **públicos**
- Solo revoca; no te dice qué se hizo con el token mientras vivía

La respuesta de verdad es la del [archivo 04](04-la-vida-de-un-secreto-filtrado.md).

## 7. Cerrar una alerta

```bash
gh api repos/{owner}/{repo}/secret-scanning/alerts/1 --method PATCH \
  -f state=resolved \
  -f resolution=revoked \
  -f resolution_comment="Token rotado el 2026-08-22; el antiguo ya no autentica."
```

Los cuatro motivos, y cuándo es honesto usar cada uno:

| `resolution` | Significa | Trampa habitual |
|--------------|-----------|-----------------|
| `revoked` | La credencial ya no sirve | Es el **único** cierre correcto para un secreto real |
| `false_positive` | No era un secreto | Requiere haberlo mirado, no suponerlo |
| `used_in_tests` | Es un valor de prueba sin poder | Solo si de verdad no autentica contra nada |
| `wont_fix` | Se asume el riesgo | Necesita nombre y fecha en el comentario |

> [!WARNING]
> Cerrar como `false_positive` un secreto que sí era real es la peor decisión
> posible de esta semana: la alerta desaparece, el token sigue vivo y no queda
> registro de que nadie lo miró. Ante la duda, **rota primero y cierra como
> `revoked`**: rotar es barato, un token vivo en un repositorio público no.

## 8. Antipatrones

| Antipatrón | Por qué duele | Qué hacer |
|------------|---------------|-----------|
| Borrar el archivo y dar por cerrado | El secreto sigue en el historial | Rotar; el historial es lo de menos |
| Cerrar sin `resolution_comment` | Nadie puede reconstruir la decisión | Comentario siempre |
| Confiar en la revocación automática | Solo cubre socios y repos públicos | Rotar tú, y comprobarlo |
| Tratar `inactive` como resuelto | Sigue en el historial y en la auditoría | Cerrar como `revoked`, con constancia |
| Activar los patrones genéricos sin plan de triaje | Cien alertas nuevas el mismo día | Activarlos cuando haya rutina de revisión |
| Mirar solo la rama por defecto | El escáner ve todas las ramas y los comentarios | Trabajar desde la API, no desde la interfaz |

## 9. Trucos

- **`?validity=active`** filtra directamente lo único que es una emergencia
- **`?is_publicly_leaked=true`** enseña lo que ya está fuera
- **`/locations`** es el endpoint que dice *dónde*, y casi nadie lo llama
- **`?is_bypassed=true`** lista lo que alguien metió saltándose la protección:
  es la primera consulta de cualquier auditoría
- **`--jq 'group_by(.secret_type_display_name) | map({tipo: .[0].secret_type_display_name, n: length})'`**
  resume la bandeja en una línea
- **Una alerta cerrada no desaparece**: queda como prueba de que existió, que es
  justo lo que pide una auditoría

## 📚 Recursos Adicionales

- [About secret scanning](https://docs.github.com/en/code-security/secret-scanning/introduction/about-secret-scanning)
- [Supported secret scanning patterns](https://docs.github.com/en/code-security/secret-scanning/introduction/supported-secret-scanning-patterns)
- [About validity checks](https://docs.github.com/en/code-security/secret-scanning/managing-alerts-from-secret-scanning/evaluating-alerts)
- [REST — Secret scanning](https://docs.github.com/en/rest/secret-scanning/secret-scanning)
- [Secret scanning partner program](https://docs.github.com/en/code-security/secret-scanning/secret-scanning-partnership-program/secret-scanning-partner-program)

## ✅ Checklist de Verificación

- [ ] Sabes qué escanea GitHub además de la rama por defecto
- [ ] Distingues patrones de proveedor, genéricos y propios, y qué cuesta cada uno
- [ ] Puedes leer tus alertas por API con los campos que importan
- [ ] Sabes qué significa `validity: active` y por qué es lo primero
- [ ] Conoces los cuatro motivos de cierre y cuál corresponde a un secreto real
- [ ] Entiendes por qué la revocación automática del socio no es tu plan de respuesta
