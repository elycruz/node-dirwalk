/**
 * Test output of `dirWalkToTree` method.
 */

const path = require('path'),
    {log, error} = console,
    dirWalkToTree = require('../src/dirWalkToTree');

dirWalkToTree (path.join(__dirname, '/../'))
    .then(obj => JSON.stringify(obj, null, 4))
    .then(log, error);
