/* ============================================================
   Firebase Configuration and Initialization File
   ----------------------------------------------------------------
   This file contains the configuration settings for your Firebase
   project. It initializes the Firebase application using the 
   provided configuration details. These credentials connect your 
   Angular app to your Firebase backend.
   ============================================================ */

   import { initializeApp } from "firebase/app"; // Import the function to initialize the Firebase app

   // Firebase configuration object with keys and identifiers.
   // Replace these values with your own Firebase project settings as needed.
   const firebaseConfig = {
     apiKey: "AIzaSyBFcz4pxHeTejDbw4nMZT8vR28DYkkb2kw",           // API key for Firebase project authentication
     authDomain: "collabfy-dc20d.firebaseapp.com",                  // Domain for Firebase Authentication
     databaseURL: "https://collabfy-dc20d-default-rtdb.europe-west1.firebasedatabase.app", // Realtime Database URL
     projectId: "collabfy-dc20d",                                    // Firebase project ID
     storageBucket: "collabfy-dc20d.firebasestorage.app",            // Cloud Storage bucket URL
     messagingSenderId: "146475704216",                              // Unique sender ID for Firebase Cloud Messaging
     appId: "1:146475704216:web:de8856edb4798a7db215ed"              // Firebase app ID
   };
   
   // Initialize the Firebase app with the configuration object
   export const app = initializeApp(firebaseConfig);
   