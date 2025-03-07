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
 * Tạo file Python tạm thời để kiểm tra kết nối vCenter
 * @param {Object} config Cấu hình vCenter
 * @returns {string} Đường dẫn đến file tạm
 */
const createTempPythonScript = (config) => {
  const scriptContent = `
import ssl
import requests

def check_vcenter_connection():
    url = "https://${config.hostname}/rest/com/vmware/cis/session"
    headers = {
        "vmware-use-header-authn": "true",
        "Authorization": "Basic ${Buffer.from(`${config.username}:${config.password}`).toString('base64')}"
    }
    try:
        response = requests.post(url, headers=headers, verify=${config.validateCerts})
        if response.status_code == 200:
            return True
        else:
            return False
    except requests.exceptions.SSLError as ssl_error:
        print(f"SSL Error: {ssl_error}")
        return False
    except requests.exceptions.RequestException as req_error:
        print(f"Request Error: {req_error}")
        return False

if __name__ == "__main__":
    if check_vcenter_connection():
        print("Connection successful")
    else:
        print("Connection failed")
`;

  const tempFilePath = path.join(__dirname, '../data/temp_vcenter_check.py');
  fs.writeFileSync(tempFilePath, scriptContent);
  return tempFilePath;
};

/**
 * Kiểm tra kết nối vCenter bằng cách sử dụng Python script
 * @param {Object} config Cấu hình vCenter
 * @returns {Promise<Object>} Kết quả kiểm tra
 */
const checkVCenterConnection = async (config) => {
  const tempScriptPath = createTempPythonScript(config);

  return new Promise((resolve, reject) => {
    const pythonProcess = spawn('python3', [tempScriptPath]);

    pythonProcess.stdout.on('data', (data) => {
      const output = data.toString();
      if (output.includes('Connection successful')) {
        resolve(true);
      } else if (output.includes('Connection failed')) {
        resolve(false);
      }
    });

    pythonProcess.stderr.on('data', (data) => {
      console.error('Python error:', data.toString());
      reject(new Error(data.toString()));
    });

    pythonProcess.on('close', (code) => {
      fs.unlinkSync(tempScriptPath); // Xóa file tạm sau khi hoàn thành
      if (code !== 0) {
        reject(new Error(`Python script exited with code ${code}`));
      }
    });
  });
};

module.exports = {
  getVCenterConfig,
  saveVCenterConfig,
  checkVCenterConnection
};