/**
 * Created by elyde on 5/6/2017.
 */

'use strict';

const fs = require('fs'),
    path = require('path'),

    SjlFileInfoMethodNames = [
        'isSymbolicLink', 'isFile', 'isDirectory',
        'isBlockDevice', 'isCharacterDevice', 'isFIFO',
        'isSocket'
    ],

    statModeAboveMask = require('./statModeAboveMask'),

    isReadable = stat => statModeAboveMask(statMode, 4),

    isExecutable = stat => statModeAboveMask(statMode, 1),

    isWritable = stat => statModeAboveMask(statMode, 2);

function SjlFileInfo (fileName, filePath, stat) {
    const ext = path.extname(fileName),
        basename = path.basename(fileName, ext);
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
            value: basename,
            enumerable: true
        },
        extension: {
            value: ext,
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
        lastChanged: {
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

SjlFileInfo.prototype.isExecutable = function () {
    return isExecutable(this.stat.mode);
};

SjlFileInfo.prototype.isReadable = function () {
    return isReadable(this.stat.mode);
};

SjlFileInfo.prototype.isWritable = function () {
    return isWritable(this.stat.mode);
};

SjlFileInfoMethodNames.forEach(key => {
    SjlFileInfo.prototype[key] = function () {
        return this.stat[key]();
    };
});

module.exports = SjlFileInfo;
