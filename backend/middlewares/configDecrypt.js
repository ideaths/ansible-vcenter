const fs = require('fs');
const { decrypt } = require('../utils/encryption');

function decryptConfig(configPath) {
  return (req, res, next) => {
    try {
      if (fs.existsSync(configPath)) {
        const encryptedData = fs.readFileSync(configPath, 'utf8');
        const decryptedData = decrypt(encryptedData);
        if (decryptedData) {
          req.vCenterConfig = JSON.parse(decryptedData);
        } else {
          req.vCenterConfig = null;
        }
      } else {
        req.vCenterConfig = null;
      }
      next();
    } catch (error) {
      console.error('Config decryption error:', error);
      req.vCenterConfig = null;
      next();
    }
  };
}

module.exports = decryptConfig;
