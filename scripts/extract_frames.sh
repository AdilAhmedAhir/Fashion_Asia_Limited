#!/bin/bash
# Extracts 120 JPEG frames per video with bookend quality boost.
# First 15 frames & last 15 frames: q:v 1 (max quality, ~200KB each)
# Middle 90 frames: q:v 4 (standard quality, ~100KB each)

echo "Starting HQ bookend frame extraction for 6 video variants..."

mkdir -p public/sequence/{v1,v2,v3,v4,v5,v6}

for i in {1..6}; do
  if [ -f "public/videos/v${i}.mp4" ]; then
    echo ""
    echo "=== Processing v${i}.mp4 ==="

    # Pass 1: Extract ALL 120 frames at standard quality (q:v 4)
    echo "  [1/3] Extracting 120 frames at standard quality..."
    ffmpeg -y -i "public/videos/v${i}.mp4" -vf "scale=1920:-1,fps=15" -vframes 120 -q:v 4 "public/sequence/v${i}/frame_%d.jpg" 2>/dev/null

    # Pass 2: Re-extract first 15 frames at MAX quality (q:v 1), overwriting
    echo "  [2/3] Boosting first 15 frames to max quality..."
    ffmpeg -y -i "public/videos/v${i}.mp4" -vf "scale=1920:-1,fps=15" -vframes 15 -q:v 1 "public/sequence/v${i}/frame_%d.jpg" 2>/dev/null

    # Pass 3: Re-extract last 15 frames (106-120) at MAX quality (q:v 1)
    # Frame 106 at 15fps starts at t = 105/15 = 7.0s
    echo "  [3/3] Boosting last 15 frames to max quality..."
    ffmpeg -y -ss 7.0 -i "public/videos/v${i}.mp4" -vf "scale=1920:-1,fps=15" -vframes 15 -q:v 1 "/tmp/hq_tail_%d.jpg" 2>/dev/null

    # Move tail frames to correct numbered slots (106-120)
    for j in $(seq 1 15); do
      target=$((105 + j))
      if [ -f "/tmp/hq_tail_${j}.jpg" ]; then
        mv "/tmp/hq_tail_${j}.jpg" "public/sequence/v${i}/frame_${target}.jpg"
      fi
    done

    echo "  Done: v${i} (15 HQ head + 90 standard + 15 HQ tail)"
  else
    echo "Warning: public/videos/v${i}.mp4 not found."
  fi
done

echo ""
echo "Extraction complete. HQ bookend sequences saved to public/sequence/v1 through v6."
