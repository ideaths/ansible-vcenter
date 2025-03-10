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
      const playbookPath = path.resolve(__dirname, '..', 'ansible', playbook);
      const command = 'ansible-playbook';
      const args = [
        playbookPath,
        '-e', JSON.stringify(extraVars),
        '-v' // Add verbose output
      ];
      
      console.log('Running Ansible playbook with command:', command, args.join(' '));
      
      const ansibleProcess = spawn(command, args);
      let output = '';
      let errorOutput = '';

      ansibleProcess.stdout.on('data', (data) => {
        const str = data.toString();
        output += str;
        console.log('[Ansible stdout]:', str);
      });

      ansibleProcess.stderr.on('data', (data) => {
        const str = data.toString();
        errorOutput += str;
        console.error('[Ansible stderr]:', str);
      });

      ansibleProcess.on('error', (error) => {
        console.error('[Ansible process error]:', error);
        reject(new Error(`Failed to spawn Ansible process: ${error.message}`));
      });

      ansibleProcess.on('close', (code) => {
        console.log('[Ansible process closed] with code:', code);
        if (code === 0) {
          resolve({ success: true, output });
        } else {
          reject(new Error(`Ansible playbook failed with code ${code}\nOutput: ${output}\nError: ${errorOutput}`));
        }
      });
    } catch (error) {
      console.error('[Ansible execution error]:', error);
      reject(error);
    }
  });
};

// Thêm biến để lưu trạng thái Ansible job
let ansibleJobRunning = false;
let ansibleStartTime = null;

// Endpoint để kiểm tra trạng thái Ansible
router.get('/ansible/status', (req, res) => {
  res.json({
    isRunning: ansibleJobRunning,
    startTime: ansibleStartTime
  });
});

// Lấy danh sách VM
router.get('/vms', async (req, res) => {
  try {
    // Đọc danh sách VM từ CSV
    const vms = await vmStorage.readVMsFromCSV();
    
    // Trả về danh sách VM
    res.json(vms);
  } catch (error) {
    console.error('Lỗi khi lấy danh sách VM:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Lỗi không xác định khi lấy danh sách VM' 
    });
  }
});

