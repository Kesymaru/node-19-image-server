const http = require('http');

const Response = require('./core/response');
const {Router} = require('./core/router');

const ImageController = require('./controllers/images.controller');

const router = new Router([
    {
        path: '/images',
        method: 'GET',
        callback: ImageController.form.bind(ImageController)
    },
    {
        path: '/api/v1/images',
        method: 'GET',
        callback: ImageController.getAll.bind(ImageController)
    },
    {
        path: '/api/v1/images',
        method: 'POST',
        callback: ImageController.createOne.bind(ImageController),
    },
    {
        path: 'api/v1/images/:id',
        method: 'GET',
        callback: ImageController.getOne.bind(ImageController),
    },
    {
        path: 'api/v1/images/:id',
        method: 'DELETE',
        callback: ImageController.removeOne.bind(ImageController),
    },
]);

const server = http.createServer((req, res) => {
    let route = router.find(req.url, req.method);
    if(route) return route.execute(req, res);
    Response.BadRequest(res, new Error('Route not found'));
});

server.listen(5000);


