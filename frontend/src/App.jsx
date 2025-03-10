import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { restoreLoadingState } from './store/loadingSlice';
import { useVCenter } from './hooks/useVCenter';
import { useVM } from './hooks/useVM';
import { useAnsible } from './hooks/useAnsible';
import VMList from './components/VMList';
import VMForm from './components/VMForm';
import LogViewer from './components/LogViewer';
import LoadingOverlay from './components/LoadingOverlay';
import apiService from './services/api';
import DeleteConfirmDialog from './components/DeleteConfirmDialog';
import Toast, { useToast } from './components/Toast';
import LoginPage from './pages/LoginPage';

// Import CSS standard và các component khác

function App() {
  const dispatch = useDispatch();
  const toast = useToast(); // Sử dụng hook useToast
  
  const [vms, setVms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [taskRunning, setTaskRunning] = useState(false);
  const [taskPower, setTaskPower] = useState(false);
  const [taskLog, setTaskLog] = useState([]);
  const [showLogs, setShowLogs] = useState(false);
  const [showVCenterConfig, setShowVCenterConfig] = useState(false);
  const [powerMessage, setPowerMessage] = useState('');

  // Hàm hiển thị thông báo sử dụng Toast
  const onMessage = (msg) => {
    if (msg.text) {
      switch (msg.type) {
        case 'error':
          toast.error(msg.text);
          break;
        case 'success':
          toast.success(msg.text);
          break;
        case 'info':
          toast.info(msg.text);
          break;
        default:
          toast.info(msg.text);
      }
    }
  };
  
  const onLog = (log) => setTaskLog(prev => Array.isArray(log) ? [...prev, ...log] : [...prev, log]);

  const { vCenterConfig, vCenterConnected, connectToVCenter, disconnectVCenter, connectionError } = 
    useVCenter(onMessage, onLog);

  const { currentVm, showForm, showDeleteConfirm, setCurrentVm, setShowForm, 
    setShowDeleteConfirm, handleSubmitVM, handleDeleteVM, handlePowerAction } = 
    useVM(onMessage, onLog, fetchVMs, setTaskPower);

  const { ansibleRunning, runAnsible } = useAnsible(onMessage, onLog, fetchVMs);

  async function fetchVMs() {
    setLoading(true);
    onLog('Đang lấy danh sách VM từ server...');
    
    try {
      const data = await apiService.getVMs();
      setVms(data);
      onLog(`Đã lấy ${data.length} VM từ server`);
    } catch (error) {
      onMessage({
        text: 'Lỗi khi tải danh sách VM: ' + (error.error || error.message),
        type: 'error'
      });
      onLog(`Lỗi khi lấy danh sách VM: ${error.error || error.message}`);
    } finally {
      setLoading(false); 
    }
  }

  // Handle adding new VM
  const handleAddVM = () => {
    setCurrentVm(null);
    setShowForm(true);
  };

  // Handle editing VM
  const handleEditVM = (vm) => {
    setCurrentVm(vm);
    setShowForm(true);
  };

  // Handle delete confirmation
  const handleDeleteConfirm = (vm) => {
    setCurrentVm(vm);
    setShowDeleteConfirm(true);
  };

  // Sửa lại để dùng với taskPower
  const handlePowerActionWithState = async (vm, action) => {
    setTaskPower(true);
    setPowerMessage(`Đang chạy Ansible để ${action === 'start' ? 'khởi động' : 'dừng'} VM: ${vm.vm_name}`);
    
    try {
      await handlePowerAction(vm, action);
    } finally {
      setTaskPower(false);
      setPowerMessage('');
    }
  };
  
  // Handle running Ansible
  const handleRunAnsible = async () => {
    if (!ansibleRunning) {
      await runAnsible();
    }
  };

  // Restore loading state on mount  
  useEffect(() => {
    dispatch(restoreLoadingState());
  }, [dispatch]);

  // Nếu chưa kết nối vCenter, hiển thị trang login
  if (!vCenterConnected) {
    return (
      <>
        <Toast toasts={toast.toasts} removeToast={toast.removeToast} />
        <LoginPage 
          onConnect={connectToVCenter}
          isLoading={taskRunning}
          connectionError={connectionError}
        />
      </>
    );
  }

  // Otherwise show main content
  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Toast toasts={toast.toasts} removeToast={toast.removeToast} />
      <LoadingOverlay taskPower={taskPower} powerMessage={powerMessage} />
      
      {/* Header với một ombre améliorée */}
      <header className="bg-blue-700 text-white p-4 shadow-md" style={{
        background: 'linear-gradient(to right, #2563eb, #1d4ed8)',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
      }}>
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold tracking-tight">Quản lý VM với Ansible</h1>
          <button
            onClick={disconnectVCenter}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-all duration-200 hover:-translate-y-0.5 shadow"
            style={{
              transition: 'all 0.2s ease',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
            }}
          >
            Đăng xuất
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow container mx-auto p-4">
        <div className="space-y-4">
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
            onPowerAction={handlePowerActionWithState}
            onConfigVCenter={() => setShowVCenterConfig(true)}
            onRunAnsible={handleRunAnsible}
            taskRunning={taskRunning}
            taskPower={taskPower}
            onRefresh={fetchVMs}
            onMessage={onMessage}
            onLog={onLog}
          />
          
          {/* Log Viewer với animation améliorée */}
          {showLogs && (
            <LogViewer 
              logs={taskLog} 
              isLoading={taskRunning || taskPower}
              onClose={() => setShowLogs(false)} 
            />
          )}
        </div>
      </main>

      {/* Modals with improved UI */}
      {showForm && (
        <VMForm 
          vm={currentVm} 
          vms={vms}
          onSubmit={handleSubmitVM} 
          onCancel={() => setShowForm(false)} 
          isLoading={taskRunning} 
        />
      )}
      
      {showDeleteConfirm && (
        <DeleteConfirmDialog
          vm={currentVm}
          onConfirm={handleDeleteVM}
          onCancel={() => setShowDeleteConfirm(false)}
          isLoading={taskRunning}
        />
      )}

      {/* Style globaux injectés directement */}
      <style jsx global>{`
        button {
          transition: all 0.15s ease;
        }
        
        button:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }
        
        button:active:not(:disabled) {
          transform: translateY(0);
          box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
        }
        
        button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}

export default App;