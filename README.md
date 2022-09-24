# node-dirwalk

Trivial, asynchronous, directory walker. The library offers you one function `dirWalk`, which allows arbitrary actions
to be carried out for visited directories (everything works with promises internally, so all micro task actions are
supported), and a file/directory representation constructor - useful for cases where you need a basic 'FileInfo' object
to represent your directory, which contains other 'FileInfo' objects, etc..

### Usage:

#### Getting a tree representation:

```javascript

const path = require('path'),
  {log, error} = console,
  {dirWalk} = require('./'),
  somePath = path.join(__dirname, '/../');

dirWalk(somePath)

  // Return compiled tree to JSON
  .then(JSON.stringify)

  // Print and/or catch any resulting errors
  .then((tree) => log(tree, `${somePath} walked successfully.`), error);

```

##### Getting a tree representation with filtering:

```javascript

const path = require('path'),
  fs = require('fs'),
  {log, error} = console.log.bind(console),
  dirWalk = require('./');

dirWalk(
  path.join(__dirname, '/../'),
  {
    statGetter: (filePath, currentWalkDepth) => {
      const stat = fs.lstat(filePath); // Note any stat format, that may be required, can used here;
      // E.g., fs.stat(), fs.lstat(), fs.fstat(), etc. (@see fs.Stats docs for more
      // https://nodejs.org/api/fs.html#class-fsstats)

      // Check if filePath is a directory, and whether or not it should be skipped (
      // falsy value return here signals to `dirWalk` that encountered file path should be
      // ignored/skipped
      return stat.isDirectory() && (filePath[0] === '.' || filePath === 'node_modules') ?
        null : stat;
    }
  }
)
  // Do something with resulting tree
  .then(dirTree => JSON.stringify(dirTree, null, 4))

  // Log result or catch error
  .then(log, error);
```

##### Getting a custom tree representation:

If a file info object, other than the supplied one (`FileInfo`) is required you can used/construct your desired
on via the `dirHandler`, and `fileHandler` options.

```javascript

const path = require('path'),
  fs = require('fs'),
  {log, error} = console.log.bind(console),
  customFileHandler = 
  dirWalk = require('./');

dirWalk(
  path.join(__dirname, '/../'),
  {
    dirHandler: (dirPath, dirName, stat, files) => ({
      filePath: dirPath,
      fileName: dirName,
      files,
    }),
    fileHandler: (filePath, fileName, stat) => ({
      filePath,
      fileName
    }),
  }
)
  // Do something with resulting tree
  .then(dirTree => JSON.stringify(dirTree, null, 4))

  // Log result or catch error
  .then(log, error);
```

### Extensive approach

**Note:** This approach is meant for when side effects are needed or some processing
needs to be performed. For creating tree representations of a directory `dirWalkToTree`
should be used; Returning `null` from returned side-effect function causes visited entry to be omitted from resulting
tree.

```javascript

const path = require('path'),
  dirWalk = require('node-dirwalk');

// Recursively walk directory
dirWalk(
  // Dir to walk
  path.join(__dirname, '/../'),

  // Directory effect factory
  (dirPath, dirName, stat) => (fileInfoObj, files) => {
    // Side effectual work here

    // Our own custom data type - Note this could've easily been acheived with `dirWalkToTree` and just
    // passing in our custom data type constructor.
    return {
      fileName: dirName,
      filePath: dirPath,
      basename: fileInfoObj.basename,
      files
    };
  },

  // File effect factory
  // ""
  (filePath, fileName, stat) => fileInfoObj => {
    // Side effectual work here

    // Our own custom data type - Note this could've easily been acheived with `dirWalkToTree` and just
    // passing in our custom data type constructor.
    return {
      fileName,
      filePath,
      basename: fileInfoObj.basename
    };
  }
)
  .then(obj => JSON.stringify(obj, null, 4)) // pretty printed
  .then(log, console.error);
```

### Api:

- dirWalk
- dirWalkOptions
- FileInfo

####

#### `dirWalk (dir: string, dirHandler = () => x => x, fileHandler = () => x => x, TypeRep = FileInfo) => Promise<any>`

- **`dir`** {String} - Directory to walk.
- **`dirHandler`** {Function<filePath, fileName, stat{fs.Stat}>:Function<fileInfoObj{TypeRep}, files{Array}>} -
  Call back factory that returns the callback that handles visits to directories
  **Note** directory recursion is handled for you by `dirWalk`, the returned callback
  here is meant to handle the construction or returning of the data object
  representing the visited directory.
- **`fileHandler`** {Function<filePath, fileName, stat{fs.Stat}>:Function<fileInfoObj{TypeRep}>} -
  Same as above but the returned callback doesn't receive a `files` argument.
- **`TypeRep`** {Constructor<filePath, fileName, stat{fs.Stat}> | null | undefined} -
  File node data type constructor. Optional. Default `FileInfo`.
- **returns** - A promise with the compiled data tree of visited file/directory nodes.

#### **`dirWalkToTree (dirPath: string, TypeRep = FileInfo) => Promise`**

- **`TypeRep`** {Constructor<filePath, stat{fs.Stat}, fileName> | null | undefined} -
  File node data type constructor. Optional. Default `FileInfo`.
- **`dir`** {String} - Directory to walk.
- **returns** - A promise with the compiled data tree of visited file/directory nodes visited.

##### Example:

```javascript
const path = require('path'),
  dirWalkToTree = require('node-dir-to-treelike');

// Get tree structure
dirWalkToTree(null, path.join(__dirname, '/../some-dir'))
  .then(obj => JSON.stringify(obj, null, 4)) // pretty printed
  .then(log, log);
```

#### **`FileInfo {Function <fileName, filePath, stat {fs.Stat}>}`**

Default data constructor used to construct file objects.

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

- `files` {Array<FileInfo>}

### References:

**Stat notes**:

- https://nodejs.org/api/fs.html#fs_class_fs_stats
- http://www.computerworld.com/article/2694880/unix-stat-more-than-ls.html
- https://nodejs.org/api/fs.html#fs_fs_readdir_path_options_callback

**Directory Iterator implementations**:

- http://php.net/manual/en/class.splfileinfo.php
- http://php.net/manual/en/class.directoryiterator.php

**Recursive Directory Iterator implementations**:

- http://php.net/manual/en/class.recursivedirectoryiterator.php
