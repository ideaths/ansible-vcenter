import React from 'react';
import { Play, Square, Edit, Trash2, PowerOff } from 'lucide-react';
import styles from '../../styles/components/VMList/VMTable.module.css';
import btnStyles from '../../styles/common/buttons.module.css';
import { VM_STATUS } from '../../constants/vmConstants';

const VMTable = ({
  vms,
  loading,
  currentPage,
  pageSize,
  guestOSMap,
  vCenterConnected,
  taskRunning,
  onEditVM,
  onDeleteVM,
  onPowerAction
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
                  <span className={`${styles.statusBadge} ${
                    vm.status === VM_STATUS.RUNNING ? styles.statusRunning : styles.statusStopped
                  }`}>
                    {vm.status === VM_STATUS.RUNNING ? 'Đang chạy' : 'Đã dừng'}
                  </span>
                </td>
                <td className={styles.actionsCell}>
                  <VMActions 
                    vm={vm}
                    taskRunning={taskRunning}
                    vCenterConnected={vCenterConnected}
                    onEditVM={onEditVM}
                    onDeleteVM={onDeleteVM}
                    onPowerAction={onPowerAction}
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

const VMActions = ({ vm, taskRunning, vCenterConnected, onEditVM, onDeleteVM, onPowerAction }) => (
  <div className={styles.actions}>
    {vm.status === VM_STATUS.RUNNING ? (
      <>
        <button 
          onClick={() => onPowerAction(vm, 'stop')}
          className={btnStyles.iconBtnWarning}
          disabled={taskRunning || !vCenterConnected}
          title="Dừng VM"
        >
          <Square className="h-4 w-4" />
        </button>
        <button 
          onClick={() => onDeleteVM(vm)}
          className={btnStyles.iconBtnDanger}
          disabled={taskRunning || !vCenterConnected}
          title="Xóa VM"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </>
    ) : (
      <>
        <button 
          onClick={() => onPowerAction(vm, 'start')}
          className={btnStyles.iconBtnSuccess}
          disabled={taskRunning || !vCenterConnected}
          title="Khởi động VM"
        >
          <Play className="h-4 w-4" />
        </button>
        <button 
          onClick={() => onDeleteVM(vm)}
          className={btnStyles.iconBtnDanger}
          disabled={taskRunning || !vCenterConnected}
          title="Xóa VM"
        >
          <PowerOff className="h-4 w-4" />
        </button>
      </>
    )}
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

export default VMTable;
