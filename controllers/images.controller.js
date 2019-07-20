const fs = require('fs');
const fsPromise = require('fs').promises;
const formidable = require('formidable');
const ObjectId = require('mongodb').ObjectId;

const Controller = require('../core/controller');
const Response = require('../core/response');
const Utils = require('../core/utils');

const ControllerConfig = {
    dir: `${__dirname}/../../images`,
    collection: 'images',
    keys: ['_id', 'name', 'type', 'extension', 'createDate']
};

class ImageController extends Controller {
    constructor(config = ControllerConfig) {
        super(config);

        this.dir = config.dir;
        this.formidable = new formidable.IncomingForm();
    }

    getAll (req, res, route) {
        this._find({}, route.query)
            .then(images => Response.Send(res, images))
            .catch(err => Response.ApplicationError(res, err));
    }

    createOne (req, res, route) {
        this.formidable.parse(req, (err, fields, files) => {
            if(err) return Response.ApplicationError(res, err);

            this._createImage(fields, files)
                .then(image => Response.Send(res, image))
                .catch(err => Response.ApplicationError(res, err));
        });
    }

    async _createImage ({name}, files) {
        let { path: temp, type } = files.upload;
        let extension = '.'+type.split('/')[1];
        let id = new ObjectId();
        let image = { _id: id, name, type, extension, createDate: new Date() };
        let newPath = `${this.dir}/${image._id}${extension}`;

        await fsPromise.copyFile(temp, newPath); // copy the image
        await fsPromise.unlink(temp); // remove the temp image
        return this._insertOne(image); // add the image to the db
    }

    form (req, res, route) {
        let form = `<form action="api/v1/images" enctype="multipart/form-data" method="POST">
               <input type="text" name="name">
               <input type="file" name="upload">
               <input type="submit" value="Upload">
           </form>`;
        return Response.Send(res, form, {'Content-Type': 'text/html'});
    }

    getOne (req, res, route) {
        let id = route.params.id;
        let query = route.query;

        if(!Utils.isId(id))
            return Response.BadRequest(res, new Error(`Invalid ID`));

        this._findOne(id)
            .then(({path, name, type, extension}) => {
                let headers = {
                    'Content-disposition': `attachment; filename=${name}.${extension}`,
                    'Content-Type': type
                };
                if(query && query.display === 'true' || query.display === '1')
                    delete headers['Content-disposition'];
                Response.Send(res, fs.createReadStream(path), headers);
            })
            .catch(err => Response.ApplicationError(res, err));
    }

    removeOne (req, res, route) {
        let id = route.params.id;
        if(!Utils.isId(id)) return Response.ApplicationError(res, new Error(`Invalid ID`));

        this._remove(id)
            .then(() => Response.send(res, {id}))
            .catch(err => Response.ApplicationError(res, err))
    }
}

module.exports = new ImageController();