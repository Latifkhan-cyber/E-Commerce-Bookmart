import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCategories } from '../redux/slices/bookSlice';
import { Spinner } from '../components/common/Loader';

const CategoriesPage = () => {
  const dispatch = useDispatch();
  const { categories, loading } = useSelector((state) => state.books);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  if (loading && categories.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="pb-6 border-b border-slate-200">
        <h1 className="text-3xl font-black font-serif text-slate-900">Book Categories</h1>
        <p className="text-xs text-slate-500 mt-1">Browse books filtered by genre and subject areas</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat) => (
          <Link
            key={cat._id}
            to={`/books?category=${cat.slug}`}
            className="group bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col"
          >
            <div className="aspect-[16/9] bg-slate-100 overflow-hidden">
              <img
                src={cat.image}
                alt={cat.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="p-6 flex flex-col flex-grow">
              <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
                {cat.name}
              </h3>
              <p className="text-xs text-slate-500 mt-1 line-clamp-2">{cat.description || 'Explore curated books in this category.'}</p>
              <div className="mt-auto pt-4 flex items-center justify-between border-t border-slate-100 text-xs">
                <span className="font-bold text-emerald-600">{cat.bookCount || 0} Titles</span>
                <span className="font-bold text-slate-700 group-hover:translate-x-1 transition-transform">Browse Books →</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default CategoriesPage;
