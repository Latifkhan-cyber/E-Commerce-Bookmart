import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ShieldCheck, Truck, MapPin, CheckCircle2, ArrowRight } from 'lucide-react';
import { createOrder, resetOrderState } from '../redux/slices/orderSlice';
import { addAddress } from '../redux/slices/authSlice';
import { useToast } from '../context/ToastContext';

const CheckoutPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();

  const { items } = useSelector((state) => state.cart);
  const { userInfo } = useSelector((state) => state.auth);
  const { loading: orderLoading, createdOrder, success } = useSelector((state) => state.orders);

  const initialCoupon = location.state?.couponCode || '';

  const addresses = userInfo?.addresses || [];
  const defaultAddress = addresses.find(a => a.isDefault) || addresses[0];

  const [selectedAddressId, setSelectedAddressId] = useState(defaultAddress?._id || 'new');
  const [newAddress, setNewAddress] = useState({
    fullName: userInfo?.name || '',
    phone: userInfo?.phone || '',
    street: '',
    city: 'Lahore',
    province: 'Punjab',
    postalCode: '54000',
    country: 'Pakistan',
  });

  const [paymentMethod, setPaymentMethod] = useState('Cash on Delivery');

  useEffect(() => {
    if (success && createdOrder) {
      showToast(`Order #${createdOrder.orderId} placed successfully!`, 'success');
      dispatch(resetOrderState());
      navigate(`/orders/${createdOrder.orderId}`);
    }
  }, [success, createdOrder, navigate, dispatch, showToast]);

  const subtotal = items.reduce((acc, item) => {
    const book = item.book;
    if (!book) return acc;
    const price = book.discountPrice > 0 && book.discountPrice < book.price ? book.discountPrice : book.price;
    return acc + price * item.quantity;
  }, 0);

  const shippingFee = subtotal > 2000 || subtotal === 0 ? 0 : 150;
  const grandTotal = subtotal + shippingFee;

  const handlePlaceOrder = (e) => {
    e.preventDefault();

    let shippingData;
    if (selectedAddressId !== 'new') {
      const selected = addresses.find(a => a._id === selectedAddressId);
      if (!selected) {
        showToast('Please select a valid shipping address', 'error');
        return;
      }
      shippingData = {
        fullName: selected.fullName,
        phone: selected.phone,
        street: selected.street,
        city: selected.city,
        province: selected.province,
        postalCode: selected.postalCode,
        country: selected.country,
      };
    } else {
      if (!newAddress.fullName || !newAddress.phone || !newAddress.street || !newAddress.city) {
        showToast('Please complete all shipping address fields', 'error');
        return;
      }
      shippingData = newAddress;
      // Save new address to user profile
      dispatch(addAddress(newAddress));
    }

    const orderPayload = {
      items: items.map(i => ({ book: i.book._id || i.book, quantity: i.quantity })),
      shippingAddress: shippingData,
      paymentMethod,
      couponCode: initialCoupon,
    };

    dispatch(createOrder(orderPayload))
      .unwrap()
      .catch((err) => showToast(err || 'Failed to place order', 'error'));
  };

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="pb-6 border-b border-slate-200">
        <h1 className="text-3xl font-black font-serif text-slate-900">Checkout</h1>
        <p className="text-xs text-slate-500 mt-1">Review shipping details and confirm your book order</p>
      </div>

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Column: Shipping & Payment */}
        <div className="lg:col-span-7 space-y-8">
          {/* Section 1: Shipping Address */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <h3 className="font-bold text-slate-900 text-lg font-serif flex items-center gap-2">
              <MapPin className="w-5 h-5 text-emerald-600" /> Shipping Information
            </h3>

            {/* Saved Addresses List */}
            {addresses.length > 0 && (
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Select Saved Address</label>
                <div className="grid grid-cols-1 gap-3">
                  {addresses.map((addr) => (
                    <label
                      key={addr._id}
                      className={`p-4 rounded-2xl border cursor-pointer flex items-start justify-between transition-all ${
                        selectedAddressId === addr._id
                          ? 'border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-100'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="radio"
                          name="address"
                          value={addr._id}
                          checked={selectedAddressId === addr._id}
                          onChange={() => setSelectedAddressId(addr._id)}
                          className="mt-1 text-emerald-600 focus:ring-emerald-500"
                        />
                        <div className="text-xs">
                          <p className="font-bold text-slate-900">{addr.fullName} ({addr.phone})</p>
                          <p className="text-slate-600 mt-0.5">{addr.street}, {addr.city}, {addr.province} {addr.postalCode}</p>
                        </div>
                      </div>
                    </label>
                  ))}

                  <label className="p-4 rounded-2xl border border-dashed border-slate-300 cursor-pointer flex items-center gap-3 hover:bg-slate-50">
                    <input
                      type="radio"
                      name="address"
                      value="new"
                      checked={selectedAddressId === 'new'}
                      onChange={() => setSelectedAddressId('new')}
                      className="text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-xs font-bold text-slate-700">+ Add New Shipping Address</span>
                  </label>
                </div>
              </div>
            )}

            {/* New Address Inputs */}
            {(selectedAddressId === 'new' || addresses.length === 0) && (
              <div className="space-y-4 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Recipient Name</label>
                    <input
                      type="text"
                      value={newAddress.fullName}
                      onChange={(e) => setNewAddress({ ...newAddress, fullName: e.target.value })}
                      required
                      className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                    <input
                      type="text"
                      value={newAddress.phone}
                      onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                      required
                      className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Street Address</label>
                  <input
                    type="text"
                    value={newAddress.street}
                    onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                    placeholder="House / Apartment #, Street name, Block"
                    required
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">City</label>
                    <input
                      type="text"
                      value={newAddress.city}
                      onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                      required
                      className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Province</label>
                    <input
                      type="text"
                      value={newAddress.province}
                      onChange={(e) => setNewAddress({ ...newAddress, province: e.target.value })}
                      required
                      className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Postal Code</label>
                    <input
                      type="text"
                      value={newAddress.postalCode}
                      onChange={(e) => setNewAddress({ ...newAddress, postalCode: e.target.value })}
                      required
                      className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Payment Method */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-lg font-serif flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" /> Payment Method
            </h3>

            <div className="p-4 bg-emerald-50/60 border-2 border-emerald-600 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                  COD
                </div>
                <div>
                  <p className="font-bold text-slate-900 text-xs">Cash on Delivery</p>
                  <p className="text-[11px] text-slate-500">Pay cash upon package delivery to your doorstep.</p>
                </div>
              </div>
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary */}
        <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <h3 className="font-bold text-slate-900 text-lg font-serif pb-3 border-b border-slate-100">
            Items in Order ({items.length})
          </h3>

          <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
            {items.map((item) => {
              const book = item.book;
              if (!book) return null;
              const price = book.discountPrice > 0 && book.discountPrice < book.price ? book.discountPrice : book.price;
              return (
                <div key={book._id} className="flex items-center gap-3 text-xs">
                  <img src={book.coverImage} alt={book.title} className="w-12 h-16 object-contain rounded bg-slate-50 p-1 border" />
                  <div className="flex-1">
                    <p className="font-bold text-slate-900 line-clamp-1">{book.title}</p>
                    <p className="text-slate-500">Qty: {item.quantity} x RS {price.toLocaleString()}</p>
                  </div>
                  <span className="font-black text-slate-900">RS {(price * item.quantity).toLocaleString()}</span>
                </div>
              );
            })}
          </div>

          <div className="space-y-2 text-xs pt-4 border-t border-slate-100">
            <div className="flex justify-between text-slate-600">
              <span>Items Subtotal</span>
              <span className="font-bold text-slate-900">RS {subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Courier Delivery</span>
              <span className="font-bold text-emerald-600">{shippingFee === 0 ? 'FREE' : `RS ${shippingFee}`}</span>
            </div>
            <div className="flex justify-between text-base font-black text-slate-900 pt-3 border-t border-slate-200">
              <span>Total Payable</span>
              <span className="text-emerald-700">RS {grandTotal.toLocaleString()}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={orderLoading}
            className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm rounded-2xl transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {orderLoading ? 'Processing Order...' : 'Confirm & Place Order'} <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default CheckoutPage;
