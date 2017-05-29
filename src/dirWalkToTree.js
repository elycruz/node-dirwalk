/**
 * Created by u067265 on 5/3/17.
 */

'use strict';

const path = require('path'),

    SjlFileInfo = require('./SjlFileInfo'),

    {dirWalk} = require('./dirWalk'),

    defaultFileEffectFactory = TypeRep => (filePath, stat, fileName) => (files) => {
        return new TypeRep(fileName, filePath, stat, files);
    },

    /**
     * Walks directories and constructs file and directory objects from type constructor.
     * @param TypeRep {Function} - Type constructor.
     * @param fileEffectFactory {Function<filePath, stat, fileName>}
     * @param dir {String} - Dir to walk.
     * @return {Promise<Object>}
     */
    dirWalkToTree = (TypeRep, fileEffectFactory, dir) => {
        TypeRep = TypeRep || SjlFileInfo;

        fileEffectFactory = fileEffectFactory || defaultFileEffectFactory(TypeRep);

        // Recursively walk directory
        return dirWalk (
            fileEffectFactory,
            fileEffectFactory,
            dir // dir to walk
        );
    };

module.exports = dirWalkToTree;
