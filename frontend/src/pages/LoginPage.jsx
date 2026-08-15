import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { BookOpen, LogIn, Mail, Lock } from 'lucide-react';
import { login, clearAuthError } from '../redux/slices/authSlice';
import { useToast } from '../context/ToastContext';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();

  const { userInfo, loading, error } = useSelector((state) => state.auth);

  useEffect(() => {
    if (userInfo) {
      // If user is Admin and no specific deep link was intended, redirect directly to /admin dashboard
      if (location.state?.from?.pathname) {
        navigate(location.state.from.pathname);
      } else if (userInfo.role === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    }
  }, [userInfo, navigate, location]);

  useEffect(() => {
    if (error) {
      showToast(error, 'error');
      dispatch(clearAuthError());
    }
  }, [error, showToast, dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(login({ email, password }));
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 sm:px-6 py-12">
      <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-slate-200 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-emerald-400 text-white flex items-center justify-center shadow-md">
              <BookOpen className="w-6 h-6" />
            </div>
            <span className="text-2xl font-black tracking-tight text-slate-900 font-serif">
              Book<span className="text-emerald-600">Mart</span>
            </span>
          </Link>
          <h2 className="text-xl font-bold text-slate-900 font-serif">Welcome Back</h2>
          <p className="text-xs text-slate-500">Sign in to access your orders, wishlist, or admin console</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
            <div className="relative flex items-center">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="customer@gmail.com"
                className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-bold text-slate-700">Password</label>
              <Link to="/forgot-password" className="text-[11px] font-semibold text-emerald-600 hover:underline">
                Forgot password?
              </Link>
            </div>
            <div className="relative flex items-center">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-2xl transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In'} <LogIn className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Demo Credentials */}
        <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-2 text-slate-600">
          <p className="font-bold text-slate-800">Quick Demo Logins:</p>
          <div className="flex gap-2">
            <button
              onClick={() => { setEmail('admin@bookmart.com'); setPassword('admin123456'); }}
              className="flex-1 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs transition-colors shadow-sm"
            >
              Fill Admin Credentials
            </button>
            <button
              onClick={() => { setEmail('customer@gmail.com'); setPassword('customer123456'); }}
              className="flex-1 px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl text-xs transition-colors"
            >
              Fill Customer Credentials
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-slate-500">
          Don't have an account?{' '}
          <Link to="/register" className="font-bold text-emerald-600 hover:underline">
            Register Now
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
