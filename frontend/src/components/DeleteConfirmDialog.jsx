// DeleteConfirmDialog.jsx - Nâng cao modal xác nhận xóa
import React from 'react';
import { AlertCircle, X } from 'lucide-react';

const EnhancedDeleteConfirmDialog = ({ vm, onConfirm, onCancel, isLoading }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 animate-fadeIn">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md animate-scaleIn overflow-hidden">
        {/* Header với gradient */}
        <div className="bg-gradient-to-r from-red-500 to-red-700 text-white py-3 px-4 flex justify-between items-center">
          <h3 className="text-lg font-semibold">Xác nhận xóa VM</h3>
          <button 
            onClick={onCancel} 
            className="text-white hover:bg-white/20 rounded-full p-1 transition-all"
            disabled={isLoading}
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-gray-600 mb-6">
              Bạn có chắc chắn muốn xóa VM <span className="font-semibold text-red-600">{vm?.vm_name}</span>? 
              Hành động này không thể hoàn tác.
            </p>
          </div>
          
          <div className="flex justify-center space-x-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-all hover:-translate-y-0.5 shadow-sm disabled:opacity-70"
              disabled={isLoading}
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-all hover:-translate-y-0.5 shadow-sm disabled:opacity-70"
              disabled={isLoading}
            >
              Xóa VM
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
