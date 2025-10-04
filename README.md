````markdown
# structurecareapp

A modern web app for managing and generating client-facing **softscape care guides**.

---

## Tech Stack
- React (Create React App)
- Firebase Auth (anonymous), Firestore
- Google Sheet (TSV) as plant data source
- (Planned) Firebase Functions for PDF generation

---

## Prerequisites
- **Node.js** (v18+ recommended) and **npm**
- **Firebase CLI** (`npm i -g firebase-tools`) and logged in: `firebase login`

---

## Local Development

```bash
# 1) Clone
git clone https://github.com/erikgalindohub/structurecareapp.git
cd structurecareapp

# 2) Install
npm install

# 3) Run dev server
npm start
````

The app will open at [http://localhost:3000](http://localhost:3000)

---

## Build & Deploy (Firebase Hosting)

```bash
# Build the production bundle
npm run build

# Deploy to Firebase Hosting (project already initialized)
firebase deploy
```

Your site will be available at your Firebase Hosting URL(s), for example:

* [https://structurecareapp.web.app](https://structurecareapp.web.app)
* [https://structurecareapp.firebaseapp.com](https://structurecareapp.firebaseapp.com)

> If you haven’t run `firebase init hosting` in this repo yet, do it once:
>
> * Public directory: **build**
> * Single-page app rewrite: **Yes**

---

## Repository Structure (high level)

```
structurecareapp/
├─ public/
├─ src/
│  ├─ App.js            # Main React app (Dashboard, ProjectForm, etc.)
│  ├─ index.js
│  └─ ...               # components, hooks, utils
├─ package.json
└─ README.md
```

---

## Environment / Config

This prototype uses a hardcoded Firebase config in `src/App.js` that points to your project:

* Auth: **anonymous sign-in**
* Firestore: collection **projects**
* Plants are loaded from a published Google Sheet TSV URL.

When you hand this off later, move secrets/config to environment files or Remote Config.

---

## Roadmap

* ✅ Plant catalog, filtering & zone assignment
* ✅ Client projects stored in Firestore
* 🟡 Generate PDF care guide (Firebase Functions + headless renderer)
* 🟡 GitHub integration for CI/CD (optional)
* 🟡 App Hosting (for full-stack Functions) if/when needed

---

## Troubleshooting

* **Blank/old page after deploy**
  Run `npm run build` again, then `firebase deploy`. Hard-refresh the site (Ctrl/Cmd+Shift+R).

* **Firebase CLI not found**
  `npm i -g firebase-tools` and then `firebase login`.

* **Build warnings**
  They’re safe to ignore for now; we’ll tidy later.

---

## License

Draft / private. Choose a license when you’re ready to open-source.

```
```
