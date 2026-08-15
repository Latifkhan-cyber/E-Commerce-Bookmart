import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Plus, Edit, Trash2, Search, Filter } from 'lucide-react';
import { fetchBooks } from '../../redux/slices/bookSlice';
import axiosClient from '../../api/axiosClient';
import { TableSkeleton } from '../../components/common/Loader';
import Pagination from '../../components/common/Pagination';
import { useToast } from '../../context/ToastContext';

const AdminBooksPage = () => {
  const dispatch = useDispatch();
  const { showToast } = useToast();
  const { books, page, pages, totalBooks, loading } = useSelector((state) => state.books);

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    dispatch(fetchBooks({ search: searchTerm, page: currentPage, limit: 10 }));
  }, [dispatch, searchTerm, currentPage]);

  const handleDeleteBook = async (bookId, title) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      try {
        await axiosClient.delete(`/books/${bookId}`);
        showToast(`Book "${title}" removed successfully`, 'info');
        dispatch(fetchBooks({ search: searchTerm, page: currentPage, limit: 10 }));
      } catch (err) {
        showToast(err.message || 'Failed to delete book', 'error');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-3xl font-black font-serif text-slate-900">Books Management</h1>
          <p className="text-xs text-slate-500 mt-1">Manage bookstore inventory, prices, and catalog metadata</p>
        </div>

        <Link
          to="/admin/books/create"
          className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-2xl flex items-center gap-2 shadow"
        >
          <Plus className="w-4 h-4" /> Add New Book
        </Link>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex gap-4 max-w-md">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            placeholder="Search books by title or ISBN..."
            className="w-full pl-10 pr-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Books Data Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6"><TableSkeleton rows={8} /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider">
                  <th className="p-4">Book Details</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">ISBN</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Stock Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {books.map((book) => (
                  <tr key={book._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 flex items-center gap-3">
                      <img src={book.coverImage} alt={book.title} className="w-10 h-14 object-contain rounded bg-slate-50 p-1 border shrink-0" />
                      <div>
                        <p className="font-bold text-slate-900 max-w-xs truncate">{book.title}</p>
                        <p className="text-slate-500 text-[11px]">{book.author?.name || 'Author'}</p>
                      </div>
                    </td>
                    <td className="p-4 text-slate-700 font-semibold">{book.category?.name || 'N/A'}</td>
                    <td className="p-4 text-slate-600 font-mono">{book.isbn}</td>
                    <td className="p-4 font-bold text-slate-900">
                      RS {(book.discountPrice > 0 ? book.discountPrice : book.price).toLocaleString()}
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] ${
                        book.stock > 5 ? 'bg-emerald-100 text-emerald-800' : book.stock > 0 ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {book.stock} left in stock
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <Link
                        to={`/admin/books/${book._id}/edit`}
                        className="p-2 inline-block bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg"
                        title="Edit Book"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleDeleteBook(book._id, book.title)}
                        className="p-2 inline-block bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg"
                        title="Delete Book"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="p-4 border-t border-slate-100">
          <Pagination page={page} pages={pages} onPageChange={(p) => setCurrentPage(p)} />
        </div>
      </div>
    </div>
  );
};

export default AdminBooksPage;
