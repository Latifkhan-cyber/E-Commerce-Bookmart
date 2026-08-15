import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { DollarSign, Package, BookOpen, Users, Clock, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import { Spinner } from '../../components/common/Loader';

const AdminDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const { data } = await axiosClient.get('/admin/stats');
        setStats(data);
      } catch (err) {
        console.error('Failed to load admin stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading || !stats) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  const statCards = [
    { title: 'Total Revenue', value: `RS ${stats.totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'bg-emerald-500' },
    { title: 'Total Orders', value: stats.totalOrders, icon: Package, color: 'bg-sky-500' },
    { title: 'Total Books', value: stats.totalBooks, icon: BookOpen, color: 'bg-purple-500' },
    { title: 'Registered Customers', value: stats.totalCustomers, icon: Users, color: 'bg-amber-500' },
    { title: 'Pending Orders', value: stats.pendingOrders, icon: Clock, color: 'bg-amber-600' },
    { title: 'Delivered Orders', value: stats.deliveredOrders, icon: CheckCircle2, color: 'bg-emerald-600' },
    { title: 'Low Stock Books', value: stats.lowStockBooks, icon: AlertTriangle, color: 'bg-rose-500' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black font-serif text-slate-900">Dashboard Overview</h1>
        <p className="text-xs text-slate-500 mt-1">Real-time bookstore analytics and sales metrics</p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className={`p-3.5 rounded-2xl text-white ${card.color} shadow-md`}>
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">{card.title}</p>
                <p className="text-2xl font-black text-slate-900">{card.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Top 5 Best Sellers */}
        <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm font-serif">Top Bestselling Books</h3>
            <Link to="/admin/books" className="text-xs font-bold text-emerald-600 flex items-center gap-1">
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {stats.bestSellers.map((book) => (
              <div key={book._id} className="flex items-center gap-4 p-2 rounded-xl hover:bg-slate-50 transition-colors">
                <img src={book.coverImage} alt={book.title} className="w-10 h-14 object-contain rounded bg-slate-50 p-1 border" />
                <div className="flex-1">
                  <p className="font-bold text-slate-900 text-xs line-clamp-1">{book.title}</p>
                  <p className="text-[11px] text-slate-500">RS {book.price.toLocaleString()} | Stock: {book.stock}</p>
                </div>
                <span className="px-3 py-1 bg-emerald-50 text-emerald-800 font-bold text-xs rounded-lg">
                  {book.soldCount} Copies Sold
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Low Stock Warning Box */}
        <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm font-serif flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" /> Low Inventory Alert
            </h3>
            <Link to="/admin/inventory" className="text-xs font-bold text-emerald-600">
              Manage Stock
            </Link>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            There are currently <span className="font-bold text-rose-600">{stats.lowStockBooks} books</span> with 5 or fewer copies remaining. Update inventory stock to prevent out-of-stock orders.
          </p>

          <Link
            to="/admin/inventory"
            className="inline-block w-full py-3 bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold text-xs rounded-xl text-center border border-amber-200 transition-colors"
          >
            Review Low Stock Items
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
