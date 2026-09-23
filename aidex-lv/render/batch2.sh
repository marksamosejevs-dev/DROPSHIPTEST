#!/bin/bash
set -e
cd "$(dirname "$0")/.."
O=src/assets/img
r() { ALPHA=${4:-0} node render/capture.mjs "$1" "$2" "$3" "$5" 2>&1 | grep -E "saved|HOTSPOT|rror" || true; }
r hero2 2400 1350 0 $O/hero.png
r hero2 1080 1700 0 $O/hero-portrait.png
r pkg6 1600 1200 0 $O/pkg-6.png
r pkg8 1600 1200 0 $O/pkg-8.png
r pkg10 1600 1200 0 $O/pkg-10.png
r pkgmax 1600 1200 0 $O/pkg-max.png
r hotspot 2400 1380 0 $O/hotspot.png
r iso 1800 1300 1 render/out2/iso-day.png
r isonight 1800 1300 1 render/out2/iso-night.png
echo BATCH DONE
