import React from 'react';

const VMNetworkFields = ({ formData, onChange, isLoading }) => {
  return (
    <>
      {/* IP */}
      <div>
        <label className="block text-sm font-medium text-gray-700">IP</label>
        <input
          type="text"
          name="ip"
          value={formData.ip || ''}
          onChange={onChange}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          placeholder="192.168.1.10"
          required
          disabled={isLoading}
          pattern="^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$"
        />
      </div>

      {/* Network */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Network</label>
        <input
          type="text"
          name="network"
          value={formData.network || 'VM Network'}
          onChange={onChange}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          required
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
          onChange={onChange}
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
          onChange={onChange}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          disabled={isLoading}
        />
      </div>

      {/* Network Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Loại mạng</label>
        <select
          name="network_type"
          value={formData.network_type || 'static'}
          onChange={onChange}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          disabled={isLoading}
        >
          <option value="static">Tĩnh (Static)</option>
          <option value="dhcp">Động (DHCP)</option>
        </select>
      </div>
    </>
  );
};

export default VMNetworkFields;
