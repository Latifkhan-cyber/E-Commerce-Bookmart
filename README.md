# BookMart - Modern E-Commerce Bookstore 📚

BookMart is a modern, fully responsive online e-commerce bookstore built with HTML5, Vanilla CSS3, JavaScript (ES6 Modules), and Firebase Services (Firebase Auth, Firestore, Storage). All prices are formatted in **PKR (Pakistani Rupee)**.

---

## 🌟 Key Features

### 🛒 Customer Storefront
- **Responsive Mobile Layout**: Fully optimized 2-column mobile layout with touch-scrollable cart and data tables.
- **Dynamic Catalog & Filtering**: Search and filter titles by Category, Author, Publisher, Price Range (in PKR), and Star Rating.
- **Book Details Page**: Interactive image gallery, stock availability, verified reviews, and related titles.
- **Cart & Wishlist**: Real-time management with guest `localStorage` fallback + instant Firebase Firestore sync.
- **Checkout & COD**: Multi-step checkout with saved shipping addresses, coupon validation, and Cash on Delivery (COD).
- **User Dashboard**: Profile editing, saved addresses, order history, and live tracking timelines.

### 🛡️ Admin Control Panel
- **Dashboard Overview**: Live analytics for total revenue (PKR), orders placed, low stock alerts, and registered customers.
- **Inventory & Book Management**: Full CRUD operations for managing titles, categories, authors, and publishers.
- **Order Management**: Status progression (Pending → Confirmed → Processing → Shipped → Delivered / Cancelled).
- **Coupons & Discounts**: Create percentage or fixed-amount PKR coupons with minimum order rules.

---

## 🛠️ Technology Stack

- **Frontend**: HTML5, Vanilla CSS3 (Custom Design System with Design Tokens)
- **Logic**: Vanilla JavaScript (ES6+ Modules)
- **Backend & Database**: Firebase Firestore, Firebase Authentication, Firebase Storage
- **Currency**: PKR (`Rs.`)

---

## 🚀 Quick Start (Local Development)

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Latifkhan-cyber/E-Commerce-Bookmart.git
   cd E-Commerce-Bookmart
   ```

2. **Serve locally**:
   ```bash
   npx serve -l 3000 .
   ```

3. **Open in browser**:
   Navigate to `http://localhost:3000`

---

## 🔧 Firebase Configuration

1. Copy `.env.example` to `.env` (or configure [`js/firebase-config.js`](file:///e:/My%20Projects/E-Commerce-Bookmart/js/firebase-config.js)):
   ```javascript
   const firebaseConfig = {
     apiKey: "YOUR_API_KEY",
     authDomain: "YOUR_PROJECT.firebaseapp.com",
     projectId: "YOUR_PROJECT_ID",
     storageBucket: "YOUR_PROJECT.appspot.com",
     messagingSenderId: "YOUR_SENDER_ID",
     appId: "YOUR_APP_ID"
   };
   ```
2. Enable **Email/Password** in Firebase Authentication.
3. Deploy Firestore rules ([`firestore.rules`](file:///e:/My%20Projects/E-Commerce-Bookmart/firestore.rules)) and Storage rules ([`storage.rules`](file:///e:/My%20Projects/E-Commerce-Bookmart/storage.rules)).

---

## 👤 Admin Access Setup

1. Register an account via `/register.html`.
2. In your Firebase Console > Firestore > `users` collection, locate your user UID and change `role` to `"ADMIN"`.
3. Access the admin dashboard at `/admin/index.html`.

---

## 📄 License

This project is licensed under the MIT License.
