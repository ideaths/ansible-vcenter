import React, { useState, useEffect, useMemo } from 'react';
import { Plus } from 'lucide-react';
import VMToolbar from './vm-list/VMToolbar';
import VMFilters from './vm-list/VMFilters';
import VMTable from './vm-list/VMTable';
import VMPagination from './vm-list/VMPagination';
import { INFO_MESSAGES } from '../constants/messages';
import apiService from '../services/api'; // Thêm dòng này để import apiService

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
  onRunAnsible,
  taskRunning,
  onRefresh,
  onMessage, // Thêm prop onMessage
  onLog, // Thêm prop onLog
}) => {
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [guestOSFilter, setGuestOSFilter] = useState('all');
  const [tagFilter, setTagFilter] = useState([]); // Thay đổi từ 'all' thành mảng rỗng
  
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
  }, [searchTerm, statusFilter, guestOSFilter, tagFilter]);

  // Chỉ gọi onRefresh một lần khi component mount
  useEffect(() => {
    if (vCenterConnected) {
      onRefresh();
    }
  }, [vCenterConnected]); // Chỉ gọi lại khi trạng thái kết nối thay đổi

  // Get unique tags from all VMs
  const availableTags = useMemo(() => {
    if (!vms?.length) return [];
    const tags = new Set();
    vms.forEach(vm => {
      if (vm.tags) {
        vm.tags.split(',').forEach(tag => tags.add(tag.trim()));
      }
    });
    return Array.from(tags).filter(tag => tag);
  }, [vms]);

  // Filtered VMs
  const filteredVMs = useMemo(() => {
    if (!vms?.length) return [];
    
    return vms.filter(vm => {
      const matchesSearch = !searchTerm || 
        vm.vm_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vm.ip?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vm.tags?.toLowerCase().includes(searchTerm.toLowerCase()); // Add tag search

      const matchesStatus = statusFilter === 'all' || 
        (statusFilter === 'running' && vm.status === 'running') ||
        (statusFilter === 'stopped' && vm.status !== 'running');

      const matchesGuestOS = guestOSFilter === 'all' || 
        (vm.guest_id && guestOSMap[vm.guest_id] === guestOSFilter);

      const matchesTag = tagFilter.length === 0 || 
        (vm.tags && tagFilter.every(tag => 
          vm.tags.split(',').map(t => t.trim()).includes(tag)
        ));

      return matchesSearch && matchesStatus && matchesGuestOS && matchesTag;
    });
  }, [vms, searchTerm, statusFilter, guestOSFilter, tagFilter]);

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
    setTagFilter([]); // Reset về mảng rỗng
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
      ) : null}
    </div>
  );

  // Handle restoring VM (change from destroy to apply)
  const handleRestoreVM = async (vm) => {
    try {
      onLog(`Đang khôi phục VM ${vm.vm_name}...`);
      
      const updatedVM = { ...vm, action: 'apply' };
      const result = await apiService.createOrUpdateVM(updatedVM);
      
      if (result.success) {
        onMessage({
          text: `VM ${vm.vm_name} đã được khôi phục thành công!`,
          type: 'success'
        });
        onLog(`VM ${vm.vm_name} đã được khôi phục thành công`);
        onRefresh();
        return true;
      }
      throw new Error(result.message || 'Có lỗi xảy ra khi khôi phục VM');
    } catch (error) {
      const errorMsg = error.error || error.message;
      onMessage({
        text: `Lỗi khi khôi phục VM: ${errorMsg}`,
        type: 'error'
      });
      onLog(`Lỗi khi khôi phục VM ${vm.vm_name}: ${errorMsg}`);
      return false;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <VMToolbar 
        vCenterConfig={vCenterConfig}
        vCenterConnected={vCenterConnected}
        showLogs={showLogs}
        setShowLogs={setShowLogs}
        onAddVM={onAddVM}
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
        tagFilter={tagFilter}
        setTagFilter={setTagFilter}
        availableTags={availableTags}
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
            onAddVM={onAddVM} // Thêm prop onAddVM vào đây
            onRestoreVM={handleRestoreVM}
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