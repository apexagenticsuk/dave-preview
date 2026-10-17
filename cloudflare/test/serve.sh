#!/usr/bin/env bash
# Starts a local Pages dev server (wrangler pages dev) with a fake KV and the TEST-ONLY Access bypass. Usage: serve.sh <port> [persistdir]
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"; SITE="$HERE/../.."
PORT="${1:-8788}"; D=/tmp/cftest-$PORT
rm -rf "$D"; "$HERE/../build.sh" "$D" >/dev/null
cp "$HERE/../_worker.js" "$D/_real.js"; cp "$HERE/entry.mjs" "$D/_worker.js"; sed -i "s#'./_real.js'#'./_real.js'#" "$D/_worker.js"
cd /workspace/cf-tools
exec ./node_modules/.bin/wrangler pages dev "$D" --port "$PORT" --compatibility-date=2026-05-01 --kv CONTENT --binding ACCESS_TEAM_DOMAIN=testteam ACCESS_AUD=testaud --persist-to "/tmp/cftest-persist-$PORT" --show-interactive-dev-session=false
