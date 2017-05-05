/**
 * Created by u067265 on 5/3/17.
 */

'use strict';

const fs = require('fs'),
    path = require('path'),

    {pureCurry5: curry5,
        pureCurry4: curry4} = require('fjl'),

    util = require('util'),
    inspect = util.inspect.bind(util),
    log = console.log.bind(console),

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

    fileObject = (TypeRep, fileName, filePath, stat) => new TypeRep(
        fileName, filePath, stat),

    processForkOnStat = curry5(((filePath, fileName, zero, TypeRep, stat) => stat.isDirectory() ?
        processDirectory(filePath, zero, TypeRep, stat, fileName) :
        processFile(filePath, zero, TypeRep, stat, fileName))),

    processDirectory = curry5((dirPath, zero, TypeRep, stat, dirName) => new Promise ((resolve, reject) => readDirectory(dirPath)
        .then(files => {
            return processFiles(dirPath, zero, TypeRep, files)
                .then(processedFiles => {
                    const fileObj = fileObject(TypeRep, dirName, dirPath, stat);
                    fileObj.files = processedFiles;
                    return fileObj;
                });
        })
        // .then(peakOnce)
        .then(resolve, reject))),

    processFile = curry5((filePath, zero, TypeRep, stat, fileName) => new Promise ((resolve, reject) => {
        if (stat.isDirectory()) {
            const fileObj = fileObject(TypeRep, fileName, filePath, stat);
            return processDirectory(filePath, fileObj, TypeRep, stat, fileName)
                .then(files => {
                    return fileObj.files = files;
                })
                .then(resolve, reject);
        }
        resolve(fileObject(TypeRep, fileName, filePath, stat));
    })),

    processFiles = curry4((dir, zero, TypeRep, files) => new Promise ((resolve, reject) => {
        return Promise.all(
            files.map(fileName => {
                const filePath = path.join(dir, fileName);
                return readStat(filePath)
                    .then(processForkOnStat(filePath, fileName, zero, TypeRep));
            })
        )
            .then(resolve, reject);
    })),

    dirToJson = (TypeRep, zero, dir) => {
        zero = zero || {};
        zero.filePath = dir;
        zero.fileName = path.basename(dir);
        return readDirectory(dir).then(processFiles(dir, zero, TypeRep));
    };

function dirToJsonRecursive (TypeRep, zero, dir) {
    TypeRep = TypeRep || SjlFileInfo;
    return dirToJson(TypeRep, zero, dir);
}

function SjlFileInfo (fileName, filePath, stat) {
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

    // `files` property if is directory
    // if (stat.isDirectory()) {
    //     Object.defineProperty(this, 'files', {
    //         value: [], enumerable: true
    //     });
    // }
}

// Inline test
dirToJsonRecursive (SjlFileInfo, null, path.join(__dirname, '../node_modules')).then(peakOnce);
