import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Heart, ShoppingBag, Check } from 'lucide-react';
import RatingStars from '../common/RatingStars';
import { addToCart } from '../../redux/slices/cartSlice';
import { toggleWishlist } from '../../redux/slices/wishlistSlice';
import { useToast } from '../../context/ToastContext';

const BookCard = ({ book }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const { userInfo } = useSelector((state) => state.auth);
  const { books: wishlistBooks } = useSelector((state) => state.wishlist);
  const { items: cartItems } = useSelector((state) => state.cart);

  const isInWishlist = wishlistBooks.some((b) => (b._id || b) === book._id);
  const isInCart = cartItems.some((item) => (item.book._id || item.book) === book._id);

  const authorName = book.author?.name || 'Unknown Author';
  const price = book.price || 0;
  const discountPrice = book.discountPrice || 0;
  const hasDiscount = discountPrice > 0 && discountPrice < price;
  const discountPercent = hasDiscount ? Math.round(((price - discountPrice) / price) * 100) : 0;
  const finalPrice = hasDiscount ? discountPrice : price;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!userInfo) {
      showToast('Please login to add books to your cart', 'info');
      navigate('/login');
      return;
    }
    if (book.stock < 1) {
      showToast('Sorry, this book is currently out of stock', 'error');
      return;
    }
    dispatch(addToCart({ bookId: book._id, quantity: 1 }))
      .unwrap()
      .then(() => showToast(`"${book.title}" added to cart!`, 'success'))
      .catch((err) => showToast(err || 'Failed to add to cart', 'error'));
  };

  const handleToggleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!userInfo) {
      showToast('Please login to manage your wishlist', 'info');
      navigate('/login');
      return;
    }
    dispatch(toggleWishlist(book._id))
      .unwrap()
      .then(() => {
        showToast(isInWishlist ? 'Removed from wishlist' : 'Added to wishlist!', 'success');
      })
      .catch((err) => showToast(err || 'Failed to update wishlist', 'error'));
  };

  return (
    <div className="group relative bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-book-hover transition-all duration-300 flex flex-col h-full overflow-hidden">
      {/* Top Badges */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
        {hasDiscount && (
          <span className="px-2.5 py-1 bg-rose-600 text-white text-[11px] font-bold uppercase tracking-wider rounded-lg shadow-sm">
            {discountPercent}% OFF
          </span>
        )}
        {book.bestSeller && (
          <span className="px-2.5 py-1 bg-amber-500 text-white text-[11px] font-bold uppercase tracking-wider rounded-lg shadow-sm">
            Bestseller
          </span>
        )}
      </div>

      {/* Wishlist Button */}
      <button
        onClick={handleToggleWishlist}
        className={`absolute top-3 right-3 z-10 p-2 rounded-full backdrop-blur-md transition-all ${
          isInWishlist
            ? 'bg-rose-50 text-rose-600 shadow-md scale-110'
            : 'bg-white/80 text-slate-400 hover:text-rose-500 hover:bg-white'
        }`}
        aria-label="Add to Wishlist"
      >
        <Heart className={`w-4 h-4 ${isInWishlist ? 'fill-rose-600' : ''}`} />
      </button>

      {/* Cover Image Container */}
      <Link to={`/books/${book.slug || book._id}`} className="block relative aspect-[3/4] overflow-hidden bg-slate-100 p-4">
        <img
          src={book.coverImage}
          alt={book.title}
          className="w-full h-full object-contain object-center group-hover:scale-105 transition-transform duration-500 drop-shadow-md"
          loading="lazy"
        />
        {book.stock < 1 && (
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] flex items-center justify-center">
            <span className="px-3 py-1 bg-slate-800 text-slate-200 text-xs font-bold uppercase tracking-wider rounded-md border border-slate-700">
              Out of Stock
            </span>
          </div>
        )}
      </Link>

      {/* Content Body */}
      <div className="p-4 flex flex-col flex-grow">
        {/* Category badge */}
        <span className="text-[11px] font-semibold uppercase text-emerald-600 tracking-wide mb-1">
          {book.category?.name || 'General'}
        </span>

        {/* Title */}
        <Link
          to={`/books/${book.slug || book._id}`}
          className="font-bold text-slate-900 text-sm hover:text-emerald-600 transition-colors line-clamp-2 mb-1 leading-snug"
          title={book.title}
        >
          {book.title}
        </Link>

        {/* Author */}
        <p className="text-xs text-slate-500 font-medium mb-2">{authorName}</p>

        {/* Rating */}
        <div className="mb-3">
          <RatingStars rating={book.rating} reviewCount={book.reviewCount} size="xs" />
        </div>

        {/* Price & Add to Cart footer */}
        <div className="mt-auto pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-extrabold text-slate-900">
                RS {finalPrice.toLocaleString()}
              </span>
              {hasDiscount && (
                <span className="text-xs text-slate-400 line-through">
                  RS {price.toLocaleString()}
                </span>
              )}
            </div>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={book.stock < 1}
            className={`p-2.5 rounded-xl font-semibold text-xs flex items-center gap-1.5 transition-all ${
              isInCart
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm hover:shadow-md'
            } disabled:opacity-40 disabled:cursor-not-allowed`}
            title={isInCart ? 'In Cart' : 'Add to Cart'}
          >
            {isInCart ? <Check className="w-4 h-4" /> : <ShoppingBag className="w-4 h-4" />}
            <span className="hidden sm:inline">{isInCart ? 'Added' : 'Add'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookCard;
