import React from 'react';

export const Spinner = ({ size = 'md', className = '' }) => {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  return (
    <div className={`inline-block animate-spin rounded-full border-slate-200 border-t-emerald-600 ${sizes[size] || sizes.md} ${className}`} />
  );
};

export const BookCardSkeleton = () => (
  <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm animate-pulse flex flex-col h-full">
    <div className="w-full h-56 bg-slate-200 rounded-xl mb-4" />
    <div className="h-4 bg-slate-200 rounded w-3/4 mb-2" />
    <div className="h-3 bg-slate-200 rounded w-1/2 mb-4" />
    <div className="h-4 bg-slate-200 rounded w-1/3 mb-6 mt-auto" />
    <div className="h-10 bg-slate-200 rounded-xl w-full" />
  </div>
);

export const BookGridSkeleton = ({ count = 8 }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
    {Array.from({ length: count }).map((_, i) => (
      <BookCardSkeleton key={i} />
    ))}
  </div>
);

export const TableSkeleton = ({ rows = 5 }) => (
  <div className="space-y-3 animate-pulse">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="h-12 bg-slate-100 rounded-xl w-full" />
    ))}
  </div>
);
