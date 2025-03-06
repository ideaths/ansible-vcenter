import React from 'react';
import { AlertCircle } from 'lucide-react';

const DeleteConfirmDialog = ({ vm, onConfirm, onCancel, isLoading }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="p-6">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Xác nhận xóa VM</h3>
            <p className="text-sm text-gray-500">
              Bạn có chắc chắn muốn xóa VM <span className="font-semibold">{vm?.vm_name}</span>? 
              Hành động này không thể hoàn tác.
            </p>
          </div>
          
          <div className="mt-6 flex justify-center space-x-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              disabled={isLoading}
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
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

export default DeleteConfirmDialog;
