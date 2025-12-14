#!/usr/bin/env bash
set -e

touch scheduler-engine/.env

docker compose build --no-cache
docker compose up -d

echo "Waiting for database to be healthy..."
while [ "$(docker inspect -f '{{.State.Health.Status}}' \
  $(docker compose ps -q db))" != "healthy" ]; do
  sleep 2
done

echo "All services are up"

docker compose down