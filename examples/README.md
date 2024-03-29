Examples
==================

This folder contains example output scripts converting 3 video files using simple options.


How to add a new script type
==================

1. Add your type constant to `ScriptType` and `ScriptFactory` classes.
2. Create a new class that extends `Script` class; then override the following data members. (all members are string constants used in Node.js format() calls)
   1. `SCRIPT_CONTENT` - the template for the entire script, it will wrap the entire list of commands.
   2. `COMMAND_CONTENT` - the template for a single command (e.g. a single ffmpeg command, or a single delete command)
   3. `DELETE_COMMAND_CONTENT` - the template for a delete command.
3. The class MUST also implement a `getExtension()` method that returns the file extension for the script type. 
4. You can optionally override `deleteFile()`, `addCommand()` `writeScriptFileSync()` functions from the `Script` base class if you need to. 

Here is an example of creating a simple text output file.

```javascript
// Step 1
export class ScriptType {
    // ...
    static #TEXT = 'text';
    // ...
    static get TEXT() { return this.#TEXT; }

    static isValid(type) {
        switch (type) {
            // ...
            case this.TEXT:
                return true;
            // ...
        }
    }
}
```
```javascript
// Step 1
export class ScriptFactory {
    // ...
    static create(type) {
        switch (type) {
            // ...
            case ScriptType.TEXT: return new TextScript();
            // ...
        }
    }
}
```
```javascript
// Step 2, 3, 4
class TextScript extends Script {

    SCRIPT_CONTENT = '%s';
    COMMAND_CONTENT = '%s';
    DELETE_COMMAND_CONTENT = '';

    deleteFile(filename) {
        // we override this function with a no-op
        // delete commands would not make sense in a text file.
    }

    getExtension() {
        return 'txt';
    }
}
```
