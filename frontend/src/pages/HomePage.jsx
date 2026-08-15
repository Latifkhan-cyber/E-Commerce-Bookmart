import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { BookOpen, Sparkles, TrendingUp, Award, ArrowRight, ShieldCheck, Truck, RefreshCw, Star } from 'lucide-react';
import { fetchBooks, fetchCategories, fetchAuthors } from '../redux/slices/bookSlice';
import BookGrid from '../components/book/BookGrid';
import { BookGridSkeleton } from '../components/common/Loader';

const HomePage = () => {
  const dispatch = useDispatch();
  const { books, categories, authors, loading } = useSelector((state) => state.books);

  useEffect(() => {
    dispatch(fetchBooks({ limit: 16 }));
    dispatch(fetchCategories());
    dispatch(fetchAuthors());
  }, [dispatch]);

  const featuredBooks = books.filter(b => b.featured).slice(0, 4);
  const bestSellers = books.filter(b => b.bestSeller).slice(0, 4);
  const newArrivals = [...books].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 4);
  const discountBooks = books.filter(b => b.discountPrice > 0 && b.discountPrice < b.price).slice(0, 4);

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 text-white py-20 px-4 sm:px-6 lg:px-8 rounded-3xl shadow-2xl mx-4 sm:mx-6 lg:mx-8 mt-6">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-500/20 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold uppercase tracking-wider backdrop-blur-md">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              Welcome to BookMart Bookstore
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black font-serif tracking-tight leading-[1.1]">
              Discover Your Next <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-amber-300">Great Book</span>
            </h1>

            <p className="text-slate-300 text-base sm:text-lg max-w-2xl leading-relaxed">
              Explore thousands of handpicked titles across programming, algorithms, medical sciences, business, fiction, and history with cash-on-delivery and doorstep shipping.
            </p>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
              <Link
                to="/books"
                className="px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold rounded-2xl text-sm transition-all shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:scale-105 flex items-center gap-2"
              >
                Shop Books <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/categories"
                className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-2xl text-sm transition-all border border-white/15 backdrop-blur-md"
              >
                Browse Categories
              </Link>
            </div>

            {/* Micro stats */}
            <div className="grid grid-cols-3 gap-4 pt-8 border-t border-white/10 text-center lg:text-left">
              <div>
                <p className="text-2xl font-extrabold text-white font-serif">20,000+</p>
                <p className="text-xs text-slate-400">Curated Books</p>
              </div>
              <div>
                <p className="text-2xl font-extrabold text-white font-serif">100%</p>
                <p className="text-xs text-slate-400">Authentic Prints</p>
              </div>
              <div>
                <p className="text-2xl font-extrabold text-white font-serif">4.9★</p>
                <p className="text-xs text-slate-400">Customer Rating</p>
              </div>
            </div>
          </div>

          {/* Hero Image Showcase */}
          <div className="lg:col-span-5 relative flex items-center justify-center">
            <div className="relative w-full max-w-sm aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl border-4 border-white/10 transform rotate-2 hover:rotate-0 transition-transform duration-500">
              <img
                src="https://images.unsplash.com/photo-1532012197267-da84d127e765?w=800&q=80"
                alt="BookMart Hero Showcase"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="flex items-center gap-4 p-6 bg-white rounded-2xl border border-slate-200/80 shadow-sm">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">Free Delivery</h4>
              <p className="text-xs text-slate-500">On all orders above RS 2,000</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-6 bg-white rounded-2xl border border-slate-200/80 shadow-sm">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">Cash on Delivery</h4>
              <p className="text-xs text-slate-500">Pay safely at your doorstep</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-6 bg-white rounded-2xl border border-slate-200/80 shadow-sm">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <RefreshCw className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">7 Days Return</h4>
              <p className="text-xs text-slate-500">Hassle-free replacement policy</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Showcase Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold font-serif text-slate-900">Explore Categories</h2>
            <p className="text-xs text-slate-500">Find books categorized by genre and academic subject</p>
          </div>
          <Link to="/categories" className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.slice(0, 8).map((cat) => (
            <Link
              key={cat._id}
              to={`/books?category=${cat.slug}`}
              className="group relative rounded-2xl overflow-hidden aspect-[4/3] bg-slate-900 text-white shadow-sm hover:shadow-md transition-all duration-300"
            >
              <img
                src={cat.image}
                alt={cat.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 opacity-60 group-hover:opacity-40"
              />
              <div className="absolute inset-0 p-4 flex flex-col justify-end bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent">
                <h3 className="font-bold text-sm text-white group-hover:text-emerald-300 transition-colors">
                  {cat.name}
                </h3>
                <p className="text-[11px] text-slate-300 font-medium">
                  {cat.bookCount || 0} Books Available
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Books Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <Award className="w-6 h-6 text-emerald-600" />
            <div>
              <h2 className="text-2xl font-bold font-serif text-slate-900">Featured Collections</h2>
              <p className="text-xs text-slate-500">Hand-picked by our editorial literature staff</p>
            </div>
          </div>
          <Link to="/books?featured=true" className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
            See All Featured <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? <BookGridSkeleton count={4} /> : <BookGrid books={featuredBooks.length > 0 ? featuredBooks : books.slice(0, 4)} />}
      </section>

      {/* Best Sellers Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-amber-500" />
            <div>
              <h2 className="text-2xl font-bold font-serif text-slate-900">Best Sellers</h2>
              <p className="text-xs text-slate-500">Most popular reads across our bookstore</p>
            </div>
          </div>
          <Link to="/books?sort=popular" className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
            Browse Bestsellers <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? <BookGridSkeleton count={4} /> : <BookGrid books={bestSellers.length > 0 ? bestSellers : books.slice(4, 8)} />}
      </section>

      {/* Discount / Sales Banner */}
      {discountBooks.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-rose-950 text-white rounded-3xl p-8 sm:p-12 relative overflow-hidden shadow-xl">
            <div className="max-w-xl space-y-4 relative z-10">
              <span className="px-3 py-1 bg-rose-600 text-white text-xs font-bold rounded-lg uppercase tracking-wider">
                Limited Time Deals
              </span>
              <h2 className="text-3xl font-black font-serif">Special Discounts On Tech & Classics</h2>
              <p className="text-rose-200 text-sm">Save up to 30% on bestselling programming guides and literary masterpieces.</p>
              <Link
                to="/deals"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-rose-950 font-bold rounded-xl text-xs hover:bg-rose-100 transition-colors shadow"
              >
                View Discount Deals <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Popular Authors Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold font-serif text-slate-900">Popular Authors</h2>
            <p className="text-xs text-slate-500">Meet the masterminds behind your favorite books</p>
          </div>
          <Link to="/authors" className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
            View All Authors <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          {authors.slice(0, 4).map((aut) => (
            <Link
              key={aut._id}
              to={`/authors/${aut.slug}`}
              className="group bg-white p-6 rounded-2xl border border-slate-200/80 text-center hover:shadow-md transition-all duration-300"
            >
              <img
                src={aut.image}
                alt={aut.name}
                className="w-20 h-20 rounded-full object-cover mx-auto mb-4 border-2 border-emerald-500/20 group-hover:scale-105 transition-transform"
              />
              <h3 className="font-bold text-slate-900 text-sm group-hover:text-emerald-600 transition-colors">
                {aut.name}
              </h3>
              <p className="text-xs text-slate-400 mt-1">{aut.bookCount || 0} Published Books</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold font-serif text-slate-900">What Our Readers Say</h2>
          <p className="text-xs text-slate-500">Real feedback from verified BookMart customers</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
            <div className="flex text-amber-400">
              <Star className="w-4 h-4 fill-amber-400" />
              <Star className="w-4 h-4 fill-amber-400" />
              <Star className="w-4 h-4 fill-amber-400" />
              <Star className="w-4 h-4 fill-amber-400" />
              <Star className="w-4 h-4 fill-amber-400" />
            </div>
            <p className="text-xs text-slate-600 leading-relaxed font-serif italic">
              "Ordered Clean Code and Introduction to Algorithms. Received pristine original copies with cash-on-delivery in just 2 days!"
            </p>
            <div className="pt-2 border-t border-slate-100">
              <p className="text-xs font-bold text-slate-900">Ali Hamza</p>
              <p className="text-[10px] text-slate-400">Software Engineer, Lahore</p>
            </div>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
            <div className="flex text-amber-400">
              <Star className="w-4 h-4 fill-amber-400" />
              <Star className="w-4 h-4 fill-amber-400" />
              <Star className="w-4 h-4 fill-amber-400" />
              <Star className="w-4 h-4 fill-amber-400" />
              <Star className="w-4 h-4 fill-amber-400" />
            </div>
            <p className="text-xs text-slate-600 leading-relaxed font-serif italic">
              "The search system and filter options made it so effortless to locate medical physiology textbooks for my university classes."
            </p>
            <div className="pt-2 border-t border-slate-100">
              <p className="text-xs font-bold text-slate-900">Sara Ahmed</p>
              <p className="text-[10px] text-slate-400">Medical Student, Karachi</p>
            </div>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
            <div className="flex text-amber-400">
              <Star className="w-4 h-4 fill-amber-400" />
              <Star className="w-4 h-4 fill-amber-400" />
              <Star className="w-4 h-4 fill-amber-400" />
              <Star className="w-4 h-4 fill-amber-400" />
              <Star className="w-4 h-4 fill-amber-400" />
            </div>
            <p className="text-xs text-slate-600 leading-relaxed font-serif italic">
              "BookMart is hands down the best online bookstore. Great customer support and tracking system."
            </p>
            <div className="pt-2 border-t border-slate-100">
              <p className="text-xs font-bold text-slate-900">Usman Tariq</p>
              <p className="text-[10px] text-slate-400">Avid Reader, Islamabad</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
