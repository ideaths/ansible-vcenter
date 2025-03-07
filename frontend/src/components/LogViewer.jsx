// LogViewer.jsx - Panel logs nâng cao
import React, { useEffect, useRef } from 'react';
import { XCircle, RefreshCw } from 'lucide-react';

const EnhancedLogViewer = ({ logs, isLoading, onClose }) => {
  const logEndRef = useRef(null);
  const logContainerRef = useRef(null);
  
  useEffect(() => {
    if (logEndRef.current && logContainerRef.current) {
      const container = logContainerRef.current;
      container.scrollTop = container.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 animate-fadeIn">
      <div className="bg-gray-900 rounded-lg shadow-2xl w-full max-w-3xl mx-4 flex flex-col animate-scaleIn overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b border-gray-800 bg-gradient-to-r from-gray-800 to-gray-900">
          <h3 className="text-xl font-semibold text-white">Logs</h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white hover:bg-gray-700 rounded-full p-1 transition-colors"
          >
            <XCircle className="h-5 w-5" />
          </button>
        </div>
        
        <div 
          ref={logContainerRef} 
          className="p-4 space-y-1 font-mono text-sm overflow-y-auto text-gray-300 bg-gray-900 flex-grow custom-scrollbar"
          style={{ maxHeight: '60vh' }}
        >
          {logs.length > 0 ? (
            logs.map((log, index) => (
              <div key={index} className="py-2 border-b border-gray-800 opacity-0 animate-fadeInUp" style={{ animationDelay: `${index * 0.05}s`, animationFillMode: 'forwards' }}>
                <span className="text-gray-500">[{new Date().toLocaleTimeString()}]</span> {log}
              </div>
            ))
          ) : (
            <div className="py-2 text-gray-500">Chưa có log nào</div>
          )}
          
          {isLoading && (
            <div className="py-2 flex items-center text-blue-400">
              <RefreshCw className="animate-spin h-4 w-4 mr-2" />
              Đang thực thi...
            </div>
          )}
          <div ref={logEndRef} />
        </div>
      </div>
    </div>
  );
};

