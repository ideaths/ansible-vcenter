import axios from 'axios';
import { store } from '../store/store';
import { startLoading, stopLoading } from '../store/loadingSlice';
import { API_ERRORS, VCENTER_ERRORS, getErrorMessage } from '../constants/errorMessages';

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
  getVMs: async () => {
    try {
      const response = await apiClient.get('/vms');
      return response.data;
    } catch (error) {
      console.error('Error fetching VMs:', error);
      throw error;
    }
  },
  createOrUpdateVM: async (vm) => {
    try {
      const response = await apiClient.post('/vms', vm);
      return response.data;
    } catch (error) {
      console.error('Error creating/updating VM:', error);
      throw error;
    }
  },
  deleteVM: async (vmName) => {
    try {
      const response = await apiClient.delete(`/vms/${vmName}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting VM:', error);
      throw error;
    }
  },
  connectToVCenter: async (config) => {
    try {
      const response = await apiClient.post('/vcenter/connect', config);
      return response.data;
    } catch (error) {
      console.error('Error connecting to vCenter:', error);
      throw error;
    }
  },
  powerActionVM: async (vmName, action) => {
    try {
      const response = await apiClient.post(`/vms/${vmName}/power`, { action });
      store.dispatch(stopLoading());
      return response.data;
    } catch (error) {
      store.dispatch(stopLoading());
      console.error('Lỗi thay đổi trạng thái VM:', error);
      throw error;
    }
  }
};

export default apiService;