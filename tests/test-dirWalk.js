/**
 * Created by elyde on 5/28/2017.
 */

'use strict';

const path = require('path'),
    log = console.log.bind(console),
    dirWalk = require('../src/dirWalk');

// Recursively walk directory
dirWalk (

    // Use default `TypeRep`
    null,

    // Directory effect factory
    (dirPath, stat, dirName) => fileInfoObj => fileInfoObj,

    // File effect factory
    (filePath, stat, fileName) => fileInfoObj => fileInfoObj,

    // Dir to walk
    path.join(__dirname, '/../')
)
    // Pretty print compiled
    .then(obj => JSON.stringify(obj, null, 4))

    // Log result or catch
    .then(log, log);
