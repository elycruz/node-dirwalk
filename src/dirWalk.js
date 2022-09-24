/**
 * dirWalk.js
 */

const path = require('path'),

    {readDirectory, readStat} = require('./utils'),

    SjlFileInfo = require('./SjlFileInfo');

/**
 * @class DirectoryWalker
 */
class DirectoryWalker {
    /**
     * @type {SjlFileInfo}
     */
    TypeRep = SjlFileInfo;

    /**
     * @param {string} dirPath
     * @param {string} dirName
     * @param {fs.Stats} stat
     * @returns {(SjlFileInfo) => Promise<string>}
     */
    dirEffectFactory = (dirPath, dirName, stat) => (fileInfo) => Promise.resolve();

    /**
     * @param {string} filePath
     * @param {string} fileName
     * @param {fs.Stats} stat
     * @returns {(SjlFileInfo) => Promise<string>}
     */
    fileEffectFactory = (filePath, fileName, stat) => (fileInfo) => Promise.resolve();

    /**
     * @param {(string, string, fs.Stats) => (string) => Promise<string>} dirEffectFactory
     * @param {(string, string, fs.Stats) => (string) => Promise<string>} fileEffectFactory
     */
    constructor(dirEffectFactory, fileEffectFactory, TypeRep = SjlFileInfo) {
        this.dirEffectFactory = dirEffectFactory;
        this.fileEffectFactory = fileEffectFactory;
        this.TypeRep = TypeRep;
    }

    /**
     * @param {string} dirPath
     * @param {string} dirName
     * @param {fs.Stats} stat
     * @returns {Promise<string>}
     */
    processDirectory(dirPath, dirName, stat) {
        const {dirEffectFactory, TypeRep} = this;
        return readDirectory(dirPath)
            .then(files => this.processFiles(dirPath, files).then(() => files))
            .then(files => dirEffectFactory(dirPath, dirName, stat)(
                new TypeRep(dirName, dirPath, stat, files), files)
            );
    }

    /**
     * @param {string} filePath
     * @param {string} fileName
     * @param {fs.Stats} stat
     * @returns {Promise<string>}
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
     * @returns {Promise<string>}
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
                .then(resolve, reject);
        })
    }

    /**
     * @param {string} filePath
     * @param {string} fileName
     * @param {fs.Stats} stat
     * @returns {Promise<string>|*}
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
 * @param {} fileEffectFactory
 * @param {} dirEffectFactory
 * @param {} TypeRep
 * @returns {Promise<string>}
 */
const dirWalk = (dir, fileEffectFactory, dirEffectFactory, TypeRep) => {
    const walker = new DirectoryWalker(dirEffectFactory, fileEffectFactory, TypeRep);
    return readStat(dir)
        .then(stat => {
            const dirName = path.basename(dir);
            return walker.processForkOnStat(dir, dirName, stat);
        });
};

module.exports = dirWalk;
