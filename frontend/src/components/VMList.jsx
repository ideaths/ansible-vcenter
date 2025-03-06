import React, { useState, useMemo } from 'react';
import { Trash2, Edit, Play, Square, Plus, Settings, Server, ServerOff, Search, Filter, X } from 'lucide-react';

const VMList = ({ 
  vms, 
  loading, 
  vCenterConfig, 
  vCenterConnected, 
  showLogs, 
  setShowLogs, 
  onAddVM, 
  onEditVM, 
  onDeleteVM, 
  onPowerAction, 
  onConfigVCenter,
  taskRunning 
}) => {
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [guestOSFilter, setGuestOSFilter] = useState('all');

  // Guest OS mapping for readability and filtering
  const guestOSMap = {
    'rhel8_64Guest': 'RHEL 8 (64-bit)',
    'ubuntu64Guest': 'Ubuntu Linux (64-bit)',
    'windows9Server64Guest': 'Windows Server 2019 (64-bit)'
  };

  // Filtered and searched VMs
  const filteredVMs = useMemo(() => {
    return vms.filter(vm => {
      // Search filter
      const matchesSearch = searchTerm.toLowerCase() === '' || 
        vm.vm_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vm.ip.toLowerCase().includes(searchTerm.toLowerCase());

      // Status filter
      const matchesStatus = statusFilter === 'all' || 
        (statusFilter === 'running' && vm.status === 'running') ||
        (statusFilter === 'stopped' && vm.status !== 'running');

      // Guest OS filter
      const matchesGuestOS = guestOSFilter === 'all' || 
        guestOSMap[vm.guest_id] === guestOSFilter;

      return matchesSearch && matchesStatus && matchesGuestOS;
    });
  }, [vms, searchTerm, statusFilter, guestOSFilter]);

  // Reset all filters
  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setGuestOSFilter('all');
  };

  return (
    <div className="bg-white rounded-lg shadow">
      {/* vCenter Status and Toolbar */}
      <div className="p-4 border-b flex justify-between items-center">
        <div className="flex items-center">
          <h2 className="text-xl font-semibold mr-4">Danh sách máy ảo</h2>
          <div className="flex items-center text-sm">
            <span className="mr-2">vCenter:</span>
            {vCenterConnected ? (
              <span className="flex items-center text-green-600">
                <Server className="h-4 w-4 mr-1" />
                {vCenterConfig.hostname}
              </span>
            ) : (
              <span className="flex items-center text-red-600">
                <ServerOff className="h-4 w-4 mr-1" />
                Chưa kết nối
              </span>
            )}
          </div>
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={onConfigVCenter} 
            className="flex items-center px-3 py-2 bg-gray-200 rounded hover:bg-gray-300"
            disabled={taskRunning}
          >
            <Settings className="mr-1 h-4 w-4" />
            Cấu hình vCenter
          </button>
          
          <button 
            onClick={() => setShowLogs(!showLogs)} 
            className={`px-3 py-2 rounded ${showLogs ? 'bg-gray-500 text-white' : 'bg-gray-200'}`}
            disabled={taskRunning}
          >
            Logs
          </button>
          
          <button 
            onClick={onAddVM} 
            className="flex items-center px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            disabled={taskRunning || !vCenterConnected}
          >
            <Plus className="mr-1 h-4 w-4" />
            Thêm VM mới
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="p-4 bg-gray-50 flex items-center space-x-2">
        {/* Search Input */}
        <div className="relative flex-grow">
          <input 
            type="text" 
            placeholder="Tìm kiếm VM (tên hoặc IP)..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Status Filter */}
        <select 
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="running">Đang chạy</option>
          <option value="stopped">Đã dừng</option>
        </select>

        {/* Guest OS Filter */}
        <select 
          value={guestOSFilter}
          onChange={(e) => setGuestOSFilter(e.target.value)}
          className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Tất cả OS</option>
          {Object.entries(guestOSMap).map(([key, value]) => (
            <option key={key} value={value}>{value}</option>
          ))}
        </select>

        {/* Reset Filters */}
        {(searchTerm !== '' || statusFilter !== 'all' || guestOSFilter !== 'all') && (
          <button 
            onClick={resetFilters}
            className="px-3 py-2 bg-gray-200 rounded hover:bg-gray-300 flex items-center"
            title="Đặt lại bộ lọc"
          >
            <Filter className="mr-1 h-4 w-4" />
            Đặt lại
          </button>
        )}
      </div>

      {/* VM Table */}
      {loading ? (
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-700 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải dữ liệu...</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-700 uppercase">
              <tr>
                <th className="px-6 py-3">Tên VM</th>
                <th className="px-6 py-3">CPU</th>
                <th className="px-6 py-3">RAM (MB)</th>
                <th className="px-6 py-3">Disk (GB)</th>
                <th className="px-6 py-3">IP</th>
                <th className="px-6 py-3">Guest OS</th>
                <th className="px-6 py-3">Trạng thái</th>
                <th className="px-6 py-3">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredVMs.length > 0 ? (
                filteredVMs.map((vm) => (
                  <tr key={vm.vm_name} className="bg-white border-b hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium">{vm.vm_name}</td>
                    <td className="px-6 py-4">{vm.num_cpus}</td>
                    <td className="px-6 py-4">{vm.memory_mb}</td>
                    <td className="px-6 py-4">{vm.disk_size_gb}</td>
                    <td className="px-6 py-4">{vm.ip}</td>
                    <td className="px-6 py-4">
                      {guestOSMap[vm.guest_id] || 'Không xác định'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        vm.status === 'running' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {vm.status === 'running' ? 'Đang chạy' : 'Đã dừng'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        {vm.status === 'running' ? (
                          <button 
                            onClick={() => onPowerAction(vm, 'stop')}
                            className="text-amber-600 hover:text-amber-900"
                            disabled={taskRunning || !vCenterConnected}
                            title="Dừng VM"
                          >
                            <Square className="h-4 w-4" />
                          </button>
                        ) : (
                          <button 
                            onClick={() => onPowerAction(vm, 'start')}
                            className="text-green-600 hover:text-green-900"
                            disabled={taskRunning || !vCenterConnected}
                            title="Khởi động VM"
                          >
                            <Play className="h-4 w-4" />
                          </button>
                        )}
                        <button 
                          onClick={() => onEditVM(vm)}
                          className="text-blue-600 hover:text-blue-900"
                          disabled={taskRunning || !vCenterConnected}
                          title="Chỉnh sửa VM"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => onDeleteVM(vm)}
                          className="text-red-600 hover:text-red-900"
                          disabled={taskRunning || !vCenterConnected}
                          title="Xóa VM"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="px-6 py-4 text-center">
                    {vCenterConnected ? 
                      (filteredVMs.length === 0 && (searchTerm || statusFilter !== 'all' || guestOSFilter !== 'all') 
                        ? 'Không tìm thấy máy ảo phù hợp với bộ lọc' 
                        : 'Không có VM nào. Hãy thêm VM mới để bắt đầu.') : 
                      'Vui lòng kết nối vCenter để xem danh sách VM.'
                    }
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Search Results Summary */}
      {!loading && filteredVMs.length > 0 && (
        <div className="p-4 bg-gray-50 text-sm text-gray-600 border-t">
          Tìm thấy {filteredVMs.length} máy ảo
        </div>
      )}
    </div>
  );
};

export default VMList;