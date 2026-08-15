import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ArrowLeft, MapPin, CreditCard, XCircle, Printer } from 'lucide-react';
import { fetchOrderDetails, cancelOrder } from '../redux/slices/orderSlice';
import OrderStatusTimeline from '../components/common/OrderStatusTimeline';
import { Spinner } from '../components/common/Loader';
import { useToast } from '../context/ToastContext';

const OrderDetailsPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { showToast } = useToast();

  const { currentOrder: order, loading } = useSelector((state) => state.orders);

  useEffect(() => {
    dispatch(fetchOrderDetails(id));
  }, [dispatch, id]);

  const handleCancelOrder = () => {
    if (window.confirm('Are you sure you want to cancel this order?')) {
      dispatch(cancelOrder(order._id))
        .unwrap()
        .then(() => showToast('Order cancelled successfully', 'info'))
        .catch((err) => showToast(err || 'Failed to cancel order', 'error'));
    }
  };

  if (loading || !order) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <Link to="/orders" className="text-xs font-bold text-emerald-600 hover:underline flex items-center gap-1 mb-2">
            <ArrowLeft className="w-4 h-4" /> Back to My Orders
          </Link>
          <h1 className="text-3xl font-black font-serif text-slate-900">Order #{order.orderId}</h1>
          <p className="text-xs text-slate-500 mt-1">Placed on {new Date(order.createdAt).toLocaleString()}</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-700 flex items-center gap-2 hover:bg-slate-50"
          >
            <Printer className="w-4 h-4" /> Print Invoice
          </button>

          {(order.orderStatus === 'Pending' || order.orderStatus === 'Confirmed') && (
            <button
              onClick={handleCancelOrder}
              className="px-4 py-2 bg-rose-50 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold flex items-center gap-1.5 hover:bg-rose-100"
            >
              <XCircle className="w-4 h-4" /> Cancel Order
            </button>
          )}
        </div>
      </div>

      {/* Visual Tracking Timeline */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
        <h3 className="font-bold text-slate-900 text-sm mb-4">Order Tracking Progress</h3>
        <OrderStatusTimeline currentStatus={order.orderStatus} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Items */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100 p-6 space-y-4">
          <h3 className="font-bold text-slate-900 text-base font-serif pb-2">Purchased Books</h3>

          {order.items.map((item, idx) => (
            <div key={idx} className="pt-4 flex items-center gap-4 text-xs">
              <img src={item.coverImage} alt={item.title} className="w-14 h-18 object-contain rounded bg-slate-50 p-1 border" />
              <div className="flex-1">
                <p className="font-bold text-slate-900 text-sm line-clamp-1">{item.title}</p>
                <p className="text-slate-500 mt-0.5">RS {item.price.toLocaleString()} x {item.quantity} copy</p>
              </div>
              <span className="font-extrabold text-slate-900 text-sm">
                RS {(item.price * item.quantity).toLocaleString()}
              </span>
            </div>
          ))}
        </div>

        {/* Right Column: Address & Payment Summary */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-emerald-600" /> Delivery Address
            </h4>
            <div className="text-xs text-slate-600 leading-relaxed">
              <p className="font-bold text-slate-900">{order.shippingAddress?.fullName}</p>
              <p>{order.shippingAddress?.street}</p>
              <p>{order.shippingAddress?.city}, {order.shippingAddress?.province} {order.shippingAddress?.postalCode}</p>
              <p className="font-semibold text-slate-800 mt-1">Phone: {order.shippingAddress?.phone}</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-emerald-600" /> Payment & Charges
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Method</span>
                <span className="font-bold text-slate-900">{order.paymentMethod}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Payment Status</span>
                <span className="font-bold text-emerald-600">{order.paymentStatus}</span>
              </div>
              <div className="flex justify-between text-slate-600 pt-2 border-t border-slate-100">
                <span>Subtotal</span>
                <span>RS {order.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Shipping Fee</span>
                <span>RS {order.shippingFee}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-rose-600">
                  <span>Discount</span>
                  <span>- RS {order.discount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-black text-slate-900 pt-2 border-t border-slate-200">
                <span>Total Amount</span>
                <span className="text-emerald-700">RS {order.total.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsPage;
