# 🧠 Mnemo
### English Vocabulary Flashcards

<p align="center">
  <strong>Remember more. Learn smarter.</strong>
  <br><br>
  <a href="https://mustafa26215.github.io/mnemo/">
    🌐 <strong>Visit Mnemo</strong>
  </a>
  <br><br>
  <img src="https://img.shields.io/badge/Status-Live-success?style=flat-square" alt="Live Status">
  <img src="https://img.shields.io/badge/Built%20with-Claude-orange?style=flat-square" alt="Built with Claude">
  <img src="https://img.shields.io/badge/Type-PWA-blue?style=flat-square" alt="Progressive Web App">
</p>

---

**Mnemo** (pronounced *NEE-moh*) is inspired by *Mnemosyne*, the Greek goddess of memory and the origin of the word *mnemonic*.

A simple, elegant English vocabulary learning app designed to help you build, organize, and remember new words through interactive flashcards.

**Development:** 100% built using Claude. No other AI tools were used in the development process.

---

## ✨ Brand Identity

**The Mnemo Icon**

A lowercase **m** formed by two soft arches, representing a row of flashcards and a continuous loop of memory.

The amber dot sits above the arches, resembling the dot of an "i" and symbolizing a spark of recall.

---

## 🌐 Live Demo

**Try Mnemo online:**

[https://mustafa26215.github.io/mnemo/](https://mustafa26215.github.io/mnemo/)

No installation is required to use the website. Open it directly in your browser.

---

## 📁 Project Structure

```text
mnemo/
│
├── index.html              # Complete application (HTML, CSS, JS)
├── manifest.json           # PWA configuration
├── service-worker.js       # Offline caching
├── README.md               # Project documentation
│
└── icons/
    ├── favicon.svg
    ├── favicon-32.png
    ├── favicon.ico
    ├── icon-192.png
    ├── icon-512.png
    ├── icon-maskable-512.png
    └── apple-touch-icon.png
```

---

## 🚀 Getting Started

### Run Locally

**Option 1 — Quick Preview**

Simply double-click `index.html` to open Mnemo in your browser.

All core features work, except PWA installation and offline caching, which require HTTPS or a local development server.

**Option 2 — Full PWA Testing**

Run the following command from the project folder:

```bash
python3 -m http.server 8000
```

Then open your browser and visit:

```text
http://localhost:8000
```

---

## 🌍 Deployment

### Deploy for Free with GitHub Pages

GitHub Pages provides free hosting with HTTPS support.

**Step 1 — Create a Repository**

- Sign in to [GitHub](https://github.com).
- Create a new repository.
- Name it `mnemo`.
- Set the repository visibility to **Public**.

**Step 2 — Upload Project Files**

- Open your repository.
- Click **Add file → Upload files**.
- Upload all project files, including the complete `icons` folder.
- Make sure `index.html` is located directly in the repository root.

**Step 3 — Enable GitHub Pages**

1. Open **Settings → Pages**.
2. Under **Build and deployment**, select `Deploy from a branch`.
3. Select the `main` branch.
4. Select the `/ (root)` folder.
5. Click **Save**.

**Step 4 — Access Your Website**

Your application will be available at:

```text
https://mustafa26215.github.io/mnemo/
```

All application paths are relative, allowing Mnemo to work correctly inside the `/mnemo/` subdirectory.

### 🔄 Updating the Application

Whenever you modify project files, update `CACHE_VERSION` in `service-worker.js` to trigger a new cache version.

For example:

```javascript
const CACHE_VERSION = 'mnemo-v2';
```

This helps installed applications recognize updated assets.

---

## 📲 Install as an App

Mnemo is a Progressive Web App (PWA), allowing you to install it on supported devices.

### Android — Chrome

1. Open Mnemo in Chrome.
2. Tap the three-dot menu.
3. Select **Install app** or **Add to Home screen**.

### iPhone — Safari

1. Open Mnemo in Safari.
2. Tap the **Share** button.
3. Select **Add to Home Screen**.
4. Tap **Add**.

*Note: Safari is required for this installation method on iPhone.*

### Desktop — Chrome / Edge

1. Open Mnemo in your browser.
2. Click the install icon in the address bar.
3. Follow the installation instructions.

---

## 💾 Data & Storage

Mnemo stores your data locally in your browser using `localStorage`.

Your stored data includes:

| Data | Description |
|---|---|
| 📚 Words | Your saved vocabulary |
| 📈 Progress | Your learning progress |
| ⭐ Favorites | Your favorite words |
| 🎯 Daily Goal | Your daily learning target |
| 🎨 Theme | Your appearance preferences |

**Privacy & Storage**

- Your data stays on your current browser and device.
- No account or registration is required.
- No automatic cloud synchronization is provided.

### Backup & Export

Use **Settings → Export** to back up your vocabulary data or transfer your words to another device.

---

## 🛠️ Technologies

- HTML5
- CSS3
- Vanilla JavaScript
- Progressive Web App (PWA)
- Service Workers
- LocalStorage
- GitHub Pages

---

## 🎯 Project Philosophy

Mnemo is built around three simple principles:

- **Simplicity** — A clean interface without unnecessary complexity.
- **Consistency** — Small, regular learning sessions.
- **Memory** — Interactive flashcards that help reinforce vocabulary.

The goal is simple: make building an English vocabulary a natural part of your daily routine.

---

<p align="center">
  <strong>🧠 Mnemo</strong>
  <br>
  <em>Remember more. Learn smarter.</em>
  <br><br>
  <a href="https://mustafa26215.github.io/mnemo/">
    Visit Website
  </a>
  <br><br>
  <sub>Built with Claude — 100% Claude.</sub>
</p>
