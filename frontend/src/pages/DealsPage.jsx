import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBooks } from '../redux/slices/bookSlice';
import BookGrid from '../components/book/BookGrid';
import { BookGridSkeleton } from '../components/common/Loader';
import EmptyState from '../components/common/EmptyState';

const DealsPage = () => {
  const dispatch = useDispatch();
  const { books, loading } = useSelector((state) => state.books);

  useEffect(() => {
    dispatch(fetchBooks({ limit: 50 }));
  }, [dispatch]);

  const discountBooks = books.filter(b => b.discountPrice > 0 && b.discountPrice < b.price);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="pb-6 border-b border-slate-200">
        <h1 className="text-3xl font-black font-serif text-slate-900">Special Discount Deals</h1>
        <p className="text-xs text-slate-500 mt-1">Exclusive price markdowns on handpicked bookstore titles</p>
      </div>

      {loading ? (
        <BookGridSkeleton count={8} />
      ) : discountBooks.length === 0 ? (
        <EmptyState
          icon="books"
          title="No Active Deals at the Moment"
          description="Check back soon for upcoming sale events and seasonal promos!"
          actionText="Browse Catalog"
          actionLink="/books"
        />
      ) : (
        <BookGrid books={discountBooks} />
      )}
    </div>
  );
};

export default DealsPage;
