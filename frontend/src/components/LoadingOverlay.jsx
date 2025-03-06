import React from 'react';
import { useSelector } from 'react-redux';

const LoadingOverlay = () => {
  const { isLoading, message } = useSelector((state) => state.loading);

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg p-6 shadow-xl text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mx-auto mb-4"></div>
        <p className="text-lg text-gray-700">{message || 'Đang xử lý...'}</p>
      </div>
    </div>
  );
};

export default LoadingOverlay;