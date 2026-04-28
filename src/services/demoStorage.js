// LocalStorage-based storage for demo mode when Firebase isn't configured

const STORAGE_KEYS = {
  DEMO_USER: "pizza_demo_user",
  DEMO_CART: "pizza_demo_cart",
  DEMO_ORDERS: "pizza_demo_orders",
  DEMO_FOODS: "pizza_demo_foods",
};

// Demo user helpers
export const demoUser = {
  get() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.DEMO_USER);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },
  set(user) {
    localStorage.setItem(STORAGE_KEYS.DEMO_USER, JSON.stringify(user));
  },
  clear() {
    localStorage.removeItem(STORAGE_KEYS.DEMO_USER);
  },
  getUsers() {
    try {
      const data = localStorage.getItem("pizza_demo_users");
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  },
  saveUser(email, userData) {
    const users = this.getUsers();
    users[email.toLowerCase()] = userData;
    localStorage.setItem("pizza_demo_users", JSON.stringify(users));
  },
  findByEmail(email) {
    const users = this.getUsers();
    return users[email.toLowerCase()] || null;
  },
  create(name, email, password, role = "customer") {
    const user = {
      uid: "demo-" + Date.now(),
      name,
      email: email.toLowerCase(),
      password,
      role,
      isDemo: true,
    };
    this.saveUser(email, user);
    this.set(user);
    return user;
  },
  login(email, password) {
    const user = this.findByEmail(email);
    if (user && user.password === password) {
      this.set(user);
      return user;
    }
    throw new Error("Invalid email or password");
  },
};

