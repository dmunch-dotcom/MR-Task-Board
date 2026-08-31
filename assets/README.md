# Assets

The app expects two logo files here (referenced by `index.html`):

| File                  | Used for                                  |
|-----------------------|-------------------------------------------|
| `mr_logo_black.png`   | Header logo + favicon in **light** theme  |
| `mr_logo_white.png`   | Header logo + favicon in **dark** theme   |

Requirements:
- PNG with a **transparent background** (so the black/white mark sits on the page background).
- Tightly cropped to the mark (minimal surrounding padding) — the header renders it at 42px tall.
- Square-ish or wide is fine; it scales by height and keeps aspect ratio.
- A ~256×256 (or the source resolution) export works well for the favicon.

`index.js` serves this folder statically, so `/assets/mr-logo-white.png` resolves once the files are added.
