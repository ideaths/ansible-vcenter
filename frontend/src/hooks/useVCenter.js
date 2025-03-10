import { useState, useEffect, useRef } from 'react';
import apiService from '../services/api';
import { useDispatch } from 'react-redux';
import { stopLoading } from '../store/loadingSlice';
import { VCENTER_ERRORS, getErrorMessage } from '../constants/messages';

export const useVCenter = (onMessage, onLog) => {
  const dispatch = useDispatch();
  const [vCenterConfig, setVCenterConfig] = useState({
    hostname: "vcenter.example.com",
    username: "administrator@vsphere.local",
    password: "",
    validateCerts: false,
    datacenter: "Home"
  });
  const [vCenterConnected, setVCenterConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  
  // Track API calls to ignore outdated responses
  const apiCallIdRef = useRef(0);
  // Track login attempts to show message for each attempt
  const loginAttemptRef = useRef(0);
  // Track toast ID to avoid duplicate messages
  const lastToastIdRef = useRef(null);

  const connectToVCenter = async (config) => {
    // Generate new attempt ID for this login attempt
    const currentAttemptId = ++loginAttemptRef.current;
    // Generate new API call ID
    const currentCallId = ++apiCallIdRef.current;
    
    // Always reset connection error for new attempt
    setConnectionError(null);
    
    try {
      // Log attempt with attempt ID
      onLog(`Đang kết nối đến vCenter (lần thử ${currentAttemptId}): ${config.hostname}`);
      
      const result = await apiService.connectToVCenter(config);
      
      // Ignore outdated API calls
      if (currentCallId !== apiCallIdRef.current) {
        console.debug(`Bỏ qua kết quả API cũ: ${currentCallId} vs ${apiCallIdRef.current}`);
        return false;
      }
      
      if (result.success) {
        setVCenterConfig(config);
        setVCenterConnected(true);
        lastToastIdRef.current = null; // Reset last toast ID for successful login
        
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
      
      // Handle error case - use error from API if available, with proper type translation
      const errorMsg = result.error 
        || (result.errorCode ? getErrorMessage(result.errorCode) : null) 
        || VCENTER_ERRORS.UNKNOWN;
      
      // Log error details for debugging
      console.debug(`Lỗi kết nối [nguồn: ${result.source || 'unknown'}, mã: ${result.errorCode || 'none'}]:`, errorMsg);
      
      // Always set connection error for UI display
      setConnectionError(errorMsg);
      
      // Create a unique toast ID for this attempt
      const toastId = `login_error_${currentAttemptId}`;
      
      // Only show toast if it's different from the last one
      if (lastToastIdRef.current !== toastId) {
        lastToastIdRef.current = toastId;
        
        onMessage({
          id: toastId,
          text: errorMsg,
          type: 'error',
          title: 'Lỗi kết nối',
          attemptId: currentAttemptId // Attach attempt ID to message
        });
      }
      
      onLog(`Kết nối đến vCenter thất bại (lần thử ${currentAttemptId}): ${errorMsg}`);
      return false;
    } catch (error) {
      // This is rare as apiService already handles most errors
      if (currentCallId !== apiCallIdRef.current) {
        return false;
      }
      
      dispatch(stopLoading());
      setVCenterConnected(false);
      localStorage.removeItem('vCenterConnection');
      
      // Get error message, preferring structured error properties if available
      const errorMessage = error.error || error.message || VCENTER_ERRORS.UNKNOWN;
      
      // Always set connection error for this attempt
      setConnectionError(errorMessage);
      
      // Create a unique toast ID for this attempt
      const toastId = `login_exception_${currentAttemptId}`;
      
      // Only show toast if it's different from the last one
      if (lastToastIdRef.current !== toastId) {
        lastToastIdRef.current = toastId;
        
        onMessage({
          id: toastId,
          text: errorMessage,
          type: 'error',
          title: 'Lỗi kết nối',
          attemptId: currentAttemptId
        });
      }
      
      onLog(`Lỗi không mong đợi khi kết nối vCenter (lần thử ${currentAttemptId}): ${errorMessage}`);
      return false;
    }
  };

  const disconnectVCenter = () => {
    setVCenterConnected(false);
    localStorage.removeItem('vCenterConnection');
    setConnectionError(null);
    
    // Reset tracking refs
    loginAttemptRef.current = 0;
    lastToastIdRef.current = null;
    
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
    disconnectVCenter,
    connectionError
  };
};