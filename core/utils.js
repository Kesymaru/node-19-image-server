const ObjectId = require('mongodb').ObjectId;

class Utils {
    static sanitize (data, keys) {
        if(Utils.isEmpty(keys)) return data;
        return keys
            .reduce((t, k) => Object.assign(t, {[`${k}`]: data[k]}), {});
    }

    static isEmpty (data) {
        if(!data) throw new Error(`Invalid data: ${data}`);
        if(Array.isArray(data) || typeof data === 'string')
            return data.length === 0;
        return Object.keys(data).length === 0;
    }

    static isId (id) {
        return typeof id === 'string' && ObjectId.isValid(id);
    }

    static pick (data, keys = []) {
        const pick = d => keys.reduce((t, k) => Object.assign(t, {[`${k}`]: d[k]}), {});
        if(Array.isArray(data)) return data.map(pick);
        return pick(data);
    }
}

module.exports = Utils;