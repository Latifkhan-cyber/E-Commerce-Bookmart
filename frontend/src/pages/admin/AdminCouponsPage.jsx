import React, { useEffect, useState } from 'react';
import { Plus, Trash2, Tag } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import Modal from '../../components/common/Modal';
import { useToast } from '../../context/ToastContext';

const AdminCouponsPage = () => {
  const { showToast } = useToast();
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [form, setForm] = useState({
    code: '',
    discountType: 'percentage',
    discountValue: 10,
    minOrderAmount: 1000,
    maxDiscountAmount: 500,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    usageLimit: 100,
  });

  const loadCoupons = async () => {
    setLoading(true);
    try {
      const { data } = await axiosClient.get('/coupons');
      setCoupons(data);
    } catch (err) {
      showToast(err.message || 'Failed to load coupons', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axiosClient.post('/coupons', form);
      showToast(`Coupon "${form.code.toUpperCase()}" created!`, 'success');
      setIsModalOpen(false);
      setForm({
        code: '',
        discountType: 'percentage',
        discountValue: 10,
        minOrderAmount: 1000,
        maxDiscountAmount: 500,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        usageLimit: 100,
      });
      loadCoupons();
    } catch (err) {
      showToast(err.message || 'Failed to create coupon', 'error');
    }
  };

  const handleDelete = async (id, code) => {
    if (window.confirm(`Delete coupon "${code}"?`)) {
      try {
        await axiosClient.delete(`/coupons/${id}`);
        showToast('Coupon removed', 'info');
        loadCoupons();
      } catch (err) {
        showToast(err.message || 'Failed to delete coupon', 'error');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-3xl font-black font-serif text-slate-900">Coupons Engine</h1>
          <p className="text-xs text-slate-500 mt-1">Manage promo discount codes and customer vouchers</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-2xl flex items-center gap-2 shadow"
        >
          <Plus className="w-4 h-4" /> Create Coupon
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 font-bold uppercase tracking-wider text-slate-700">
              <th className="p-4">Coupon Code</th>
              <th className="p-4">Discount Value</th>
              <th className="p-4">Min Spend</th>
              <th className="p-4">Usage Limit</th>
              <th className="p-4">Expiry Date</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {coupons.map((c) => (
              <tr key={c._id} className="hover:bg-slate-50/50">
                <td className="p-4 font-black text-slate-900 flex items-center gap-2">
                  <Tag className="w-4 h-4 text-emerald-600" /> {c.code}
                </td>
                <td className="p-4 font-bold text-emerald-700">
                  {c.discountType === 'percentage' ? `${c.discountValue}% OFF` : `RS ${c.discountValue} OFF`}
                </td>
                <td className="p-4 text-slate-600">RS {c.minOrderAmount}</td>
                <td className="p-4 text-slate-600">{c.usedCount} / {c.usageLimit} used</td>
                <td className="p-4 text-slate-600">{new Date(c.expiresAt).toLocaleDateString()}</td>
                <td className="p-4 text-right">
                  <button onClick={() => handleDelete(c._id, c.code)} className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Promo Coupon">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Coupon Code (Uppercase) *</label>
            <input
              type="text"
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
              required
              placeholder="e.g. SUMMER2026"
              className="w-full px-3 py-2 text-xs bg-slate-50 border rounded-xl uppercase font-bold"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Type</label>
              <select
                value={form.discountType}
                onChange={(e) => setForm({ ...form, discountType: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border rounded-xl"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount (RS)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Discount Value *</label>
              <input
                type="number"
                value={form.discountValue}
                onChange={(e) => setForm({ ...form, discountValue: Number(e.target.value) })}
                required
                className="w-full px-3 py-2 text-xs bg-slate-50 border rounded-xl"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Min Order Amount (RS)</label>
              <input
                type="number"
                value={form.minOrderAmount}
                onChange={(e) => setForm({ ...form, minOrderAmount: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Max Discount Limit (RS)</label>
              <input
                type="number"
                value={form.maxDiscountAmount}
                onChange={(e) => setForm({ ...form, maxDiscountAmount: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border rounded-xl"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Expiry Date *</label>
              <input
                type="date"
                value={form.expiresAt}
                onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
                required
                className="w-full px-3 py-2 text-xs bg-slate-50 border rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Usage Limit</label>
              <input
                type="number"
                value={form.usageLimit}
                onChange={(e) => setForm({ ...form, usageLimit: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border rounded-xl"
              />
            </div>
          </div>
          <button type="submit" className="w-full py-3 bg-emerald-600 text-white font-bold text-xs rounded-xl shadow">
            Create Coupon
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default AdminCouponsPage;
