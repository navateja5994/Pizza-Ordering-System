import {
  collection,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "../firebase/config";
import { demoFoods } from "../services/demoStorage";

const COLLECTION = "foods";

function getCollection() {
  return collection(db, COLLECTION);
}

function isFirebaseReady() {
  try {
    return !!db;
  } catch {
    return false;
  }
}

export const foodService = {
  async getAll() {
    try {
      if (!isFirebaseReady()) throw new Error("Firebase not ready");
      const querySnapshot = await getDocs(getCollection());
      return querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          addons: Array.isArray(data.addons) ? data.addons : [],
          seasonings: Array.isArray(data.seasonings) ? data.seasonings : [],
        };
      });
    } catch {
      // Fallback to demo storage
      return demoFoods.getAll();
    }
  },

  async getById(id) {
    try {
      if (!isFirebaseReady()) throw new Error("Firebase not ready");
      const docSnap = await getDoc(doc(db, COLLECTION, id));
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      }
      return null;
    } catch {
      return demoFoods.getAll().find((f) => f.id === id) || null;
    }
  },

  async create(food) {
    try {
      if (!isFirebaseReady()) throw new Error("Firebase not ready");
      const docRef = await addDoc(getCollection(), {
        ...food,
        createdAt: new Date().toISOString(),
      });
      return { id: docRef.id, ...food };
    } catch {
      return demoFoods.add(food);
    }
  },

  async update(id, food) {
    try {
      if (!isFirebaseReady()) throw new Error("Firebase not ready");
      const docRef = doc(db, COLLECTION, id);
      await updateDoc(docRef, food);
      return { id, ...food };
    } catch {
      return demoFoods.update(id, food);
    }
  },

  async delete(id) {
    try {
      if (!isFirebaseReady()) throw new Error("Firebase not ready");
      await deleteDoc(doc(db, COLLECTION, id));
      return true;
    } catch {
      demoFoods.remove(id);
      return true;
    }
  },
};

