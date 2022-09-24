/**
 * FileInfo.js
 */

const path = require('path'),

  FileInfoMethodNames = [
    'isSymbolicLink', 'isFile', 'isDirectory',
    'isBlockDevice', 'isCharacterDevice', 'isFIFO',
    'isSocket'
  ],

  statModeAboveMask = (mode, mask) => {
    return !!(mask & parseInt((mode & 0o777).toString(8)[0], 10));
  },

  isReadable = statMode => statModeAboveMask(statMode, 4),

  isExecutable = statMode => statModeAboveMask(statMode, 1),

  isWritable = statMode => statModeAboveMask(statMode, 2);

class FileInfo {
  constructor(fileName, filePath, stat, files) {
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

    if (files) {
      Object.defineProperty(this, 'files', {
        value: files,
        enumerable: true
      });
    }
  }

  isExecutable() {
    return isExecutable(this.stat.mode);
  }

  isReadable() {
    return isReadable(this.stat.mode);
  }

  isWritable() {
    return isWritable(this.stat.mode);
  }
}

// Proxy stat instance methods
FileInfoMethodNames.forEach(key => {
  FileInfo.prototype[key] = function () {
    return this.stat[key]();
  };
});

Object.defineProperty(FileInfo, 'statModeAboveMask',
  {value: statModeAboveMask, enumerable: true});

module.exports = FileInfo;
