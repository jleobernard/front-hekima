#!/usr/bin/env bash
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd $DIR/../
set PUBLIC_URL=https://notes.jleo.tech && set REACT_APP_API_ROOT_URL=https://notes.jleo.tech && npm run build
find build -name '.DS_Store' -exec rm -f {} \;
echo "Cleaning previous version"
ssh ks-leo "rm -Rf /opt/containers/nginx/data/nginx/html/notes/*"
echo "Copying new version"
scp -r build/* ks-leo:/opt/containers/nginx/data/nginx/html/notes/
echo "Reloading nginx"
ssh ks-leo "cd /opt/containers/nginx && ./reload.sh"
