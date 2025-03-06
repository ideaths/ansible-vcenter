import React from 'react';
import { Plus, Play, Server, ServerOff } from 'lucide-react';

const VMToolbar = ({
  vCenterConfig,
  vCenterConnected,
  showLogs,
  setShowLogs,
  onAddVM,
  onRunAnsible,
  taskRunning
}) => {
  return (
    <div className="p-4 border-b flex justify-between items-center bg-white shadow-sm">
      <div className="flex items-center">
        <h2 className="text-xl font-semibold mr-4 text-gray-800">Danh sách máy ảo</h2>
        <div className="flex items-center text-sm bg-gray-50 px-3 py-1.5 rounded-full border">
          <span className="mr-2 font-medium">vCenter:</span>
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

      <div className="flex gap-3">
        <button
          onClick={() => setShowLogs(!showLogs)}
          className={`px-4 py-2.5 rounded-md shadow-sm border transition-colors ${
            showLogs
              ? 'bg-gray-700 text-white border-gray-600 hover:bg-gray-800'
              : 'bg-gray-100 hover:bg-gray-200 border-gray-300'
          }`}
          disabled={taskRunning}
        >
          {showLogs ? 'Ẩn logs' : 'Hiện logs'}
        </button>

        <button
          onClick={onAddVM}
          className="flex items-center px-4 py-2.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 shadow-sm transition-colors"
          disabled={taskRunning || !vCenterConnected}
        >
          <Plus className="mr-2 h-4 w-4" />
          Thêm VM mới
        </button>

        <button
          onClick={onRunAnsible}
          className="flex items-center px-4 py-2.5 bg-green-600 text-white rounded-md hover:bg-green-700 shadow-sm transition-colors"
          disabled={taskRunning || !vCenterConnected}
        >
          <Play className="mr-2 h-4 w-4" />
          Chạy Ansible
        </button>
      </div>
    </div>
  );
};

export default VMToolbar;
