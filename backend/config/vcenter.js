// backend/config/vcenter.js
const fs = require('fs').promises;
const path = require('path');
const { spawn } = require('child_process');

// Đường dẫn đến file cấu hình
const CONFIG_PATH = path.join(__dirname, '../data/vcenter-config.json');

/**
 * Lấy cấu hình vCenter
 * @returns {Promise<Object>} Cấu hình vCenter
 */
async function getVCenterConfig() {
  try {
    // Kiểm tra xem file có tồn tại không
    try {
      await fs.access(CONFIG_PATH);
    } catch {
      // Nếu file không tồn tại, tạo file với cấu hình mặc định
      await saveVCenterConfig(DEFAULT_CONFIG);
      return DEFAULT_CONFIG;
    }

    const configData = await fs.readFile(CONFIG_PATH, 'utf8');
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
    await fs.mkdir(dir, { recursive: true });

    // Kiểm tra các trường bắt buộc
    const requiredFields = ['hostname', 'username', 'datacenter'];
    requiredFields.forEach(field => {
      if (!config[field]) {
        throw new Error(`Thiếu trường bắt buộc: ${field}`);
      }
    });

    // Merge với cấu hình mặc định
    const fullConfig = { ...DEFAULT_CONFIG, ...config };

    // Ghi vào file JSON
    await fs.writeFile(
      CONFIG_PATH, 
      JSON.stringify(fullConfig, null, 2), 
      'utf8'
    );
    console.log('Đã lưu cấu hình vCenter thành công');

    return fullConfig;
  } catch (error) {
    console.error('Lỗi khi lưu cấu hình vCenter:', error);
    throw error;
  }
}

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
 * Kiểm tra kết nối vCenter bằng cách sử dụng Python script
 * @param {Object} config Cấu hình vCenter
 * @returns {Promise<Object>} Kết quả kiểm tra
 */
async function testVCenterConnection(config) {
  return new Promise((resolve, reject) => {
    // Validate input
    const requiredFields = ['hostname', 'username', 'password', 'datacenter'];
    for (const field of requiredFields) {
      if (!config[field]) {
        return reject(new Error(`Thiếu trường bắt buộc: ${field}`));
      }
    }

    // Tạo Python script để kiểm tra kết nối
    const pythonScript = `
import sys
import ssl
import json
from pyVim import connect
from pyVmomi import vim

# Tắt cảnh báo chứng chỉ nếu không xác thực
validate_certs = ${config.validateCerts ? 'True' : 'False'}
if not validate_certs:
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
    
    # Ngắt kết nối
    connect.Disconnect(service_instance)
    
    # Trả về kết quả dưới dạng JSON
    result = {
        'success': True,
        'message': 'Kết nối thành công',
        'datacenter_found': datacenter_found
    }
    print(json.dumps(result))
    sys.exit(0)

except Exception as e:
    # Trả về lỗi dưới dạng JSON
    error_result = {
        'success': False,
        'message': str(e)
    }
    print(json.dumps(error_result))
    sys.exit(1)
`;

    // Tạo file tạm thời để chứa script Python
    const tempScriptPath = path.join(__dirname, '../data/temp_vcenter_check.py');
    
    fs.writeFile(tempScriptPath, pythonScript, 'utf8')
      .then(() => {
        // Chạy script Python
        const process = spawn('python3', [tempScriptPath]);
        
        let output = '';
        let errorOutput = '';

        process.stdout.on('data', (data) => {
          output += data.toString();
        });

        process.stderr.on('data', (data) => {
          errorOutput += data.toString();
        });

        process.on('close', async (code) => {
          // Xóa file tạm
          try {
            await fs.unlink(tempScriptPath);
          } catch {}

          if (code === 0) {
            try {
              const result = JSON.parse(output);
              
              if (result.success) {
                // Lưu cấu hình sau khi kiểm tra thành công
                await saveVCenterConfig(config);
              }
              
              resolve(result);
            } catch (parseError) {
              reject(new Error('Lỗi phân tích kết quả'));
            }
          } else {
            try {
              const errorResult = JSON.parse(errorOutput);
              resolve(errorResult);
            } catch {
              reject(new Error(errorOutput || 'Lỗi không xác định khi kết nối vCenter'));
            }
          }
        });

        process.on('error', (err) => {
          console.error('Lỗi khi chạy script Python:', err);
          reject(new Error('Không thể chạy script kiểm tra vCenter'));
        });
      })
      .catch(writeError => {
        console.error('Lỗi khi tạo file tạm:', writeError);
        reject(new Error('Không thể tạo script kiểm tra vCenter'));
      });
  });
}

module.exports = {
  getVCenterConfig,
  saveVCenterConfig,
  testVCenterConnection
};