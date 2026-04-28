 <div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/b8d623f3-e1f1-4ca9-aa3b-c3055c854aa8

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the environment variables in `.env.local` (copy from `.env.example`):
   - `VITE_FIREBASE_*` variables for Firebase connection.
   - `VITE_ADMIN_EMAIL` for the authorized admin Google account.
3. Run the app:
   `npm run dev`

## Firebase Setup

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com/).
2. Enable **Firestore Database**.
3. Enable **Authentication** and activate the **Google** sign-in provider.
4. Create a collection named `menu_items` in Firestore.
5. Copy your web app configuration to `.env.local`.

