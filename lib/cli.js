const fs     = require('fs');
const path   = require('path');
const debug  = require('debug')('tinylr:cli');
const assets = require('tilt-assets');
const roar   = require('roar-cli');
const gaze   = require('gaze');
const server = require('./server');

export default class CLI extends roar.CLI {
  get example () {
    return 'tiny-lr [options]';
  }

  get more () {
    return `
  Examples:

    $ tiny-lr -p 3000
    $ tiny-lr --wg '**/*.{html,css,js}'
`;
  }

  // Used to parse arguments with minimist
  get alias () {
    return {
      h: 'help',
      v: 'version',
      p: 'port'
      //   .option('--cert <path>', 'Path to the TLS certificate file (default: ./cert.pem)', String)
      //   .option('--key <path>', 'Path to the TLS key file (default: ./key.pem)', String)
    };
  }

  // Used to generate the help output, along with example / more above
  get flags () {
    return {
      port: 'Change server port (default: 3000)',
      wg: 'Watch glob for changes, node_modules ignored (default: **/*.{js,css})',
      help: 'Show this help output',
      version: 'Show package version'
    };
  }

  constructor (parser, socketio, options = {}) {
    super(parser, options);

    this.options = Object.assign({}, options, this.argv);
    if (this.options.help) return this.help();
    if (this.options.version) return this.info(require('../package.json').version);

    this.options.port = this.options.port || 3000;
    this.options.pid = this.options.pid || path.resolve('tiny-lr.pid');
    this.options.dashboard = true;

    // Setup asset pipeline
    this.assets = assets({
      dirs: path.join(__dirname, '../assets') + '/'
    });

    // Setup server
    this.server = this.createServer(this.options);
    this.tinylr = this.server.tinylr;
    this.http = this.tinylr.server;

    // Routes
    this.tinylr.on('GET /test', this.index.bind(this));
    this.tinylr.on('GET /dashboard', this.dashboard.bind(this));
    this.tinylr.on('GET /clients', this.clients.bind(this));
    this.tinylr.on('GET /assets/index.js', this.dashboardAsset.bind(this));
    this.tinylr.on('GET /assets/index.css', this.dashboardAsset.bind(this));
    // Messages
    this.tinylr.on('MSG /destroy', this.clientDestroyed.bind(this));
    this.tinylr.on('MSG /create', this.clientCreated.bind(this));

    // Setup socket.io
    this.io = socketio(this.tinylr.server);
  }

  createServer (options = this.options) {
    return server;
    // var srv = new Server(options);
    // return srv;
  }

  watch (files) {
    debug('Watching %d files', files.length);

    let srv = this.tinylr;
    let error = this.error.bind(this);

    gaze(files, function (err, watcher) {
      if (err) return error(err);
      this.on('all', function (event, filepath) {
        debug(filepath + ' was ' + event);
        srv.changed({
          params: {
            files: [filepath]
          }
        });
      });
    });
  }

  index (req, res) {
    return fs.createReadStream(path.join(__dirname, '../public/test.html')).pipe(res);
  }

  clients (req, res) {
    res.setHeader('Content-Type', 'application/json');
    res.write(JSON.stringify({
      tinylr: 'Welcome dashboard',
      clients: Object.keys(this.tinylr.clients).map((id) => {
        return this.tinylr.clients[id].info();
      })
    }));

    res.end();
  }

  dashboard (req, res) {
    fs.readFile(path.join(__dirname, '../public/index.html'), 'utf8', (err, body) => {
      if (err) return this.error(err);
      body = body.replace(/\$\{port\}/g, this.options.port);
      res.end(body);
    });
  }

  dashboardAsset (req, res) {
    return this.assets.handle(req, res);
  }

  clientDestroyed (id, url) {
    debug('Client destroyed', id, url);

    return this.io.emit('tinylr:destroy', {
      command: 'tinylr:destroy',
      id: id,
      url: url
    });
  }

  clientCreated (id, url) {
    debug('Client created', id, url);

    return this.io.emit('tinylr:create', {
      command: 'tinylr:create',
      id: id,
      url: url
    });
  }

  listen (done = () => {}) {
    return this.tinylr.listen(this.options.port, (err) => {
      if (err) return this.error(err);
      this.writePID(this.options, done);
    });
  }

  writePID ({ port, pid }, done) {
    debug('Writing pid file to %s (port: %d)', pid, port);
    fs.writeFile(pid, process.pid, (err) => {
      if (err) {
        debug('... Cannot write pid file: %s', pid);
        process.exit(1);
      }

      debug('... Listening on %s (pid: %s) ...', port, process.pid);
      debug('... pid file: %s', pid);
      done();
    });
  }
}
