# BookMart - Production-Ready Full-Stack Online Bookstore

**BookMart** is a modern, high-performance, full-stack e-commerce bookstore where customers can discover, search, filter, purchase, track, and review books. It features a complete customer storefront and a separate, role-protected administrative dashboard for inventory, orders, analytics, authors, publishers, categories, and promo coupons.

---

## 🚀 Technology Stack

### Frontend
- **Framework**: React 18 with Vite
- **Styling**: Tailwind CSS & Modern Typography (Inter & Merriweather Google Fonts)
- **State Management**: Redux Toolkit & React Redux
- **Routing**: React Router DOM v6 (Nested routes & Role-based Protection)
- **HTTP Client**: Axios with Bearer token interceptors
- **Icons**: Lucide React
- **Notifications**: Custom Glassmorphism Toast Context Portal

### Backend
- **Runtime**: Node.js & Express.js
- **Database**: MongoDB & Mongoose ORM
- **Authentication**: JSON Web Token (JWT) & bcryptjs password hashing
- **File Storage**: Cloudinary SDK with Multer & disk fallback for offline dev
- **Middleware**: Express Async Handler, CORS, Auth & Role Authorization

---

## 🔥 Main Features

### Customer Storefront
- 🔐 **Authentication & Profile**: User registration, login, JWT session persistence, password reset flow, and address book manager.
- 📚 **Catalog Browsing**: Multi-criteria sidebar filters (Category, Author, Publisher, Price Range slider, Rating, In-Stock only), live multi-field search (title, author, ISBN), sorting (Newest, Oldest, Price Low/High, Popular, Highest Rated), and clean pagination.
- 📖 **Book Details**: Cover image gallery, stock availability badges, discount percentage tags, spec table, verified purchase customer reviews & rating submission form, and related book recommendations.
- 🛒 **Cart & Wishlist**: Real-time stock limit checks, quantity controls, wishlist database persistence, and promo coupon discount engine.
- 💳 **Cash on Delivery Checkout**: Multi-step checkout with address selection/creation, order summary calculation, free shipping threshold (RS 2000+), and COD confirmation.
- 📦 **Order History & Tracking**: Order status progress timeline (Placed → Confirmed → Processing → Shipped → Delivered), printable invoice generator, and pending order cancellation with automatic stock restoration.

### Admin Panel (`/admin`)
- 📊 **Dashboard Analytics**: Revenue stats, total orders count, pending/delivered orders, customer volume, low stock warning alerts, and top bestseller lists.
- 📖 **Book Management**: Full CRUD for books with cover image file upload support to Cloudinary or disk.
- 📂 **Category, Author & Publisher Management**: Full CRUD with book counts per entity.
- 🚚 **Order Workflow Manager**: Live status transition dropdowns (`Pending`, `Confirmed`, `Processing`, `Shipped`, `Delivered`, `Cancelled`).
- 👤 **Customer Management**: User list with order counts, total spending metrics, and instant Block/Unblock toggle.
- 🏷️ **Coupons Engine**: Create fixed or percentage promo codes with min spend and usage limits.
- 📦 **Inventory & Stock Manager**: Real-time stock status monitoring with low-stock warnings and quick-save stock updating.

---

## 📂 Project Directory Structure

```
E-Commerce-Bookmart/
├── backend/
│   ├── config/             # DB & Cloudinary configuration
│   ├── controllers/        # Express REST API controllers
│   ├── middleware/         # Auth JWT, Admin Role Check, Multer Upload, Error Handlers
│   ├── models/             # 12 Mongoose Schemas (User, Book, Category, Author, Publisher, Order, Review, Cart, Wishlist, Address, Coupon, Newsletter)
│   ├── routes/             # Express API routes
│   ├── seeders/            # Database seeder (20+ books, categories, admin user)
│   ├── uploads/            # Local temp fallback image directory
│   ├── .env.example
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── api/            # Axios Client with token interceptor
│   │   ├── components/     # Reusable components (Navbar, Footer, BookCard, RatingStars, OrderStatusTimeline, Modal, Toast)
│   │   ├── context/        # Toast Context Provider
│   │   ├── pages/          # Storefront & Admin Pages
│   │   ├── redux/          # Redux Store & Slices
│   │   ├── App.jsx         # App router configuration
│   │   └── main.jsx
│   ├── index.html
│   ├── tailwind.config.js
│   └── vite.config.js
├── package.json            # Root script orchestrator
└── README.md
```

---

## 🛠️ Quick Start & Local Setup

### 1. Prerequisites
- Node.js (v18 or higher)
- MongoDB installed locally OR a free MongoDB Atlas Cluster connection URI.

### 2. Environment Setup

Copy `.env.example` in `backend/` to `backend/.env`:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/bookmart
JWT_SECRET=bookmart_super_secret_jwt_key_2026_safe
JWT_EXPIRE=30d

CLOUDINARY_CLOUD_NAME=demo
CLOUDINARY_API_KEY=123456789
CLOUDINARY_API_SECRET=abcdef123456

ADMIN_EMAIL=admin@bookmart.com
ADMIN_PASSWORD=admin123456
```

Copy `.env.example` in `frontend/` to `frontend/.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Seed Database
To populate MongoDB with 20+ realistic books, categories, authors, publishers, promo coupons, and default credentials:
```bash
cmd /c "npm --prefix backend run seed"
```

**Default Admin Credentials**:
- **Email**: `admin@bookmart.com`
- **Password**: `admin123456`

**Default Customer Credentials**:
- **Email**: `customer@gmail.com`
- **Password**: `customer123456`

### 4. Run Application
Run both backend REST server (Port 5000) and frontend Vite app (Port 3000) concurrently:
```bash
cmd /c "npm run dev"
```

Or run individually:
```bash
# Terminal 1: Backend
cmd /c "npm --prefix backend run dev"

# Terminal 2: Frontend
cmd /c "npm --prefix frontend run dev"
```

---

## 🧪 Testing Checklist

1. **Auth & Roles**: Log in as `admin@bookmart.com` to access `/admin`. Log out and verify non-admin users are blocked from `/admin`.
2. **Catalog Filters**: Search "Clean Code", filter by "Programming" category, price range, and sorting.
3. **Cart & Wishlist**: Add items, test stock limit warning, apply promo coupon `WELCOME10` at cart/checkout.
4. **Checkout**: Place Cash on Delivery order, verify stock deduction, check order history timeline (`/orders`).
5. **Verified Review**: Attempt to review a book before delivery vs after delivered status.
6. **Admin Panel**: Add a new book with image upload, change an order status to `Delivered`, block/unblock a customer.

---

## ⚡ Deployment Guidance

- **Frontend**: Deploy `frontend/` to **Vercel** or **Netlify** (`npm run build`). Set `VITE_API_URL` environment variable.
- **Backend**: Deploy `backend/` to **Render** or **Railway**. Set `MONGO_URI`, `JWT_SECRET`, and `CLOUDINARY_*` environment variables.
- **Database**: Host on **MongoDB Atlas**.
