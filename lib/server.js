const Server      = require('tiny-lr');
const debug       = require('debug')('tinylr:cli:server');
const serveIndex  = require('serve-index');
const serveStatic = require('serve-static');
const qs          = require('qs');
const anybody     = require('body/any');
const { parse }   = require('url');

const CONTENT_TYPE = 'content-type';
const FORM_TYPE = 'application/x-www-form-urlencoded';

// initialized in exported factory
let server = null;

class CLIServer {
  constructor (options = {}) {
    this.options = options;
    this._middlewares = [];
    this.middlewares();

    this.options.dashboard = true;
    this.options.handler = this.handler;
    this.tinylr = new Server(this.options);
    this.tinylr.on('close', () => {
      process.nextTick(() => process.exit());
    });
  }

  middlewares () {
    debug('Custom Configuring %s HTTP server');
    let root = this.options._[0] || './';
    this.use(serveStatic(root));
    this.use(serveIndex(root, { icons: true }));
  }

  use (middleware) {
    this._middlewares.push(middleware);
  }

  // note: this is not this in this method. tiny-lr rebinds it to itself
  // because of this, lib/server.js expose a single singleton server (to get a
  // ref to the server within this method)
  handler (req, res, next) {
    debug('Custom handler %s (middleware: %s)', req.url);

    next = next || this.defaultHandler.bind(this, res);
    req.headers[CONTENT_TYPE] = req.headers[CONTENT_TYPE] || FORM_TYPE;

    let self = this;
    let middlewares = server._middlewares.concat();
    return anybody(req, res, (err, body) => {
      if (err) return next(err);
      req.body = body;

      if (!req.query) {
        req.query = req.url.indexOf('?') !== -1
          ? qs.parse(parse(req.url).query)
          : {};
      }

      // exec each middleware in serie, only if not responding to a route already
      let route = req.method + ' ' + parse(req.url).pathname;
      let respond = this.emit(route, req, res);
      if (respond) return;

      (function execMiddleware(middleware) {
        if (!middleware) return self.handle(req, res);

        middleware(req, res, (err) => {
          if (err) return self.error(err);
          execMiddleware(middlewares.shift());
        });
      })(middlewares.shift());
    });
  }
}

module.exports = (options) => {
  if (server) return server;
  server = new CLIServer(options);
  return server;
};

module.exports.Server = CLIServer;
