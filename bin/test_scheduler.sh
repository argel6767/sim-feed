#!/usr/bin/env bash
cd ./scheduler-engine/tests
docker compose build --no-cache
docker compose up --exit-code-from app --abort-on-container-exit

EXIT_CODE=$?

docker compose down

exit $EXIT_CODE