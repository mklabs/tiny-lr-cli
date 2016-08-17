# tiny-lr-cli

CLI part and dashboard of tiny-lr

- Watch files for changes and send a livereload event. node_modules files are automatically ignored.
- Provides a `/dashboard` route listing connected devices
- Serve / list static files and directories (default: `./`) using
  [serve-index](https://github.com/expressjs/serve-index) and
  [serve-static](https://github.com/expressjs/serve-index)

## Install

    npm install mklabs/tiny-lr-cli -g

---

![Dashboard](https://cloud.githubusercontent.com/assets/113832/17619801/0ffb6d0c-6088-11e6-9b55-1126a0b45a5d.PNG)

---

    $ tiny-lr [options] <path>

    Options:
      --port             Change server port (default: 3000)
      --wg               Watch glob for changes (default: **/*.{js,css})
      --help             Show this help output
      --version          Show package version

    <path> defaults to "./" and is used to serve a static directory

    Examples:

      $ tiny-lr -p 3000
      $ tiny-lr ./site
      $ tiny-lr --wg '**/*.{html,css,js}'

---

- v0.0.1 - Initial version with file watch, basic dashboard and static file serving / listing
