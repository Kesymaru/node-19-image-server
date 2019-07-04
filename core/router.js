/**
 * Universal router class
 */
(function (exports, URL) {
    const REGEX_PATH_PARAM = /\:\w/i;
    const BASE_URL = typeof window !== 'undefined' ? window.location.origin : 'http://test.com';
    let instance = null;
    class Router {
        constructor (routes) {
            if(instance) return instance;
            if(!routes) throw new Error(`Invalid Router config: ${routes}`);

            this.routes = routes.map(route => new Route(route));
            instance = this;
        }

        find (path, method = null) {
            let route = false;
            for (let i = 0; i < this.routes.length && !route; i++) {
                route = this.routes[i].match(path, method);
            }
            return route;
        }
    };

    class Route {
        constructor ({path, method = null, callback = null, title = ''}) {
            if(!path) throw new Error(`Invalid Router path: ${path}`);

            path = this._sanitizePath(path);

            this._path = path;
            this.url = new URL(`${BASE_URL}/${path}`);
            this.path = this.url.pathname;
            this.paths = this._paths();
            this.method = method;
            this.callback = callback;
            this.title = title;
            this.hasParams = this.paths.some(path => path.isParam);

            this.params = {};
            this.query = {};
            for(let entry of this.url.searchParams.entries()) {
                this.query[entry[0]] = entry[1];
            }
        }

        _sanitizePath (path) {
            return path.charAt(0) === '/' ? path.substr(1) : path;
        }

        _paths (path = this.path) {
            return path.split('/')
                .filter(p => !!p)
                .map((p, i) => new RoutePath(p, i));
        }

        match (path, method = null) {
            let route = new Route({path, method});

            if(route.method !== this.method) return false;
            if(route.paths.length !== this.paths.length) return false;

            if(route.url.toString() === this.url.toString()){
                route.matched = this;
                return route;
            };

            let matched = this.paths.every((p, i) => {
                if(!p.isParam) return p.path === route.paths[i].path;
                route.params[p.param] = route.paths[i].path;
                route.matched = this;
                return true;
            });
            return matched ? route : false;
        }

        execute () {
            let callback = this.callback || (this.matched ? this.matched.callback : null);
            if(typeof callback !== 'function') return false;
            return callback(...arguments, this);
        }

        toString (pathOnly = false) {
            return pathOnly ? `${this.path}${this.url.search}` : this.url.toString();
        }

        toObject(keys = ['path', 'params', 'query', 'url']) {
            return keys.reduce((t, k) => Object.assign(t, {[`${k}`]: k === 'url' ? this.url.toString() : this[k]}), {});
        }
    };

    class RoutePath {
        constructor(path, index = 0) {
            if(!path) throw new Error(`Invalid Route Path: ${path}`);

            this.path = path;
            this.index = index;

            this.isParam = REGEX_PATH_PARAM.test(this.path);
            if(this.isParam) this.param = this.path.replace(':', '');
        }
    };

    exports.Router = Router;
    exports.Route = Route;
    exports.RoutePath = RoutePath;
}(
    typeof exports === 'undefined'
        ? window
        : exports,
    typeof exports === 'undefined' ? window.URL : require('url').URL,
));