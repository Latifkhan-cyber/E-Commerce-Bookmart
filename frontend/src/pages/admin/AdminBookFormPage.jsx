import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ArrowLeft, Upload, Save } from 'lucide-react';
import { fetchCategories, fetchAuthors, fetchPublishers } from '../../redux/slices/bookSlice';
import axiosClient from '../../api/axiosClient';
import { useToast } from '../../context/ToastContext';
import { Spinner } from '../../components/common/Loader';

const AdminBookFormPage = () => {
  const { id } = useParams();
  const isEdit = !!id;

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { showToast } = useToast();

  const { categories, authors, publishers } = useSelector((state) => state.books);

  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    author: '',
    publisher: '',
    category: '',
    isbn: '',
    price: '',
    discountPrice: 0,
    coverImage: '',
    pages: 250,
    language: 'English',
    publicationYear: 2024,
    stock: 15,
    featured: false,
    bestSeller: false,
  });

  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchAuthors());
    dispatch(fetchPublishers());

    if (isEdit) {
      setLoading(true);
      axiosClient.get(`/books/${id}`)
        .then(({ data }) => {
          setFormData({
            title: data.title || '',
            description: data.description || '',
            author: data.author?._id || data.author || '',
            publisher: data.publisher?._id || data.publisher || '',
            category: data.category?._id || data.category || '',
            isbn: data.isbn || '',
            price: data.price || '',
            discountPrice: data.discountPrice || 0,
            coverImage: data.coverImage || '',
            pages: data.pages || 250,
            language: data.language || 'English',
            publicationYear: data.publicationYear || 2024,
            stock: data.stock !== undefined ? data.stock : 15,
            featured: data.featured || false,
            bestSeller: data.bestSeller || false,
          });
        })
        .catch((err) => showToast(err.message || 'Failed to load book', 'error'))
        .finally(() => setLoading(false));
    }
  }, [dispatch, id, isEdit, showToast]);

  const handleImageFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const data = new FormData();
    data.append('image', file);

    setUploadingImage(true);
    try {
      const res = await axiosClient.post('/upload', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setFormData(prev => ({ ...prev, coverImage: res.data.url }));
      showToast('Image uploaded successfully!', 'success');
    } catch (err) {
      showToast(err.message || 'Image upload failed', 'error');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.coverImage) {
      showToast('Please provide a cover image URL or upload an image file', 'error');
      return;
    }

    setLoading(true);
    try {
      if (isEdit) {
        await axiosClient.put(`/books/${id}`, formData);
        showToast('Book updated successfully!', 'success');
      } else {
        await axiosClient.post('/books', formData);
        showToast('New book created successfully!', 'success');
      }
      navigate('/admin/books');
    } catch (err) {
      showToast(err.message || 'Failed to save book', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEdit) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div>
          <Link to="/admin/books" className="text-xs font-bold text-emerald-600 hover:underline flex items-center gap-1 mb-1">
            <ArrowLeft className="w-4 h-4" /> Back to Books
          </Link>
          <h1 className="text-3xl font-black font-serif text-slate-900">
            {isEdit ? 'Edit Book' : 'Add New Book'}
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        {/* Title & ISBN */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Book Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">ISBN Code *</label>
            <input
              type="text"
              value={formData.isbn}
              onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
              required
              placeholder="e.g. 9780132350884"
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Category, Author, Publisher */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Category *</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              required
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">Select Category</option>
              {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Author *</label>
            <select
              value={formData.author}
              onChange={(e) => setFormData({ ...formData, author: e.target.value })}
              required
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">Select Author</option>
              {authors.map((a) => <option key={a._id} value={a._id}>{a.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Publisher *</label>
            <select
              value={formData.publisher}
              onChange={(e) => setFormData({ ...formData, publisher: e.target.value })}
              required
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">Select Publisher</option>
              {publishers.map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}
            </select>
          </div>
        </div>

        {/* Prices & Stock */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Regular Price (RS) *</label>
            <input
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
              required
              min={0}
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Discount Price (RS)</label>
            <input
              type="number"
              value={formData.discountPrice}
              onChange={(e) => setFormData({ ...formData, discountPrice: Number(e.target.value) })}
              min={0}
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Available Stock *</label>
            <input
              type="number"
              value={formData.stock}
              onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
              required
              min={0}
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>
        </div>

        {/* Cover Image Upload / URL */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-700">Cover Image URL *</label>
          <div className="flex gap-3">
            <input
              type="text"
              value={formData.coverImage}
              onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
              placeholder="https://images.unsplash.com/..."
              required
              className="flex-1 px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl"
            />
            <label className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl cursor-pointer flex items-center gap-1.5 shrink-0">
              <Upload className="w-4 h-4" /> {uploadingImage ? 'Uploading...' : 'Upload File'}
              <input type="file" accept="image/*" onChange={handleImageFileUpload} className="hidden" />
            </label>
          </div>
          {formData.coverImage && (
            <img src={formData.coverImage} alt="Preview" className="w-20 h-28 object-contain rounded border p-1 bg-slate-50 mt-2" />
          )}
        </div>

        {/* Pages, Language, Publication Year */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Pages</label>
            <input
              type="number"
              value={formData.pages}
              onChange={(e) => setFormData({ ...formData, pages: Number(e.target.value) })}
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Language</label>
            <input
              type="text"
              value={formData.language}
              onChange={(e) => setFormData({ ...formData, language: e.target.value })}
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Publication Year</label>
            <input
              type="number"
              value={formData.publicationYear}
              onChange={(e) => setFormData({ ...formData, publicationYear: Number(e.target.value) })}
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Description *</label>
          <textarea
            rows="4"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            required
            className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Checkboxes */}
        <div className="flex gap-6 pt-2">
          <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.featured}
              onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
              className="w-4 h-4 text-emerald-600 rounded"
            />
            Mark as Featured Collection
          </label>

          <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.bestSeller}
              onChange={(e) => setFormData({ ...formData, bestSeller: e.target.checked })}
              className="w-4 h-4 text-emerald-600 rounded"
            />
            Mark as Bestseller
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm rounded-2xl transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Save className="w-4 h-4" /> {isEdit ? 'Save Book Changes' : 'Create Book Entry'}
        </button>
      </form>
    </div>
  );
};

export default AdminBookFormPage;
