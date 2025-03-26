import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyBFcz4pxHeTejDbw4nMZT8vR28DYkkb2kw",
  authDomain: "collabfy-dc20d.firebaseapp.com",
  databaseURL: "https://collabfy-dc20d-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "collabfy-dc20d",
  storageBucket: "collabfy-dc20d.firebasestorage.app",
  messagingSenderId: "146475704216",
  appId: "1:146475704216:web:de8856edb4798a7db215ed"
};

export const app = initializeApp(firebaseConfig);
