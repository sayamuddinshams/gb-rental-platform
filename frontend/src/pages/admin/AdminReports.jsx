import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AlertOctagon, CheckCircle2, User, HelpCircle, Eye } from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';

const AdminReports = () => {
  const { showToast } = useNotification();

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all reports
  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/admin/reports');
      setReports(res.data);
    } catch (err) {
      console.warn('API reports fetch failed. Loading static admin reports mockup.');
      setReports([
        {
          id: 1,
          reporter_name: 'Ali Ahmed',
          reported_user_name: 'Karakoram Properties Ltd.',
          property_title: 'Cozy 1-Bedroom Studio Apartment',
          report_type: 'spam_property',
          description: 'Testing report: The pricing shown is slightly lower than what the owner mentioned on call. Please verify.',
          status: 'pending',
          created_at: new Date().toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleResolveReport = async (id) => {
    try {
      await axios.put(`/api/admin/reports/${id}/resolve`);
      showToast('Report case resolved successfully', 'success');
      fetchReports();
    } catch (err) {
      // Local fallback simulation
      setReports(prev => prev.map(r => 
        r.id === id ? { ...r, status: 'resolved' } : r
      ));
      showToast('Report case simulated: resolved', 'success');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 bg-slate-200 dark:bg-slate-900 rounded w-1/4"></div>
        {[1, 2].map(s => <div key={s} className="h-44 bg-slate-200 dark:bg-slate-900 rounded-3xl w-full"></div>)}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Reports Moderator Queue</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Review tenant complaints, resolve listing discrepancies, and penalize spam postings
        </p>
      </div>

      {reports.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-3xl space-y-4">
          <AlertOctagon className="h-12 w-12 text-slate-450 mx-auto" />
          <h3 className="font-extrabold text-lg">No Pending Reports</h3>
          <p className="text-slate-500 dark:text-slate-400 text-xs">The moderation queue is currently clear.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {reports.map((r) => (
            <div
              key={r.id}
              className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-[2rem] p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
              style={{ contentVisibility: 'auto' }}
            >
              
              {/* Ticket description */}
              <div className="space-y-3 flex-grow">
                <div className="flex items-center space-x-2">
                  <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded-full ${
                    r.status === 'resolved'
                      ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                      : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                  }`}>
                    {r.status === 'pending' ? 'Pending Action' : 'Resolved'}
                  </span>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    Complaint Category: <strong className="text-slate-700 dark:text-slate-200">{r.report_type.replace('_', ' ')}</strong>
                  </span>
                </div>

                <div className="space-y-1">
                  <h3 className="font-bold text-sm text-slate-500">
                    Reported Listing: <strong className="text-slate-800 dark:text-white">{r.property_title || 'N/A'}</strong>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
                    Description: {r.description}
                  </p>
                </div>
              </div>

              {/* Profiles & Actions */}
              <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row items-stretch sm:items-center md:items-stretch lg:items-center gap-4 bg-slate-50 dark:bg-slate-950 p-4 border border-slate-100 dark:border-slate-900 rounded-3xl w-full md:w-80 flex-shrink-0">
                
                {/* Party users details */}
                <div className="flex-grow space-y-2 text-xs">
                  <div>
                    <span className="text-[8px] uppercase font-bold text-slate-400">Reporter User</span>
                    <p className="font-bold text-slate-700 dark:text-slate-200 mt-0.5">{r.reporter_name}</p>
                  </div>
                  <div>
                    <span className="text-[8px] uppercase font-bold text-slate-400">Reported Landlord</span>
                    <p className="font-bold text-slate-700 dark:text-slate-200 mt-0.5">{r.reported_user_name || 'N/A'}</p>
                  </div>
                </div>

                <div className="h-px sm:h-12 w-full sm:w-px bg-slate-200 dark:bg-slate-800"></div>

                {/* Moderate Action */}
                <div className="flex sm:flex-col justify-center flex-shrink-0">
                  {r.status === 'pending' ? (
                    <button
                      onClick={() => handleResolveReport(r.id)}
                      className="px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs flex items-center justify-center space-x-1 shadow-md shadow-brand-500/10"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Resolve Case</span>
                    </button>
                  ) : (
                    <span className="text-[10px] text-emerald-500 font-bold flex items-center justify-center space-x-0.5">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Resolved</span>
                    </span>
                  )}
                </div>

              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default AdminReports;
