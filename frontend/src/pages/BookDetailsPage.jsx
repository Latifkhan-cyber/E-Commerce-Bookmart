import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Heart, ShoppingBag, Truck, ShieldCheck, Star, UserCheck, MessageSquare, Plus, Minus, Check } from 'lucide-react';
import { fetchBookDetails, clearBookDetails, fetchBooks } from '../redux/slices/bookSlice';
import { addToCart } from '../redux/slices/cartSlice';
import { toggleWishlist } from '../redux/slices/wishlistSlice';
import RatingStars from '../components/common/RatingStars';
import BookGrid from '../components/book/BookGrid';
import { Spinner } from '../components/common/Loader';
import { useToast } from '../context/ToastContext';
import axiosClient from '../api/axiosClient';

const BookDetailsPage = () => {
  const { idOrSlug } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const { currentBook: book, detailsLoading, books: relatedCatalog } = useSelector((state) => state.books);
  const { userInfo } = useSelector((state) => state.auth);
  const { books: wishlistBooks } = useSelector((state) => state.wishlist);
  const { items: cartItems } = useSelector((state) => state.cart);

  const [activeTab, setActiveTab] = useState('description');
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState('');
  const [reviews, setReviews] = useState([]);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const isInWishlist = book ? wishlistBooks.some((b) => (b._id || b) === book._id) : false;
  const isInCart = book ? cartItems.some((item) => (item.book._id || item.book) === book._id) : false;

  useEffect(() => {
    dispatch(fetchBookDetails(idOrSlug));
    return () => {
      dispatch(clearBookDetails());
    };
  }, [dispatch, idOrSlug]);

  useEffect(() => {
    if (book) {
      setSelectedImage(book.coverImage);
      fetchReviews(book._id);
      if (book.category?._id) {
        dispatch(fetchBooks({ category: book.category._id, limit: 4 }));
      }
    }
  }, [book, dispatch]);

  const fetchReviews = async (bookId) => {
    try {
      const { data } = await axiosClient.get(`/books/${bookId}/reviews`);
      setReviews(data);
    } catch (err) {
      console.error('Failed to load reviews:', err);
    }
  };

  const handleAddToCart = (e, buyNow = false) => {
    if (e) e.preventDefault();
    if (!userInfo) {
      showToast('Please login to purchase books', 'info');
      navigate('/login');
      return;
    }
    if (book.stock < 1) {
      showToast('Sorry, this book is out of stock', 'error');
      return;
    }
    dispatch(addToCart({ bookId: book._id, quantity }))
      .unwrap()
      .then(() => {
        showToast(`Added ${quantity} copy of "${book.title}" to cart!`, 'success');
        if (buyNow) navigate('/checkout');
      })
      .catch((err) => showToast(err || 'Failed to add to cart', 'error'));
  };

  const handleToggleWishlist = () => {
    if (!userInfo) {
      showToast('Please login to save to wishlist', 'info');
      navigate('/login');
      return;
    }
    dispatch(toggleWishlist(book._id))
      .unwrap()
      .then(() => showToast(isInWishlist ? 'Removed from wishlist' : 'Saved to wishlist!', 'success'))
      .catch((err) => showToast(err || 'Failed to update wishlist', 'error'));
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!userInfo) {
      showToast('Please login to leave a review', 'info');
      navigate('/login');
      return;
    }
    if (!newComment.trim()) {
      showToast('Please write a review comment', 'error');
      return;
    }

    setSubmittingReview(true);
    try {
      await axiosClient.post(`/books/${book._id}/reviews`, {
        rating: newRating,
        comment: newComment,
      });
      showToast('Review submitted successfully!', 'success');
      setNewComment('');
      fetchReviews(book._id);
      dispatch(fetchBookDetails(idOrSlug)); // Refresh average rating
    } catch (err) {
      showToast(err.message || 'Failed to submit review', 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (detailsLoading || !book) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  const price = book.price || 0;
  const discountPrice = book.discountPrice || 0;
  const hasDiscount = discountPrice > 0 && discountPrice < price;
  const finalPrice = hasDiscount ? discountPrice : price;
  const discountPercent = hasDiscount ? Math.round(((price - discountPrice) / price) * 100) : 0;
  const relatedBooks = relatedCatalog.filter(b => b._id !== book._id).slice(0, 4);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Top Breadcrumb */}
      <nav className="text-xs text-slate-500 flex items-center gap-2">
        <Link to="/" className="hover:text-emerald-600">Home</Link>
        <span>/</span>
        <Link to="/books" className="hover:text-emerald-600">Books</Link>
        <span>/</span>
        <Link to={`/books?category=${book.category?.slug}`} className="hover:text-emerald-600">
          {book.category?.name}
        </Link>
        <span>/</span>
        <span className="text-slate-900 font-semibold truncate max-w-xs">{book.title}</span>
      </nav>

      {/* Main Details Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 bg-white p-6 sm:p-10 rounded-3xl border border-slate-200 shadow-sm">
        {/* Left Column: Image Gallery */}
        <div className="lg:col-span-5 space-y-4">
          <div className="aspect-[3/4] bg-slate-50 rounded-2xl p-6 border border-slate-100 flex items-center justify-center relative overflow-hidden">
            <img
              src={selectedImage || book.coverImage}
              alt={book.title}
              className="w-full h-full object-contain drop-shadow-xl"
            />
            {hasDiscount && (
              <span className="absolute top-4 left-4 px-3 py-1 bg-rose-600 text-white font-bold text-xs rounded-lg uppercase tracking-wider shadow">
                {discountPercent}% OFF
              </span>
            )}
          </div>

          {/* Thumbnails */}
          {book.images && book.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {book.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`w-16 h-20 rounded-xl bg-slate-50 border-2 p-1 transition-all ${
                    selectedImage === img ? 'border-emerald-600 ring-2 ring-emerald-100' : 'border-slate-200'
                  }`}
                >
                  <img src={img} alt="Thumbnail" className="w-full h-full object-contain" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Information & Actions */}
        <div className="lg:col-span-7 space-y-6">
          <div>
            <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-700 font-bold text-xs rounded-lg uppercase tracking-wider mb-2">
              {book.category?.name}
            </span>
            <h1 className="text-2xl sm:text-3xl font-black font-serif text-slate-900 leading-tight">
              {book.title}
            </h1>
            <p className="text-sm text-slate-500 font-medium mt-1">
              By{' '}
              <Link to={`/authors/${book.author?.slug}`} className="text-emerald-600 hover:underline font-bold">
                {book.author?.name}
              </Link>{' '}
              | Published by{' '}
              <Link to={`/publishers/${book.publisher?.slug}`} className="text-slate-700 font-bold hover:underline">
                {book.publisher?.name}
              </Link>
            </p>
          </div>

          {/* Ratings Summary */}
          <div className="flex items-center gap-3 py-2 border-y border-slate-100">
            <RatingStars rating={book.rating} reviewCount={book.reviewCount} size="md" />
            <span className="text-xs text-slate-400">|</span>
            <span className="text-xs font-semibold text-slate-600">{reviews.length} Customer Reviews</span>
          </div>

          {/* Price Block */}
          <div className="space-y-1">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-extrabold text-slate-900">
                RS {finalPrice.toLocaleString()}
              </span>
              {hasDiscount && (
                <span className="text-lg text-slate-400 line-through">
                  RS {price.toLocaleString()}
                </span>
              )}
            </div>
            <p className="text-xs text-emerald-600 font-semibold">Inclusive of all taxes & Cash on Delivery eligible</p>
          </div>

          {/* Stock Status */}
          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                book.stock > 5 ? 'bg-emerald-500' : book.stock > 0 ? 'bg-amber-500' : 'bg-rose-500'
              }`}
            />
            <span className="text-xs font-bold text-slate-800">
              {book.stock > 5
                ? 'In Stock (Ready to Ship)'
                : book.stock > 0
                ? `Low Stock - Only ${book.stock} left!`
                : 'Out of Stock'}
            </span>
          </div>

          {/* Quantity Selector & Action Buttons */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-4">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Quantity:</span>
              <div className="flex items-center border border-slate-300 rounded-xl bg-slate-50 overflow-hidden">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                  className="p-2.5 hover:bg-slate-200 text-slate-700 disabled:opacity-30"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-4 text-sm font-bold text-slate-900">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(book.stock, quantity + 1))}
                  disabled={quantity >= book.stock}
                  className="p-2.5 hover:bg-slate-200 text-slate-700 disabled:opacity-30"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={(e) => handleAddToCart(e, false)}
                disabled={book.stock < 1}
                className="flex-1 px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl text-sm transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 disabled:opacity-40"
              >
                {isInCart ? <Check className="w-5 h-5" /> : <ShoppingBag className="w-5 h-5" />}
                {isInCart ? 'In Cart' : 'Add to Cart'}
              </button>

              <button
                onClick={(e) => handleAddToCart(e, true)}
                disabled={book.stock < 1}
                className="flex-1 px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl text-sm transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-40"
              >
                Buy Now
              </button>

              <button
                onClick={handleToggleWishlist}
                className={`p-3.5 rounded-2xl border transition-all ${
                  isInWishlist
                    ? 'bg-rose-50 text-rose-600 border-rose-200 shadow-sm'
                    : 'bg-white text-slate-400 border-slate-300 hover:text-rose-500'
                }`}
                title="Wishlist"
              >
                <Heart className={`w-5 h-5 ${isInWishlist ? 'fill-rose-600' : ''}`} />
              </button>
            </div>
          </div>

          {/* Guarantee Badges */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-emerald-600" /> Express Courier Dispatch
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> 100% Genuine Print
            </div>
          </div>
        </div>
      </div>

      {/* Tabs: Description / Specifications / Verified Reviews */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-sm">
        <div className="flex border-b border-slate-200 gap-8 mb-8 overflow-x-auto">
          {['description', 'information', 'reviews'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 font-bold text-sm uppercase tracking-wider border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab
                  ? 'border-emerald-600 text-emerald-600'
                  : 'border-transparent text-slate-400 hover:text-slate-700'
              }`}
            >
              {tab === 'description' && 'Book Description'}
              {tab === 'information' && 'Product Specifications'}
              {tab === 'reviews' && `Verified Reviews (${reviews.length})`}
            </button>
          ))}
        </div>

        {/* Tab 1: Description */}
        {activeTab === 'description' && (
          <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed text-sm">
            <p className="whitespace-pre-line">{book.description}</p>
          </div>
        )}

        {/* Tab 2: Specs */}
        {activeTab === 'information' && (
          <div className="max-w-xl grid grid-cols-2 gap-y-4 text-xs">
            <div className="text-slate-400 font-semibold">Author</div>
            <div className="text-slate-900 font-bold">{book.author?.name}</div>

            <div className="text-slate-400 font-semibold">Publisher</div>
            <div className="text-slate-900 font-bold">{book.publisher?.name}</div>

            <div className="text-slate-400 font-semibold">ISBN-13</div>
            <div className="text-slate-900 font-mono font-bold">{book.isbn}</div>

            <div className="text-slate-400 font-semibold">Language</div>
            <div className="text-slate-900 font-bold">{book.language}</div>

            <div className="text-slate-400 font-semibold">Number of Pages</div>
            <div className="text-slate-900 font-bold">{book.pages} pages</div>

            <div className="text-slate-400 font-semibold">Publication Year</div>
            <div className="text-slate-900 font-bold">{book.publicationYear}</div>
          </div>
        )}

        {/* Tab 3: Reviews */}
        {activeTab === 'reviews' && (
          <div className="space-y-10">
            {/* Write Review Form */}
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200/80 space-y-4">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-emerald-600" /> Write a Customer Review
              </h3>
              <p className="text-xs text-slate-500">
                Only customers who have purchased and received this book can submit a verified review.
              </p>

              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Your Rating</label>
                  <RatingStars
                    rating={newRating}
                    size="md"
                    interactive={true}
                    onRatingChange={(r) => setNewRating(r)}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Review Comment</label>
                  <textarea
                    rows="3"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Share your thoughts on the content, quality, and condition of this book..."
                    required
                    className="w-full p-3 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingReview}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all shadow disabled:opacity-50"
                >
                  {submittingReview ? 'Submitting...' : 'Submit Review'}
                </button>
              </form>
            </div>

            {/* Existing Reviews List */}
            <div className="space-y-4">
              {reviews.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No customer reviews submitted yet.</p>
              ) : (
                reviews.map((rev) => (
                  <div key={rev._id} className="p-4 bg-white rounded-2xl border border-slate-100 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img
                          src={rev.user?.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80'}
                          alt={rev.user?.name}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                        <div>
                          <p className="text-xs font-bold text-slate-900">{rev.user?.name || 'Customer'}</p>
                          <p className="text-[10px] text-slate-400">{new Date(rev.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      {rev.verifiedPurchase && (
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-md flex items-center gap-1">
                          <UserCheck className="w-3 h-3" /> Verified Purchase
                        </span>
                      )}
                    </div>

                    <RatingStars rating={rev.rating} size="xs" />
                    <p className="text-xs text-slate-700 leading-relaxed mt-2">{rev.comment}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Related Books */}
      {relatedBooks.length > 0 && (
        <section className="space-y-6">
          <h2 className="text-2xl font-bold font-serif text-slate-900">You Might Also Like</h2>
          <BookGrid books={relatedBooks} />
        </section>
      )}
    </div>
  );
};

export default BookDetailsPage;
