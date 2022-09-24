/**
 * dirWalk.js
 */

const path = require('path'),
  fs = require('fs'),

  {readdir: readDirectory, lstat: readStat} = fs.promises,

  FileInfo = require('./FileInfo'),

  /**
   * @type {StatGetter}
   */
  defaultStatGetter = filePath => readStat(filePath),

  /**
   * @type {FileHandler}
   */
  defaultDirHandler = (dirPath, dirName, stat, files) =>
    new FileInfo(dirPath, dirName, stat, files),

  /**
   * @type {FileHandler}
   */
  defaultFileHandler = (filePath, fileName, stat, files = null) =>
    new FileInfo(filePath, fileName, stat, files);
;

/**
 * @typedef FileHandler
 *
 * @description Handler function that returns a function that returns the result/side effect to apply
 *  to tree structure returned by `dirWalk`, and `dirWalkTree` methods; See tests, for more.
 *
 * @type function (filePath, fileName, stat, files = null) => (fileInfoObj) => any,
 * @param {string} filePath
 * @param {string} fileName
 * @param {Stats} stat
 * @param {any[]} [files = null] - Optional - Should only be populated for directories.
 * @returns {FileInfo}
 */

/**
 * @typedef StatGetter
 *
 * A function that takes a filepath and returns an `fs.Stats` object.
 *
 * @type (filePath) => Promise<fs.Stats>
 * @param {string} filePath
 * @returns {fs.Stats}
 */

/**
 * @interface DirWalkOptions
 *
 * @property {FileHandler} fileHandler
 * @property {FileHandler} dirHandler
 * @property {StatGetter} statGetter
 * @property {FileInfo} TypeRep - Entry type representation.
 */

/**
 * @class DirectoryWalker
 */
class DirectoryWalker {
  /**
   * @type {FileInfo}
   */
  TypeRep = FileInfo;

  /**
   * @type {FileHandler}
   */
  dirHandler = defaultDirHandler;

  /**
   * @type {FileHandler}
   */
  fileHandler = defaultFileHandler;

  /**
   * @type {StatGetter} - Takes a file path and returns a Promise that resolves to a `Stats` object.
   */
  statGetter = defaultStatGetter;

  /**
   * @param {FileHandler} dirHandler
   * @param {FileHandler} fileHandler
   * @param {StatGetter} statGetter
   * @param {FileInfo} TypeRep
   */
  constructor(
    fileHandler = defaultFileHandler,
    dirHandler = defaultDirHandler,
    statGetter = defaultStatGetter,
    TypeRep = FileInfo
  ) {
    this.dirHandler = dirHandler;
    this.fileHandler = fileHandler;
    this.statGetter = statGetter;
    this.TypeRep = TypeRep;
  }

  /**
   * @param {string} dirPath
   * @param {string} dirName
   * @param {Stats} stat
   * @returns {Promise<any>}
   */
  processDirectory(dirPath, dirName, stat) {
    const {dirHandler} = this;
    return readDirectory(dirPath)
      .then(files => this.processFiles(dirPath, files))
      .then(files => dirHandler(dirPath, dirName, stat, files));
  }

  /**
   * @param {string} filePath
   * @param {string} fileName
   * @param {Stats} stat
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
   * @returns {Promise<any>}
   */
  processFiles(dir, files) {
    return new Promise((resolve, reject) => {
      return Promise.all(
        files.map(fileName => {
          const filePath = path.join(dir, fileName);
          return readStat(filePath)
            .then(stat => this.processForkOnStat(filePath, fileName, stat));
        })
      )
        .then(results => results.filter(x => !!x))
        .then(resolve, reject);
    })
  }

  /**
   * @param {string} filePath
   * @param {string} fileName
   * @param {Stats} stat
   * @returns {Promise<any>}
   */
  processForkOnStat(filePath, fileName, stat) {
    if (stat.isDirectory()) {
      return this.processDirectory(filePath, fileName, stat);
    } else if (stat.isFile()) {
      return this.processFile(filePath, fileName, stat);
    }
    return Promise.resolve(this.fileHandler(filePath, fileName, stat));
  }
}

/**
 * @param {string} dir
 * @param {DirWalkOptions}
 * @returns {Promise<any>}
 */
const dirWalk = (
  dir,
  {
    fileHandler = defaultFileHandler,
    dirHandler = defaultDirHandler,
    statGetter = defaultStatGetter,
    TypeRep = FileInfo
  }
) => {
  const walker = new DirectoryWalker(fileHandler, dirHandler, readStat, TypeRep);
  return statGetter(dir)
    .then(stat => {
      const dirName = path.basename(dir);
      return walker.processForkOnStat(dir, dirName, stat);
    });
};

module.exports = dirWalk;
