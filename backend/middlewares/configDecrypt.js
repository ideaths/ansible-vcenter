const fs = require('fs');
const path = require('path');
const { decrypt } = require('../utils/encryption');

function decryptConfig(configPath) {
  return (req, res, next) => {
    try {
      if (fs.existsSync(configPath)) {
        const encryptedData = fs.readFileSync(configPath, 'utf8');
        
        // Handle empty or whitespace-only content
        if (!encryptedData || encryptedData.trim() === '') {
          req.vCenterConfig = null;
          return next();
        }

        try {
          const decryptedData = decrypt(encryptedData.trim());
          if (decryptedData) {
            req.vCenterConfig = JSON.parse(decryptedData);
          } else {
            req.vCenterConfig = null;
          }
        } catch (decryptError) {
          // Log error but don't throw it
          console.error('Decryption failed:', decryptError);
          req.vCenterConfig = null;
        }
      } else {
        // Create directory if it doesn't exist
        const dir = path.dirname(configPath);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        // Initialize with empty config
        fs.writeFileSync(configPath, '', { encoding: 'utf8' });
        req.vCenterConfig = null;
      }
      next();
    } catch (error) {
      console.error('Config handling error:', error);
      req.vCenterConfig = null;
      next();
    }
  };
}

module.exports = decryptConfig;
