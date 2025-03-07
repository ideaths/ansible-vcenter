import React from 'react';
import { Server, Shield, Database, Activity, ExternalLink, RefreshCw } from 'lucide-react';
import VCenterConfig from '../components/VCenterConfig';

const LoginPage = ({ onConnect, isLoading }) => {
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left side - Brand/Info Panel */}
      <div className="bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-900 md:w-1/2 p-8 md:p-12 flex flex-col justify-between text-white">
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
          
          <div className="space-y-6 mt-12 hidden md:block">
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
        
        <div className="text-sm text-blue-200 mt-12 pt-6 border-t border-blue-600">
          <p>© 2025 iDEVOPS | Powered by Ansible & VMware</p>
        </div>
      </div>
      
      {/* Right side - Login Form */}
      <div className="md:w-1/2 bg-gray-50 p-8 md:p-12 flex items-center justify-center">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Kết nối đến vCenter Server
            </h2>
            <p className="text-gray-600">
              Vui lòng nhập thông tin cấu hình để bắt đầu quản lý máy ảo
            </p>
          </div>
          
          <div className="bg-white rounded-xl shadow-xl p-8 border border-gray-100">
            {isLoading ? (
              <div className="text-center py-8">
                <RefreshCw className="h-12 w-12 text-blue-500 mx-auto mb-4 animate-spin" />
                <p className="text-gray-700 font-medium">Đang kết nối...</p>
              </div>
            ) : (
              <VCenterConfig onSubmit={onConnect} isLoading={isLoading} />
            )}
          </div>
          
          <div className="mt-6 text-center">
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

// Feature component for the left panel
const Feature = ({ icon, title, description }) => (
  <div className="flex items-start">
    <div className="mr-4 p-2 bg-blue-800 bg-opacity-50 rounded-lg">
      {icon}
    </div>
    <div>
      <h3 className="font-semibold text-white mb-1">{title}</h3>
      <p className="text-blue-200 text-sm">{description}</p>
    </div>
  </div>
);

export default LoginPage;