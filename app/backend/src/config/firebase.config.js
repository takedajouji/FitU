// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyDpYRqMZQUF__xzvumILxvmpAwmkqs75TI",
    authDomain: "fitu-9d970.firebaseapp.com",
    projectId: "fitu-9d970",
    storageBucket: "fitu-9d970.firebasestorage.app",
    messagingSenderId: "1052175181761",
    appId: "1:1052175181761:web:b2c821c77a6edcdbaf7140",
    measurementId: "G-YBK4YM0H33",
    databaseURL: "https://fitu-9d970-default-rtdb.firebaseio.com"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const database = getDatabase(app);
const auth = getAuth(app);