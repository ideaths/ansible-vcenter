import React from 'react';

const VMAdvancedFields = ({ formData, onChange, isLoading }) => {
  return (
    <>

      {/* SCSI Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Loại SCSI</label>
        <select
          name="scsi_type"
          value={formData.scsi_type || 'paravirtual'}
          onChange={onChange}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          disabled={isLoading}
        >
          <option value="paravirtual">Paravirtual</option>
          <option value="lsi">LSI Logic</option>
          <option value="buslogic">BusLogic</option>
        </select>
      </div>

      {/* Boot Firmware */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Firmware khởi động</label>
        <select
          name="boot_firmware"
          value={formData.boot_firmware || 'bios'}
          onChange={onChange}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          disabled={isLoading}
        >
          <option value="bios">BIOS</option>
          <option value="efi">EFI</option>
        </select>
      </div>

      {/* Disk Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Loại đĩa</label>
        <select
          name="disk_type"
          value={formData.disk_type || 'thin'}
          onChange={onChange}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          disabled={isLoading}
        >
          <option value="thin">Thin Provisioning</option>
          <option value="thick">Thick Provisioning</option>
          <option value="eager_zeroed">Eager Zeroed Thick</option>
        </select>
      </div>

      {/* Datastore */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Datastore</label>
        <input
          type="text"
          name="datastore"
          value={formData.datastore || 'datastore1'}
          onChange={onChange}
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
          onChange={onChange}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          disabled={isLoading}
        />
      </div>

      {/* Wait for IP Checkbox */}
      <div className="flex items-center col-span-full">
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
