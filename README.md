# The Architecture of Excellence

An illustrated digital book about how organizations work, by Matthew Schmidt.
See clearly. Understand deeply. Act intentionally.

Static pages, no build step:

- `index.html` is the cover and the Introduction.
- `chapter-one.html` is Chapter one, The Organization That Lost Its Way.
- `chapter-two.html` is Chapter two, Learning to See.
- `book.css` holds the styles the pages share.

## Deploying on Railway

1. Push this repo to GitHub.
2. In Railway: **New Project → Deploy from GitHub repo** → select this repo.
3. Railway detects Node and runs `npm start`, which serves the pages with `serve`.
4. Go to **Settings → Networking → Generate Domain** to get a public URL.
5. Every push to the main branch redeploys.

`package.json` exists only so Railway has a process to run.
