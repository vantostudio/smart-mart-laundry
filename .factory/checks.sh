#!/usr/bin/env bash
# This project's checks. Exit 0 only when a branch is fit to review.
#
# The gate runs this file from the main checkout with a job's worktree as the working directory,
# so a branch can't edit the checks it is judged by. FACTORY_PORT is the job's own free port, for
# a server the checks start (browser tests, say); CI=1 is set. Keep it non-interactive and
# deterministic, and never rewrite tracked files (no --fix, no snapshot updates).
#
# /factory:init replaces the two lines below with this project's install, lint, typecheck, test
# and build commands.
set -euo pipefail


# Install exactly what the lockfile says (prepare runs `vp config` and `next typegen`).
pnpm install --frozen-lockfile

# Format check, lint (type-aware) and type checks, read-only: Oxfmt, Oxlint and tsgolint via Vite+.
pnpm check
pnpm typecheck

# Unit tests (Vitest via Vite+), one run.
pnpm exec vp test run

# Production build.
pnpm build

# Browser tests (Playwright) against the production server on this job's port. The config uses
# installed Microsoft Edge by default; fall back to Google Chrome where Edge isn't installed.
port="${FACTORY_PORT:?FACTORY_PORT must be set}"
if [[ -z "${E2E_CHANNEL:-}" ]]; then
  if command -v microsoft-edge-stable >/dev/null 2>&1 || command -v microsoft-edge >/dev/null 2>&1; then
    export E2E_CHANNEL=msedge
  else
    export E2E_CHANNEL=chrome
  fi
fi

pnpm exec next start -p "$port" >/dev/null 2>&1 &
server=$!
trap 'kill "$server" 2>/dev/null || true' EXIT

for _ in $(seq 1 60); do
  if curl -fsS -o /dev/null "http://localhost:$port/"; then break; fi
  if ! kill -0 "$server" 2>/dev/null; then echo "next start exited early" >&2; exit 1; fi
  sleep 1
done
curl -fsS -o /dev/null "http://localhost:$port/"

# No retries: a test that fails once fails the gate. Specs that act on the page wait for
# hydration by retrying their first action until its effect shows (see e2e/helpers.ts).
E2E_BASE_URL="http://localhost:$port" pnpm exec playwright test --reporter=line --retries=0
