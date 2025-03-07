import { useState } from 'react';
import apiService from '../services/api';

export const useVM = (onMessage, onLog, onRefreshVMs, setTaskPower) => {
  const [currentVm, setCurrentVm] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDeleteVM = async () => {
    try {
      const result = await apiService.deleteVM(currentVm.vm_name);
      if (result.success) {
        onMessage({
          text: `VM ${currentVm.vm_name} đã được xóa thành công!`,
          type: 'success'
        });
        setShowDeleteConfirm(false);
        return true;
      }
      throw new Error(result.message || 'Có lỗi xảy ra khi xóa VM');
    } catch (error) {
      onLog(`Lỗi: ${error.error || error.message}`);
      onMessage({
        text: `Lỗi khi xóa VM: ${error.error || error.message}`,
        type: 'error'
      });
      return false;
    }
  };

  const handlePowerAction = async (vm, action) => {
    try {
      onLog(`Đang thay đổi trạng thái VM: ${vm.vm_name}`);
      const result = await apiService.powerActionVM(vm.vm_name, action);
      if (result.success) {
        onMessage({
          text: `VM ${vm.vm_name} đã được ${action === 'start' ? 'khởi động' : 'dừng'} thành công!`,
          type: 'success'
        });
        onRefreshVMs();
      } else {
        throw new Error(result.message || 'Có lỗi xảy ra khi thay đổi trạng thái VM');
      }
    } catch (error) {
      onLog(`Lỗi: ${error.error || error.message}`);
      onMessage({
        text: `Lỗi khi thay đổi trạng thái VM: ${error.error || error.message}`,
        type: 'error'
      });
    }
  };

  return {
    currentVm,
    setCurrentVm,
    showDeleteConfirm,
    setShowDeleteConfirm,
    handleDeleteVM,
    handlePowerAction
  };
};