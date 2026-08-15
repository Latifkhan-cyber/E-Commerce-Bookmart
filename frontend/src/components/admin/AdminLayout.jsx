import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  LayoutDashboard,
  BookOpen,
  FolderTree,
  Users,
  Building2,
  Package,
  UserCheck,
  Tag,
  Warehouse,
  BarChart3,
  LogOut,
  ArrowLeft
} from 'lucide-react';
import { logout } from '../../redux/slices/authSlice';
import { useToast } from '../../context/ToastContext';

const AdminLayout = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { userInfo } = useSelector((state) => state.auth);

  const menuItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Books Catalog', path: '/admin/books', icon: BookOpen },
    { name: 'Categories', path: '/admin/categories', icon: FolderTree },
    { name: 'Authors', path: '/admin/authors', icon: Users },
    { name: 'Publishers', path: '/admin/publishers', icon: Building2 },
    { name: 'Orders Manager', path: '/admin/orders', icon: Package },
    { name: 'Customers', path: '/admin/customers', icon: UserCheck },
    { name: 'Coupons Engine', path: '/admin/coupons', icon: Tag },
    { name: 'Inventory & Stock', path: '/admin/inventory', icon: Warehouse },
    { name: 'Sales Analytics', path: '/admin/analytics', icon: BarChart3 },
  ];

  const handleLogout = () => {
    dispatch(logout());
    showToast('Logged out of admin panel', 'info');
    navigate('/login');
  };

  const isActive = (path) => {
    if (path === '/admin') return location.pathname === '/admin';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row">
      {/* Admin Sidebar */}
      <aside className="w-full md:w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 border-r border-slate-800">
        {/* Admin Header Branding */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-emerald-400 text-white flex items-center justify-center font-black">
              BM
            </div>
            <div>
              <span className="font-extrabold text-white text-base tracking-tight">Admin Console</span>
              <span className="block text-[10px] text-emerald-400 font-bold uppercase">BookMart HQ</span>
            </div>
          </div>
        </div>

        {/* Navigation items */}
        <nav className="p-4 space-y-1 flex-grow overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
                  isActive(item.path)
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" /> {item.name}
              </Link>
            );
          })}
        </nav>

        {/* User Info & Footer Actions */}
        <div className="p-4 border-t border-slate-800 space-y-2">
          <Link
            to="/"
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Bookstore
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-rose-900/40 hover:bg-rose-900/60 text-rose-300 rounded-xl text-xs font-bold transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" /> Logout Admin
          </button>
        </div>
      </aside>

      {/* Main Content Body */}
      <main className="flex-1 p-6 sm:p-10 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
