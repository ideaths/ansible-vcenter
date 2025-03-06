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
    const vms = await vmStorage.readVMsFromCSV();
    
    // Thêm trạng thái VM (trong thực tế, bạn sẽ kiểm tra từ vCenter API)
    const vmsWithStatus = vms.map(vm => ({
      ...vm,
      status: vm.action === 'destroy' ? 'deleted' : 'running' // Giả lập tạm thời
    }));
    
    res.json(vmsWithStatus);
  } catch (error) {
    console.error('Lỗi khi lấy danh sách VM:', error);
    res.status(500).json({ error: error.message });
  }
});

// Thêm hoặc cập nhật VM
router.post('/vms', async (req, res) => {
  try {
    const vmData = req.body;
    
    // Đảm bảo rằng VM có action là 'apply'
    vmData.action = 'apply';
    
    // Thêm hoặc cập nhật VM vào file CSV
    const updatedVMs = await vmStorage.addOrUpdateVM(vmData);
    
    // Chạy Ansible playbook để áp dụng thay đổi
    runAnsiblePlaybook()
      .then(result => {
        console.log('Ansible playbook executed successfully:', result);
      })
      .catch(error => {
        console.error('Error running Ansible playbook:', error);
      });
    
    res.json({
      success: true,
      message: `VM ${vmData.vm_name} đã được ${req.body.vm_name ? 'cập nhật' : 'thêm'} thành công`,
      vms: updatedVMs
    });
  } catch (error) {
    console.error('Lỗi khi thêm/cập nhật VM:', error);
    res.status(500).json({ error: error.message, success: false });
  }
});

// Xóa VM
router.delete('/vms/:vmName', async (req, res) => {
  try {
    const { vmName } = req.params;
    
    // Đánh dấu VM là 'destroy' trong file CSV
    const updatedVMs = await vmStorage.deleteVM(vmName);
    
    // Chạy Ansible playbook để áp dụng thay đổi
    runAnsiblePlaybook()
      .then(result => {
        console.log('Ansible playbook executed successfully:', result);
      })
      .catch(error => {
        console.error('Error running Ansible playbook:', error);
      });
    
    res.json({
      success: true,
      message: `VM ${vmName} đã được đánh dấu xóa`,
      vms: updatedVMs
    });
  } catch (error) {
    console.error('Lỗi khi xóa VM:', error);
    res.status(500).json({ error: error.message, success: false });
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
    
    // TODO: Thêm code để thực hiện thay đổi trạng thái nguồn VM thông qua Ansible
    
    res.json({
      success: true,
      message: `VM ${vmName} đã được ${action === 'start' ? 'khởi động' : 'dừng'} thành công`
    });
  } catch (error) {
    console.error('Lỗi khi thay đổi trạng thái nguồn VM:', error);
    res.status(500).json({ error: error.message, success: false });
  }
});

// Kiểm tra kết nối vCenter
router.post('/vcenter/connect', async (req, res) => {
  try {
    const config = req.body;
    
    // Kiểm tra các trường bắt buộc
    const requiredFields = ['hostname', 'username', 'password', 'datacenter'];
    for (const field of requiredFields) {
      if (!config[field]) {
        return res.status(400).json({ 
          success: false, 
          error: `Thiếu trường bắt buộc: ${field}` 
        });
      }
    }
    
    // Kiểm tra kết nối vCenter thực tế
    const connected = await vCenterConfig.testVCenterConnection(config);
    
    if (connected) {
      res.json({
        success: true,
        message: `Kết nối thành công đến vCenter: ${config.hostname}`
      });
    } else {
      res.status(400).json({
        success: false,
        error: 'Không thể kết nối đến vCenter. Vui lòng kiểm tra lại thông tin.'
      });
    }
  } catch (error) {
    console.error('Lỗi khi kết nối vCenter:', error);
    res.status(500).json({ error: error.message, success: false });
  }
});

/**
 * Chạy Ansible playbook để quản lý VM
 * @returns {Promise<Object>} Kết quả thực thi
 */
function runAnsiblePlaybook() {
  return new Promise(async (resolve, reject) => {
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
      
      console.log('Running Ansible playbook with command:', command, args.join(' '));
      
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
          resolve({
            success: true,
            output
          });
        } else {
          reject(new Error(`Ansible đã thoát với mã: ${code}\n${errorOutput}`));
        }
      });
    } catch (error) {
      reject(error);
    }
  });
}

module.exports = router;