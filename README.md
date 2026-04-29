# 🍕 Pizza Ordering System

A production-ready full-stack pizza ordering application built with **React (Vite)**, **Tailwind CSS**, and **Firebase**.

---

## Features

### Authentication
- Register / Login / Logout
- Role-based access control (Admin / Customer)
- JWT-based authentication via Firebase Auth
- Protected routes on both frontend and backend

### Customer Features
- Browse food menu with categories and search
- Add items to cart with quantity selector
- Update/remove cart items
- Checkout with total price calculation
- Place orders
- View order history with expandable details

### Admin Features
- Dashboard with stats (orders, revenue, pending, menu items)
- Manage orders (update status: Pending → Confirmed → Delivered / Cancelled)
- Add/Edit/Delete food items
- View all customer orders
- **Admin Approval Flow**: New admin signups require approval via email

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite, React Router, Context API |
| Styling | Tailwind CSS v4, Lucide Icons |
| State | Context API (Auth + Cart) |
| Backend | Firebase Auth + Cloud Firestore |
| HTTP | Axios-ready service layer |
| Notifications | React Hot Toast |

---

## Project Structure

```
src/
├── components/
│   ├── LoadingSpinner.jsx    # Reusable loading spinner
│   ├── Navbar.jsx            # Responsive navigation with role links
│   └── ProtectedRoute.jsx    # Route guard with admin check
├── context/
│   ├── AuthContext.jsx       # Authentication + role state
│   └── CartContext.jsx       # Global cart with Firestore sync
├── firebase/
│   └── config.js             # Firebase initialization
├── pages/
│   ├── Home.jsx              # Food grid with filters
│   ├── Login.jsx             # Login form
│   ├── Register.jsx          # Registration form
│   ├── Cart.jsx              # Shopping cart + checkout
│   ├── Orders.jsx            # Order history
│   ├── AdminDashboard.jsx    # Admin panel
│   ├── AdminApproval.jsx     # Public email approval page
│   └── AddFood.jsx           # Add/Edit food form
├── services/
│   ├── authService.js        # Auth API (login, register, etc.)
│   ├── adminRequestService.js # Admin approval requests + EmailJS
│   ├── foodService.js        # Food CRUD
│   ├── cartService.js        # Cart operations
│   └── orderService.js       # Order management
├── App.jsx                   # Root router with providers
├── main.jsx                  # Entry point
└── index.css                 # Tailwind CSS theme
```

---

## Getting Started

### 1. Clone & Install

```bash
git clone <repo-url>
cd pizza-app
npm install
```

### 2. Configure Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create/use a **production Firebase project** (separate from dev)
3. Enable **Authentication** (Email/Password provider)
4. Create a **Cloud Firestore** database in production mode
5. Copy your **production** config to `.env` (see `.env.example`)
6. Add all `VITE_FIREBASE_*` env vars to your Vercel dashboard

**Copy from `.env.example` and fill in your production Firebase values.**


### 3. Setup EmailJS (Admin Approval Emails)

