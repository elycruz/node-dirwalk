/**
 * Created by elyde on 5/28/2017.
 */

'use strict';

function statModeAboveMask (mode, mask) {
    return !!(mask & parseInt ((mode & 0o777).toString (8)[0], 10));
}

module.exports = statModeAboveMask;
