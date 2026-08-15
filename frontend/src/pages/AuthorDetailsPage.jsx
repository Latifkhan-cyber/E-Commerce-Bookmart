import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import axiosClient from '../api/axiosClient';
import BookGrid from '../components/book/BookGrid';
import { Spinner } from '../components/common/Loader';

const AuthorDetailsPage = () => {
  const { idOrSlug } = useParams();
  const [author, setAuthor] = useState(null);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAuthorDetails = async () => {
      setLoading(true);
      try {
        const { data } = await axiosClient.get(`/authors/${idOrSlug}`);
        setAuthor(data.author);
        setBooks(data.books);
      } catch (err) {
        console.error('Failed to load author:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAuthorDetails();
  }, [idOrSlug]);

  if (loading || !author) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <Link to="/authors" className="text-xs font-bold text-emerald-600 hover:underline flex items-center gap-1">
        <ArrowLeft className="w-4 h-4" /> Back to Authors
      </Link>

      {/* Author Header Card */}
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center md:items-start gap-8">
        <img
          src={author.image}
          alt={author.name}
          className="w-32 h-32 rounded-full object-cover border-4 border-emerald-500/20 shrink-0"
        />
        <div className="space-y-3 text-center md:text-left">
          <h1 className="text-3xl font-black font-serif text-slate-900">{author.name}</h1>
          <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-700 font-bold text-xs rounded-lg uppercase tracking-wider">
            {books.length} Books Written
          </span>
          <p className="text-slate-600 text-sm leading-relaxed max-w-3xl">{author.bio}</p>
        </div>
      </div>

      {/* Books List */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold font-serif text-slate-900">Books by {author.name}</h2>
        <BookGrid books={books} />
      </div>
    </div>
  );
};

export default AuthorDetailsPage;
