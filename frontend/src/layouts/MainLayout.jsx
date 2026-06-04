import React, { useState } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Menu, X, Sun, Moon, LogOut, LayoutDashboard, Building2, UserCircle2, Compass } from 'lucide-react';

const MainLayout = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getDashboardLink = () => {
    if (!user) return '/login';
    if (user.role === 'admin') return '/admin/dashboard';
    if (user.role === 'owner') return '/owner/dashboard';
    return '/tenant/dashboard';
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Find Rentals', path: '/properties' },
    { name: 'Contact Us', path: '/#contact' }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors duration-200">
      
      {/* Premium Glassmorphic Navbar */}
      <header className="sticky top-0 z-50 w-full bg-white/70 dark:bg-slate-950/70 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo & Branding */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-brand-500 to-accent-blue flex items-center justify-center text-white shadow-lg shadow-brand-500/20 font-bold text-xl">
              ⛰️
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-brand-600 to-accent-blue bg-clip-text text-transparent dark:from-brand-400 dark:to-accent-blue">
                RentGB
              </span>
              <span className="text-[10px] font-semibold tracking-widest uppercase text-slate-400 dark:text-slate-500 -mt-1">
                Gilgit-Baltistan
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex space-x-8 text-sm font-medium">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`hover:text-brand-500 transition-colors py-2 ${
                  location.pathname === link.path 
                    ? 'text-brand-600 dark:text-brand-400' 
                    : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Actions & Theme Toggles */}
          <div className="hidden md:flex items-center space-x-4">
            
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            {user ? (
              <div className="flex items-center space-x-4">
                <Link
                  to={getDashboardLink()}
                  className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium text-sm border border-slate-200/50 dark:border-slate-800/50 transition-colors"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  <span>Dashboard</span>
                </Link>
                
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors"
                  title="Logout"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-brand-500 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/login?tab=signup"
                  className="px-5 py-2.2 text-sm font-semibold rounded-2xl bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-700 hover:to-brand-600 text-white shadow-lg shadow-brand-500/25 hover:shadow-brand-500/35 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  Post Property
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center space-x-2 md:hidden">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

        </div>
      </header>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden bg-slate-950/30 backdrop-blur-sm animate-fade-in" onClick={() => setMobileMenuOpen(false)}>
          <div 
            className="fixed top-16 right-0 w-64 h-[calc(100vh-4rem)] bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl p-6 flex flex-col justify-between animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col space-y-6">
              <nav className="flex flex-col space-y-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-lg font-semibold text-slate-700 dark:text-slate-200 hover:text-brand-500 py-1 transition-colors"
                  >
                    {link.name}
                  </Link>
                ))}
              </nav>
              
              <hr className="border-slate-200 dark:border-slate-800" />
              
              {user ? (
                <div className="flex flex-col space-y-3">
                  <div className="flex items-center space-x-2 text-sm text-slate-500">
                    <UserCircle2 className="h-5 w-5 text-brand-500" />
                    <span className="truncate">{user.email}</span>
                  </div>
                  <Link
                    to={getDashboardLink()}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center space-x-2 w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-sm transition-colors"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    <span>Go to Dashboard</span>
                  </Link>
                </div>
              ) : (
                <div className="flex flex-col space-y-3">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 font-semibold text-sm text-slate-700 dark:text-slate-200"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/login?tab=signup"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 text-white font-semibold text-sm shadow-md"
                  >
                    Post Property
                  </Link>
                </div>
              )}
            </div>

            {user && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="flex items-center justify-center space-x-2 w-full py-2.5 rounded-xl border border-rose-100 dark:border-rose-950/30 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 font-semibold text-sm transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </button>
            )}

          </div>
        </div>
      )}

      {/* Main Content Grid Area */}
      <main className="flex-grow">
        <Outlet />
      </main>

      {/* Professional Footer */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200/50 dark:border-slate-800/50 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            
            {/* Col 1: Brand details */}
            <div className="flex flex-col space-y-4">
              <Link to="/" className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-brand-500 to-accent-blue flex items-center justify-center text-white font-bold text-sm">
                  ⛰️
                </div>
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-brand-600 to-accent-blue bg-clip-text text-transparent dark:from-brand-400 dark:to-accent-blue">
                  RentGB
                </span>
              </Link>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs">
                A localized, broker-free property listing & rental portal designed to connect tenants and owners directly across Gilgit-Baltistan.
              </p>
            </div>

            {/* Col 2: Popular locations */}
            <div className="flex flex-col space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-800 dark:text-slate-100">
                Popular Locations
              </h3>
              <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
                <li><Link to="/properties?city=Hunza" className="hover:text-brand-500">Hunza Valley</Link></li>
                <li><Link to="/properties?city=Skardu" className="hover:text-brand-500">Skardu Capital</Link></li>
                <li><Link to="/properties?city=Gilgit" className="hover:text-brand-500">Gilgit City</Link></li>
                <li><Link to="/properties?city=Nagar" className="hover:text-brand-500">Nagar Valley</Link></li>
              </ul>
            </div>

            {/* Col 3: Portal quick links */}
            <div className="flex flex-col space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-800 dark:text-slate-100">
                Portals
              </h3>
              <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
                <li><Link to="/login" className="hover:text-brand-500">Tenant Finder</Link></li>
                <li><Link to="/login?tab=signup" className="hover:text-brand-500">Property Owner Portal</Link></li>
                <li><Link to="/login" className="hover:text-brand-500">Administrator Console</Link></li>
                <li><Link to="/#how-it-works" className="hover:text-brand-500">How RentGB Works</Link></li>
              </ul>
            </div>

            {/* Col 4: Newsletter */}
            <div className="flex flex-col space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-800 dark:text-slate-100">
                Stay Updated
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Subscribe to get new listing alerts directly.
              </p>
              <form onSubmit={(e) => e.preventDefault()} className="flex space-x-2">
                <input
                  type="email"
                  placeholder="Enter email"
                  className="px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 w-full focus:outline-none focus:border-brand-500 transition-colors"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold transition-colors"
                >
                  Join
                </button>
              </form>
            </div>

          </div>

          <hr className="my-8 border-slate-200/50 dark:border-slate-800/50" />

          <div className="flex flex-col md:flex-row items-center justify-between text-xs text-slate-400 dark:text-slate-500">
            <span>&copy; {new Date().getFullYear()} RentGB. Final Year Project Showcase (BS Information Technology).</span>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <span className="hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer">Privacy Policy</span>
              <span className="hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer">Terms of Service</span>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default MainLayout;
