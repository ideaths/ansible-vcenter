// backend/routes/vmRoutes.js
const express = require('express');
const { spawn } = require('child_process');
const path = require('path');
const vmStorage = require('../services/vmStorage');

const router = express.Router();

// Lấy danh sách VM
router.get('/vms', async (req, res) => {
  try {
    const vms = await vmStorage.readVMsFromCSV();
    
    // Thêm trạng thái VM từ vCenter (trong thực tế, bạn sẽ lấy từ vCenter API)
    // Ở đây, chúng ta giả định tất cả đều 'running' cho mục đích demo
    const vmsWithStatus = vms.map(vm => ({
      ...vm,
      status: vm.action === 'destroy' ? 'deleted' : 'running'
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
    const result = await runAnsiblePlaybook();
    
    res.json({
      success: true,
      message: `VM ${vmData.vm_name} đã được ${vmData.vm_name ? 'cập nhật' : 'thêm'} thành công`,
      vms: updatedVMs,
      ansibleResult: result
    });
  } catch (error) {
    console.error('Lỗi khi thêm/cập nhật VM:', error);
    res.status(500).json({ error: error.message });
  }
});

// Xóa VM
router.delete('/vms/:vmName', async (req, res) => {
  try {
    const { vmName } = req.params;
    
    // Đánh dấu VM là 'destroy' trong file CSV
    const updatedVMs = await vmStorage.deleteVM(vmName);
    
    // Chạy Ansible playbook để áp dụng thay đổi
    const result = await runAnsiblePlaybook();
    
    res.json({
      success: true,
      message: `VM ${vmName} đã được đánh dấu xóa`,
      vms: updatedVMs,
      ansibleResult: result
    });
  } catch (error) {
    console.error('Lỗi khi xóa VM:', error);
    res.status(500).json({ error: error.message });
  }
});

// Kiểm tra kết nối vCenter
router.post('/vcenter/connect', async (req, res) => {
  try {
    const { hostname, username, password, datacenter, validateCerts } = req.body;
    
    // Lưu cấu hình vCenter vào file để Ansible playbook sử dụng
    // Trong một ứng dụng thực tế, bạn có thể lưu trữ trong database hoặc sử dụng Ansible Vault
    // TODO: Implement cơ chế lưu cấu hình vCenter an toàn hơn
    
    // Mô phỏng kiểm tra kết nối
    // Trong thực tế, bạn sẽ sử dụng pyVmomi hoặc API của VMware để kiểm tra
    setTimeout(() => {
      res.json({
        success: true,
        message: `Kết nối thành công đến vCenter: ${hostname}`
      });
    }, 1000);
  } catch (error) {
    console.error('Lỗi khi kết nối vCenter:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Chạy Ansible playbook để quản lý VM
 * @returns {Promise<Object>} Kết quả thực thi
 */
function runAnsiblePlaybook() {
  return new Promise((resolve, reject) => {
    const playbook = path.join(__dirname, '../ansible/manage_vcenter_vms.yml');
    
    // Thiết lập các biến cần thiết cho Ansible
    const extraVars = {
      vcenter_hostname: 'vcenter.example.com',
      vcenter_username: 'administrator@vsphere.local',
      vcenter_password: 'password', // Trong thực tế, bạn sẽ lấy từ cấu hình an toàn
      vcenter_validate_certs: false,
      csv_file: path.join(__dirname, '../data/vms.csv')
    };
    
    // Command để chạy Ansible playbook
    const command = 'ansible-playbook';
    const args = [
      playbook,
      '-e', `'${JSON.stringify(extraVars)}'`
    ];
    
    // Chạy Ansible command
    const ansibleProcess = spawn(command, args);
    
    let output = '';
    let errorOutput = '';
    
    ansibleProcess.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    ansibleProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
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
  });
}

module.exports = router;