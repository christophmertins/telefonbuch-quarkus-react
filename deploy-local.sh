#!/bin/bash
# Baut die App, kopiert den JAR auf die Mac mini (192.168.165.7) und startet
# die Telefonbuch-Preview mit OpenJDK 27 (Homebrew) auf Port 8080.
#
# Die Mac mini hat Docker-CLI, aber keinen laufenden Docker-Daemon; deshalb
# wird der Quarkus-Uber-JAR direkt gestartet.
set -e

cd "$(dirname "$0")"

REMOTE_HOST="cmertins@192.168.165.7"
REMOTE_DIR="/Users/cmertins/telefonbuch"
REMOTE_JAR="$REMOTE_DIR/app.jar"
REMOTE_LOG="$REMOTE_DIR/app.log"
JAVA_BIN="/opt/homebrew/opt/openjdk/bin/java"

echo "=== Step 1: lokal bauen ==="
./build.sh
JAR=$(find backend/target -maxdepth 1 -name '*-runner.jar' | head -1)
echo "JAR: $JAR"

echo "=== Step 2: JAR auf die Mac mini kopieren ==="
ssh "$REMOTE_HOST" "mkdir -p $REMOTE_DIR"
scp "$JAR" "$REMOTE_HOST:$REMOTE_JAR"

echo "=== Step 3: alten Prozess stoppen und starten ==="
ssh "$REMOTE_HOST" "
pkill -f 'java.*app.jar' 2>/dev/null || true
sleep 1
rm -f $REMOTE_LOG
cd $REMOTE_DIR
DEMO_MODE=true TELEFONBUCH_AUTH_PATHS= nohup $JAVA_BIN -jar app.jar > $REMOTE_LOG 2>&1 &
echo \"started pid \$!\"
"

echo "=== Step 4: warten, bis die App antwortet ==="
for i in $(seq 1 45); do
  sleep 1
  if ssh "$REMOTE_HOST" "curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:8080/q/health | grep -q 200"; then
    echo "Server ready after ${i}s"
    break
  fi
  if [ $((i % 10)) -eq 0 ]; then echo "Waiting... ${i}s"; fi
done

echo "=== Step 5: verifizieren ==="
ssh "$REMOTE_HOST" "tail -5 $REMOTE_LOG"
node -e "
const base = 'http://192.168.165.7:8080';
(async () => {
  for (const p of ['/', '/index.html', '/assets/index-Ca2a1Mg1.js', '/api/contacts', '/q/health']) {
    try {
      const r = await fetch(base + p);
      const body = await r.text();
      console.log('GET', p, '->', r.status, body.length, 'bytes');
    } catch (e) {
      console.log('GET', p, '-> ERROR', e.message);
    }
  }
})();
"
echo "Öffne http://192.168.165.7:8080/ in einem Browser."