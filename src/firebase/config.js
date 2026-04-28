import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDQHjV9ERWkMcnguDkWNXYQKveVGoPfnTQ",
  authDomain: "pizza-ordering-system-61998.firebaseapp.com",
  databaseURL: "https://pizza-ordering-system-61998-default-rtdb.firebaseio.com",
  projectId: "pizza-ordering-system-61998",
  storageBucket: "pizza-ordering-system-61998.firebasestorage.app",
  messagingSenderId: "993779182987",
  appId: "1:993779182987:web:54d41d7ed096062f24138e",
  measurementId: "G-EPMP8X0QBX"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

