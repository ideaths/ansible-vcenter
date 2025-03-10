import React, { useState } from 'react';
import { RefreshCw, Server, Lock, User, Database, Globe, Shield } from 'lucide-react';
import styles from '../styles/components/EnhancedVCenterConfig.module.css';

const VCenterConfig = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState({
    hostname: 'vcenter.example.com',
    username: 'administrator@vsphere.local',
    password: '',
    datacenter: 'Home',
    validateCerts: false
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <form onSubmit={handleSubmit} className={styles.formContainer}>
          <div className={styles.formGrid}>
            <div className={styles.formField}>
              <label className={styles.label}>vCenter Hostname</label>
              <div className={styles.inputWithIcon}>
                <Globe className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  name="hostname"
                  value={formData.hostname}
                  onChange={handleChange}
                  className={`${styles.input} pl-10`}
                  placeholder="vcenter.example.com"
                  required
                  disabled={isLoading}
                />
              </div>
              <p className={styles.helpText}>Địa chỉ máy chủ vCenter của bạn (hostname hoặc IP)</p>
            </div>
            
            <div className={styles.formField}>
              <label className={styles.label}>Username</label>
              <div className={styles.inputWithIcon}>
                <User className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className={`${styles.input} pl-10`}
                  placeholder="administrator@vsphere.local"
                  required
                  disabled={isLoading}
                />
              </div>
              <p className={styles.helpText}>Tài khoản quản trị có quyền truy cập API</p>
            </div>
            
            <div className={styles.formField}>
              <label className={styles.label}>Password</label>
              <div className={styles.inputWithIcon}>
                <Lock className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`${styles.input} pl-10`}
                  placeholder="Nhập mật khẩu"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>
            
            <div className={styles.formField}>
              <label className={styles.label}>Datacenter</label>
              <div className={styles.inputWithIcon}>
                <Database className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  name="datacenter"
                  value={formData.datacenter}
                  onChange={handleChange}
                  className={`${styles.input} pl-10`}
                  placeholder="Home"
                  required
                  disabled={isLoading}
                />
              </div>
              <p className={styles.helpText}>Tên Datacenter trong vCenter của bạn</p>
            </div>
            
            <div className={`${styles.formField} flex items-center`}>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="validateCerts"
                  name="validateCerts"
                  checked={formData.validateCerts}
                  onChange={handleChange}
                  className={styles.checkbox}
                  disabled={isLoading}
                />
                <label htmlFor="validateCerts" className={styles.checkboxLabel}>
                  <div className="flex items-center">
                    <Shield className="h-4 w-4 mr-1 text-gray-500" />
                    Xác thực chứng chỉ SSL
                  </div>
                </label>
              </div>
            </div>
          </div>
          
          <div className={styles.footer}>
            <button
              type="submit"
              className={styles.connectButton}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <RefreshCw className="animate-spin h-5 w-5 mr-2" />
                  Đang kết nối...
                </>
              ) : (
                <>
                  <Server className="h-5 w-5 mr-2" />
                  Kết nối đến vCenter
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VCenterConfig;