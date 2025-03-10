import React, { useEffect } from 'react';
import { Server, Shield, Database, Activity, ExternalLink, RefreshCw } from 'lucide-react';
import VCenterConfig from '../components/VCenterConfig';
import Toast, { useToast } from '../components/Toast';

const LoginPage = ({ onConnect, isLoading, connectionError }) => {
  // Sử dụng hook useToast
  const toast = useToast();
  
  // Hiển thị thông báo lỗi khi connectionError thay đổi
  useEffect(() => {
    if (connectionError) {
      // Không gọi resetSession nữa
      toast.error(connectionError, {
        title: 'Lỗi kết nối',
        autoClose: 6000 // Thời gian hiển thị
      });
    }
  }, [connectionError, toast]);

  // Hàm xử lý kết nối với thông báo toast
  const handleConnect = (formData) => {
    // Không gọi resetSession nữa
    onConnect(formData);
  };

  return (
    <div className="h-screen flex flex-col md:flex-row overflow-hidden">
      {/* Toast container sẽ hiển thị ở góc trên bên phải */}
      <Toast toasts={toast.toasts} removeToast={toast.removeToast} />
      
      {/* Left side - Brand/Info Panel */}
      <div className="bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-900 md:w-1/2 h-full p-8 md:p-12 flex flex-col justify-between overflow-auto">
        <div>
          <div className="mb-8">
            <div className="flex items-center mb-6">
              <Server className="h-8 w-8 mr-3" />
              <h1 className="text-3xl font-bold tracking-tight">VM Manager</h1>
            </div>
            <p className="text-blue-100 text-lg leading-relaxed mb-8">
              Quản lý máy ảo vCenter với Ansible – một giải pháp tự động hóa hiệu quả
              để triển khai và quản lý các máy ảo trong môi trường VMware.
            </p>
          </div>
          
          <div className="space-y-6 mt-6 hidden md:block">
            <Feature 
              icon={<Shield className="h-6 w-6 text-blue-300" />}
              title="Bảo mật"
              description="Kết nối an toàn tới vCenter của bạn với xác thực mạnh mẽ"
            />
            <Feature 
              icon={<Database className="h-6 w-6 text-blue-300" />}
              title="Tập trung"
              description="Quản lý toàn bộ máy ảo từ một giao diện thống nhất"
            />
            <Feature 
              icon={<Activity className="h-6 w-6 text-blue-300" />}
              title="Tự động hóa"
              description="Triển khai và quản lý VM thông qua Ansible playbooks"
            />
          </div>
        </div>
        
        <div className="text-sm text-blue-200 mt-6 pt-4 border-t border-blue-600">
          <p>© 2025 iDEVOPS | Powered by Ansible & VMware</p>
        </div>
      </div>
      
      {/* Right side - Login Form */}
      <div className="md:w-1/2 bg-gray-50 h-full p-6 md:p-8 flex items-center justify-center overflow-auto">
        <div className="w-full max-w-md">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Kết nối đến vCenter Server
            </h2>
            <p className="text-gray-600">
              Vui lòng nhập thông tin cấu hình để bắt đầu quản lý máy ảo
            </p>
          </div>
          
          <div className="bg-white rounded-xl shadow-xl p-6 border border-gray-100">
            {isLoading ? (
              <div className="text-center py-8">
                <RefreshCw className="h-12 w-12 text-blue-500 mx-auto mb-4 animate-spin" />
                <p className="text-gray-700 font-medium">Đang kết nối...</p>
              </div>
            ) : (
              <VCenterConfig 
                onSubmit={handleConnect} 
                isLoading={isLoading}
                // Không truyền connectionError để không hiển thị trong form
              />
            )}
          </div>
          
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-500 mb-2">
              Thông tin đăng nhập mặc định: vcenter.example.com / administrator@vsphere.local
            </p>
            <a 
              href="https://docs.vmware.com/en/VMware-vSphere/index.html" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 transition-colors"
            >
              Tài liệu về vCenter <ExternalLink className="h-3.5 w-3.5 ml-1" />
            </a>
          </div>
        </div>
      </div>
      
      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600"></div>
    </div>
  );
};

// Feature component for the left panel - Made more compact
const Feature = ({ icon, title, description }) => (
  <div className="flex items-start">
    <div className="mr-3 p-1.5 bg-blue-800 bg-opacity-50 rounded-lg">
      {icon}
    </div>
    <div>
      <h3 className="font-semibold text-white mb-0.5 text-sm">{title}</h3>
      <p className="text-blue-200 text-xs">{description}</p>
    </div>
  </div>
);

export default LoginPage;