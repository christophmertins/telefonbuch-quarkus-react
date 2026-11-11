#!/bin/bash
# Baut Frontend und Backend und liefert den runnbaren Quarkus-JAR.
# Benutzt JDK 25 + Maven aus /tmp/opencode/tools (kein root nötig).
set -e

cd "$(dirname "$0")"

export JAVA_HOME="${JAVA_HOME:-/tmp/opencode/tools/jdk-25.0.5+8}"
export PATH="$JAVA_HOME/bin:/tmp/opencode/tools/apache-maven-3.9.9/bin:$PATH"

echo "=== Step 1: Frontend bauen ==="
cd frontend
npm install --silent 2>/dev/null || true
npm run build 2>&1 | tail -5
cd ..

echo "=== Step 2: Assets in backend/src/main/resources/META-INF/resources kopieren ==="
rm -rf backend/src/main/resources/META-INF/resources
mkdir -p backend/src/main/resources/META-INF/resources
cp -r frontend/dist/* backend/src/main/resources/META-INF/resources/
ls -la backend/src/main/resources/META-INF/resources/

echo "=== Step 3: Quarkus bauen (mvn package) ==="
cd backend
mvn clean package -DskipTests -B 2>&1 | tail -8

echo "=== Step 4: JAR prüfen ==="
JAR=$(find target -maxdepth 1 -name '*-runner.jar' | head -1)
if [ -z "$JAR" ]; then
  echo "ERROR: kein runner JAR gefunden"
  exit 1
fi
echo "Found JAR: $JAR"
ls -lh "$JAR"
echo "$JAR"