#!/bin/bash
cd "$(dirname "$0")"
for r in "0 300" "300 600" "600 900" "900 1300"; do set -- $r; SYNC=./sync_drop.json PAGE=promo-drop.html OUT=dframes FROM=$1 TO=$2 node record-any.js > /dev/null 2>&1 & done
wait; ls dframes | wc -l
