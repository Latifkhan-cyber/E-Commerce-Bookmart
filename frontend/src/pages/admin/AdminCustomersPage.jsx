import React, { useEffect, useState } from 'react';
import { Ban, CheckCircle } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import { TableSkeleton } from '../../components/common/Loader';
import { useToast } from '../../context/ToastContext';

const AdminCustomersPage = () => {
  const { showToast } = useToast();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const { data } = await axiosClient.get('/admin/customers');
      setCustomers(data);
    } catch (err) {
      showToast(err.message || 'Failed to load customers', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const handleToggleBlock = async (id, name, isBlocked) => {
    const action = isBlocked ? 'unblock' : 'block';
    if (window.confirm(`Are you sure you want to ${action} customer "${name}"?`)) {
      try {
        const { data } = await axiosClient.put(`/admin/customers/${id}/block`);
        showToast(data.message, 'info');
        loadCustomers();
      } catch (err) {
        showToast(err.message || 'Failed to update customer status', 'error');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-3xl font-black font-serif text-slate-900">Customer Management</h1>
        <p className="text-xs text-slate-500 mt-1">Review registered user accounts, order volume, and block/unblock accounts</p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6"><TableSkeleton rows={8} /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 font-bold uppercase tracking-wider text-slate-700">
                  <th className="p-4">Customer</th>
                  <th className="p-4">Phone</th>
                  <th className="p-4">Registered Date</th>
                  <th className="p-4">Orders Placed</th>
                  <th className="p-4">Total Spending</th>
                  <th className="p-4">Account Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {customers.map((cust) => (
                  <tr key={cust._id} className="hover:bg-slate-50/50">
                    <td className="p-4 flex items-center gap-3">
                      <img src={cust.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80'} alt={cust.name} className="w-9 h-9 rounded-full object-cover border" />
                      <div>
                        <p className="font-bold text-slate-900">{cust.name}</p>
                        <p className="text-slate-500 text-[11px]">{cust.email}</p>
                      </div>
                    </td>
                    <td className="p-4 text-slate-600">{cust.phone || '—'}</td>
                    <td className="p-4 text-slate-600">{new Date(cust.createdAt).toLocaleDateString()}</td>
                    <td className="p-4 font-bold text-slate-900">{cust.orderCount} Orders</td>
                    <td className="p-4 font-extrabold text-emerald-700">RS {cust.totalSpent.toLocaleString()}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                        cust.isBlocked ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {cust.isBlocked ? 'BLOCKED' : 'ACTIVE'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleToggleBlock(cust._id, cust.name, cust.isBlocked)}
                        className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1 ml-auto ${
                          cust.isBlocked
                            ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                        }`}
                      >
                        {cust.isBlocked ? <CheckCircle className="w-3.5 h-3.5" /> : <Ban className="w-3.5 h-3.5" />}
                        {cust.isBlocked ? 'Unblock' : 'Block Customer'}
                      </button>
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

export default AdminCustomersPage;
