#!/bin/sh

curl \
  -H "X-API-Key: test" \
  http://localhost:3007/file/htxV60NQ0yx8X8TMckQB6H8eNzdSyYodoug0/test.png


# curl -X 'GET' \
#   'http://localhost:3007/file/fileId=http%3A%2F%2Flocalhost%3A3007%2Ffile%2FhtxV60NQ0yx8X8TMckQB6H8eNzdSyYodoug0/test.png' \
#   -H 'accept: application/json'