import React, { useEffect, useRef } from 'react';
import { XCircle, RefreshCw } from 'lucide-react';
import styles from '../styles/components/LogViewer.module.css';
import btnStyles from '../styles/common/buttons.module.css';

const LogViewer = ({ logs, isLoading, onClose }) => {
  const logEndRef = useRef(null);
  const logContainerRef = useRef(null);
  
  // Auto-scroll to bottom when logs change, but only within the log container
  useEffect(() => {
    if (logEndRef.current && logContainerRef.current) {
      // Use scrollTop instead of scrollIntoView to prevent page scrolling
      const container = logContainerRef.current;
      container.scrollTop = container.scrollHeight;
    }
  }, [logs]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>Logs</h3>
        <button 
          onClick={onClose}
          className={btnStyles.iconBtn}
          title="Đóng"
        >
          <XCircle className="h-5 w-5" />
        </button>
      </div>
      
      <div ref={logContainerRef} className={styles.logContainer}>
        {logs.length > 0 ? (
          logs.map((log, index) => (
            <LogEntry key={index} log={log} />
          ))
        ) : (
          <EmptyState />
        )}
        
        {isLoading && <LoadingIndicator />}
        <div ref={logEndRef} />
      </div>
    </div>
  );
};

const LogEntry = ({ log }) => (
  <div className={styles.logEntry}>
    <span className={styles.timestamp}>[{new Date().toLocaleTimeString()}]</span> {log}
  </div>
);

const EmptyState = () => (
  <div className={styles.emptyState}>Chưa có log nào</div>
);

const LoadingIndicator = () => (
  <div className={styles.loadingIndicator}>
    <RefreshCw className="animate-spin h-4 w-4 mr-2" />
    Đang thực thi...
  </div>
);

export default LogViewer;