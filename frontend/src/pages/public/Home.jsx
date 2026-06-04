import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { 
  Search, ShieldCheck, MapPin, Sparkles, Calendar, ChevronRight, 
  HelpCircle, MessageSquare, Compass, Eye, Mail, Phone, Users, Home as HomeIcon
} from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';

const Home = () => {
  const navigate = useNavigate();
  const { showToast } = useNotification();
  
  // Search state
  const [city, setCity] = useState('');
  const [category, setCategory] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [bedrooms, setBedrooms] = useState('');
  
  const [featuredProps, setFeaturedProps] = useState([]);
  const [loading, setLoading] = useState(true);

  // Statistics
  const stats = [
    { count: '1,200+', label: 'Happy Tenants', icon: Users },
    { count: '350+', label: 'Active Listings', icon: HomeIcon },
    { count: '2,500+', label: 'Scheduled Visits', icon: Calendar },
    { count: '9', label: 'GB Regions', icon: Compass }
  ];

  // FAQ Accordion State
  const [activeFaq, setActiveFaq] = useState(null);

  const faqs = [
    { q: 'Is there a broker commission or agent fee on RentGB?', a: 'No, RentGB is entirely broker-free. We connect tenants directly with property owners, meaning there are no hidden agent commissions or brokerage fees.' },
    { q: 'How can I schedule a property visit?', a: 'Once you log in as a Tenant and find a listing you like, click the "Schedule Visit" button on the detail page, select a preferred date and time, and submit. The owner will receive your request and approve or coordinate another time.' },
    { q: 'Can students find hostels on RentGB?', a: 'Yes! RentGB features a dedicated "Hostel" category, making it extremely easy for students studying at the University of Baltistan, Karakoram International University, and other colleges to find budget-friendly rooms.' },
    { q: 'How do property owners get verified?', a: 'Property owners must register and submit their business details or identity proofs. Administrators review these profiles manually and add a "Verified Owner" badge once approved.' },
    { q: 'Is RentGB only for Gilgit-Baltistan?', a: 'While our core focus and initial launch is Gilgit-Baltistan (Gilgit, Skardu, Hunza, Ghizer, Nagar, etc.), we also support property listings in major student/professional hubs like Islamabad, Lahore, and Karachi to help individuals relocating from or to GB.' }
  ];

  // Contact Form State
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });

  const handleContactSubmit = (e) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.email || !contactForm.message) {
      showToast('Please fill out all contact fields', 'warning');
      return;
    }
    showToast('Thank you for contacting RentGB! We will get back to you shortly.', 'success');
    setContactForm({ name: '', email: '', message: '' });
  };

  // Fetch Featured Listings
  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await axios.get('/api/properties?limit=3');
        setFeaturedProps(res.data.properties);
      } catch (err) {
        console.warn('API fetch failed. Utilizing fallback static mock properties for home view.', err.message);
        
        // Static Fallbacks matching seeder data
        setFeaturedProps([
          {
            id: 1,
            title: 'Hunza Heights Luxury Guest Cottage',
            price: 12000,
            category: 'home',
            bedrooms: 3,
            city_name: 'Hunza',
            address: 'Karimabad, Hunza',
            featured_image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80',
            views_count: 342
          },
          {
            id: 2,
            title: 'Cozy 1-Bedroom Studio Apartment',
            price: 4500,
            category: 'apartment',
            bedrooms: 1,
            city_name: 'Gilgit',
            address: 'Jutial Cantt Road, Gilgit',
            featured_image: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80',
            views_count: 189
          },
          {
            id: 3,
            title: 'Karakoram Student Hostel Room',
            price: 2500,
            category: 'hostel',
            bedrooms: 2,
            city_name: 'Skardu',
            address: 'College Road, Skardu',
            featured_image: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80',
            views_count: 98
          }
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (city) params.append('city', city);
    if (category) params.append('category', category);
    if (maxPrice) params.append('maxPrice', maxPrice);
    if (bedrooms) params.append('bedrooms', bedrooms);

    navigate(`/properties?${params.toString()}`);
  };

  return (
    <div className="flex flex-col space-y-20 pb-16">
      
      {/* 1. HERO SECTION WITH IMAGE & SEARCH BAR */}
      <section className="relative h-[650px] w-full flex items-center justify-center overflow-hidden">
        {/* Background Visual */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1589308078059-be1415eab4c3?auto=format&fit=crop&w=1920&q=80" 
            alt="Gilgit-Baltistan Mountain Valleys" 
            className="w-full h-full object-cover brightness-[0.4]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-50 via-transparent to-slate-950/20 dark:from-slate-950"></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 text-center space-y-8 animate-fade-in">
          <div className="space-y-4">
            <span className="inline-flex items-center space-x-1.5 px-4 py-1.5 rounded-full bg-brand-500/10 border border-brand-400/20 text-xs font-semibold text-brand-300 backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Direct Rentals - 100% Broker Free</span>
            </span>
            <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-none">
              Find Your Nest in <br />
              <span className="bg-gradient-to-r from-brand-300 to-accent-blue bg-clip-text text-transparent">
                Gilgit-Baltistan
              </span>
            </h1>
            <p className="text-md sm:text-xl text-slate-200 max-w-2xl mx-auto font-medium">
              Direct connection between students, families, tourists, and local owners. No brokers, no agent fees, just premium listings.
            </p>
          </div>

          {/* Advanced Search Form Bar with Glassmorphism */}
          <form 
            onSubmit={handleSearchSubmit}
            className="w-full max-w-4xl mx-auto p-4 sm:p-6 bg-white/10 dark:bg-slate-900/40 border border-white/20 dark:border-slate-800/60 backdrop-blur-md rounded-[2.5rem] shadow-2xl flex flex-col md:flex-row gap-4 items-center justify-between"
          >
            {/* City Filter */}
            <div className="flex flex-col items-start w-full md:w-1/4 px-4 py-2 border-b md:border-b-0 md:border-r border-white/10">
              <label className="text-[10px] uppercase font-bold tracking-wider text-slate-300 flex items-center space-x-1">
                <MapPin className="h-3 w-3" />
                <span>Region/City</span>
              </label>
              <select 
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="bg-transparent border-0 outline-none w-full text-white text-sm font-semibold mt-1 focus:ring-0 cursor-pointer"
              >
                <option value="" className="text-slate-900">All Cities</option>
                <option value="Gilgit" className="text-slate-900">Gilgit</option>
                <option value="Skardu" className="text-slate-900">Skardu</option>
                <option value="Hunza" className="text-slate-900">Hunza</option>
                <option value="Nagar" className="text-slate-900">Nagar</option>
                <option value="Ghizer" className="text-slate-900">Ghizer</option>
                <option value="Islamabad" className="text-slate-900">Islamabad</option>
                <option value="Lahore" className="text-slate-900">Lahore</option>
                <option value="Karachi" className="text-slate-900">Karachi</option>
              </select>
            </div>

            {/* Property Type Filter */}
            <div className="flex flex-col items-start w-full md:w-1/4 px-4 py-2 border-b md:border-b-0 md:border-r border-white/10">
              <label className="text-[10px] uppercase font-bold tracking-wider text-slate-300">Property Type</label>
              <select 
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="bg-transparent border-0 outline-none w-full text-white text-sm font-semibold mt-1 focus:ring-0 cursor-pointer"
              >
                <option value="" className="text-slate-900">All Types</option>
                <option value="hostel" className="text-slate-900">Hostel Room</option>
                <option value="apartment" className="text-slate-900">Apartment</option>
                <option value="home" className="text-slate-900">Home/House</option>
                <option value="office" className="text-slate-900">Office Space</option>
                <option value="shop" className="text-slate-900">Boutique Shop</option>
              </select>
            </div>

            {/* Price Filter */}
            <div className="flex flex-col items-start w-full md:w-1/5 px-4 py-2 border-b md:border-b-0 md:border-r border-white/10">
              <label className="text-[10px] uppercase font-bold tracking-wider text-slate-300">Max Price (PKR)</label>
              <input 
                type="number"
                placeholder="Unlimited"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="bg-transparent border-0 outline-none w-full text-white text-sm font-semibold mt-1 focus:ring-0 placeholder-white/50"
              />
            </div>

            {/* Bedrooms Filter */}
            <div className="flex flex-col items-start w-full md:w-1/6 px-4 py-2">
              <label className="text-[10px] uppercase font-bold tracking-wider text-slate-300">Bedrooms</label>
              <select 
                value={bedrooms}
                onChange={(e) => setBedrooms(e.target.value)}
                className="bg-transparent border-0 outline-none w-full text-white text-sm font-semibold mt-1 focus:ring-0 cursor-pointer"
              >
                <option value="" className="text-slate-900">Any</option>
                <option value="1" className="text-slate-900">1 Bed</option>
                <option value="2" className="text-slate-900">2 Beds</option>
                <option value="3" className="text-slate-900">3+ Beds</option>
              </select>
            </div>

            {/* Search Button */}
            <button 
              type="submit"
              className="w-full md:w-auto px-6 py-4 rounded-[1.8rem] bg-gradient-to-r from-brand-600 to-accent-blue hover:from-brand-700 hover:to-accent-blue/90 text-white font-semibold flex items-center justify-center space-x-2 transition-all shadow-lg"
            >
              <Search className="h-5 w-5" />
              <span className="md:hidden">Find Rentals</span>
            </button>

          </form>
        </div>
      </section>

      {/* 2. STATS BAR OVERVIEW */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full -mt-24 relative z-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-8 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200/50 dark:border-slate-800/50 shadow-xl">
          {stats.map((stat, i) => {
            const IconComponent = stat.icon;
            return (
              <div key={i} className="flex flex-col items-center text-center space-y-1">
                <div className="p-3 bg-brand-500/10 rounded-2xl text-brand-500 mb-1">
                  <IconComponent className="h-6 w-6" />
                </div>
                <h3 className="text-2xl font-extrabold text-slate-800 dark:text-white leading-none">{stat.count}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">{stat.label}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. POPULAR LOCATIONS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="space-y-2 mb-10">
          <h2 className="text-3xl font-extrabold tracking-tight">Explore Popular Locations</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm max-w-xl">
            Browse verified listings in different tourist hubs, administrative headquarters, and central regions.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          {[
            { name: 'Hunza', label: 'Hunza Valley', img: 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?auto=format&fit=crop&w=400&q=80', count: '120+ Listings' },
            { name: 'Skardu', label: 'Skardu District', img: 'https://images.unsplash.com/photo-1627063410772-2f3b9000dfb3?auto=format&fit=crop&w=400&q=80', count: '94+ Listings' },
            { name: 'Gilgit', label: 'Gilgit City', img: 'https://images.unsplash.com/photo-1589308078059-be1415eab4c3?auto=format&fit=crop&w=400&q=80', count: '87+ Listings' },
            { name: 'Islamabad', label: 'Islamabad (for GBians)', img: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=400&q=80', count: '45+ Listings' }
          ].map((loc) => (
            <Link 
              key={loc.name}
              to={`/properties?city=${loc.name}`}
              className="group relative h-60 rounded-3xl overflow-hidden shadow-lg border border-slate-200/50 dark:border-slate-800/50 transform hover:-translate-y-1 transition-all"
            >
              <img 
                src={loc.img} 
                alt={loc.label} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80"></div>
              <div className="absolute bottom-4 left-4 text-white">
                <h4 className="font-extrabold text-lg leading-tight">{loc.label}</h4>
                <p className="text-[10px] text-brand-200 font-semibold">{loc.count}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. FEATURED PROPERTIES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-10">
          <div className="space-y-2">
            <h2 className="text-3xl font-extrabold tracking-tight">Featured Properties</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm max-w-xl">
              Handpicked premium properties vetted for pricing accuracy, safety, and amenities.
            </p>
          </div>
          <Link 
            to="/properties" 
            className="flex items-center space-x-1.5 font-bold text-sm text-brand-600 dark:text-brand-400 hover:text-brand-700 hover:underline"
          >
            <span>View All Properties</span>
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((s) => (
              <div key={s} className="h-96 w-full bg-slate-200 dark:bg-slate-900 rounded-3xl animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredProps.map((p) => (
              <Link 
                key={p.id}
                to={`/properties/${p.id}`}
                className="group flex flex-col bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-3xl overflow-hidden shadow-md hover:shadow-xl transition-all"
              >
                <div className="h-60 relative overflow-hidden">
                  <img 
                    src={p.featured_image || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=600&q=80'} 
                    alt={p.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-slate-900/60 text-white backdrop-blur-sm text-[10px] font-bold uppercase tracking-wider">
                    {p.category}
                  </span>
                  <span className="absolute bottom-4 right-4 px-3 py-1 rounded-xl bg-brand-500 text-white font-bold text-sm">
                    PKR {p.price.toLocaleString()} / mo
                  </span>
                </div>
                <div className="p-6 space-y-4 flex-grow flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-1 text-slate-500 dark:text-slate-400 text-xs">
                      <MapPin className="h-3.5 w-3.5 text-brand-500" />
                      <span className="font-semibold">{p.city_name} &bull; {p.address}</span>
                    </div>
                    <h3 className="font-bold text-lg text-slate-800 dark:text-white leading-tight group-hover:text-brand-500 transition-colors">
                      {p.title}
                    </h3>
                  </div>
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800/50 pt-4">
                    <span>{p.bedrooms ? `${p.bedrooms} Bedrooms` : 'Commercial'}</span>
                    <span className="flex items-center space-x-1">
                      <Eye className="h-4 w-4" />
                      <span>{p.views_count || 0} views</span>
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* 5. HOW IT WORKS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center space-y-2 mb-16">
          <h2 className="text-3xl font-extrabold tracking-tight">How RentGB Works</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm max-w-xl mx-auto">
            Our portal simplifies rentals down to three intuitive steps for both tenants and landlords.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { title: '1. Register & Select Role', text: 'Create an account and choose whether you are a Tenant seeking a place or an Owner/Agent listing properties.', icon: ShieldCheck },
            { title: '2. Search & Apply Filters', text: 'Browse properties with advanced filters like City, Price, and Type. Request visits directly through our built-in scheduler.', icon: Search },
            { title: '3. Schedule & Move In', text: 'Coordinate visits with owners, chat using our real-time messenger UI, sign contracts directly, and move in broker-free!', icon: Calendar }
          ].map((step, i) => {
            const Icon = step.icon;
            return (
              <div key={i} className="flex flex-col items-center text-center p-8 bg-slate-100 dark:bg-slate-900 rounded-3xl border border-slate-200/50 dark:border-slate-800/50 space-y-4">
                <div className="h-14 w-14 rounded-2xl bg-brand-500 flex items-center justify-center text-white shadow-lg shadow-brand-500/20">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="font-extrabold text-lg text-slate-800 dark:text-white">{step.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{step.text}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 6. WHY CHOOSE US */}
      <section className="bg-gradient-to-r from-brand-600 to-accent-blue text-white py-16 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              A Rental Portal Designed Specifically For Local Community Needs
            </h2>
            <p className="text-slate-100 leading-relaxed text-sm sm:text-base">
              Renting in Gilgit-Baltistan has traditionally relied on verbal references and high broker commissions. RentGB replaces this system with an online directory providing high transparency, verified owner profiles, and direct landlord contact.
            </p>
            <div className="space-y-3">
              {[
                'Vetted lists tailored for students, families, and businesses',
                'Completely broker-free transactions with direct communications',
                'Interactive dashboard tracking your inquiries, tours, and visits',
                'Clean, responsive mobile layouts optimized for local networks'
              ].map((point, index) => (
                <div key={index} className="flex items-center space-x-3 text-sm font-semibold">
                  <ShieldCheck className="h-5 w-5 text-emerald-300 flex-shrink-0" />
                  <span>{point}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="relative h-96 rounded-3xl overflow-hidden shadow-2xl border border-white/10">
            <img 
              src="https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=800&q=80" 
              alt="Mountain side properties" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* 7. TESTIMONIALS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center space-y-2 mb-16">
          <h2 className="text-3xl font-extrabold tracking-tight">What Our Users Say</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm max-w-xl mx-auto">
            Read comments from property owners, students, and businesses who rented through our broker-free portal.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { quote: 'As a student at Karakoram International University, finding a room in Gilgit without paying heavy broker commissions felt impossible. RentGB helped me secure a hostel room within three days.', author: 'Sajid Ali', role: 'Student, KIU', avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=100&q=80' },
            { quote: 'Listing my guest cottage in Hunza Karimabad was extremely easy. The owner dashboard allows me to approve visit requests and chat directly with tourists before they travel.', author: 'Sher Baz', role: 'Property Owner, Hunza', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80' },
            { quote: 'We were looking for a boutique commercial shop space in Skardu market. Using RentGB advanced filters, we found the right listing and closed the deal directly with the landlord.', author: 'Zahra Khan', role: 'Business Owner, Skardu', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80' }
          ].map((t, i) => (
            <div key={i} className="flex flex-col justify-between p-8 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-3xl shadow-sm">
              <p className="text-slate-500 dark:text-slate-400 text-sm italic leading-relaxed">
                "{t.quote}"
              </p>
              <div className="flex items-center space-x-3 mt-6">
                <img src={t.avatar} alt={t.author} className="h-10 w-10 rounded-full object-cover" />
                <div>
                  <h4 className="font-bold text-sm text-slate-800 dark:text-white leading-tight">{t.author}</h4>
                  <p className="text-xs text-slate-400 font-semibold">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 8. FAQ ACCORDION SECTION */}
      <section className="max-w-4xl mx-auto px-4 w-full">
        <div className="text-center space-y-2 mb-12">
          <h2 className="text-3xl font-extrabold tracking-tight">Frequently Asked Questions</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Everything you need to know about RentGB rentals portal.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div 
              key={idx}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 overflow-hidden"
            >
              <button
                onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                className="w-full px-6 py-4 flex items-center justify-between text-left font-bold text-slate-800 dark:text-white hover:text-brand-500 transition-colors"
              >
                <span>{faq.q}</span>
                <HelpCircle className={`h-5 w-5 text-slate-400 transform transition-transform ${activeFaq === idx ? 'rotate-180 text-brand-500' : ''}`} />
              </button>
              {activeFaq === idx && (
                <div className="px-6 pb-5 pt-1 text-sm text-slate-500 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800/50">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 9. CONTACT SECTION */}
      <section id="contact" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full scroll-mt-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200/50 dark:border-slate-800/50 p-8 md:p-12 shadow-xl">
          
          <div className="space-y-6">
            <h2 className="text-3xl font-extrabold tracking-tight">Get in Touch With Us</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
              Have questions about listing your property or verified badges? Fill out the form or reach out via our contact details. Our team is based in Gilgit and Skardu.
            </p>
            <div className="space-y-4 text-sm text-slate-600 dark:text-slate-300 font-medium">
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-brand-500" />
                <span>support@rentgb.com</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-brand-500" />
                <span>+92 (5811) 456-789</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="h-5 w-5 text-brand-500" />
                <span>RentGB Tower, Jutial Cantt Road, Gilgit City</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleContactSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col space-y-1">
                <label className="text-xs font-bold text-slate-500">Name</label>
                <input
                  type="text"
                  required
                  placeholder="Your name"
                  value={contactForm.name}
                  onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                  className="px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:outline-none focus:border-brand-500 text-sm transition-colors"
                />
              </div>
              <div className="flex flex-col space-y-1">
                <label className="text-xs font-bold text-slate-500">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="name@email.com"
                  value={contactForm.email}
                  onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                  className="px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:outline-none focus:border-brand-500 text-sm transition-colors"
                />
              </div>
            </div>
            <div className="flex flex-col space-y-1">
              <label className="text-xs font-bold text-slate-500">Message</label>
              <textarea
                required
                rows={4}
                placeholder="How can we help you?"
                value={contactForm.message}
                onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                className="px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:outline-none focus:border-brand-500 text-sm transition-colors resize-none"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm shadow-lg shadow-brand-500/20 transition-colors"
            >
              Send Message
            </button>
          </form>

        </div>
      </section>

    </div>
  );
};

export default Home;
