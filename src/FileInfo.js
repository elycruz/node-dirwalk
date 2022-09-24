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

/**
 * Simple file info class - Provides a basic representation of a FileObject;
 *
 * **Note:** This data class doesn't contain a `type` property - if a different JSON representation,
 * other than the one provided via this class, is required this class can be extended with required repr.
 * or in the `dirWalk`/`dirWalkToTree` method 'effect' methods you can query the `isFile()`/`isDirectory()`
 * methods to know if the visited directory tree entry is a file, and/or directory, or not (this approach
 * can be used to add required properties to resulting tree entry object to return (from `dirWalk`, `dirWalkToTree`).
 */
class FileInfo {
  static of(filePath, fileName, stat, files) {
    return new FileInfo(filePath, fileName, stat, files);
  }

  constructor(filePath, fileName, stat, files) {
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
      Object.defineProperties(this, {
        files: {
          value: files,
          enumerable: true
        }
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

module.exports = {FileInfo};
