#!/bin/bash
cd "$(dirname "$0")"
for r in "0 335" "335 670" "670 1005" "1005 1400"; do set -- $r; SYNC=./sync_drop2.json PAGE='promo-drop2.html?intro=orbit' OUT=d4 FROM=$1 TO=$2 node record-any.js > /dev/null 2>&1 & done
wait; ls d4 | wc -l
ffmpeg -y -loglevel error -framerate 30 -i d4/f%04d.png -i d2-brandlaunch.wav -c:v libx264 -preset veryfast -crf 19 -pix_fmt yuv420p -c:a aac -b:a 192k -shortest -movflags +faststart parallax-drop4-brandlaunch.mp4 && echo encoded
