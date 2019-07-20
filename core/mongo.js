const MongoClient = require('mongodb').MongoClient;

const Config = require('../config');

let instance = null;
class Mongo {
    constructor (config = Config.mongo) {
        if(instance) return instance;
        if(!config) throw new Error('Invalid mongodb connection config');

        this._connection = null;
        this.url = config.url;
        this.dbName = config.db;
        this._client = null;
        this._db = null;

        // Connect to the db
        this._connect();
        return instance = this;
    }

    _connect () {
        if(this._connection) return this._connection;
        return this._connection = new Promise((resolve, reject) => {
            MongoClient.connect(this.url, (err, client) => {
                if(err) return reject(err);

                this._client = client;
                this._db = client.db(this.dbName);
                console.log(`Mongodb connected ${this.url}`);

                resolve(this._db);
            });
        });
    }

    get db () {
        if(this._db) return Promise.resolve(this._db);
        return this._connect();
    }

    getCollection (collection) {
        return this.db
            .then(db => db.collection(collection));
    }
}

module.exports = Mongo;