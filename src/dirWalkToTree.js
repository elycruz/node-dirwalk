/**
 * @memberOf node-dirwalk
 * @module dirWalkToTree
 */

const dirWalk = require('./dirWalk'),

  {FileInfo} = require("../index"),

  id = x => x,

  /**
   * Walks directories and constructs file and directory objects from type constructor for each encountered item.
   * @param dir {String} - Dir to walk.
   * @param [TypeRep=FileInfo] - Type constructor - Optional.
   * @return {Promise<Object>} - An object representing a directory tree.
   */
  dirWalkToTree = (dir, TypeRep = FileInfo) => dirWalk(
    dir,
    () => id, // Return resulting `FileInfo` object, as is
    () => id, // ""
    TypeRep,
  );

module.exports = dirWalkToTree;
