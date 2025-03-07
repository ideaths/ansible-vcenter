// Toast.jsx - Nâng cao thông báo
import React, { useEffect } from 'react';
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';

const EnhancedToast = ({ message, onClose }) => {
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

  // Nâng cao với hiệu ứng
  const bgColors = {
    error: 'bg-gradient-to-r from-red-50 to-red-100 border-red-200',
    success: 'bg-gradient-to-r from-green-50 to-green-100 border-green-200',
    info: 'bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200'
  };

  const textColors = {
    error: 'text-red-700',
    success: 'text-green-700',
    info: 'text-blue-700'
  };

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      <div className={`flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg min-w-[300px] max-w-md border ${bgColors[message.type || 'info']} animate-slideInRight`}>
        <div className={`${textColors[message.type || 'info']}`}>
          {icons[message.type || 'info']}
        </div>
        <p className={`flex-grow text-sm font-medium ${textColors[message.type || 'info']}`}>{message.text}</p>
        <button 
          onClick={onClose} 
          className={`p-1 rounded-full hover:bg-black/5 transition-colors ${textColors[message.type || 'info']}`}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
