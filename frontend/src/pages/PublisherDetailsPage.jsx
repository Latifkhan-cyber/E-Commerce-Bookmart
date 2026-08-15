import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import axiosClient from '../api/axiosClient';
import BookGrid from '../components/book/BookGrid';
import { Spinner } from '../components/common/Loader';

const PublisherDetailsPage = () => {
  const { idOrSlug } = useParams();
  const [publisher, setPublisher] = useState(null);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPublisherDetails = async () => {
      setLoading(true);
      try {
        const { data } = await axiosClient.get(`/publishers/${idOrSlug}`);
        setPublisher(data.publisher);
        setBooks(data.books);
      } catch (err) {
        console.error('Failed to load publisher:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPublisherDetails();
  }, [idOrSlug]);

  if (loading || !publisher) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <Link to="/publishers" className="text-xs font-bold text-emerald-600 hover:underline flex items-center gap-1">
        <ArrowLeft className="w-4 h-4" /> Back to Publishers
      </Link>

      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-6">
        <img
          src={publisher.logo}
          alt={publisher.name}
          className="w-20 h-20 rounded-2xl object-cover border border-slate-200 p-2 bg-slate-50"
        />
        <div className="space-y-1">
          <h1 className="text-3xl font-black font-serif text-slate-900">{publisher.name}</h1>
          <p className="text-slate-600 text-xs">{publisher.description}</p>
          <span className="inline-block mt-2 px-3 py-1 bg-emerald-50 text-emerald-700 font-bold text-xs rounded-lg">
            {books.length} Books Published
          </span>
        </div>
      </div>

      <div className="space-y-6">
        <h2 className="text-2xl font-bold font-serif text-slate-900">Books by {publisher.name}</h2>
        <BookGrid books={books} />
      </div>
    </div>
  );
};

export default PublisherDetailsPage;
