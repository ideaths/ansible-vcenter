import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

const LoadingOverlay = ({ message }) => {
  const [dots, setDots] = useState('');
  
  // Animation for the loading dots
  useEffect(() => {
    const intervalId = setInterval(() => {
      setDots(prev => {
        if (prev.length >= 3) return '';
        return prev + '.';
      });
    }, 500);
    
    return () => clearInterval(intervalId);
  }, []);
  
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-black bg-opacity-60 z-50">
      <div className="bg-white p-8 rounded-lg shadow-xl flex flex-col items-center max-w-md">
        <div className="relative">
          <Loader2 className="h-20 w-20 animate-spin text-blue-600 mb-6" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-4 w-4 bg-blue-600 rounded-full"></div>
          </div>
        </div>
        
        <p className="text-xl font-medium text-gray-800">{message || 'Đang xử lý'}{dots}</p>
        <p className="mt-3 text-gray-600 text-center">
          Vui lòng đợi trong khi Ansible đang chạy.
          <br />Quá trình này có thể mất một chút thời gian.
        </p>
        
        <div className="mt-6 w-full bg-gray-200 rounded-full h-2.5">
          <div className="bg-blue-600 h-2.5 rounded-full animate-pulse" style={{ width: '100%' }}></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingOverlay;