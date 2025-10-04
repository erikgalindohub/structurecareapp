StructureCareApp

A web platform for managing and generating client-facing softscape care guides.

Features

Firebase Auth (anonymous), Firestore

Google Sheet (TSV) as plant data source

Planned Firebase Functions for PDF generation

Prerequisites

Node.js (v18+ recommended) and npm

Firebase CLI (npm i -g firebase-tools) and logged in with firebase login

Local Development

Clone repository:
git clone https://github.com/erikgalindohub/structurecareapp.git
cd structurecareapp

Install dependencies:
npm install

Start development server:
npm start

The app will open at http://localhost:3000

Build & Deploy (Firebase Hosting)

Build the production bundle:
npm run build

Deploy to Firebase Hosting:
firebase deploy

Your app will be live at:

https://structurecareapp.web.app

https://structurecareapp.firebaseapp.com
