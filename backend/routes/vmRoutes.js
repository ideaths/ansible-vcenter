// backend/routes/vmRoutes.js
const express = require('express');
const { spawn } = require('child_process');
const path = require('path');
const vmStorage = require('../services/vmStorage');
const vCenterConfig = require('../config/vcenter');

const router = express.Router();

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

// Thêm hoặc cập nhật VM
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
    
    // Chạy Ansible playbook để áp dụng thay đổi
    try {
      const playbook = path.join(__dirname, '../ansible/manage_vcenter_vms.yml');
      
      // Lấy cấu hình vCenter hiện tại
      const vcenterConfig = await vCenterConfig.getVCenterConfig();
      
      // Thiết lập các biến cần thiết cho Ansible
      const extraVars = {
        vcenter_hostname: vcenterConfig.hostname,
        vcenter_username: vcenterConfig.username,
        vcenter_password: vcenterConfig.password,
        vcenter_validate_certs: vcenterConfig.validateCerts,
        datacenter_name: vcenterConfig.datacenter,
        csv_file: path.join(__dirname, '../data/vms.csv')
      };
      
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
        } else {
          console.error('Ansible playbook failed:', errorOutput);
        }
      });
    } catch (playbookError) {
      console.error('Lỗi khi chạy Ansible playbook:', playbookError);
    }
    
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

// Xóa VM
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
    
    // Chạy Ansible playbook để áp dụng thay đổi
    try {
      const playbook = path.join(__dirname, '../ansible/manage_vcenter_vms.yml');
      
      // Lấy cấu hình vCenter hiện tại
      const vcenterConfig = await vCenterConfig.getVCenterConfig();
      
      // Thiết lập các biến cần thiết cho Ansible
      const extraVars = {
        vcenter_hostname: vcenterConfig.hostname,
        vcenter_username: vcenterConfig.username,
        vcenter_password: vcenterConfig.password,
        vcenter_validate_certs: vcenterConfig.validateCerts,
        datacenter_name: vcenterConfig.datacenter,
        csv_file: path.join(__dirname, '../data/vms.csv')
      };
      
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
        } else {
          console.error('Ansible playbook failed:', errorOutput);
        }
      });
    } catch (playbookError) {
      console.error('Lỗi khi chạy Ansible playbook:', playbookError);
    }
    
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

// Thay đổi trạng thái nguồn VM (start/stop)
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
    
    // Chuyển đổi action thành trạng thái nguồn cho Ansible
    // start -> powered-on, stop -> powered-off
    const powerState = action === 'start' ? 'powered-on' : 'powered-off';
    
    // Lấy cấu hình vCenter hiện tại
    const vcenterConfig = await vCenterConfig.getVCenterConfig();
    
    // Thiết lập các biến cần thiết cho Ansible
    const playbook = path.join(__dirname, '../ansible/vm_power_control.yml');
    const extraVars = {
      vcenter_hostname: vcenterConfig.hostname,
      vcenter_username: vcenterConfig.username,
      vcenter_password: vcenterConfig.password,
      vcenter_validate_certs: vcenterConfig.validateCerts,
      datacenter_name: vcenterConfig.datacenter,
      vm_name: vmName,
      power_state: powerState
    };
    
    // Command để chạy Ansible playbook
    const command = 'ansible-playbook';
    const args = [
      playbook,
      '-e', JSON.stringify(extraVars)
    ];
    
    console.log(`Running power ${action} on VM ${vmName}`);
    
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
    
    // Trả về kết quả sau khi playbook hoàn thành
    ansibleProcess.on('close', (code) => {
      if (code === 0) {
        console.log(`Successfully ${action} VM ${vmName}`);
      } else {
        console.error(`Failed to ${action} VM ${vmName}:`, errorOutput);
      }
    });
    
    // Gửi phản hồi ngay lập tức mà không đợi playbook hoàn thành
    // Thực tế có thể cải tiến bằng cách sử dụng WebSocket để gửi kết quả realtime
    res.json({
      success: true,
      message: `VM ${vmName} đang được ${action === 'start' ? 'khởi động' : 'dừng'}`,
      status: 'processing'
    });
  } catch (error) {
    console.error('Lỗi khi thay đổi trạng thái nguồn VM:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Lỗi không xác định khi thay đổi trạng thái VM' 
    });
  }
});

module.exports = router;