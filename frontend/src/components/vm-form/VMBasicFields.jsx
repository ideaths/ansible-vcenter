import React from 'react';
import { VM_STATUS, VM_ACTIONS } from '../../constants/vmConstants';

const VMBasicFields = ({ formData, onChange, isLoading, errors = {}, isNewVM }) => {
  // Hàm xử lý status để đảm bảo status hiển thị đúng
  const getVMStatus = (status) => {
    if (status === 'on' || status === 'running' || status === VM_STATUS.RUNNING) {
      return 'on';
    }
    return 'off';
  };

  return (
    <>
      {/* VM Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Tên VM
          {errors.vm_name && <span className="ml-1 text-red-500">*</span>}
        </label>
        <input
          type="text"
          name="vm_name"
          value={formData.vm_name || ''}
          onChange={onChange}
          className={`mt-1 block w-full border ${errors.vm_name ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm p-2`}
          required
          disabled={isLoading}
        />
        {errors.vm_name && (
          <p className="mt-1 text-sm text-red-500">{errors.vm_name}</p>
        )}
      </div>

      {/* Action */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Action
          {errors.action && <span className="ml-1 text-red-500">*</span>}
        </label>
        <select
          name="action"
          value={formData.action || VM_ACTIONS.APPLY}
          onChange={onChange}
          className={`mt-1 block w-full border ${errors.action ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm p-2`}
          disabled={isLoading}
        >
          <option value={VM_ACTIONS.APPLY}>Apply (Thêm/Cập nhật)</option>
          <option value={VM_ACTIONS.DESTROY}>Destroy (Xóa)</option>
        </select>
        {errors.action && (
          <p className="mt-1 text-sm text-red-500">{errors.action}</p>
        )}
        {formData.action === VM_ACTIONS.DESTROY && !errors.action && (
          <p className="mt-1 text-sm text-amber-600">Khi action là Destroy, status sẽ tự động được đặt thành Off</p>
        )}
      </div>

      {/* Status */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Trạng thái
          {errors.status && <span className="ml-1 text-red-500">*</span>}
        </label>
        <select
          name="status"
          value={getVMStatus(formData.status)}
          onChange={onChange}
          className={`mt-1 block w-full border ${errors.status ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm p-2`}
          disabled={isLoading || formData.action === VM_ACTIONS.DESTROY} // Vô hiệu hóa khi action là destroy
        >
          <option value="off">Tắt</option>
          <option value="on" disabled={formData.action === VM_ACTIONS.DESTROY}>Bật</option>
        </select>
        {errors.status && (
          <p className="mt-1 text-sm text-red-500">{errors.status}</p>
        )}
      </div>

      {/* Số nhân CPU */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Số nhân CPU
          {errors.num_cpu_cores && <span className="ml-1 text-red-500">*</span>}
        </label>
        <input
          type="number"
          name="num_cpu_cores"
          value={formData.num_cpu_cores || 1}
          onChange={onChange}
          className={`mt-1 block w-full border ${errors.num_cpu_cores ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm p-2`}
          min="1"
          disabled={isLoading}
        />
        {errors.num_cpu_cores && (
          <p className="mt-1 text-sm text-red-500">{errors.num_cpu_cores}</p>
        )}
      </div>

      {/* CPU */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          CPU (Cores)
          {errors.num_cpus && <span className="ml-1 text-red-500">*</span>}
        </label>
        <input
          type="number"
          name="num_cpus"
          value={formData.num_cpus || 2}
          onChange={onChange}
          className={`mt-1 block w-full border ${errors.num_cpus ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm p-2`}
          min="1"
          required
          disabled={isLoading}
        />
        {errors.num_cpus && (
          <p className="mt-1 text-sm text-red-500">{errors.num_cpus}</p>
        )}
      </div>

      {/* RAM */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          RAM (MB)
          {errors.memory_mb && <span className="ml-1 text-red-500">*</span>}
        </label>
        <input
          type="number"
          name="memory_mb"
          value={formData.memory_mb || 4096}
          onChange={onChange}
          className={`mt-1 block w-full border ${errors.memory_mb ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm p-2`}
          min="1024"
          step="1024"
          required
          disabled={isLoading}
        />
        {errors.memory_mb && (
          <p className="mt-1 text-sm text-red-500">{errors.memory_mb}</p>
        )}
      </div>

      {/* Disk Size */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Disk Size (GB)
          {errors.disk_size_gb && <span className="ml-1 text-red-500">*</span>}
        </label>
        <input
          type="number"
          name="disk_size_gb"
          value={formData.disk_size_gb || 50}
          onChange={onChange}
          className={`mt-1 block w-full border ${errors.disk_size_gb ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm p-2`}
          min="10"
          required
          disabled={isLoading}
        />
        {errors.disk_size_gb && (
          <p className="mt-1 text-sm text-red-500">{errors.disk_size_gb}</p>
        )}
      </div>

      {/* Template */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Template
          {errors.template && <span className="ml-1 text-red-500">*</span>}
        </label>
        <input
          type="text"
          name="template"
          value={formData.template || 'template-redhat8'}
          onChange={onChange}
          className={`mt-1 block w-full border ${errors.template ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm p-2`}
          required
          disabled={isLoading}
        />
        {errors.template && (
          <p className="mt-1 text-sm text-red-500">{errors.template}</p>
        )}
      </div>

      {/* Guest OS */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Guest OS
          {errors.guest_id && <span className="ml-1 text-red-500">*</span>}
        </label>
        <select
          name="guest_id"
          value={formData.guest_id || 'rhel8_64Guest'}
          onChange={onChange}
          className={`mt-1 block w-full border ${errors.guest_id ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm p-2`}
          required
          disabled={isLoading}
        >
          <option value="rhel8_64Guest">RHEL 8 (64-bit)</option>
          <option value="ubuntu64Guest">Ubuntu Linux (64-bit)</option>
          <option value="windows9Server64Guest">Windows Server 2019 (64-bit)</option>
        </select>
        {errors.guest_id && (
          <p className="mt-1 text-sm text-red-500">{errors.guest_id}</p>
        )}
      </div>
    </>
  );
};

export default VMBasicFields;