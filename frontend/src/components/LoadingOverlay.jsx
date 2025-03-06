import React from 'react';
import { useSelector } from 'react-redux';
import styles from '../styles/components/LoadingOverlay.module.css';

const LoadingOverlay = () => {
  const { isLoading, message } = useSelector((state) => state.loading);

  if (!isLoading) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.container}>
        <div className={styles.spinner}></div>
        <p className={styles.message}>{message || 'Đang xử lý...'}</p>
      </div>
    </div>
  );
};

export default LoadingOverlay;