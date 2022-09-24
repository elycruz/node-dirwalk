/**
 * @memberOf node-dirwalk
 * @module dirWalkToTree
 */

const dirWalk = require('./dirWalk'),

  {getUnaryId} = require("./utils"),

  {FileInfo} = require("../index"),

  /**
   * Walks directories and constructs file and directory objects from type constructor for each encountered item.
   * @param dir {String} - Dir to walk.
   * @param [TypeRep=FileInfo] - Type constructor - Optional.
   * @return {Promise<Object>} - An object representing a directory tree.
   */
  dirWalkToTree = (dir, TypeRep = FileInfo) => dirWalk(
    dir,
    getUnaryId, // Return resulting `FileInfo` object, as is
    getUnaryId, // ""
    TypeRep,
  );

module.exports = dirWalkToTree;
