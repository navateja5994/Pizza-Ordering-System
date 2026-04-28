import { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  writeBatch,
} from "firebase/firestore";
import { db } from "../firebase/config";
import { useAuth } from "./AuthContext";
import { demoCart } from "../services/demoStorage";

const CartContext = createContext(null);

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const { user, userProfile } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const isDemo = userProfile?.isDemo;

  // Calculate totals (including addon and seasoning prices)
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => {
    const addonTotal = (item.addons || []).reduce((a, addon) => a + addon.price, 0);
    const seasoningTotal = (item.seasonings || []).reduce((s, seasoning) => s + seasoning.price, 0);
    return sum + (item.price + addonTotal + seasoningTotal) * item.quantity;
  }, 0);

  // Listen to cart changes
  useEffect(() => {
    if (!user) {
      setItems([]);
      return;
    }

    if (isDemo) {
      // Demo mode: load from localStorage
      setItems(demoCart.get(user.uid));
      return;
    }

    // Firebase mode
    setLoading(true);
    let unsubscribe;
    try {
      const q = query(collection(db, "cart"), where("userId", "==", user.uid));
      unsubscribe = onSnapshot(q, (snapshot) => {
        const cartItems = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        }));
        setItems(cartItems);
        setLoading(false);
      });
    } catch {
      setLoading(false);
    }

    return () => unsubscribe && unsubscribe();
  }, [user, isDemo]);

  const addToCart = useCallback(
    async (food, quantity = 1, selectedAddons = [], selectedSeasonings = []) => {
      if (!user) throw new Error("You must be logged in to add items to cart");

      if (isDemo) {
        const updated = demoCart.addItem(user.uid, food, quantity, selectedAddons, selectedSeasonings);
        setItems([...updated]);
        return;
      }

      const existing = items.find((item) => item.foodId === food.id);
      if (existing) {
        const docRef = doc(db, "cart", existing.id);
        await updateDoc(docRef, { quantity: existing.quantity + quantity });
      } else {
        await addDoc(collection(db, "cart"), {
          userId: user.uid,
          foodId: food.id,
          name: food.name,
          price: food.price,
          addons: selectedAddons,
          seasonings: selectedSeasonings,
          category: food.category || "",
          image: food.image || "",
          quantity,
          createdAt: new Date().toISOString(),
        });
      }
    },
    [user, items, isDemo]
  );

  const updateQuantity = useCallback(
    async (cartItemId, quantity) => {
      if (quantity < 1) return;

      if (isDemo) {
        const updated = demoCart.updateQuantity(user.uid, cartItemId, quantity);
        setItems([...updated]);
        return;
      }

      const docRef = doc(db, "cart", cartItemId);
      await updateDoc(docRef, { quantity });
    },
    [user, isDemo]
  );

  const removeFromCart = useCallback(
    async (cartItemId) => {
      if (isDemo) {
        const updated = demoCart.removeItem(user.uid, cartItemId);
        setItems([...updated]);
        return;
      }

      await deleteDoc(doc(db, "cart", cartItemId));
    },
    [user, isDemo]
  );

  const clearCart = useCallback(async () => {
    if (!user || items.length === 0) return;

    if (isDemo) {
      demoCart.clear(user.uid);
      setItems([]);
      return;
    }

    const batch = writeBatch(db);
    items.forEach((item) => {
      batch.delete(doc(db, "cart", item.id));
    });
    await batch.commit();
  }, [user, items, isDemo]);

  const value = {
    items,
    loading,
    itemCount,
    totalPrice,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

