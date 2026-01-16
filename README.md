# Our Love Story — One Page Site

A single-page Valentine’s story site for Hannah Martini and Hudson Matthews. Built with vanilla HTML/CSS/JS, ready for GitHub Pages.

## Run locally

Open `index.html` in your browser for the landing page. The story lives at `story.html`. For a simple local server (optional):

```bash
python3 -m http.server
```

Then visit `http://localhost:8000`.

## Add your photos

Place photos in `/assets` using this naming convention:

```
assets/ch1-1.jpg
assets/ch1-2.jpg
assets/ch1-3.jpg
assets/ch2-1.jpg
assets/ch2-2.jpg
...
assets/ch9-1.jpg
assets/ch10-1.jpg
```

The gallery auto-detects missing images and shows a “Photo coming soon” card if none exist. Each chapter displays up to 3 photos with a “+N more” tile that opens the full gallery.

## Music

Optional: add your song at `assets/song.mp3`. The music button won’t autoplay; it will only play when clicked.

## Easter egg image

Optional: add your Cheddar easter egg image at `assets/easter-egg.jpeg`. It pops up after all three paw prints are clicked.

## Deploy to GitHub Pages

1. Push this repo to GitHub.
2. In GitHub, go to **Settings → Pages**.
3. Set **Source** to `Deploy from a branch`.
4. Select the `main` branch and `/root` folder.
5. Save. Your site will be published at the provided GitHub Pages URL.

## Customization

- Update copy directly in `index.html`.
- Adjust colors or spacing in `styles.css`.
- Tweak galleries, particles, or hearts in `main.js`.
