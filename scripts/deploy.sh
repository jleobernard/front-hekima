#!/usr/bin/env bash
set -e
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
NOTES_FRONT_VERSION=1.0.0
cd $DIR/../
rm -Rf build
set PUBLIC_URL=https://notes.jleo.tech && set REACT_APP_API_ROOT_URL=https://notes.jleo.tech && npm run build
find build -name '.DS_Store' -exec rm -f {} \;
docker build -t jleobernard/notes-front:$NOTES_FRONT_VERSION --no-cache -f ./.docker/Dockerfile .
docker push jleobernard/notes-front:$NOTES_FRONT_VERSION
