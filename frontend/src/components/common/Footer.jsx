import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Mail, Phone, MapPin, Send, Heart } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import { useToast } from '../../context/ToastContext';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      const { data } = await axiosClient.post('/newsletter/subscribe', { email });
      showToast(data.message || 'Subscribed successfully!', 'success');
      setEmail('');
    } catch (err) {
      showToast(err.message || 'Subscription failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          {/* Col 1: Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-emerald-400 text-white flex items-center justify-center shadow-lg">
                <BookOpen className="w-6 h-6" />
              </div>
              <span className="text-2xl font-black tracking-tight text-white font-serif">
                Book<span className="text-emerald-500">Mart</span>
              </span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              BookMart is your trusted digital sanctuary for learning, fiction, software engineering, medicine, history, and academic titles. Delivered straight to your doorstep.
            </p>
            
            {/* Newsletter Subscription */}
            <div className="pt-2">
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-2">
                Subscribe to our Newsletter
              </h4>
              <form onSubmit={handleSubscribe} className="flex gap-2 max-w-sm">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email..."
                  required
                  className="w-full px-3.5 py-2 text-xs bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 font-serif">
              Quick Links
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li><Link to="/books" className="hover:text-emerald-400 transition-colors">Browse All Books</Link></li>
              <li><Link to="/categories" className="hover:text-emerald-400 transition-colors">Book Categories</Link></li>
              <li><Link to="/authors" className="hover:text-emerald-400 transition-colors">Featured Authors</Link></li>
              <li><Link to="/publishers" className="hover:text-emerald-400 transition-colors">Publishers</Link></li>
              <li><Link to="/deals" className="hover:text-emerald-400 transition-colors">Special Deals</Link></li>
            </ul>
          </div>

          {/* Col 3: Categories */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 font-serif">
              Top Categories
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li><Link to="/books?category=programming" className="hover:text-emerald-400 transition-colors">Programming</Link></li>
              <li><Link to="/books?category=fiction-novels" className="hover:text-emerald-400 transition-colors">Fiction & Novels</Link></li>
              <li><Link to="/books?category=business-finance" className="hover:text-emerald-400 transition-colors">Business & Finance</Link></li>
              <li><Link to="/books?category=medical-healthcare" className="hover:text-emerald-400 transition-colors">Medical & Healthcare</Link></li>
              <li><Link to="/books?category=history-culture" className="hover:text-emerald-400 transition-colors">History & Culture</Link></li>
            </ul>
          </div>

          {/* Col 4: Contact Support */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 font-serif">
              Customer Support
            </h4>
            <ul className="space-y-3 text-xs text-slate-400">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>100 Tech Avenue, Block 5, Lahore, Pakistan</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>+92 (300) 123-4567</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>support@bookmart.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} BookMart Inc. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-slate-400 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-slate-400 cursor-pointer">Terms of Service</span>
            <span className="hover:text-slate-400 cursor-pointer">Cash on Delivery Info</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
