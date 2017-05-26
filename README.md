# node-dir-to-tree-like
Directory Iterator implementation for node.

### Api:
#### **`dirToTreeLikeRec (TypeRep {Function <fileName, filePath, stat>}, dir {String}) `**
    @Note TypeRep is optional (`dirToTreeLikeRec.SjlFileInfo` is used if `!TypeRep`)
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

#### **`SjlFileInfo {Function <fileName, filePath, stat>} - Default constructor used to construct file objects.  Note
this is a minimalist constructor or data type representation (only has properties, no added methods of it's own).

##### Properties:
- `fileName` {String} {enumerable, configurable: false}
- `filePath` {String} {enumerable, configurable: false}
- `basename` {String} {enumerable, configurable: false}
- `extname` {String} {enumerable, configurable: false}
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
