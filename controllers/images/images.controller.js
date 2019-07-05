const fs = require('fs');
const fsPromise = require('fs').promises;
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
        let query = route.query;
        if(isNaN(id))
            return Response.ApplicationError(res, new Error(`Invalid url param id must be a number`));

        this._find(id)
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

            this._imageRecord(fields, files)
                .then(image => this._add(image))
                .then(image => Response.Send(res, image))
                .catch(err => Response.ApplicationError(res, err));
        });
    }

    async _imageRecord ({name}, files) {
        let { path: temp, type } = files.upload;
        let id = ++this.counter;
        let extension = '.'+type.split('/')[1];
        let path = `${this.dir}/${id}${extension}`;

        await fsPromise.copyFile(temp, path);
        return fsPromise.unlink(temp)
            .then(() => ({ id, name, type, path, extension }));
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