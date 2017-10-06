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
        fileName, filePath, stat),

    /**
     * Curries a functionOps based on it's defined arity (argument's arrayOps expected length).
     * @function module:functionOps_.curry
     * @param fn {Function}
     * @param argsToCurry {...*}
     * @returns {Function}
     */
    curry = (fn, ...argsToCurry) => {
        return (...args) => {
            const concatedArgs = argsToCurry.concat(args);
            return concatedArgs.length < fn.length ?
                curry.apply(null, [fn].concat(concatedArgs)) :
                fn.apply(null, concatedArgs);
        };
    };

module.exports = {
    readDirectory,
    readStat,
    fsReadCallbackFactory,
    fileObject,
    log,
    curry
};
