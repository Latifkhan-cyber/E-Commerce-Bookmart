import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ShoppingBag, Heart, PackageX, Search, MessageSquare } from 'lucide-react';

const icons = {
  books: BookOpen,
  cart: ShoppingBag,
  wishlist: Heart,
  orders: PackageX,
  search: Search,
  reviews: MessageSquare,
};

const EmptyState = ({
  icon = 'books',
  title = 'No items found',
  description = 'We couldn\'t find what you were looking for.',
  actionText,
  actionLink,
  onActionClick,
}) => {
  const IconComponent = icons[icon] || BookOpen;

  return (
    <div className="flex flex-col items-center justify-center text-center p-12 bg-white rounded-3xl border border-slate-200 shadow-sm my-8">
      <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 shadow-inner">
        <IconComponent className="w-8 h-8" />
      </div>
      <h3 className="text-xl font-bold text-slate-800 mb-2">{title}</h3>
      <p className="text-sm text-slate-500 max-w-md mb-6 leading-relaxed">{description}</p>
      
      {actionText && actionLink && (
        <Link
          to={actionLink}
          className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-sm transition-all shadow-md shadow-emerald-600/20 hover:shadow-lg"
        >
          {actionText}
        </Link>
      )}

      {actionText && onActionClick && !actionLink && (
        <button
          onClick={onActionClick}
          className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-sm transition-all shadow-md shadow-emerald-600/20 hover:shadow-lg"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
