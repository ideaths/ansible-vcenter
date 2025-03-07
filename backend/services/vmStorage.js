// backend/services/vmStorage.js
const fs = require('fs').promises;
const path = require('path');
const Papa = require('papaparse');

// Đường dẫn đến file CSV
const CSV_FILE_PATH = path.join(__dirname, '../data/vms.csv');

// Các cột mặc định trong file CSV
const DEFAULT_CSV_HEADERS = [
  'action', 'vm_name', 'num_cpus', 'memory_mb', 'disk_size_gb', 'ip', 
  'template', 'guest_id', 'network', 'datastore', 'folder', 'hostname',
  'netmask', 'gateway', 'num_cpu_cores', 'scsi_type', 'boot_firmware',
  'network_type', 'network_device', 'disk_type', 'wait_for_ip', 'dns_servers', 'domain',
  'tags' // Thêm trường tags
];

// Giá trị mặc định cho các trường
const DEFAULT_VM_VALUES = {
  action: 'apply',
  status: 'off',  // Add default status
  num_cpus: 2,
  memory_mb: 4096,
  disk_size_gb: 50,
  template: 'template-redhat8',
  guest_id: 'rhel8_64Guest',
  network: 'VM Network',
  datastore: 'datastore1',
  folder: '/',
  netmask: '255.255.255.0',
  gateway: '192.168.1.1',
  num_cpu_cores: 1,
  scsi_type: 'paravirtual',
  boot_firmware: 'bios',
  network_type: 'static',
  network_device: 'vmxnet3',
  disk_type: 'thin',
  wait_for_ip: 'yes',
  dns_servers: '191.168.1.53',
  domain: 'idevops.io.vn',
  tags: '' // Thêm giá trị mặc định cho tags
};

/**
 * Đảm bảo VM có đầy đủ các trường với giá trị mặc định
 * @param {Object} vm Thông tin VM
 * @returns {Object} VM với các trường đầy đủ
 */
function normalizeVMData(vm) {
  // Tạo một bản sao của VM để không thay đổi đối tượng gốc
  const normalizedVM = { ...DEFAULT_VM_VALUES };

  // Chỉ copy các trường có giá trị từ VM input, giữ nguyên action
  Object.keys(vm).forEach(key => {
    if (vm[key] !== undefined && vm[key] !== '') {
      normalizedVM[key] = vm[key];
    }
  });

  // Đảm bảo hostname giống với vm_name nếu không có
  if (!normalizedVM.hostname) {
    normalizedVM.hostname = normalizedVM.vm_name;
  }

  return normalizedVM;
}

/**
 * Đọc dữ liệu VM từ file CSV
 * @returns {Promise<Array>} Danh sách VM
 */
async function readVMsFromCSV() {
  try {
    // Kiểm tra xem file có tồn tại không
    try {
      await fs.access(CSV_FILE_PATH);
    } catch {
      // Nếu file không tồn tại, trả về mảng rỗng
      return [];
    }

    const csvData = await fs.readFile(CSV_FILE_PATH, 'utf8');
    const result = Papa.parse(csvData, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true, // Tự động chuyển đổi kiểu dữ liệu
    });

    // Normalize mỗi VM trong danh sách
    return result.data.map(normalizeVMData);
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
    await fs.mkdir(dir, { recursive: true });

    // Normalize lại từng VM trước khi lưu
    const normalizedVMs = vms.map(normalizeVMData);

    // Chuyển đổi danh sách VM thành CSV
    const csv = Papa.unparse({
      fields: DEFAULT_CSV_HEADERS,
      data: normalizedVMs.map(vm => {
        // Đảm bảo tất cả các trường đều có giá trị
        const csvRow = {};
        DEFAULT_CSV_HEADERS.forEach(header => {
          csvRow[header] = vm[header] || '';
        });
        
        return csvRow;
      })
    });

    // Ghi vào file CSV
    await fs.writeFile(CSV_FILE_PATH, csv, 'utf8');
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
    // Normalize dữ liệu VM trước khi thêm/sửa
    const normalizedVM = normalizeVMData(vm);
    
    // Kiểm tra tên VM
    if (!normalizedVM.vm_name) {
      throw new Error('Tên VM là bắt buộc');
    }
    
    // Đọc danh sách VM hiện có
    const existingVMs = await readVMsFromCSV();
    
    // Kiểm tra xem VM đã tồn tại chưa
    const existingIndex = existingVMs.findIndex(item => item.vm_name === normalizedVM.vm_name);
    
    if (existingIndex !== -1) {
      // Cập nhật VM hiện có
      existingVMs[existingIndex] = { 
        ...existingVMs[existingIndex], 
        ...normalizedVM 
      };
    } else {
      // Thêm VM mới
      existingVMs.push(normalizedVM);
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
    // Kiểm tra tên VM
    if (!vmName) {
      throw new Error('Tên VM không được để trống');
    }
    
    // Đọc danh sách VM hiện có
    let existingVMs = await readVMsFromCSV();
    
    // Đánh dấu VM là "destroy" thay vì xóa hoàn toàn khỏi file
    const vmIndex = existingVMs.findIndex(vm => vm.vm_name === vmName);
    
    if (vmIndex !== -1) {
      // Cập nhật trạng thái của VM thành 'destroy'
      existingVMs[vmIndex] = {
        ...existingVMs[vmIndex],
        action: 'destroy'
      };
      
      // Lưu lại vào file CSV
      await saveVMsToCSV(existingVMs);
    } else {
      throw new Error(`Không tìm thấy VM có tên: ${vmName}`);
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
  addOrUpdateVM: addOrUpdateVM,
  deleteVM,
  normalizeVMData
};