// backend/routes/vmRoutes.js
const express = require('express');
const { spawn } = require('child_process');
const path = require('path');
const vmStorage = require('../services/vmStorage');
const vCenterConfig = require('../config/vcenter');

const router = express.Router();

// Công cụ để chạy Ansible playbook
const runAnsiblePlaybook = async (playbook, extraVars) => {
  return new Promise((resolve, reject) => {
    try {
      // Command để chạy Ansible playbook
      const command = 'ansible-playbook';
      const args = [
        playbook,
        '-e', JSON.stringify(extraVars)
      ];
      
      console.log('Running Ansible playbook:', command, args.join(' '));
      
      // Chạy Ansible command
      const ansibleProcess = spawn(command, args);
      
      let output = '';
      let errorOutput = '';
      
      ansibleProcess.stdout.on('data', (data) => {
        const chunk = data.toString();
        output += chunk;
        console.log('Ansible output:', chunk);
      });
      
      ansibleProcess.stderr.on('data', (data) => {
        const chunk = data.toString();
        errorOutput += chunk;
        console.error('Ansible error:', chunk);
      });
      
      ansibleProcess.on('close', (code) => {
        if (code === 0) {
          console.log('Ansible playbook executed successfully');
          resolve({ success: true, output });
        } else {
          console.error('Ansible playbook failed:', errorOutput);
          reject(new Error(`Ansible execution failed with code ${code}: ${errorOutput}`));
        }
      });
    } catch (error) {
      reject(error);
    }
  });
};

// Lấy danh sách VM
router.get('/vms', async (req, res) => {
  try {
    // Đọc danh sách VM từ CSV
    const vms = await vmStorage.readVMsFromCSV();
    
    // Thêm trạng thái VM 
    const vmsWithStatus = vms.map(vm => ({
      ...vm,
      // Giả lập trạng thái dựa trên action
      status: vm.action === 'destroy' ? 'deleted' : 'running'
    }));
    
    // Trả về danh sách VM
    res.json(vmsWithStatus);
  } catch (error) {
    console.error('Lỗi khi lấy danh sách VM:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Lỗi không xác định khi lấy danh sách VM' 
    });
  }
});

// Thêm hoặc cập nhật VM (không chạy Ansible)
router.post('/vms', async (req, res) => {
  try {
    const vmData = req.body;
    
    // Validate tên VM
    if (!vmData.vm_name) {
      return res.status(400).json({
        success: false,
        error: 'Tên VM là bắt buộc'
      });
    }
    
    // Đảm bảo action là 'apply'
    vmData.action = 'apply';
    
    // Thêm hoặc cập nhật VM vào file CSV
    const updatedVMs = await vmStorage.addOrUpdateVM(vmData);
    
    res.json({
      success: true,
      message: `VM ${vmData.vm_name} đã được ${req.body.vm_name ? 'cập nhật' : 'thêm'} thành công`,
      vms: updatedVMs
    });
  } catch (error) {
    console.error('Lỗi khi thêm/cập nhật VM:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Lỗi không xác định khi thêm/cập nhật VM' 
    });
  }
});

// Xóa VM (chỉ đánh dấu destroy trong CSV)
router.delete('/vms/:vmName', async (req, res) => {
  try {
    const { vmName } = req.params;
    
    // Kiểm tra tên VM
    if (!vmName) {
      return res.status(400).json({ 
        success: false, 
        error: 'Tên VM không được để trống' 
      });
    }
    
    // Đánh dấu VM là 'destroy' trong file CSV
    const updatedVMs = await vmStorage.deleteVM(vmName);
    
    res.json({
      success: true,
      message: `VM ${vmName} đã được đánh dấu xóa`,
      vms: updatedVMs
    });
  } catch (error) {
    console.error('Lỗi khi xóa VM:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Lỗi không xác định khi xóa VM' 
    });
  }
});

// Đăng ký thay đổi trạng thái nguồn VM (start/stop) - không chạy Ansible
router.post('/vms/:vmName/power', async (req, res) => {
  try {
    const { vmName } = req.params;
    const { action } = req.body;
    
    if (!['start', 'stop'].includes(action)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Action không hợp lệ. Chỉ hỗ trợ start hoặc stop.' 
      });
    }
    
    // Chỉ lưu trạng thái mà không thực hiện action
    res.json({
      success: true,
      message: `VM ${vmName} đã được đăng ký thay đổi trạng thái nguồn: ${action}`,
      status: 'pending'
    });
  } catch (error) {
    console.error('Lỗi khi đăng ký thay đổi trạng thái nguồn VM:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Lỗi không xác định khi đăng ký thay đổi trạng thái VM' 
    });
  }
});

// Endpoint mới: chạy Ansible để áp dụng tất cả thay đổi
router.post('/ansible/run', async (req, res) => {
  try {
    // Lấy cấu hình vCenter
    const vcenterConfig = await vCenterConfig.getVCenterConfig();
    
    // Thiết lập các biến cần thiết cho Ansible
    const playbook = path.join(__dirname, '../ansible/manage_vcenter_vms.yml');
    const extraVars = {
      vcenter_hostname: vcenterConfig.hostname,
      vcenter_username: vcenterConfig.username,
      vcenter_password: vcenterConfig.password,
      vcenter_validate_certs: vcenterConfig.validateCerts,
      datacenter_name: vcenterConfig.datacenter,
      csv_file: path.join(__dirname, '../data/vms.csv')
    };
    
    console.log('Executing Ansible playbook to apply all changes to vCenter');
    
    // Chạy Ansible playbook
    try {
      const result = await runAnsiblePlaybook(playbook, extraVars);
      
      res.json({
        success: true,
        message: 'Tất cả thay đổi đã được áp dụng thành công lên vCenter',
        details: result
      });
    } catch (ansibleError) {
      console.error('Lỗi khi chạy Ansible playbook:', ansibleError);
      
      res.status(500).json({
        success: false,
        error: ansibleError.message || 'Lỗi không xác định khi chạy Ansible',
        details: ansibleError
      });
    }
  } catch (error) {
    console.error('Lỗi khi chuẩn bị chạy Ansible:', error);
    
    res.status(500).json({
      success: false,
      error: error.message || 'Lỗi không xác định khi chuẩn bị chạy Ansible'
    });
  }
});

module.exports = router;