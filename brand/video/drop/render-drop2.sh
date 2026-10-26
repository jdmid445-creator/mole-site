#!/bin/bash
cd "$(dirname "$0")"
mkdir -p d2plain d2coins d2orbit; rm -f d2plain/*.png d2coins/*.png d2orbit/*.png
for r in "0 360" "360 720" "720 1080" "1080 1500"; do set -- $r; SYNC=./sync_drop2.json PAGE='promo-drop2.html?intro=plain' OUT=d2plain FROM=$1 TO=$2 node record-any.js > /dev/null 2>&1 & done
SYNC=./sync_drop2.json PAGE='promo-drop2.html?intro=coins' OUT=d2coins FROM=0 TO=140 node record-any.js > /dev/null 2>&1 &
SYNC=./sync_drop2.json PAGE='promo-drop2.html?intro=orbit' OUT=d2orbit FROM=0 TO=140 node record-any.js > /dev/null 2>&1 &
wait; ls d2plain | wc -l; ls d2coins | wc -l; ls d2orbit | wc -l
