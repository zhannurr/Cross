import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/database';

const firebaseConfig = {
  apiKey: "AIzaSyA9PQDoiFu95qMoRx8qtYSVLLW67sAf4Q4",
  authDomain: "unitsconverter-feb0e.firebaseapp.com",
  projectId: "unitsconverter-feb0e",
  storageBucket: "unitsconverter-feb0e.appspot.com",
  messagingSenderId: "1060375850448",
  appId: "1:1060375850448:web:c77da9d0aa1c54ecd29dd5",
  measurementId: "G-VJRNZT6BTH"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const db = firebase.database();

export { auth, db };
