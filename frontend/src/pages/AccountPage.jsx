import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { User, MapPin, Package, Heart, Plus, Trash2, ShieldCheck, Key } from 'lucide-react';
import { updateProfile, addAddress, deleteAddress } from '../redux/slices/authSlice';
import { fetchMyOrders } from '../redux/slices/orderSlice';
import { fetchWishlist } from '../redux/slices/wishlistSlice';
import Modal from '../components/common/Modal';
import { useToast } from '../context/ToastContext';

const AccountPage = () => {
  const dispatch = useDispatch();
  const { showToast } = useToast();

  const { userInfo } = useSelector((state) => state.auth);
  const { orders } = useSelector((state) => state.orders);
  const { books: wishlistBooks } = useSelector((state) => state.wishlist);

  const [activeTab, setActiveTab] = useState('overview');
  const [name, setName] = useState(userInfo?.name || '');
  const [phone, setPhone] = useState(userInfo?.phone || '');
  const [password, setPassword] = useState('');
  const [updatingProfile, setUpdatingProfile] = useState(false);

  const [addAddressOpen, setAddAddressOpen] = useState(false);
  const [addressForm, setAddressForm] = useState({
    fullName: userInfo?.name || '',
    phone: userInfo?.phone || '',
    street: '',
    city: 'Lahore',
    province: 'Punjab',
    postalCode: '54000',
    country: 'Pakistan',
  });

  useEffect(() => {
    dispatch(fetchMyOrders());
    dispatch(fetchWishlist());
  }, [dispatch]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setUpdatingProfile(true);
    try {
      const payload = { name, phone };
      if (password) payload.password = password;
      await dispatch(updateProfile(payload)).unwrap();
      showToast('Profile updated successfully!', 'success');
      setPassword('');
    } catch (err) {
      showToast(err || 'Failed to update profile', 'error');
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleAddAddressSubmit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(addAddress(addressForm)).unwrap();
      showToast('New shipping address saved!', 'success');
      setAddAddressOpen(false);
    } catch (err) {
      showToast(err || 'Failed to add address', 'error');
    }
  };

  const handleDeleteAddress = (addressId) => {
    if (window.confirm('Delete this address?')) {
      dispatch(deleteAddress(addressId))
        .unwrap()
        .then(() => showToast('Address deleted', 'info'))
        .catch((err) => showToast(err || 'Failed to delete address', 'error'));
    }
  };

  const pendingOrders = orders.filter(o => o.orderStatus === 'Pending' || o.orderStatus === 'Processing');
  const completedOrders = orders.filter(o => o.orderStatus === 'Delivered');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="pb-6 border-b border-slate-200 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black font-serif text-slate-900">My Account Dashboard</h1>
          <p className="text-xs text-slate-500 mt-1">Manage profile information, delivery addresses, and orders</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Navigation Sidebar */}
        <aside className="lg:col-span-3 bg-white p-4 rounded-3xl border border-slate-200 shadow-sm space-y-1">
          {[
            { key: 'overview', label: 'Overview', icon: User },
            { key: 'profile', label: 'Edit Profile & Password', icon: Key },
            { key: 'addresses', label: 'Manage Addresses', icon: MapPin },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
                  activeTab === tab.key
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon className="w-4 h-4" /> {tab.label}
              </button>
            );
          })}
        </aside>

        {/* Content Area */}
        <main className="lg:col-span-9 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
          {/* Tab 1: Overview */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
                <img
                  src={userInfo?.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80'}
                  alt={userInfo?.name}
                  className="w-16 h-16 rounded-full object-cover border-2 border-emerald-500"
                />
                <div>
                  <h2 className="text-xl font-bold text-slate-900">{userInfo?.name}</h2>
                  <p className="text-xs text-slate-500">{userInfo?.email} | {userInfo?.phone || 'No phone added'}</p>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                  <Package className="w-6 h-6 text-emerald-600 mx-auto mb-1" />
                  <p className="text-2xl font-black text-slate-900">{orders.length}</p>
                  <p className="text-[11px] text-slate-500 font-medium">Total Orders</p>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                  <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-600 text-xs font-bold flex items-center justify-center mx-auto mb-1">
                    {pendingOrders.length}
                  </div>
                  <p className="text-2xl font-black text-slate-900">{pendingOrders.length}</p>
                  <p className="text-[11px] text-slate-500 font-medium">Pending Delivery</p>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                  <ShieldCheck className="w-6 h-6 text-emerald-600 mx-auto mb-1" />
                  <p className="text-2xl font-black text-slate-900">{completedOrders.length}</p>
                  <p className="text-[11px] text-slate-500 font-medium">Completed Orders</p>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                  <Heart className="w-6 h-6 text-rose-500 mx-auto mb-1" />
                  <p className="text-2xl font-black text-slate-900">{wishlistBooks.length}</p>
                  <p className="text-[11px] text-slate-500 font-medium">Wishlist Saved</p>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Edit Profile */}
          {activeTab === 'profile' && (
            <form onSubmit={handleUpdateProfile} className="space-y-6 max-w-md">
              <h3 className="font-bold text-slate-900 text-base font-serif">Edit Personal Details</h3>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">New Password (Leave blank to keep current)</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={6}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <button
                type="submit"
                disabled={updatingProfile}
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all shadow disabled:opacity-50"
              >
                {updatingProfile ? 'Saving Changes...' : 'Save Profile Changes'}
              </button>
            </form>
          )}

          {/* Tab 3: Addresses */}
          {activeTab === 'addresses' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <h3 className="font-bold text-slate-900 text-base font-serif">Saved Delivery Addresses</h3>
                <button
                  onClick={() => setAddAddressOpen(true)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow"
                >
                  <Plus className="w-4 h-4" /> Add Address
                </button>
              </div>

              {userInfo?.addresses.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No saved delivery addresses yet.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {userInfo?.addresses.map((addr) => (
                    <div key={addr._id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2 relative">
                      <div className="flex items-center justify-between">
                        <p className="font-bold text-xs text-slate-900">{addr.fullName}</p>
                        {addr.isDefault && (
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-md">
                            DEFAULT
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600">{addr.street}, {addr.city}, {addr.province} {addr.postalCode}</p>
                      <p className="text-xs text-slate-500">Phone: {addr.phone}</p>
                      <button
                        onClick={() => handleDeleteAddress(addr._id)}
                        className="text-[11px] font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 pt-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Add Address Modal */}
      <Modal isOpen={addAddressOpen} onClose={() => setAddAddressOpen(false)} title="Add New Shipping Address">
        <form onSubmit={handleAddAddressSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
            <input
              type="text"
              value={addressForm.fullName}
              onChange={(e) => setAddressForm({ ...addressForm, fullName: e.target.value })}
              required
              className="w-full px-3 py-2 text-xs bg-slate-50 border rounded-xl"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Phone</label>
            <input
              type="text"
              value={addressForm.phone}
              onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
              required
              className="w-full px-3 py-2 text-xs bg-slate-50 border rounded-xl"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Street Address</label>
            <input
              type="text"
              value={addressForm.street}
              onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
              required
              className="w-full px-3 py-2 text-xs bg-slate-50 border rounded-xl"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">City</label>
              <input
                type="text"
                value={addressForm.city}
                onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                required
                className="w-full px-3 py-2 text-xs bg-slate-50 border rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Postal Code</label>
              <input
                type="text"
                value={addressForm.postalCode}
                onChange={(e) => setAddressForm({ ...addressForm, postalCode: e.target.value })}
                required
                className="w-full px-3 py-2 text-xs bg-slate-50 border rounded-xl"
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow"
          >
            Save Address
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default AccountPage;
