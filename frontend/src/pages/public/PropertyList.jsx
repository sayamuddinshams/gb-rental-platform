import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import { 
  Filter, MapPin, Compass, Search, RotateCcw, 
  Map as MapIcon, SlidersHorizontal, Eye, EyeOff
} from 'lucide-react';

const PropertyList = () => {
  const location = useLocation();
  
  // Extract query parameters from URL
  const queryParams = new URLSearchParams(location.search);
  const initialCity = queryParams.get('city') || '';
  const initialCategory = queryParams.get('category') || '';
  const initialMaxPrice = queryParams.get('maxPrice') || '';
  const initialBedrooms = queryParams.get('bedrooms') || '';

  // Filter States
  const [search, setSearch] = useState('');
  const [city, setCity] = useState(initialCity);
  const [category, setCategory] = useState(initialCategory);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState(initialMaxPrice);
  const [bedrooms, setBedrooms] = useState(initialBedrooms);
  const [sort, setSort] = useState('newest');

  // Listings data
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredPropId, setHoveredPropId] = useState(null);
  const [showMap, setShowMap] = useState(true);

  // Fetch cities list
  const [citiesList, setCitiesList] = useState(['Gilgit', 'Skardu', 'Hunza', 'Nagar', 'Ghizer', 'Islamabad', 'Lahore', 'Karachi']);

  const resetFilters = () => {
    setSearch('');
    setCity('');
    setCategory('');
    setMinPrice('');
    setMaxPrice('');
    setBedrooms('');
    setSort('newest');
  };

  useEffect(() => {
    const fetchListings = async () => {
      setLoading(true);
      try {
        const params = {};
        if (search) params.search = search;
        if (city) params.city = city;
        if (category) params.category = category;
        if (minPrice) params.minPrice = minPrice;
        if (maxPrice) params.maxPrice = maxPrice;
        if (bedrooms) params.bedrooms = bedrooms;
        if (sort) params.sort = sort;

        const res = await axios.get('/api/properties', { params });
        setProperties(res.data.properties);
      } catch (err) {
        console.warn('API listings query failed. Using static mocks with local JavaScript filtering.', err.message);
        
        // Static Mocks for offline testing
        const staticListings = [
          { id: 1, owner_id: 2, city_name: 'Hunza', title: 'Hunza Heights Luxury Guest Cottage', price: 12000, category: 'home', bedrooms: 3, address: 'Zero Point Road, Karimabad', latitude: 36.3167, longitude: 74.6500, status: 'approved', views_count: 342, featured_image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=600&q=80' },
          { id: 2, owner_id: 2, city_name: 'Gilgit', title: 'Cozy 1-Bedroom Studio Apartment', price: 4500, category: 'apartment', bedrooms: 1, address: 'Jutial Cantt Road, Gilgit', latitude: 35.9208, longitude: 74.3089, status: 'approved', views_count: 189, featured_image: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=600&q=80' },
          { id: 3, owner_id: 2, city_name: 'Skardu', title: 'Karakoram Boys & Girls Student Hostel Room', price: 2500, category: 'hostel', bedrooms: 2, address: 'College Road, Skardu', latitude: 35.2981, longitude: 75.6333, status: 'approved', views_count: 98, featured_image: 'https://images.unsplash.com/photo-15554877-bab0e564b8d5?auto=format&fit=crop&w=600&q=80' },
          { id: 4, owner_id: 2, city_name: 'Gilgit', title: 'Commercial Boutique Shop in Main Bazaar', price: 22000, category: 'shop', bedrooms: 0, address: 'Saddar Bazaar, Gilgit', latitude: 35.9189, longitude: 74.3210, status: 'approved', views_count: 45, featured_image: 'https://images.unsplash.com/photo-1582037917204-db05f8576956?auto=format&fit=crop&w=600&q=80' },
          { id: 5, owner_id: 2, city_name: 'Skardu', title: 'Premium Multi-Desk Office Space', price: 35000, category: 'office', bedrooms: 0, address: 'Hussaini Chowk, Skardu', latitude: 35.3020, longitude: 75.6410, status: 'approved', views_count: 76, featured_image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=600&q=80' }
        ];

        // Apply filters in JavaScript
        let list = [...staticListings];
        if (city) list = list.filter(item => item.city_name.toLowerCase() === city.toLowerCase());
        if (category) list = list.filter(item => item.category === category);
        if (minPrice) list = list.filter(item => item.price >= parseFloat(minPrice));
        if (maxPrice) list = list.filter(item => item.price <= parseFloat(maxPrice));
        if (bedrooms) list = list.filter(item => item.bedrooms === parseInt(bedrooms, 10));
        if (search) {
          const lSearch = search.toLowerCase();
          list = list.filter(item => item.title.toLowerCase().includes(lSearch) || item.address.toLowerCase().includes(lSearch));
        }
        
        if (sort === 'price_asc') list.sort((a, b) => a.price - b.price);
        else if (sort === 'price_desc') list.sort((a, b) => b.price - a.price);
        else list.sort((a, b) => b.id - a.id);

        setProperties(list);
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, [search, city, category, minPrice, maxPrice, bedrooms, sort]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col space-y-6">
      
      {/* Search Header Options */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200/60 dark:border-slate-800/50 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Explore Rental Listings</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Showing {properties.length} broker-free rental opportunities in Gilgit-Baltistan
          </p>
        </div>
        <div className="flex items-center space-x-3 w-full md:w-auto">
          {/* Toggle Map Panel */}
          <button
            onClick={() => setShowMap(!showMap)}
            className="flex items-center space-x-1.5 px-4 py-2 text-sm font-semibold border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors w-full sm:w-auto justify-center"
          >
            <MapIcon className="h-4 w-4 text-brand-500" />
            <span>{showMap ? 'Hide Map' : 'Show Map'}</span>
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        
        {/* LEFT COLUMN: FILTERS (1/4 Width) */}
        <aside className="w-full lg:w-1/4 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-3xl p-6 space-y-6 flex-shrink-0 sticky top-24">
          <div className="flex items-center justify-between">
            <h2 className="font-extrabold text-md flex items-center space-x-2">
              <SlidersHorizontal className="h-4 w-4 text-brand-500" />
              <span>Filters</span>
            </h2>
            <button 
              onClick={resetFilters}
              className="text-xs font-bold text-slate-400 hover:text-brand-500 flex items-center space-x-1 transition-colors"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Reset All</span>
            </button>
          </div>

          <hr className="border-slate-100 dark:border-slate-800" />

          {/* Search bar */}
          <div className="flex flex-col space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Search Keyword</label>
            <div className="relative">
              <Search className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="e.g., Cottage, Jutial"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-3 border border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50 dark:bg-slate-950 text-sm focus:outline-none focus:border-brand-500 transition-colors"
              />
            </div>
          </div>

          {/* City Selection */}
          <div className="flex flex-col space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Region / City</label>
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50 dark:bg-slate-950 text-sm focus:outline-none focus:border-brand-500 transition-colors cursor-pointer"
            >
              <option value="">All Regions</option>
              {citiesList.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Category Selector */}
          <div className="flex flex-col space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Property Type</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50 dark:bg-slate-950 text-sm focus:outline-none focus:border-brand-500 transition-colors cursor-pointer"
            >
              <option value="">All Categories</option>
              <option value="hostel">Hostel Room</option>
              <option value="apartment">Apartment</option>
              <option value="home">Home / House</option>
              <option value="office">Office Space</option>
              <option value="shop">Commercial Shop</option>
            </select>
          </div>

          {/* Price Range */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Monthly Budget (PKR)</label>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="number"
                placeholder="Min"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50 dark:bg-slate-950 text-sm focus:outline-none focus:border-brand-500 transition-colors"
              />
              <input
                type="number"
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50 dark:bg-slate-950 text-sm focus:outline-none focus:border-brand-500 transition-colors"
              />
            </div>
          </div>

          {/* Bedrooms Selection */}
          <div className="flex flex-col space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Bedrooms count</label>
            <select
              value={bedrooms}
              onChange={(e) => setBedrooms(e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50 dark:bg-slate-950 text-sm focus:outline-none focus:border-brand-500 transition-colors cursor-pointer"
            >
              <option value="">Any</option>
              <option value="1">1 Bedroom</option>
              <option value="2">2 Bedrooms</option>
              <option value="3">3+ Bedrooms</option>
            </select>
          </div>

          {/* Sort Selection */}
          <div className="flex flex-col space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Sort Listings By</label>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50 dark:bg-slate-950 text-sm focus:outline-none focus:border-brand-500 transition-colors cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="popular">Popularity / Views</option>
            </select>
          </div>

        </aside>

        {/* MIDDLE COLUMN: PROPERTY LISTINGS GRID */}
        <section className={`w-full transition-all ${showMap ? 'lg:w-1/2' : 'lg:w-3/4'}`}>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[1, 2, 4, 5].map((s) => (
                <div key={s} className="h-[26rem] bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-3xl overflow-hidden shadow-sm animate-pulse space-y-4">
                  <div className="h-60 bg-slate-200 dark:bg-slate-800 w-full"></div>
                  <div className="p-6 space-y-3">
                    <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/4"></div>
                    <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-3/4"></div>
                    <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/2 mt-6"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : properties.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-3xl shadow-sm space-y-4 min-h-[300px]">
              <div className="h-16 w-16 bg-brand-500/10 rounded-2xl flex items-center justify-center text-brand-500">
                <Compass className="h-8 w-8 animate-spin-slow" />
              </div>
              <h3 className="font-extrabold text-xl">No Properties Found</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm">
                We couldn't find any listings matching your active filters. Try adjusting your price ranges or select another region.
              </p>
              <button
                onClick={resetFilters}
                className="px-6 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm transition-colors"
              >
                Clear Search filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {properties.map((p) => (
                <Link
                  key={p.id}
                  to={`/properties/${p.id}`}
                  onMouseEnter={() => setHoveredPropId(p.id)}
                  onMouseLeave={() => setHoveredPropId(null)}
                  className={`group flex flex-col bg-white dark:bg-slate-900 border rounded-3xl overflow-hidden shadow-sm hover:shadow-lg transition-all ${
                    hoveredPropId === p.id 
                      ? 'border-brand-500 shadow-brand-500/5' 
                      : 'border-slate-200/50 dark:border-slate-800/50'
                  }`}
                  style={{ contentVisibility: 'auto' }}
                >
                  <div className="h-56 relative overflow-hidden">
                    <img
                      src={p.featured_image || p.image_url || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=600&q=80'}
                      alt={p.title}
                      className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                    />
                    <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-slate-900/60 text-white backdrop-blur-sm text-[10px] font-bold uppercase tracking-wider">
                      {p.category}
                    </span>
                    <span className="absolute bottom-4 right-4 px-3 py-1 rounded-xl bg-brand-500 text-white font-bold text-sm shadow-md">
                      PKR {p.price.toLocaleString()} / mo
                    </span>
                  </div>
                  <div className="p-6 space-y-4 flex-grow flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-1 text-slate-500 dark:text-slate-400 text-xs font-semibold">
                        <MapPin className="h-3.5 w-3.5 text-brand-500" />
                        <span className="truncate">{p.city_name} &bull; {p.address}</span>
                      </div>
                      <h3 className="font-bold text-md text-slate-800 dark:text-white leading-snug group-hover:text-brand-500 transition-colors line-clamp-2">
                        {p.title}
                      </h3>
                    </div>
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800/50 pt-4 mt-2">
                      <span>{p.bedrooms ? `${p.bedrooms} Beds` : 'Commercial'} &bull; {p.area || 'N/A'}</span>
                      <span className="flex items-center space-x-1">
                        <Eye className="h-4 w-4 text-slate-400" />
                        <span>{p.views_count || 0} views</span>
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* RIGHT COLUMN: PREMIUM INTERACTIVE VISUAL MOCK MAP (1/4 Width) */}
        {showMap && (
          <aside className="hidden lg:block w-1/4 h-[550px] bg-slate-200 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-3xl sticky top-24 overflow-hidden shadow-inner flex-shrink-0">
            {/* Visual Custom Map Background */}
            <div className="absolute inset-0 z-0 bg-slate-100 dark:bg-slate-950 flex flex-col justify-between p-4">
              
              {/* Map grid lines */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#cbd5e1_1px,transparent_1px),linear-gradient(to_bottom,#cbd5e1_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-30"></div>
              
              {/* Top map info */}
              <div className="relative z-10 flex items-center space-x-1 bg-white/90 dark:bg-slate-900/90 backdrop-blur px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm w-max">
                <Compass className="h-4 w-4 text-brand-500 animate-spin-slow" />
                <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  GB Visual Coordinates
                </span>
              </div>

              {/* Central Map Illustration representing GB Valley Peaks */}
              <div className="relative flex-grow flex items-center justify-center">
                <svg className="w-full h-full max-h-60 opacity-10 dark:opacity-5 text-slate-900 dark:text-white" viewBox="0 0 200 100">
                  <path d="M20 90 L60 30 L90 70 L140 10 L180 90 Z" fill="none" stroke="currentColor" strokeWidth="2" />
                  <circle cx="60" cy="30" r="3" fill="currentColor" />
                  <circle cx="140" cy="10" r="3" fill="currentColor" />
                </svg>

                {/* Plot Properties coordinate markers */}
                {properties.map((p) => {
                  // Normalize coordinates to percentage placements on map
                  // Hunza, Gilgit, Skardu bounds
                  let left = '50%';
                  let top = '50%';

                  if (p.city_name.toLowerCase() === 'gilgit') {
                    left = '45%'; top = '35%';
                  } else if (p.city_name.toLowerCase() === 'hunza') {
                    left = '52%'; top = '15%';
                  } else if (p.city_name.toLowerCase() === 'skardu') {
                    left = '75%'; top = '65%';
                  } else {
                    // Random dispersion for other cities
                    const hash = p.id * 17;
                    left = `${20 + (hash % 60)}%`;
                    top = `${30 + (hash % 50)}%`;
                  }

                  const isActive = hoveredPropId === p.id;

                  return (
                    <Link
                      key={p.id}
                      to={`/properties/${p.id}`}
                      className="absolute z-20 transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-200"
                      style={{ left, top }}
                    >
                      <div className="relative group/marker">
                        {/* Pulse Ring */}
                        <div className={`absolute -inset-2.5 rounded-full bg-brand-500/30 opacity-75 animate-ping ${isActive ? 'block' : 'hidden group-hover/marker:block'}`}></div>
                        
                        {/* Marker Pin */}
                        <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-[10px] font-bold border shadow-md transition-all ${
                          isActive 
                            ? 'bg-brand-500 text-white border-brand-400 scale-110 z-30' 
                            : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 border-slate-200 dark:border-slate-800'
                        }`}>
                          <MapPin className={`h-3 w-3 ${isActive ? 'text-white' : 'text-brand-500'}`} />
                          <span>PKR {Math.round(p.price / 1000)}k</span>
                        </div>

                        {/* Tooltip Card */}
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 shadow-xl hidden group-hover/marker:block pointer-events-none z-50">
                          <img src={p.featured_image} className="h-20 w-full object-cover rounded-lg mb-2" />
                          <h4 className="text-[10px] font-bold leading-tight truncate">{p.title}</h4>
                          <span className="text-[9px] text-brand-500 font-extrabold">PKR {p.price.toLocaleString()}</span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>

              {/* Bottom map overlay */}
              <div className="relative z-10 text-[9px] text-center text-slate-400 dark:text-slate-600 font-bold uppercase tracking-wider">
                Simulated Interactive GPS Mapping
              </div>

            </div>
          </aside>
        )}

      </div>
    </div>
  );
};

export default PropertyList;
