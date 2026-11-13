#!/bin/sh
# Project-panel marks. Run with qrbin on PATH.
# Dots, purple (#8a4ad7) to magenta (#c900c4), radial.
# Each code opens https://pesty.sh/projects/<slug>
#
#   scripts/project-qrs.sh qrbin smashbin rmbin

set -eu
out=public/brand/qr
mkdir -p "$out"

for slug in "$@"; do
  qrbin "https://pesty.sh/projects/${slug}" \
    --theme dots \
    --gradient radial \
    --from 8a4ad7 \
    --to c900c4 \
    --bg fafafa \
    --ecc high \
    --size 512 \
    --margin 2 \
    --format png \
    > "$out/${slug}.png"
done
