import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Package, Clock, Eye, ChevronRight } from 'lucide-react';
import { fetchMyOrders } from '../redux/slices/orderSlice';
import EmptyState from '../components/common/EmptyState';
import { Spinner } from '../components/common/Loader';

const OrdersPage = () => {
  const dispatch = useDispatch();
  const { orders, loading } = useSelector((state) => state.orders);
  const { userInfo } = useSelector((state) => state.auth);

  useEffect(() => {
    if (userInfo) {
      dispatch(fetchMyOrders());
    }
  }, [dispatch, userInfo]);

  if (!userInfo) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <EmptyState
          icon="orders"
          title="Sign in to view your orders"
          description="Log in to view order history, tracking updates, and download invoices."
          actionText="Log In Now"
          actionLink="/login"
        />
      </div>
    );
  }

  if (loading && orders.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <EmptyState
          icon="orders"
          title="No Orders Placed Yet"
          description="You haven't placed any book orders yet. Start exploring our bookstore catalog!"
          actionText="Browse Books"
          actionLink="/books"
        />
      </div>
    );
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Delivered':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Shipped':
        return 'bg-sky-100 text-sky-800 border-sky-200';
      case 'Processing':
      case 'Confirmed':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Cancelled':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="pb-6 border-b border-slate-200">
        <h1 className="text-3xl font-black font-serif text-slate-900">Order History</h1>
        <p className="text-xs text-slate-500 mt-1">Track status and review past book orders</p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100">
        {orders.map((order) => (
          <div key={order._id} className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <span className="font-extrabold text-slate-900 text-sm">{order.orderId}</span>
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${getStatusBadge(order.orderStatus)}`}>
                  {order.orderStatus}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Placed on {new Date(order.createdAt).toLocaleDateString()} | {order.items.length} Items | Total: RS {order.total.toLocaleString()}
              </p>
            </div>

            <Link
              to={`/orders/${order.orderId || order._id}`}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors"
            >
              <Eye className="w-4 h-4 text-slate-600" /> View Order & Track
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrdersPage;
