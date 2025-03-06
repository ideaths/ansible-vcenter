import { useState } from 'react';
import apiService from '../services/api';

export const useVM = (onMessage, onLog, onRefreshVMs) => {
  const [currentVm, setCurrentVm] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleSubmitVM = async (vmData) => {
    try {
      const result = await apiService.createOrUpdateVM(vmData);
      
      if (result.success) {
        onLog(`VM đã được ${vmData.vm_name ? 'cập nhật' : 'thêm'} thành công`);
        onRefreshVMs();
        onMessage({
          text: `VM ${vmData.vm_name} đã được ${vmData.vm_name ? 'cập nhật' : 'thêm'} thành công!`,
          type: 'success'
        });
        setShowForm(false);
        return true;
      }
      throw new Error(result.message || 'Có lỗi xảy ra khi thao tác VM');
    } catch (error) {
      onLog(`Lỗi: ${error.error || error.message}`);
      onMessage({
        text: `Lỗi khi thao tác VM: ${error.error || error.message}`,
        type: 'error'
      });
      return false;
    }
  };

  const handleDeleteVM = async () => {
    if (!currentVm) return;
    
    try {
      const result = await apiService.deleteVM(currentVm.vm_name);
      
      if (result.success) {
        onLog(`VM đã được đánh dấu xóa thành công - sử dụng nút "Chạy Ansible" để thực hiện thao tác`);
        onRefreshVMs();
        onMessage({
          text: `VM ${currentVm.vm_name} đã được đánh dấu xóa. Vui lòng nhấn "Chạy Ansible" để thực hiện!`,
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
      const result = await apiService.powerActionVM(vm.vm_name, action);
      
      if (result.success) {
        onLog(`Power action ${action} đã được đăng ký cho VM: ${vm.vm_name}`);
        onMessage({
          text: `${action === 'start' ? 'Khởi động' : 'Dừng'} VM ${vm.vm_name} đã được đăng ký. Đang thực hiện...`,
          type: 'info'
        });

        // Run Ansible immediately for power actions
        const ansibleResult = await apiService.runAnsible();
        if (ansibleResult.success) {
          onRefreshVMs();
          onMessage({
            text: `${action === 'start' ? 'Khởi động' : 'Dừng'} VM ${vm.vm_name} thành công`,
            type: 'success'
          });
        }
        return true;
      }
      throw new Error(result.message || 'Có lỗi xảy ra');
    } catch (error) {
      onLog(`Lỗi: ${error.error || error.message}`);
      onMessage({
        text: `Lỗi khi thay đổi trạng thái nguồn: ${error.error || error.message}`,
        type: 'error'
      });
      return false;
    }
  };

  return {
    currentVm,
    setCurrentVm,
    showForm,
    setShowForm,
    showDeleteConfirm,
    setShowDeleteConfirm,
    handleSubmitVM,
    handleDeleteVM,
    handlePowerAction
  };
};
