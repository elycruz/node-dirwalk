/**
 * Created by elyde on 5/28/2017.
 */

'use strict';

const path = require('path'),
    {log} = require('../src/utils'),
    dirWalkToTree = require('../src/dirWalkToTree');

// Get tree structure
dirWalkToTree (null, path.join(__dirname, '/../'))
    // .then(obj => JSON.stringify(obj, null, 4)) // pretty printed
    .then(JSON.stringify)
    .then(log, log);
