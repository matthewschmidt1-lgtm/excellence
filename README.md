# The Architecture of Excellence

An illustrated digital book about how organizations work, by Matthew Schmidt.
See clearly. Understand deeply. Act intentionally.

Static pages, no build step:

- `index.html` is the cover and the Introduction.
- `chapter-one.html` is Chapter one, The Organization That Lost Its Way.
- `chapter-two.html` is Chapter two, Learning to See.
- `chapter-three.html` is Chapter three, The Seven Forces. It introduces the
  seven force symbols, which later chapters reuse.
- `chapter-four.html` is Chapter four, The Hidden Cost of Complexity.
- `book.css` holds the styles the pages share.
- `book.js` builds the header Menu: the contents and the Accessibility options
  (text size, light, contrast, spacing, motion). Choices are kept in the
  reader's browser. Without it, the header link goes to the contents in the footer.

## Deploying on Railway

1. Push this repo to GitHub.
2. In Railway: **New Project → Deploy from GitHub repo** → select this repo.
3. Railway detects Node and runs `npm start`, which serves the pages with `serve`.
4. Go to **Settings → Networking → Generate Domain** to get a public URL.
5. Every push to the main branch redeploys.

`package.json` exists only so Railway has a process to run.
