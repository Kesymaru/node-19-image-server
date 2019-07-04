
const http = require('http');

const {Router} = require('./core/router');
const ImageController = require('./controllers/images.controller');
const images = new ImageController({
    uploadDir: `${__dirname}/images`,
});

const router = new Router([
    {
        path: '/images',
        method: 'GET',
        callback: images.form.bind(images)
    },
    {
        path: '/images/all',
        method: 'GET',
        callback: images.getAll.bind(images)
    },
    {
        path: '/images',
        method: 'POST',
        callback: images.save.bind(images),
    },
    {
        path: '/images/:id',
        method: 'GET',
        callback: images.getOne.bind(images),
    },

]);

const server = http.createServer((req, res) => {
    let route = router.find(req.url, req.method);
    if(route) route.execute(req, res);
    return;

    if (req.url == '/upload' && req.method == 'POST') {
        let form = new formidable.IncomingForm();
        form.uploadDir = IMAGE_DIR;
        form.parse(req, function(err, fields, files) {
            res.writeHead(200, {'content-type': 'application/json'});
            res.end(JSON.stringify({fields, files}));
        });
        return;
    }

    /*if(req.url == `/${filename}` && req.method == 'GET') {
        // res.setHeader('Content-disposition', `attachment; filename=${filename}`);
        res.setHeader('Content-type', 'image/png');

        let filestream = fs.createReadStream(file);
        filestream.pipe(res);
        return;
    }*/
});

server.listen(5000);


