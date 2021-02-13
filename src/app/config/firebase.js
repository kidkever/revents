import firebase from "firebase/app";
import "firebase/firestore";
import "firebase/database";
import "firebase/auth";
import "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAG1zzOajGN7v9cWDFrvxIGDaXpD-cQVLo",
  authDomain: "revents-303023.firebaseapp.com",
  databaseURL: "https://revents-303023-default-rtdb.firebaseio.com",
  projectId: "revents-303023",
  storageBucket: "revents-303023.appspot.com",
  messagingSenderId: "217958170894",
  appId: "1:217958170894:web:e8c72fb0c4f7cc133ad75f",
};

firebase.initializeApp(firebaseConfig);
firebase.firestore();

export default firebase;
