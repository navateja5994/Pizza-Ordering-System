import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, updateProfile } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase/config";
import { demoUser } from "./demoStorage";

function isFirebaseReady() {
  try {
    return !!auth && !!db;
  } catch {
    return false;
  }
}

export const authService = {
  async login(email, password) {
    try {
      if (!isFirebaseReady()) throw new Error("Firebase not ready");
      const result = await signInWithEmailAndPassword(auth, email, password);
      return result;
    } catch {
      // Fallback to demo login
      demoUser.login(email, password);
      return { user: { uid: demoUser.get().uid, email } };
    }
  },

  async register(name, email, password, role = "customer") {
    try {
      if (!isFirebaseReady()) throw new Error("Firebase not ready");
      const result = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(result.user, { displayName: name });

      const actualRole = role === "admin" ? "admin" : role;
      await setDoc(doc(db, "users", result.user.uid), {
        name,
        email,
        role: actualRole,
        createdAt: new Date().toISOString(),
      });

      return result;
    } catch (err) {
      // Fallback to demo registration
      const existing = demoUser.findByEmail(email);
      if (existing) {
        throw new Error("Email already in use");
      }
      const actualRole = role === "admin" ? "admin" : role;
      const demo = demoUser.create(name, email, password, actualRole);

      return { user: { uid: demo.uid, email } };
    }
  },

  async logout() {
    demoUser.clear();
    try {
      await signOut(auth);
    } catch {
      // ignore
    }
  },

  async getUserRole(uid) {
    try {
      const docSnap = await getDoc(doc(db, "users", uid));
      if (docSnap.exists()) {
        return docSnap.data().role;
      }
      return null;
    } catch {
      const demo = demoUser.get();
      return demo?.uid === uid ? demo.role : null;
    }
  },

  async getCurrentUserToken() {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return null;
      return await currentUser.getIdToken();
    } catch {
      return null;
    }
  },
};

