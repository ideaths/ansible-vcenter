import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Settings } from 'lucide-react';
import VMToolbar from './vm-list/VMToolbar';
import VMFilters from './vm-list/VMFilters';
import VMTable from './vm-list/VMTable';
import VMPagination from './vm-list/VMPagination';
import { INFO_MESSAGES } from '../constants/messages';

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
  onRunAnsible,
  taskRunning,
  onRefresh
}) => {
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [guestOSFilter, setGuestOSFilter] = useState('all');
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Guest OS mapping
  const guestOSMap = {
    'rhel8_64Guest': 'RHEL 8 (64-bit)',
    'ubuntu64Guest': 'Ubuntu Linux (64-bit)',
    'windows9Server64Guest': 'Windows Server 2019 (64-bit)'
  };

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, guestOSFilter]);

  // Chỉ gọi onRefresh một lần khi component mount
  useEffect(() => {
    if (vCenterConnected) {
      onRefresh();
    }
  }, [vCenterConnected]); // Chỉ gọi lại khi trạng thái kết nối thay đổi

  // Filtered VMs
  const filteredVMs = useMemo(() => {
    if (!vms?.length) return [];
    
    return vms.filter(vm => {
      const matchesSearch = !searchTerm || 
        vm.vm_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vm.ip?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'all' || 
        (statusFilter === 'running' && vm.status === 'running') ||
        (statusFilter === 'stopped' && vm.status !== 'running');

      const matchesGuestOS = guestOSFilter === 'all' || 
        (vm.guest_id && guestOSMap[vm.guest_id] === guestOSFilter);

      return matchesSearch && matchesStatus && matchesGuestOS;
    });
  }, [vms, searchTerm, statusFilter, guestOSFilter]);

  // Paginated data
  const paginatedVMs = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredVMs.slice(startIndex, startIndex + pageSize);
  }, [filteredVMs, currentPage, pageSize]);

  // Total pages
  const totalPages = Math.max(1, Math.ceil(filteredVMs.length / pageSize));

  // Ensure current page is valid
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(Math.max(1, totalPages));
    }
  }, [currentPage, totalPages]);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      const tableElement = document.querySelector('.vm-table-container');
      if (tableElement) {
        tableElement.scrollTop = 0;
      }
    }
  };

  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setGuestOSFilter('all');
    setCurrentPage(1);
  };

  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-12 bg-white rounded-lg border">
      <div className="text-gray-400 mb-4">
        <svg className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      </div>
      <p className="text-xl font-medium text-gray-500 mb-2">
        {vCenterConnected ? INFO_MESSAGES.NO_VMS_FOUND : INFO_MESSAGES.NOT_CONNECTED}
      </p>
      {vCenterConnected ? (
        <button
          onClick={onAddVM}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
          disabled={taskRunning}
        >
          <Plus className="h-4 w-4 mr-2" />
          Thêm VM mới
        </button>
      ) : (
        <button
          onClick={onConfigVCenter}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
          disabled={taskRunning}
        >
          <Settings className="h-4 w-4 mr-2" />
          Cấu hình vCenter
        </button>
      )}
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow">
      <VMToolbar 
        vCenterConfig={vCenterConfig}
        vCenterConnected={vCenterConnected}
        showLogs={showLogs}
        setShowLogs={setShowLogs}
        onAddVM={onAddVM}
        onConfigVCenter={onConfigVCenter}
        onRunAnsible={onRunAnsible}
        taskRunning={taskRunning}
      />

      <VMFilters 
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        guestOSFilter={guestOSFilter}
        setGuestOSFilter={setGuestOSFilter}
        guestOSMap={guestOSMap}
        resetFilters={resetFilters}
      />

      <div className="vm-table-container" style={{ maxHeight: 'calc(100vh - 300px)', overflowY: 'auto' }}>
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-700 mx-auto mb-4"></div>
            <p className="text-gray-600">Đang tải dữ liệu...</p>
          </div>
        ) : vms?.length === 0 ? (
          <EmptyState />
        ) : (
          <VMTable 
            vms={paginatedVMs}
            loading={loading}
            currentPage={currentPage}
            pageSize={pageSize}
            guestOSMap={guestOSMap}
            vCenterConnected={vCenterConnected}
            taskRunning={taskRunning}
            onEditVM={onEditVM}
            onDeleteVM={onDeleteVM}
            onPowerAction={onPowerAction}
          />
        )}
      </div>

      {!loading && vms?.length > 0 && (
        <VMPagination 
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          totalItems={filteredVMs.length}
          onPageChange={handlePageChange}
          onPageSizeChange={size => {
            setPageSize(size);
            setCurrentPage(1);
          }}
        />
      )}
    </div>
  );
};

export default VMList;