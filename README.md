# StructureCare App

## Quick Start (no prior experience needed)

1. **Install Node.js** if you do not have it yet (download from [nodejs.org](https://nodejs.org) – pick the LTS version).  
2. **Clone or unzip this project** onto your machine.  
3. Open a terminal in the project folder and run:
   ```bash
   npm install
   ```
   This pulls down the packages the app needs.
4. Start the app locally:
   ```bash
   npm start
   ```
   Wait for the browser to open to `http://localhost:3000`.

### When you’re ready to deploy or share with Firebase

1. Copy the Firebase keys from the Firebase console (Project settings → Your apps → Web app).  
2. Open this project’s `.env.example` file. Replace the placeholder text with your real keys and **save the file as `.env`** (keep `.env` out of source control).  
3. Restart the dev server (`npm start`) so the app reads the new values.  
4. To build the optimized version the host will serve, run:
   ```bash
   npm run build
   ```
   The output lives in the `build/` folder.

### Optional Firebase extras (only if you’re using Firestore)

- The `firestore.rules` file tells Firebase who can read/write your data. Deploy it with:
  ```bash
  firebase deploy --only firestore:rules
  ```
- The `firestore.indexes.json` file makes the “filter by status and date” query fast. Deploy it with:
  ```bash
  firebase deploy --only firestore:indexes
  ```
  These two commands require the Firebase CLI (`npm install -g firebase-tools`) and `firebase login`.

## Data sources

- The plant catalog loads from a shared Google Sheet (published as TSV). If that sheet is down, the app shows an empty list and logs an error—refresh after the sheet comes back.
- Client projects live in Cloud Firestore under the `projects` collection. Anonymous sign-in lets everyone on the team see the same data; security rules keep the shape of the data safe.

# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
