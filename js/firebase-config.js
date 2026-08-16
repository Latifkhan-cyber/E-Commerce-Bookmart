// ==========================================================================
// BookMart - Firebase Client Configuration (js/firebase-config.js)
// ==========================================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js";

// Firebase web application configuration
const firebaseConfig = {
  apiKey: "AIzaSyDa1wqzmaBVkftqun-dIxg3mCjr7HGNnQc",
  authDomain: "bookmart-7a965.firebaseapp.com",
  projectId: "bookmart-7a965",
  storageBucket: "bookmart-7a965.firebasestorage.app",
  messagingSenderId: "830548648572",
  appId: "1:830548648572:web:7d67de5efd678e66bd5ff9",
  measurementId: "G-XL24RMSEM2"
};

// Initialize Firebase services
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };
