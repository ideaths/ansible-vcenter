const express = require('express');
const router = express.Router();
const vmService = require('../services/vmService');

// Lấy danh sách VM
router.get('/vms', async (req, res) => {
  try {
    const vms = await vmService.getVMs();
    res.json(vms);
  } catch (error) {
    console.error('Lỗi khi lấy danh sách VM:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Lỗi không xác định khi lấy danh sách VM' 
    });
  }
});

// Tạo hoặc cập nhật VM
router.post('/vms', async (req, res) => {
  try {
    const vmData = req.body;
    const result = await vmService.createOrUpdateVM(vmData);
    res.json(result);
  } catch (error) {
    console.error('Lỗi khi tạo hoặc cập nhật VM:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Lỗi không xác định khi tạo hoặc cập nhật VM' 
    });
  }
});

// Xóa VM
router.delete('/vms/:vmName', async (req, res) => {
  try {
    const vmName = req.params.vmName;
    const result = await vmService.deleteVM(vmName);
    res.json(result);
  } catch (error) {
    console.error('Lỗi khi xóa VM:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Lỗi không xác định khi xóa VM' 
    });
  }
});

// Thay đổi trạng thái VM
router.post('/vms/:vmName/power', async (req, res) => {
  try {
    const vmName = req.params.vmName;
    const action = req.body.action;
    const result = await vmService.powerActionVM(vmName, action);
    res.json(result);
  } catch (error) {
    console.error('Lỗi khi thay đổi trạng thái VM:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Lỗi không xác định khi thay đổi trạng thái VM' 
    });
  }
});

module.exports = router;