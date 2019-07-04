const fs = require('fs');

/**
 * Controller class for the CRUD operations
 */
class Controller {
    constructor({collection}) {
        this.collection = collection;
        this.counter = 0;
        this.data = null;

        this._getCollection()
            .then(({counter, data}) => {
                this.counter = counter;
                this.data = data;
            })
            .catch(err => console.error(err));
    }

    async _getCollection () {
        return require(this.collection);
    }

    _sanitize (data) {
        return ['id', 'created', 'updated']
            .reduce((t, k) => Object.assign(t, {[`${k}`]: data[k]}), {})
    }

    _isEmpty (data) {
        if(!data) throw new Error(`Invalid data: ${data}`);
        if(Array.isArray(data) || typeof data === 'string')
            return data.length === 0;
        return Object.keys(data).length === 0;
    }

    _pick (data, keys = []) {
        function pick (obj) {
            return keys.reduce((t, k) => Object.assign(t, {[`${k}`]: obj[k]}), {})
        }
        if(Array.isArray(data)) return data.map(obj => pick(obj));
        return pick(data);
    }

    async _findIndex (id) {
        if(!id) throw new Error(`Invalid id: ${id}`);

        let index = this.data.findIndex(i => i.id === id);

        if(!index <= -1) throw new Error(`Item not found id: ${id}`);
        return index;
    }

    async _find (id, keys) {
        if(!id) throw new Error(`Invalid id: ${id}`);

        let item = this.data.find(i => i.id === id);

        if(!item) throw new Error(`Item not found id: ${id}`);
        return keys ? this._pick(item, keys) : item;
    }

    async _add (data) {
        if(!data) throw new Error(`Data is required: ${data}`);

        if(!data.id) data.id = ++this.counter;
        if(!data.created) data.created = new Date();

        this.data.push(data);
        await this._save();
        return data;
    }

    async _save (data) {
        data = data ? data : {counter: this.counter, data: this.data};

        return new Promise((resolve, reject) => {
            fs.writeFile(this.collection, JSON.stringify(data), err => {
                if(err) return reject(err);
                resolve(data);
            });
        });
    }

    async _update (id, update) {
        if(!id) throw new Error(`Invalid id`);
        if(!update || this._isEmpty(update))
            throw new Error(`Invalid update data`);

        let item = await this._find(id);

        Object.assign(item, this._sanitize(update));
        return this._save();
    }

    async _remove (id) {
        if(!id) throw new Error(`Invalid id: ${id}`);

        let index = await this._findIndex(id);

        this.data = this.data.splice(index, 1);
        await this._save();
        return true;
    }
}

module.exports = Controller;