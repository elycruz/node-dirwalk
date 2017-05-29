/**
 * Created by u067265 on 5/3/17.
 */

'use strict';

const path = require('path'),

    SjlFileInfo = require('./SjlFileInfo'),

    {readDirectory, readStat, fileObject, log} = require('./utils'),

    {pureCurry3: curry3,
        pureCurry4: curry4} = require('fjl'),

    defaultDirectoryEffectFactory = (dirPath, TypeRep, stat, dirName) => processedFiles => {
        const fileObj = fileObject(TypeRep, dirName, dirPath, stat);
        fileObj.files = processedFiles;
        return fileObj;
    },

    defaultFileEffectFactory = (filePath, TypeRep, stat, fileName, state) => () => fileObject(TypeRep, fileName, filePath, stat),

    processForkOnStat = curry4((filePath, fileName, TypeRep, stat) => {
        if (stat.isDirectory()) {
            return processDirectory(filePath, TypeRep, stat, fileName);
        }
        else if (stat.isFile()) {
            return processFile(filePath, TypeRep, stat, fileName);
        }
        return Promise.resolve(fileObject(TypeRep, fileName, filePath, stat));
    }),

    processDirectory = curry4((dirPath, TypeRep, stat, dirName) => new Promise ((resolve, reject) => {
        readDirectory(dirPath)
            .then(files => {
                return processFiles(dirPath, TypeRep, files)
                    .then(defaultDirectoryEffectFactory(dirPath, TypeRep, stat, dirName));
            })
            // .then(peakOnce)
            .then(resolve, reject)
    })),

    processFile = curry4((filePath, TypeRep, stat, fileName) => new Promise ((resolve, reject) => {
        if (!stat.isDirectory()) {
            resolve(defaultFileEffectFactory(filePath, TypeRep, stat, fileName)());
        }
        processDirectory(filePath, TypeRep, stat, fileName)
            .then(resolve, reject);
    })),

    processFiles = curry3((dir, TypeRep, files) => new Promise ((resolve, reject) => {
        return Promise.all(
            files.map(fileName => {
                const filePath = path.join(dir, fileName);
                return readStat(filePath)
                    .then(processForkOnStat(filePath, fileName, TypeRep));
            })
        )
            .then(resolve, reject);
    }));

/**
 * Returns a tree like object representing the passed in directory.
 * @param [TypeRep=SjlFileInfo] {null|undefined|Function<fileName, filePath, stat>} - Type constructor for file and directory
 *  object (essentially file object constructor).  Optional.  Default `SjlFileInfo`.
 * @param dir {String} - Directory to parse.
 * @returns {Promise<*>} - Promise of any.
 */
function dirToTreeLikeRec (TypeRep, dir) {
    TypeRep = TypeRep || SjlFileInfo;
    return readStat(dir)
        .then(stat => {
            const dirName = path.basename(dir);
            return processForkOnStat(dir, dirName, TypeRep, stat);
        });
}

// Export utilities
Object.defineProperties(dirToTreeLikeRec, {
    SjlFileInfo: {value: SjlFileInfo, enumerable: true},
    processFile: {value: processFile, enumerable: true},
    processFiles: {value: processFiles, enumerable: true},
    processDirectory: {value: processDirectory, enumerable: true},
    processForkOnStat: {value: processForkOnStat, enumerable: true},
    readDirectory: {value: readDirectory, enumerable: true},
    readStat: {value: readStat, enumerable: true},
    fileObject: {value: fileObject, enumerable: true}
});

module.exports = dirToTreeLikeRec;
