import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAuthors } from '../redux/slices/bookSlice';
import { Spinner } from '../components/common/Loader';

const AuthorsPage = () => {
  const dispatch = useDispatch();
  const { authors, loading } = useSelector((state) => state.books);

  useEffect(() => {
    dispatch(fetchAuthors());
  }, [dispatch]);

  if (loading && authors.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="pb-6 border-b border-slate-200">
        <h1 className="text-3xl font-black font-serif text-slate-900">Featured Authors</h1>
        <p className="text-xs text-slate-500 mt-1">Discover world-class writers, engineers, and researchers</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {authors.map((aut) => (
          <Link
            key={aut._id}
            to={`/authors/${aut.slug}`}
            className="group bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all text-center space-y-4"
          >
            <img
              src={aut.image}
              alt={aut.name}
              className="w-24 h-24 rounded-full object-cover mx-auto border-4 border-emerald-500/20 group-hover:scale-105 transition-transform"
            />
            <div>
              <h3 className="font-bold text-slate-900 text-base group-hover:text-emerald-600 transition-colors">
                {aut.name}
              </h3>
              <p className="text-xs text-slate-500 line-clamp-2 mt-1">{aut.bio || 'Author details & bibliography.'}</p>
            </div>
            <div className="pt-3 border-t border-slate-100 text-xs font-bold text-emerald-600">
              {aut.bookCount || 0} Books Available →
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default AuthorsPage;
