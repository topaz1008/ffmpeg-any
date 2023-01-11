#!/bin/bash
set -euxo pipefail
ffmpeg -hide_banner -i "video1.mkv" -c:v x264 -c:a aac 128k "video1.mp4"
ffmpeg -hide_banner -i "video2.mkv" -c:v x264 -c:a aac 128k "video2.mp4"
ffmpeg -hide_banner -i "video3.mkv" -c:v x264 -c:a aac 128k "video3.mp4"
rm -f "run-ffmpeg.sh"
