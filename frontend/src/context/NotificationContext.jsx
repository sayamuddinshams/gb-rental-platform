import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    
    // Auto remove after 4 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 4000);
  }, []);

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return (
    <NotificationContext.Provider value={{ showToast }}>
      {children}
      
      {/* Toast Render Portal */}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 w-full max-w-sm pointer-events-none">
        {toasts.map((toast) => {
          let bgColor = 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800';
          let textColor = 'text-slate-800 dark:text-slate-200';
          let Icon = Info;
          let iconColor = 'text-blue-500';

          switch (toast.type) {
            case 'success':
              bgColor = 'bg-white dark:bg-slate-900 border-emerald-100 dark:border-emerald-950/50 shadow-emerald-100/10';
              iconColor = 'text-emerald-500';
              Icon = CheckCircle;
              break;
            case 'error':
              bgColor = 'bg-white dark:bg-slate-900 border-rose-100 dark:border-rose-950/50 shadow-rose-100/10';
              iconColor = 'text-rose-500';
              Icon = AlertCircle;
              break;
            case 'warning':
              bgColor = 'bg-white dark:bg-slate-900 border-amber-100 dark:border-amber-950/50';
              iconColor = 'text-amber-500';
              Icon = AlertTriangle;
              break;
            case 'info':
            default:
              bgColor = 'bg-white dark:bg-slate-900 border-blue-100 dark:border-blue-950/50';
              iconColor = 'text-blue-500';
              Icon = Info;
              break;
          }

          return (
            <div
              key={toast.id}
              className={`flex items-start p-4 border rounded-2xl shadow-xl backdrop-blur-md pointer-events-auto animate-slide-up ${bgColor} ${textColor}`}
              style={{ contentVisibility: 'auto' }}
            >
              <div className="flex-shrink-0 mt-0.5">
                <Icon className={`h-5 w-5 ${iconColor}`} />
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium leading-5">{toast.message}</p>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="ml-4 flex-shrink-0 inline-flex text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 focus:outline-none transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export default NotificationContext;
