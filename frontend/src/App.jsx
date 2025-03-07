import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { restoreLoadingState } from './store/loadingSlice';
import { useVCenter } from './hooks/useVCenter';
import { useVM } from './hooks/useVM';
import { useAnsible } from './hooks/useAnsible';
import VMList from './components/VMList';
import VMForm from './components/VMForm';
import VCenterConfig from './components/VCenterConfig';
import LogViewer from './components/LogViewer';
import LoadingOverlay from './components/LoadingOverlay';
import apiService from './services/api';
import { AlertCircle } from 'lucide-react';
import MessageAlert from './components/MessageAlert';
import DeleteConfirmDialog from './components/DeleteConfirmDialog';
import Toast from './components/Toast';
import LoginPage from './pages/LoginPage';

// Import CSS standard - pas besoin de fichier CSS supplémentaire
// Les améliorations seront ajoutées directement aux composants

function App() {
  const dispatch = useDispatch();
  const [vms, setVms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [taskRunning, setTaskRunning] = useState(false);
  const [taskPower, setTaskPower] = useState(false);
  const [taskLog, setTaskLog] = useState([]);
  const [showLogs, setShowLogs] = useState(false);
  const [showVCenterConfig, setShowVCenterConfig] = useState(false);
  const [powerMessage, setPowerMessage] = useState('');

  const onMessage = (msg) => setMessage(msg);
  const onLog = (log) => setTaskLog(prev => Array.isArray(log) ? [...prev, ...log] : [...prev, log]);

  const { vCenterConfig, vCenterConnected, connectToVCenter, disconnectVCenter } = 
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

  // Auto-hide messages after 5 seconds
  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => {
        setMessage({ text: '', type: '' });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  // Restore loading state on mount  
  useEffect(() => {
    dispatch(restoreLoadingState());
  }, [dispatch]);

  // Nếu chưa kết nối vCenter, hiển thị trang login
  if (!vCenterConnected) {
    return (
      <LoginPage 
        onConnect={connectToVCenter}
        isLoading={taskRunning}
      />
    );
  }

  // Otherwise show main content
  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <LoadingOverlay taskPower={taskPower} powerMessage={powerMessage} />
      <Toast 
        message={message} 
        onClose={() => setMessage({ text: '', type: '' })} 
      />
      
      {/* Header avec une ombre améliorée */}
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
          
          {/* Log Viewer avec animation améliorée */}
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

      {/* Styles globaux injectés directement */}
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

        /* Animation du toast */
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        
        .toast {
          animation: slideInRight 0.3s ease forwards;
        }
        
        /* Amélioration des formulaires */
        input:focus, select:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
        }
        
        /* Amélioration du tableau */
        table tbody tr:hover {
          background-color: #eff6ff;
        }
        
        /* Styles pour les badges d'état */
        .statusBadge {
          transition: all 0.2s ease;
        }
        
        .statusRunning {
          background-color: #d1fae5;
          color: #065f46;
          border: 1px solid #a7f3d0;
        }
        
        .statusStopped {
          background-color: #f3f4f6;
          color: #4b5563;
          border: 1px solid #e5e7eb;
        }
        
        .statusDeleted {
          background-color: #fee2e2;
          color: #b91c1c;
          border: 1px solid #fecaca;
        }
      `}</style>
    </div>
  );
}

export default App;