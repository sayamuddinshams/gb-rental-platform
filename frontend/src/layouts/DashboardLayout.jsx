import React, { useState, useEffect } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNotification } from '../context/NotificationContext';
import { 
  Home, Menu, X, Sun, Moon, LogOut, ShieldCheck, UserCircle, Bell,
  LayoutDashboard, Calendar, MessageSquare, User, Building, Settings,
  Users, CheckSquare, AlertOctagon, Terminal
} from 'lucide-react';

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { showToast } = useNotification();
  const navigate = useNavigate();
  const location = useLocation();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  // 1. Guard check: Redirect to login if user session does not exist
  useEffect(() => {
    if (!user) {
      showToast('Please sign in to access the portal', 'warning');
      navigate('/login');
    }
  }, [user, navigate, showToast]);

  if (!user) return null;

  // 2. Validate Role-Based Route Access (security guard)
  const isPathAllowed = () => {
    const path = location.pathname;
    if (user.role === 'admin' && path.startsWith('/admin')) return true;
    if (user.role === 'owner' && path.startsWith('/owner')) return true;
    if (user.role === 'tenant' && path.startsWith('/tenant')) return true;
    return false;
  };

  if (!isPathAllowed()) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-950">
        <div className="max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-3xl text-center space-y-5 shadow-lg">
          <AlertOctagon className="h-12 w-12 text-rose-500 mx-auto" />
          <h2 className="text-xl font-extrabold">Unauthorized Portal Access</h2>
          <p className="text-sm text-slate-500">
            You are logged in as a <strong>{user.role}</strong> and do not have access rights to this section.
          </p>
          <div className="flex flex-col space-y-3">
            <button
              onClick={() => {
                if (user.role === 'admin') navigate('/admin/dashboard');
                else if (user.role === 'owner') navigate('/owner/dashboard');
                else navigate('/tenant/dashboard');
              }}
              className="px-6 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm rounded-xl transition-colors"
            >
              Go to My Portal
            </button>
            <button
              onClick={() => { logout(); navigate('/login'); }}
              className="text-xs text-rose-500 font-bold hover:underline"
            >
              Sign Out & Login to another account
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. Define Sidebar items based on Role
  const getSidebarLinks = () => {
    switch (user.role) {
      case 'admin':
        return [
          { name: 'Analytics Stats', path: '/admin/dashboard', icon: LayoutDashboard },
          { name: 'User Management', path: '/admin/users', icon: Users },
          { name: 'Listing Verifications', path: '/admin/properties', icon: Building },
          { name: 'Reports Queue', path: '/admin/reports', icon: AlertOctagon },
          { name: 'System Audit Logs', path: '/admin/logs', icon: Terminal }
        ];
      case 'owner':
        return [
          { name: 'Analytics Stats', path: '/owner/dashboard', icon: LayoutDashboard },
          { name: 'My Asset Listings', path: '/owner/properties', icon: Building },
          { name: 'Tour Visit Requests', path: '/owner/bookings', icon: Calendar },
          { name: 'Agency Profile', path: '/owner/profile', icon: Settings }
        ];
      case 'tenant':
      default:
        return [
          { name: 'Dashboard Overview', path: '/tenant/dashboard', icon: LayoutDashboard },
          { name: 'Scheduled Tours', path: '/tenant/bookings', icon: Calendar },
          { name: 'Inbox Chats', path: '/tenant/messages', icon: MessageSquare },
          { name: 'Account Profile', path: '/tenant/profile', icon: User }
        ];
    }
  };

  const menuLinks = getSidebarLinks();

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      
      {/* 1. SIDEBAR (Desktop sidebar matches full-width view) */}
      <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-slate-900 border-r border-slate-200/50 dark:border-slate-800/50 flex-shrink-0 transition-colors duration-200">
        
        {/* Sidebar Header branding */}
        <div className="h-16 flex items-center px-6 border-b border-slate-200/50 dark:border-slate-800/50">
          <Link to="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-brand-500 to-accent-blue flex items-center justify-center text-white font-bold text-sm">
              ⛰️
            </div>
            <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-brand-600 to-accent-blue bg-clip-text text-transparent dark:from-brand-400 dark:to-accent-blue">
              RentGB
            </span>
          </Link>
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-grow p-4 space-y-1">
          <div className="px-3 mb-2 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            {user.role} Portal
          </div>
          {menuLinks.map((link) => {
            const LinkIcon = link.icon;
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.name}
                to={link.path}
                className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                  isActive
                    ? 'bg-brand-500 text-white shadow-md shadow-brand-500/10'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                <LinkIcon className="h-4.5 w-4.5" />
                <span>{link.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer options */}
        <div className="p-4 border-t border-slate-200/50 dark:border-slate-800/50 space-y-2">
          <Link
            to="/"
            className="flex items-center space-x-3 px-3 py-2 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 font-semibold"
          >
            <Home className="h-4.5 w-4.5" />
            <span>Go to Public Site</span>
          </Link>
          <button
            onClick={() => { logout(); navigate('/'); }}
            className="flex items-center space-x-3 px-3 py-2 text-sm text-rose-500 hover:text-rose-600 font-semibold w-full text-left"
          >
            <LogOut className="h-4.5 w-4.5" />
            <span>Sign Out</span>
          </button>
        </div>

      </aside>

      {/* 2. MAIN DISPLAY BODY VIEW */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        
        {/* Top Header navbar bar */}
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200/50 dark:border-slate-800/50 flex items-center justify-between px-6 sticky top-0 z-30 transition-colors duration-200">
          
          {/* Left panel info */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 md:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h2 className="text-sm font-bold capitalize hidden sm:block text-slate-500">
              Welcome back, <span className="text-slate-800 dark:text-white font-extrabold">{user.name}</span>
            </h2>
          </div>

          {/* Right Header items */}
          <div className="flex items-center space-x-4">
            
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {theme === 'dark' ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
            </button>

            {/* Notification Badge alerts */}
            <div className="relative">
              <button 
                onClick={() => showToast('Simulating: Notification drawer checked.', 'info')}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <Bell className="h-4.5 w-4.5" />
                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-brand-500"></span>
              </button>
            </div>

            {/* User Avatar badge */}
            <div className="flex items-center space-x-2 border-l border-slate-200 dark:border-slate-800 pl-4">
              <div className="h-8 w-8 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-500 flex items-center justify-center font-bold text-xs">
                {user.name.substring(0, 2).toUpperCase()}
              </div>
              <div className="hidden lg:flex flex-col text-left">
                <span className="text-xs font-bold leading-tight">{user.name}</span>
                <span className="text-[9px] uppercase font-extrabold text-slate-400">{user.role}</span>
              </div>
            </div>

          </div>

        </header>

        {/* 3. NESTED ROUTE VIEW PAGES MOUNT */}
        <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full">
          <Outlet />
        </main>

      </div>

      {/* 4. MOBILE DRAWER SIDEBAR OVERLAY */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-sm md:hidden animate-fade-in"
          onClick={() => setSidebarOpen(false)}
        >
          <div 
            className="fixed top-0 left-0 bottom-0 w-64 bg-white dark:bg-slate-900 shadow-2xl p-6 flex flex-col justify-between animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <Link to="/" className="flex items-center space-x-2">
                  <div className="h-7 w-7 rounded-lg bg-gradient-to-tr from-brand-500 to-accent-blue flex items-center justify-center text-white font-bold text-xs">
                    ⛰️
                  </div>
                  <span className="font-extrabold text-md tracking-tight bg-gradient-to-r from-brand-600 to-accent-blue bg-clip-text text-transparent dark:from-brand-400 dark:to-accent-blue">
                    RentGB
                  </span>
                </Link>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-1 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <hr className="border-slate-100 dark:border-slate-800" />

              <nav className="flex flex-col space-y-1.5">
                <div className="px-3 mb-1 text-[9px] uppercase font-bold text-slate-400 tracking-wider">
                  {user.role} Portal
                </div>
                {menuLinks.map((link) => {
                  const LinkIcon = link.icon;
                  const isActive = location.pathname === link.path;
                  return (
                    <Link
                      key={link.name}
                      to={link.path}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center space-x-3 px-3 py-2 rounded-xl text-sm font-semibold transition-colors ${
                        isActive
                          ? 'bg-brand-500 text-white shadow-md'
                          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <LinkIcon className="h-4.5 w-4.5" />
                      <span>{link.name}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="space-y-2 border-t border-slate-200/50 dark:border-slate-800/50 pt-4">
              <Link
                to="/"
                onClick={() => setSidebarOpen(false)}
                className="flex items-center space-x-3 px-3 py-2 text-xs text-slate-500 hover:text-slate-700 font-semibold"
              >
                <Home className="h-4 w-4" />
                <span>Go to Public Site</span>
              </Link>
              <button
                onClick={() => {
                  setSidebarOpen(false);
                  logout();
                  navigate('/');
                }}
                className="flex items-center space-x-3 px-3 py-2 text-xs text-rose-500 hover:text-rose-600 font-semibold w-full text-left"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default DashboardLayout;
