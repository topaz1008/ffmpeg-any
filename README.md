ffmpeg-any
==================

A command line tool for windows that batch process video files and directories with [ffmpeg](https://ffmpeg.org/).

This script DOES NOT make any changes to your files, it only creates a powershell script with ffmpeg commands.

The resulting script will stop processing files if it encounters any errors.

After running this script in a folder that contains supported video files, a powershell script named `run-ffmpeg.ps1` will be created in the current working directory. (where you ran ffmpeg-any from)

You can then view and/or edit `run-ffmpeg.ps1` before running it to start conversion with ffmpeg.

Installing
---------------

1. Clone or download this repository.
2. Run the following command from the directory where you cloned or extracted the code to. (Make sure you have [Node.js](https://nodejs.org/en/) installed)

```
npm install && npm link
```

NOTE: make sure `ffmpeg` executable is in `PATH` and can be called from any directory.

Options
---------------

* command - the command to pass on to ffmpeg (if no command is passed then `-codec copy` will be used)
   ```
   PS> ffmpeg-any --command="-c:v libx264 -crf 21 -c:a aac -b:a 128k"
   ```

* delete-source - will delete the source files after successful conversion (default is to keep them)
   ```
   PS> ffmpeg-any --delete-source
   ```
  
* out - specify a different extension for the output files (default is mp4)
   ```
   PS> ffmpeg-any --out="mkv"
   ```
  
* sub - also process any subdirectories in the current working directory for any video files (only 1 level deep)
   ```
   PS> ffmpeg-any --sub
   ```

* batchfile - outputs a batch file instead of a powershell script.
   ```
   PS> ffmpeg-any --batchfile
   ```

Usage examples
---------------

1. This will process any video files supported in the current directory with the passed ffmpeg parameters while keeping the source files.
    ```
    PS> ffmpeg-any --command="-c:v libx264 -preset slow -crf 21 -c:a aac -b:a 128k"
    ```
    
    The pseudo output for a single file will be:
    ```
    PS> ffmpeg -hide_banner -i "mymovie.mkv" -c:v libx264 -preset slow -crf 21 -c:a aac -b:a 128k "mymovie.mp4"
    ```

2. This will convert all files in the current working directory and any of its sub-folders to x264 mp4 with aac audio while deleting original files:
   ```
   PS> ffmpeg-any --delete-source --sub --command="-c:v libx264 -preset slow -crf 21 -c:a aac -b:a 128k"
   ```

   The pseudo output for a single file will be:
   ```
   ffmpeg -hide_banner -i "mymovie.mkv" -c:v libx264 -preset slow -crf 21 -c:a aac -b:a 128k "mymovie.mp4"
   del "mymovie.mkv"
   ```

Contributing
---------------
If you want to contribute; fork this repository, make your changes and submit a pull-request.
