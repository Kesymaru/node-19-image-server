const HEADERS = {
    'Status-Code': 200,
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
};
module.exports = class Response {
    static Send (res, data, options = {}) {
        options = Object.assign({}, HEADERS, options);
        Object.keys(options).forEach(h => res.setHeader(h, options[h]));

        if(typeof data === 'object' && typeof data.pipe === 'function')
            return data.pipe(res);
        if(typeof data === 'string')
            return res.end(data);
        return res.end(JSON.stringify(data))
    }

    static BadRequest (res, errors = new Error('Something when wrong!')) {
        Response.Send(res, Response.ErrorMessage(errors), {'Status-Code': 400});
    }

    static ErrorMessage (errors) {
        let data = {success: false};
        if(Array.isArray(errors)) data.errors = errors.map(err => err.message);
        else data.error = errors.message;
        return data;
    }

    static ApplicationError (res, errors) {
        console.error(errors);
        Response.Send(res, Response.ErrorMessage(errors), {'Status-Code': 500});
    }

}