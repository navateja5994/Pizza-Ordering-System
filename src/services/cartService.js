import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  writeBatch,
} from "firebase/firestore";
import { db } from "../firebase/config";

const cartRef = collection(db, "cart");

export const cartService = {
  async getByUser(userId) {
    const q = query(cartRef, where("userId", "==", userId));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  },

  async addItem(userId, food, quantity = 1) {
    // Check if item already exists
    const q = query(
      cartRef,
      where("userId", "==", userId),
      where("foodId", "==", food.id)
    );
    const snap = await getDocs(q);

    if (!snap.empty) {
      const existing = snap.docs[0];
      await updateDoc(doc(db, "cart", existing.id), {
        quantity: existing.data().quantity + quantity,
      });
      return existing.id;
    }

    const docRef = await addDoc(cartRef, {
      userId,
      foodId: food.id,
      name: food.name,
      price: food.price,
      category: food.category || "",
      image: food.image || "",
      quantity,
      createdAt: new Date().toISOString(),
    });
    return docRef.id;
  },

  async updateQuantity(cartItemId, quantity) {
    await updateDoc(doc(db, "cart", cartItemId), { quantity });
  },

  async removeItem(cartItemId) {
    await deleteDoc(doc(db, "cart", cartItemId));
  },

  async clearCart(userId) {
    const q = query(cartRef, where("userId", "==", userId));
    const snap = await getDocs(q);
    const batch = writeBatch(db);
    snap.docs.forEach((d) => batch.delete(doc(db, "cart", d.id)));
    await batch.commit();
  },
};

