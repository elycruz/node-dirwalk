/**
 * Created by u067265 on 5/3/17.
 */

'use strict';

const path = require('path'),

    SjlFileInfo = require('./SjlFileInfo'),

    dirWalkRec = require('./dirWalkRec'),

    defaultDirEffectFactory = TypeRep => (dirPath, stat, dirName) => (files) => new TypeRep(
        dirName, dirPath, stat, files
    ),

    defaultFileEffectFactory = TypeRep => (filePath, stat, fileName) => () => {
        return new TypeRep(fileName, filePath, stat);
    },

    /**
     * Walks directories and constructs file and directory objects from type constructor.
     * @param TypeRep {Function} - Type constructor.
     * @param dir {String} - Dir to walk.
     * @return {Promise<*>}
     */
    dirWalkToTree = (TypeRep, dir) => {
        TypeRep = TypeRep || SjlFileInfo;

        // Recursively walk directory
        return dirWalkRec (
            defaultDirEffectFactory(TypeRep),
            defaultFileEffectFactory(TypeRep),
            dir // dir to walk
        );
    };

module.exports = dirWalkToTree;
