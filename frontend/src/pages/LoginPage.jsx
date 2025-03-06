import React from 'react';
import VCenterConfig from '../components/VCenterConfig';
import styles from '../styles/pages/LoginPage.module.css';

const LoginPage = ({ onConnect, isLoading }) => {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.title}>Kết nối đến vCenter</h1>
        <p className={styles.subtitle}>Vui lòng nhập thông tin cấu hình để kết nối đến vCenter Server</p>
      </div>
      <div className={styles.formWrapper}>
        <VCenterConfig onSubmit={onConnect} isLoading={isLoading} />
      </div>
    </div>
  );
};

export default LoginPage;
