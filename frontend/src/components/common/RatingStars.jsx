import React from 'react';
import { Star } from 'lucide-react';

const RatingStars = ({ rating = 0, reviewCount, size = 'sm', interactive = false, onRatingChange }) => {
  const stars = [1, 2, 3, 4, 5];
  const starSizes = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center">
        {stars.map((star) => {
          const isFilled = star <= Math.floor(rating);
          const isHalf = star === Math.ceil(rating) && rating % 1 !== 0;

          return (
            <button
              key={star}
              type={interactive ? 'button' : 'button'}
              disabled={!interactive}
              onClick={() => interactive && onRatingChange && onRatingChange(star)}
              className={`${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform p-0.5`}
            >
              <Star
                className={`${starSizes[size] || starSizes.sm} ${
                  isFilled
                    ? 'fill-amber-400 text-amber-400'
                    : isHalf
                    ? 'fill-amber-400/50 text-amber-400'
                    : 'fill-slate-200 text-slate-300'
                }`}
              />
            </button>
          );
        })}
      </div>
      {rating > 0 && (
        <span className="text-xs font-semibold text-slate-700 ml-1">
          {Number(rating).toFixed(1)}
        </span>
      )}
      {reviewCount !== undefined && (
        <span className="text-xs text-slate-500 font-normal">
          ({reviewCount})
        </span>
      )}
    </div>
  );
};

export default RatingStars;
