import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Filter, SlidersHorizontal, RotateCcw, Search } from 'lucide-react';
import { fetchBooks, fetchCategories, fetchAuthors, fetchPublishers } from '../redux/slices/bookSlice';
import BookGrid from '../components/book/BookGrid';
import { BookGridSkeleton } from '../components/common/Loader';
import Pagination from '../components/common/Pagination';
import EmptyState from '../components/common/EmptyState';
import SearchBar from '../components/common/SearchBar';

const BooksPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const dispatch = useDispatch();

  const { books, page, pages, totalBooks, categories, authors, publishers, loading } = useSelector(
    (state) => state.books
  );

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [selectedAuthor, setSelectedAuthor] = useState(searchParams.get('author') || '');
  const [selectedPublisher, setSelectedPublisher] = useState(searchParams.get('publisher') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [rating, setRating] = useState(searchParams.get('rating') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');
  const [inStock, setInStock] = useState(searchParams.get('inStock') === 'true');
  const [showMobileFilter, setShowMobileFilter] = useState(false);

  const currentPage = Number(searchParams.get('page')) || 1;

  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchAuthors());
    dispatch(fetchPublishers());
  }, [dispatch]);

  useEffect(() => {
    const params = {};
    if (search) params.search = search;
    if (selectedCategory) params.category = selectedCategory;
    if (selectedAuthor) params.author = selectedAuthor;
    if (selectedPublisher) params.publisher = selectedPublisher;
    if (minPrice) params.minPrice = minPrice;
    if (maxPrice) params.maxPrice = maxPrice;
    if (rating) params.rating = rating;
    if (sort) params.sort = sort;
    if (inStock) params.inStock = 'true';
    if (currentPage > 1) params.page = currentPage;

    dispatch(fetchBooks(params));
  }, [
    dispatch,
    search,
    selectedCategory,
    selectedAuthor,
    selectedPublisher,
    minPrice,
    maxPrice,
    rating,
    sort,
    inStock,
    currentPage,
  ]);

  const handleSearchSubmit = (query) => {
    setSearch(query);
    updateUrlParam('search', query);
  };

  const updateUrlParam = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const handleResetFilters = () => {
    setSearch('');
    setSelectedCategory('');
    setSelectedAuthor('');
    setSelectedPublisher('');
    setMinPrice('');
    setMaxPrice('');
    setRating('');
    setSort('newest');
    setInStock(false);
    setSearchParams({});
  };

  const handlePageChange = (newPage) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', newPage.toString());
    setSearchParams(newParams);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-3xl font-black font-serif text-slate-900">Explore Catalog</h1>
          <p className="text-xs text-slate-500 mt-1">
            Showing {totalBooks} books across programming, fiction, business, and science
          </p>
        </div>

        {/* Top Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowMobileFilter(!showMobileFilter)}
            className="md:hidden px-4 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-700 flex items-center gap-2"
          >
            <Filter className="w-4 h-4 text-emerald-600" /> Filters
          </button>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 hidden sm:inline">Sort:</span>
            <select
              value={sort}
              onChange={(e) => {
                setSort(e.target.value);
                updateUrlParam('sort', e.target.value);
              }}
              className="px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="newest">Newest Arrivals</option>
              <option value="oldest">Oldest First</option>
              <option value="priceAsc">Price: Low to High</option>
              <option value="priceDesc">Price: High to Low</option>
              <option value="popular">Most Popular</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Search Bar */}
      <div className="max-w-2xl">
        <SearchBar onSearch={handleSearchSubmit} placeholder="Search by title, author, ISBN, or topic..." />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Sidebar Filters */}
        <aside
          className={`md:col-span-3 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6 ${
            showMobileFilter ? 'block' : 'hidden md:block'
          }`}
        >
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-emerald-600" />
              <h3 className="font-bold text-sm text-slate-900">Filters</h3>
            </div>
            <button
              onClick={handleResetFilters}
              className="text-[11px] font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" /> Reset
            </button>
          </div>

          {/* Category Filter */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                updateUrlParam('category', e.target.value);
              }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat.slug}>
                  {cat.name} ({cat.bookCount || 0})
                </option>
              ))}
            </select>
          </div>

          {/* Author Filter */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">Author</label>
            <select
              value={selectedAuthor}
              onChange={(e) => {
                setSelectedAuthor(e.target.value);
                updateUrlParam('author', e.target.value);
              }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">All Authors</option>
              {authors.map((aut) => (
                <option key={aut._id} value={aut.slug}>
                  {aut.name}
                </option>
              ))}
            </select>
          </div>

          {/* Publisher Filter */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">Publisher</label>
            <select
              value={selectedPublisher}
              onChange={(e) => {
                setSelectedPublisher(e.target.value);
                updateUrlParam('publisher', e.target.value);
              }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">All Publishers</option>
              {publishers.map((pub) => (
                <option key={pub._id} value={pub.slug}>
                  {pub.name}
                </option>
              ))}
            </select>
          </div>

          {/* Price Range Filter */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">Price Range (RS)</label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                placeholder="Min"
                value={minPrice}
                onChange={(e) => {
                  setMinPrice(e.target.value);
                  updateUrlParam('minPrice', e.target.value);
                }}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
              />
              <input
                type="number"
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => {
                  setMaxPrice(e.target.value);
                  updateUrlParam('maxPrice', e.target.value);
                }}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
              />
            </div>
          </div>

          {/* Minimum Rating */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">Rating</label>
            <select
              value={rating}
              onChange={(e) => {
                setRating(e.target.value);
                updateUrlParam('rating', e.target.value);
              }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">All Ratings</option>
              <option value="4.5">4.5★ & Above</option>
              <option value="4.0">4.0★ & Above</option>
              <option value="3.5">3.5★ & Above</option>
            </select>
          </div>

          {/* Availability Checkbox */}
          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="inStockOnly"
              checked={inStock}
              onChange={(e) => {
                setInStock(e.target.checked);
                updateUrlParam('inStock', e.target.checked ? 'true' : '');
              }}
              className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
            />
            <label htmlFor="inStockOnly" className="text-xs font-medium text-slate-700 cursor-pointer">
              In Stock Only
            </label>
          </div>
        </aside>

        {/* Books Content Area */}
        <main className="md:col-span-9">
          {loading ? (
            <BookGridSkeleton count={8} />
          ) : books.length === 0 ? (
            <EmptyState
              icon="search"
              title="No books match your criteria"
              description="Try adjusting your filter options or search keyword to find what you are looking for."
              actionText="Reset All Filters"
              onActionClick={handleResetFilters}
            />
          ) : (
            <>
              <BookGrid books={books} />
              <Pagination page={page} pages={pages} onPageChange={handlePageChange} />
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default BooksPage;
