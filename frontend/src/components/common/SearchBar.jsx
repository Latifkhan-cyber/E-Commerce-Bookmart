import React, { useState } from 'react';
import { Search, X } from 'lucide-react';

const SearchBar = ({ onSearch, placeholder = 'Search books by title, author, category or ISBN...', className = '' }) => {
  const [term, setTerm] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch) onSearch(term.trim());
  };

  const handleClear = () => {
    setTerm('');
    if (onSearch) onSearch('');
  };

  return (
    <form onSubmit={handleSubmit} className={`relative flex items-center w-full ${className}`}>
      <div className="absolute left-4 text-slate-400 pointer-events-none">
        <Search className="w-5 h-5" />
      </div>
      <input
        type="text"
        value={term}
        onChange={(e) => setTerm(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-12 pr-10 py-3 text-sm bg-white border border-slate-300 rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-sm transition-all text-slate-800 placeholder-slate-400"
      />
      {term && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-4 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </form>
  );
};

export default SearchBar;
