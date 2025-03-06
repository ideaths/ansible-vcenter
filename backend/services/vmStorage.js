// backend/services/vmStorage.js
const fs = require('fs');
const path = require('path');
const Papa = require('papaparse');
const { promisify } = require('util');

const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);

// Đường dẫn đến file CSV
const CSV_FILE_PATH = path.join(__dirname, '../data/vms.csv');

// Các cột mặc định trong file CSV
const DEFAULT_CSV_HEADERS = [
  'action', 'vm_name', 'num_cpus', 'memory_mb', 'disk_size_gb', 'ip', 
  'template', 'guest_id', 'network', 'datastore', 'folder', 'hostname',
  'netmask', 'gateway', 'num_cpu_cores', 'scsi_type', 'boot_firmware',
  'network_type', 'network_device', 'disk_type', 'wait_for_ip', 'dns_servers', 'domain'
];

/**
 * Đọc dữ liệu VM từ file CSV
 * @returns {Promise<Array>} Danh sách VM
 */
async function readVMsFromCSV() {
  try {
    // Kiểm tra xem file có tồn tại không
    if (!fs.existsSync(CSV_FILE_PATH)) {
      return [];
    }

    const csvData = await readFileAsync(CSV_FILE_PATH, 'utf8');
    const result = Papa.parse(csvData, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true, // Tự động chuyển đổi kiểu dữ liệu
    });

    return result.data;
  } catch (error) {
    console.error('Lỗi khi đọc file CSV:', error);
    throw error;
  }
}

/**
 * Lưu danh sách VM vào file CSV
 * @param {Array} vms Danh sách VM
 * @returns {Promise<void>}
 */
async function saveVMsToCSV(vms) {
  try {
    // Tạo thư mục nếu chưa tồn tại
    const dir = path.dirname(CSV_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Chuyển đổi danh sách VM thành CSV
    const csv = Papa.unparse({
      fields: DEFAULT_CSV_HEADERS,
      data: vms.map(vm => {
        // Đảm bảo tất cả các trường đều có giá trị
        DEFAULT_CSV_HEADERS.forEach(header => {
          if (vm[header] === undefined) {
            vm[header] = '';
          }
        });
        return vm;
      })
    });

    // Ghi vào file CSV
    await writeFileAsync(CSV_FILE_PATH, csv, 'utf8');
    console.log('Đã lưu dữ liệu VM vào file CSV thành công');
  } catch (error) {
    console.error('Lỗi khi lưu file CSV:', error);
    throw error;
  }
}

/**
 * Thêm VM mới hoặc cập nhật VM hiện có
 * @param {Object} vm Thông tin VM
 * @returns {Promise<Array>} Danh sách VM sau khi cập nhật
 */
async function addOrUpdateVM(vm) {
  try {
    // Đọc danh sách VM hiện có
    const existingVMs = await readVMsFromCSV();
    
    // Kiểm tra xem VM đã tồn tại chưa
    const existingIndex = existingVMs.findIndex(item => item.vm_name === vm.vm_name);
    
    if (existingIndex !== -1) {
      // Cập nhật VM hiện có
      existingVMs[existingIndex] = { ...existingVMs[existingIndex], ...vm };
    } else {
      // Thêm VM mới
      existingVMs.push(vm);
    }
    
    // Lưu lại vào file CSV
    await saveVMsToCSV(existingVMs);
    
    return existingVMs;
  } catch (error) {
    console.error('Lỗi khi thêm/cập nhật VM:', error);
    throw error;
  }
}

/**
 * Xóa VM khỏi danh sách
 * @param {string} vmName Tên VM cần xóa
 * @returns {Promise<Array>} Danh sách VM sau khi xóa
 */
async function deleteVM(vmName) {
  try {
    // Đọc danh sách VM hiện có
    let existingVMs = await readVMsFromCSV();
    
    // Đánh dấu VM là "destroy" thay vì xóa hoàn toàn khỏi file
    const vmIndex = existingVMs.findIndex(vm => vm.vm_name === vmName);
    
    if (vmIndex !== -1) {
      existingVMs[vmIndex].action = 'destroy';
      
      // Lưu lại vào file CSV
      await saveVMsToCSV(existingVMs);
    }
    
    return existingVMs;
  } catch (error) {
    console.error('Lỗi khi xóa VM:', error);
    throw error;
  }
}

module.exports = {
  readVMsFromCSV,
  saveVMsToCSV,
  addOrUpdateVM,
  deleteVM
};