/**
 * Created by u067265 on 5/3/17.
 */

'use strict';

const fs = require('fs'),
    path = require('path'),
    log = console.log.bind(console),
    {pureCurry3: curry3,
        pureCurry4: curry4} = require('fjl'),

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

    processForkOnStat = curry4(((filePath, fileName, zero, stat) => stat.isDirectory() ?
        processDirectory(filePath, zero, fileName) :
        processFile(filePath, zero, fileName))),

    processDirectory = curry3((dirPath, zero, dirName) => new Promise ((resolve, reject) => readDirectory(dirPath)
        .then(processFiles(dirPath, zero))
        .then(resolve)
        .catch(reject))),

    processFile = curry3((filePath, zero, fileName) => new Promise ((resolve, reject) => readStat(filePath)
        .then(stat => {
            const fileObj = {};
            if (stat.isDirectory()) {
                fileObj.files = [];
                Object.assign(fileObj, stat);
                processDirectory(filePath, fileObj)
            }
        })
        .then(resolve)
        .catch(reject))),

    processFiles = curry3((dir, zero, files) => new Promise ((resolve, reject) => {
        Promise.all(
            files.map(fileName => processFile(path.join(dir, fileName), zero, fileName))
        )
            .then(resolve)
            .catch(reject);
    })),

    dirToJsonFromDir = (TypeRep, filterFn, dir) => readDirectory(dir).then(processFiles(dir, {})).then(log),

    dirToJsonFromFiles = (TypeRep, filterFn, files) => processFiles(Object, {}, files);

function dirToJson (TypeRep, filterFn, dirOrFilesArray) {
    return (Array.isArray(dirOrFilesArray) ?
        dirToJsonFromFiles(TypeRep, filterFn, dirOrFilesArray) :
        dirToJsonFromDir(TypeRep, filterFn, dirOrFilesArray))
        .then(log, log)
}

log(dirToJson(Object, () => {}, path.join(__dirname, '../node_modules')));

class SjlFileInfo {

    constructor (stat) {

        let _fileName,
            _filePath,
            _files,
            _lastChangedStatus,
            _lastModified,
            _createdDate,
            _lastAccessed;

        Object.defineProperties(this, {
            fileName: {
                get: function () {
                    return _fileName;
                },
                set: function (value) {
                    _fileName = value;
                },
                enumerable: true
            },
            filePath: {
                get: function () {
                    return _filePath;
                },
                set: function (value) {
                    _filePath = value;
                },
                enumerable: true
            },
            basename: {
                get: function () {
                    return _basename;
                },
                set: function (value) {
                    _basename = value;
                },
                enumerable: true
            },
            extension: {
                get: function () {
                    return _extension;
                },
                set: function (value) {
                    _extension = value;
                },
                enumerable: true
            },
            lastModified: {
                get: function () {
                    return _lastModified;
                },
                set: function (value) {
                    _lastModified = value;
                },
                enumerable: true
            },
            createdDate: {
                get: function () {
                    return _createdDate;
                },
                set: function (value) {
                    _createdDate = value;
                },
                enumerable: true
            },
            lastChangedStatus: {
                get: function () {
                    return _lastChangedStatus;
                },
                set: function (value) {
                    _lastChangedStatus = value;
                },
                enumerable: true
            },
            lastAccessed: {
                get: function () {
                    return _lastAccessed;
                },
                set: function (value) {
                    _lastAccessed = value;
                },
                enumerable: true
            },
            files: {
                get: function () {
                    return _files;
                },
                set: function (value) {
                    _files = value;
                },
                enumerable: true
            },
        });

    }

}

