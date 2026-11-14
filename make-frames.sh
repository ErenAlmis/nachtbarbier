#!/usr/bin/env bash
# Video → Bildfolge für sequence.js
# Aufruf:  bash make-frames.sh <video.mp4> <name> [anzahl=96] [breite=1600] [focusX=0.5] [enhance=0|1]
# enhance=1: leichtes Entrauschen, Lanczos-Hochskalierung, Nachschärfen (für 720p-Quellen)
# Beispiel: bash make-frames.sh assets/razor-open.mp4 razor 96 1600 0.6
# Ergebnis: assets/frames/<name>/frame-001.webp ... und manifest.json
set -euo pipefail

IN="$1"; NAME="$2"; COUNT="${3:-96}"; WIDTH="${4:-1600}"; FOCUS="${5:-0.5}"; ENHANCE="${6:-0}"
OUT="assets/frames/$NAME"

[ -f "$IN" ] || { echo "Video nicht gefunden: $IN"; exit 1; }
DUR=$(ffprobe -v error -show_entries format=duration -of default=nw=1:nk=1 "$IN")
FPS=$(awk -v c="$COUNT" -v d="$DUR" 'BEGIN { printf "%.4f", c / d }')

rm -rf "$OUT"; mkdir -p "$OUT"
# Gleichmäßig verteilte Bilder, auf Breite skaliert, als WebP (klein, gute Qualität)
if [ "$ENHANCE" = "1" ]; then
  VF="fps=$FPS,hqdn3d=1.5:1.5:3:3,scale=$WIDTH:-2:flags=lanczos,unsharp=5:5:0.8:3:3:0.0,eq=contrast=1.04:saturation=1.05"; Q=80
else
  VF="fps=$FPS,scale=$WIDTH:-2:flags=lanczos"; Q=72
fi
ffmpeg -v error -i "$IN" -an -vf "$VF" \
  -frames:v "$COUNT" -c:v libwebp -quality "$Q" -compression_level 6 "$OUT/frame-%03d.webp"

N=$(ls "$OUT" | grep -c '^frame-.*\.webp$')
printf '{ "count": %d, "prefix": "frame-", "ext": "webp", "focusX": %s, "restAt": 1 }\n' "$N" "$FOCUS" > "$OUT/manifest.json"

SIZE=$(du -sh "$OUT" | cut -f1)
echo "Fertig: $N Bilder in $OUT ($SIZE)"
