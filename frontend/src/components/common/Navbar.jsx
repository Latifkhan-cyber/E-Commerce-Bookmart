import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  BookOpen,
  Search,
  ShoppingBag,
  Heart,
  User,
  Menu,
  X,
  LogOut,
  LayoutDashboard,
  Package,
  ChevronDown
} from 'lucide-react';
import { logout } from '../../redux/slices/authSlice';
import { useToast } from '../../context/ToastContext';

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();

  const { userInfo } = useSelector((state) => state.auth);
  const { items: cartItems } = useSelector((state) => state.cart);
  const { books: wishlistBooks } = useSelector((state) => state.wishlist);

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const wishlistCount = wishlistBooks.length;

  const handleLogout = () => {
    dispatch(logout());
    setUserDropdownOpen(false);
    showToast('Logged out successfully', 'info');
    navigate('/login');
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Books', path: '/books' },
    { name: 'Categories', path: '/categories' },
    { name: 'Authors', path: '/authors' },
    { name: 'Publishers', path: '/publishers' },
    { name: 'Deals', path: '/deals' },
  ];

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-700 to-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-600/20 group-hover:scale-105 transition-transform">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-slate-900 font-serif">
                Book<span className="text-emerald-600">Mart</span>
              </span>
              <span className="block text-[10px] font-medium text-slate-400 -mt-1 tracking-widest uppercase">
                Online Bookstore
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-colors ${
                  isActive(link.path)
                    ? 'text-emerald-600 bg-emerald-50'
                    : 'text-slate-600 hover:text-emerald-600 hover:bg-slate-50'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Prominent Admin Panel shortcut button if logged in as Admin */}
            {userInfo && userInfo.role === 'ADMIN' && (
              <Link
                to="/admin"
                className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-bold text-xs rounded-xl transition-all shadow-sm"
              >
                <LayoutDashboard className="w-4 h-4 text-emerald-700" /> Admin Console
              </Link>
            )}

            {/* Search link icon button */}
            <Link
              to="/books"
              className="p-2 text-slate-600 hover:text-emerald-600 hover:bg-slate-100 rounded-full transition-colors"
              title="Search Catalog"
            >
              <Search className="w-5 h-5" />
            </Link>

            {/* Wishlist Icon */}
            <Link
              to="/wishlist"
              className="relative p-2 text-slate-600 hover:text-emerald-600 hover:bg-slate-100 rounded-full transition-colors"
              title="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-extrabold rounded-full flex items-center justify-center animate-pulse">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart Icon */}
            <Link
              to="/cart"
              className="relative p-2 text-slate-600 hover:text-emerald-600 hover:bg-slate-100 rounded-full transition-colors"
              title="Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-emerald-600 text-white text-[10px] font-extrabold rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* User Account / Auth */}
            {userInfo ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-full hover:bg-slate-100 transition-colors border border-slate-200"
                >
                  <img
                    src={userInfo.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80'}
                    alt={userInfo.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <span className="hidden lg:inline text-xs font-bold text-slate-700 max-w-[100px] truncate">
                    {userInfo.name.split(' ')[0]}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden lg:inline" />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-fade-in"
                    onMouseLeave={() => setUserDropdownOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-900 truncate">{userInfo.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{userInfo.email}</p>
                      {userInfo.role === 'ADMIN' && (
                        <span className="inline-block mt-1 px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-extrabold rounded-md">
                          ADMINISTRATOR
                        </span>
                      )}
                    </div>

                    {userInfo.role === 'ADMIN' && (
                      <Link
                        to="/admin"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-emerald-700 bg-emerald-50/60 hover:bg-emerald-100"
                      >
                        <LayoutDashboard className="w-4 h-4 text-emerald-700" />
                        Admin Dashboard
                      </Link>
                    )}

                    <Link
                      to="/account"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      <User className="w-4 h-4" />
                      My Profile
                    </Link>

                    <Link
                      to="/orders"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      <Package className="w-4 h-4" />
                      My Orders
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 border-t border-slate-100 mt-1"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm hover:shadow"
              >
                Sign In
              </Link>
            )}

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-2 animate-fade-in">
          {userInfo && userInfo.role === 'ADMIN' && (
            <Link
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-4 py-3 rounded-xl text-xs font-extrabold text-emerald-800 bg-emerald-100"
            >
              <LayoutDashboard className="w-4 h-4" /> Admin Console Dashboard
            </Link>
          )}

          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-4 py-2.5 rounded-xl text-sm font-semibold ${
                isActive(link.path)
                  ? 'text-emerald-600 bg-emerald-50'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              {link.name}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
};

export default Navbar;
