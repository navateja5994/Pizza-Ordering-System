# TODO: Admin Signup Approval Flow

## Plan Overview
Implement admin approval workflow where new admin signups send approval email to navatejar80@gmail.com with Accept/Reject buttons.

## Implementation Steps

### 1. Dependencies & Services [DONE]
- [x] `package.json`: Add `@emailjs/browser`
- [x] `src/services/adminRequestService.js`: Create admin requests + send EmailJS email
- [x] `src/services/demoStorage.js`: Add demo admin request support

### 2. Data Model & Auth [DONE]
- [x] `src/services/authService.js`: Admin signup → create pending request + send email
- [x] `src/context/AuthContext.jsx`: Handle `pending_admin` / `rejected` roles
- [x] `src/components/ProtectedRoute.jsx`: Block pending admins

### 3. UI Updates [DONE]
- [x] `src/Pages/Register.jsx`: Show pending message for admin signup
- [x] `src/Pages/Login.jsx`: Show pending/rejected messages
- [x] `src/Pages/AdminDashboard.jsx`: Add "Pending Admins" tab
- [x] `src/Pages/AdminApproval.jsx`: Public approval page for email links
- [x] `src/App.jsx`: Add `/admin-approval` route
- [x] `src/components/Navbar.jsx`: Show pending/rejected banners

### 4. Deployment Setup [DONE]
- [x] Update README.md with EmailJS setup instructions
- [x] Update Firestore security rules
- [x] Build verified successfully

## Deployment Checklist for Vercel

### Environment Variables (Vercel Dashboard → Project Settings → Environment Variables)
| Variable | Value |
|----------|-------|
| `VITE_FIREBASE_API_KEY` | Your Firebase API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | Your Firebase auth domain |
| `VITE_FIREBASE_PROJECT_ID` | Your Firebase project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | Your Firebase storage bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Your Firebase messaging sender ID |
| `VITE_FIREBASE_APP_ID` | Your Firebase app ID |
| `VITE_EMAILJS_SERVICE_ID` | Your EmailJS service ID |
| `VITE_EMAILJS_TEMPLATE_ID` | Your EmailJS template ID |
| `VITE_EMAILJS_PUBLIC_KEY` | Your EmailJS public key |
| `VITE_APP_URL` | Your Vercel deployment URL |

### Firestore Collections to Create
1. `users` — stores user profiles with `role` field
2. `foods` — stores menu items
3. `orders` — stores customer orders
4. `adminRequests` — stores pending admin approval requests

### Firestore Security Rules
Copy the updated rules from README.md into Firebase Console → Firestore Database → Rules

### EmailJS Template Variables
Make sure your EmailJS template uses these variables:
- `{{to_email}}`
- `{{admin_name}}`
- `{{admin_email}}`
- `{{signup_time}}`
- `{{accept_link}}`
- `{{reject_link}}`
