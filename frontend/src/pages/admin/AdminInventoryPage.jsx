import React, { useEffect, useState } from 'react';
import { AlertTriangle, Plus, Save } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import { TableSkeleton } from '../../components/common/Loader';
import { useToast } from '../../context/ToastContext';

const AdminInventoryPage = () => {
  const { showToast } = useToast();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stockUpdates, setStockUpdates] = useState({});

  const loadInventory = async () => {
    setLoading(true);
    try {
      const { data } = await axiosClient.get('/admin/inventory');
      setBooks(data);
    } catch (err) {
      showToast(err.message || 'Failed to load inventory', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInventory();
  }, []);

  const handleStockChange = (bookId, newStock) => {
    setStockUpdates(prev => ({ ...prev, [bookId]: Number(newStock) }));
  };

  const handleSaveStock = async (bookId, title) => {
    const newStock = stockUpdates[bookId];
    if (newStock === undefined) return;
    try {
      await axiosClient.put(`/books/${bookId}`, { stock: newStock });
      showToast(`Updated stock for "${title}" to ${newStock}`, 'success');
      loadInventory();
    } catch (err) {
      showToast(err.message || 'Failed to update stock', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-3xl font-black font-serif text-slate-900">Inventory & Stock Control</h1>
        <p className="text-xs text-slate-500 mt-1">Monitor book stock levels, sold counts, and quick update quantities</p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6"><TableSkeleton rows={8} /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 font-bold uppercase tracking-wider text-slate-700">
                  <th className="p-4">Book Title</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Copies Sold</th>
                  <th className="p-4">Stock Status</th>
                  <th className="p-4">Update Quantity</th>
                  <th className="p-4 text-right">Save Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {books.map((book) => {
                  const currentStock = stockUpdates[book._id] !== undefined ? stockUpdates[book._id] : book.stock;
                  return (
                    <tr key={book._id} className="hover:bg-slate-50/50">
                      <td className="p-4 flex items-center gap-3 font-bold text-slate-900">
                        <img src={book.coverImage} alt={book.title} className="w-8 h-12 object-contain rounded bg-slate-50 p-1 border" />
                        <span className="max-w-xs truncate">{book.title}</span>
                      </td>
                      <td className="p-4 text-slate-600">{book.category?.name}</td>
                      <td className="p-4 font-bold text-slate-900">{book.soldCount || 0} Sold</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                          book.stock > 5 ? 'bg-emerald-100 text-emerald-800' : book.stock > 0 ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {book.stock <= 5 && <AlertTriangle className="w-3 h-3 inline mr-1" />}
                          {book.stock > 5 ? 'In Stock' : book.stock > 0 ? 'Low Stock' : 'Out of Stock'}
                        </span>
                      </td>
                      <td className="p-4">
                        <input
                          type="number"
                          value={currentStock}
                          onChange={(e) => handleStockChange(book._id, e.target.value)}
                          min={0}
                          className="w-24 px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900"
                        />
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleSaveStock(book._id, book.title)}
                          disabled={stockUpdates[book._id] === undefined}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1 ml-auto disabled:opacity-40"
                        >
                          <Save className="w-3.5 h-3.5" /> Save Stock
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminInventoryPage;
