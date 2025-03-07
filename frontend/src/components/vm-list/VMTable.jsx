import React from 'react';
import { Play, Square, Edit, Trash2, RotateCcw } from 'lucide-react'; 

const VMTable = ({
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
  // Fonction pour déterminer la classe d'état
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

  // Style commun pour les boutons d'action
  const actionButtonStyle = {
    transition: 'all 0.15s ease',
    borderRadius: '9999px',
    padding: '0.375rem'
  };

  // Style hover pour les boutons d'action
  const getHoverStyle = (color) => ({
    transform: 'translateY(-2px)',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    backgroundColor: color
  });

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
            <th className="px-3 py-3 border-b text-center w-12 sticky top-0 z-10 font-semibold">#</th>
            <th className="px-4 py-3 border-b sticky top-0 z-10 font-semibold">Tên VM</th>
            <th className="px-4 py-3 border-b text-center w-16 sticky top-0 z-10 font-semibold">CPU</th>
            <th className="px-4 py-3 border-b text-center w-24 sticky top-0 z-10 font-semibold">RAM (MB)</th>
            <th className="px-4 py-3 border-b text-center w-24 sticky top-0 z-10 font-semibold">Disk (GB)</th>
            <th className="px-4 py-3 border-b sticky top-0 z-10 font-semibold">IP</th>
            <th className="px-4 py-3 border-b sticky top-0 z-10 font-semibold">Guest OS</th>
            <th className="px-4 py-3 border-b text-center w-32 sticky top-0 z-10 font-semibold">Trạng thái</th>
            <th className="px-4 py-3 border-b text-center w-24 sticky top-0 z-10 font-semibold">Hành động</th>
          </tr>
        </thead>
        <tbody>
          {vms.length > 0 ? (
            vms.map((vm, index) => {
              const statusDisplay = getVMStatusDisplay(vm);
              
              return (
                <tr 
                  key={`${vm.vm_name}-${index}`} 
                  className="transition-all hover:bg-blue-50"
                  style={{ transition: 'background-color 0.15s ease' }}
                >
                  <td className="px-3 py-3.5 border-b text-center text-gray-500 font-mono">
                    {(currentPage - 1) * pageSize + index + 1}
                  </td>
                  <td className="px-4 py-3.5 border-b font-medium text-blue-700">
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
                    <span 
                      className={`px-2.5 py-1 rounded-full text-xs font-medium inline-flex items-center ${statusDisplay.className}`}
                      style={{ transition: 'all 0.2s ease' }}
                    >
                      {statusDisplay.text}
                    </span>
                    
                    {/* Tags display */}
                    {vm.tags && (
                      <div className="mt-1.5 flex flex-wrap gap-1 justify-center">
                        {vm.tags.split(',').filter(Boolean).map(tag => (
                          <span 
                            key={tag} 
                            className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-blue-50 text-blue-700 border border-blue-100"
                            style={{ 
                              transition: 'all 0.15s ease',
                            }}
                            onMouseOver={(e) => {
                              e.currentTarget.style.backgroundColor = '#dbeafe';
                              e.currentTarget.style.transform = 'translateY(-1px)';
                            }}
                            onMouseOut={(e) => {
                              e.currentTarget.style.backgroundColor = '#eff6ff';
                              e.currentTarget.style.transform = 'translateY(0)';
                            }}
                          >
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
                          style={actionButtonStyle}
                          className={`text-amber-600 ${vm.action !== 'apply' ? 'opacity-50 cursor-not-allowed' : 'hover:text-amber-800 hover:bg-amber-50'}`}
                          disabled={taskPower || !vCenterConnected || vm.action !== 'apply'}
                          title={vm.action !== 'apply' ? 'Không thể dừng VM có trạng thái "destroy"' : 'Dừng VM (Chạy Ansible ngay lập tức)'}
                          onMouseOver={(e) => {
                            if (vm.action === 'apply' && !taskPower && vCenterConnected) {
                              Object.assign(e.currentTarget.style, getHoverStyle('#fff7ed'));
                            }
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.transform = '';
                            e.currentTarget.style.boxShadow = '';
                            e.currentTarget.style.backgroundColor = '';
                          }}
                        >
                          <Square className="h-4 w-4" />
                        </button>
                      ) : (
                        <button 
                          onClick={() => onPowerAction(vm, 'start')}
                          style={actionButtonStyle}
                          className={`text-green-600 ${vm.action !== 'apply' ? 'opacity-50 cursor-not-allowed' : 'hover:text-green-800 hover:bg-green-50'}`}
                          disabled={taskPower || !vCenterConnected || vm.action !== 'apply'}
                          title={vm.action !== 'apply' ? 'Không thể khởi động VM có trạng thái "destroy"' : 'Khởi động VM (Chạy Ansible ngay lập tức)'}
                          onMouseOver={(e) => {
                            if (vm.action === 'apply' && !taskPower && vCenterConnected) {
                              Object.assign(e.currentTarget.style, getHoverStyle('#ecfdf5'));
                            }
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.transform = '';
                            e.currentTarget.style.boxShadow = '';
                            e.currentTarget.style.backgroundColor = '';
                          }}
                        >
                          <Play className="h-4 w-4" />
                        </button>
                      )}

                      {/* Delete button - show when action is 'apply' */}
                      {vm.action === 'apply' && (
                        <button 
                          onClick={() => onDeleteVM(vm)}
                          style={actionButtonStyle}
                          className="text-red-600 hover:text-red-800 hover:bg-red-50"
                          disabled={taskRunning || !vCenterConnected}
                          title="Xóa VM"
                          onMouseOver={(e) => {
                            if (!taskRunning && vCenterConnected) {
                              Object.assign(e.currentTarget.style, getHoverStyle('#fef2f2'));
                            }
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.transform = '';
                            e.currentTarget.style.boxShadow = '';
                            e.currentTarget.style.backgroundColor = '';
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}

                      {/* Restore button - show when action is 'destroy' */}
                      {vm.action === 'destroy' && (
                        <button 
                          onClick={() => onRestoreVM(vm)}
                          style={actionButtonStyle}
                          className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                          disabled={taskRunning || !vCenterConnected}
                          title="Khôi phục VM"
                          onMouseOver={(e) => {
                            if (!taskRunning && vCenterConnected) {
                              Object.assign(e.currentTarget.style, getHoverStyle('#eff6ff'));
                            }
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.transform = '';
                            e.currentTarget.style.boxShadow = '';
                            e.currentTarget.style.backgroundColor = '';
                          }}
                        >
                          <RotateCcw className="h-4 w-4" />
                        </button>
                      )}

                      {/* Edit button - always show */}
                      <button 
                        onClick={() => onEditVM(vm)}
                        style={actionButtonStyle}
                        className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                        disabled={taskRunning || !vCenterConnected}
                        title="Chỉnh sửa VM"
                        onMouseOver={(e) => {
                          if (!taskRunning && vCenterConnected) {
                            Object.assign(e.currentTarget.style, getHoverStyle('#eff6ff'));
                          }
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.transform = '';
                          e.currentTarget.style.boxShadow = '';
                          e.currentTarget.style.backgroundColor = '';
                        }}
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

export default VMTable;