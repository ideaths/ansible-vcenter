import React from 'react';
import { useSelector } from 'react-redux';
import styles from '../styles/components/LoadingOverlay.module.css';

const LoadingOverlay = ({ taskPower, powerMessage }) => {
  const { isLoading, message } = useSelector((state) => state.loading);
  
  // Nếu đang thực hiện thao tác power riêng (không phải thông qua Redux)
  if (taskPower) {
    return (
      <div className={styles.overlay}>
        <div className={styles.container}>
          <div className={styles.spinner}></div>
          <p className={styles.message}>{powerMessage || 'Đang thực hiện thao tác nguồn...'}</p>
        </div>
      </div>
    );
  }
  
  // Nếu không có hoạt động loading nào, không hiển thị gì
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