import React, { useEffect } from 'react';
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';
import styles from '../styles/components/Toast.module.css';

const Toast = ({ message, onClose }) => {
  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(onClose, 5000);
      return () => clearTimeout(timer);
    }
  }, [message, onClose]);

  if (!message.text) return null;

  const icons = {
    error: <AlertCircle className="h-5 w-5" />,
    success: <CheckCircle className="h-5 w-5" />,
    info: <Info className="h-5 w-5" />
  };

  return (
    <div className={styles.toastContainer}>
      <div className={`${styles.toast} ${styles[message.type || 'info']}`}>
        {icons[message.type || 'info']}
        <p className={styles.message}>{message.text}</p>
        <button onClick={onClose} className={styles.closeButton}>
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default Toast;
