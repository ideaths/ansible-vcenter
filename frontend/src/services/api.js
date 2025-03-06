// frontend/src/services/api.js
/**
 * API Service để giao tiếp với backend
 */

// Base URL của API
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

/**
 * Tạo headers cơ bản cho request
 * @returns {Object} Headers
 */
const getHeaders = () => {
  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };
};

/**
 * Xử lý phản hồi từ API
 * @param {Response} response - Response từ fetch API
 * @returns {Promise} Dữ liệu phản hồi đã được xử lý
 */
const handleResponse = async (response) => {
  const text = await response.text();
  const data = text ? JSON.parse(text) : {};
  
  if (!response.ok) {
    const error = (data && data.error) || response.statusText;
    return Promise.reject(error);
  }
  
  return data;
};

/**
 * API Service
 */
const apiService = {
  /**
   * Lấy danh sách VM
   * @returns {Promise<Array>} Danh sách VM
   */
  getVMs: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/vms`, {
        method: 'GET',
        headers: getHeaders()
      });
      return handleResponse(response);
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },
  
  /**
   * Thêm hoặc cập nhật VM
   * @param {Object} vm - Thông tin VM
   * @returns {Promise<Object>} Kết quả thao tác
   */
  createOrUpdateVM: async (vm) => {
    try {
      const response = await fetch(`${API_BASE_URL}/vms`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(vm)
      });
      return handleResponse(response);
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },
  
  /**
   * Xóa VM
   * @param {string} vmName - Tên VM cần xóa
   * @returns {Promise<Object>} Kết quả thao tác
   */
  deleteVM: async (vmName) => {
    try {
      const response = await fetch(`${API_BASE_URL}/vms/${vmName}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      return handleResponse(response);
    } catch (error) {
      console.error('API Error:', error);
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
      const response = await fetch(`${API_BASE_URL}/vcenter/connect`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(config)
      });
      return handleResponse(response);
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }
};

export default apiService;