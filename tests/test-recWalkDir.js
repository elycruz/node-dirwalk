/**
 * Created by elyde on 5/28/2017.
 */

'use strict';

const path = require('path'),
    {log} = require('../src/utils'),
    dirRecWalk = require('../src/recWalkDir');

// Recursively walk directory
dirRecWalk (
        // Directory effect factory
        (dirPath, stat, dirName) => (files) => {
            // console.log(filePath);
            return {dirName, dirPath, files};
        },

        // File effect factory
        (filePath, stat, fileName) => () => {
            // console.log(filePath);
            return {fileName, filePath};
        },

        // Dir to walk
        path.join(__dirname, '/../')
    )
    .then(obj => JSON.stringify(obj, null, 4)) // pretty printed
    .then(log)
    .catch(log);
