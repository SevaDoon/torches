#!/usr/bin/env bash
# Fetch the licensed instrument samples used by the score (not committed).
#   cello            Freesound #12408 (flcellogrl) via tonejs-instruments — CC BY 3.0
#   harp, contrabass VSO2 via tonejs-instruments                          — CC BY 3.0
#   frame drum, bowed psaltery  VCSL (Versilian Community Sample Library) — CC0 1.0
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
DEST="${BNABBAR_SAMPLES:-$HERE/../.cache/samples}"
mkdir -p "$DEST"
cd "$DEST"

TJ=https://raw.githubusercontent.com/nbrosowsky/tonejs-instruments/master
for f in cello/D2 cello/D3 cello/A2 contrabass/D2 harp/D4 harp/F4 harp/A4 harp/C5; do
  mkdir -p "samples/$(dirname $f)"
  [ -s "samples/$f.wav" ] || curl -sfL -o "samples/$f.wav" "$TJ/samples/$f.wav"
done

VC=https://raw.githubusercontent.com/sgossner/VCSL/master
get_vcsl () {
  local rel="$1"
  mkdir -p "vcsl/$(dirname "$rel")"
  [ -s "vcsl/$rel" ] || curl -sfL -o "vcsl/$rel" "$VC/$(python3 -c 'import sys,urllib.parse;print(urllib.parse.quote(sys.argv[1]))' "$rel")"
}
get_vcsl "Membranophones/Struck Membranophones/Frame Drum/HDrumL_Hit_v3_rr1_Sum.wav"
get_vcsl "Membranophones/Struck Membranophones/Frame Drum/HDrumL_HitMuted_v3_rr1_Sum.wav"
get_vcsl "Chordophones/Zithers/Psaltery, Bowed and Plucked/LongBow/BowedPsaltery_D4_Main_LongBow_rr1.wav"
echo "samples ready in $DEST"
