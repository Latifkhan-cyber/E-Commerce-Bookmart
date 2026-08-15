import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';

// Layout & Common Components
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import ProtectedRoute from './components/common/ProtectedRoute';
import AdminRoute from './components/common/AdminRoute';

// Customer Pages
import HomePage from './pages/HomePage';
import BooksPage from './pages/BooksPage';
import BookDetailsPage from './pages/BookDetailsPage';
import CategoriesPage from './pages/CategoriesPage';
import AuthorsPage from './pages/AuthorsPage';
import AuthorDetailsPage from './pages/AuthorDetailsPage';
import PublishersPage from './pages/PublishersPage';
import PublisherDetailsPage from './pages/PublisherDetailsPage';
import DealsPage from './pages/DealsPage';
import CartPage from './pages/CartPage';
import WishlistPage from './pages/WishlistPage';
import CheckoutPage from './pages/CheckoutPage';
import OrdersPage from './pages/OrdersPage';
import OrderDetailsPage from './pages/OrderDetailsPage';
import AccountPage from './pages/AccountPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';

// Admin Pages
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminBooksPage from './pages/admin/AdminBooksPage';
import AdminBookFormPage from './pages/admin/AdminBookFormPage';
import AdminCategoriesPage from './pages/admin/AdminCategoriesPage';
import AdminAuthorsPage from './pages/admin/AdminAuthorsPage';
import AdminPublishersPage from './pages/admin/AdminPublishersPage';
import AdminOrdersPage from './pages/admin/AdminOrdersPage';
import AdminCustomersPage from './pages/admin/AdminCustomersPage';
import AdminInventoryPage from './pages/admin/AdminInventoryPage';
import AdminCouponsPage from './pages/admin/AdminCouponsPage';
import AdminAnalyticsPage from './pages/admin/AdminAnalyticsPage';

function App() {
  const location = useLocation();
  const isAdminPath = location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      {!isAdminPath && <Navbar />}

      <main className="flex-grow">
        <Routes>
          {/* Public Customer Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/books" element={<BooksPage />} />
          <Route path="/books/:idOrSlug" element={<BookDetailsPage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/authors" element={<AuthorsPage />} />
          <Route path="/authors/:idOrSlug" element={<AuthorDetailsPage />} />
          <Route path="/publishers" element={<PublishersPage />} />
          <Route path="/publishers/:idOrSlug" element={<PublisherDetailsPage />} />
          <Route path="/deals" element={<DealsPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/wishlist" element={<WishlistPage />} />

          {/* Auth Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

          {/* Protected Customer Routes */}
          <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
          <Route path="/orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
          <Route path="/orders/:id" element={<ProtectedRoute><OrderDetailsPage /></ProtectedRoute>} />
          <Route path="/account" element={<ProtectedRoute><AccountPage /></ProtectedRoute>} />

          {/* Admin Panel Routes */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            }
          >
            <Route index element={<AdminDashboardPage />} />
            <Route path="books" element={<AdminBooksPage />} />
            <Route path="books/create" element={<AdminBookFormPage />} />
            <Route path="books/:id/edit" element={<AdminBookFormPage />} />
            <Route path="categories" element={<AdminCategoriesPage />} />
            <Route path="authors" element={<AdminAuthorsPage />} />
            <Route path="publishers" element={<AdminPublishersPage />} />
            <Route path="orders" element={<AdminOrdersPage />} />
            <Route path="customers" element={<AdminCustomersPage />} />
            <Route path="inventory" element={<AdminInventoryPage />} />
            <Route path="coupons" element={<AdminCouponsPage />} />
            <Route path="analytics" element={<AdminAnalyticsPage />} />
          </Route>
        </Routes>
      </main>

      {!isAdminPath && <Footer />}
    </div>
  );
}

export default App;
