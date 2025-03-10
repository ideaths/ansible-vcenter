import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import apiService from '../services/api';
import { startLoading, stopLoading } from '../store/loadingSlice';

export const useAnsible = (onMessage, onLog, onRefreshVMs) => {
  const dispatch = useDispatch();
  const [ansibleRunning, setAnsibleRunning] = useState(false);

  const runAnsible = async () => {
    setAnsibleRunning(true);
    onLog([`Đang chạy Ansible để thực hiện các thay đổi trên vCenter...`]);
    
    try {
      const result = await apiService.runAnsible();
      
      if (result.success) {
        onLog([
          `Ansible đã chạy thành công!`,
          `Danh sách thay đổi đã được áp dụng lên vCenter.`
        ]);
        onRefreshVMs();
        onMessage({
          text: 'Các thay đổi đã được áp dụng thành công lên vCenter!',
          type: 'success'
        });
        return true;
      }
      throw new Error(result.message || 'Có lỗi xảy ra khi chạy Ansible');
    } catch (error) {
      onLog([`Lỗi khi chạy Ansible: ${error.error || error.message}`]);
      onMessage({
        text: `Lỗi khi chạy Ansible: ${error.error || error.message}`,
        type: 'error'
      });
      return false;
    } finally {
      setAnsibleRunning(false);
    }
  };

  // Check Ansible status on mount
  useEffect(() => {
    const checkAnsibleStatus = async () => {
      try {
        const status = await apiService.checkAnsibleStatus();
        if (status.isRunning) {
          dispatch(startLoading({
            message: 'Đang thực thi Ansible...',
            persist: true
          }));
          setAnsibleRunning(true);
          onLog([`Đang chạy Ansible (bắt đầu lúc: ${new Date(status.startTime).toLocaleString()})...`]);
          
          const interval = setInterval(async () => {
            const currentStatus = await apiService.checkAnsibleStatus();
            if (!currentStatus.isRunning) {
              dispatch(stopLoading());
              setAnsibleRunning(false);
              onLog(prev => [...prev, 'Ansible đã hoàn thành!']);
              clearInterval(interval);
              onRefreshVMs();
            }
          }, 5000);

          return () => {
            clearInterval(interval);
            dispatch(stopLoading());
          };
        }
      } catch (error) {
        console.error('Error checking Ansible status:', error);
        dispatch(stopLoading());
      }
    };

    checkAnsibleStatus();
  }, [dispatch]);

  return {
    ansibleRunning,
    runAnsible
  };
};
