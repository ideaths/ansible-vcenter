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
    // Validate required fields
    const { host, username, password, datacenter } = req.body;
    
    if (!host || !username || !password) {
      return res.status(400).json({
        success: false,
        error: 'Host, username and password are required'
      });
    }
    
    const config = {
      hostname: host,
      username: username,
      password: password,
      datacenter: datacenter || 'Home',
      validateCerts: req.body.validateCerts === true
    };
    
    // Convert to string before encryption
    const configString = JSON.stringify(config);
    
    try {
      const encryptedData = encrypt(configString);
      
      // Create data directory if it doesn't exist
      const dataDir = path.dirname(CONFIG_PATH);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      
      // Save encrypted data
      fs.writeFileSync(CONFIG_PATH, encryptedData);
      
      res.json({ 
        success: true, 
        message: 'vCenter configuration saved successfully' 
      });
    } catch (encryptError) {
      console.error('Encryption error:', encryptError);
      res.status(500).json({
        success: false,
        error: 'Failed to encrypt configuration: ' + encryptError.message
      });
    }
  } catch (error) {
    console.error('Error saving vCenter config:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to save vCenter configuration: ' + error.message 
    });
  }
});

router.get('/vcenter/config', (req, res) => {
  if (req.vCenterConfig) {
    res.json({ 
      success: true,
      config: {
        hostname: req.vCenterConfig.hostname,
        username: req.vCenterConfig.username,
        datacenter: req.vCenterConfig.datacenter,
        validateCerts: req.vCenterConfig.validateCerts
      }
    });
  } else {
    res.json({ 
      success: false, 
      error: 'No configuration found',
      config: null 
    });
  }
});

module.exports = router;