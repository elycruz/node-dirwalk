/**
 * @module node-dirwalk
 */

'use strict';

const FileInfo = require('./src/FileInfo'),
    dirWalkToTree = require('./src/dirWalkToTree'),
    dirWalk = require('./src/dirWalk');

module.exports = {
    FileInfo,
    dirWalkToTree,
    dirWalk
};
