ffmpeg -hide_banner -i "video1.mkv" -c:v libx264 -c:a aac 128k "video1.mp4" || goto :error
ffmpeg -hide_banner -i "video2.mkv" -c:v libx264 -c:a aac 128k "video2.mp4" || goto :error
ffmpeg -hide_banner -i "video3.mkv" -c:v libx264 -c:a aac 128k "video3.mp4" || goto :error
del "run-ffmpeg.bat" || goto :error
:error
exit /b %errorlevel%
