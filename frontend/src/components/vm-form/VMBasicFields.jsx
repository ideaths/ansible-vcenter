import React from 'react';import React from 'react';















































































































export default VMBasicFields;};  );    </>      </div>        </select>          <option value="on">Bật</option>          <option value="off">Tắt</option>        >          disabled={isLoading}          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"          onChange={onChange}          value={formData.status || 'off'}          name="status"        <select        <label className="block text-sm font-medium text-gray-700">Trạng thái</label>      <div>      {/* VM Status */}      </div>        </select>          <option value="windows9Server64Guest">Windows Server 2019 (64-bit)</option>          <option value="ubuntu64Guest">Ubuntu Linux (64-bit)</option>          <option value="rhel8_64Guest">RHEL 8 (64-bit)</option>        >          disabled={isLoading}          required          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"          onChange={onChange}          value={formData.guest_id || 'rhel8_64Guest'}          name="guest_id"        <select        <label className="block text-sm font-medium text-gray-700">Guest OS</label>      <div>      {/* Guest OS */}      </div>        />          disabled={isLoading}          required          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"          onChange={onChange}          value={formData.template || 'template-redhat8'}          name="template"          type="text"        <input        <label className="block text-sm font-medium text-gray-700">Template</label>      <div>      {/* Template */}      </div>        />          disabled={isLoading}          required          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"          onChange={onChange}          value={formData.disk_size_gb || 50}          name="disk_size_gb"          type="number"        <input        <label className="block text-sm font-medium text-gray-700">Dung lượng đĩa (GB)</label>      <div>      {/* Disk Size */}      </div>        />          disabled={isLoading}          required          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"          onChange={onChange}          value={formData.memory_mb || 4096}          name="memory_mb"          type="number"        <input        <label className="block text-sm font-medium text-gray-700">RAM (MB)</label>      <div>      {/* RAM */}      </div>        />          disabled={isLoading}          required          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"          onChange={onChange}          value={formData.num_cpus || 2}          name="num_cpus"          type="number"        <input        <label className="block text-sm font-medium text-gray-700">CPU</label>      <div>      {/* CPU */}      </div>        />          disabled={isLoading}          required          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"          onChange={onChange}          value={formData.vm_name || ''}          name="vm_name"          type="text"        <input        <label className="block text-sm font-medium text-gray-700">Tên VM</label>      <div>      {/* VM Name */}    <>  return (const VMBasicFields = ({ formData, onChange, isLoading }) => {import { VM_STATUS } from '../../constants/vmConstants';
const VMBasicFields = ({ formData, onChange, isLoading }) => {
  return (
    <>
      {/* Tên VM */}
      <div className="md:col-span-2 lg:col-span-1">
        <label className="block text-sm font-medium text-gray-700">Tên VM *</label>
        <input
          type="text"
          name="vm_name"
          value={formData.vm_name || ''}
          onChange={onChange}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          required
          disabled={isLoading}
          placeholder="Nhập tên máy ảo"
        />
      </div>

      {/* Template */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Template</label>
        <select
          name="template"
          value={formData.template || 'template-redhat8'}
          onChange={onChange}
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
          onChange={onChange}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          required
          disabled={isLoading}
        >
          <option value="rhel8_64Guest">RHEL 8 (64-bit)</option>
          <option value="ubuntu64Guest">Ubuntu Linux (64-bit)</option>
          <option value="windows9Server64Guest">Windows Server 2019 (64-bit)</option>
        </select>
      </div>

      {/* CPU */}
      <div>
        <label className="block text-sm font-medium text-gray-700">CPU</label>
        <input
          type="number"
          name="num_cpus"
          value={formData.num_cpus || 2}
          onChange={onChange}
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
          onChange={onChange}
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
          onChange={onChange}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          required
          min="10"
          disabled={isLoading}
        />
      </div>

      {/* Số nhân CPU - Moved here */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Số nhân CPU</label>
        <input
          type="number"
          name="num_cpu_cores"
          value={formData.num_cpu_cores || 1}
          onChange={onChange}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          min="1"
          disabled={isLoading}
        />
      </div>
    </>
  );
};

export default VMBasicFields;
