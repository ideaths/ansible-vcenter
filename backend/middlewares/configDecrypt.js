const fs = require('fs');
const path = require('path');
const { decrypt } = require('../utils/encryption');

function decryptConfig(configPath) {
  return (req, res, next) => {
    try {
      if (fs.existsSync(configPath)) {
        const encryptedData = fs.readFileSync(configPath, 'utf8');
        const decryptedData = decrypt(encryptedData);
        req.vCenterConfig = JSON.parse(decryptedData);
      } else {
        req.vCenterConfig = null;
      }
      next();
    } catch (error) {
      next(error);
    }
  };
}

module.exports = decryptConfig;
