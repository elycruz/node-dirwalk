/**
 * dirWalk.js
 */

const path = require('path'),
  fs = require('fs'),

  {readdir: readDirectory, lstat: readStat} = fs.promises,

  /**
   * Default file/directory representation.
   *
   * @type {FileInfo}
   */
  {FileInfo} = require('./FileInfo'),

  /**
   * @type {StatGetter}
   *
   * Returns an `fs.Stats` object for given path, or `null` if `filePath` should be skipped (in tree walker).
   */
  defaultStatGetter = (filePath, depth = 0) => readStat(filePath),

  /**
   * @type {FileHandler}
   *
   * Used for handling both, directory, and non-directory (file, symbolic link, etc.) types.
   */
  defaultFileHandler = (filePath, fileName, stat, files = null) =>
    new FileInfo(filePath, fileName, stat, files);
;

/**
 * @typedef FileHandler
 *
 * @description Handler function that returns a function that returns the result/side effect to apply
 *  to tree structure returned by `dirWalk`, and `dirWalkTree` methods;  To signal that
 *  an entry should not be entered into the returned tree `null` should be returned, optionally, filter
 *  could be applied in `statsGetter` and `null` returned from there.
 *
 * @examples See tests.
 *
 * @type function (filePath, fileName, stat, files = null) => any,
 * @param {string} filePath
 * @param {string} fileName
 * @param {fs.Stats} stat
 * @param {any[]} [files = null] - Optional - Should only be populated for directories.
 * @returns {FileInfo}
 */

/**
 * @typedef StatGetter
 *
 * A function that takes a filepath and returns an `fs.Stats` object;
 * If a falsy value is returned filepath gets ignored and walker proceeds to next entry
 * in tree.
 *
 * @type (filePath, currentDepth) => Promise<fs.Stats>
 * @param {string} filePath
 * @param {number} [currentDepth] - Optional - Depth of the current directory walk - Useful for metrics (
 *   max visited depth etc.).
 *
 * @returns {fs.Stats}
 */

/**
 * @interface DirWalkOptions
 *
 * A pure object containing required options for `dirWalk`/`dirWalkToTree` methods.
 *
 * @property {FileHandler} [fileHandler]
 * @property {FileHandler} [dirHandler]
 * @property {StatGetter} [statGetter]
 * @property {number} [maxDepth] - Max traversal depth.
 */

/**
 * @class DirectoryWalker
 *
 * Class structure used to walk a directory tree.
 */
class DirectoryWalker {
  /**
   * @type {FileHandler}
   */
  dirHandler = defaultFileHandler;

  /**
   * @type {FileHandler}
   */
  fileHandler = defaultFileHandler;

  /**
   * @type {StatGetter} - Takes a file path and returns a Promise that resolves to a `Stats` object.
   */
  statGetter = defaultStatGetter;

  /**
   * @param {DirWalkOptions}
   */
  constructor({
                fileHandler = defaultFileHandler,
                dirHandler = defaultFileHandler,
                statGetter = defaultStatGetter,
                maxDepth = null
              }) {
    this.dirHandler = dirHandler;
    this.fileHandler = fileHandler;
    this.statGetter = statGetter;
    this.maxDepth = maxDepth;
  }

  /**
   * @param {string} dirPath
   * @param {string} dirName
   * @param {fs.Stats} stat
   * @param {number} [depth = 0] - Current `dirWalk` depth ('next depth' calculated internally, by this method).
   * @returns {Promise<any>}
   */
  processDirectory(dirPath, dirName, stat, depth = 0) {
    const {dirHandler, maxDepth} = this;
    return readDirectory(dirPath)
      .then(files => maxDepth && depth >= maxDepth ?
        null : this.processFiles(dirPath, files, depth + 1))
      .then(files => dirHandler(dirPath, dirName, stat, files));
  }

  /**
   * @param {string} filePath
   * @param {string} fileName
   * @param {fs.Stats} stat
   * @returns {Promise<any>}
   */
  processFile(filePath, fileName, stat) {
    const {fileHandler} = this;
    return new Promise((resolve, reject) => {
      if (!stat.isDirectory()) {
        resolve(fileHandler(filePath, fileName, stat));
      }
      this.processDirectory(filePath, fileName, stat)
        .then(resolve, reject);
    });
  }

  /**
   * @param {string} dir
   * @param {string[]} files
   * @param {number} [depth = 0] - Next `dirWalk` depth.
   * @returns {Promise<any>}
   */
  processFiles(dir, files, depth = 0) {
    return new Promise((resolve, reject) => {
      return Promise.all(
        files.map(fileName => {
          const filePath = path.join(dir, fileName);
          return this.statGetter(filePath, depth)
            .then(stat => this.processForkOnStat(filePath, fileName, stat, depth));
        })
      )
        .then(results => results.filter(x => !!x))
        .then(resolve, reject);
    })
  }

  /**
   * @param {string} filePath
   * @param {string} fileName
   * @param {fs.Stats} stat
   * @param {number} [depth = 0] - Current walk depth - Can be used in `statGetter` to know
   *  if some required `maxDepth` has been reached, etc..
   * @returns {Promise<any>}
   */
  processForkOnStat(filePath, fileName, stat, depth = 0) {
    if (!stat) return Promise.resolve();
    if (stat.isDirectory()) {
      return this.processDirectory(filePath, fileName, stat, depth);
    } else if (stat.isFile()) {
      return this.processFile(filePath, fileName, stat);
    }
    return Promise.resolve(this.fileHandler(filePath, fileName, stat));
  }
}

/**
 * Walks a directory tree and allows user to perform some actions based on encountered tree entry -
 *  Can be used to generate a tree structure from a directory path (what happens by default), or
 *  some other arbitrary action, via `fileHandler`, `dirHandler`, and/or `statGetter`, options.
 *
 * @note Any returned 'falsy' values, from `(file|dir)Handler`, and/or `statGetter`, signal to the walker that
 *  the encountered tree entry should be ignored (stops directories from being traverse etc.) - This is
 *  effectively the methods 'filtering' functionality.
 *
 * @param {string} dir - Directory path to walk.
 * @param {DirWalkOptions} - Object containing settings for method.
 * @returns {Promise<any>} - Result of walked tree.
 */
const dirWalk = (
  dir,
  {
    fileHandler = defaultFileHandler,
    dirHandler = defaultFileHandler,
    statGetter = defaultStatGetter,
    maxDepth
  }
) => {
  const walker = new DirectoryWalker({
      fileHandler,
      dirHandler,
      statGetter,
      maxDepth
    }),
    depth = 1; // Pass in current `depth`

  // Falsy values ignored
  if (maxDepth && depth >= maxDepth) return Promise.resolve();

  return statGetter(dir, depth)
    .then(stat => {
      if (!stat) return;
      const dirName = path.basename(dir);
      return walker.processForkOnStat(dir, dirName, stat, depth);
    });
};

module.exports = dirWalk;
