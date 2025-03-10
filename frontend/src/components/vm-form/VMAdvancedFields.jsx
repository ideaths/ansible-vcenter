import React from 'react';

const VMAdvancedFields = ({ formData, onChange, isLoading, errors = {} }) => {
  return (
    <>
      {/* SCSI Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Loại SCSI
          {errors.scsi_type && <span className="ml-1 text-red-500">*</span>}
        </label>
        <select
          name="scsi_type"
          value={formData.scsi_type || 'paravirtual'}
          onChange={onChange}
          className={`mt-1 block w-full border ${errors.scsi_type ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm p-2`}
          disabled={isLoading}
        >
          <option value="paravirtual">Paravirtual</option>
          <option value="lsi">LSI Logic</option>
          <option value="buslogic">BusLogic</option>
        </select>
        {errors.scsi_type && (
          <p className="mt-1 text-sm text-red-500">{errors.scsi_type}</p>
        )}
      </div>

      {/* Boot Firmware */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Firmware khởi động
          {errors.boot_firmware && <span className="ml-1 text-red-500">*</span>}
        </label>
        <select
          name="boot_firmware"
          value={formData.boot_firmware || 'bios'}
          onChange={onChange}
          className={`mt-1 block w-full border ${errors.boot_firmware ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm p-2`}
          disabled={isLoading}
        >
          <option value="bios">BIOS</option>
          <option value="efi">EFI</option>
        </select>
        {errors.boot_firmware && (
          <p className="mt-1 text-sm text-red-500">{errors.boot_firmware}</p>
        )}
      </div>

      {/* Disk Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Loại đĩa
          {errors.disk_type && <span className="ml-1 text-red-500">*</span>}
        </label>
        <select
          name="disk_type"
          value={formData.disk_type || 'thin'}
          onChange={onChange}
          className={`mt-1 block w-full border ${errors.disk_type ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm p-2`}
          disabled={isLoading}
        >
          <option value="thin">Thin Provisioning</option>
          <option value="thick">Thick Provisioning</option>
          <option value="eager_zeroed">Eager Zeroed Thick</option>
        </select>
        {errors.disk_type && (
          <p className="mt-1 text-sm text-red-500">{errors.disk_type}</p>
        )}
      </div>

      {/* Datastore */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Datastore
          {errors.datastore && <span className="ml-1 text-red-500">*</span>}
        </label>
        <input
          type="text"
          name="datastore"
          value={formData.datastore || 'datastore1'}
          onChange={onChange}
          className={`mt-1 block w-full border ${errors.datastore ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm p-2`}
          required
          disabled={isLoading}
        />
        {errors.datastore && (
          <p className="mt-1 text-sm text-red-500">{errors.datastore}</p>
        )}
      </div>

      {/* Folder */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Folder
          {errors.folder && <span className="ml-1 text-red-500">*</span>}
        </label>
        <input
          type="text"
          name="folder"
          value={formData.folder || '/'}
          onChange={onChange}
          className={`mt-1 block w-full border ${errors.folder ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm p-2`}
          disabled={isLoading}
        />
        {errors.folder && (
          <p className="mt-1 text-sm text-red-500">{errors.folder}</p>
        )}
      </div>

      {/* Hostname */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Hostname
          {errors.hostname && <span className="ml-1 text-red-500">*</span>}
        </label>
        <input
          type="text"
          name="hostname"
          value={formData.hostname || formData.vm_name || ''}
          onChange={onChange}
          className={`mt-1 block w-full border ${errors.hostname ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm p-2`}
          placeholder="Mặc định sẽ lấy từ Tên VM"
          disabled={isLoading}
        />
        {errors.hostname && (
          <p className="mt-1 text-sm text-red-500">{errors.hostname}</p>
        )}
      </div>

      {/* Wait for IP Checkbox */}
      <div className="flex items-center pt-5">
        <input
          type="checkbox"
          id="wait_for_ip"
          name="wait_for_ip"
          checked={formData.wait_for_ip === 'yes' || formData.wait_for_ip === true}
          onChange={onChange}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          disabled={isLoading}
        />
        <label htmlFor="wait_for_ip" className="ml-2 block text-sm text-gray-900">
          Chờ địa chỉ IP
        </label>
      </div>
    </>
  );
};

export default VMAdvancedFields;