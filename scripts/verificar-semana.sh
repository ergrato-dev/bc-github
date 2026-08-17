#!/usr/bin/env bash
# Autograding del Bootcamp GitHub.
#
# Ejecuta las comprobaciones declaradas en bootcamp/week-NN-*/checks.json
# contra el repositorio del estudiante, usando la API real de GitHub.
#
# Uso:
#   scripts/verificar-semana.sh --doctor
#   scripts/verificar-semana.sh 08 --repo <usuario>/<repo>
#   scripts/verificar-semana.sh 08              # usa REPO= de ~/.bc-github
#
# Formato de checks.json: docs/autograding.md
# Solo lectura: este script nunca modifica nada.

set -u
cd "$(dirname "$0")/.." || exit 1

CONFIG="$HOME/.bc-github"

ok()   { printf '\033[32m✅\033[0m %s\n' "$1"; }
bad()  { printf '\033[31m❌\033[0m %s\n' "$1"; }
warn() { printf '\033[33m⚠️\033[0m  %s\n' "$1"; }

# ---------------------------------------------------------------- doctor ----
doctor() {
  local fail=0
  echo "== Diagnóstico del entorno =="

  for tool in git gh jq; do
    if command -v "$tool" > /dev/null 2>&1; then
      ok "$($tool --version 2>&1 | head -1)"
    else
      bad "$tool no está instalado"
      fail=1
    fi
  done

  if gh auth status > /dev/null 2>&1; then
    ok "gh autenticado como $(gh api user --jq .login 2>/dev/null)"
    local scopes
    scopes=$(gh auth status 2>&1 | grep -oE "Token scopes:.*" | head -1)
    [ -n "$scopes" ] && echo "   $scopes"
  else
    bad "gh no está autenticado — ejecuta: gh auth login"
    fail=1
  fi

  if [ "$(git config --global commit.gpgsign 2>/dev/null)" = "true" ]; then
    ok "commit.gpgsign activo (formato: $(git config --global gpg.format 2>/dev/null || echo openpgp))"
  else
    warn "commit.gpgsign no está activo — ver docs/setup-entorno.md, sección 5"
  fi

  if [ -f "$CONFIG" ]; then
    ok "repo guardado: $(grep '^REPO=' "$CONFIG" | cut -d= -f2)"
  else
    warn "sin repo guardado — crea $CONFIG con: REPO=<usuario>/<repo>"
  fi

  echo
  if [ "$fail" -eq 0 ]; then
    echo "Entorno listo."
  else
    echo "Corrige lo marcado antes de empezar."
  fi
  exit "$fail"
}

# ------------------------------------------------------------ argumentos ----
[ $# -eq 0 ] && { echo "Uso: $0 <NN> [--repo <usuario>/<repo>] | --doctor"; exit 2; }
[ "$1" = "--doctor" ] && doctor

WEEK="$1"; shift
REPO=""
while [ $# -gt 0 ]; do
  case "$1" in
    --repo) REPO="${2:-}"; shift 2 ;;
    *) echo "Argumento desconocido: $1"; exit 2 ;;
  esac
done

if [ -z "$REPO" ] && [ -f "$CONFIG" ]; then
  REPO=$(grep '^REPO=' "$CONFIG" | cut -d= -f2)
fi

if [ -z "$REPO" ]; then
  echo "Falta el repositorio. Usa --repo <usuario>/<repo> o crea $CONFIG con REPO=<usuario>/<repo>"
  exit 2
fi

OWNER="${REPO%%/*}"
NAME="${REPO##*/}"

CHECKS=$(find bootcamp -path "*week-${WEEK}-*/checks.json" | head -1)
if [ -z "$CHECKS" ]; then
  echo "No existe checks.json para la semana $WEEK"
  exit 2
fi

# ------------------------------------------------------------ ejecución ----
echo "== Semana $(jq -r .semana "$CHECKS") — $(jq -r .titulo "$CHECKS") =="
echo "   repositorio: $REPO"
echo

total=0
passed=0

while IFS= read -r check; do
  total=$((total + 1))
  desc=$(printf '%s' "$check" | jq -r .descripcion)
  expr=$(printf '%s' "$check" | jq -r .jq)
  pista=$(printf '%s' "$check" | jq -r '.pista // ""')
  endpoint=$(printf '%s' "$check" | jq -r '.api // ""')
  query=$(printf '%s' "$check" | jq -r '.graphql // ""')

  if [ -n "$endpoint" ]; then
    endpoint="${endpoint//\{repo\}/$REPO}"
    endpoint="${endpoint//\{owner\}/$OWNER}"
    result=$(gh api "$endpoint" --jq "$expr" 2>/dev/null)
  elif [ -n "$query" ]; then
    result=$(gh api graphql -F owner="$OWNER" -F repo="$NAME" -f query="$query" --jq "$expr" 2>/dev/null)
  else
    bad "$desc"
    echo "   (check mal formado: falta 'api' o 'graphql')"
    continue
  fi

  if [ "$result" = "true" ]; then
    ok "$desc"
    passed=$((passed + 1))
  else
    bad "$desc"
    [ -n "$pista" ] && echo "   → $pista"
  fi
done < <(jq -c '.checks[]' "$CHECKS")

echo
echo "$passed de $total verificaciones superadas."
[ "$passed" -eq "$total" ] || exit 1
