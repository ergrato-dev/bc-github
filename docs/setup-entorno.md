# 🛠️ Setup del Entorno

Todo lo que necesitas instalado y funcionando **antes** de la Semana 01. Tiempo
estimado: 45-60 minutos.

---

## 1. Requisitos

| Herramienta | Versión mínima | Comprobación |
| --- | --- | --- |
| Git | 2.40 | `git --version` |
| GitHub CLI | 2.40 | `gh --version` |
| `jq` | 1.6 | `jq --version` |
| Node.js | 22 | `node --version` |
| pnpm | 10 | `pnpm --version` |
| Docker | 26 | `docker --version` |

> [!NOTE]
> Docker no hace falta hasta la Semana 10. Node y pnpm no hacen falta hasta la
> Semana 09. Git, `gh` y `jq` sí desde el día 1.

### Instalación

**Linux (Debian/Ubuntu/WSL)**

```bash
sudo apt update && sudo apt install -y git jq
# gh CLI — repositorio oficial
sudo mkdir -p -m 755 /etc/apt/keyrings
wget -qO- https://cli.github.com/packages/githubcli-archive-keyring.gpg \
  | sudo tee /etc/apt/keyrings/githubcli-archive-keyring.gpg > /dev/null
sudo chmod go+r /etc/apt/keyrings/githubcli-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" \
  | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null
sudo apt update && sudo apt install -y gh
```

**macOS**

```bash
brew install git gh jq
```

**Windows**

Usa **WSL2** con Ubuntu y sigue la ruta de Linux. Es lo que usarás en Actions
(los runners son Linux) y te ahorra media docena de diferencias de EOL, rutas y
permisos. Si insistes en Windows nativo: `winget install Git.Git GitHub.cli jqlang.jq`.

**Node.js y pnpm** (Semana 09 en adelante)

```bash
# nvm es lo más simple para tener varias versiones
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
nvm install 22 && nvm use 22
corepack enable && corepack prepare pnpm@latest --activate
```

---

## 2. Cuenta de GitHub

1. Crea la cuenta con un **email que vayas a conservar** (el de la universidad
   caduca; el commit firmado con un email que ya no controlas es un problema).
2. Activa **2FA** — obligatorio para contribuir y necesario para varias features.
   `Settings → Password and authentication → Two-factor authentication`.
3. Guarda los **códigos de recuperación** fuera del ordenador.

---

## 3. Identidad de Git

```bash
git config --global user.name "Tu Nombre"
git config --global user.email "tu-email@ejemplo.com"
```

El email debe ser uno **verificado en tu cuenta de GitHub**, o tus commits no se
asociarán a tu perfil.

### Email privado

Si no quieres exponer tu email real:

`Settings → Emails → Keep my email addresses private` te da un alias
`12345678+tu-usuario@users.noreply.github.com`. Úsalo en `user.email`.

```bash
git config --global user.email "12345678+tu-usuario@users.noreply.github.com"
```

Activa también `Block command line pushes that expose my email` — te avisa antes
de filtrarlo, en vez de después.

---

## 4. Clave SSH

HTTPS con token funciona, pero SSH es menos fricción a diario y es lo que usarás
para firmar commits.

```bash
ssh-keygen -t ed25519 -C "tu-email@ejemplo.com"
# Enter para la ruta por defecto (~/.ssh/id_ed25519)
# Pon una passphrase. Sí, ponla.

eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519
```

Sube la pública a GitHub:

```bash
gh ssh-key add ~/.ssh/id_ed25519.pub --title "laptop-personal"
```

Verifica:

```bash
ssh -T git@github.com
# Hi tu-usuario! You've successfully authenticated...
```

> [!TIP]
> `ed25519`, no `rsa`. Más corta, más rápida, más segura, y GitHub la soporta
> desde hace años.

---

## 5. Commits firmados (con la misma clave SSH)

Firmar commits demuestra que ese commit salió de ti y no de alguien que puso tu
nombre en `user.name` — que es trivial de falsificar.

```bash
git config --global gpg.format ssh
git config --global user.signingkey ~/.ssh/id_ed25519.pub
git config --global commit.gpgsign true
git config --global tag.gpgsign true
```

Registra la **misma clave** otra vez, ahora como clave de firma:

