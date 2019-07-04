const fs = require('fs');
const formidable = require('formidable');

const Response = require('../core/response');

class ImageController {
    constructor({uploadDir = null, collection = `${__dirname}/images.json`} = {}) {
        this._form = new formidable.IncomingForm();
        if(uploadDir) this._form.uploadDir = uploadDir;
        
        this.collection = collection;
    }

    getAll (req, res, route) {
        let images = require(this.collection);
        return Response.Send(res, images.data);
    }

    getOne (req, res, route) {
        let images = require(this.collection);
        let id = +route.params.id;

        let image = images.data.find(i => i.id === id);

        if(image) return Response.Send(res, image);
        return Response.ApplicationError(res, new Error(`Cant not find image id: ${id}`));
    }

    save (req, res, route) {
        this._form.parse(req, (err, fields, files) => {
            if(err) return Response.ApplicationError(res, err);
            this._add({fields, files})
                .then(() => Response.Send(res, {fields, files}))
                .catch(err => Response.ApplicationError(res, err));
        });
    }
    
    _add (image) {
        let images = require(this.collection);

        image.id = images.counter++;
        image.date = new Date();
        images.data.push(image);

        return this._save(images);
    }
    
    _save (images) {
        return new Promise((resolve, reject) => {
            fs.writeFile(this.collection, JSON.stringify(images), err => err ? reject(err) : resolve(images));
        });
    }

    form (req, res, route) {
        let form = `<form action="/images" enctype="multipart/form-data" method="POST">
               <input type="text" name="title">
               <input type="file" name="upload" multiple="multiple">
               <input type="submit" value="Upload">
           </form>`;
        return Response.Send(res, form, {'Content-Type': 'text/html'});
    }
}

module.exports = ImageController;