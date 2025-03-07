// frontend/src/services/api.js
import axios from 'axios';
import { store } from '../store/store';
import { startLoading, stopLoading } from '../store/loadingSlice';

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
    // Xử lý lỗi từ server
    if (error.response) {
      // Server trả về lỗi
      console.error('API Error Response:', error.response.data);
      return Promise.reject(error.response.data);
    } else if (error.request) {
      // Request được gửi nhưng không nhận được response
      console.error('API No Response:', error.request);
      return Promise.reject({
        success: false,
        error: 'Không thể kết nối tới máy chủ'
      });
    } else {
      // Lỗi khác
      console.error('API Error:', error.message);
      return Promise.reject({
        success: false,
        error: 'Lỗi không xác định'
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
  connectToVCenter: async (config) => {
    try {
      store.dispatch(startLoading({
        message: 'Đang kết nối tới vCenter...',
        persist: true // cần persist vì thao tác có thể mất nhiều thời gian
      }));
      const response = await apiClient.post('/vcenter/connect', config);
      store.dispatch(stopLoading());
      return response.data;
    } catch (error) {
      store.dispatch(stopLoading());
      console.error('Lỗi kết nối vCenter:', error);
      throw error;
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
      return response.data;
    } catch (error) {
      console.error('Lỗi khi chạy Ansible:', error);
      throw error;
    }
    // Không stopLoading ở đây vì cần đợi kiểm tra trạng thái hoàn thành
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