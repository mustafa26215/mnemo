# 🧠 Mnemo
### Learn. Review. Remember.

<p align="center">
  <img src="https://img.shields.io/badge/Mnemo-English%20Vocabulary-DBA85B?style=for-the-badge" alt="Mnemo">
  <img src="https://img.shields.io/badge/Built%20with-Claude-D97757?style=for-the-badge" alt="Built with Claude">
  <img src="https://img.shields.io/badge/PWA-Ready-64748B?style=for-the-badge" alt="PWA Ready">
</p>

<p align="center">
  <strong>A simple, beautiful way to build your English vocabulary.</strong>
  <br>
  Learn new words, practice with flashcards, and make progress every day.
</p>

<p align="center">
  <a href="https://mustafa26215.github.io/mnemo/">
    <img src="https://img.shields.io/badge/🚀_Explore_Mnemo-Visit_Website-DBA85B?style=for-the-badge" alt="Explore Mnemo">
  </a>
</p>

---

## ✨ About Mnemo

**Mnemo** (pronounced *NEE-moh*) takes its name from *Mnemosyne*, the Greek goddess of memory and the origin of the word *mnemonic*.

Mnemo is an English vocabulary learning app built to make learning new words easier, more organized, and more enjoyable.

Instead of keeping words in scattered notes or endless lists, Mnemo gives you one simple place to collect vocabulary, understand meanings, practice recall, and track your progress.

> **Learn a word today. Remember it tomorrow. Build your vocabulary one card at a time.**

---

## 🎯 The Concept

Learning vocabulary isn't just about knowing what a word means. It's about remembering it and knowing how to use it.

Mnemo is built around a simple learning cycle:

<p align="center">
  <strong>➕ Add Words</strong>
  &nbsp; → &nbsp;
  <strong>🃏 Practice</strong>
  &nbsp; → &nbsp;
  <strong>🧠 Remember</strong>
  &nbsp; → &nbsp;
  <strong>📈 Improve</strong>
</p>

Users can build their own vocabulary collection, review words through interactive flashcards, and gradually develop a stronger English vocabulary.

---

## 🚀 Features

| Feature | Description |
|:--|:--|
| 📝 Vocabulary Collection | Add and organize your own English words. |
| 🃏 Interactive Flashcards | Practice remembering words through flashcards. |
| 📖 Word Details | Save definitions, parts of speech, levels, and examples. |
| 📊 Learning Progress | Follow your vocabulary learning progress. |
| ⭐ Favorites | Keep important words close at hand. |
| 🎯 Daily Goals | Set daily targets and build a learning habit. |
| 🌗 Light & Dark Mode | Switch between different visual themes. |
| 📱 Responsive Design | Enjoy a consistent experience on different screen sizes. |
| 📴 Offline Support | Access cached app content without an internet connection. |
| 📤 Data Export | Export your vocabulary data for backup. |

---

## 🛠️ Built With

Mnemo is developed using native web technologies, without frontend frameworks.

<p align="center">
  <img src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white" alt="HTML5">
  <img src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white" alt="CSS3">
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript">
  <img src="https://img.shields.io/badge/PWA-5A0FC8?style=for-the-badge&logo=pwa&logoColor=white" alt="PWA">
</p>

| Technology | Role |
|:--|:--|
| HTML5 | Structure and content |
| CSS3 | Styling, layouts, and responsive design |
| Vanilla JavaScript | Application logic and interactions |
| LocalStorage | Local data persistence |
| Service Workers | Offline caching |
| Web App Manifest | Installation and PWA configuration |
| SVG & PNG | Icons and visual assets |

---

## 📱 A Progressive Web App

Mnemo is designed as a **Progressive Web App (PWA)**.

This means you can install it on supported devices and access it through an app-like experience without needing a traditional app store.

- Installable on supported browsers.
- Responsive across desktop and mobile.
- Offline access to cached application resources.
- Lightweight, with no frontend framework dependency.

---

## 🔐 Privacy & Storage

Your vocabulary belongs to you.

Mnemo uses browser `localStorage` to save your words, favorites, learning progress, daily goals, and theme preferences.

- No account or registration required.
- No automatic cloud synchronization.
- Your data stays in your current browser and device.
- Export your vocabulary to keep a backup.

---

## 📂 Project Structure

