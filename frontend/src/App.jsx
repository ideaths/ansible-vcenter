import React, { useState, useEffect, useRef } from 'react';
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

function App() {
  const dispatch = useDispatch();
  const [vms, setVms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [taskRunning, setTaskRunning] = useState(false);
  const [taskLog, setTaskLog] = useState([]);
  const [showLogs, setShowLogs] = useState(false);
  const [showVCenterConfig, setShowVCenterConfig] = useState(false);

  const onMessage = (msg) => setMessage(msg);
  const onLog = (log) => setTaskLog(prev => Array.isArray(log) ? [...prev, ...log] : [...prev, log]);

  const { vCenterConfig, vCenterConnected, connectToVCenter, disconnectVCenter } = 
    useVCenter(onMessage, onLog);

  const { currentVm, showForm, showDeleteConfirm, setCurrentVm, setShowForm, 
    setShowDeleteConfirm, handleSubmitVM, handleDeleteVM, handlePowerAction } = 
    useVM(onMessage, onLog, fetchVMs);

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

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <LoadingOverlay />
      
      {/* Header */}
      <header className="bg-blue-700 text-white p-4 shadow-md">
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold">Quản lý VM với Ansible</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow container mx-auto p-4">
        <MessageAlert message={message} />

        {/* Main App Content */}
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
    </div>
  );
}

export default App;