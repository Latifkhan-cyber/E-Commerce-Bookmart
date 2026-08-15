import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPublishers } from '../redux/slices/bookSlice';
import { Spinner } from '../components/common/Loader';

const PublishersPage = () => {
  const dispatch = useDispatch();
  const { publishers, loading } = useSelector((state) => state.books);

  useEffect(() => {
    dispatch(fetchPublishers());
  }, [dispatch]);

  if (loading && publishers.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="pb-6 border-b border-slate-200">
        <h1 className="text-3xl font-black font-serif text-slate-900">Publishing Houses</h1>
        <p className="text-xs text-slate-500 mt-1">Explore titles published by leading educational & literary presses</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {publishers.map((pub) => (
          <Link
            key={pub._id}
            to={`/publishers/${pub.slug}`}
            className="group bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex items-center gap-6"
          >
            <img
              src={pub.logo}
              alt={pub.name}
              className="w-16 h-16 rounded-2xl object-cover border border-slate-100 shrink-0 p-1 bg-slate-50"
            />
            <div className="flex-1 space-y-1">
              <h3 className="font-bold text-slate-900 text-sm group-hover:text-emerald-600 transition-colors">
                {pub.name}
              </h3>
              <p className="text-xs text-slate-500 line-clamp-1">{pub.description}</p>
              <span className="inline-block text-[11px] font-bold text-emerald-600 pt-1">
                {pub.bookCount || 0} Titles →
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default PublishersPage;
