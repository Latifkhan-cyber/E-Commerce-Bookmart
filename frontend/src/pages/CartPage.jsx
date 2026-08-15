import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Trash2, ShoppingBag, ArrowRight, Plus, Minus, Tag, ShieldCheck } from 'lucide-react';
import { fetchCart, updateCartItem, removeFromCart, clearCart } from '../redux/slices/cartSlice';
import EmptyState from '../components/common/EmptyState';
import { Spinner } from '../components/common/Loader';
import { useToast } from '../context/ToastContext';
import axiosClient from '../api/axiosClient';

const CartPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const { items, loading } = useSelector((state) => state.cart);
  const { userInfo } = useSelector((state) => state.auth);

  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponApplied, setCouponApplied] = useState(false);
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  useEffect(() => {
    if (userInfo) {
      dispatch(fetchCart());
    }
  }, [dispatch, userInfo]);

  const handleQtyChange = (bookId, newQty, stock) => {
    if (newQty > stock) {
      showToast(`Only ${stock} copies available in stock`, 'error');
      return;
    }
    if (newQty < 1) return;
    dispatch(updateCartItem({ bookId, quantity: newQty }))
      .unwrap()
      .catch((err) => showToast(err || 'Failed to update quantity', 'error'));
  };

  const handleRemove = (bookId, title) => {
    dispatch(removeFromCart(bookId))
      .unwrap()
      .then(() => showToast(`Removed "${title}" from cart`, 'info'))
      .catch((err) => showToast(err || 'Failed to remove item', 'error'));
  };

  const handleClearCart = () => {
    dispatch(clearCart())
      .unwrap()
      .then(() => showToast('Cart cleared', 'info'));
  };

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setValidatingCoupon(true);
    try {
      const { data } = await axiosClient.post('/coupons/validate', {
        code: couponCode.trim(),
        cartSubtotal: subtotal,
      });
      setCouponDiscount(data.discountAmount);
      setCouponApplied(true);
      showToast(`Coupon "${data.code}" applied! Discount: RS ${data.discountAmount}`, 'success');
    } catch (err) {
      setCouponDiscount(0);
      setCouponApplied(false);
      showToast(err.message || 'Invalid coupon code', 'error');
    } finally {
      setValidatingCoupon(false);
    }
  };

  const subtotal = items.reduce((acc, item) => {
    const book = item.book;
    if (!book) return acc;
    const price = book.discountPrice > 0 && book.discountPrice < book.price ? book.discountPrice : book.price;
    return acc + price * item.quantity;
  }, 0);

  const shippingFee = subtotal > 2000 || subtotal === 0 ? 0 : 150;
  const grandTotal = Math.max(0, subtotal + shippingFee - couponDiscount);

  if (!userInfo) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <EmptyState
          icon="cart"
          title="Sign in to view your shopping cart"
          description="Log in to access your saved books, manage quantities, and proceed to checkout."
          actionText="Log In Now"
          actionLink="/login"
        />
      </div>
    );
  }

  if (loading && items.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <EmptyState
          icon="cart"
          title="Your Shopping Cart is Empty"
          description="Explore our vast library of programming, medical, fiction, and business books to fill your cart."
          actionText="Shop Books Now"
          actionLink="/books"
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex items-center justify-between pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-3xl font-black font-serif text-slate-900">Shopping Cart</h1>
          <p className="text-xs text-slate-500 mt-1">{items.length} unique titles in your cart</p>
        </div>
        <button
          onClick={handleClearCart}
          className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1.5"
        >
          <Trash2 className="w-4 h-4" /> Clear Cart
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Cart Items Table */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100">
          {items.map((item) => {
            const book = item.book;
            if (!book) return null;
            const price = book.discountPrice > 0 && book.discountPrice < book.price ? book.discountPrice : book.price;
            const itemSubtotal = price * item.quantity;

            return (
              <div key={book._id} className="p-6 flex flex-col sm:flex-row items-center gap-6">
                {/* Cover thumbnail */}
                <Link to={`/books/${book.slug || book._id}`} className="w-20 h-28 bg-slate-50 rounded-xl p-2 shrink-0 border border-slate-100 flex items-center justify-center">
                  <img src={book.coverImage} alt={book.title} className="w-full h-full object-contain drop-shadow" />
                </Link>

                {/* Details */}
                <div className="flex-1 space-y-1 text-center sm:text-left">
                  <Link to={`/books/${book.slug || book._id}`} className="font-bold text-slate-900 text-sm hover:text-emerald-600 line-clamp-2">
                    {book.title}
                  </Link>
                  <p className="text-xs text-slate-500 font-medium">By {book.author?.name || 'Author'}</p>
                  <p className="text-xs font-bold text-emerald-700">RS {price.toLocaleString()} each</p>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center border border-slate-300 rounded-xl bg-slate-50 overflow-hidden">
                  <button
                    onClick={() => handleQtyChange(book._id, item.quantity - 1, book.stock)}
                    className="p-2 hover:bg-slate-200 text-slate-700"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-3 text-xs font-bold text-slate-900">{item.quantity}</span>
                  <button
                    onClick={() => handleQtyChange(book._id, item.quantity + 1, book.stock)}
                    disabled={item.quantity >= book.stock}
                    className="p-2 hover:bg-slate-200 text-slate-700 disabled:opacity-30"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Item Subtotal */}
                <div className="text-right shrink-0">
                  <span className="block font-black text-slate-900 text-base">
                    RS {itemSubtotal.toLocaleString()}
                  </span>
                  <button
                    onClick={() => handleRemove(book._id, book.title)}
                    className="text-[11px] font-bold text-rose-500 hover:text-rose-700 mt-1"
                  >
                    Remove
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-4 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <h3 className="font-bold text-slate-900 text-lg font-serif pb-3 border-b border-slate-100">
            Order Summary
          </h3>

          {/* Coupon Input */}
          <form onSubmit={handleApplyCoupon} className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-emerald-600" /> Apply Promo Coupon
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                placeholder="e.g. WELCOME10"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none uppercase"
              />
              <button
                type="submit"
                disabled={validatingCoupon}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-colors disabled:opacity-50"
              >
                Apply
              </button>
            </div>
          </form>

          {/* Price Calculations */}
          <div className="space-y-3 text-xs pt-3 border-t border-slate-100">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal</span>
              <span className="font-bold text-slate-900">RS {subtotal.toLocaleString()}</span>
            </div>

            <div className="flex justify-between text-slate-600">
              <span>Shipping Fee</span>
              {shippingFee === 0 ? (
                <span className="font-bold text-emerald-600">FREE</span>
              ) : (
                <span className="font-bold text-slate-900">RS {shippingFee}</span>
              )}
            </div>

            {couponDiscount > 0 && (
              <div className="flex justify-between text-rose-600 font-semibold">
                <span>Discount Coupon</span>
                <span>- RS {couponDiscount.toLocaleString()}</span>
              </div>
            )}

            <div className="flex justify-between text-base font-black text-slate-900 pt-3 border-t border-slate-200">
              <span>Grand Total</span>
              <span className="text-emerald-700">RS {grandTotal.toLocaleString()}</span>
            </div>
          </div>

          <button
            onClick={() => navigate('/checkout', { state: { couponCode: couponApplied ? couponCode : '' } })}
            className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm rounded-2xl transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2"
          >
            Proceed to Checkout <ArrowRight className="w-4 h-4" />
          </button>

          <div className="text-[11px] text-slate-400 flex items-center justify-center gap-1.5 pt-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" /> Cash on Delivery available at checkout
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
