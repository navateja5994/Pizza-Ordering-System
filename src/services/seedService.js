import { foodService } from "./foodService";
import { demoOrders } from "./demoStorage";

const SAMPLE_FOODS = [
  { name: "Margherita Pizza", price: 299, category: "Pizza", image: "", addons: [{ name: "Extra Cheese", price: 50 }, { name: "Extra Spicy", price: 20 }], seasonings: [{ name: "Garlic Seasoning", price: 30 }, { name: "Chili Flakes", price: 15 }, { name: "Oregano", price: 10 }] },
  { name: "Pepperoni Pizza", price: 399, category: "Pizza", image: "", addons: [{ name: "Extra Cheese", price: 50 }, { name: "Olives", price: 40 }], seasonings: [{ name: "Oregano", price: 10 }, { name: "Black Pepper", price: 15 }] },
  { name: "BBQ Chicken Pizza", price: 449, category: "Pizza", image: "", addons: [{ name: "Extra Chicken", price: 60 }, { name: "Jalapenos", price: 35 }], seasonings: [{ name: "BBQ Rub", price: 20 }, { name: "Smoked Paprika", price: 15 }] },
  { name: "Veggie Supreme Pizza", price: 349, category: "Pizza", image: "", addons: [{ name: "Extra Veggies", price: 45 }, { name: "Paneer Cubes", price: 55 }], seasonings: [{ name: "Italian Herbs", price: 10 }, { name: "Chili Flakes", price: 15 }] },
  { name: "Cheese Burger", price: 199, category: "Burger", image: "", addons: [{ name: "Extra Patty", price: 80 }, { name: "Bacon", price: 60 }, { name: "Extra Cheese", price: 40 }], seasonings: [{ name: "Black Pepper", price: 10 }, { name: "Cajun Spice", price: 15 }] },
  { name: "Chicken Burger", price: 249, category: "Burger", image: "", addons: [{ name: "Extra Patty", price: 80 }, { name: "Spicy Mayo", price: 25 }], seasonings: [{ name: "Peri Peri", price: 20 }, { name: "Lemon Pepper", price: 10 }] },
  { name: "Double Patty Burger", price: 349, category: "Burger", image: "", addons: [{ name: "Extra Cheese", price: 40 }, { name: "Caramelized Onions", price: 30 }], seasonings: [{ name: "Smoked Salt", price: 10 }, { name: "Chipotle", price: 15 }] },
  { name: "Creamy Alfredo Pasta", price: 299, category: "Pasta", image: "", addons: [{ name: "Extra Sauce", price: 40 }, { name: "Grilled Chicken", price: 70 }], seasonings: [{ name: "Parmesan Dust", price: 15 }, { name: "Basil", price: 10 }] },
  { name: "Arrabbiata Pasta", price: 279, category: "Pasta", image: "", addons: [{ name: "Extra Spicy", price: 20 }, { name: "Parmesan", price: 35 }], seasonings: [{ name: "Chili Flakes", price: 10 }, { name: "Garlic Powder", price: 10 }] },
  { name: "Garlic Bread", price: 149, category: "Sides", image: "", addons: [{ name: "Cheese Dip", price: 30 }, { name: "Extra Garlic", price: 15 }], seasonings: [{ name: "Parsley", price: 5 }, { name: "Mixed Herbs", price: 10 }] },
  { name: "French Fries", price: 99, category: "Sides", image: "", addons: [{ name: "Cheese Sauce", price: 35 }], seasonings: [{ name: "Peri Peri", price: 15 }, { name: "Salt & Pepper", price: 5 }, { name: "Sour Cream", price: 20 }] },
  { name: "Chicken Wings (6 pcs)", price: 249, category: "Sides", image: "", addons: [{ name: "Extra Dip", price: 25 }, { name: "Ranch Dressing", price: 30 }], seasonings: [{ name: "Cajun Rub", price: 15 }, { name: "Lemon Pepper", price: 10 }] },
  { name: "Coke 500ml", price: 49, category: "Drinks", image: "", addons: [{ name: "Extra Ice", price: 0 }, { name: "Lemon Slice", price: 10 }], seasonings: [] },
  { name: "Lemon Iced Tea", price: 79, category: "Drinks", image: "", addons: [{ name: "Extra Lemon", price: 10 }, { name: "Mint Leaves", price: 15 }], seasonings: [] },
  { name: "Chocolate Lava Cake", price: 149, category: "Dessert", image: "", addons: [{ name: "Vanilla Ice Cream", price: 40 }, { name: "Chocolate Sauce", price: 25 }], seasonings: [{ name: "Cocoa Dust", price: 5 }] },
  { name: "New York Cheesecake", price: 199, category: "Dessert", image: "", addons: [{ name: "Berry Compote", price: 35 }, { name: "Whipped Cream", price: 20 }], seasonings: [{ name: "Cinnamon", price: 5 }] },
];

export const seedService = {
  async seedFoods() {
    const results = [];
    for (const food of SAMPLE_FOODS) {
      const exists = await foodService.getAll();
      if (exists.find((f) => f.name === food.name)) continue;
      const created = await foodService.create(food);
      results.push(created);
    }
    return results;
  },

  async seedOrders(userId) {
    return demoOrders.seedOrders(userId);
  },
};

