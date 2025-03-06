// backend/config/vcenter.js
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const { spawn } = require('child_process');

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
  password: '',
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
 * Kiểm tra kết nối vCenter bằng Ansible
 * @param {Object} config Cấu hình vCenter
 * @returns {Promise<boolean>} Kết quả kiểm tra
 */
async function testVCenterConnection(config) {
  return new Promise((resolve, reject) => {
    try {
      // Convert boolean to Python format (True/False)
      const validateCertsInPython = config.validateCerts ? "True" : "False";
      
      const pythonScript = `
import sys
import ssl
from pyVim import connect
from pyVmomi import vim

# Vô hiệu hóa cảnh báo chứng chỉ nếu không xác thực
if not ${validateCertsInPython}:
    ssl._create_default_https_context = ssl._create_unverified_context

try:
    # Thử kết nối đến vCenter
    service_instance = connect.SmartConnect(
        host="${config.hostname}",
        user="${config.username}",
        pwd="${config.password}",
        port=443
    )
    
    # Kiểm tra xem datacenter có tồn tại không
    content = service_instance.RetrieveContent()
    datacenters = content.rootFolder.childEntity
    datacenter_found = False
    
    for dc in datacenters:
        if dc.name == "${config.datacenter}":
            datacenter_found = True
            break
    
    if not datacenter_found:
        print(f"Datacenter ${config.datacenter} không tồn tại", file=sys.stderr)
        sys.exit(1)
    
    # Ngắt kết nối
    connect.Disconnect(service_instance)
    print("Kết nối thành công")
    sys.exit(0)
except Exception as e:
    print(f"Lỗi kết nối: {str(e)}", file=sys.stderr)
    sys.exit(1)
`;

      // Tạo file tạm thời để chứa script Python
      const tempScriptPath = path.join(__dirname, '../data/temp_vcenter_check.py');
      fs.writeFileSync(tempScriptPath, pythonScript, 'utf8');

      // Chạy script Python
      const pythonProcess = spawn('python3', [tempScriptPath]);

      let output = '';
      let errorOutput = '';

      pythonProcess.stdout.on('data', (data) => {
        output += data.toString();
      });

      pythonProcess.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });

      pythonProcess.on('close', async (code) => {
        // Xóa file tạm thời
        try {
          fs.unlinkSync(tempScriptPath);
        } catch (e) {
          console.error('Không thể xóa file tạm thời:', e);
        }

        if (code === 0) {
          // Lưu cấu hình sau khi kiểm tra thành công
          await saveVCenterConfig(config);
          resolve(true);
        } else {
          console.error('Lỗi khi kiểm tra kết nối vCenter:', errorOutput);
          resolve(false);
        }
      });
    } catch (error) {
      console.error('Lỗi khi kiểm tra kết nối vCenter:', error);
      resolve(false);
    }
  });
}

module.exports = {
  getVCenterConfig,
  saveVCenterConfig,
  testVCenterConnection
};