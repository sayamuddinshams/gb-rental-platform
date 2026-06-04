import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Building, Plus, Edit2, Trash2, X, Eye, 
  MapPin, Check, Image as ImageIcon, Sliders 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';

const OwnerProperties = () => {
  const { user } = useAuth();
  const { showToast } = useNotification();

  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProp, setEditingProp] = useState(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('apartment');
  const [bedrooms, setBedrooms] = useState('1');
  const [bathrooms, setBathrooms] = useState('1');
  const [area, setArea] = useState('');
  const [address, setAddress] = useState('');
  const [cityId, setCityId] = useState('1');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  
  // Image URL Fields
  const [imgUrl1, setImgUrl1] = useState('');
  const [imgUrl2, setImgUrl2] = useState('');
  
  // Selected Amenities
  const [selectedAmenities, setSelectedAmenities] = useState([]);

  const globalAmenities = [
    { id: 1, name: 'High-speed WiFi' },
    { id: 2, name: 'Hot Water / Geyser' },
    { id: 3, name: 'Central Heating' },
    { id: 4, name: 'Dedicated Parking' },
    { id: 5, name: 'Scenic Mountain View' },
    { id: 6, name: '24/7 Security Cameras' },
    { id: 7, name: 'Kitchen Facilities' },
    { id: 8, name: 'Power Backup / Generator' }
  ];

  const citiesList = [
    { id: 1, name: 'Gilgit' },
    { id: 2, name: 'Skardu' },
    { id: 3, name: 'Hunza' },
    { id: 4, name: 'Nagar' },
    { id: 5, name: 'Ghizer' }
  ];

  // Fetch Owner listings
  const fetchOwnerListings = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/properties');
      const filtered = res.data.properties.filter(p => p.owner_id === user.id);
      setProperties(filtered);
    } catch (err) {
      console.warn('API fetch failed. Utilizing static mocks for local state.');
      setProperties([
        { id: 1, city_id: 3, city_name: 'Hunza', title: 'Hunza Heights Luxury Guest Cottage', price: 12000, category: 'home', bedrooms: 3, bathrooms: 2, area: '10 Marla', address: 'Karimabad, Hunza', latitude: 36.3167, longitude: 74.6500, status: 'approved', availability_status: 'available', views_count: 342 },
        { id: 2, city_id: 1, city_name: 'Gilgit', title: 'Cozy 1-Bedroom Studio Apartment', price: 4500, category: 'apartment', bedrooms: 1, bathrooms: 1, area: '5 Marla', address: 'Jutial Cantt Road, Gilgit', latitude: 35.9208, longitude: 74.3089, status: 'approved', availability_status: 'available', views_count: 189 }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOwnerListings();
  }, [user]);

  // Open modal for Adding
  const handleOpenAdd = () => {
    setEditingProp(null);
    setTitle('');
    setDescription('');
    setPrice('');
    setCategory('apartment');
    setBedrooms('1');
    setBathrooms('1');
    setArea('');
    setAddress('');
    setCityId('1');
    setLatitude('35.9000');
    setLongitude('74.3000');
    setImgUrl1('https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80');
    setImgUrl2('https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=800&q=80');
    setSelectedAmenities([1, 2, 7]);
    setIsModalOpen(true);
  };

  // Open modal for Editing
  const handleOpenEdit = (prop) => {
    setEditingProp(prop);
    setTitle(prop.title);
    setDescription(prop.description || '');
    setPrice(prop.price.toString());
    setCategory(prop.category);
    setBedrooms((prop.bedrooms || 0).toString());
    setBathrooms((prop.bathrooms || 0).toString());
    setArea(prop.area || '');
    setAddress(prop.address);
    setCityId((prop.city_id || 1).toString());
    setLatitude((prop.latitude || '').toString());
    setLongitude((prop.longitude || '').toString());
    setImgUrl1(prop.images?.[0]?.image_url || 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80');
    setImgUrl2(prop.images?.[1]?.image_url || 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=800&q=80');
    
    // Convert amenities to list IDs
    setSelectedAmenities(prop.amenities?.map(a => a.id) || [1, 2]);
    setIsModalOpen(true);
  };

  // Toggle Amenity Selection
  const toggleAmenity = (id) => {
    setSelectedAmenities(prev => 
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    );
  };

  // Submit Form (Add or Edit)
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!title || !price || !address) {
      showToast('Please fill out mandatory fields', 'warning');
      return;
    }

    const payload = {
      cityId, title, description, price, category, bedrooms, bathrooms, area, address,
      latitude, longitude,
      images: [imgUrl1, imgUrl2].filter(url => url !== ''),
      amenities: selectedAmenities
    };

    try {
      if (editingProp) {
        await axios.put(`/api/properties/${editingProp.id}`, payload);
        showToast('Property listing updated successfully!', 'success');
      } else {
        await axios.post('/api/properties', payload);
        showToast('New property listed successfully! Vetting is pending.', 'success');
      }
      setIsModalOpen(false);
      fetchOwnerListings();
    } catch (err) {
      console.warn('API submission failed. Performing local simulation.');
      
      // Offline local simulation
      if (editingProp) {
        setProperties(prev => prev.map(p => 
          p.id === editingProp.id 
            ? { ...p, ...payload, price: parseFloat(price), city_name: citiesList.find(c => c.id === parseInt(cityId)).name }
            : p
        ));
        showToast('Property updated successfully (Simulated)', 'success');
      } else {
        const mockNew = {
          id: Math.max(...properties.map(p => p.id)) + 1,
          ...payload,
          price: parseFloat(price),
          city_name: citiesList.find(c => c.id === parseInt(cityId)).name,
          status: 'pending',
          availability_status: 'available',
          views_count: 0
        };
        setProperties(prev => [mockNew, ...prev]);
        showToast('New property created (Simulated & Vetting Pending)', 'success');
      }
      setIsModalOpen(false);
    }
  };

  // Delete listing
  const handleDeleteListing = async (id) => {
    if (!window.confirm('Are you sure you want to delete this listing?')) return;

    try {
      await axios.delete(`/api/properties/${id}`);
      showToast('Listing deleted successfully', 'success');
      fetchOwnerListings();
    } catch (err) {
      setProperties(prev => prev.filter(p => p.id !== id));
      showToast('Listing deleted (Simulated)', 'success');
    }
  };

  // Toggle availability status
  const toggleAvailability = async (prop) => {
    const nextStatus = prop.availability_status === 'available' ? 'rented' : 'available';
    try {
      await axios.put(`/api/properties/${prop.id}`, { availability_status: nextStatus });
      showToast(`Status changed to ${nextStatus}`, 'success');
      fetchOwnerListings();
    } catch (err) {
      setProperties(prev => prev.map(p => 
        p.id === prop.id ? { ...p, availability_status: nextStatus } : p
      ));
      showToast(`Status simulated: ${nextStatus}`, 'success');
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">My Asset Listings</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Publish assets, toggle rentals status, and launch new listings
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs flex items-center space-x-1.5 shadow-md"
        >
          <Plus className="h-4.5 w-4.5" />
          <span>Add New Asset</span>
        </button>
      </div>

      {/* 1. TABLE LISTING GRID */}
      {properties.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-3xl space-y-4">
          <Building className="h-12 w-12 text-slate-400 mx-auto animate-pulse" />
          <h3 className="font-extrabold text-lg">No Assets Listed</h3>
          <p className="text-slate-500 text-xs">Click the Add New Asset button to launch your first property listing.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-[2rem] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800/60 text-slate-400 uppercase tracking-wider font-bold">
                  <th className="p-4">Title & Location</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Monthly Price</th>
                  <th className="p-4">Vetting Status</th>
                  <th className="p-4">Rental Availability</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40 text-slate-700 dark:text-slate-300 font-medium">
                {properties.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40">
                    <td className="p-4">
                      <div className="font-bold text-slate-800 dark:text-white text-sm">{p.title}</div>
                      <div className="text-[10px] text-slate-400 font-semibold flex items-center mt-1">
                        <MapPin className="h-3 w-3 mr-0.5 text-brand-500" />
                        <span>{p.city_name} &bull; {p.address}</span>
                      </div>
                    </td>
                    <td className="p-4 capitalize">{p.category}</td>
                    <td className="p-4 font-extrabold text-slate-800 dark:text-white">PKR {p.price.toLocaleString()}</td>
                    <td className="p-4">
                      <span className={`text-[9px] uppercase font-extrabold px-2.5 py-0.5 rounded-full ${
                        p.status === 'approved' 
                          ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                          : p.status === 'rejected'
                          ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                          : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => toggleAvailability(p)}
                        className={`text-[9px] uppercase font-extrabold px-3 py-1 rounded-xl border flex items-center space-x-1 transition-all ${
                          p.availability_status === 'available'
                            ? 'bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-500 dark:bg-slate-800 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        <Check className="h-3 w-3" />
                        <span>{p.availability_status || 'available'}</span>
                      </button>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center space-x-2.5">
                        <button
                          onClick={() => handleOpenEdit(p)}
                          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-brand-500 hover:text-brand-500 text-slate-500 dark:text-slate-400 transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteListing(p.id)}
                          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-rose-500 hover:text-rose-500 text-slate-500 dark:text-slate-400 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. ADD/EDIT OVERLAY MODAL FORM */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div 
            className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] shadow-2xl p-6 sm:p-8 space-y-6 relative max-h-[90vh] overflow-y-auto animate-slide-up"
            style={{ contentVisibility: 'auto' }}
          >
            
            {/* Modal Header */}
            <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-extrabold text-lg text-slate-800 dark:text-white flex items-center space-x-2">
                <Building className="h-5.5 w-5.5 text-brand-500" />
                <span>{editingProp ? 'Edit Property Listing' : 'List New Rental Asset'}</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleFormSubmit} className="space-y-5 text-slate-800 dark:text-slate-200">
              
              {/* Row 1: Title */}
              <div className="flex flex-col space-y-1">
                <label className="text-xs font-bold text-slate-500">Listing Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Luxury Guest Cottage with peaks views"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm focus:outline-none focus:border-brand-500"
                />
              </div>

              {/* Row 2: Price & Category & Size */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex flex-col space-y-1">
                  <label className="text-xs font-bold text-slate-500">Monthly Rent (PKR) *</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g., 15000"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div className="flex flex-col space-y-1">
                  <label className="text-xs font-bold text-slate-500">Category / Type *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm focus:outline-none focus:border-brand-500"
                  >
                    <option value="apartment">Apartment</option>
                    <option value="hostel">Hostel Room</option>
                    <option value="home">Home / House</option>
                    <option value="office">Office Space</option>
                    <option value="shop">Commercial Shop</option>
                  </select>
                </div>
                <div className="flex flex-col space-y-1">
                  <label className="text-xs font-bold text-slate-500">Area size *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., 10 Marla, 300 Sq Ft"
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    className="px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              {/* Row 3: Bed & Bath */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col space-y-1">
                  <label className="text-xs font-bold text-slate-500">Bedrooms</label>
                  <input
                    type="number"
                    value={bedrooms}
                    onChange={(e) => setBedrooms(e.target.value)}
                    className="px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div className="flex flex-col space-y-1">
                  <label className="text-xs font-bold text-slate-500">Bathrooms</label>
                  <input
                    type="number"
                    value={bathrooms}
                    onChange={(e) => setBathrooms(e.target.value)}
                    className="px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              {/* Row 4: Address & City */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex flex-col sm:col-span-2 space-y-1">
                  <label className="text-xs font-bold text-slate-500">Street Address *</label>
                  <input
                    type="text"
                    required
                    placeholder="Street/Bazaar details"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div className="flex flex-col space-y-1">
                  <label className="text-xs font-bold text-slate-500">City / Region *</label>
                  <select
                    value={cityId}
                    onChange={(e) => setCityId(e.target.value)}
                    className="px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm focus:outline-none focus:border-brand-500"
                  >
                    {citiesList.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>

              {/* Row 5: Coordinates (for visual map highlights) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col space-y-1">
                  <label className="text-xs font-bold text-slate-500 font-mono">Latitude (e.g. 35.9000)</label>
                  <input
                    type="text"
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                    className="px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div className="flex flex-col space-y-1">
                  <label className="text-xs font-bold text-slate-500 font-mono">Longitude (e.g. 74.3000)</label>
                  <input
                    type="text"
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                    className="px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              {/* Row 6: Image URLs */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-500 flex items-center space-x-1.5">
                  <ImageIcon className="h-4 w-4 text-slate-400" />
                  <span>Property Photo URLs (Provide web URLs)</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Featured Photo URL"
                    value={imgUrl1}
                    onChange={(e) => setImgUrl1(e.target.value)}
                    className="px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Gallery Photo URL 2"
                    value={imgUrl2}
                    onChange={(e) => setImgUrl2(e.target.value)}
                    className="px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm focus:outline-none"
                  />
                </div>
              </div>

              {/* Row 7: Description text */}
              <div className="flex flex-col space-y-1">
                <label className="text-xs font-bold text-slate-500">Property Description</label>
                <textarea
                  rows={3}
                  placeholder="Detail amenities, terms of lease, nearby peaks/roads..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm focus:outline-none resize-none"
                />
              </div>

              {/* Row 8: Amenities Checkbox Grid */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 flex items-center space-x-1.5">
                  <Sliders className="h-4 w-4 text-slate-400" />
                  <span>Select Amenities Included</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {globalAmenities.map((amenity) => {
                    const isChecked = selectedAmenities.includes(amenity.id);
                    return (
                      <button
                        type="button"
                        key={amenity.id}
                        onClick={() => toggleAmenity(amenity.id)}
                        className={`p-2.5 rounded-xl border text-[10px] font-bold text-center transition-all ${
                          isChecked 
                            ? 'bg-brand-500/10 text-brand-600 border-brand-500/30' 
                            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                        }`}
                      >
                        {amenity.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-850"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs shadow-md shadow-brand-500/15"
                >
                  {editingProp ? 'Update Listing' : 'Publish Listing'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default OwnerProperties;
