/**
 * Created by u067265 on 5/3/17.
 */

'use strict';

const fs = require('fs'),
    path = require('path'),
    log = console.log.bind(console),
    {pureCurry3: curry3,
        pureCurry4: curry4} = require('fjl'),
    util = require('util'),

    inspect = util.inspect.bind(util),

    // logInspection = incoming => log(inspect(incoming, 20)),

    peakOnce = incoming => {
        log('peakOnce: ', inspect(incoming, {depth: 100}));
        return incoming;
    },

    readDirectory = dir => new Promise ((resolve, reject) => {
        fs.readdir(dir, fsReadCallbackFactory(resolve, reject));
    }),

    readStat = (filePath) => new Promise ((resolve, reject) => {
        fs.stat(filePath, fsReadCallbackFactory(resolve, reject));
    }),

    fsReadCallbackFactory = (resolve, reject) => (err, result) => {
        if (!!err || err instanceof Error) {
            reject(err);
        }
        resolve(result);
    },

    fileObject = (TypeRep, fileName, filePath, stat) => {
        return {
            fileName,
            filePath
        };
    },

    dirFileObject = (TypeRep, fileName, filePath, stat) => {
        return {
            fileName,
            filePath,
            files: []
        };
    },

    processForkOnStat = curry4(((filePath, fileName, zero, stat) => stat.isDirectory() ?
        processDirectory(filePath, zero, stat, fileName) :
        processFile(filePath, zero, stat, fileName))),

    processDirectory = curry4((dirPath, zero, stat, dirName) => new Promise ((resolve, reject) => readDirectory(dirPath)
        .then(files => {
            return processFiles(dirPath, zero, files)
                .then(processedFiles => {
                    const fileObj = dirFileObject(dirName, dirPath, stat);
                    fileObj.files = processedFiles;
                    return fileObj;
                });
        })
        // .then(peakOnce)
        .then(resolve, reject))),

    processFile = curry4((filePath, zero, stat, fileName) => new Promise ((resolve, reject) => {
        if (stat.isDirectory()) {
            const fileObj = dirFileObject(fileName, filePath, stat);
            return processDirectory(filePath, fileObj, stat, fileName)
                .then(files => {
                    return fileObj.files = files;
                })
                .then(resolve, reject);
        }
        resolve(fileObject(fileName, filePath, stat));
    })),

    processFiles = curry3((dir, zero, files) => new Promise ((resolve, reject) => {
        return Promise.all(
            files.map(fileName => {
                const filePath = path.join(dir, fileName);
                return readStat(filePath)
                    .then(processForkOnStat(filePath, fileName, zero));
            })
        )
            .then(resolve, reject);
    })),

    dirToJsonFromDir = (TypeRep, filterFn, dir) => readDirectory(dir).then(processFiles(dir, {filePath: dir, fileName: path.basename(dir)})),

    dirToJsonFromFiles = (TypeRep, filterFn, files) => processFiles(Object, {}, files);

function dirToJsonRecursive (TypeRep, filterFn, dirOrFilesArray) {
    TypeRep = TypeRep || SjlFileInfo;
    return (Array.isArray(dirOrFilesArray) ?
        dirToJsonFromFiles(TypeRep, filterFn, dirOrFilesArray) :
        dirToJsonFromDir(TypeRep, filterFn, dirOrFilesArray));
        // .then(logInspection, logInspection)
}

// Inline test
dirToJsonRecursive (Object, () => {}, path.join(__dirname, '../node_modules')).then(peakOnce);

class SjlFileInfo {

    constructor (fileName, filePath, stat) {
        Object.defineProperties(this, {
            fileName: {
                value: fileName,
                enumerable: true
            },
            filePath: {
                value: filePath,
                enumerable: true
            },
            basename: {
                value: path.basename(fileName),
                enumerable: true
            },
            extension: {
                value: path.extname(fileName),
                enumerable: true
            },
            lastModified: {
                value: stat.mtime,
                enumerable: true
            },
            createdDate: {
                value: stat.birthtime,
                enumerable: true
            },
            lastChangedStatus: {
                value: stat.ctime,
                enumerable: true
            },
            lastAccessed: {
                value: stat.atime,
                enumerable: true
            },
            stat: {
                value: stat
            }
        });
    }

    //
    // static FILE_TYPE_FILE () {
    //     return 'file';
    // }
    //
    // static FILE_TYPE_DIR () {
    //     return 'dir';
    // }
    //
    // static FILE_TYPE_LINK () {
    //     return 'link';
    // }

}
