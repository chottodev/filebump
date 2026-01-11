#!/bin/sh

curl \
  -H "Content-Type: application/json" \
  -X POST \
  -d '{"url":"http://localhost:3007/file/FgYHI2stUsw6RHkVAdimyWHpKrbAuFiUaqat"}' \
  -H "X-API-Key: test" \
  http://localhost:3007/download