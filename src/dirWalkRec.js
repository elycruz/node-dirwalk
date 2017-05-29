/**
 * Created by u067265 on 5/3/17.
 */

'use strict';

const path = require('path'),

    {readDirectory, readStat} = require('./utils'),

    {pureCurry4: curry4,
        pureCurry5: curry5} = require('fjl'),

    processForkOnStat = curry5((filePath, fileName, dirEffectFactory, fileEffectFactory, stat) => {
        if (stat.isDirectory()) {
            return processDirectory(filePath, stat, dirEffectFactory, fileEffectFactory, fileName);
        }
        else if (stat.isFile()) {
            return processFile(filePath, stat, dirEffectFactory, fileEffectFactory, fileName);
        }
        return fileEffectFactory(filePath, stat, fileName)();
    }),

    processDirectory = curry4((dirPath, stat, dirEffectFactory, fileEffectFactory, dirName) => new Promise ((resolve, reject) => {
        readDirectory(dirPath)
            .then(files => {
                return processFiles(dirPath, dirEffectFactory, fileEffectFactory, files)
                    .then(dirEffectFactory(dirPath, stat, dirName));
            })
            .then(resolve, reject)
    })),

    processFile = curry4((filePath, stat,  dirEffectFactory, fileEffectFactory, fileName) => new Promise ((resolve, reject) => {
        if (!stat.isDirectory()) {
            resolve(fileEffectFactory(filePath, stat, fileName)());
        }
        processDirectory(filePath, stat, dirEffectFactory, fileEffectFactory, fileName)
            .then(resolve, reject);
    })),

    processFiles = curry4((dir, dirEffectFactory, fileEffectFactory, files) => new Promise ((resolve, reject) => {
        return Promise.all(
            files.map(fileName => {
                const filePath = path.join(dir, fileName);
                return readStat(filePath)
                    .then(processForkOnStat(filePath, fileName, dirEffectFactory, fileEffectFactory));
            })
        )
            .then(resolve, reject);
    })),

    dirWalkRec = (dirEffectFactory, fileEffectFactory, dir) => {
        return readStat(dir)
            .then(stat => {
                const dirName = path.basename(dir);
                return processForkOnStat(dir, dirName, dirEffectFactory, fileEffectFactory, stat);
            });
    };

// Export utilities
Object.defineProperties(dirWalkRec, {
    processFile: {value: processFile, enumerable: true},
    processFiles: {value: processFiles, enumerable: true},
    processDirectory: {value: processDirectory, enumerable: true},
    processForkOnStat: {value: processForkOnStat, enumerable: true}
});

module.exports = dirWalkRec;
