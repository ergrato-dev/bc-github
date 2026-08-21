# Práctica 04 — Firmas y `gh`

> Al terminar, tus commits llevan una prueba criptográfica de que los hiciste tú,
> y manejas GitHub sin abrir el navegador.

**Duración estimada**: 45 min
**Prerrequisitos**: [Teoría 05](../1-teoria/05-identidad-y-firmas.md), [06](../1-teoria/06-gh-cli.md) y [07](../1-teoria/07-credenciales-y-tokens.md), `gh` instalado

## Contexto

En la Semana 08 vas a configurar un ruleset que **rechaza** cualquier commit sin
firmar en `main`. Para que eso no te bloquee a ti, la identidad se configura
ahora.

## Paso 1: Comprobar el punto de partida

**Por qué**: saber qué tienes evita duplicar claves.

```bash
gh auth status
gh ssh-key list
git config --global --get-regexp 'user\.|gpg\.|commit\.gpgsign'
```

**Verifica**: `gh auth status` dice `Logged in to github.com`. Si no,
`gh auth login`.

## Paso 2: Crear la clave (si no tienes una)

**Por qué**: `ed25519` es corta, rápida y actual. Si ya tienes una, salta al
paso 3.

```bash
ssh-keygen -t ed25519 -C "tu-email@ejemplo.com"
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519
```

> [!TIP]
> Pon passphrase. El `ssh-agent` te la pedirá una vez por sesión, no en cada
> push.

**Verifica**:

```bash
ssh-add -l
# 256 SHA256:... (ED25519)
```

## Paso 3: Registrar la clave **dos veces**

**Por qué**: GitHub trata autenticación y firma como dos usos distintos. Una
clave subida solo como `authentication` firma commits que aparecen como
`Unverified`.

```bash
gh ssh-key add ~/.ssh/id_ed25519.pub --title "$(hostname)"
gh ssh-key add ~/.ssh/id_ed25519.pub --type signing --title "$(hostname) (signing)"
```

**Verifica**:

```bash
gh ssh-key list
# la misma clave debe aparecer DOS veces, con tipos distintos
ssh -T git@github.com
# Hi <tu-usuario>! You've successfully authenticated...
```

## Paso 4: Configurar la firma

**Por qué**: firmar por defecto es la única forma de que no se te olvide.

```bash
git config --global gpg.format ssh
git config --global user.signingkey ~/.ssh/id_ed25519.pub
git config --global commit.gpgsign true
git config --global tag.gpgsign true

# Verificación local de firmas (opcional pero recomendable)
echo "$(git config --global user.email) $(cat ~/.ssh/id_ed25519.pub)" >> ~/.ssh/allowed_signers
git config --global gpg.ssh.allowedSignersFile ~/.ssh/allowed_signers
```

**Verifica**:

```bash
cd ~/sandbox/lab-reflog
git commit --allow-empty -m "chore: prueba de firma"
git log --show-signature -1 | head -3
# Good "git" signature for tu-email@ejemplo.com
```

## Paso 5: Confirmar que GitHub lo ve como `Verified`

**Por qué**: firmar en local no sirve de nada si GitHub no puede verificarlo.
Aquí es donde se detectan los dos errores clásicos: clave sin registrar como
`signing`, o `user.email` no verificado en la cuenta.

```bash
cd ~/sandbox && gh repo create lab-firmas --public --clone -y
cd lab-firmas
echo "# Laboratorio de firmas" > README.md
git add . && git commit -qm "chore: primer commit firmado"
git push -q

gh api repos/{owner}/{repo}/commits --jq '.[0].commit.verification'
```

**Verifica**: la respuesta debe ser

```json
{ "verified": true, "reason": "valid", ... }
```

Si sale `"reason": "unsigned"` o `"unknown_key"`, revisa la tabla de errores del
final.

## Paso 6: Operar GitHub desde la terminal

**Por qué**: todo lo que vas a hacer las próximas 20 semanas se puede
automatizar. Empieza aquí.

```bash
# Metadatos del repo
gh repo edit --description "Laboratorio de firmas del Bootcamp GitHub"

# Un issue y su cierre, sin navegador
gh issue create --title "Probar el flujo completo con gh" \
                --body "Issue de prueba de la Semana 01."
gh issue list
gh issue close 1 --comment "Cerrado desde la terminal."

# Consultas a la API
gh api user --jq '.login, .public_repos'
gh api repos/{owner}/{repo} --jq '{nombre: .name, publico: (.private | not), rama: .default_branch}'
gh api rate_limit --jq '.rate'
```

**Verifica**:

```bash
gh issue list --state closed --json number,title --jq '.[].title'
```

## Paso 7: Un alias que vas a usar todos los días

**Por qué**: los alias son lo primero que se pierde si no se crean el primer día.

```bash
gh alias set prs 'pr list --author @me'
gh alias set firmados 'api repos/{owner}/{repo}/commits --jq ".[] | \"\(.commit.verification.verified) \(.sha[0:7]) \(.commit.message | split(\"\n\")[0])\""'
gh alias list
gh firmados
```

**Verifica**:

```bash
gh alias list | grep firmados
```

## Paso 8: Limpiar el laboratorio

> [!WARNING]
> El siguiente comando **borra permanentemente** el repositorio `lab-firmas` de
> tu cuenta de GitHub. Asegúrate de que estás borrando el laboratorio y no tu
> repositorio del bootcamp. Si prefieres conservarlo, sáltate este paso.

```bash
gh repo delete <tu-usuario>/lab-firmas --yes
```

## ✅ Resultado

- [ ] `gh ssh-key list` muestra tu clave dos veces (auth y signing)
- [ ] `commit.gpgsign` está en `true` globalmente
- [ ] Un commit tuyo aparece como `verified: true` en la API
- [ ] Has creado y cerrado un issue sin abrir el navegador
- [ ] Tienes al menos un alias de `gh` configurado

## 🧯 Si algo sale mal

| Síntoma | Causa | Solución |
|---------|-------|----------|
| `"reason": "unsigned"` | `commit.gpgsign` no estaba activo al commitear | Actívalo y `git commit --amend --no-edit` |
| `"reason": "unknown_key"` | Clave no registrada como `signing` | `gh ssh-key add ... --type signing` |
| `"reason": "unverified_email"` | `user.email` no verificado en tu cuenta | Añádelo y verifícalo en Settings → Emails |
| `Permission denied (publickey)` | Clave fuera del agente | `ssh-add ~/.ssh/id_ed25519` |
| `error: gpg failed to sign the data` | `gpg.format` sigue en `openpgp` | `git config --global gpg.format ssh` |
| `No principal matched` en local | Falta `allowed_signers` | Repite el paso 4 |
| `gh: Not Found (HTTP 404)` | Fuera de un repo clonado, `{owner}` no resuelve | Añade `--repo <usuario>/<repo>` |
| Push rechazado por *email privacy* | Estás usando tu email real con la opción de privacidad activa | Usa el alias `noreply` en `user.email` |
