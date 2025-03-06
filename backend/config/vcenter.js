// backend/config/vcenter.js
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);

// Đường dẫn đến file cấu hình
const CONFIG_PATH = path.join(__dirname, '../data/vcenter-config.json');

/**
 * Mặc định cấu hình vCenter
 */
const DEFAULT_CONFIG = {
  hostname: 'vcenter.idevops.io.vn',
  username: 'administrator@vsphere.local',
  password: '123abc@A',
  datacenter: 'Home',
  validateCerts: false
};

/**
 * Lấy cấu hình vCenter
 * @returns {Promise<Object>} Cấu hình vCenter
 */
async function getVCenterConfig() {
  try {
    // Kiểm tra xem file có tồn tại không
    if (!fs.existsSync(CONFIG_PATH)) {
      // Tạo file cấu hình mặc định nếu chưa tồn tại
      await saveVCenterConfig(DEFAULT_CONFIG);
      return DEFAULT_CONFIG;
    }

    const configData = await readFileAsync(CONFIG_PATH, 'utf8');
    return JSON.parse(configData);
  } catch (error) {
    console.error('Lỗi khi đọc cấu hình vCenter:', error);
    return DEFAULT_CONFIG;
  }
}

/**
 * Lưu cấu hình vCenter
 * @param {Object} config Cấu hình vCenter cần lưu
 * @returns {Promise<Object>} Cấu hình đã lưu
 */
async function saveVCenterConfig(config) {
  try {
    // Tạo thư mục nếu chưa tồn tại
    const dir = path.dirname(CONFIG_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Kiểm tra các trường bắt buộc
    const requiredFields = ['hostname', 'username', 'datacenter'];
    requiredFields.forEach(field => {
      if (!config[field]) {
        throw new Error(`Thiếu trường bắt buộc: ${field}`);
      }
    });

    // Ghi vào file JSON
    await writeFileAsync(
      CONFIG_PATH, 
      JSON.stringify({
        ...DEFAULT_CONFIG,
        ...config
      }, null, 2), 
      'utf8'
    );
    console.log('Đã lưu cấu hình vCenter thành công');

    return config;
  } catch (error) {
    console.error('Lỗi khi lưu cấu hình vCenter:', error);
    throw error;
  }
}

/**
 * Kiểm tra kết nối vCenter
 * @param {Object} config Cấu hình vCenter
 * @returns {Promise<boolean>} Kết quả kiểm tra
 */
async function testVCenterConnection(config) {
  try {
    // Trong môi trường thực tế, bạn sẽ sử dụng pyVmomi hoặc API của VMware để kiểm tra
    // Ở đây, chúng ta giả định kết nối thành công sau 1 giây
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Lưu cấu hình sau khi kiểm tra thành công
    await saveVCenterConfig(config);
    
    return true;
  } catch (error) {
    console.error('Lỗi khi kiểm tra kết nối vCenter:', error);
    return false;
  }
}

module.exports = {
  getVCenterConfig,
  saveVCenterConfig,
  testVCenterConnection
};