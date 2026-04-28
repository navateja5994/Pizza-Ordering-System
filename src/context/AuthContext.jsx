import { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase/config";
import { demoUser } from "../services/demoStorage";

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for demo user first
    const demo = demoUser.get();
    if (demo) {
      setUser({ uid: demo.uid, displayName: demo.name, email: demo.email });
      setUserProfile(demo);
      setLoading(false);
      return;
    }

    // Then try Firebase
    let unsubscribe;
    try {
      unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        setUser(firebaseUser);
        if (firebaseUser) {
          try {
            const profileSnap = await getDoc(doc(db, "users", firebaseUser.uid));
            if (profileSnap.exists()) {
              setUserProfile(profileSnap.data());
            }
          } catch (err) {
            console.error("Failed to load user profile", err);
          }
        } else {
          setUserProfile(null);
        }
        setLoading(false);
      });
    } catch (err) {
      // Firebase not configured
      setLoading(false);
    }

    return () => unsubscribe && unsubscribe();
  }, []);

  const login = async (email, password) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const profileSnap = await getDoc(doc(db, "users", result.user.uid));
      if (profileSnap.exists()) {
        setUserProfile(profileSnap.data());
      }
      return result;
    } catch (err) {
      // Try demo login
      const demo = demoUser.login(email, password);
      setUser({ uid: demo.uid, displayName: demo.name, email: demo.email });
      setUserProfile(demo);
      return { user: { uid: demo.uid, email: demo.email } };
    }
  };

  const register = async (name, email, password, role = "customer") => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(result.user, { displayName: name });
      const actualRole = role === "admin" ? "admin" : role;
      await setDoc(doc(db, "users", result.user.uid), {
        name,
        email,
        role: actualRole,
        createdAt: new Date().toISOString(),
      });
      setUserProfile({ name, email, role: actualRole });
      return result;
    } catch (err) {
      // Try demo registration
      const existing = demoUser.findByEmail(email);
      if (existing) {
        throw new Error("Email already in use");
      }
      const actualRole = role === "admin" ? "admin" : role;
      const demo = demoUser.create(name, email, password, actualRole);
      setUser({ uid: demo.uid, displayName: demo.name, email: demo.email });
      setUserProfile(demo);
      return { user: { uid: demo.uid, email: demo.email } };
    }
  };

  const logout = async () => {
    demoUser.clear();
    setUser(null);
    setUserProfile(null);
    try {
      await signOut(auth);
    } catch {
      // ignore
    }
  };


  const isRejectedAdmin = userProfile?.role === "rejected";

  const value = {
    user,
    userProfile,
    loading,
    isAdmin,
    isPendingAdmin,
    isRejectedAdmin,
    isAuthenticated: !!user,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

