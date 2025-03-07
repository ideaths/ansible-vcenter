import React from 'react';
import { VM_STATUS } from '../../constants/vmConstants';

const VMBasicFields = ({ formData, onChange, isLoading }) => {
  return (
    <>
      {/* VM Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Tên VM</label>
        <input
          type="text"
          name="vm_name"
          value={formData.vm_name || ''}
          onChange={onChange}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          required
          disabled={isLoading}
        />
      </div>

      {/* Status */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Trạng thái</label>
        <select
          name="status"
          value={formData.status || 'off'}
          onChange={onChange}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          disabled={isLoading}
        >
          <option value="off">Tắt</option>
          <option value="on">Bật</option>
        </select>
      </div>

      {/* CPU */}
      <div>
        <label className="block text-sm font-medium text-gray-700">CPU (Cores)</label>
        <input
          type="number"
          name="num_cpus"
          value={formData.num_cpus || 2}
          onChange={onChange}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          min="1"
          required
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
          min="1024"
          step="1024"
          required
          disabled={isLoading}
        />
      </div>

      {/* Disk Size */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Disk Size (GB)</label>
        <input
          type="number"
          name="disk_size_gb"
          value={formData.disk_size_gb || 50}
          onChange={onChange}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          min="10"
          required
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

      {/* Template */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Template</label>
        <input
          type="text"
          name="template"
          value={formData.template || 'template-redhat8'}
          onChange={onChange}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          required
          disabled={isLoading}
        />
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
    </>
  );
};

export default VMBasicFields;