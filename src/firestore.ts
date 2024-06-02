import firebase from "firebase/compat/app";
import "firebase/firestore";
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// TODO: Replace the following with your app's Firebase project configuration
// See: https://support.google.com/firebase/answer/7015592
const firebaseConfig = {
    apiKey: "AIzaSyAgrlXKxYK1bHwrtvJcZ-xa88KmpoXSxPs",
    authDomain: "twitchclipper-test.firebaseapp.com",
    projectId: "twitchclipper-test",
    storageBucket: "twitchclipper-test.appspot.com",
    messagingSenderId: "898533829302",
    appId: "1:898533829302:web:b8ee1a7c32c8e591ba9417",
    measurementId: "G-9QRZSXEL9H"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);


// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);

export default db;