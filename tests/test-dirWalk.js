/**
 * Created by elyde on 5/28/2017.
 */

'use strict';

const path = require('path'),
  {log, error} = console,
  {assert} = require('util'),
  dirWalk = require('../src/dirWalk');

// Recursively walk directory
dirWalk(
  // Dir to walk
  path.join(__dirname, '/../'),

  // File effect factory
  (filePath,  fileName, stat) => fileInfoObj => fileInfoObj,

  // Directory effect factory
  (dirPath,dirName, stat) => fileInfoObj =>
    (fileInfoObj.fileName || '')[0] === '.' ? null : fileInfoObj, // Ignore dot directories ('./.git', etc.).
)
  // Pretty print compiled
  .then(obj => JSON.stringify(obj, null, 4))

  // Log result or catch
  .then(log, log);
