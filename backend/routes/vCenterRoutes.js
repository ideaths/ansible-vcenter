// backend/routes/vCenterRoutes.js
const express = require('express');
const vCenterConfig = require('../config/vcenter');

const router = express.Router();

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
    
    try {
      // Sử dụng hàm kiểm tra kết nối từ config
      const result = await vCenterConfig.testVCenterConnection(config);
      
      if (result.success) {
        res.json({
          success: true,
          message: `Kết nối thành công đến vCenter: ${config.hostname}`,
          datacenterFound: result.datacenter_found
        });
      } else {
        // Trả về lỗi chi tiết từ kết quả
        res.status(400).json({
          success: false,
          error: result.message || 'Không thể kết nối đến vCenter'
        });
      }
    } catch (connectionError) {
      // Xử lý lỗi kết nối chi tiết
      console.error('Chi tiết lỗi kết nối:', connectionError);
      res.status(500).json({
        success: false,
        error: connectionError.message || 'Lỗi không xác định khi kết nối vCenter'
      });
    }
  } catch (error) {
    console.error('Lỗi xử lý kết nối vCenter:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Lỗi máy chủ nội bộ' 
    });
  }
});

module.exports = router;