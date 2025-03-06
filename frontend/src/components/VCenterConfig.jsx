import React, { useState } from 'react';
import { RefreshCw, Server } from 'lucide-react';
import styles from '../styles/components/VCenterConfig.module.css';
import btnStyles from '../styles/common/buttons.module.css';
import { VCENTER_DEFAULT_CONFIG } from '../config/apiConfig';

const VCenterConfig = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState({
    hostname: '',
    username: '',
    password: '',
    datacenter: '',
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
        <div className={styles.header}>
          <h2 className={styles.title}>
            Kết nối đến vCenter Server
          </h2>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className={styles.formGrid}>
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
            
            <div className={styles.formField}>
              <label className={styles.label}>Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={styles.input}
                placeholder="Password"
                required
                disabled={isLoading}
              />
            </div>
            
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
                  Kết nối
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