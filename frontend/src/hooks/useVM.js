import { useState } from 'react';
import apiService from '../services/api';

export const useVM = (onMessage, onLog, onRefreshVMs, setTaskPower) => {
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
    if (!currentVm?.vm_name) {
      onMessage({
        text: 'Lỗi: Không tìm thấy tên VM để xóa',
        type: 'error'
      });
      return;
    }
    
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
      // Thông báo rõ ràng rằng đang chạy Ansible cho power action
      onLog(`Đang chạy Ansible để ${action === 'start' ? 'khởi động' : 'dừng'} VM: ${vm.vm_name}`);
      
      const result = await apiService.powerActionVM(vm.vm_name, action);
      
      if (result.success) {
        onLog([
          `Ansible đã thực thi thành công!`,
          `Power action ${action === 'start' ? 'khởi động' : 'dừng'} đã được áp dụng cho VM: ${vm.vm_name}`
        ]);
        
        onMessage({
          text: `VM ${vm.vm_name} đã được ${action === 'start' ? 'khởi động' : 'dừng'} thành công`,
          type: 'success'
        });
        
        // Cập nhật lại danh sách VM để lấy trạng thái mới
        onRefreshVMs();
        return true;
      }
      throw new Error(result.message || 'Có lỗi xảy ra');
    } catch (error) {
      onLog([
        `Lỗi khi chạy Ansible cho power action: ${error.error || error.message}`,
        `Không thể ${action === 'start' ? 'khởi động' : 'dừng'} VM: ${vm.vm_name}`
      ]);
      
      onMessage({
        text: `Lỗi khi ${action === 'start' ? 'khởi động' : 'dừng'} VM: ${error.error || error.message}`,
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