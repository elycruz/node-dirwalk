/**
 * Created by elydelacruz on 5/6/2017.
 */
'use strict';
const {isUndefined} = require('fjl');

class Traversable {

    constructor(values) {
        if (!isUndefined(values)) {
            this.value = values;
        }
    }

    static of (values) {
        return new Traversable(values);
    }

    map (fn) {
        return new this.constructor(fn(this.value));
    }

    reduce (fn, zero) {
        let value = this.value,
            valueLen = value.length - 1,
            aggregated = zero,
            ind = 0;
        while (ind < valueLen) {
            aggregated = fn(aggregated, value[ind]);
            ind += 1;
        }
        return aggregated;
    }

    traverse (TypeRep, fn) {
        return this.reduce(fn, TypeRep.of());
    }
}


