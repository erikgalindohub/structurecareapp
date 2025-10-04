
# StructureCareApp

A modern web app for managing and generating client-facing softscape care guides.

---

## Features

* Firebase Auth (anonymous), Firestore
* Google Sheet (TSV) as plant data source
* Planned Firebase Functions for PDF generation

---

## Setup

* **Node.js** (v18+ recommended) and **npm**
* **Firebase CLI** (`npm i -g firebase-tools`) and login with `firebase login`

---

## Development

1. Clone this repo
   `git clone https://github.com/erikgalindohub/structurecareapp.git`
   `cd structurecareapp`

2. Install dependencies
   `npm install`

3. Run locally
   `npm start`

Your app will open at [http://localhost:3000](http://localhost:3000)

---

## Deploy

1. Build for production
   `npm run build`

2. Deploy to Firebase Hosting
   `firebase deploy`

Live URLs:

* [https://structurecareapp.web.app](https://structurecareapp.web.app)
* [https://structurecareapp.firebaseapp.com](https://structurecareapp.firebaseapp.com)

