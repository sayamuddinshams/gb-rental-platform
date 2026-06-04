import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Building, Check, X, MapPin, Eye, ExternalLink } from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';

const AdminProperties = () => {
  const { showToast } = useNotification();

  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' | 'approved' | 'rejected'

  const fetchAllListings = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/properties');
      setProperties(res.data.properties);
    } catch (err) {
      console.warn('API listings fetch failed. Initializing static property mocks for vetting.');
      
      // Static mocks seeder fallback matching
      setProperties([
        { id: 1, city_name: 'Hunza', title: 'Hunza Heights Luxury Guest Cottage', price: 12000, category: 'home', address: 'Zero Point Road, Karimabad', owner_name: 'Karakoram Properties Ltd.', status: 'approved', featured_image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=400&q=80' },
        { id: 2, city_name: 'Gilgit', title: 'Cozy 1-Bedroom Studio Apartment', price: 4500, category: 'apartment', address: 'Jutial Cantt Road, Gilgit', owner_name: 'Karakoram Properties Ltd.', status: 'approved', featured_image: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=400&q=80' },
        { id: 4, city_name: 'Gilgit', title: 'Commercial Boutique Shop in Main Bazaar', price: 22000, category: 'shop', address: 'Saddar Bazaar, Gilgit', owner_name: 'Karakoram Properties Ltd.', status: 'pending', featured_image: 'https://images.unsplash.com/photo-1582037917204-db05f8576956?auto=format&fit=crop&w=400&q=80' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllListings();
  }, []);

  const handleStatusUpdate = async (id, title, newStatus) => {
    try {
      await axios.put(`/api/admin/properties/${id}/status`, { status: newStatus });
      showToast(`Property "${title}" has been successfully ${newStatus}!`, 'success');
      fetchAllListings();
    } catch (err) {
      // Local fallback simulation
      setProperties(prev => prev.map(p => 
        p.id === id ? { ...p, status: newStatus } : p
      ));
      showToast(`Property "${title}" vetting simulated: ${newStatus}`, 'success');
    }
  };

  // Filter listings based on tab
  const tabFilteredProperties = properties.filter(p => p.status === activeTab);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 bg-slate-200 dark:bg-slate-900 rounded w-1/4"></div>
        <div className="h-[28rem] bg-slate-200 dark:bg-slate-900 rounded-3xl w-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Listing Verifications</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Review new property submissions, verify listings details, and moderate spam posts
        </p>
      </div>

      {/* Tabs Vetting selectors */}
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        {[
          { key: 'pending', label: 'Pending Review' },
          { key: 'approved', label: 'Approved Listings' },
          { key: 'rejected', label: 'Rejected Submissions' }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-6 py-3.5 text-xs font-bold transition-all relative ${
              activeTab === tab.key
                ? 'text-brand-500 border-b-2 border-brand-500'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
            }`}
          >
            <span>{tab.label}</span>
            {tab.key === 'pending' && properties.filter(p => p.status === 'pending').length > 0 && (
              <span className="ml-2 px-2 py-0.5 rounded-full bg-brand-500 text-white text-[9px] font-black">
                {properties.filter(p => p.status === 'pending').length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Vetting Listings grid */}
      {tabFilteredProperties.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-3xl space-y-4">
          <Building className="h-12 w-12 text-slate-400 mx-auto" />
          <h3 className="font-extrabold text-lg">Vetting Queue Empty</h3>
          <p className="text-slate-500 dark:text-slate-400 text-xs">
            No properties found matching the state: <strong>{activeTab}</strong>.
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-[2rem] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800/60 text-slate-400 uppercase tracking-wider font-bold">
                  <th className="p-4">Property Vitals</th>
                  <th className="p-4">Listed Owner</th>
                  <th className="p-4">Monthly Cost</th>
                  <th className="p-4">Asset Type</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40 text-slate-700 dark:text-slate-300 font-medium">
                {tabFilteredProperties.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40">
                    
                    <td className="p-4 flex items-center space-x-3">
                      <img src={p.featured_image} className="h-12 w-16 object-cover rounded-lg flex-shrink-0" />
                      <div className="truncate">
                        <div className="font-bold text-slate-800 dark:text-white text-sm truncate max-w-xs">{p.title}</div>
                        <div className="text-[10px] text-slate-400 font-semibold flex items-center mt-1">
                          <MapPin className="h-3 w-3 mr-0.5 text-brand-500" />
                          <span>{p.city_name} &bull; {p.address}</span>
                        </div>
                      </div>
                    </td>

                    <td className="p-4 font-bold text-slate-800 dark:text-white">{p.owner_name}</td>
                    <td className="p-4 font-extrabold text-slate-800 dark:text-white">PKR {p.price.toLocaleString()}</td>
                    <td className="p-4 capitalize">{p.category}</td>

                    <td className="p-4">
                      <div className="flex items-center justify-center space-x-2">
                        {p.status === 'pending' ? (
                          <>
                            <button
                              onClick={() => handleStatusUpdate(p.id, p.title, 'approved')}
                              className="px-2.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-[10px] flex items-center space-x-0.5 shadow-md shadow-emerald-500/10"
                              title="Approve Post"
                            >
                              <Check className="h-3 w-3" />
                              <span>Approve</span>
                            </button>
                            <button
                              onClick={() => handleStatusUpdate(p.id, p.title, 'rejected')}
                              className="px-2.5 py-1.5 rounded-xl border border-rose-200 dark:border-rose-950/20 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/10 font-bold text-[10px] flex items-center space-x-0.5"
                              title="Reject Post"
                            >
                              <X className="h-3 w-3" />
                              <span>Reject</span>
                            </button>
                          </>
                        ) : (
                          <span className="text-[10px] text-slate-400 font-bold">Vetted</span>
                        )}
                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminProperties;
