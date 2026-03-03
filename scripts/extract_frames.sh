#!/bin/bash
# Extracts 192 JPEG frames per video (24fps × 8s) with bookend quality boost.
# First 20 frames & last 20 frames: q:v 1 (max quality, crisp hero entrance/exit)
# Middle frames: q:v 4 (standard quality, keeps payload manageable)
# Resolution: 1920x1080 (optimal for web — 4K frames would be ~500KB+ each)

echo "Starting 24fps HQ bookend frame extraction for 6 video variants..."
echo "  192 frames per video (24fps × 8s) — smoother scroll than previous 120 frames."
echo ""

TOTAL_FRAMES=192
HQ_COUNT=20

mkdir -p public/sequence/{v1,v2,v3,v4,v5,v6}

for i in {1..6}; do
  if [ -f "public/videos/v${i}.mp4" ]; then
    echo "=== Processing v${i}.mp4 ==="

    # Pass 1: Extract ALL frames at standard quality
    echo "  [1/3] Extracting $TOTAL_FRAMES frames at standard quality (q:v 4)..."
    ffmpeg -y -i "public/videos/v${i}.mp4" -vf "scale=1920:-1,fps=24" -vframes $TOTAL_FRAMES -q:v 4 "public/sequence/v${i}/frame_%d.jpg" 2>/dev/null

    # Pass 2: Overwrite first 20 frames at MAX quality
    echo "  [2/3] Boosting first $HQ_COUNT frames to max quality (q:v 1)..."
    ffmpeg -y -i "public/videos/v${i}.mp4" -vf "scale=1920:-1,fps=24" -vframes $HQ_COUNT -q:v 1 "public/sequence/v${i}/frame_%d.jpg" 2>/dev/null

    # Pass 3: Overwrite last 20 frames at MAX quality
    # Frame 173 at 24fps starts at t = 172/24 ≈ 7.167s
    TAIL_START=$(echo "scale=3; ($TOTAL_FRAMES - $HQ_COUNT) / 24" | bc)
    echo "  [3/3] Boosting last $HQ_COUNT frames to max quality (from t=${TAIL_START}s)..."
    ffmpeg -y -ss "$TAIL_START" -i "public/videos/v${i}.mp4" -vf "scale=1920:-1,fps=24" -vframes $HQ_COUNT -q:v 1 "/tmp/hq_tail_%d.jpg" 2>/dev/null

    for j in $(seq 1 $HQ_COUNT); do
      target=$(($TOTAL_FRAMES - $HQ_COUNT + $j))
      if [ -f "/tmp/hq_tail_${j}.jpg" ]; then
        mv "/tmp/hq_tail_${j}.jpg" "public/sequence/v${i}/frame_${target}.jpg"
      fi
    done

    # Clean up any stale frames beyond 192 from previous 120-frame extractions
    for f in public/sequence/v${i}/frame_*.jpg; do
      num=$(basename "$f" | sed 's/frame_\([0-9]*\)\.jpg/\1/')
      if [ "$num" -gt "$TOTAL_FRAMES" ]; then
        rm "$f"
      fi
    done

    COUNT=$(ls public/sequence/v${i}/ | wc -l | tr -d ' ')
    SIZE=$(du -sh public/sequence/v${i}/ | cut -f1)
    echo "  Done: v${i} — ${COUNT} frames, ${SIZE}"
    echo ""
  else
    echo "Warning: public/videos/v${i}.mp4 not found."
  fi
done

echo "Extraction complete. 24fps sequences saved to public/sequence/v1 through v6."
