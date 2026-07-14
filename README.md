# fwd.moe

<a href="https://fwd.moe" target="_blank">
  <img src="public/fwd-chan.png" style="width:175px;height:175px" alt="A drawing of a girl with purple twin tails is smiling with her mouth open. Her left eye is open and her right eye is closed to look like she is winking. She has a forward arrow as a hair clip on the right side of her head.">
</a>

A simple preact app for path-based _fwds_ (forwards/redirects), which are stored via local storage.

For example, `/mal` -> `https://myanimelist.net`.

- Paths are case-insensitive.
- Query params are preserved.
- Any paths following a match are preserved.
- Longest match takes precedence.

## Notes

Developed as a personal project, so your mileage may vary.

If you enjoy, feel free to [buy me a coffee](https://buymeacoffee.com/nwgreenl) (─‿‿─)~

- Hosted on [fwd.moe](https://fwd.moe)
- Character _fwd-chan_ by [Sohyun Kim](https://sohyun.kim/)

## Develop

Install deps

```shell
npm i
```

Run dev server (vite)

```shell
npm run dev
```

Lint (eslint)

```shell
npm run lint

# or

npm run lint:fix
```

Build (vite)

```shell
npm run build

# or

npm run build:github-pages
```

A pre-commit hook (via `husky`) will run `lint` and `build:github-pages` scripts when applicable.

## Deploy

Hosted on github pages, via the [`dist`](./dist/) directory.

The [`dist/404.html`](./dist/404.html) file is copied from [`dist/index.html`](./dist/index.html) during `build:github-pages` as a _hack_, so that github pages will serve the app on any route.
