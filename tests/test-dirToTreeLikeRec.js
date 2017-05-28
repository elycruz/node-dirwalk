/**
 * Created by elyde on 5/28/2017.
 */

'use strict';

const fs = require('fs'),
    path = require('path'),
    {pureCurry2: curry2} = require('fjl'),
    dirToTreeLikeRec = require('../src/dirToTreeLikeRec'),
    {log} = require('../src/utils');

// Get tree structure
dirToTreeLikeRec (null, path.join(__dirname, '/../'))
    .then(obj => JSON.stringify(obj, null, 4)) // pretty printed
    // .then(JSON.stringify)
    .then(log);


