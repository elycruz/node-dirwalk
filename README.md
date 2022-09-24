# node-dirwalk

Functional directory walking via promises. The library offers you two functions for recursively walking a directory.
One, `dirWalk`, offers you fine grain control for when needing to recursively walk through a directory
and the other, `dirWalkToTree`, does the work for you when all you need is a tree representation of a directory.
The library also offers one data type, `FileInfo`, which can be overridden via the first
parameter of `dirWalk` and `dirWalkToTree`.

### Usage:

#### Minimalistic approach:

##### Using `dirWalkToTree()`:

```javascript

const path = require('path'),
  {log, error} = console,
  {dirWalkToTree} = require('./');

// Get tree structure
dirWalkToTree(
  // Path to step through
  path.join(__dirname, '/../')
)
  // Return compiled tree to JSON
  .then(JSON.stringify)

  // Print and/or catch error
  .then(log, error);

```

##### Using `dirWalk()` directly (achieves same as above but manually):

```javascript

const path = require('path'),
  {log, error} = console.log.bind(console),
  dirWalk = require('./');

// Recursively walk directory
dirWalk(
  // Dir to walk
  path.join(__dirname, '/../'),

  // Directory effect factory
  (dirPath, dirName, stat) => fileInfoObj => fileInfoObj,   // We're not doing any work here,
                                                            // allowing created file object to pass through
                                                            // File effect factory
  (filePath, fileName, stat) => fileInfoObj => fileInfoObj, // ""
)
  // Pretty print compiled
  .then(obj => JSON.stringify(obj, null, 4))

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
- dirWalkToTree
- FileInfo

#### `dirWalk (dir: string, dirEffectFactory = () => x => x, fileEffectFactory = () => x => x, TypeRep = FileInfo) => Promise<any>`

- **`dir`** {String} - Directory to walk.
- **`dirEffectFactory`** {Function<filePath, fileName, stat{fs.Stat}>:Function<fileInfoObj{TypeRep}, files{Array}>} -
  Call back factory that returns the callback that handles visits to directories
  **Note** directory recursion is handled for you by `dirWalk`, the returned callback
  here is meant to handle the construction or returning of the data object
  representing the visited directory.
- **`fileEffectFactory`** {Function<filePath, fileName, stat{fs.Stat}>:Function<fileInfoObj{TypeRep}>} -
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
