// backend/routes/vCenterRoutes.js
const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const { encrypt } = require('../utils/encryption');
const decryptConfig = require('../middlewares/configDecrypt');

const CONFIG_PATH = path.join(__dirname, '../data/vcenter-config.json');

// Middleware để giải mã config
router.use(decryptConfig(CONFIG_PATH));

router.post('/vcenter/connect', (req, res) => {
  try {
    const config = {
      host: req.body.host,
      username: req.body.username,
      password: req.body.password,
      port: req.body.port || 443
    };
    
    // Mã hóa toàn bộ object config
    const encryptedData = encrypt(JSON.stringify(config));
    
    // Lưu dữ liệu đã mã hóa
    fs.writeFileSync(CONFIG_PATH, encryptedData);
    
    res.json({ success: true, message: 'vCenter configuration saved' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/vcenter/config', (req, res) => {
  // req.vCenterConfig đã được giải mã bởi middleware
  if (req.vCenterConfig) {
    // Trả về thông tin đã được giải mã
    res.json({ 
      success: true,
      config: {
        host: req.vCenterConfig.host,
        username: req.vCenterConfig.username,
        // Không trả về password
        port: req.vCenterConfig.port
      }
    });
  } else {
    res.status(404).json({ success: false, error: 'No configuration found' });
  }
});

module.exports = router;