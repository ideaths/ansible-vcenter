import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AlertCircle, CheckCircle, Info, X, AlertTriangle } from 'lucide-react';
import styles from '../styles/components/Toast.module.css';

// Giới hạn số lượng toast hiển thị cùng lúc
const MAX_TOASTS = 3;
// Thời gian tối thiểu giữa các thông báo giống nhau (ms)
const MIN_DUPLICATE_INTERVAL = 2000;

// Component Toast chính
const Toast = ({ toasts, removeToast }) => {
  // Chỉ hiển thị MAX_TOASTS toast mới nhất
  const visibleToasts = toasts.slice(-MAX_TOASTS);
  
  return (
    <div className={styles.toastContainer}>
      {visibleToasts.map((toast) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
};

// Component cho từng toast riêng lẻ
const ToastItem = ({ toast, onClose }) => {
  const [isExiting, setIsExiting] = useState(false);
  const timerRef = useRef(null);
  
  // Xử lý tự động đóng toast sau một khoảng thời gian
  useEffect(() => {
    if (toast.autoClose !== false) {
      const timeout = toast.autoClose || 5000;
      timerRef.current = setTimeout(() => {
        handleClose();
      }, timeout);
    }
    
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [toast.autoClose]);
  
  // Xử lý animation khi đóng
  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClose();
    }, 300); // Thời gian của animation fadeOut
  };
  
  // Dừng timer khi hover vào toast
  const handleMouseEnter = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  };
  
  // Khởi động lại timer khi rời chuột khỏi toast
  const handleMouseLeave = () => {
    if (toast.autoClose !== false) {
      const timeout = toast.autoClose || 5000;
      timerRef.current = setTimeout(() => {
        handleClose();
      }, timeout);
    }
  };
  
  // Chọn icon phù hợp dựa vào type
  const getIcon = () => {
    switch (toast.type) {
      case 'error':
        return <AlertCircle className={styles.icon} size={18} />;
      case 'success':
        return <CheckCircle className={styles.icon} size={18} />;
      case 'warning':
        return <AlertTriangle className={styles.icon} size={18} />;
      case 'info':
      default:
        return <Info className={styles.icon} size={18} />;
    }
  };

  return (
    <div 
      className={`${styles.toast} ${styles[toast.type || 'info']} ${isExiting ? styles.exit : ''}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {getIcon()}
      
      <div className={styles.content}>
        {toast.title && <div className={styles.title}>{toast.title}</div>}
        <div className={styles.message}>{toast.message}</div>
      </div>
      
      <button className={styles.closeButton} onClick={handleClose} aria-label="Close">
        <X size={16} />
      </button>
    </div>
  );
};

// Hook để sử dụng Toast trong toàn bộ ứng dụng
export const useToast = () => {
  const [toasts, setToasts] = useState([]);
  // Sử dụng Map để theo dõi thời gian hiển thị của mỗi loại thông báo
  const toastTimestampsRef = useRef(new Map());
  
  // Xóa toast theo ID
  const removeToast = useCallback((id) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  }, []);
  
  // Thêm toast mới (với kiểm tra trùng lặp)
  const addToast = useCallback((toast) => {
    const now = Date.now();
    // Tạo hash message để kiểm tra trùng lặp
    const messageHash = `${toast.type}_${toast.message}`;
    
    // Kiểm tra xem message này đã hiển thị gần đây chưa
    const lastShown = toastTimestampsRef.current.get(messageHash);
    if (lastShown && (now - lastShown < MIN_DUPLICATE_INTERVAL)) {
      return null; // Không tạo toast mới nếu trùng lặp quá gần nhau
    }
    
    // Cập nhật thời gian hiển thị cuối cùng
    toastTimestampsRef.current.set(messageHash, now);
    
    const newToast = {
      id: `toast_${now}_${Math.floor(Math.random() * 1000)}`,
      autoClose: 5000,
      ...toast
    };
    
    setToasts((prevToasts) => {
      // Nếu đã đạt số lượng tối đa, loại bỏ toast cũ nhất
      if (prevToasts.length >= MAX_TOASTS) {
        return [...prevToasts.slice(1), newToast];
      }
      return [...prevToasts, newToast];
    });
    
    return newToast.id;
  }, []);
  
  // Xóa tất cả toast
  const clearToasts = useCallback(() => {
    setToasts([]);
    toastTimestampsRef.current.clear();
  }, []);
  
  // Các shorthand methods
  const error = useCallback((message, options = {}) => 
    addToast({ message, type: 'error', ...options }), [addToast]);
    
  const success = useCallback((message, options = {}) => 
    addToast({ message, type: 'success', ...options }), [addToast]);
    
  const info = useCallback((message, options = {}) => 
    addToast({ message, type: 'info', ...options }), [addToast]);
    
  const warning = useCallback((message, options = {}) => 
    addToast({ message, type: 'warning', ...options }), [addToast]);
  
  return {
    toasts,
    addToast,
    removeToast,
    clearToasts,
    error,
    success,
    info,
    warning
  };
};

export default Toast;