const fs = require('fs');
const formidable = require('formidable');

const Controller = require('../../core/controller');
const Response = require('../../core/response');

class ImageController extends Controller{
    constructor() {
        super({ collection: `${__dirname}/images.json` });

        this.keys = ['id', 'name', 'type', 'created'];
        this.dir = `${__dirname}/../../images`;
        this._form = new formidable.IncomingForm();
    }

    getAll (req, res, route) {
        return Response.Send(res, this.data.map(image => this._pick(image, this.keys)));
    }

    getOne (req, res, route) {
        let id = +route.params.id;
        if(isNaN(id))
            return Response.ApplicationError(res, new Error(`Invalid url param id must be a number`));

        this._find(id, this.keys)
            .then(image => Response.Send(res, image))
            .catch(err => Response.ApplicationError(res, err));
    }

    remove (req, res, route) {
        let id = +route.params.id;
        if(isNaN(id))
            return Response.ApplicationError(res, new Error(`Invalid url param id must be a number`));

        this._remove(id)
            .then(() => Response.send(res, {id}))
            .catch(err => Response.ApplicationError(res, err))
    }

    upload (req, res, route) {
        this._form.parse(req, (err, fields, files) => {
            if(err) return Response.ApplicationError(res, err);

            this._moveImage(fields, files)
                .then(image => this._add(image))
                .then(image => Response.Send(res, image))
                .catch(err => Response.ApplicationError(res, err));
        });
    }

    _moveImage ({name}, files) {
        let { path: temp, type } = files.upload;
        let id = ++this.counter;
        let path = `${this.dir}/${id}`;

        return new Promise((resolve, reject) => {
            fs.rename(temp, path, err => {
                if (err) return reject(err);
                resolve({ id, name, path, type });
            });
        });
    }

    form (req, res, route) {
        let form = `<form action="/images" enctype="multipart/form-data" method="POST">
               <input type="text" name="name">
               <input type="file" name="upload">
               <input type="submit" value="Upload">
           </form>`;
        return Response.Send(res, form, {'Content-Type': 'text/html'});
    }
}

module.exports = new ImageController();