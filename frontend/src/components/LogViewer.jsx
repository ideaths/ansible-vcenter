import React, { useEffect, useRef } from 'react';
import { XCircle, RefreshCw } from 'lucide-react';

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

  // Create timestamp
  const getTimestamp = () => {
    return new Date().toLocaleTimeString();
  };

  return (
    <div className="bg-gray-800 text-gray-200 rounded-lg shadow p-4 flex flex-col h-64">
      <div className="flex justify-between items-center mb-2 flex-shrink-0">
        <h3 className="text-lg font-semibold">Logs</h3>
        <button 
          onClick={onClose}
          className="text-gray-400 hover:text-white"
        >
          <XCircle className="h-5 w-5" />
        </button>
      </div>
      <div 
        ref={logContainerRef}
        className="space-y-1 font-mono text-sm overflow-y-auto flex-grow"
      >
        {logs.length > 0 ? (
          logs.map((log, index) => (
            <div key={index} className="py-1 border-b border-gray-700">
              <span className="text-gray-500">[{getTimestamp()}]</span> {log}
            </div>
          ))
        ) : (
          <div className="py-2 text-gray-400">Chưa có log nào</div>
        )}
        {isLoading && (
          <div className="flex items-center text-blue-400">
            <RefreshCw className="animate-spin h-4 w-4 mr-2" />
            Đang thực thi...
          </div>
        )}
        <div ref={logEndRef} />
      </div>
    </div>
  );
};

export default LogViewer;