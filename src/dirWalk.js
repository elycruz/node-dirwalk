/**
 * Created by elyde on 6/15/2017.
 */

'use strict';

const path = require('path'),

    {readDirectory, readStat} = require('./utils'),

    {curry} = require('fjl'),

    SjlFileInfo = require('./SjlFileInfo'),

    processForkOnStat = curry((TypeRep, filePath, fileName, dirEffectFactory, fileEffectFactory, stat) => {
        if (stat.isDirectory()) {
            return processDirectory(TypeRep, filePath, stat, dirEffectFactory, fileEffectFactory, fileName);
        }
        else if (stat.isFile()) {
            return processFile(TypeRep, filePath, stat, dirEffectFactory, fileEffectFactory, fileName);
        }
        return fileEffectFactory(filePath, stat, fileName)(new TypeRep(fileName, filePath, stat));
    }),

    processDirectory = curry((TypeRep, dirPath, stat, dirEffectFactory, fileEffectFactory, dirName) => new Promise ((resolve, reject) => {
        readDirectory(dirPath)
            .then(files => {
                return processFiles(TypeRep, dirPath, dirEffectFactory, fileEffectFactory, files)
                    .then(files => dirEffectFactory(dirPath, stat, dirName)(new TypeRep(dirName, dirPath, stat, files), files));
            })
            .then(resolve, reject)
    })),

    processFile = curry((TypeRep, filePath, stat,  dirEffectFactory, fileEffectFactory, fileName) => new Promise ((resolve, reject) => {
        if (!stat.isDirectory()) {
            resolve(fileEffectFactory(filePath, stat, fileName)(new TypeRep(fileName, filePath, stat)));
        }
        processDirectory(TypeRep, filePath, stat, dirEffectFactory, fileEffectFactory, fileName)
            .then(resolve, reject);
    })),

    processFiles = curry((TypeRep, dir, dirEffectFactory, fileEffectFactory, files) => new Promise ((resolve, reject) => {
        return Promise.all(
            files.map(fileName => {
                const filePath = path.join(dir, fileName);
                return readStat(filePath)
                    .then(processForkOnStat(TypeRep, filePath, fileName, dirEffectFactory, fileEffectFactory));
            })
        )
            .then(resolve, reject);
    })),

    dirWalk = (TypeRep, dirEffectFactory, fileEffectFactory, dir) => {
        TypeRep = TypeRep || SjlFileInfo;
        return readStat(dir)
            .then(stat => {
                const dirName = path.basename(dir);
                return processForkOnStat(TypeRep, dir, dirName, dirEffectFactory, fileEffectFactory, stat);
            });
    };

module.exports = dirWalk;
