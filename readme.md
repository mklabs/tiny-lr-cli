# tiny-lr-cli

CLI part and dashboard of tiny-lr

- Can watch files for changes and send a livereload event. node_modules files are automatically ignored.
- Provides a `/dashboard` route listing connected devices

*wip*

---

![Dashboard](https://cloud.githubusercontent.com/assets/113832/17619801/0ffb6d0c-6088-11e6-9b55-1126a0b45a5d.PNG)

---

    $ tiny-lr [options]

    Options:
      --port             Change server port (default: 3000)
      --wg               Watch glob for changes, node_modules ignored (default: **/*.{js,css})
      --help             Show this help output
      --version          Show package version

    Examples:

      $ tiny-lr -p 3000
      $ tiny-lr --wg '**/*.{html,css,js}'
