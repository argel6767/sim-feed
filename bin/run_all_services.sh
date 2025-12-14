#!/usr/bin/env bash
set -e

touch scheduler-engine/.env

docker compose build --no-cache
docker compose up -d

docker compose wait

docker compose down