```bash
gh ssh-key add ~/.ssh/id_ed25519.pub --type signing --title "laptop-personal (signing)"
```

> [!IMPORTANT]
> Una clave SSH registrada como `authentication` **no** sirve para verificar
> firmas. Hay que subirla dos veces, con los dos tipos. Es el error número uno
> al configurar esto.

Verifica que GitHub marca el commit como `Verified`:

```bash
git commit --allow-empty -m "chore: verifica firma"
git log --show-signature -1
```

### Verificación local (opcional)

Para que `git log --show-signature` diga `Good signature` también en local:

```bash
echo "tu-email@ejemplo.com $(cat ~/.ssh/id_ed25519.pub)" >> ~/.ssh/allowed_signers
git config --global gpg.ssh.allowedSignersFile ~/.ssh/allowed_signers
```

---

## 6. Autenticar `gh`

```bash
gh auth login
```

Elige: `GitHub.com` → `SSH` → tu clave → `Login with a web browser`.

```bash
gh auth status
```

Debe listar tu cuenta y los scopes. Para el bootcamp necesitas al menos:
`repo`, `read:org`, `workflow`, `gist` y `read:project`.

```bash
gh auth refresh -s workflow,read:org,gist,read:project
```

> [!IMPORTANT]
> `read:project` no viene por defecto y hace falta desde la Semana 04: **toda**
> consulta a Projects v2 va por GraphQL y falla con `INSUFFICIENT_SCOPES` sin
> él. Para escribir en un project (Semana 05) necesitarás `project` completo.

---

## 7. Tokens: cuál usar y cuándo

Esto se estudia a fondo en la Semana 01, pero la regla corta:

| Tipo | Cuándo | Riesgo |
| --- | --- | --- |
| `GITHUB_TOKEN` (Actions) | Dentro de un workflow | Bajo — efímero y con scope al repo |
| **Fine-grained PAT** | Scripts locales, un repo concreto | Medio — acótalo a un repo y ponle caducidad |
| PAT clásico | Solo si algo no soporta fine-grained | Alto — vale para toda tu cuenta |
| GitHub App | Automatización de organización | Bajo — token de instalación efímero |

Regla de oro: **el token más corto que funcione, con la caducidad más corta que
aguantes**. Nunca en un `.env` commiteado, nunca en la línea de comandos.

---

## 8. Configuración de Git recomendada

```bash
# Rama por defecto coherente con GitHub
git config --global init.defaultBranch main

# 'git push' en una rama nueva crea el upstream solo
git config --global push.autoSetupRemote true

# 'git pull' rebasea en vez de crear merges de ruido
git config --global pull.rebase true

# Recuerda cómo resolviste un conflicto y lo reaplica solo
git config --global rerere.enabled true

# Diff más legible, por palabras y con mejor detección de movimientos
git config --global diff.algorithm histogram
git config --global diff.colorMoved zebra

# Mantenimiento automático del repo en segundo plano
git config --global maintenance.auto true
```

---

## 9. Verificación final

```bash
./scripts/verificar-semana.sh --doctor
```

```
== Diagnóstico del entorno ==
✅ git 2.51.0
✅ gh 2.82.1
✅ jq 1.7.1
✅ gh autenticado como tu-usuario
✅ scopes: repo, read:org, workflow, gist
✅ commit.gpgsign activo (ssh)
```

Si todo está en verde, empieza la
[Semana 01](../bootcamp/week-01-git_repaso_y_setup_pro/README.md).

---

## Problemas frecuentes

| Síntoma | Causa | Solución |
| --- | --- | --- |
| `Permission denied (publickey)` | La clave no está en el agente | `ssh-add ~/.ssh/id_ed25519` |
| Commits sin `Verified` en GitHub | Clave no registrada como `signing` | Súbela otra vez con `--type signing` |
| Commits no aparecen en tu perfil | `user.email` no verificado en la cuenta | Añade y verifica ese email en Settings |
| `gh: command not found` tras instalar | PATH sin refrescar | Abre una terminal nueva |
| `gh api` responde 403 | Faltan scopes | `gh auth refresh -s <scope>` |
| WSL pide passphrase en cada push | Sin `ssh-agent` persistente | Añade el `eval "$(ssh-agent -s)"` a tu `~/.zshrc` |