// Demo cart helpers
export const demoCart = {
  get(userId) {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.DEMO_CART);
      const all = data ? JSON.parse(data) : {};
      return all[userId] || [];
    } catch {
      return [];
    }
  },
  set(userId, items) {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.DEMO_CART);
      const all = data ? JSON.parse(data) : {};
      all[userId] = items;
      localStorage.setItem(STORAGE_KEYS.DEMO_CART, JSON.stringify(all));
    } catch {
      // ignore
    }
  },
  addItem(userId, food, quantity = 1, selectedAddons = [], selectedSeasonings = []) {
    const items = this.get(userId);
    const existing = items.find((i) => i.foodId === food.id);
    if (existing) {
      existing.quantity += quantity;
    } else {
      items.push({
        id: "cart-" + Date.now() + "-" + Math.random().toString(36).slice(2, 7),
        userId,
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
    this.set(userId, items);
    return items;
  },
  updateQuantity(userId, cartItemId, quantity) {
    const items = this.get(userId).map((i) =>
      i.id === cartItemId ? { ...i, quantity } : i
    );
    this.set(userId, items);
    return items;
  },
  removeItem(userId, cartItemId) {
    const items = this.get(userId).filter((i) => i.id !== cartItemId);
    this.set(userId, items);
    return items;
  },
  clear(userId) {
    this.set(userId, []);
  },
};

// Demo orders helpers
export const demoOrders = {
  getAll() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.DEMO_ORDERS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },
  getByUser(userId) {
    return this.getAll().filter((o) => o.userId === userId);
  },
  create(userId, items, totalPrice, paymentMethod = "cod") {
    const orders = this.getAll();
    const now = new Date().toISOString();
    const order = {
      id: "order-" + Date.now(),
      userId,
      items: items.map((i) => ({ name: i.name, price: i.price, quantity: i.quantity, addons: i.addons || [], seasonings: i.seasonings || [] })),
      totalPrice,
      paymentMethod: paymentMethod || "cod",
      status: "Pending",
      statusHistory: [{ status: "Pending", timestamp: now }],
      createdAt: now,
    };
    orders.unshift(order);
    localStorage.setItem(STORAGE_KEYS.DEMO_ORDERS, JSON.stringify(orders));
    return order;
  },
  updateStatus(orderId, status) {
    const orders = this.getAll().map((o) => {
      if (o.id !== orderId) return o;
      const history = o.statusHistory || [];
      // Only add if status actually changed
      if (history.length > 0 && history[history.length - 1].status === status) {
        return o;
      }
      return {
        ...o,
        status,
        statusHistory: [...history, { status, timestamp: new Date().toISOString() }],
      };
    });
    localStorage.setItem(STORAGE_KEYS.DEMO_ORDERS, JSON.stringify(orders));
    return orders.find((o) => o.id === orderId);
  },
  seedOrders(userId) {
    const existing = this.getByUser(userId);
    if (existing.length > 0) return existing;

    const now = Date.now();
    const orders = [
      {
        id: "order-" + (now - 40000),
        userId,
        items: [
          { name: "Margherita Pizza", price: 299, quantity: 2 },
          { name: "Coke 500ml", price: 49, quantity: 2 },
        ],
        totalPrice: 696,
        status: "Delivered",
        createdAt: new Date(now - 86400000 * 3).toISOString(),
      },
      {
        id: "order-" + (now - 30000),
        userId,
        items: [
          { name: "Pepperoni Pizza", price: 399, quantity: 1 },
          { name: "Garlic Bread", price: 149, quantity: 1 },
        ],
        totalPrice: 548,
        status: "Cancelled",
        createdAt: new Date(now - 86400000 * 2).toISOString(),
      },
      {
        id: "order-" + (now - 20000),
        userId,
        items: [
          { name: "BBQ Chicken Pizza", price: 449, quantity: 1 },
          { name: "Chicken Wings (6 pcs)", price: 249, quantity: 1 },
          { name: "Lemon Iced Tea", price: 79, quantity: 1 },
        ],
        totalPrice: 777,
        status: "Confirmed",
        createdAt: new Date(now - 86400000).toISOString(),
      },
      {
        id: "order-" + (now - 10000),
        userId,
        items: [
          { name: "Double Patty Burger", price: 349, quantity: 2 },
          { name: "French Fries", price: 99, quantity: 1 },
        ],
        totalPrice: 797,
        status: "Pending",
        createdAt: new Date(now - 3600000).toISOString(),
      },
    ];
    localStorage.setItem(STORAGE_KEYS.DEMO_ORDERS, JSON.stringify(orders));
    return orders;
  },
};

// Demo foods helpers
export const demoFoods = {
  getAll() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.DEMO_FOODS);
      if (data) {
        const parsed = JSON.parse(data);
        // Migrate old data missing seasonings non-destructively
        const needsMigration = parsed.some((f) => !Array.isArray(f.seasonings));
        if (!needsMigration) return parsed;

        const migrated = parsed.map((f) => ({
          ...f,
          addons: Array.isArray(f.addons) ? f.addons : [],
          seasonings: Array.isArray(f.seasonings) ? f.seasonings : [],
        }));
        localStorage.setItem(STORAGE_KEYS.DEMO_FOODS, JSON.stringify(migrated));
        return migrated;
      }
    } catch {
      // fall through
    }
    // Seed with mock data on first access
    const defaults = [
      { id: "f1", name: "Margherita Pizza", price: 299, category: "Pizza", image: "", addons: [{ name: "Extra Cheese", price: 50 }, { name: "Extra Spicy", price: 20 }], seasonings: [{ name: "Garlic Seasoning", price: 30 }, { name: "Chili Flakes", price: 15 }, { name: "Oregano", price: 10 }] },
      { id: "f2", name: "Pepperoni Pizza", price: 399, category: "Pizza", image: "", addons: [{ name: "Extra Cheese", price: 50 }, { name: "Olives", price: 40 }], seasonings: [{ name: "Oregano", price: 10 }, { name: "Black Pepper", price: 15 }] },
      { id: "f3", name: "BBQ Chicken Pizza", price: 449, category: "Pizza", image: "", addons: [{ name: "Extra Chicken", price: 60 }, { name: "Jalapenos", price: 35 }], seasonings: [{ name: "BBQ Rub", price: 20 }, { name: "Smoked Paprika", price: 15 }] },
      { id: "f4", name: "Veggie Supreme Pizza", price: 349, category: "Pizza", image: "", addons: [{ name: "Extra Veggies", price: 45 }, { name: "Paneer Cubes", price: 55 }], seasonings: [{ name: "Italian Herbs", price: 10 }, { name: "Chili Flakes", price: 15 }] },
      { id: "f5", name: "Cheese Burger", price: 199, category: "Burger", image: "", addons: [{ name: "Extra Patty", price: 80 }, { name: "Bacon", price: 60 }, { name: "Extra Cheese", price: 40 }], seasonings: [{ name: "Black Pepper", price: 10 }, { name: "Cajun Spice", price: 15 }] },
      { id: "f6", name: "Chicken Burger", price: 249, category: "Burger", image: "", addons: [{ name: "Extra Patty", price: 80 }, { name: "Spicy Mayo", price: 25 }], seasonings: [{ name: "Peri Peri", price: 20 }, { name: "Lemon Pepper", price: 10 }] },
      { id: "f7", name: "Double Patty Burger", price: 349, category: "Burger", image: "", addons: [{ name: "Extra Cheese", price: 40 }, { name: "Caramelized Onions", price: 30 }], seasonings: [{ name: "Smoked Salt", price: 10 }, { name: "Chipotle", price: 15 }] },
      { id: "f8", name: "Creamy Alfredo Pasta", price: 299, category: "Pasta", image: "", addons: [{ name: "Extra Sauce", price: 40 }, { name: "Grilled Chicken", price: 70 }], seasonings: [{ name: "Parmesan Dust", price: 15 }, { name: "Basil", price: 10 }] },
      { id: "f9", name: "Arrabbiata Pasta", price: 279, category: "Pasta", image: "", addons: [{ name: "Extra Spicy", price: 20 }, { name: "Parmesan", price: 35 }], seasonings: [{ name: "Chili Flakes", price: 10 }, { name: "Garlic Powder", price: 10 }] },
      { id: "f10", name: "Garlic Bread", price: 149, category: "Sides", image: "", addons: [{ name: "Cheese Dip", price: 30 }, { name: "Extra Garlic", price: 15 }], seasonings: [{ name: "Parsley", price: 5 }, { name: "Mixed Herbs", price: 10 }] },
      { id: "f11", name: "French Fries", price: 99, category: "Sides", image: "", addons: [{ name: "Cheese Sauce", price: 35 }], seasonings: [{ name: "Peri Peri", price: 15 }, { name: "Salt & Pepper", price: 5 }, { name: "Sour Cream", price: 20 }] },
      { id: "f12", name: "Chicken Wings (6 pcs)", price: 249, category: "Sides", image: "", addons: [{ name: "Extra Dip", price: 25 }, { name: "Ranch Dressing", price: 30 }], seasonings: [{ name: "Cajun Rub", price: 15 }, { name: "Lemon Pepper", price: 10 }] },
      { id: "f13", name: "Coke 500ml", price: 49, category: "Drinks", image: "", addons: [{ name: "Extra Ice", price: 0 }, { name: "Lemon Slice", price: 10 }], seasonings: [] },
      { id: "f14", name: "Lemon Iced Tea", price: 79, category: "Drinks", image: "", addons: [{ name: "Extra Lemon", price: 10 }, { name: "Mint Leaves", price: 15 }], seasonings: [] },
      { id: "f15", name: "Chocolate Lava Cake", price: 149, category: "Dessert", image: "", addons: [{ name: "Vanilla Ice Cream", price: 40 }, { name: "Chocolate Sauce", price: 25 }], seasonings: [{ name: "Cocoa Dust", price: 5 }] },
      { id: "f16", name: "New York Cheesecake", price: 199, category: "Dessert", image: "", addons: [{ name: "Berry Compote", price: 35 }, { name: "Whipped Cream", price: 20 }], seasonings: [{ name: "Cinnamon", price: 5 }] },
    ];
    localStorage.setItem(STORAGE_KEYS.DEMO_FOODS, JSON.stringify(defaults));
    return defaults;
  },
  setAll(foods) {
    localStorage.setItem(STORAGE_KEYS.DEMO_FOODS, JSON.stringify(foods));
  },
  add(food) {
    const foods = this.getAll();
    const newFood = { ...food, id: "f" + Date.now() };
    foods.push(newFood);
    this.setAll(foods);
    return newFood;
  },
  update(foodId, data) {
    const foods = this.getAll().map((f) => (f.id === foodId ? { ...f, ...data } : f));
    this.setAll(foods);
    return foods.find((f) => f.id === foodId);
  },
  remove(foodId) {
    const foods = this.getAll().filter((f) => f.id !== foodId);
    this.setAll(foods);
  },
};

// Demo admin requests helpers
export const demoAdminRequests = {
  getAll() {
    try {
      const data = localStorage.getItem("pizza_demo_admin_requests");
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  },
  getById(uid) {
    return this.getAll()[uid] || null;
  },
  save(request) {
    const all = this.getAll();
    all[request.uid] = request;
    localStorage.setItem("pizza_demo_admin_requests", JSON.stringify(all));
  },
  updateStatus(uid, status) {
    const all = this.getAll();
    if (all[uid]) {
      all[uid].status = status;
      localStorage.setItem("pizza_demo_admin_requests", JSON.stringify(all));
    }
  },
};

export const clearAllDemoData = () => {
  Object.values(STORAGE_KEYS).forEach((key) => localStorage.removeItem(key));
  localStorage.removeItem("pizza_demo_admin_requests");
};

