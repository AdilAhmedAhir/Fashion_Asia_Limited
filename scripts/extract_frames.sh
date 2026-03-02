#!/bin/bash
# This script requires FFmpeg. If you are on a Mac, install it via: brew install ffmpeg

echo "Starting frame extraction for 6 video variants..."

mkdir -p public/sequence/{v1,v2,v3,v4,v5,v6}

for i in {1..6}; do
  if [ -f "public/videos/v${i}.mp4" ]; then
    echo "Processing v${i}.mp4 -> 1080p WebP sequence (15fps, max 120 frames)..."
    # -y overwrites. scale=1920:-1 keeps aspect ratio. fps=15. -vframes 120 caps at 120 frames (8 seconds).
    ffmpeg -y -i "public/videos/v${i}.mp4" -vf "scale=1920:-1,fps=15" -vframes 120 -c:v libwebp -q:v 75 "public/sequence/v${i}/frame_%d.webp"
  else
    echo "Warning: public/videos/v${i}.mp4 not found. Make sure Phase 9.6 successfully copied them."
  fi
done

echo "Extraction complete. Sequences saved to public/sequence/v1 through v6."