1. Go to [EmailJS](https://www.emailjs.com/) and create an account
2. Create a new **Email Service** (e.g., Gmail)
3. Create an **Email Template** with these variables:
   - `{{to_email}}` — recipient (navatejar80@gmail.com)
   - `{{admin_name}}` — name of the requesting admin
   - `{{admin_email}}` — email of the requesting admin
   - `{{signup_time}}` — signup timestamp
   - `{{accept_link}}` — approval URL
   - `{{reject_link}}` — rejection URL
4. Copy your credentials to `.env`:

```env
VITE_EMAILJS_SERVICE_ID=your_service_id
VITE_EMAILJS_TEMPLATE_ID=your_template_id
VITE_EMAILJS_PUBLIC_KEY=your_public_key
VITE_APP_URL=https://your-vercel-domain.vercel.app
```

> **Note**: If EmailJS is not configured, approval links are logged to the browser console for manual testing.

### 4. Setup Admin User

After registering a user, manually update their role in Firestore:

```bash
# In Firestore collection "users", set:
# { "role": "admin" }
```

Or use the Firebase Console to edit the document.

### 5. Run Development Server

```bash
npm run dev
```

---

## API Structure (Service Layer)

| Service | Methods | Description |
|---------|---------|-------------|
| `authService` | `login`, `register`, `logout`, `getUserRole`, `getCurrentUserToken` | Authentication |
| `adminRequestService` | `createRequest`, `getRequest`, `getAllPending`, `approve`, `reject`, `processAction` | Admin approval workflow |
| `foodService` | `getAll`, `getById`, `create`, `update`, `delete` | Food menu CRUD |
| `cartService` | `getByUser`, `addItem`, `updateQuantity`, `removeItem`, `clearCart` | Cart management |
| `orderService` | `create`, `getMyOrders`, `getAllOrders`, `updateStatus`, `getById` | Order lifecycle |

---

## Firebase Security Rules

Paste these into **Firestore Database > Rules** for production security:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Helper function
    function isAuthenticated() {
      return request.auth != null;
    }

    function isOwner(userId) {
      return request.auth.uid == userId;
    }

    function isAdmin() {
      return isAuthenticated() && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }

    // Users collection
    match /users/{userId} {
      allow read: if isAuthenticated() && (isOwner(userId) || isAdmin());
      allow create: if isOwner(userId);
      allow update: if isOwner(userId) || isAdmin();
    }

    // Foods collection
    match /foods/{foodId} {
      allow read: if true;  // Public
      allow write: if isAdmin();
    }

    // Cart collection
    match /cart/{cartId} {
      allow read: if isAuthenticated() && 
        resource.data.userId == request.auth.uid;
      allow create: if isAuthenticated() && 
        request.resource.data.userId == request.auth.uid;
      allow update, delete: if isAuthenticated() && 
        resource.data.userId == request.auth.uid;
    }

    // Orders collection
    match /orders/{orderId} {
      allow read: if isAuthenticated() && 
        (resource.data.userId == request.auth.uid || isAdmin());
      allow create: if isAuthenticated() && 
        request.resource.data.userId == request.auth.uid;
      allow update: if isAdmin();
      allow delete: if isAdmin();
    }

    // Admin requests collection
    match /adminRequests/{requestId} {
      allow read: if isAdmin();
      allow create: if isAuthenticated() && 
        request.resource.data.uid == request.auth.uid;
      allow update: if isAdmin();
      allow delete: if isAdmin();
    }
  }
}
```

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `VITE_FIREBASE_API_KEY` | Firebase API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | Auth domain |
| `VITE_FIREBASE_PROJECT_ID` | Project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | Storage bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Messaging sender ID |
| `VITE_FIREBASE_APP_ID` | App ID |
| `VITE_EMAILJS_SERVICE_ID` | EmailJS service ID |
| `VITE_EMAILJS_TEMPLATE_ID` | EmailJS email template ID |
| `VITE_EMAILJS_PUBLIC_KEY` | EmailJS public key |
| `VITE_APP_URL` | Your app's public URL (for email deep links) |

> **Note**: All variables must be prefixed with `VITE_` to be exposed to the client.

---

## Authentication Flow

### Customer Registration
1. **Register**: Creates Firebase Auth user + Firestore user document with `role: "customer"`
2. **Login**: Authenticates with Firebase, loads user profile with role
3. **Token**: Firebase ID token used implicitly for Firestore security rules
4. **Logout**: Clears auth state and redirects to login

### Admin Registration (Approval Required)
1. **Register as Admin**: Creates Firebase Auth user + Firestore user document with `role: "pending_admin"`
2. **Send Approval Email**: An email is sent to `navatejar80@gmail.com` via EmailJS with Accept/Reject links
3. **Approval**: Admin clicks the email link (`/admin-approval?uid=&token=&action=accept`) to approve → role changes to `admin`
4. **Rejection**: Admin clicks reject link → role changes to `rejected`
5. **Pending State**: User with `pending_admin` role can log in but cannot access admin routes
6. **Rejected State**: User with `rejected` role is blocked from admin features

---

## Order Status Flow

```
Pending → Confirmed → Delivered
   ↓
Cancelled
```

Only admins can update order status following the allowed transitions.

---

## Responsive Design

- Mobile-first approach with Tailwind CSS
- Collapsible mobile navigation menu
- Responsive grids (1/2/3/4 columns)
- Sticky cart summary on desktop

---

## License

MIT
