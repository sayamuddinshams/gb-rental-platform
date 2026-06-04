import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { 
  Users, Building, MessageSquare, AlertOctagon, Eye,
  ArrowUpRight, ArrowDownRight, Activity, Terminal
} from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTenants: 0,
    totalOwners: 0,
    totalListings: 0,
    activeListings: 0,
    pendingReports: 0,
    totalViews: 0
  });
  
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        const statsRes = await axios.get('/api/admin/stats');
        setStats(statsRes.data.kpis);

        const logsRes = await axios.get('/api/admin/logs');
        setLogs(logsRes.data.slice(0, 4));
      } catch (err) {
        console.warn('API admin stats fetch failed. Loading static admin dashboard mocks.');
        
        // Static Seeder Fallback Mocks
        setStats({
          totalUsers: 3,
          totalTenants: 1,
          totalOwners: 1,
          totalListings: 5,
          activeListings: 4,
          pendingReports: 1,
          totalViews: 750
        });

        setLogs([
          { id: 1, action: 'CREATE_LISTING', details: 'Added property "Hunza Heights Luxury Guest Cottage"', user_name: 'Karakoram Properties Ltd.', created_at: new Date().toISOString() },
          { id: 2, action: 'VERIFY_OWNER', details: 'Approved owner account "Karakoram Properties Ltd."', user_name: 'System', created_at: new Date(Date.now() - 3600000).toISOString() }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminStats();
  }, []);

  const cards = [
    { label: 'Total Users Registered', count: stats.totalUsers, desc: `${stats.totalTenants} Tenants & ${stats.totalOwners} Landlords`, isPos: true, icon: Users, color: 'text-brand-500 bg-brand-500/10' },
    { label: 'Total Listings Vetted', count: stats.totalListings, desc: `${stats.activeListings} Approved & Public`, isPos: true, icon: Building, color: 'text-blue-500 bg-blue-500/10' },
    { label: 'Unresolved Reports', count: stats.pendingReports, desc: 'Requires moderation review', isPos: false, icon: AlertOctagon, color: 'text-rose-500 bg-rose-500/10' },
    { label: 'Global Traffic Views', count: stats.totalViews, desc: 'Cumulative listing views count', isPos: true, icon: Eye, color: 'text-emerald-500 bg-emerald-500/10' }
  ];

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(s => <div key={s} className="h-28 bg-slate-200 dark:bg-slate-900 rounded-3xl"></div>)}
        </div>
        <div className="h-96 bg-slate-200 dark:bg-slate-900 rounded-3xl w-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">System Analytics</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Monitor system registries, review listing escalations, and track security logs
        </p>
      </div>

      {/* 1. KPI OVERVIEW STATS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-3xl p-5 shadow-sm space-y-4">
              <div className="flex justify-between items-start">
                <div className={`p-3 rounded-2xl ${card.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <Activity className="h-4 w-4 text-slate-300 dark:text-slate-700" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">{card.label}</span>
                <h3 className="text-2xl font-black text-slate-800 dark:text-white mt-0.5">{card.count}</h3>
                <p className="text-[10px] text-slate-400 font-semibold mt-1">{card.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* 2. SYSTEM GROWTH CUSTOM GRAPH */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2/3: User and Listing Growth Trend */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-[2rem] p-6 shadow-sm space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="font-extrabold text-sm text-slate-800 dark:text-white flex items-center space-x-1.5">
              <TrendingUpIcon className="h-4.5 w-4.5 text-brand-500" />
              <span>Platform Registry Growth</span>
            </h3>
            <span className="text-xs text-slate-400 font-semibold">Jan - Jun 2026</span>
          </div>

          <div className="h-64 w-full relative">
            <svg className="w-full h-full" viewBox="0 0 500 200">
              <line x1="30" y1="20" x2="480" y2="20" stroke="#f1f5f9" strokeWidth="1" className="dark:stroke-slate-800" />
              <line x1="30" y1="80" x2="480" y2="80" stroke="#f1f5f9" strokeWidth="1" className="dark:stroke-slate-800" />
              <line x1="30" y1="140" x2="480" y2="140" stroke="#f1f5f9" strokeWidth="1" className="dark:stroke-slate-800" />
              <line x1="30" y1="180" x2="480" y2="180" stroke="#e2e8f0" strokeWidth="1.5" className="dark:stroke-slate-800" />

              {/* Area for Users */}
              <path d="M 30 180 L 30 160 L 120 145 L 210 120 L 300 95 L 390 70 L 480 40 L 480 180 Z" fill="#6366f1" fillOpacity="0.1" />
              {/* Users Line */}
              <path d="M 30 160 L 120 145 L 210 120 L 300 95 L 390 70 L 480 40" fill="none" stroke="#6366f1" strokeWidth="2.5" />
              
              {/* Listings Line */}
              <path d="M 30 175 L 120 165 L 210 150 L 300 130 L 390 110 L 480 90" fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeDasharray="4 4" />

              {/* Legend */}
              <circle cx="40" cy="15" r="4" fill="#6366f1" />
              <text x="48" y="18" fill="#94a3b8" fontSize="8" fontWeight="bold">Users Joined</text>
              <circle cx="120" cy="15" r="4" fill="#3b82f6" />
              <text x="128" y="18" fill="#94a3b8" fontSize="8" fontWeight="bold">Properties Listed</text>

              {/* Horizontal labels */}
              <text x="30" y="194" fill="#94a3b8" fontSize="9" fontWeight="bold" textAnchor="middle">Jan</text>
              <text x="120" y="194" fill="#94a3b8" fontSize="9" fontWeight="bold" textAnchor="middle">Feb</text>
              <text x="210" y="194" fill="#94a3b8" fontSize="9" fontWeight="bold" textAnchor="middle">Mar</text>
              <text x="300" y="194" fill="#94a3b8" fontSize="9" fontWeight="bold" textAnchor="middle">Apr</text>
              <text x="390" y="194" fill="#94a3b8" fontSize="9" fontWeight="bold" textAnchor="middle flex">May</text>
              <text x="480" y="194" fill="#94a3b8" fontSize="9" fontWeight="bold" textAnchor="middle">Jun</text>
            </svg>
          </div>
        </div>

        {/* Right 1/3: Recent Audit Logs Snippet */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-[2rem] p-6 shadow-sm flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-slate-800 dark:text-white flex items-center space-x-1.5">
              <Terminal className="h-4.5 w-4.5 text-brand-500" />
              <span>Audit logs feed</span>
            </h3>
            <Link to="/admin/logs" className="text-[10px] font-bold text-brand-500 hover:underline">
              View Logs
            </Link>
          </div>

          <div className="space-y-3 flex-grow overflow-y-auto max-h-56">
            {logs.map((log) => (
              <div key={log.id} className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200/30 dark:border-slate-850 rounded-2xl space-y-1">
                <div className="flex justify-between items-baseline">
                  <span className="text-[8px] font-mono font-bold uppercase text-brand-600 bg-brand-500/5 px-1.5 py-0.5 rounded border border-brand-500/10">
                    {log.action}
                  </span>
                  <span className="text-[8px] text-slate-400 font-semibold">
                    {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 leading-normal">
                  {log.details}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};

// Helper Icon since lucide doesnt have TrendingUp directly matching naming
const TrendingUpIcon = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
);

export default AdminDashboard;
