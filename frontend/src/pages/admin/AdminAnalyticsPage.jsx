import React, { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, DollarSign, Package } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import { Spinner } from '../../components/common/Loader';

const AdminAnalyticsPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const { data } = await axiosClient.get('/admin/stats');
        setStats(data);
      } catch (err) {
        console.error('Failed to load analytics stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading || !stats) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const formattedMonthlyData = (stats.monthlyRevenue || []).map(item => ({
    label: `${months[item._id.month - 1]} ${item._id.year}`,
    revenue: item.revenue,
    orders: item.orders,
  }));

  const maxRevenue = Math.max(...formattedMonthlyData.map(m => m.revenue), 1000);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black font-serif text-slate-900">Sales Analytics</h1>
        <p className="text-xs text-slate-500 mt-1">Detailed revenue reports, sales trends, and order volume</p>
      </div>

      {/* Bar Chart Visualization */}
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-slate-900 text-base font-serif">Monthly Sales Revenue Breakdown</h3>
          </div>
          <span className="text-xs font-bold text-slate-500">Last 6 Months</span>
        </div>

        {formattedMonthlyData.length === 0 ? (
          <p className="text-xs text-slate-400 italic">No revenue recorded yet.</p>
        ) : (
          <div className="h-64 flex items-end justify-between gap-4 pt-8 pb-2 px-4 border-b border-slate-200">
            {formattedMonthlyData.map((m, idx) => {
              const heightPercent = Math.max(10, Math.round((m.revenue / maxRevenue) * 100));
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                  <div className="text-[10px] font-bold text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity">
                    RS {m.revenue.toLocaleString()}
                  </div>
                  <div
                    className="w-full bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t-xl group-hover:brightness-110 transition-all"
                    style={{ height: `${heightPercent}%` }}
                  />
                  <span className="text-[11px] font-bold text-slate-600 truncate">{m.label}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAnalyticsPage;
