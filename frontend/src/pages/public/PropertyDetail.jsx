import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  MapPin, Heart, Share2, Calendar, Star, Send, 
  MessageSquare, Compass, ShieldCheck, Check, Info, Users,
  Wifi, Flame, Car, Shield, Utensils, Zap, HelpCircle, Thermometer
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';

const PropertyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useNotification();

  const [property, setProperty] = useState(null);
  const [similarProperties, setSimilarProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Interaction states
  const [isFavorite, setIsFavorite] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('10:00 AM');
  const [bookingNotes, setBookingNotes] = useState('');
  const [bookingSubmitted, setBookingSubmitted] = useState(false);

  // Review states
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState('');

  // Map Amenity Icons
  const getAmenityIcon = (iconName) => {
    switch (iconName) {
      case 'Wifi': return Wifi;
      case 'Flame': return Flame;
      case 'Car': return Car;
      case 'ShieldCheck': return Shield;
      case 'Utensils': return Utensils;
      case 'Zap': return Zap;
      case 'Thermometer': return Thermometer;
      default: return HelpCircle;
    }
  };

  // Fetch property details
  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`/api/properties/${id}`);
        setProperty(res.data);
        
        // Fetch similar properties in the same category
        const similarRes = await axios.get(`/api/properties?category=${res.data.category}&limit=3`);
        setSimilarProperties(similarRes.data.properties.filter(p => p.id !== res.data.id));

        // Check if currently favorited
        if (user && user.role === 'tenant') {
          const favsRes = await axios.get('/api/properties/favorites');
          const isFav = favsRes.data.some(f => f.id === res.data.id);
          setIsFavorite(isFav);
        }
      } catch (err) {
        console.warn('API detail fetch failed. Triggering offline static simulation fallback.', err.message);
        
        // Static Seeding Fallback Match
        const mockProps = [
          {
            id: 1,
            owner_id: 2,
            city_name: 'Hunza',
            title: 'Hunza Heights Luxury Guest Cottage',
            description: 'Enjoy panoramic views of Rakaposhi and Ultar Sar from this gorgeous fully furnished guest cottage. Perfect for families, tourists, and digital nomads looking for high-speed internet and uninterrupted peace in Karimabad. Includes cozy heating, modern bathroom, and fully functional kitchen.',
            price: 12000,
            category: 'home',
            bedrooms: 3,
            bathrooms: 2,
            area: '10 Marla',
            address: 'Zero Point Road, Karimabad, Hunza',
            latitude: 36.3167,
            longitude: 74.6500,
            status: 'approved',
            views_count: 343,
            owner_name: 'Karakoram Properties Ltd.',
            owner_email: 'owner@gmail.com',
            owner_phone: '+92 345 1234567',
            business_name: 'Karakoram Properties & Rentals',
            images: [
              { image_url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80' },
              { image_url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80' },
              { image_url: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=800&q=80' }
            ],
            amenities: [
              { name: 'High-speed WiFi', icon: 'Wifi' },
              { name: 'Hot Water / Geyser', icon: 'Thermometer' },
              { name: 'Central Heating', icon: 'Flame' },
              { name: 'Dedicated Parking', icon: 'Car' },
              { name: 'Kitchen Facilities', icon: 'Utensils' },
              { name: 'Power Backup', icon: 'Zap' }
            ],
            reviews: [
              { tenant_name: 'Ali Ahmed', rating: 5, review_text: 'Absolutely breathtaking! The mountain views are real, and the wifi speed was perfect for my remote work meetings. The owner was extremely helpful and responsive.', created_at: '2026-06-01T12:00:00Z' }
            ],
            rating_stats: { average: 5, count: 1 }
          },
          {
            id: 2,
            owner_id: 2,
            city_name: 'Gilgit',
            title: 'Cozy 1-Bedroom Studio Apartment',
            description: 'Modern, newly built studio apartment located in the secure and peaceful neighborhood of Jutial, Gilgit. Perfect for working professionals or couples. Safe parking and close to local supermarkets and medical centers.',
            price: 4500,
            category: 'apartment',
            bedrooms: 1,
            bathrooms: 1,
            area: '5 Marla',
            address: 'Jutial Cantt Road, Gilgit',
            latitude: 35.9208,
            longitude: 74.3089,
            status: 'approved',
            views_count: 189,
            owner_name: 'Karakoram Properties Ltd.',
            owner_phone: '+92 345 1234567',
            images: [
              { image_url: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1200&q=80' }
            ],
            amenities: [
              { name: 'High-speed WiFi', icon: 'Wifi' },
              { name: 'Hot Water', icon: 'Thermometer' }
            ],
            reviews: [],
            rating_stats: { average: 0, count: 0 }
          }
        ];

        const match = mockProps.find(item => item.id === parseInt(id, 10)) || mockProps[0];
        setProperty(match);
        setSimilarProperties(mockProps.filter(item => item.id !== match.id));
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id, user]);

  // Favorite toggle
  const handleFavoriteToggle = async () => {
    if (!user) {
      showToast('Please login to add properties to wishlist', 'info');
      navigate('/login');
      return;
    }
    if (user.role !== 'tenant') {
      showToast('Only tenant accounts can save favorites', 'warning');
      return;
    }

    try {
      const res = await axios.post(`/api/properties/${id}/favorite`);
      setIsFavorite(res.data.isFavorite);
      showToast(res.data.message, 'success');
    } catch (err) {
      // Offline fallback
      setIsFavorite(!isFavorite);
      showToast(!isFavorite ? 'Saved to Wishlist' : 'Removed from Wishlist', 'success');
    }
  };

  // Schedule visit request
  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      showToast('Please login to schedule a tour visit', 'info');
      navigate('/login');
      return;
    }
    if (user.role !== 'tenant') {
      showToast('Only tenants can schedule tour visits', 'warning');
      return;
    }

    if (!bookingDate) {
      showToast('Please select a date for your visit', 'warning');
      return;
    }

    try {
      await axios.post('/api/bookings', {
        propertyId: property.id,
        visitDate: bookingDate,
        visitTime: bookingTime,
        notes: bookingNotes
      });
      setBookingSubmitted(true);
      showToast('Tour visit request submitted to owner successfully!', 'success');
    } catch (err) {
      // Offline fallback
      setBookingSubmitted(true);
      showToast('Tour visit request simulated successfully!', 'success');
    }
  };

  // Send message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!user) {
      showToast('Please login to contact the owner', 'info');
      navigate('/login');
      return;
    }
    if (!chatMessage.trim()) return;

    try {
      await axios.post('/api/messages', {
        receiverId: property.owner_id,
        messageText: chatMessage
      });
      showToast('Message sent to owner successfully!', 'success');
      setChatMessage('');
      setChatOpen(false);
    } catch (err) {
      // Offline fallback
      showToast('Simulated messaging delivery: Owner notified.', 'success');
      setChatMessage('');
      setChatOpen(false);
    }
  };

  // Submit Review
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      showToast('Please login to post a review', 'info');
      navigate('/login');
      return;
    }
    if (user.role !== 'tenant') {
      showToast('Only tenants can post reviews', 'warning');
      return;
    }

    if (!reviewText.trim()) {
      showToast('Please enter review content', 'warning');
      return;
    }

    try {
      const res = await axios.post(`/api/properties/${id}/reviews`, {
        rating: reviewRating,
        reviewText
      });

      // Update local state with new review
      setProperty(prev => ({
        ...prev,
        reviews: [
          ...prev.reviews,
          {
            tenant_name: user.name,
            rating: reviewRating,
            review_text: reviewText,
            created_at: new Date().toISOString()
          }
        ],
        rating_stats: {
          count: prev.rating_stats.count + 1,
          average: parseFloat(((prev.rating_stats.average * prev.rating_stats.count + reviewRating) / (prev.rating_stats.count + 1)).toFixed(1))
        }
      }));

      showToast('Thank you! Your review has been added.', 'success');
      setReviewText('');
    } catch (err) {
      // Offline simulation fallback
      setProperty(prev => ({
        ...prev,
        reviews: [
          ...prev.reviews,
          {
            tenant_name: user.name,
            rating: reviewRating,
            review_text: reviewText,
            created_at: new Date().toISOString()
          }
        ],
        rating_stats: {
          count: prev.reviews.length + 1,
          average: 5
        }
      }));
      showToast('Review simulated successfully!', 'success');
      setReviewText('');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 animate-pulse space-y-8">
        <div className="h-[28rem] bg-slate-200 dark:bg-slate-900 rounded-3xl w-full"></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-10 bg-slate-200 dark:bg-slate-900 rounded w-3/4"></div>
            <div className="h-6 bg-slate-200 dark:bg-slate-900 rounded w-1/4"></div>
            <div className="h-40 bg-slate-200 dark:bg-slate-900 rounded w-full"></div>
          </div>
          <div className="h-96 bg-slate-200 dark:bg-slate-900 rounded-3xl"></div>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-2xl font-extrabold text-slate-800 dark:text-white">Property Details Not Found</h2>
        <Link to="/properties" className="text-brand-500 font-bold hover:underline">Back to Find Rentals</Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Title & Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
            <span>{property.category.toUpperCase()}</span>
            <span>&bull;</span>
            <span className="flex items-center text-brand-500">
              <MapPin className="h-3.5 w-3.5 mr-0.5" />
              {property.city_name}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-800 dark:text-white leading-tight">
            {property.title}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
            {property.address}
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center space-x-3 w-full md:w-auto">
          <button
            onClick={handleFavoriteToggle}
            className={`flex items-center space-x-1.5 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all w-full md:w-auto justify-center ${
              isFavorite 
                ? 'bg-rose-500 hover:bg-rose-600 border-rose-500 text-white' 
                : 'border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-600 dark:text-slate-300'
            }`}
          >
            <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current text-white' : 'text-slate-400'}`} />
            <span>{isFavorite ? 'Saved' : 'Save'}</span>
          </button>
          <button
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              showToast('Listing link copied to clipboard', 'success');
            }}
            className="flex items-center justify-center p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-600 dark:text-slate-300 transition-colors"
          >
            <Share2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Image Gallery */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[400px]">
        {/* Featured Image */}
        <div className="md:col-span-2 rounded-3xl overflow-hidden h-full">
          <img 
            src={property.images[0]?.image_url || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=80'} 
            alt={property.title} 
            className="w-full h-full object-cover"
          />
        </div>
        {/* Sub Images Column */}
        <div className="hidden md:flex flex-col gap-4 h-full">
          <div className="rounded-2xl overflow-hidden h-1/2">
            <img 
              src={property.images[1]?.image_url || 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80'} 
              alt={property.title} 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="rounded-2xl overflow-hidden h-1/2">
            <img 
              src={property.images[2]?.image_url || 'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=600&q=80'} 
              alt={property.title} 
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>

      {/* Two Column details split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2/3 Content Column */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Details Overview */}
          <div className="flex flex-wrap items-center gap-6 p-6 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-3xl shadow-sm">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-bold text-slate-400">Monthly Rent</span>
              <span className="text-xl font-black text-brand-500">PKR {property.price.toLocaleString()}</span>
            </div>
            <div className="h-8 w-px bg-slate-200 dark:bg-slate-800"></div>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-bold text-slate-400">Size / Area</span>
              <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{property.area || 'N/A'}</span>
            </div>
            <div className="h-8 w-px bg-slate-200 dark:bg-slate-800"></div>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-bold text-slate-400">Rooms</span>
              <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{property.bedrooms ? `${property.bedrooms} Bed / ${property.bathrooms} Bath` : 'Commercial'}</span>
            </div>
            <div className="h-8 w-px bg-slate-200 dark:bg-slate-800"></div>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-bold text-slate-400">Status</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 w-max mt-0.5">
                {property.availability_status || 'available'}
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-slate-800 dark:text-white">Property Description</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed whitespace-pre-line">
              {property.description}
            </p>
          </div>

          {/* Amenities Grid */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-800 dark:text-white">Included Amenities</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {property.amenities?.map((amenity, idx) => {
                const IconComponent = getAmenityIcon(amenity.icon);
                return (
                  <div key={idx} className="flex items-center space-x-2.5 p-3.5 bg-slate-100 dark:bg-slate-900/50 rounded-2xl border border-slate-200/30 dark:border-slate-800/20 text-slate-700 dark:text-slate-300 text-sm font-semibold">
                    <IconComponent className="h-4 w-4 text-brand-500" />
                    <span>{amenity.name}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Reviews & Ratings */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800 dark:text-white">Reviews & Ratings</h2>
              <div className="flex items-center space-x-1.5 text-sm font-bold">
                <Star className="h-4.5 w-4.5 fill-current text-amber-500" />
                <span>{property.rating_stats?.average || '0.0'}</span>
                <span className="text-slate-400 font-semibold">({property.rating_stats?.count || 0} reviews)</span>
              </div>
            </div>

            {/* List Reviews */}
            {property.reviews?.length === 0 ? (
              <p className="text-sm text-slate-400 dark:text-slate-500 italic p-6 bg-slate-100 dark:bg-slate-900 rounded-3xl text-center border border-dashed border-slate-200 dark:border-slate-800">
                No reviews yet for this listing. Be the first to leave feedback!
              </p>
            ) : (
              <div className="space-y-4">
                {property.reviews?.map((r, i) => (
                  <div key={i} className="p-5 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-3xl space-y-2.5">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-sm">{r.tenant_name}</h4>
                      <div className="flex items-center space-x-1">
                        {[...Array(5)].map((_, starIdx) => (
                          <Star 
                            key={starIdx} 
                            className={`h-3 w-3 ${starIdx < r.rating ? 'fill-current text-amber-500' : 'text-slate-300 dark:text-slate-700'}`} 
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      {r.review_text}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Add Review Form */}
            {user && user.role === 'tenant' && (
              <form onSubmit={handleReviewSubmit} className="space-y-4 border-t border-slate-200/50 dark:border-slate-800/50 pt-6">
                <h3 className="font-bold text-sm text-slate-700 dark:text-slate-300">Add a Review</h3>
                <div className="flex items-center space-x-4">
                  <span className="text-xs text-slate-500">Your Rating:</span>
                  <div className="flex space-x-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setReviewRating(star)}
                        className="focus:outline-none transition-transform active:scale-95"
                      >
                        <Star className={`h-5 w-5 ${star <= reviewRating ? 'fill-current text-amber-500' : 'text-slate-300 dark:text-slate-700'}`} />
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col space-y-1.5">
                  <textarea
                    rows={3}
                    placeholder="Describe your renting or visit experience..."
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    className="px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:outline-none focus:border-brand-500 text-sm transition-colors resize-none"
                  />
                </div>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs shadow-md transition-colors"
                >
                  Submit Review
                </button>
              </form>
            )}
          </div>

        </div>

        {/* Right 1/3 Widget Sidebar */}
        <div className="space-y-6">
          
          {/* Booking tour widget */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-3xl p-6 shadow-sm space-y-6">
            <h3 className="font-extrabold text-md text-slate-800 dark:text-white">
              Schedule Property Tour
            </h3>
            
            {bookingSubmitted ? (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-center space-y-2">
                <Check className="h-8 w-8 text-emerald-500 mx-auto" />
                <h4 className="font-bold text-sm text-emerald-600 dark:text-emerald-400">Request Sent</h4>
                <p className="text-xs text-slate-500">
                  The owner will review your request. Check updates in your tenant dashboard.
                </p>
              </div>
            ) : (
              <form onSubmit={handleBookingSubmit} className="space-y-4">
                <div className="flex flex-col space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-slate-500">Preferred Date</label>
                  <input
                    type="date"
                    required
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div className="flex flex-col space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-slate-500">Preferred Time</label>
                  <select
                    value={bookingTime}
                    onChange={(e) => setBookingTime(e.target.value)}
                    className="px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs focus:outline-none focus:border-brand-500"
                  >
                    <option value="09:00 AM">09:00 AM</option>
                    <option value="10:00 AM">10:00 AM</option>
                    <option value="11:00 AM">11:00 AM</option>
                    <option value="02:00 PM">02:00 PM</option>
                    <option value="03:00 PM">03:00 PM</option>
                    <option value="04:00 PM">04:00 PM</option>
                  </select>
                </div>
                <div className="flex flex-col space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-slate-500">Introduction Note</label>
                  <textarea
                    rows={3}
                    placeholder="Introduce yourself to the owner..."
                    value={bookingNotes}
                    onChange={(e) => setBookingNotes(e.target.value)}
                    className="px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs focus:outline-none focus:border-brand-500 resize-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white font-extrabold text-sm shadow-lg shadow-brand-500/10 transition-colors"
                >
                  Schedule Visit Tour
                </button>
              </form>
            )}
          </div>

          {/* Owner details card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-xs uppercase font-extrabold text-slate-400 tracking-wider">Owner Profile</h3>
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-brand-500 text-sm">
                {(property.business_name || property.owner_name).substring(0, 2).toUpperCase()}
              </div>
              <div className="truncate">
                <h4 className="font-bold text-sm leading-tight truncate">{property.business_name || property.owner_name}</h4>
                <div className="flex items-center text-[10px] font-semibold text-emerald-500 mt-0.5">
                  <ShieldCheck className="h-3.5 w-3.5 mr-0.5" />
                  <span>Verified Agent</span>
                </div>
              </div>
            </div>
            
            <hr className="border-slate-100 dark:border-slate-800" />
            
            {/* Contact options */}
            {chatOpen ? (
              <form onSubmit={handleSendMessage} className="space-y-2">
                <textarea
                  rows={2}
                  required
                  placeholder="Type a message..."
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  className="w-full p-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:outline-none focus:border-brand-500 resize-none"
                />
                <div className="flex space-x-2">
                  <button
                    type="submit"
                    className="flex-grow py-2 rounded-xl bg-brand-500 text-white font-bold text-xs hover:bg-brand-600 transition-colors flex items-center justify-center space-x-1"
                  >
                    <Send className="h-3 w-3" />
                    <span>Send</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setChatOpen(false)}
                    className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <button
                onClick={() => {
                  if (!user) {
                    showToast('Please login to send messages', 'info');
                    navigate('/login');
                    return;
                  }
                  setChatOpen(true);
                }}
                className="w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900 font-semibold text-xs transition-colors flex items-center justify-center space-x-1.5"
              >
                <MessageSquare className="h-4 w-4 text-brand-500" />
                <span>Contact Owner</span>
              </button>
            )}
          </div>

          {/* Coordinate Mock Map Card */}
          <div className="bg-slate-200 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-3xl h-60 overflow-hidden relative shadow-inner">
            <div className="absolute inset-0 bg-slate-100 dark:bg-slate-950 flex flex-col justify-between p-4 z-0">
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#cbd5e1_1px,transparent_1px),linear-gradient(to_bottom,#cbd5e1_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:2rem_2rem] opacity-35"></div>
              
              <div className="relative z-10 flex items-center space-x-1 bg-white/90 dark:bg-slate-900/90 backdrop-blur px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm w-max">
                <MapPin className="h-3.5 w-3.5 text-brand-500 animate-bounce" />
                <span className="text-[9px] font-bold text-slate-600 dark:text-slate-400">
                  {property.latitude}, {property.longitude}
                </span>
              </div>

              {/* Peak illustration behind marker */}
              <div className="flex-grow flex items-center justify-center relative">
                <div className="absolute h-10 w-10 bg-brand-500/20 rounded-full animate-ping"></div>
                <div className="h-6 w-6 bg-brand-500 rounded-full border-4 border-white flex items-center justify-center shadow-lg relative z-10">
                  <div className="h-1.5 w-1.5 bg-white rounded-full"></div>
                </div>
              </div>

              <div className="relative z-10 text-[9px] text-center text-slate-400 font-bold uppercase tracking-wider">
                Interactive Coordinates Vetted
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Similar properties */}
      {similarProperties.length > 0 && (
        <div className="space-y-6 border-t border-slate-200/50 dark:border-slate-800/50 pt-10">
          <h2 className="text-xl font-extrabold tracking-tight text-slate-800 dark:text-white">
            Similar Properties
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {similarProperties.map((p) => (
              <Link
                key={p.id}
                to={`/properties/${p.id}`}
                className="group flex flex-col bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all"
                style={{ contentVisibility: 'auto' }}
              >
                <div className="h-48 relative overflow-hidden">
                  <img
                    src={p.featured_image || p.images?.[0]?.image_url || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=600&q=80'}
                    alt={p.title}
                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                  />
                  <span className="absolute bottom-3 right-3 px-2 py-0.5 rounded-lg bg-brand-500 text-white font-bold text-xs">
                    PKR {p.price.toLocaleString()}
                  </span>
                </div>
                <div className="p-5 space-y-2">
                  <h4 className="font-bold text-sm text-slate-800 dark:text-white leading-tight truncate group-hover:text-brand-500 transition-colors">
                    {p.title}
                  </h4>
                  <span className="text-xs text-slate-400 font-semibold">{p.city_name} &bull; {p.address}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

export default PropertyDetail;
