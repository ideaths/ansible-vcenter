import { useState, useEffect } from 'react';
import apiService from '../services/api';

export const useVCenter = (onMessage, onLog) => {
  const [vCenterConfig, setVCenterConfig] = useState({
    hostname: "vcenter.example.com",
    username: "administrator@vsphere.local",
    password: "",
    validateCerts: false,
    datacenter: "Home"
  });
  const [vCenterConnected, setVCenterConnected] = useState(false);

  const connectToVCenter = async (config) => {
    try {
      const result = await apiService.connectToVCenter(config);
      
      if (result.success) {
        setVCenterConfig(config);
        setVCenterConnected(true);
        
        localStorage.setItem('vCenterConnection', JSON.stringify({
          config, 
          connected: true,
          timestamp: Date.now()
        }));
        
        onMessage({
          text: `Đã kết nối thành công đến vCenter: ${config.hostname}`,
          type: 'success'
        });
        
        onLog(`Kết nối đến vCenter thành công!`);
        return true;
      }
      throw new Error(result.message || 'Không thể kết nối đến vCenter');
    } catch (error) {
      setVCenterConnected(false);
      localStorage.removeItem('vCenterConnection');
      onMessage({
        text: `Không thể kết nối đến vCenter: ${error.error || error.message}`,
        type: 'error'
      });
      onLog(`Kết nối đến vCenter thất bại: ${error.error || error.message}`);
      return false;
    }
  };

  const disconnectVCenter = () => {
    setVCenterConnected(false);
    localStorage.removeItem('vCenterConnection');
    onMessage({
      text: 'Đã ngắt kết nối khỏi vCenter',
      type: 'info'
    });
    onLog(`Đã ngắt kết nối khỏi vCenter: ${vCenterConfig.hostname}`);
  };

  // Restore connection state on mount
  useEffect(() => {
    const savedConnection = localStorage.getItem('vCenterConnection');
    if (savedConnection) {
      try {
        const connectionData = JSON.parse(savedConnection);
        setVCenterConfig(connectionData.config);
        setVCenterConnected(connectionData.connected);
        
        if (connectionData.connected) {
          onLog(`Đã khôi phục kết nối tới vCenter: ${connectionData.config.hostname}`);
        }
      } catch (error) {
        console.error('Lỗi khi khôi phục trạng thái kết nối:', error);
        onLog(`Lỗi khi khôi phục trạng thái kết nối: ${error.message}`);
      }
    }
  }, []);

  return {
    vCenterConfig,
    vCenterConnected,
    connectToVCenter,
    disconnectVCenter
  };
};
