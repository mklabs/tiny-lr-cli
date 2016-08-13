const anybody = require('body/any');
const Server  = require('tiny-lr');
const debug   = require('debug')('tinylr:cli:server');

const CONTENT_TYPE = 'content-type';
const FORM_TYPE    = 'application/x-www-form-urlencoded';

export default class CLIServer {
  constructor (options = {}) {
    this.options = options;
    this.configure();

    this.tinylr = new Server(this.options);
  }

  configure () {
    debug('Custom Configuring %s HTTP server');
  }

  handler (req, res, next) {
    debug('Custom handler %s (middleware: %s)', req.url);

    next = next || this.defaultHandler.bind(this, res);
    req.headers[CONTENT_TYPE] = req.headers[CONTENT_TYPE] || FORM_TYPE;

    return anybody(req, res, (err, body) => {
      if (err) return next(err);
      req.body = body;

      if (!req.query) {
        req.query = req.url.indexOf('?') !== -1
          ? qs.parse(parse(req.url).query)
          : {};
      }

      return this.handle(req, res, next);
    });
  }
}
