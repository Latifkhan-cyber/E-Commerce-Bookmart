# BookMart - Modern E-Commerce Bookstore

BookMart is a fully functional, production-ready online bookstore built with HTML5, CSS3, Vanilla JavaScript (ES6 Modules), and Firebase Services (Firebase Auth, Firestore, Storage, and Hosting).

---

## Features Overview

### Customer Storefront
- **Responsive Navigation**: Full navbar on desktop, hamburger sidebar on mobile.
- **Hero & Promotions**: Interactive bookstore banner, featured categories, best sellers, and new arrivals.
- **Catalog & Advanced Filtering**: Search by Title, Author, ISBN, Publisher, Category, Price Range, and Rating.
- **Book Details Page**: Image gallery, stock status, verified customer reviews, rating breakdown, and related books.
- **Shopping Cart & Wishlist**: Realtime item management, guest local storage fallback + Firestore user synchronization.
- **Checkout & Cash on Delivery**: Multi-step checkout with address selection, coupon code validation, and stock validation.
- **Customer Account Dashboard**: Profile editing, saved addresses, order history, and step-by-step order tracking.

### Admin Control Panel
- **Admin Dashboard**: Live metrics (Total Books, Customers, Orders, Revenue, Low Stock Alerts).
- **Book Management**: Full CRUD operations with image uploads to Firebase Cloud Storage.
- **Category, Author & Publisher Management**: Full CRUD operations.
- **Order Management**: Status workflow (Pending → Confirmed → Processing → Shipped → Delivered / Cancelled).
- **Customer Moderation**: Customer search, total spending stats, block/unblock capabilities.
- **Coupon System**: Discount creation (fixed / percentage), usage limits, expiration rules.

---

## Directory Structure

```
BookMart/
├── index.html
├── books.html
├── book-details.html
├── categories.html
├── category.html
├── authors.html
├── author-details.html
├── publishers.html
├── publisher-details.html
├── deals.html
├── cart.html
├── wishlist.html
├── checkout.html
├── orders.html
├── order-details.html
├── account.html
├── login.html
├── register.html
├── forgot-password.html
├── reset-password.html
│
├── admin/
│   ├── index.html
│   ├── books.html
│   ├── book-create.html
│   ├── book-edit.html
│   ├── categories.html
│   ├── authors.html
│   ├── publishers.html
│   ├── orders.html
│   ├── order-details.html
│   ├── customers.html
│   ├── reviews.html
│   ├── coupons.html
│   ├── inventory.html
│   └── analytics.html
│
├── css/
│   ├── style.css
│   ├── responsive.css
│   ├── auth.css
│   ├── shop.css
│   ├── cart.css
│   ├── checkout.css
│   ├── account.css
│   └── admin.css
│
├── js/
│   ├── firebase-config.js
│   ├── auth.js
│   ├── auth-guard.js
│   ├── navbar.js
│   ├── footer.js
│   ├── books.js
│   ├── book-details.js
│   ├── categories.js
│   ├── authors.js
│   ├── publishers.js
│   ├── cart.js
│   ├── wishlist.js
│   ├── checkout.js
│   ├── orders.js
│   ├── reviews.js
│   ├── profile.js
│   ├── addresses.js
│   ├── search.js
│   ├── coupons.js
│   ├── notifications.js
│   ├── utils.js
│   └── seed-data.js
│
├── js/admin/
│   ├── admin-auth.js
│   ├── dashboard.js
│   ├── books.js
│   ├── categories.js
│   ├── authors.js
│   ├── publishers.js
│   ├── orders.js
│   ├── customers.js
│   ├── reviews.js
│   ├── coupons.js
│   ├── inventory.js
│   └── analytics.js
│
├── firebase.json
├── firestore.rules
├── storage.rules
├── firestore.indexes.json
└── README.md
```

---

## Firebase Setup Instructions

1. **Create Firebase Project**: Go to [Firebase Console](https://console.firebase.google.com/) and create a new project named `bookmart-store`.
2. **Enable Firebase Authentication**:
   - Enable **Email/Password** sign-in provider under Authentication > Sign-in method.
3. **Enable Firestore Database**:
   - Create a Firestore Database in Production mode.
   - Deploy `firestore.rules` and `firestore.indexes.json`.
4. **Enable Cloud Storage**:
   - Create a Storage bucket.
   - Deploy `storage.rules`.
5. **Configure `js/firebase-config.js`**:
   - Replace the `firebaseConfig` object values in `js/firebase-config.js` with your project's Firebase client keys.

---

## Local Development

Start a local static server using Node.js / `serve`:

```bash
npm start
```

Navigate to `http://localhost:3000` in your web browser.

---

## Admin Account Setup

1. Register a user via `register.html` (e.g. `admin@bookmart.com`).
2. In the Firestore console, open the `users` collection, locate your user document (`users/{uid}`), and edit the `role` field from `"CUSTOMER"` to `"ADMIN"`.
3. You can now access the Admin Dashboard at `/admin/index.html`.

---

## Firebase Deployment

```bash
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```
