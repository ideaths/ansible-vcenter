import React, { useState, useEffect } from 'react';
import { XCircle, Server, RefreshCw, ServerOff } from 'lucide-react';

const VCenterConfig = ({ config, onSubmit, onCancel, isLoading, onDisconnect, isConnected }) => {
  const [formData, setFormData] = useState(config || {
    hostname: '',
    username: '',
    password: '',
    datacenter: '',
    validateCerts: false
  });
  
  // Đồng bộ dữ liệu từ prop khi thay đổi
  useEffect(() => {
    if (config) {
      setFormData(config);
    }
  }, [config]);

  // Xử lý thay đổi trường input
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  // Xử lý submit form
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">
              {isConnected ? 'Cấu hình kết nối vCenter hiện tại' : 'Cấu hình kết nối vCenter'}
            </h2>
            <button 
              onClick={onCancel}
              className="text-gray-500 hover:text-gray-700"
              disabled={isLoading}
              type="button"
            >
              <XCircle className="h-6 w-6" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* vCenter Hostname */}
              <div>
                <label className="block text-sm font-medium text-gray-700">vCenter Hostname</label>
                <input
                  type="text"
                  name="hostname"
                  value={formData.hostname}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  placeholder="vcenter.example.com"
                  required
                  disabled={isLoading}
                />
              </div>
              
              {/* Username */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Username</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  placeholder="administrator@vsphere.local"
                  required
                  disabled={isLoading}
                />
              </div>
              
              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  placeholder="Password"
                  required={!isConnected}
                  disabled={isLoading}
                />
                {isConnected && !formData.password && (
                  <p className="mt-1 text-sm text-gray-500">
                    Để trống để giữ mật khẩu hiện tại
                  </p>
                )}
              </div>
              
              {/* Datacenter */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Datacenter</label>
                <input
                  type="text"
                  name="datacenter"
                  value={formData.datacenter}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  placeholder="Home"
                  required
                  disabled={isLoading}
                />
              </div>
              
              {/* Validate Certs */}
              <div className="flex items-center md:col-span-2">
                <input
                  type="checkbox"
                  id="validateCerts"
                  name="validateCerts"
                  checked={formData.validateCerts}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  disabled={isLoading}
                />
                <label htmlFor="validateCerts" className="ml-2 block text-sm text-gray-900">
                  Xác thực chứng chỉ SSL
                </label>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              {isConnected && (
                <button
                  type="button"
                  onClick={onDisconnect}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center"
                  disabled={isLoading}
                >
                  <ServerOff className="h-4 w-4 mr-2" />
                  Ngắt kết nối
                </button>
              )}
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                disabled={isLoading}
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="animate-spin h-4 w-4 mr-2" />
                    Đang kết nối...
                  </>
                ) : (
                  <>
                    <Server className="h-4 w-4 mr-2" />
                    {isConnected ? 'Cập nhật kết nối' : 'Kết nối'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default VCenterConfig;