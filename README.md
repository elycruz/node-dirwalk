# node-dirwalk
Directory walker (functional, uses promises and fully asynchronous).

### Usage:
```
const path = require('path'),
    dirWalk = require('node-dirwalk');

// Recursively walk directory
dirWalk (
        // Directory effect factory
        (dirPath, stat, dirName) => (files) => {
            return {
                fileName: dirName,
                filePath: dirPath,
                files
            };
        },

        // File effect factory
        (filePath, stat, fileName) => () => {
            return {
                fileName,
                filePath
            };
        },

        // Dir to walk
        path.join(__dirname, '/../')
    )
    .then(obj => JSON.stringify(obj, null, 4)) // pretty printed
    .then(log)
    .catch(log);
```

### Api:

- dirWalk
- dirWalkToTree
- readDirectory
- readStat
- fsReadCallbackFactory
- SjlFileInfo
- processDirectory
- processFiles
- processFile
- processForkOnStat

#### **`dirWalk (dirEffectFactory {Function}, fileEffectFactory {Function}, dir {String}) : Promise <Object>`**
**Functional signature**: `recWalkDir :: EffectFactory Ef => Ef a b c -> Ef e f g -> String -> Promise *`


#### **`dirToTreeLikeRec (TypeRep {Function <fileName, filePath, stat>|undefined|null}, dir {String}) : Promise<Object>`**
    @Note TypeRep is optional (`dirToTreeLikeRec.SjlFileInfo` is used if not passed in)
    Returns an object representation of the passed in directory using `TypeRep` as the file object constructor; E.g.,
    ```
    const path = require('path'),
        dirToTreeLikeRec = require('node-dir-to-treelike');

    // Get tree structure
    dirToTreeLikeRec (null, path.join(__dirname, '/../some-dir'))
        // .then(obj => JSON.stringify(obj, null, 4)) // pretty printed
        .then(JSON.stringify)
        .then(log);
    ```

#### **`readDirectory (pathName {String}) : Promise <Array<Object>>`**
#### **`readStat (filePath {String}) : Promise <fs.Stat>`**

#### **`SjlFileInfo {Function <fileName, filePath, stat>}
Default constructor used to construct file objects.  Note
this is a minimalist constructor or data type representation (
    only has properties, no added methods of it's own).

##### Properties:
- `fileName` {String} {enumerable, configurable: false}
- `filePath` {String} {enumerable, configurable: false}
- `basename` {String} {enumerable, configurable: false}
- `extension` {String} {enumerable, configurable: false}
- `lastModified` {Date} {enumerable, configurable: false}
- `createdDate` {Date} {enumerable, configurable: false}
- `lastChanged` {Date} {enumerable, configurable: false}
- `lastAccessed` {Date} {enumerable, configurable: false}
- `stat` {fs.Stat} {enumerable: false, configurable: false} - Note: When calling JSON.stringify on an object of this
    type this property is ignored since it is not `enumerable`.

###### If represents a directory:
- `files` {Array<SjlFileInfo>}

### References:
Stat notes:
 - https://nodejs.org/api/fs.html#fs_class_fs_stats
 - http://www.computerworld.com/article/2694880/unix-stat-more-than-ls.html
 - https://nodejs.org/api/fs.html#fs_fs_readdir_path_options_callback
