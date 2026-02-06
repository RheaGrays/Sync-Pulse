// Firebase Configuration
// Replace these values with your actual Firebase project credentials
// You can find these in your Firebase Console under Project Settings

const firebaseConfig = {
  apiKey: "AIzaSyA2LpnCnLstz_pP-3BRzf-hmF3WEnQfsQM",
  authDomain: "sync-pulse-to-do-list.firebaseapp.com",
  projectId: "sync-pulse-to-do-list",
  storageBucket: "sync-pulse-to-do-list.firebasestorage.app",
  messagingSenderId: "1037378414099",
  appId: "1:1037378414099:web:a73bf74da40ec129fe81e6",
  measurementId: "G-KTW55KZF08"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Firebase services
const auth = firebase.auth();
const db = firebase.firestore();

// Export for use in other files
window.firebaseApp = firebase;
window.auth = auth;
window.db = db;

console.log("Firebase initialized successfully!");