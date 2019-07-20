const fs = require('fs').promises;

const Mongo = require('./mongo');
const Utils = require('./utils');

const CONFIG = {
    collection: '',
    keys: []
};

/**
 * Controller class for the CRUD operations
 */
class Controller {
    constructor(config = CONFIG) {
        this.db = new Mongo();

        this.keys = config.keys;
        this.collectionName = config.collection;
        this._collection = null;
    }

    get collection () {
        if(this._collection) return Promise.resolve(this._collection);
        return this.db.getCollection(this.collectionName)
            .then(collection => this._collection = collection);
    }

    async _find (query = {}, options = {}) {
        options = this._getOptions(options);
        let col = await this.collection;
        let cursor = col.find(query);

        if(options.project) cursor.project(options.project)
        if(options.skip) cursor.skip(options.skip);
        if(options.limit) cursor.limit(options.limit);
        if(options.filter) cursor.filter(options.filter);
        if(options.sort) cursor.sort(options.sort);

        return cursor.toArray();
    }

    async _findOne (query) {
        if(Utils.isEmpty(query)) return Promise.reject(new Error(`Empty query or id`));
        if(Utils.isId(query)) query = {_id: query};

        let col = await this.collection;
        return col.findOne(query);
    }

    async _insertOne (data) {
        if(Utils.isEmpty(data)) throw new Error(`Empty data`);

        let col = await this.collection;
        return col.insertOne(data)
            .then(results => results.ops.length ===1 ? results.ops[0] : results.ops);
    }

    async _update (query, update, options = null) {
        if(Utils.isEmpty(query)) throw new Error(`Empty query`);
        if(Utils.isEmpty(update)) throw new Error(`Empty update`);

        let col = await this.collection;
        return col.update(query, update, options);
    }

    async _remove (query) {
        if(Utils.isEmpty(query)) throw new Error(`Empty query`);

        let col = await this.collection;
        return col.remove(data);
    }

    _getOptions(query = {}) {
        let options = {};

        if(query && query.sort) options.sort = [[query.sort, 1]];
        if(query && query.page) options.skip = query.page;
        if(query && query.itemPerPage) options.limit = query.itemPerPage;

        if(this.keys) options.project = this.keys
            .reduce((t, k) => Object.assign(t, {[`${k}`]: 1}), {});

        return options;
    }
}

module.exports = Controller;