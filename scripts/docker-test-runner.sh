#!/bin/sh
set -e

echo "========================================================"
echo " 🚀 Online Food Ordering System - Container Test Runner "
echo "========================================================"
echo "Target Service: ${TARGET_SERVICE:-ALL}"
echo "Test Profile:   ${TEST_PROFILE:-default}"
echo "Java Version:   $(java -version 2>&1 | head -n 1)"
echo "Maven Version:  $(mvn -v | head -n 1)"
echo "========================================================"

mkdir -p target/test-reports

if [ -n "$TARGET_SERVICE" ] && [ "$TARGET_SERVICE" != "ALL" ]; then
    echo "▶️ Running tests specifically for: $TARGET_SERVICE"
    ./mvnw test -pl "$TARGET_SERVICE" -am
else
    echo "▶️ Running tests for all microservices in parent project..."
    ./mvnw test
fi

echo "========================================================"
echo " ✅ Test Run Completed Successfully!"
echo "========================================================"
