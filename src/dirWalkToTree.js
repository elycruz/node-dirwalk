/**
 * Created by u067265 on 5/3/17.
 */

'use strict';

const path = require('path'),

    SjlFileInfo = require('./SjlFileInfo'),

    dirWalk = require('./dirWalk'),

    id = x => x,

    /**
     * Walks directories and constructs file and directory objects from type constructor for each encountered item.
     * @param TypeRep {Function} - Type constructor.
     * @param dir {String} - Dir to walk.
     * @return {Promise<Object>}
     */
    dirWalkToTree = (TypeRep, dir) => dirWalk (
        TypeRep,
        (filePath, stat, fileName) => id,
        (filePath, stat, fileName) => id,
        dir // dir to walk
    );

module.exports = dirWalkToTree;
