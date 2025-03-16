import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
const firebaseConfig = {
  apiKey: "AIzaSyBBuOg_GhxfCgTZubGftYJ23dUUoJ5atZM",
  authDomain: "sketchly-io.firebaseapp.com",
  projectId: "sketchly-io",
  storageBucket: "sketchly-io.firebasestorage.app",
  messagingSenderId: "694419604943",
  appId: "1:694419604943:web:2411f33ae28beefd2ebeba",
};
//init firebasee app
const app = initializeApp(firebaseConfig);

//init services
const db = getFirestore();

const colRef = collection(db, "organization");
const authenticator = getAuth();

// const OrgFiller = () => {
//   fetch("http://localhost:3000/organizations")
//     .then((response) => {
//       return response.json();
//     })
//     .then((data) => {
//       console.log("data form fetch", data);
//       data.forEach((organization: any) => {
//         addDoc(colRef, organization);
//       });
//     });
// };

// OrgFiller();

export { db, colRef, authenticator };
