// VMToolbar.jsx - Component Toolbar được cải tiến nhưng vẫn giữ cấu trúc cơ bản
import React from 'react';
import { Play, Plus, Server, ServerOff } from 'lucide-react';

const EnhancedVMToolbar = ({
  vCenterConfig,
  vCenterConnected,
  showLogs,
  setShowLogs,
  onAddVM,
  onRunAnsible,
  taskRunning
}) => {
  return (
    <div className="p-4 border-b flex justify-between items-center bg-white shadow-sm relative">
      {/* Thêm hiệu ứng vi chuyển đổi: thanh ở trên cùng của card */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-blue-700 rounded-t-lg"></div>
      
      <div className="flex items-center z-10">
        <h2 className="text-xl font-semibold mr-4 text-gray-800 tracking-tight">Danh sách máy ảo</h2>
        <div className="flex items-center text-sm bg-gray-50 hover:bg-gray-100 px-3 py-1.5 rounded-full border transition-all duration-200 shadow-sm">
          <span className="mr-2 font-medium text-gray-600">vCenter:</span>
          {vCenterConnected ? (
            <span className="flex items-center text-green-600 font-medium">
              <Server className="h-4 w-4 mr-1" />
              {vCenterConfig.hostname}
            </span>
          ) : (
            <span className="flex items-center text-red-600 font-medium">
              <ServerOff className="h-4 w-4 mr-1" />
              Chưa kết nối
            </span>
          )}
        </div>
      </div>

      <div className="flex gap-3 z-10">
        <button
          onClick={() => setShowLogs(!showLogs)}
          className={`px-4 py-2.5 rounded-md shadow-sm border transition-all duration-200 flex items-center hover:-translate-y-0.5 ${
            showLogs
              ? 'bg-gray-700 text-white border-gray-600 hover:bg-gray-800'
              : 'bg-gray-100 hover:bg-gray-200 border-gray-300 text-gray-700'
          }`}
          disabled={taskRunning}
        >
          {showLogs ? 'Ẩn logs' : 'Hiện logs'}
        </button>

        <button
          onClick={onAddVM}
          className="flex items-center px-4 py-2.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0"
          disabled={taskRunning || !vCenterConnected}
        >
          <Plus className="mr-2 h-4 w-4" />
          Thêm VM mới
        </button>

        <button
          onClick={onRunAnsible}
          className="flex items-center px-4 py-2.5 bg-green-600 text-white rounded-md hover:bg-green-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0"
          disabled={taskRunning || !vCenterConnected}
        >
          <Play className="mr-2 h-4 w-4" />
          Chạy Ansible
        </button>
      </div>
    </div>
  );
};
