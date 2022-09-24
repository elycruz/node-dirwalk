/**
 * Created by elyde on 5/28/2017.
 */

'use strict';

const path = require('path'),
    {log} = require('../src/utils'),
    dirWalkToTree = require('../src/dirWalkToTree');

dirWalkToTree (path.join(__dirname, '/../'))
    .then(obj => JSON.stringify(obj, null, 4))
    .then(log, log);
