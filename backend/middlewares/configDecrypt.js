const fs = require('fs');
const { decrypt } = require('../utils/encryption');

function decryptConfig(configPath) {
  return (req, res, next) => {
    try {
      // Check if file exists and has content
      if (fs.existsSync(configPath)) {
        const encryptedData = fs.readFileSync(configPath, 'utf8');
        
        // Skip decryption if file is empty or invalid
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
          console.error('Decryption failed:', decryptError);
          req.vCenterConfig = null;
        }
      } else {
        // Initialize empty config file if it doesn't exist
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
