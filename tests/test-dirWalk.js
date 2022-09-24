/**
 * test-dirWalk.js
 */
const path = require('path'),
  fs = require('fs'),
  {log, error} = console,

  dirWalk = require('../src/dirWalk'),

  {FileInfo} = require("../index");

// Recursively walk directory
dirWalk(
  // Dir to walk
  path.join(__dirname, '/../'),
  {
    // File effect
    fileHandler: FileInfo.of,

    // Directory effect
    dirHandler: (dirPath, dirName, stat, files) =>
      dirName[0] === '.' ? null : FileInfo.of(dirPath, dirName, stat, files) // Ignore dot directories ('./.git', etc.).
  },
)
  // Pretty print compiled
  .then(obj => JSON.stringify(obj, null, 4))

  // Log result or catch
  .then(log, error);
