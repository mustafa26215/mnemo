# Mnemo - English Vocabulary Flashcards

**Mnemo** (say "NEE-moh") comes from *Mnemosyne*, the Greek goddess of memory and the root of the word "mnemonic".

**Icon:** a lowercase "m" built from two soft arches, like a row of cards or a loop of memory. The amber dot sits where the dot of an "i" would go, so it also reads as a spark of recall.

## Folder structure
```
mnemo/
  index.html            the whole app (HTML, CSS, JavaScript)
  manifest.json         PWA manifest
  service-worker.js     offline caching
  README.md
  icons/
    favicon.svg  favicon-32.png  favicon.ico
    icon-192.png  icon-512.png  icon-maskable-512.png
    apple-touch-icon.png
```

## Run locally
- **Quick look:** double-click `index.html`. Everything works except installing and offline caching, because browsers only allow service workers on `http://localhost` or HTTPS.
- **Full PWA test:** in this folder run `python3 -m http.server 8000`, then open `http://localhost:8000`.

## Deploy free on GitHub Pages (HTTPS included)
1. Create a free account at github.com and click **New repository**. Name it, for example, `mnemo`. Keep it Public.
2. Upload **all** files and the `icons` folder to the repository root (Add file, Upload files). `index.html` must be at the top level.
3. Open **Settings, Pages**. Under Source choose **Deploy from a branch**, select branch `main` and folder `/ (root)`, then Save.
4. Wait a minute or two. Your app will be at `https://YOUR-USERNAME.github.io/mnemo/`.
5. All paths in the app are relative, so it works inside that `/mnemo/` subfolder.

When you change any file later, edit `CACHE_VERSION` in `service-worker.js` (for example `mnemo-v2`) so installed apps pick up the update.

## Install as an app
**Android (Chrome):** open the site, tap the menu (three dots), then **Install app** or **Add to Home screen**.
**iPhone (Safari):** open the site in Safari, tap **Share**, then **Add to Home Screen**, then **Add**. It must be Safari.
**Desktop (Chrome or Edge):** click the install icon in the address bar.

## Data
Words, progress, favorites, daily goal and theme are stored in your browser (localStorage) on that device and address. Use **Settings, Export** to back up or move your words.
