import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Heart, Trash2 } from 'lucide-react';
import { fetchWishlist, removeFromWishlist } from '../redux/slices/wishlistSlice';
import BookGrid from '../components/book/BookGrid';
import EmptyState from '../components/common/EmptyState';
import { Spinner } from '../components/common/Loader';
import { useToast } from '../context/ToastContext';

const WishlistPage = () => {
  const dispatch = useDispatch();
  const { showToast } = useToast();
  const { books, loading } = useSelector((state) => state.wishlist);
  const { userInfo } = useSelector((state) => state.auth);

  useEffect(() => {
    if (userInfo) {
      dispatch(fetchWishlist());
    }
  }, [dispatch, userInfo]);

  if (!userInfo) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <EmptyState
          icon="wishlist"
          title="Sign in to view your wishlist"
          description="Log in to view saved books, track price drops, and move items to your cart."
          actionText="Log In Now"
          actionLink="/login"
        />
      </div>
    );
  }

  if (loading && books.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (books.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <EmptyState
          icon="wishlist"
          title="Your Wishlist is Empty"
          description="Click the heart icon on any book card to save it to your personal wishlist."
          actionText="Discover Books"
          actionLink="/books"
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="pb-6 border-b border-slate-200">
        <h1 className="text-3xl font-black font-serif text-slate-900">My Wishlist</h1>
        <p className="text-xs text-slate-500 mt-1">{books.length} saved books in your personal library</p>
      </div>

      <BookGrid books={books} />
    </div>
  );
};

export default WishlistPage;
