ffmpeg-any
==================

A command line tool that batch processes video files and directories with [ffmpeg](https://ffmpeg.org/).

Supports outputting powershell, batch and bash scripts; or a simple text file. For use with Windows or Mac\UNIX.

This script **DOES NOT** make any changes to your files, it only creates a script with ffmpeg commands.

The resulting script will stop processing files if it encounters any errors. example output scripts can be found [HERE](https://github.com/topaz1008/ffmpeg-any/tree/master/examples)

After running this script in a folder that contains supported video files, a script named `run-ffmpeg` will be created in the current working directory. (where you ran ffmpeg-any from)

You can then view and/or edit `run-ffmpeg` before running it to start conversion with ffmpeg. (file extension will depend on the output script type you choose)

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
   $> ffmpeg-any --command="-c:v libx264 -crf 21 -c:a aac -b:a 128k"
   ```

* recursive - recursively process all subdirectories in the current working directory. (default is to only process `cwd` for files)
   ```
   $> ffmpeg-any --recursive
   ```

* delete-source - will delete the source files after successful conversion (default is to keep them)
   ```
   $> ffmpeg-any --delete-source
   ```

* extensions - override the default supported (processed) extensions: default is `(webm|mkv|wmv|flv|m4v|mov|mpg|mpeg|ts|avi|rm|mp4)` i.e all.
   ```
   $> ffmpeg-any --extensions="mkv|webm"
   ```
  
* out - specify a different extension (container) for the output files (default is `mp4`)
   ```
   $> ffmpeg-any --out="mkv"
   ```
  
* script-type - specify a different script type to output. (default is powershell, valid values are `powershell|batch|bash|text`)
   ```
   $> ffmpeg-any --script-type="bash"
   ```
  
* exclude - specify a regex pattern to exclude from processing (this regex will be tested against the filenames).
this example regex will exclude any filenames matching the following pattern; i.e. filename named `foo` and have any extension.
   ```
   $> ffmpeg-any --exclude="^(foo\.(.*))$"
   ```

Usage examples
---------------

1. This will process any video files supported in the current directory with the passed ffmpeg parameters while keeping the source files.
    ```
    $> ffmpeg-any --command="-c:v libx264 -preset slow -crf 21 -c:a aac -b:a 128k"
    ```
    
    The pseudo output for a single file will be:
    ```
    $> ffmpeg -hide_banner -i "mymovie.mkv" -c:v libx264 -preset slow -crf 21 -c:a aac -b:a 128k "mymovie.mp4"
    ```

2. This will convert all files in the current working directory and any of its sub-folders to x264 mp4 with aac audio while deleting original files:
   ```
   $> ffmpeg-any --delete-source --recursive --command="-c:v libx264 -preset slow -crf 21 -c:a aac -b:a 128k"
   ```

   The pseudo output for a single file will be:
   ```
   ffmpeg -hide_banner -i "mymovie.mkv" -c:v libx264 -preset slow -crf 21 -c:a aac -b:a 128k "mymovie.mp4"
   del "mymovie.mkv"
   ```

Contributing
---------------
If you want to contribute; fork this repository, make your changes and submit a pull-request.

TODO
---------------
* Add more comprehensive tests.
