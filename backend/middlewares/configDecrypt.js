// backend/middlewares/configDecrypt.js
const { decrypt } = require('../utils/encryption');

/**
 * Middleware to handle decryption of sensitive configuration data
 * 
 * This middleware checks for encrypted fields in request bodies and attempts
 * to decrypt them before passing the request to the route handler.
 */
const configDecrypt = (req, res, next) => {
  try {
    const config = req.body;
    
    // Check if the password field might be encrypted
    if (config && config.password) {
      // Only attempt to decrypt if it matches the encrypted format (has a : character)
      if (typeof config.password === 'string' && config.password.includes(':')) {
        try {
          // Try to decrypt the password
          config.password = decrypt(config.password);
        } catch (error) {
          // Log the error and return a 400 response
          console.error('Decryption error:', error);
          return res.status(400).json({
            success: false,
            error: 'Invalid encrypted data format'
          });
        }
      }
      // If not in encrypted format, assume it's already plain text
    }
    
    // Continue to the next middleware/route handler
    next();
  } catch (error) {
    console.error('Error in configDecrypt middleware:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error processing configuration'
    });
  }
};

module.exports = configDecrypt;