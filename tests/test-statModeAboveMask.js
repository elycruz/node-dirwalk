/**
 * Created by elyde on 5/28/2017.
 */

'use strict';

const path = require('path'),
    {peakOnce, readStat, log} = require('./../src/utils'),
    statModeAboveMask = require('../src/statModeAboveMask');

readStat('./README.md')
    .then(stat => {
        return Promise.resolve(statModeAboveMask(stat.mode, 4)); // read
    })
    .then(log);

// Great solution from Grabriel Llammas (cleaned it up to make it more readable):
//
// ```
// const readStat = filePath => new Promise((resolve, reject) => {
//         fs.lstat(filePath, fsReadCallbackFactory(resolve, reject));
//     }),
//
//     fsReadCallbackFactory = (resolve, reject) => (err, result) => {
//         if (!!err || err instanceof Error) {
//             reject(err);
//         }
//         resolve(result);
//     },
//
// checkPermission = (file, mask, cb) => {
//     fs.stat (file, function (error, stats){
//         if (error){
//             cb (error, false);
//         } else {
//             cb (null, !!(mask & parseInt ((stats.mode & parseInt ("777", 8)).toString (8)[0])));
//         }
//     });
// };
//
// canExecute():
//
// checkPermission (<path>, 1, cb);
// canRead():
//
// checkPermission (<path>, 4, cb);
// canWrite():
//
// checkPermission (<path>, 2, cb);