# Luwei Ying — academic website

This is a Jekyll site hosted with GitHub Pages at [luweiying.org](https://luweiying.org).

## Local preview

The project dependencies are installed inside `.venv/`. To start the site locally:

```sh
make preview
```

Then open `http://127.0.0.1:4000`. If that port is already in use, run:

```sh
make preview PORT=4001
```

## Production build

```sh
make build
```

The generated site is written to `_site/`. Source content lives in the numbered Markdown files, shared templates in `_layouts/`, and the visual system in `css/main.scss`.
