/**
 * @memberOf node-dirwalk
 * @module dirWalkToTree
 */

const dirWalk = require('./dirWalk'),

  {FileInfo} = require("../index"),

  /**
   * Walks directories and constructs file and directory objects from type constructor for each encountered item.
   * @param {string} dir - Dir to walk.
   * @param {FileInfo} [TypeRep=FileInfo] - Type constructor - Optional.
   * @return {Promise<Object>} - An object representing a directory tree.
   */
  dirWalkToTree = (dir, TypeRep = FileInfo) => dirWalk(
    dir,
    {TypeRep},
  );

module.exports = dirWalkToTree;
