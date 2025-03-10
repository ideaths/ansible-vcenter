// frontend/src/services/api.js
import axios from 'axios';
import { store } from '../store/store';
import { startLoading, stopLoading } from '../store/loadingSlice';
import { API_ERRORS, VCENTER_ERRORS, getErrorMessage } from '../constants/messages';

// Base URL của API
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Tạo axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Xử lý lỗi chung
apiClient.interceptors.response.use(
  response => response,
  error => {
    if (error.response) {
      console.debug('API Response Error:', error.response.data);
      
      // Sử dụng mã lỗi từ server nếu có
      const errorCode = error.response.data.errorCode;
      const errorMessage = error.response.data.error;
      
      return Promise.resolve({ 
        success: false, 
        error: errorMessage || getErrorMessage(errorCode, API_ERRORS.SERVER_ERROR),
        errorCode: errorCode,
        source: 'server_response'
      });
    } else if (error.request) {
      console.debug('API No Response:', error.request);
      
      return Promise.resolve({ 
        success: false, 
        error: API_ERRORS.NETWORK,
        errorCode: 'NETWORK_ERROR',
        source: 'network'
      });
    } else {
      console.debug('API Error:', error.message);
      
      return Promise.resolve({ 
        success: false, 
        error: error.message || API_ERRORS.UNKNOWN,
        errorCode: 'CLIENT_ERROR',
        source: 'client'
      });
    }
  }
);

const apiService = {
  /**
   * Lấy danh sách VM
   * @returns {Promise<Array>} Danh sách VM
   */
  getVMs: async () => {
    try {
      store.dispatch(startLoading({
        message: 'Đang lấy danh sách VM...',
        persist: false // không cần persist cho thao tác ngắn
      }));
      const response = await apiClient.get('/vms');
      store.dispatch(stopLoading());
      return response.data;
    } catch (error) {
      store.dispatch(stopLoading());
      console.error('Lỗi khi lấy danh sách VM:', error);
      throw error;
    }
  },

  /**
   * Thêm hoặc cập nhật VM (chỉ lưu vào CSV, không chạy Ansible)
   * @param {Object} vm - Thông tin VM
   * @returns {Promise<Object>} Kết quả thao tác
   */
  createOrUpdateVM: async (vm) => {
    try {
      store.dispatch(startLoading({
        message: 'Đang thêm/cập nhật VM...',
        persist: true // cần persist vì thao tác có thể mất nhiều thời gian
      }));
      const response = await apiClient.post('/vms', vm);
      store.dispatch(stopLoading());
      return response.data;
    } catch (error) {
      store.dispatch(stopLoading());
      console.error('Lỗi khi thêm/cập nhật VM:', error);
      throw error;
    }
  },

  /**
   * Đánh dấu VM để xóa (chỉ cập nhật CSV, không chạy Ansible)
   * @param {string} vmName - Tên VM cần xóa
   * @returns {Promise<Object>} Kết quả thao tác
   */
  deleteVM: async (vmName) => {
    try {
      store.dispatch(startLoading({
        message: 'Đang xóa VM...',
        persist: true // cần persist vì thao tác có thể mất nhiều thời gian
      }));
      const response = await apiClient.delete(`/vms/${vmName}`);
      store.dispatch(stopLoading());
      return response.data;
    } catch (error) {
      store.dispatch(stopLoading());
      console.error('Lỗi khi xóa VM:', error);
      throw error;
    }
  },

  /**
   * Kiểm tra kết nối vCenter
   * @param {Object} config - Cấu hình vCenter
   * @returns {Promise<Object>} Kết quả kết nối
   */
  // Update the connectToVCenter method to better handle errors:
  connectToVCenter: async (config) => {
    try {
      store.dispatch(startLoading({
        message: 'Đang kết nối tới vCenter...',
        persist: true
      }));
      
      const response = await apiClient.post('/vcenter/connect', config);
      store.dispatch(stopLoading());
      
      // Nếu đã có lỗi từ interceptor, trả về nguyên vẹn
      if (response.success === false) {
        // Áp dụng getErrorMessage để chuyển đổi mã lỗi nếu cần
        if (response.errorCode && !response.error) {
          response.error = getErrorMessage(response.errorCode);
        } else if (!response.error) {
          response.error = VCENTER_ERRORS.UNKNOWN;
        }
        return response;
      }
      
      return response.data;
    } catch (error) {
      store.dispatch(stopLoading());
      console.debug('Unhandled Error:', error);
      
      return { 
        success: false, 
        error: error.message || VCENTER_ERRORS.UNKNOWN,
        errorCode: 'EXCEPTION',
        source: 'exception'
      };
    }
  },  

  /**
   * Thực hiện thay đổi trạng thái nguồn VM (start/stop) - Chạy Ansible ngay lập tức
   * @param {string} vmName - Tên VM
   * @param {string} action - Hành động (start, stop)
   * @returns {Promise<Object>} Kết quả thao tác
   */
  powerActionVM: async (vmName, action) => {
    try {
      store.dispatch(startLoading({
        message: `Đang ${action === 'start' ? 'khởi động' : 'dừng'} VM...`,
        persist: true // cần persist vì thao tác có thể mất nhiều thời gian
      }));
      
      // Loại bỏ dòng sử dụng onLog
      // onLog && onLog(`Đang chạy Ansible để ${action === 'start' ? 'khởi động' : 'dừng'} VM: ${vmName}`);
      
      const response = await apiClient.post(`/vms/${vmName}/power`, { action });
      store.dispatch(stopLoading());
      return response.data;
    } catch (error) {
      store.dispatch(stopLoading());
      console.error('Lỗi thay đổi trạng thái VM:', error);
      throw error;
    }
  },

  /**
   * Chạy Ansible để thực hiện các thay đổi đã đăng ký lên vCenter
   * @returns {Promise<Object>} Kết quả thao tác Ansible
   */
  runAnsible: async () => {
    try {
      store.dispatch(startLoading({
        message: 'Đang thực thi Ansible...',
        persist: true
      }));
      
      const response = await apiClient.post('/ansible/run');
      if (!response.data || !response.data.success) {
        throw new Error(response.data?.error || 'Failed to run Ansible');
      }
      return response.data;
    } catch (error) {
      console.error('Error running Ansible:', error);
      store.dispatch(stopLoading());
      
      // Improved error handling
      const errorMessage = error.response?.data?.error || error.message;
      const errorDetails = error.response?.data?.details;
      
      throw {
        success: false,
        error: errorMessage,
        details: errorDetails,
        message: `Ansible execution failed: ${errorMessage}`
      };
    }
  },

  /**
   * Kiểm tra trạng thái Ansible
   * @returns {Promise<Object>} Trạng thái Ansible
   */
  checkAnsibleStatus: async () => {
    try {
      const response = await apiClient.get('/ansible/status');
      // Nếu không còn chạy thì dừng loading
      if (!response.data.isRunning) {
        store.dispatch(stopLoading());
      }
      return response.data;
    } catch (error) {
      console.error('Error checking Ansible status:', error);
      store.dispatch(stopLoading());
      return { isRunning: false };
    }
  }
};

export const executeAnsiblePlaybook = async (playbookName, params) => {
  try {
    store.dispatch(startLoading('Đang thực thi Ansible playbook...'));
    // ...existing code...
  } catch (error) {
    store.dispatch(stopLoading());
    throw error;
  }
};

export default apiService;