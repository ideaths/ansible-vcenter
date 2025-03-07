import React, { useEffect } from 'react';
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';

const Toast = ({ message, onClose }) => {
  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(onClose, 5000);
      return () => clearTimeout(timer);
    }
  }, [message, onClose]);

  if (!message.text) return null;

  const icons = {
    error: <AlertCircle className="h-5 w-5" />,
    success: <CheckCircle className="h-5 w-5" />,
    info: <Info className="h-5 w-5" />
  };
  
  // Styles spécifiques en fonction du type
  const getToastStyles = (type) => {
    const baseStyles = {
      animation: 'slideInRight 0.3s ease forwards',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      borderLeft: '4px solid'
    };
    
    switch (type) {
      case 'error':
        return {
          ...baseStyles,
          background: 'linear-gradient(to right, #fee2e2, #fef2f2)',
          borderLeftColor: '#ef4444'
        };
      case 'success':
        return {
          ...baseStyles,
          background: 'linear-gradient(to right, #d1fae5, #ecfdf5)',
          borderLeftColor: '#10b981'
        };
      case 'info':
      default:
        return {
          ...baseStyles,
          background: 'linear-gradient(to right, #dbeafe, #eff6ff)',
          borderLeftColor: '#3b82f6'
        };
    }
  };
  
  // Couleur du texte en fonction du type
  const getTextColor = (type) => {
    switch (type) {
      case 'error': return '#b91c1c';
      case 'success': return '#047857';
      case 'info':
      default: return '#1e40af';
    }
  };

  const toastStyles = getToastStyles(message.type || 'info');
  const textColor = getTextColor(message.type || 'info');

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      <div 
        className="flex items-center gap-2 px-4 py-3 rounded-lg min-w-[300px] max-w-md"
        style={toastStyles}
      >
        <div style={{ color: textColor }}>
          {icons[message.type || 'info']}
        </div>
        <p className="flex-grow text-sm font-medium" style={{ color: textColor }}>
          {message.text}
        </p>
        <button 
          onClick={onClose} 
          className="p-1 rounded-full hover:bg-black/5 transition-colors"
          style={{ color: textColor, transition: 'background-color 0.15s ease' }}
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Animations */}
      <style jsx>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default Toast;