import React, { useState, useEffect, useMemo } from 'react';
import VMToolbar from './vm-list/VMToolbar';
import VMFilters from './vm-list/VMFilters';
import VMTable from './vm-list/VMTable';
import VMPagination from './vm-list/VMPagination';

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
  taskRunning 
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
      </div>

      {!loading && filteredVMs.length > 0 && (
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