// Cập nhật trong file backend/routes/vmRoutes.js
// Thay thế phần xử lý POST /vms

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
    
    // Đọc danh sách VM hiện có
    const existingVMs = await vmStorage.readVMsFromCSV();
    
    // Kiểm tra xem đang tạo mới hay chỉnh sửa
    const existingVM = existingVMs.find(vm => vm.vm_name === vmData.vm_name);
    const isNewVM = !existingVM; // Nếu không tìm thấy VM, tức là đang tạo mới
    
    // CHỈ kiểm tra tên VM trùng lặp khi tạo mới
    if (isNewVM) {
      const foundByName = existingVMs.find(vm => vm.vm_name === vmData.vm_name);
      
      if (foundByName) {
        return res.status(400).json({
          success: false,
          error: `Tên VM "${vmData.vm_name}" đã tồn tại, vui lòng chọn tên khác`
        });
      }
      
      // CHỈ kiểm tra IP trùng lặp khi tạo mới
      if (vmData.ip) {
        const foundByIP = existingVMs.find(vm => 
          vm.ip === vmData.ip && vm.action !== 'destroy'
        );
        
        if (foundByIP) {
          return res.status(400).json({
            success: false,
            error: `IP ${vmData.ip} đã được sử dụng bởi VM "${foundByIP.vm_name}", vui lòng chọn IP khác`
          });
        }
      }
    }
    
    // Kiểm tra điều kiện action và status (áp dụng cho cả tạo mới và chỉnh sửa)
    if (vmData.action === 'destroy' && vmData.status !== 'off') {
      // Tự động sửa lại status thành off nếu action là destroy
      vmData.status = 'off';
    }
    
    // Thêm hoặc cập nhật VM vào file CSV
    const updatedVMs = await vmStorage.addOrUpdateVM(vmData);
    
    res.json({
      success: true,
      message: `VM ${vmData.vm_name} đã được ${isNewVM ? 'thêm' : 'cập nhật'} thành công`,
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
    
    if (!vmName || vmName === 'undefined') {
      return res.status(400).json({ 
        success: false, 
        error: 'Tên VM không hợp lệ hoặc không được cung cấp' 
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

// Endpoint to handle VM power actions (start/stop)
// Chỉnh sửa trong file backend/routes/vmRoutes.js
// Cụ thể sửa đoạn code trong endpoint /vms/:vmName/power

router.post('/vms/:vmName/power', async (req, res) => {
  const { action } = req.body;
  try {
    const { vmName } = req.params;
    if (!['start', 'stop'].includes(action)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Action không hợp lệ. Chỉ hỗ trợ start hoặc stop.' 
      });
    }

    // Đọc danh sách VM hiện có
    const existingVMs = await vmStorage.readVMsFromCSV();
    
    // Tìm VM trong danh sách
    const vm = existingVMs.find(vm => vm.vm_name === vmName);
    
    // Kiểm tra VM có tồn tại không
    if (!vm) {
      return res.status(404).json({
        success: false,
        error: `Không tìm thấy VM có tên: ${vmName}`
      });
    }
    
    // KIỂM TRA ĐIỀU KIỆN: action phải là apply mới thực hiện được
    if (vm.action !== 'apply') {
      return res.status(400).json({
        success: false,
        error: `Không thể ${action === 'start' ? 'khởi động' : 'dừng'} VM ${vmName} vì VM đang có trạng thái "destroy"`
      });
    }

    // Get vCenter configuration
    const vcenterConfig = await vCenterConfig.getVCenterConfig();

    // Set up variables for Ansible playbook
    const playbook = path.join(__dirname, '../ansible/vm_power_control.yml');
    const extraVars = {
      vcenter_hostname: vcenterConfig.hostname,
      vcenter_username: vcenterConfig.username,
      vcenter_password: vcenterConfig.password,
      vcenter_validate_certs: vcenterConfig.validateCerts,
      datacenter_name: vcenterConfig.datacenter,
      vm_name: vmName,
      power_state: action === 'start' ? 'powered-on' : 'powered-off'
    };

    console.log(`Executing Ansible playbook to ${action} VM: ${vmName}`);

    // Run Ansible playbook
    const result = await runAnsiblePlaybook(playbook, extraVars);
    
    // Cập nhật status trong CSV sau khi thành công
    if (result.success) {
      try {
        // Tìm VM cần cập nhật
        const vmIndex = existingVMs.findIndex(vm => vm.vm_name === vmName);
        
        if (vmIndex !== -1) {
          // Cập nhật trạng thái (status) của VM
          existingVMs[vmIndex] = {
            ...existingVMs[vmIndex],
            status: action === 'start' ? 'on' : 'off'
          };
          
          // Lưu lại vào CSV
          await vmStorage.saveVMsToCSV(existingVMs);
          console.log(`Updated VM ${vmName} status to ${action === 'start' ? 'on' : 'off'} in CSV`);
        }
      } catch (csvError) {
        console.error('Lỗi khi cập nhật CSV:', csvError);
        // Không trả về lỗi vì power action đã thành công
      }
    }

    res.json({
      success: true,
      message: `VM ${vmName} đã được ${action === 'start' ? 'khởi động' : 'dừng'} thành công`,
      details: result
    });
  } catch (error) {
    console.error(`Lỗi khi ${action} VM:`, error);
    res.status(500).json({ 
      success: false, 
      error: error.message || `Lỗi không xác định khi ${action} VM` 
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
    
    // Set trạng thái đang chạy
    ansibleJobRunning = true;
    ansibleStartTime = new Date();
    
    // Chạy Ansible playbook
    try {
      const result = await runAnsiblePlaybook(playbook, extraVars);
      
      // Reset trạng thái sau khi chạy xong
      ansibleJobRunning = false;
      ansibleStartTime = null;
      
      res.json({
        success: true,
        message: 'Tất cả thay đổi đã được áp dụng thành công lên vCenter',
        details: result
      });
    } catch (ansibleError) {
      // Reset trạng thái nếu có lỗi
      ansibleJobRunning = false;
      ansibleStartTime = null;
      console.error('Lỗi khi chạy Ansible playbook:', ansibleError);
      
      res.status(500).json({
        success: false,
        error: ansibleError.message || 'Lỗi không xác định khi chạy Ansible',
        details: ansibleError
      });
    }
  } catch (error) {
    ansibleJobRunning = false;
    ansibleStartTime = null;
    console.error('Lỗi khi chuẩn bị chạy Ansible:', error);
    
    res.status(500).json({
      success: false,
      error: error.message || 'Lỗi không xác định khi chuẩn bị chạy Ansible'
    });
  }
});

module.exports = router;