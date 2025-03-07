// backend/routes/vCenterRoutes.js
const express = require('express');
const vCenterConfig = require('../config/vcenter');

const router = express.Router();

// Kiểm tra kết nối vCenter
router.post('/connect', async (req, res) => {
  try {
    const config = req.body;
    
    // Kiểm tra các trường bắt buộc
    if (!config.hostname || !config.username || !config.password) {
      return res.status(400).json({
        success: false,
        error: 'Thiếu thông tin kết nối'
      });
    }

    // Kiểm tra kết nối
    const isConnected = await vCenterConfig.checkVCenterConnection(config);
    
    if (isConnected === true) { // Kiểm tra chính xác giá trị boolean
      // Lưu cấu hình nếu kết nối thành công
      await vCenterConfig.saveVCenterConfig(config);
      
      res.json({
        success: true,
        message: 'Kết nối thành công đến vCenter'
      });
    } else {
      res.status(401).json({
        success: false,
        error: 'Không thể kết nối đến vCenter với thông tin đã cung cấp'
      });
    }
  } catch (error) {
    console.error('Lỗi khi kết nối vCenter:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Lỗi không xác định khi kết nối vCenter'
    });
  }
});

module.exports = router;