#!/bin/bash
set -e

psql -U user -d sim-feed-db -f /init.sql
psql -U user -d sim-feed-db -f /seed.sql

echo "Database seeded successfully"