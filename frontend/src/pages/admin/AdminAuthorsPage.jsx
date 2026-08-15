import React, { useEffect, useState } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import Modal from '../../components/common/Modal';
import { useToast } from '../../context/ToastContext';

const AdminAuthorsPage = () => {
  const { showToast } = useToast();
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({ name: '', bio: '', image: '' });

  const loadAuthors = async () => {
    setLoading(true);
    try {
      const { data } = await axiosClient.get('/authors');
      setAuthors(data);
    } catch (err) {
      showToast(err.message || 'Failed to load authors', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAuthors();
  }, []);

  const handleOpenModal = (author = null) => {
    if (author) {
      setEditingId(author._id);
      setForm({ name: author.name, bio: author.bio || '', image: author.image || '' });
    } else {
      setEditingId(null);
      setForm({ name: '', bio: '', image: '' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axiosClient.put(`/authors/${editingId}`, form);
        showToast('Author updated!', 'success');
      } else {
        await axiosClient.post('/authors', form);
        showToast('Author added!', 'success');
      }
      setIsModalOpen(false);
      loadAuthors();
    } catch (err) {
      showToast(err.message || 'Failed to save author', 'error');
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Delete author "${name}"?`)) {
      try {
        await axiosClient.delete(`/authors/${id}`);
        showToast('Author removed', 'info');
        loadAuthors();
      } catch (err) {
        showToast(err.message || 'Failed to delete author', 'error');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-3xl font-black font-serif text-slate-900">Authors Management</h1>
          <p className="text-xs text-slate-500 mt-1">Manage author profiles and bibliographies</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-2xl flex items-center gap-2 shadow"
        >
          <Plus className="w-4 h-4" /> Add Author
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 font-bold uppercase tracking-wider text-slate-700">
              <th className="p-4">Author</th>
              <th className="p-4">Biography</th>
              <th className="p-4">Books Written</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {authors.map((aut) => (
              <tr key={aut._id} className="hover:bg-slate-50/50">
                <td className="p-4 flex items-center gap-3 font-bold text-slate-900">
                  <img src={aut.image} alt={aut.name} className="w-10 h-10 rounded-full object-cover border" />
                  {aut.name}
                </td>
                <td className="p-4 text-slate-600 max-w-sm truncate">{aut.bio || '—'}</td>
                <td className="p-4 font-bold text-emerald-600">{aut.bookCount || 0} Books</td>
                <td className="p-4 text-right space-x-2">
                  <button onClick={() => handleOpenModal(aut)} className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(aut._id, aut.name)} className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? 'Edit Author' : 'Add Author'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Author Name *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              className="w-full px-3 py-2 text-xs bg-slate-50 border rounded-xl"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Biography</label>
            <textarea
              rows="3"
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-slate-50 border rounded-xl"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Photo Image URL</label>
            <input
              type="text"
              value={form.image}
              onChange={(e) => setForm({ ...form, image: e.target.value })}
              placeholder="https://images.unsplash.com/..."
              className="w-full px-3 py-2 text-xs bg-slate-50 border rounded-xl"
            />
          </div>
          <button type="submit" className="w-full py-3 bg-emerald-600 text-white font-bold text-xs rounded-xl shadow">
            Save Author
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default AdminAuthorsPage;
