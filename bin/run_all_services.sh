#!/usr/bin/env bash
set -e

docker compose build --no-cache
docker compose up -d

docker compose wait

docker compose down