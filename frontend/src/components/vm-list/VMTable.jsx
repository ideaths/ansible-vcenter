import React from 'react';
import { Play, Square, Edit, Trash2, PowerOff, RotateCcw } from 'lucide-react'; 
import styles from '../../styles/components/VMList/VMTable.module.css';
import btnStyles from '../../styles/common/buttons.module.css';

// Hàm xác định nội dung và lớp CSS cho trạng thái VM
const getVMStatusDisplay = (vm) => {
  // Trường hợp 1: Status = on và action = apply => trạng thái = Đang chạy
  if (vm.status === 'on' && vm.action === 'apply') {
    return {
      text: 'Đang chạy',
      className: styles.statusRunning
    };
  }
  // Trường hợp 2: Status = off và action = apply => trạng thái = Đang dừng
  else if (vm.status === 'off' && vm.action === 'apply') {
    return {
      text: 'Đang dừng',
      className: styles.statusStopped
    };
  }
  // Trường hợp 3: Status = off và action = destroy => trạng thái = Deleted
  else if (vm.status === 'off' && vm.action === 'destroy') {
    return {
      text: 'Deleted',
      className: styles.statusDeleted
    };
  }
  // Trường hợp khác (không nên xảy ra, nhưng để an toàn)
  else {
    return {
      text: 'Không xác định',
      className: styles.statusUnknown
    };
  }
};

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
  if (loading) {
    return (
      <div className={styles.loadingState}>
        <div className={styles.spinner}></div>
        <p className={styles.loadingText}>Đang tải dữ liệu...</p>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <table className={styles.table}>
        <thead className={styles.thead}>
          <tr>
            <th className="px-3 py-3 border-b text-center w-12">#</th>
            <th className="px-4 py-3 border-b">Tên VM</th>
            <th className="px-4 py-3 border-b text-center w-16">CPU</th>
            <th className="px-4 py-3 border-b text-center w-24">RAM (MB)</th>
            <th className="px-4 py-3 border-b text-center w-24">Disk (GB)</th>
            <th className="px-4 py-3 border-b">IP</th>
            <th className="px-4 py-3 border-b">Guest OS</th>
            <th className="px-4 py-3 border-b text-center w-32">Trạng thái</th>
            <th className="px-4 py-3 border-b text-center w-24">Hành động</th>
          </tr>
        </thead>
        <tbody>
          {vms.length > 0 ? (
            vms.map((vm, index) => (
              <tr key={`${vm.vm_name}-${index}`} className={styles.row}>
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
                <td className={styles.statusCell}>
                  {(() => {
                    const statusDisplay = getVMStatusDisplay(vm);
                    return (
                      <span className={`${styles.statusBadge} ${statusDisplay.className}`}>
                        {statusDisplay.text}
                      </span>
                    );
                  })()}
                </td>
                <td className={styles.actionsCell}>
                  <VMActions 
                    vm={vm}
                    taskRunning={taskRunning}
                    taskPower={taskPower}
                    vCenterConnected={vCenterConnected}
                    onEditVM={onEditVM}
                    onDeleteVM={onDeleteVM}
                    onPowerAction={onPowerAction}
                    onAddVM={onAddVM}
                    onRestoreVM={onRestoreVM}
                    onMessage={onMessage}
                  />
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="9" className={styles.emptyState}>
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

const VMActions = ({ 
  vm, 
  taskRunning, 
  taskPower, 
  vCenterConnected, 
  onEditVM, 
  onDeleteVM, 
  onPowerAction,
  onRestoreVM,
  onMessage
}) => {
  // Hàm xử lý nút power khi bấm
  const handlePowerAction = (vm, action) => {
    // Kiểm tra VM có action là 'apply' hay không
    if (vm.action !== 'apply') {
      // Hiển thị thông báo lỗi
      onMessage({
        text: `Không thể ${action === 'start' ? 'khởi động' : 'dừng'} VM: ${vm.vm_name} vì VM đang có trạng thái "destroy"`,
        type: 'error'
      });
      return;
    }
    
    // Nếu VM có action là 'apply', tiến hành thực hiện hành động nguồn
    if (window.confirm(`Bạn có chắc muốn ${action === 'start' ? 'khởi động' : 'dừng'} VM ${vm.vm_name}? Ansible sẽ được thực thi ngay lập tức.`)) {
      onPowerAction(vm, action);
    }
  };

  return (
    <div className={styles.actions}>
      {/* Power Actions - dựa vào status (on/off) từ CSV */}
      {vm.status === 'on' ? (
        <button 
          onClick={() => handlePowerAction(vm, 'stop')}
          className={`${btnStyles.iconBtnWarning} ${vm.action !== 'apply' ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={taskPower || !vCenterConnected || vm.action !== 'apply'}
          title={vm.action !== 'apply' ? 'Không thể dừng VM có trạng thái "destroy"' : 'Dừng VM (Chạy Ansible ngay lập tức)'}
        >
          <Square className="h-4 w-4" />
        </button>
      ) : (
        <button 
          onClick={() => handlePowerAction(vm, 'start')}
          className={`${btnStyles.iconBtnSuccess} ${vm.action !== 'apply' ? 'opacity-50 cursor-not-allowed' : ''}`}
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
          className={btnStyles.iconBtnDanger}
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
          className={btnStyles.iconBtnPrimary}
          disabled={taskRunning || !vCenterConnected}
          title="Khôi phục VM"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
      )}

      {/* Edit button - always show */}
      <button 
        onClick={() => onEditVM(vm)}
        className={btnStyles.iconBtnEdit}
        disabled={taskRunning || !vCenterConnected}
        title="Chỉnh sửa VM"
      >
        <Edit className="h-4 w-4" />
      </button>
    </div>
  );
};

export default VMTable;