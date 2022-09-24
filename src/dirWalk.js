/**
 * dirWalk.js
 */

const path = require('path'),

  {readDirectory, readStat} = require('./utils'),

  FileInfo = require('./FileInfo');

/**
 * @typedef FileEffectFactory
 * @description Factory function that returns a function that returns the result/side effect to apply
 *  to tree structure returned by `dirWalk`, and `dirWalkTree` methods; See tests, for more.
 * @type function (filePath, fileName, stat) => (fileInfoObj) => any,
 * @param {string} filePath
 * @param {string} fileName
 * @param {fs.Stats} stat
 * @returns {(FileInfo) => any}
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
   * @type {FileEffectFactory}
   */
  dirEffectFactory = (dirPath, dirName, stat) => (fileInfo) => fileInfo;

  /**
   * @type {FileEffectFactory}
   */
  fileEffectFactory = (filePath, fileName, stat) => (fileInfo) => fileInfo;

  /**
   * @param {FileEffectFactory} dirEffectFactory
   * @param {FileEffectFactory} fileEffectFactory
   * @param {FileInfo} TypeRep
   */
  constructor(dirEffectFactory, fileEffectFactory, TypeRep = FileInfo) {
    this.dirEffectFactory = dirEffectFactory;
    this.fileEffectFactory = fileEffectFactory;
    this.TypeRep = TypeRep;
  }

  /**
   * @param {string} dirPath
   * @param {string} dirName
   * @param {fs.Stats} stat
   * @returns {Promise<any>}
   */
  processDirectory(dirPath, dirName, stat) {
    const {dirEffectFactory, TypeRep} = this;
    return readDirectory(dirPath)
      .then(files => this.processFiles(dirPath, files))
      .then(files => dirEffectFactory(dirPath, dirName, stat)(
        new TypeRep(dirName, dirPath, stat, files), files)
      );
  }

  /**
   * @param {string} filePath
   * @param {string} fileName
   * @param {fs.Stats} stat
   * @returns {Promise<any>}
   */
  processFile(filePath, fileName, stat) {
    const {fileEffectFactory, TypeRep} = this;
    return new Promise((resolve, reject) => {
      if (!stat.isDirectory()) {
        resolve(fileEffectFactory(filePath, fileName, stat)(new TypeRep(fileName, filePath, stat)));
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
   * @param {fs.Stats} stat
   * @returns {Promise<any>}
   */
  processForkOnStat(filePath, fileName, stat) {
    if (stat.isDirectory()) {
      return this.processDirectory(filePath, fileName, stat);
    } else if (stat.isFile()) {
      return this.processFile(filePath, fileName, stat);
    }
    return this.fileEffectFactory(filePath, fileName, stat)(new this.TypeRep(fileName, filePath, stat));
  }
}

/**
 * @param {string} dir
 * @param {FileEffectFactory} [fileEffectFactory=id]
 * @param {FileEffectFactory} [dirEffectFactory=id]
 * @param {FileInfo} [TypeRep=FileInfo]
 * @returns {Promise<any>}
 */
const dirWalk = (dir, fileEffectFactory = id, dirEffectFactory = id, TypeRep = FileInfo) => {
  const walker = new DirectoryWalker(dirEffectFactory, fileEffectFactory, TypeRep);
  return readStat(dir)
    .then(stat => {
      const dirName = path.basename(dir);
      return walker.processForkOnStat(dir, dirName, stat);
    });
};

module.exports = dirWalk;
