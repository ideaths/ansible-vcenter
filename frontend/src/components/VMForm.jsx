import React, { useState, useEffect } from 'react';
import { XCircle, Save, RefreshCw } from 'lucide-react';

const VMForm = ({ vm, onSubmit, onCancel, isLoading }) => {
  // Giá trị mặc định cho VM
  const defaultVM = {
    action: 'apply',
    vm_name: '',
    num_cpus: 2,
    memory_mb: 4096,
    disk_size_gb: 50,
    ip: '',
    template: 'template-redhat8',
    guest_id: 'rhel8_64Guest',
    network: 'VM Network', 
    datastore: 'datastore1',
    folder: '/',
    hostname: '',
    netmask: '255.255.255.0',
    gateway: '192.168.1.1', 
    // Thêm các trường mới
    num_cpu_cores: 1,
    scsi_type: 'paravirtual',
    boot_firmware: 'bios',
    network_type: 'static', 
    network_device: 'vmxnet3',
    disk_type: 'thin',
    wait_for_ip: 'yes',
    dns_servers: '191.168.1.53',
    domain: 'idevops.io.vn'
  };

  const [formData, setFormData] = useState(vm || defaultVM);
  
  // Đồng bộ dữ liệu từ prop khi thay đổi
  useEffect(() => {
    // Merge dữ liệu prop với giá trị mặc định
    const mergedData = { ...defaultVM, ...(vm || {}) };
    setFormData(mergedData);
  }, [vm]);

  // Xử lý thay đổi trường input
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Xử lý các loại input khác nhau
    if (type === 'checkbox') {
      setFormData({
        ...formData,
        [name]: checked ? 'yes' : 'no'
      });
    } else if (type === 'number') {
      setFormData({
        ...formData,
        [name]: parseInt(value, 10)
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  // Xử lý submit form
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate tên VM
    if (!formData.vm_name || formData.vm_name.trim() === '') {
      alert('Tên VM không được để trống');
      return;
    }

    // Loại bỏ các trường rỗng
    const cleanedData = { ...formData };
    Object.keys(cleanedData).forEach(key => {
      // Loại bỏ các trường rỗng và null
      if (cleanedData[key] === '' || cleanedData[key] === null || 
          (typeof cleanedData[key] === 'string' && cleanedData[key].trim() === '')) {
        delete cleanedData[key];
      }
    });

    // Thêm hostname nếu chưa có
    if (!cleanedData.hostname) {
      cleanedData.hostname = cleanedData.vm_name;
    }
    
    onSubmit(cleanedData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 overflow-y-auto py-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-full overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">
              {formData.vm_name ? `Chỉnh sửa VM: ${formData.vm_name}` : 'Thêm VM mới'}
            </h2>
            <button 
              onClick={onCancel}
              className="text-gray-500 hover:text-gray-700"
              disabled={isLoading}
              type="button"
            >
              <XCircle className="h-6 w-6" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Tên VM */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Tên VM *</label>
                <input
                  type="text"
                  name="vm_name"
                  value={formData.vm_name || ''}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  required
                  disabled={isLoading}
                  placeholder="Nhập tên máy ảo"
                />
              </div>
              
              {/* CPU */}
              <div>
                <label className="block text-sm font-medium text-gray-700">CPU</label>
                <input
                  type="number"
                  name="num_cpus"
                  value={formData.num_cpus || 2}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  required
                  min="1"
                  disabled={isLoading}
                />
              </div>
              
              {/* RAM */}
              <div>
                <label className="block text-sm font-medium text-gray-700">RAM (MB)</label>
                <input
                  type="number"
                  name="memory_mb"
                  value={formData.memory_mb || 4096}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  required
                  min="1024"
                  step="1024"
                  disabled={isLoading}
                />
              </div>
              
              {/* Disk */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Disk (GB)</label>
                <input
                  type="number"
                  name="disk_size_gb"
                  value={formData.disk_size_gb || 50}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  required
                  min="10"
                  disabled={isLoading}
                />
              </div>
              
              {/* IP */}
              <div>
                <label className="block text-sm font-medium text-gray-700">IP</label>
                <input
                  type="text"
                  name="ip"
                  value={formData.ip || ''}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  placeholder="192.168.1.10"
                  required
                  disabled={isLoading}
                  pattern="^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$"
                />
              </div>
              
              {/* Template */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Template</label>
                <select
                  name="template"
                  value={formData.template || 'template-redhat8'}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  required
                  disabled={isLoading}
                >
                  <option value="template-redhat8">template-redhat8</option>
                  <option value="template-ubuntu20">template-ubuntu20</option>
                  <option value="template-windows2019">template-windows2019</option>
                </select>
              </div>
              
              {/* Guest OS */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Guest OS</label>
                <select
                  name="guest_id"
                  value={formData.guest_id || 'rhel8_64Guest'}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  required
                  disabled={isLoading}
                >
                  <option value="rhel8_64Guest">RHEL 8 (64-bit)</option>
                  <option value="ubuntu64Guest">Ubuntu Linux (64-bit)</option>
                  <option value="windows9Server64Guest">Windows Server 2019 (64-bit)</option>
                </select>
              </div>
              
              {/* Network */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Network</label>
                <input
                  type="text"
                  name="network"
                  value={formData.network || 'VM Network'}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  required
                  disabled={isLoading}
                />
              </div>
              
              {/* Datastore */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Datastore</label>
                <input
                  type="text"
                  name="datastore"
                  value={formData.datastore || 'datastore1'}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  required
                  disabled={isLoading}
                />
              </div>
              
              {/* Folder */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Folder</label>
                <input
                  type="text"
                  name="folder"
                  value={formData.folder || '/'}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  disabled={isLoading}
                />
              </div>
              
              {/* Hostname */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Hostname (để trống = tên VM)
                </label>
                <input
                  type="text"
                  name="hostname"
                  value={formData.hostname || ''}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  placeholder="Tự động sử dụng tên VM nếu trống"
                  disabled={isLoading}
                />
              </div>
              
              {/* Netmask */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Netmask</label>
                <input
                  type="text"
                  name="netmask"
                  value={formData.netmask || '255.255.255.0'}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  disabled={isLoading}
                />
              </div>
              
              {/* Gateway */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Gateway</label>
                <input
                  type="text"
                  name="gateway"
                  value={formData.gateway || '192.168.1.1'}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  disabled={isLoading}
                />
              </div>

              {/* Số nhân CPU */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Số nhân CPU</label>
                <input
                  type="number"
                  name="num_cpu_cores"
                  value={formData.num_cpu_cores || 1}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  min="1"
                  disabled={isLoading}
                />
              </div>
              
              {/* Loại SCSI */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Loại SCSI</label>
                <select
                  name="scsi_type"
                  value={formData.scsi_type || 'paravirtual'}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  disabled={isLoading}
                >
                  <option value="paravirtual">Paravirtual</option>
                  <option value="lsi">LSI Logic</option>
                  <option value="buslogic">BusLogic</option>
                </select>
              </div>

              {/* Firmware khởi động */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Firmware khởi động</label>
                <select
                  name="boot_firmware"
                  value={formData.boot_firmware || 'bios'}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  disabled={isLoading}
                >
                  <option value="bios">BIOS</option>
                  <option value="efi">EFI</option>
                </select>
              </div>

              {/* Loại mạng */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Loại mạng</label>
                <select
                  name="network_type"
                  value={formData.network_type || 'static'}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  disabled={isLoading}
                >
                  <option value="static">Tĩnh (Static)</option>
                  <option value="dhcp">Động (DHCP)</option>
                </select>
              </div>

              {/* Loại đĩa */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Loại đĩa</label>
                <select
                  name="disk_type"
                  value={formData.disk_type || 'thin'}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  disabled={isLoading}
                >
                  <option value="thin">Thin Provisioning</option>
                  <option value="thick">Thick Provisioning</option>
                  <option value="eager_zeroed">Eager Zeroed Thick</option>
                </select>
              </div>

              {/* DNS Servers */}
              <div>
                <label className="block text-sm font-medium text-gray-700">DNS Servers</label>
                <input
                  type="text"
                  name="dns_servers"
                  value={formData.dns_servers || '191.168.1.53'}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  placeholder="Nhập địa chỉ DNS"
                  disabled={isLoading}
                />
              </div>

              {/* Domain */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Domain</label>
                <input
                  type="text"
                  name="domain"
                  value={formData.domain || 'idevops.io.vn'}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  placeholder="Nhập domain"
                  disabled={isLoading}
                />
              </div>

              {/* Wait for IP Checkbox */}
              <div className="flex items-center md:col-span-2">
                <input
                  type="checkbox"
                  id="wait_for_ip"
                  name="wait_for_ip"
                  checked={formData.wait_for_ip === 'yes' || formData.wait_for_ip === true}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  disabled={isLoading}
                />
                <label htmlFor="wait_for_ip" className="ml-2 block text-sm text-gray-900">
                  Chờ địa chỉ IP
                </label>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                disabled={isLoading}
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="animate-spin h-4 w-4 mr-2" />
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Lưu
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default VMForm;