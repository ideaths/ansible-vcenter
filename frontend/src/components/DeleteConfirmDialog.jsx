import React from 'react';
import { AlertCircle, X } from 'lucide-react';

const DeleteConfirmDialog = ({ vm, onConfirm, onCancel, isLoading }) => {
  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
      style={{
        animation: 'fadeIn 0.2s ease forwards',
      }}
    >
      <div 
        className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden"
        style={{
          animation: 'scaleIn 0.25s ease forwards',
          transformOrigin: 'center',
        }}
      >
        {/* Header avec gradient */}
        <div 
          className="py-3 px-4 flex justify-between items-center"
          style={{
            background: 'linear-gradient(to right, #ef4444, #dc2626)',
            color: 'white',
          }}
        >
          <h3 className="text-lg font-semibold">Xác nhận xóa VM</h3>
          <button 
            onClick={onCancel} 
            className="text-white hover:bg-white/20 rounded-full p-1 transition-all"
            disabled={isLoading}
            style={{ transition: 'all 0.15s ease' }}
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-gray-600 mb-6">
              Bạn có chắc chắn muốn xóa VM <span className="font-semibold text-red-600">{vm?.vm_name}</span>? 
              <br/>Hành động này không thể hoàn tác.
            </p>
          </div>
          
          <div className="flex justify-center space-x-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-all"
              disabled={isLoading}
              style={{ 
                transition: 'all 0.15s ease',
              }}
              onMouseOver={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                }
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = '';
                e.currentTarget.style.boxShadow = '';
              }}
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="px-4 py-2 text-white rounded-md transition-all"
              disabled={isLoading}
              style={{ 
                background: 'linear-gradient(to bottom, #ef4444, #dc2626)',
                transition: 'all 0.15s ease',
              }}
              onMouseOver={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.background = 'linear-gradient(to bottom, #dc2626, #b91c1c)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                }
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'linear-gradient(to bottom, #ef4444, #dc2626)';
                e.currentTarget.style.transform = '';
                e.currentTarget.style.boxShadow = '';
              }}
            >
              Xóa VM
            </button>
          </div>
        </div>
      </div>

      {/* Animations for modal */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes scaleIn {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default DeleteConfirmDialog;