# Environments: gobernar el despliegue, no solo el merge

> Un ruleset controla qué entra en `main`. Un environment controla qué sale a
> producción. Son dos puertas distintas y hace falta cerrar las dos.

## 🎯 Objetivos

- Distinguir un secreto de repositorio de uno de environment
- Configurar revisores obligatorios y *wait timers*
- Limitar desde qué ramas se puede desplegar
- Conectar environments con rulesets mediante `required_deployments`

## 1. Qué problema resuelve

Sin environments, un workflow con `secrets.TOKEN_PRODUCCION` puede ejecutarse
desde **cualquier** rama que alguien empuje. El ruleset protege `main`, pero un
`push` a `feature/lo-que-sea` que dispare un workflow con acceso al secreto de
producción se salta esa puerta por completo.

Un **environment** es un destino con nombre (`staging`, `production`) que lleva
tres cosas asociadas:

| Cosa | Qué aporta |
|------|------------|
| **Secretos y variables propios** | Solo existen en los jobs que declaran ese environment |
| **Reglas de protección** | Revisores, espera obligatoria, ramas permitidas |
| **Historial de despliegues** | Quién desplegó qué y cuándo, en la pestaña *Deployments* |

## 2. Secreto de repositorio frente a secreto de environment

| | Repositorio | Environment |
|---|---|---|
| Alcance | Cualquier job de cualquier workflow | Solo jobs con `environment: <nombre>` |
| Protección | Ninguna extra | Pasa por revisores y wait timer |
| Uso correcto | Tokens de lectura, servicios de test | Credenciales de producción |

```yaml
permissions:
  contents: read
jobs:
  desplegar:
    runs-on: ubuntu-latest
    environment: production        # ← aquí se abre la puerta
    steps:
      - run: ./deploy.sh
        env:
          TOKEN: ${{ secrets.TOKEN_DESPLIEGUE }}
```

Sin la línea `environment: production`, `secrets.TOKEN_DESPLIEGUE` llega vacío si
el secreto solo existe en ese environment. Esa es toda la protección: el secreto
no se puede usar sin pasar por la puerta.

```bash
gh secret set TOKEN_DESPLIEGUE --env production
gh secret list --env production
```

## 3. Reglas de protección

### Revisores obligatorios (`required_reviewers`)

Hasta **seis** usuarios o equipos; basta con que apruebe uno. El job se queda en
estado *Waiting* hasta entonces, y si nadie aprueba en **30 días**, falla solo.

```bash
gh api repos/{owner}/{repo}/environments/production --method PUT \
  --input - <<'JSON'
{
  "wait_timer": 0,
  "prevent_self_review": false,
  "reviewers": [{ "type": "User", "id": 123456 }],
  "deployment_branch_policy": {
    "protected_branches": true,
    "custom_branch_policies": false
  }
}
JSON
```

> [!NOTE]
> `prevent_self_review: true` impide que quien lanzó el despliegue lo apruebe.
> Es lo correcto en equipo y **te bloquea si trabajas solo**. En autoestudio,
> déjalo en `false`: el aprendizaje está en ver el job detenido y en aprobarlo a
> mano, no en no poder desplegar nunca.

### Wait timer (`wait_timer`)

Minutos que el despliegue espera antes de ejecutarse, de 0 a 43 200 (30 días).
No es burocracia: es la ventana para cancelar un despliegue lanzado por error,
sobre todo cuando el disparador es automático (un tag, un release).

### Política de ramas (`branch_policy`)

Dos modos, mutuamente excluyentes:

- `protected_branches: true` — solo ramas cubiertas por un ruleset o por branch
  protection. Es el modo que conecta la Semana 08 consigo misma: solo se
  despliega desde lo que ya está protegido.
- `custom_branch_policies: true` — patrones a mano, para
  `POST /repos/{owner}/{repo}/environments/{env}/deployment-branch-policies`

## 4. Cerrar el círculo: `required_deployments`

La regla de ruleset `required_deployments` invierte la relación: exige que un PR
se haya desplegado con éxito a un environment concreto **antes** de poder
mergearse.

```json
{
  "type": "required_deployments",
  "parameters": { "required_deployment_environments": ["staging"] }
}
```

Traducción: nada entra en `main` sin haber funcionado en `staging`. Es el
equivalente moderno de "lo probamos en pre antes de subir".

## 5. Disponibilidad

> [!IMPORTANT]
> Environments, secretos de environment y reglas de protección están disponibles
> en **repositorios públicos con todos los planes**. En GitHub Free, los
> revisores obligatorios y el wait timer **solo** funcionan en repos públicos —
> que es el caso de este bootcamp. Verificado en agosto de 2026:
> [Managing environments for deployment](https://docs.github.com/actions/deployment/targeting-different-environments/using-environments-for-deployment).

## 6. Antipatrones

| Antipatrón | Por qué duele | Qué hacer |
|------------|---------------|-----------|
| Credencial de producción como secreto de repositorio | Cualquier workflow la usa | Secreto de environment |
| `prevent_self_review: true` trabajando solo | Nunca despliegas | `false` en autoestudio |
| Environment sin política de ramas | Se despliega desde cualquier rama | `protected_branches: true` |
| Wait timer de 30 minutos "por seguridad" | Nadie espera; se acaba saltando | 0-5 min, o revisor |
| Un environment por rama de feature | Ruido en *Deployments* | `staging` y `production` bastan |
| Secretos duplicados en repo y environment | Gana el del environment; confusión al depurar | Uno de los dos |

## 7. Trucos

- **Ver las reglas de todos tus environments de un vistazo**:
  ```bash
  gh api repos/{owner}/{repo}/environments \
    --jq '.environments[] | {nombre: .name, reglas: [.protection_rules[].type]}'
  ```
- **El job detenido no consume runner**: esperar a un revisor es gratis
- **`gh run watch`** te avisa en cuanto el despliegue sale de *Waiting*
- **Un job esperando aprobación falla a los 30 días**: no se queda ahí para
  siempre, pero tampoco avisa
- **Un environment se crea al vuelo** si un workflow lo nombra y no existe — sin
  protección ninguna. Créalos tú antes, con sus reglas
- **`environment:` acepta `url:`**, y GitHub muestra el enlace en el PR

## 📚 Recursos Adicionales

- [GitHub Docs — Managing environments for deployment](https://docs.github.com/actions/deployment/targeting-different-environments/using-environments-for-deployment)
- [GitHub Docs — Reviewing deployments](https://docs.github.com/actions/managing-workflow-runs/reviewing-deployments)
- [REST API — Deployment environments](https://docs.github.com/rest/deployments/environments)

## ✅ Checklist de Verificación

- [ ] Sabes por qué un secreto de producción no debe ser de repositorio
- [ ] Sabes qué pasa si un workflow nombra un environment que no existe
- [ ] Distingues `protected_branches` de `custom_branch_policies`
- [ ] Sabes qué hace `required_deployments` y en qué dirección