```text
mnemo/
│
├── index.html
├── manifest.json
├── service-worker.js
├── README.md
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

## 🤖 Development

<p align="center">
  <img src="https://img.shields.io/badge/100%25-Claude-D97757?style=for-the-badge" alt="100% Claude">
</p>

**Mnemo was built entirely with Claude.**

From the initial concept and interface design to the application logic and implementation, the project was developed using Claude — 100% Claude.

---

<p align="center">
  <img src="https://img.shields.io/badge/🧠-Mnemo-DBA85B?style=for-the-badge" alt="Mnemo">
  <br><br>
  <strong>Remember more. Learn smarter.</strong>
  <br>
  <a href="https://mustafa26215.github.io/mnemo/">🌐 Visit Mnemo</a>
  <br><br>
  <sub>Made for curious minds and lifelong learners.</sub>
</p>

---

## 🔊 Pronunciation

- **Words:** human recordings from [Wikimedia Commons](https://commons.wikimedia.org/) (via Wiktionary, with [dictionaryapi.dev](https://dictionaryapi.dev/) as a backup), licensed under Creative Commons (mostly CC BY-SA). The IPA shown is the one that matches the recording's accent (US or UK). When no recording exists, Mnemo says so and offers a clearly labeled computer voice.
- **Example sentences:** no human recordings exist for them, so they use your device's built-in computer voice. Installing a "Natural", "Enhanced", or "Premium" English voice in your device settings makes it sound noticeably better.
- Audio needs an internet connection. IPA text is cached after its first lookup.

## What's new

- **Practice Zone** (`#practice`): multiple choice, fill in the blank, word matching, spelling, listening, and Arabic-to-English translation. Choose all words, recently added, difficult and forgotten, or favorites. Instant feedback, final score, retry, and "retry missed". Every answer updates the spaced-repetition schedule: a wrong answer sends the word back to box 0 (due today, counted as a lapse); a right answer moves it up one box only when it is due.
- **Difficult words**: words you miss are tracked (`lapses`) and shown in a Difficult filter in Study, Words, and Practice.
- **Words**: sort (A to Z, newest, most missed, due soonest), filter (level, favorites, due, difficult), search across English, Arabic, and synonyms. New fields: Arabic translation of the example, synonyms, antonyms.
- **Pronunciation**: US/UK accent switch (human recordings and matching IPA when available), slow/normal sentence speed, and a computer-voice fallback.
- **Reliability**: unreadable saved data is copied to `lumen.vocab.v1.corrupt` instead of being overwritten; export/import now keeps review history; the browser is asked for persistent storage; the service worker (`mnemo-v5`) precaches the app and refreshes assets in the background.

Saved data uses the same storage key as before, so existing words and progress are kept.

**Offline:** the app, your words, and cached IPA work offline. Human recordings are streamed from Wikimedia Commons and need a connection; offline, the computer voice is used.

## Clean start

Mnemo ships with **no words**: every word is added or imported by you, and nothing is ever added automatically. Collections saved by older versions are cleaned once on first load: the original 18 sample words are removed only if they are still untouched (same text as the original, not favorited, never studied, no edits). Any sample you favorited, studied, or edited is kept, and so is any word you added yourself, even if it looks like a sample.

Removed controls: Reset learning progress, Restore sample words, Undo last change, and Shuffle. Deleting words (one or many) and replacing a collection by import cannot be undone, so export a backup first if unsure.

## How Mnemo works now (simplified)

- **Dashboard**: one message and one action (review what is due, otherwise practice, otherwise study). No counters.
- **Study**: flip the card, then rate it Again / Hard / Good / Easy (keys 1 to 4). Filters: All levels, Beginner, Intermediate, Advanced, Favorites. The review deck (from the Dashboard) shows the words due plus at most 10 new words a day. A small progress bar and an end-of-session summary appear while you study.
- **Practice**: six exercises (multiple choice, fill in the blank, word matching, spelling, listening, translation), 5/10/20 questions, from all words, recently added, difficult and forgotten, or favorites. Wrong answers return in the review schedule.
- **Levels**: one row per level with progress and a Study button.
- **Words**: search, add, edit, delete, favorite. Adding a word needs only the English word, part of speech, level, and definition. **Arabic meaning** and the **example sentence** are optional; a card simply leaves out any section that is empty. Tap **Select all** to pick the words in the current list (never hidden ones), then **Delete selected**; a confirmation appears first and the deletion can be undone from Settings.
- **Settings**: export and import only.
- **Pronunciation**: human recordings (Wiktionary/Wikimedia Commons, then dictionaryapi.dev) with US/UK and IPA where available; the device voice is used otherwise and is labelled as such. Sentences always use the device voice.

### Spaced repetition (Leitner boxes)
Again resets to box 0 (due today, one lapse per day). Hard keeps the box and repeats after at least a day. Good moves up one box, Easy two (one if the word was overdue). Boxes only move when a word is due. A word is "mastered" from box 4 (14-day interval).

### Reliability
Saves carry a revision number so an out-of-date tab never overwrites newer data; unreadable saves are backed up before starting fresh; export and import keep review history. Older saves load unchanged: fields from removed features (synonyms, antonyms, example translation, daily goal, new-word setting) are kept in the data and ignored by the interface, so nothing is lost. The Translation exercise uses the example translation when a word has one and otherwise asks for the English word; Matching and Translation only use words that have an Arabic meaning, and Fill in the blank only uses words with an example sentence.

### Tests
`npm i jsdom && node tests/run.js` runs 119 checks in a simulated browser (jsdom). They are not real-browser or real-device tests.
