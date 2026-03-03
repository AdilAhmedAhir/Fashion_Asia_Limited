#!/bin/bash
# Maximum quality WebP extraction — optimize down later, never up.
# 20fps × 8s = 160 frames per video
# ALL frames at q95 (near-lossless) — we can always dial this down later.
# Also generates a poster.webp (frame 1 at lossless quality) for instant loading.

TOTAL_FRAMES=160
FPS=20
WEBP_QUALITY=95  # Near-lossless for all frames — start premium, optimize later

echo "Starting MAX QUALITY WebP extraction (${FPS}fps, ${TOTAL_FRAMES} frames, all q${WEBP_QUALITY})..."
echo ""

mkdir -p public/sequence/{v1,v2,v3,v4,v5,v6}

for i in {1..6}; do
  if [ -f "public/videos/v${i}.mp4" ]; then
    echo "=== Processing v${i}.mp4 ==="
    DIR="public/sequence/v${i}"

    # Clean previous frames
    rm -f "$DIR"/frame_*.jpg "$DIR"/frame_*.webp "$DIR"/poster.webp

    # Extract ALL frames as max-quality JPEG intermediates
    echo "  [1/4] Extracting ${TOTAL_FRAMES} max-quality JPEG intermediates..."
    ffmpeg -y -i "public/videos/v${i}.mp4" -vf "scale=1920:-1,fps=${FPS}" -vframes $TOTAL_FRAMES -q:v 1 "$DIR/frame_%d.jpg" 2>/dev/null

    # Convert ALL to WebP at q95
    echo "  [2/4] Converting all ${TOTAL_FRAMES} frames to WebP q${WEBP_QUALITY}..."
    for j in $(seq 1 $TOTAL_FRAMES); do
      cwebp -q $WEBP_QUALITY "$DIR/frame_${j}.jpg" -o "$DIR/frame_${j}.webp" 2>/dev/null
    done

    # Generate poster (frame 1 at absolute max quality for instant hero display)
    echo "  [3/4] Generating poster.webp (lossless first frame)..."
    cwebp -q 100 "$DIR/frame_1.jpg" -o "$DIR/poster.webp" 2>/dev/null

    # Remove intermediate JPEGs
    echo "  [4/4] Cleaning up JPEG intermediates..."
    rm -f "$DIR"/frame_*.jpg

    COUNT=$(ls "$DIR"/frame_*.webp 2>/dev/null | wc -l | tr -d ' ')
    SIZE=$(du -sh "$DIR/" | cut -f1)
    POSTER_SIZE=$(ls -lh "$DIR/poster.webp" | awk '{print $5}')
    echo "  Done: v${i} — ${COUNT} frames, ${SIZE} total, poster: ${POSTER_SIZE}"
    echo ""
  else
    echo "Warning: public/videos/v${i}.mp4 not found."
  fi
done

TOTAL_SIZE=$(du -sh public/sequence/ | cut -f1)
echo "Extraction complete. Total: ${TOTAL_SIZE}"
echo "Format: WebP q${WEBP_QUALITY} | FPS: ${FPS} | Frames: ${TOTAL_FRAMES} | Resolution: 1920×1080"
echo ""
echo "To optimize later, just change WEBP_QUALITY to a lower value (e.g., 82) and re-run."
