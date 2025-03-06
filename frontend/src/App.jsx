import React, { useState, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { restoreLoadingState } from './store/loadingSlice';
import VMList from './components/VMList';
import VMForm from './components/VMForm';
import VCenterConfig from './components/VCenterConfig';
import LogViewer from './components/LogViewer';
import LoadingOverlay from './components/LoadingOverlay';
import apiService from './services/api';
import { AlertCircle, ServerOff } from 'lucide-react';

function App() {
  // State
  const [vms, setVms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [currentVm, setCurrentVm] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [taskRunning, setTaskRunning] = useState(false);
  const [ansibleRunning, setAnsibleRunning] = useState(false);
  const [taskLog, setTaskLog] = useState([]);
  const [showLogs, setShowLogs] = useState(false);
  const [showVCenterConfig, setShowVCenterConfig] = useState(false);
  const [vCenterConfig, setVCenterConfig] = useState({
    hostname: "vcenter.example.com",
    username: "administrator@vsphere.local",
    password: "",
    validateCerts: false,
    datacenter: "Home"
  });
  const [vCenterConnected, setVCenterConnected] = useState(false);
  
  // Ref for the main content container
  const mainContentRef = useRef(null);
  
  // Scroll to top when showing forms/modals
  useEffect(() => {
    if (showForm || showDeleteConfirm || showVCenterConfig) {
      // Prevent auto-scrolling when opening modals
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [showForm, showDeleteConfirm, showVCenterConfig]);

  // Lấy danh sách VM
  const fetchVMs = async () => {
    setLoading(true);
    const currentLogs = [...taskLog];
    currentLogs.push(`Đang lấy danh sách VM từ server...`);
    setTaskLog(currentLogs);
    
    try {
      // Sử dụng phương thức getVMs từ apiService
      const data = await apiService.getVMs();
      
      setVms(data);
      setTaskLog([...currentLogs, `Đã lấy ${data.length} VM từ server`]);
    } catch (error) {
      setMessage({
        text: 'Lỗi khi tải danh sách VM: ' + (error.error || error.message),
        type: 'error'
      });
      setTaskLog([...currentLogs, `Lỗi khi lấy danh sách VM: ${error.error || error.message}`]);
    } finally {
      setLoading(false);
    }
  };

  // Kiểm tra kết nối vCenter
  const connectToVCenter = async (config) => {
    setTaskRunning(true);
    setTaskLog(prev => [...prev, `Đang kết nối đến vCenter: ${config.hostname}...`]);
    
    try {
      // Gọi API thực tế để kết nối vCenter
      const result = await apiService.connectToVCenter(config);
      
      if (result.success) {
        setVCenterConfig(config);
        setVCenterConnected(true);
        setShowVCenterConfig(false);
        
        // Lưu trạng thái kết nối vào localStorage
        localStorage.setItem('vCenterConnection', JSON.stringify({
          config, 
          connected: true,
          timestamp: Date.now()
        }));
        
        setMessage({
          text: `Đã kết nối thành công đến vCenter: ${config.hostname}`,
          type: 'success'
        });
        
        setTaskLog(prev => [...prev, `Kết nối đến vCenter thành công!`]);
        
        // Lấy danh sách VM sau khi kết nối
        fetchVMs();
      } else {
        throw new Error(result.message || 'Không thể kết nối đến vCenter');
      }
    } catch (error) {
      setVCenterConnected(false);
      
      // Xóa thông tin kết nối khỏi localStorage nếu kết nối thất bại
      localStorage.removeItem('vCenterConnection');
      
      setMessage({
        text: `Không thể kết nối đến vCenter: ${error.error || error.message}`,
        type: 'error'
      });
      
      setTaskLog(prev => [...prev, `Kết nối đến vCenter thất bại: ${error.error || error.message}`]);
    } finally {
      setTaskRunning(false);
    }
  };

  // Ngắt kết nối vCenter
  const disconnectVCenter = () => {
    setVCenterConnected(false);
    localStorage.removeItem('vCenterConnection'); // Chuyển sang dùng localStorage
    setShowVCenterConfig(false);
    setMessage({
      text: 'Đã ngắt kết nối khỏi vCenter',
      type: 'info'
    });
    setTaskLog(prev => [...prev, `Đã ngắt kết nối khỏi vCenter: ${vCenterConfig.hostname}`]);
  };

  // Xử lý thêm VM mới
  const handleAddVM = () => {
    setCurrentVm(null);
    setShowForm(true);
  };

  // Xử lý chỉnh sửa VM
  const handleEditVM = (vm) => {
    setCurrentVm(vm);
    setShowForm(true);
  };

  // Xử lý xác nhận xóa VM
  const handleDeleteConfirm = (vm) => {
    setCurrentVm(vm);
    setShowDeleteConfirm(true);
  };

  // Xử lý submit form VM
  const handleSubmitVM = async (vmData) => {
    if (!vCenterConnected) {
      setMessage({
        text: 'Vui lòng kết nối vCenter trước khi thực hiện thao tác này',
        type: 'error'
      });
      return;
    }
    
    setTaskRunning(true);
    setShowLogs(true);
    setTaskLog(prev => [...prev, `Chuẩn bị ${vmData.vm_name ? 'cập nhật' : 'thêm'} VM: ${vmData.vm_name || 'Máy ảo mới'}`]);
    
    try {
      // Gọi API thêm/cập nhật VM mà không chạy Ansible
      const result = await apiService.createOrUpdateVM(vmData);
      
      if (result.success) {
        setTaskLog(prev => [...prev, `VM đã được ${vmData.vm_name ? 'cập nhật' : 'thêm'} thành công`]);
        
        // Làm mới danh sách VM
        fetchVMs();
        
        setMessage({
          text: `VM ${vmData.vm_name} đã được ${vmData.vm_name ? 'cập nhật' : 'thêm'} thành công!`,
          type: 'success'
        });
        
        setShowForm(false);
      } else {
        throw new Error(result.message || 'Có lỗi xảy ra khi thao tác VM');
      }
    } catch (error) {
      setTaskLog(prev => [...prev, `Lỗi: ${error.error || error.message}`]);
      setMessage({
        text: `Lỗi khi thao tác VM: ${error.error || error.message}`,
        type: 'error'
      });
    } finally {
      setTaskRunning(false);
    }
  };

  // Xử lý xóa VM
  const handleDeleteVM = async () => {
    if (!currentVm) return;
    
    setTaskRunning(true);
    setShowLogs(true);
    setTaskLog(prev => [...prev, `Chuẩn bị xóa VM: ${currentVm.vm_name}`]);
    
    try {
      // Gọi API xóa VM mà không chạy Ansible
      const result = await apiService.deleteVM(currentVm.vm_name);
      
      if (result.success) {
        setTaskLog(prev => [...prev, `VM đã được đánh dấu xóa thành công - sử dụng nút "Chạy Ansible" để thực hiện thao tác`]);
        
        // Làm mới danh sách VM
        fetchVMs();
        
        setMessage({
          text: `VM ${currentVm.vm_name} đã được đánh dấu xóa. Vui lòng nhấn "Chạy Ansible" để thực hiện!`,
          type: 'success'
        });
        
        setShowDeleteConfirm(false);
      } else {
        throw new Error(result.message || 'Có lỗi xảy ra khi xóa VM');
      }
    } catch (error) {
      setTaskLog(prev => [...prev, `Lỗi: ${error.error || error.message}`]);
      setMessage({
        text: `Lỗi khi xóa VM: ${error.error || error.message}`,
        type: 'error'
      });
    } finally {
      setTaskRunning(false);
    }
  };

  // Xử lý thay đổi trạng thái nguồn VM (start/stop)
  const handlePowerAction = async (vm, action) => {
    setTaskRunning(true);
    setShowLogs(true);
    setTaskLog([`Thực hiện thay đổi trạng thái nguồn: ${action} cho VM: ${vm.vm_name}`]);
    
    try {
      // Gọi API thay đổi trạng thái nguồn sẽ được thực hiện trong nút Chạy Ansible
      setTaskLog(prev => [...prev, `Power action ${action} đã được đăng ký cho VM: ${vm.vm_name}`]);
      
      // Cập nhật UI ngay lập tức mà không chạy Ansible
      setMessage({
        text: `${action === 'start' ? 'Khởi động' : 'Dừng'} VM ${vm.vm_name} đã được đăng ký. Nhấn "Chạy Ansible" để thực hiện.`,
        type: 'info'
      });
      
      // Chỉ cập nhật trạng thái VM trong UI
      const updatedVms = vms.map(item => {
        if (item.vm_name === vm.vm_name) {
          return {
            ...item,
            status: action === 'start' ? 'queued_start' : 'queued_stop',
            pendingPowerAction: action
          };
        }
        return item;
      });
      
      setVms(updatedVms);
    } catch (error) {
      setTaskLog(prev => [...prev, `Lỗi: ${error.error || error.message}`]);
      setMessage({
        text: `Lỗi khi đăng ký thay đổi trạng thái nguồn: ${error.error || error.message}`,
        type: 'error'
      });
    } finally {
      setTaskRunning(false);
    }
  };

  // Xử lý chạy Ansible
  const handleRunAnsible = async () => {
    if (!vCenterConnected) {
      setMessage({
        text: 'Vui lòng kết nối vCenter trước khi thực hiện thao tác này',
        type: 'error'
      });
      return;
    }
    
    setTaskRunning(true);
    setAnsibleRunning(true); // Set the Ansible running state to show the overlay
    setShowLogs(true);
    setTaskLog([`Đang chạy Ansible để thực hiện các thay đổi trên vCenter...`]);
    
    try {
      // Gọi API để chạy Ansible playbook
      const result = await apiService.runAnsible();
      
      if (result.success) {
        setTaskLog(prev => [
          ...prev, 
          `Ansible đã chạy thành công!`,
          `Danh sách thay đổi đã được áp dụng lên vCenter.`
        ]);
        
        // Làm mới danh sách VM để cập nhật trạng thái
        fetchVMs();
        
        setMessage({
          text: 'Các thay đổi đã được áp dụng thành công lên vCenter!',
          type: 'success'
        });
      } else {
        throw new Error(result.message || 'Có lỗi xảy ra khi chạy Ansible');
      }
    } catch (error) {
      setTaskLog(prev => [...prev, `Lỗi khi chạy Ansible: ${error.error || error.message}`]);
      setMessage({
        text: `Lỗi khi chạy Ansible: ${error.error || error.message}`,
        type: 'error'
      });
    } finally {
      setTaskRunning(false);
      setAnsibleRunning(false); // Reset the Ansible running state when done
    }
  };

  // Hiển thị thông báo với auto-dismiss
  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => {
        setMessage({ text: '', type: '' });
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [message]);

  // Khôi phục trạng thái kết nối khi khởi động ứng dụng
  useEffect(() => {
    // Only set initial logs, but don't show them automatically
    setTaskLog([`Chào mừng đến với Quản lý VM. Đang khôi phục trạng thái kết nối...`]);
    
    // Kiểm tra xem đã có thông tin kết nối được lưu trữ trước đó chưa
    const savedConnection = localStorage.getItem('vCenterConnection');
    if (savedConnection) {
      try {
        const connectionData = JSON.parse(savedConnection);
        setVCenterConfig(connectionData.config);
        setVCenterConnected(connectionData.connected);
        
        if (connectionData.connected) {
          // Nếu đã từng kết nối thành công, tự động lấy danh sách VM
          setTaskLog(prev => [...prev, `Đã khôi phục kết nối tới vCenter: ${connectionData.config.hostname}`]);
          fetchVMs();
        } else {
          setTaskLog(prev => [...prev, `Vui lòng kết nối vCenter để bắt đầu.`]);
        }
      } catch (error) {
        console.error('Lỗi khi khôi phục trạng thái kết nối:', error);
        setTaskLog(prev => [...prev, `Lỗi khi khôi phục trạng thái kết nối: ${error.message}`]);
      }
    } else {
      setTaskLog(prev => [...prev, `Vui lòng kết nối vCenter để bắt đầu.`]);
    }
  }, []);

  const dispatch = useDispatch();

  useEffect(() => {
    // Khôi phục loading state khi component mount
    dispatch(restoreLoadingState());
  }, [dispatch]);

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* Ansible Running Overlay */}
      {ansibleRunning && <LoadingOverlay message="Đang thực thi Ansible..." />}
      
      {/* Header */}
      <header className="bg-blue-700 text-white p-4 shadow-md">
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold">Quản lý VM với Ansible</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow container mx-auto p-4" ref={mainContentRef}>
        {/* Message Alert */}
        {message.text && (
          <div className={`mb-4 p-3 rounded-md flex items-center ${
            message.type === 'error' ? 'bg-red-100 text-red-700' : 
            message.type === 'info' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
          }`}>
            {message.type === 'error' ? (
              <AlertCircle className="mr-2 h-5 w-5" />
            ) : message.type === 'info' ? (
              <div className="mr-2 h-5 w-5 text-blue-500">ℹ</div>
            ) : (
              <div className="mr-2 h-5 w-5 text-green-500">✓</div>
            )}
            <span>{message.text}</span>
          </div>
        )}

        {/* Main App Content */}
        <div className="space-y-4">
          {/* VM List with Controls */}
          <VMList 
            vms={vms} 
            loading={loading}
            vCenterConfig={vCenterConfig}
            vCenterConnected={vCenterConnected}
            showLogs={showLogs}
            setShowLogs={setShowLogs}
            onAddVM={handleAddVM}
            onEditVM={handleEditVM}
            onDeleteVM={handleDeleteConfirm}
            onPowerAction={handlePowerAction}
            onConfigVCenter={() => setShowVCenterConfig(true)}
            onRunAnsible={handleRunAnsible}
            taskRunning={taskRunning}
          />
          
          {/* Log Viewer */}
          {showLogs && (
            <LogViewer 
              logs={taskLog} 
              isLoading={taskRunning} 
              onClose={() => setShowLogs(false)} 
            />
          )}
        </div>
      </main>

      {/* Modals */}
      {showForm && (
        <VMForm 
          vm={currentVm} 
          onSubmit={handleSubmitVM} 
          onCancel={() => setShowForm(false)} 
          isLoading={taskRunning} 
        />
      )}
      
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="text-center">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Xác nhận xóa VM</h3>
                <p className="text-sm text-gray-500">
                  Bạn có chắc chắn muốn xóa VM <span className="font-semibold">{currentVm?.vm_name}</span>? 
                  Hành động này không thể hoàn tác.
                </p>
              </div>
              
              <div className="mt-6 flex justify-center space-x-3">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                  disabled={taskRunning}
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleDeleteVM}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                  disabled={taskRunning}
                >
                  Xóa VM
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {showVCenterConfig && (
        <VCenterConfig 
          config={vCenterConfig} 
          onSubmit={connectToVCenter} 
          onCancel={() => setShowVCenterConfig(false)} 
          isLoading={taskRunning}
          onDisconnect={disconnectVCenter}
          isConnected={vCenterConnected}
        />
      )}
    </div>
  );
}

export default App;