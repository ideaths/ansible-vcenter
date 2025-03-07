// VMTable.jsx - Component bảng VM được cải tiến
import React from 'react';
import { Play, Square, Edit, Trash2, PowerOff, RotateCcw } from 'lucide-react'; 

const EnhancedVMTable = ({
  vms,
  loading,
  currentPage,
  pageSize,
  guestOSMap,
  vCenterConnected,
  taskRunning,
  taskPower,
  onEditVM,
  onDeleteVM,
  onPowerAction,
  onAddVM,
  onRestoreVM,
  onMessage
}) => {
  // Hàm xác định class cho trạng thái VM (giữ nguyên logic)
  const getVMStatusDisplay = (vm) => {
    if (vm.status === 'on' && vm.action === 'apply') {
      return {
        text: 'Đang chạy',
        className: 'bg-green-100 text-green-800 border border-green-200'
      };
    } else if (vm.status === 'off' && vm.action === 'apply') {
      return {
        text: 'Đang dừng',
        className: 'bg-gray-100 text-gray-700 border border-gray-200'
      };
    } else if (vm.action === 'destroy') {
      return {
        text: 'Deleted',
        className: 'bg-red-100 text-red-800 border border-red-200'
      };
    }
    return {
      text: 'Không xác định',
      className: 'bg-gray-100 text-gray-600 border border-gray-200'
    };
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-700 mx-auto mb-4"></div>
        <p className="text-gray-600">Đang tải dữ liệu...</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left border-separate border-spacing-0">
        <thead className="bg-gray-50 text-gray-700 uppercase text-xs">
          <tr>
            <th className="px-3 py-3 border-b text-center w-12 sticky top-0 z-10">#</th>
            <th className="px-4 py-3 border-b sticky top-0 z-10">Tên VM</th>
            <th className="px-4 py-3 border-b text-center w-16 sticky top-0 z-10">CPU</th>
            <th className="px-4 py-3 border-b text-center w-24 sticky top-0 z-10">RAM (MB)</th>
            <th className="px-4 py-3 border-b text-center w-24 sticky top-0 z-10">Disk (GB)</th>
            <th className="px-4 py-3 border-b sticky top-0 z-10">IP</th>
            <th className="px-4 py-3 border-b sticky top-0 z-10">Guest OS</th>
            <th className="px-4 py-3 border-b text-center w-32 sticky top-0 z-10">Trạng thái</th>
            <th className="px-4 py-3 border-b text-center w-24 sticky top-0 z-10">Hành động</th>
          </tr>
        </thead>
        <tbody>
          {vms.length > 0 ? (
            vms.map((vm, index) => {
              const statusDisplay = getVMStatusDisplay(vm);
              
              return (
                <tr key={`${vm.vm_name}-${index}`} className="transition-colors hover:bg-blue-50">
                  <td className="px-3 py-3.5 border-b text-center text-gray-500 font-mono">
                    {(currentPage - 1) * pageSize + index + 1}
                  </td>
                  <td className="px-4 py-3.5 border-b font-medium text-blue-700 hover:text-blue-800 cursor-pointer transition-colors">
                    {vm.vm_name}
                  </td>
                  <td className="px-4 py-3.5 border-b text-center">{vm.num_cpus}</td>
                  <td className="px-4 py-3.5 border-b text-center">{vm.memory_mb}</td>
                  <td className="px-4 py-3.5 border-b text-center">{vm.disk_size_gb}</td>
                  <td className="px-4 py-3.5 border-b font-mono">{vm.ip}</td>
                  <td className="px-4 py-3.5 border-b">
                    {vm.guest_id && guestOSMap[vm.guest_id] ? guestOSMap[vm.guest_id] : 'Không xác định'}
                  </td>
                  <td className="px-4 py-3.5 border-b text-center">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium inline-flex items-center ${statusDisplay.className}`}>
                      {statusDisplay.text}
                    </span>
                    
                    {/* Tags display */}
                    {vm.tags && (
                      <div className="mt-1.5 flex flex-wrap gap-1 justify-center">
                        {vm.tags.split(',').filter(Boolean).map(tag => (
                          <span key={tag} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-blue-50 text-blue-700 border border-blue-100 hover:bg-blue-100 transition-all">
                            {tag.trim()}
                          </span>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3.5 border-b">
                    <div className="flex items-center justify-center space-x-1.5">
                      {/* Power Actions */}
                      {vm.status === 'on' ? (
                        <button 
                          onClick={() => onPowerAction(vm, 'stop')}
                          className={`p-1.5 rounded-full transition-all hover:-translate-y-0.5 text-amber-600 hover:text-amber-800 hover:bg-amber-50 ${vm.action !== 'apply' ? 'opacity-50 cursor-not-allowed' : ''}`}
                          disabled={taskPower || !vCenterConnected || vm.action !== 'apply'}
                          title={vm.action !== 'apply' ? 'Không thể dừng VM có trạng thái "destroy"' : 'Dừng VM (Chạy Ansible ngay lập tức)'}
                        >
                          <Square className="h-4 w-4" />
                        </button>
                      ) : (
                        <button 
                          onClick={() => onPowerAction(vm, 'start')}
                          className={`p-1.5 rounded-full transition-all hover:-translate-y-0.5 text-green-600 hover:text-green-800 hover:bg-green-50 ${vm.action !== 'apply' ? 'opacity-50 cursor-not-allowed' : ''}`}
                          disabled={taskPower || !vCenterConnected || vm.action !== 'apply'}
                          title={vm.action !== 'apply' ? 'Không thể khởi động VM có trạng thái "destroy"' : 'Khởi động VM (Chạy Ansible ngay lập tức)'}
                        >
                          <Play className="h-4 w-4" />
                        </button>
                      )}

                      {/* Delete button - show when action is 'apply' */}
                      {vm.action === 'apply' && (
                        <button 
                          onClick={() => onDeleteVM(vm)}
                          className="p-1.5 rounded-full transition-all hover:-translate-y-0.5 text-red-600 hover:text-red-800 hover:bg-red-50"
                          disabled={taskRunning || !vCenterConnected}
                          title="Xóa VM"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}

                      {/* Restore button - show when action is 'destroy' */}
                      {vm.action === 'destroy' && (
                        <button 
                          onClick={() => onRestoreVM(vm)}
                          className="p-1.5 rounded-full transition-all hover:-translate-y-0.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                          disabled={taskRunning || !vCenterConnected}
                          title="Khôi phục VM"
                        >
                          <RotateCcw className="h-4 w-4" />
                        </button>
                      )}

                      {/* Edit button - always show */}
                      <button 
                        onClick={() => onEditVM(vm)}
                        className="p-1.5 rounded-full transition-all hover:-translate-y-0.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                        disabled={taskRunning || !vCenterConnected}
                        title="Chỉnh sửa VM"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan="9" className="px-4 py-6 text-center text-gray-500">
                {vCenterConnected ? 
                  'Không có VM nào. Hãy thêm VM mới để bắt đầu.' : 
                  'Vui lòng kết nối vCenter để xem danh sách VM.'
                }
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
