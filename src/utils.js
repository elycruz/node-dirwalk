/**
 * Created by elyde on 5/6/2017.
 */

'use strict';

const fs = require('fs'),

    util = require('util'),
    inspect = util.inspect.bind(util),
    log = console.log.bind(console),

    peakOnce = incoming => {
        log('peakOnce: ', inspect(incoming, {depth: 100}));
        return Promise.resolve(incoming);
    },

    readDirectory = dir => new Promise((resolve, reject) => {
        fs.readdir(dir, fsReadCallbackFactory(resolve, reject));
    }),

    readStat = (filePath) => new Promise((resolve, reject) => {
        fs.lstat(filePath, fsReadCallbackFactory(resolve, reject));
    }),

    fsReadCallbackFactory = (resolve, reject) => (err, result) => {
        if (!!err || err instanceof Error) {
            reject(err);
        }
        resolve(result);
    },

    fileObject = (TypeRep, fileName, filePath, stat) => new TypeRep(
        fileName, filePath, stat);

module.exports = {
    readDirectory,
    readStat,
    fsReadCallbackFactory,
    fileObject,
    log
};
