import React, { useEffect, useState } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import Modal from '../../components/common/Modal';
import { useToast } from '../../context/ToastContext';

const AdminPublishersPage = () => {
  const { showToast } = useToast();
  const [publishers, setPublishers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({ name: '', description: '', logo: '' });

  const loadPublishers = async () => {
    setLoading(true);
    try {
      const { data } = await axiosClient.get('/publishers');
      setPublishers(data);
    } catch (err) {
      showToast(err.message || 'Failed to load publishers', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPublishers();
  }, []);

  const handleOpenModal = (publisher = null) => {
    if (publisher) {
      setEditingId(publisher._id);
      setForm({ name: publisher.name, description: publisher.description || '', logo: publisher.logo || '' });
    } else {
      setEditingId(null);
      setForm({ name: '', description: '', logo: '' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axiosClient.put(`/publishers/${editingId}`, form);
        showToast('Publisher updated!', 'success');
      } else {
        await axiosClient.post('/publishers', form);
        showToast('Publisher added!', 'success');
      }
      setIsModalOpen(false);
      loadPublishers();
    } catch (err) {
      showToast(err.message || 'Failed to save publisher', 'error');
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Delete publisher "${name}"?`)) {
      try {
        await axiosClient.delete(`/publishers/${id}`);
        showToast('Publisher removed', 'info');
        loadPublishers();
      } catch (err) {
        showToast(err.message || 'Failed to delete publisher', 'error');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-3xl font-black font-serif text-slate-900">Publishers Management</h1>
          <p className="text-xs text-slate-500 mt-1">Manage publishing houses and logos</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-2xl flex items-center gap-2 shadow"
        >
          <Plus className="w-4 h-4" /> Add Publisher
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 font-bold uppercase tracking-wider text-slate-700">
              <th className="p-4">Publisher</th>
              <th className="p-4">Description</th>
              <th className="p-4">Published Books</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {publishers.map((pub) => (
              <tr key={pub._id} className="hover:bg-slate-50/50">
                <td className="p-4 flex items-center gap-3 font-bold text-slate-900">
                  <img src={pub.logo} alt={pub.name} className="w-10 h-10 rounded-xl object-cover border p-1 bg-slate-50" />
                  {pub.name}
                </td>
                <td className="p-4 text-slate-600 max-w-sm truncate">{pub.description || '—'}</td>
                <td className="p-4 font-bold text-emerald-600">{pub.bookCount || 0} Titles</td>
                <td className="p-4 text-right space-x-2">
                  <button onClick={() => handleOpenModal(pub)} className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(pub._id, pub.name)} className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? 'Edit Publisher' : 'Add Publisher'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Publisher Name *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              className="w-full px-3 py-2 text-xs bg-slate-50 border rounded-xl"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
            <textarea
              rows="3"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-slate-50 border rounded-xl"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Logo URL</label>
            <input
              type="text"
              value={form.logo}
              onChange={(e) => setForm({ ...form, logo: e.target.value })}
              placeholder="https://images.unsplash.com/..."
              className="w-full px-3 py-2 text-xs bg-slate-50 border rounded-xl"
            />
          </div>
          <button type="submit" className="w-full py-3 bg-emerald-600 text-white font-bold text-xs rounded-xl shadow">
            Save Publisher
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default AdminPublishersPage;
