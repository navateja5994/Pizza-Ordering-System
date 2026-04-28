import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  doc,
} from "firebase/firestore";
import { db } from "../firebase/config";
import { demoOrders } from "../services/demoStorage";

const COLLECTION = "orders";

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

function isDemoUser(userId) {
  return String(userId).startsWith("demo-");
}

export const orderService = {
  async create(orderData) {
    try {
      if (!isFirebaseReady()) throw new Error("Firebase not ready");
      const docRef = await addDoc(getCollection(), {
        ...orderData,
        status: "Pending",
        createdAt: new Date().toISOString(),
      });
      return { id: docRef.id, ...orderData, status: "Pending" };
    } catch (err) {
      if (isDemoUser(orderData.userId)) {
        return demoOrders.create(
          orderData.userId,
          orderData.items,
          orderData.totalPrice,
          orderData.paymentMethod
        );
      }
      throw err;
    }
  },

  async getMyOrders(userId) {
    try {
      if (!isFirebaseReady()) throw new Error("Firebase not ready");
      const q = query(getCollection(), where("userId", "==", userId));
      const querySnapshot = await getDocs(q);
      const orders = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      // Sort in JavaScript to avoid composite index requirement
      return orders.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
    } catch (err) {
      if (isDemoUser(userId)) {
        return demoOrders.getByUser(userId);
      }
      throw err;
    }
  },

  async getAllOrders() {
    try {
      if (!isFirebaseReady()) throw new Error("Firebase not ready");
      const querySnapshot = await getDocs(getCollection());
      const orders = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      return orders.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
    } catch (err) {
      throw err;
    }
  },

  async updateStatus(orderId, status) {
    try {
      if (!isFirebaseReady()) throw new Error("Firebase not ready");
      const docRef = doc(db, COLLECTION, orderId);
      const docSnap = await getDoc(docRef);
      const currentData = docSnap.exists() ? docSnap.data() : {};
      const statusHistory = currentData.statusHistory || [];
      statusHistory.push({
        status,
        timestamp: new Date().toISOString(),
      });
      await updateDoc(docRef, { status, statusHistory });
      return { id: orderId, status, statusHistory };
    } catch (err) {
      throw err;
    }
  },

  async getById(orderId) {
    try {
      if (!isFirebaseReady()) throw new Error("Firebase not ready");
      const docSnap = await getDoc(doc(db, COLLECTION, orderId));
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      }
      return null;
    } catch (err) {
      throw err;
    }
  },
};

