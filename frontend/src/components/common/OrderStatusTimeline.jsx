import React from 'react';
import { Clock, CheckCircle2, PackageCheck, Truck, Home, XCircle } from 'lucide-react';

const steps = [
  { key: 'Pending', label: 'Order Placed', icon: Clock },
  { key: 'Confirmed', label: 'Confirmed', icon: CheckCircle2 },
  { key: 'Processing', label: 'Processing', icon: PackageCheck },
  { key: 'Shipped', label: 'Shipped', icon: Truck },
  { key: 'Delivered', label: 'Delivered', icon: Home },
];

const OrderStatusTimeline = ({ currentStatus = 'Pending' }) => {
  if (currentStatus === 'Cancelled') {
    return (
      <div className="flex items-center gap-3 p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl">
        <XCircle className="w-6 h-6 shrink-0 text-rose-600" />
        <div>
          <h4 className="font-bold text-sm">Order Cancelled</h4>
          <p className="text-xs text-rose-600">This order has been cancelled and stock has been restored.</p>
        </div>
      </div>
    );
  }

  const currentIndex = steps.findIndex(s => s.key === currentStatus);
  const activeIndex = currentIndex === -1 ? 0 : currentIndex;

  return (
    <div className="w-full py-6">
      <div className="flex items-center justify-between relative">
        {/* Progress Bar Background */}
        <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-200 -translate-y-1/2 z-0" />
        
        {/* Active Progress Line */}
        <div
          className="absolute top-1/2 left-0 h-1 bg-emerald-600 -translate-y-1/2 z-0 transition-all duration-500"
          style={{ width: `${(activeIndex / (steps.length - 1)) * 100}%` }}
        />

        {steps.map((step, idx) => {
          const isDone = idx <= activeIndex;
          const isCurrent = idx === activeIndex;
          const StepIcon = step.icon;

          return (
            <div key={step.key} className="relative z-10 flex flex-col items-center group">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isCurrent
                    ? 'bg-emerald-600 text-white ring-4 ring-emerald-100 scale-110 shadow-lg'
                    : isDone
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'bg-white text-slate-400 border-2 border-slate-300'
                }`}
              >
                <StepIcon className="w-5 h-5" />
              </div>
              <span
                className={`mt-2 text-xs font-medium text-center transition-colors ${
                  isCurrent
                    ? 'text-emerald-700 font-bold'
                    : isDone
                    ? 'text-slate-800'
                    : 'text-slate-400'
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OrderStatusTimeline;
