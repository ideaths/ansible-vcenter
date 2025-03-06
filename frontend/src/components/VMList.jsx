import React, { useState, useEffect, useMemo } from 'react';
import { Trash2, Edit, Play, Square, Plus, Settings, Server, ServerOff, Search, Filter, X, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

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
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, guestOSFilter]);

  // Guest OS mapping for readability and filtering
  const guestOSMap = {
    'rhel8_64Guest': 'RHEL 8 (64-bit)',
    'ubuntu64Guest': 'Ubuntu Linux (64-bit)',
    'windows9Server64Guest': 'Windows Server 2019 (64-bit)'
  };

  // Filtered and searched VMs
  const filteredVMs = useMemo(() => {
    if (!vms || vms.length === 0) return [];
    
    return vms.filter(vm => {
      // Search filter
      const matchesSearch = !searchTerm || searchTerm.toLowerCase() === '' || 
        (vm.vm_name && vm.vm_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (vm.ip && vm.ip.toLowerCase().includes(searchTerm.toLowerCase()));

      // Status filter
      const matchesStatus = statusFilter === 'all' || 
        (statusFilter === 'running' && vm.status === 'running') ||
        (statusFilter === 'stopped' && vm.status !== 'running');

      // Guest OS filter
      const matchesGuestOS = guestOSFilter === 'all' || 
        (vm.guest_id && guestOSMap[vm.guest_id] === guestOSFilter);

      return matchesSearch && matchesStatus && matchesGuestOS;
    });
  }, [vms, searchTerm, statusFilter, guestOSFilter, guestOSMap]);

  // Paginated data
  const paginatedVMs = useMemo(() => {
    if (!filteredVMs || filteredVMs.length === 0) return [];
    
    const startIndex = (currentPage - 1) * pageSize;
    return filteredVMs.slice(startIndex, startIndex + pageSize);
  }, [filteredVMs, currentPage, pageSize]);

  // Calculate total pages
  const totalPages = Math.max(1, Math.ceil(filteredVMs.length / pageSize));
  
  // Ensure current page is valid
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(Math.max(1, totalPages));
    }
  }, [currentPage, totalPages]);

  // Handle page changes
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      // Scroll to top of the table when changing pages
      const tableElement = document.querySelector('.vm-table-container');
      if (tableElement) {
        tableElement.scrollTop = 0;
      }
    }
  };

  // Handle page size changes
  const handlePageSizeChange = (e) => {
    const newPageSize = Number(e.target.value);
    setPageSize(newPageSize);
    setCurrentPage(1); // Reset to first page when changing page size
  };

  // Reset all filters
  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setGuestOSFilter('all');
    setCurrentPage(1);
  };

  return (
    <div className="bg-white rounded-lg shadow">
      {/* vCenter Status and Toolbar */}
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
            onClick={onConfigVCenter} 
            className="flex items-center px-4 py-2.5 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 border shadow-sm transition-colors"
            disabled={taskRunning}
          >
            <Settings className="mr-2 h-4 w-4" />
            Cấu hình vCenter
          </button>
          
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
        </div>
      </div>

      {/* Filters and Search */}
      <div className="p-4 bg-gray-50 border-b flex items-center space-x-3 flex-wrap">
        {/* Search Input */}
        <div className="relative flex-grow">
          <input 
            type="text" 
            placeholder="Tìm kiếm VM (tên hoặc IP)..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Status Filter */}
        <div className="min-w-[150px]">
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2.5 border rounded-md shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="running">Đang chạy</option>
            <option value="stopped">Đã dừng</option>
          </select>
        </div>

        {/* Guest OS Filter */}
        <div className="min-w-[200px]">
          <select 
            value={guestOSFilter}
            onChange={(e) => setGuestOSFilter(e.target.value)}
            className="w-full px-3 py-2.5 border rounded-md shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">Tất cả OS</option>
            {Object.entries(guestOSMap).map(([key, value]) => (
              <option key={key} value={value}>{value}</option>
            ))}
          </select>
        </div>

        {/* Reset Filters */}
        {(searchTerm !== '' || statusFilter !== 'all' || guestOSFilter !== 'all') && (
          <button 
            onClick={resetFilters}
            className="px-4 py-2.5 bg-gray-100 border rounded-md hover:bg-gray-200 flex items-center transition-colors shadow-sm"
            title="Đặt lại bộ lọc"
          >
            <Filter className="mr-2 h-4 w-4" />
            Đặt lại bộ lọc
          </button>
        )}
      </div>

      {/* VM Table */}
      <div className="vm-table-container" style={{ maxHeight: 'calc(100vh - 300px)', overflowY: 'auto' }}>
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-700 mx-auto mb-4"></div>
            <p className="text-gray-600">Đang tải dữ liệu...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-separate border-spacing-0">
              <thead className="bg-gray-100 text-gray-700 uppercase sticky top-0 z-10">
                <tr>
                  <th className="px-3 py-3 border-b text-center w-12">#</th>
                  <th className="px-4 py-3 border-b">Tên VM</th>
                  <th className="px-4 py-3 border-b text-center w-16">CPU</th>
                  <th className="px-4 py-3 border-b text-center w-24">RAM (MB)</th>
                  <th className="px-4 py-3 border-b text-center w-24">Disk (GB)</th>
                  <th className="px-4 py-3 border-b">IP</th>
                  <th className="px-4 py-3 border-b">Guest OS</th>
                  <th className="px-4 py-3 border-b text-center w-24">Trạng thái</th>
                  <th className="px-4 py-3 border-b text-center w-24">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {paginatedVMs.length > 0 ? (
                  paginatedVMs.map((vm, index) => (
                    <tr key={`${vm.vm_name}-${index}`} className="bg-white even:bg-gray-50 hover:bg-blue-50 transition-colors duration-150">
                      <td className="px-3 py-3.5 border-b text-center text-gray-500 font-mono">
                        {(currentPage - 1) * pageSize + index + 1}
                      </td>
                      <td className="px-4 py-3.5 border-b font-medium text-blue-700">{vm.vm_name}</td>
                      <td className="px-4 py-3.5 border-b text-center">{vm.num_cpus}</td>
                      <td className="px-4 py-3.5 border-b text-center">{vm.memory_mb}</td>
                      <td className="px-4 py-3.5 border-b text-center">{vm.disk_size_gb}</td>
                      <td className="px-4 py-3.5 border-b font-mono">{vm.ip}</td>
                      <td className="px-4 py-3.5 border-b">
                        {vm.guest_id && guestOSMap[vm.guest_id] ? guestOSMap[vm.guest_id] : 'Không xác định'}
                      </td>
                      <td className="px-4 py-3.5 border-b text-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          vm.status === 'running' 
                          ? 'bg-green-100 text-green-800 border border-green-300' 
                          : 'bg-gray-100 text-gray-700 border border-gray-300'
                        }`}>
                          {vm.status === 'running' ? 'Đang chạy' : 'Đã dừng'}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 border-b">
                        <div className="flex items-center justify-center space-x-3">
                          {vm.status === 'running' ? (
                            <button 
                              onClick={() => onPowerAction(vm, 'stop')}
                              className="text-amber-600 hover:text-amber-800 hover:bg-amber-50 p-1.5 rounded-full transition-colors"
                              disabled={taskRunning || !vCenterConnected}
                              title="Dừng VM"
                            >
                              <Square className="h-4 w-4" />
                            </button>
                          ) : (
                            <button 
                              onClick={() => onPowerAction(vm, 'start')}
                              className="text-green-600 hover:text-green-800 hover:bg-green-50 p-1.5 rounded-full transition-colors"
                              disabled={taskRunning || !vCenterConnected}
                              title="Khởi động VM"
                            >
                              <Play className="h-4 w-4" />
                            </button>
                          )}
                          <button 
                            onClick={() => onEditVM(vm)}
                            className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-1.5 rounded-full transition-colors"
                            disabled={taskRunning || !vCenterConnected}
                            title="Chỉnh sửa VM"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => onDeleteVM(vm)}
                            className="text-red-600 hover:text-red-800 hover:bg-red-50 p-1.5 rounded-full transition-colors"
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
                    <td colSpan="9" className="px-6 py-8 text-center text-gray-500">
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
      </div>

      {/* Pagination Controls */}
      {!loading && filteredVMs.length > 0 && (
        <div className="p-4 bg-gray-50 border-t flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Hiển thị {Math.min(filteredVMs.length, (currentPage - 1) * pageSize + 1)} - {Math.min(currentPage * pageSize, filteredVMs.length)} trên {filteredVMs.length} máy ảo
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Page Size Selector */}
            <div className="flex items-center">
              <span className="mr-2 text-sm font-medium">Hiển thị:</span>
              <select 
                value={pageSize} 
                onChange={handlePageSizeChange}
                className="border rounded p-1.5 bg-white shadow-sm"
              >
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
            
            {/* Pagination Buttons */}
            <div className="flex items-center space-x-1">
              <button 
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1}
                className={`p-1.5 rounded ${currentPage === 1 ? 'text-gray-300 cursor-default' : 'text-blue-600 hover:bg-blue-100'}`}
                title="Trang đầu"
              >
                <ChevronsLeft className="h-5 w-5" />
              </button>
              
              <button 
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`p-1.5 rounded ${currentPage === 1 ? 'text-gray-300 cursor-default' : 'text-blue-600 hover:bg-blue-100'}`}
                title="Trang trước"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              
              <span className="px-4 py-1.5 bg-white border rounded shadow-sm font-medium">
                {currentPage} / {totalPages}
              </span>
              
              <button 
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`p-1.5 rounded ${currentPage === totalPages ? 'text-gray-300 cursor-default' : 'text-blue-600 hover:bg-blue-100'}`}
                title="Trang sau"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
              
              <button 
                onClick={() => handlePageChange(totalPages)}
                disabled={currentPage === totalPages}
                className={`p-1.5 rounded ${currentPage === totalPages ? 'text-gray-300 cursor-default' : 'text-blue-600 hover:bg-blue-100'}`}
                title="Trang cuối"
              >
                <ChevronsRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VMList;