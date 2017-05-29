/**
 * Created by elyde on 5/28/2017.
 */

'use strict';

const path = require('path'),
    {readStat, log} = require('./../src/utils'),
    {statModeAboveMask} = require('../src/SjlFileInfo');

readStat('./README.md')
    .then(stat => {
        return Promise.resolve(statModeAboveMask(stat.mode, 4)); // read
    })
    .then(log);
