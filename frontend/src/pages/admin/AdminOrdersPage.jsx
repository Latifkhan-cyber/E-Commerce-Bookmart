import React, { useEffect, useState } from 'react';
import { Eye, Clock } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import { TableSkeleton } from '../../components/common/Loader';
import { useToast } from '../../context/ToastContext';

const AdminOrdersPage = () => {
  const { showToast } = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const { data } = await axiosClient.get('/admin/orders');
      setOrders(data);
    } catch (err) {
      showToast(err.message || 'Failed to load orders', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await axiosClient.put(`/admin/orders/${orderId}/status`, { orderStatus: newStatus });
      showToast(`Order status updated to ${newStatus}`, 'success');
      loadOrders();
    } catch (err) {
      showToast(err.message || 'Failed to update order status', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-3xl font-black font-serif text-slate-900">Orders Management</h1>
        <p className="text-xs text-slate-500 mt-1">Review customer orders, update delivery status, and mark payments</p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6"><TableSkeleton rows={8} /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 font-bold uppercase tracking-wider text-slate-700">
                  <th className="p-4">Order ID</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Total</th>
                  <th className="p-4">Payment</th>
                  <th className="p-4">Order Workflow Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {orders.map((ord) => (
                  <tr key={ord._id} className="hover:bg-slate-50/50">
                    <td className="p-4 font-extrabold text-slate-900">{ord.orderId}</td>
                    <td className="p-4">
                      <p className="font-bold text-slate-900">{ord.user?.name || 'Customer'}</p>
                      <p className="text-[11px] text-slate-500">{ord.user?.email}</p>
                    </td>
                    <td className="p-4 text-slate-600">{new Date(ord.createdAt).toLocaleDateString()}</td>
                    <td className="p-4 font-extrabold text-slate-900">RS {ord.total.toLocaleString()}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                        ord.paymentStatus === 'Paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {ord.paymentMethod} ({ord.paymentStatus})
                      </span>
                    </td>
                    <td className="p-4">
                      <select
                        value={ord.orderStatus}
                        onChange={(e) => handleStatusChange(ord._id, e.target.value)}
                        className={`px-3 py-1.5 rounded-xl font-bold text-xs border focus:outline-none ${
                          ord.orderStatus === 'Delivered'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : ord.orderStatus === 'Cancelled'
                            ? 'bg-rose-50 text-rose-800 border-rose-300'
                            : 'bg-amber-50 text-amber-800 border-amber-300'
                        }`}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrdersPage;
