import React, { useState, useEffect } from 'react';
import { XCircle, Server, RefreshCw, ServerOff } from 'lucide-react';
import styles from '../styles/components/VCenterConfig.module.css';
import btnStyles from '../styles/common/buttons.module.css';
import { VCENTER_DEFAULT_CONFIG } from '../config/apiConfig';

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
    <div className={styles.overlay}>
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.header}>
            <h2 className={styles.title}>
              {isConnected ? 'Cấu hình kết nối vCenter hiện tại' : 'Cấu hình kết nối vCenter'}
            </h2>
            <button 
              onClick={onCancel}
              className={btnStyles.iconBtn}
              disabled={isLoading}
              type="button"
            >
              <XCircle className="h-6 w-6" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className={styles.formGrid}>
              {/* vCenter Hostname */}
              <div className={styles.formField}>
                <label className={styles.label}>vCenter Hostname</label>
                <input
                  type="text"
                  name="hostname"
                  value={formData.hostname}
                  onChange={handleChange}
                  className={styles.input}
                  placeholder={VCENTER_DEFAULT_CONFIG.hostname}
                  required
                  disabled={isLoading}
                />
              </div>
              
              {/* Username */}
              <div className={styles.formField}>
                <label className={styles.label}>Username</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className={styles.input}
                  placeholder="administrator@vsphere.local"
                  required
                  disabled={isLoading}
                />
              </div>
              
              {/* Password */}
              <div className={styles.formField}>
                <label className={styles.label}>Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={styles.input}
                  placeholder="Password"
                  required={!isConnected}
                  disabled={isLoading}
                />
                {isConnected && !formData.password && (
                  <p className={styles.hint}>
                    Để trống để giữ mật khẩu hiện tại
                  </p>
                )}
              </div>
              
              {/* Datacenter */}
              <div className={styles.formField}>
                <label className={styles.label}>Datacenter</label>
                <input
                  type="text"
                  name="datacenter"
                  value={formData.datacenter}
                  onChange={handleChange}
                  className={styles.input}
                  placeholder="Home"
                  required
                  disabled={isLoading}
                />
              </div>
              
              {/* Validate Certs */}
              <div className={`${styles.formField} flex items-center md:col-span-2`}>
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
                  Xác thực chứng chỉ SSL
                </label>
              </div>
            </div>
            
            <div className={styles.footer}>
              {isConnected && (
                <button
                  type="button"
                  onClick={onDisconnect}
                  className={btnStyles.btnDanger}
                  disabled={isLoading}
                >
                  <ServerOff className="h-4 w-4 mr-2" />
                  Ngắt kết nối
                </button>
              )}
              <button
                type="button"
                onClick={onCancel}
                className={btnStyles.btnSecondary}
                disabled={isLoading}
              >
                Hủy
              </button>
              <button
                type="submit"
                className={btnStyles.btnPrimary}
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