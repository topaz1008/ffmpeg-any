function Invoke-Call {
    param (
        [scriptblock]$ScriptBlock,
        [string]$ErrorAction = $ErrorActionPreference
    ) & @ScriptBlock
    if (($lastexitcode -ne 0) -and $ErrorAction -eq "Stop") {
        exit $lastexitcode
    }
}

Invoke-Call -ScriptBlock {
    ffmpeg -hide_banner -i "video1.mkv" -c:v libx264 -c:a aac 128k "video1.mp4"
} -ErrorAction Stop
Invoke-Call -ScriptBlock {
    ffmpeg -hide_banner -i "video2.mkv" -c:v libx264 -c:a aac 128k "video2.mp4"
} -ErrorAction Stop
Invoke-Call -ScriptBlock {
    ffmpeg -hide_banner -i "video3.mkv" -c:v libx264 -c:a aac 128k "video3.mp4"
} -ErrorAction Stop
Invoke-Call -ScriptBlock {
    Remove-Item -Force "run-ffmpeg.ps1"
} -ErrorAction Stop
