Got it 👍 — the issue is that in your README you’re mixing raw text with code block syntax, which makes GitHub render multiple boxes. If you want **all the steps in one clean copy-paste box**, you should wrap them inside a single fenced code block (using triple backticks ```).

Here’s a fixed README section you can copy-paste:

````markdown
# structurecareapp

A web platform for managing and generating client-facing softscape care guides.

---

## Prerequisites
- **Node.js** (v18+ recommended) and **npm**
- **Firebase CLI** (`npm i -g firebase-tools`) and logged in: `firebase login`

---

## Local Development

```bash
# Clone repo
git clone https://github.com/erikgalindohub/structurecareapp.git
cd structurecareapp

# Install dependencies
npm install

# Run dev server
npm start
````

The app will open at [http://localhost:3000](http://localhost:3000)

---

## Build & Deploy (Firebase Hosting)

```bash
# Build production bundle
npm run build

# Deploy to Firebase Hosting
firebase deploy
```

Your app will be live at:

* [https://structurecareapp.web.app](https://structurecareapp.web.app)
* [https://structurecareapp.firebaseapp.com](https://structurecareapp.firebaseapp.com)

````

👉 The important part is that each “section” of commands is inside a single **```bash ... ``` block**. That way GitHub only renders one box per group, not a separate one for each line.  

Do you want me to format it so the **whole setup (clone → install → run → build → deploy)** is in **one single box** instead of multiple ones?
````
