import React from 'react';
import { NETWORK_DEVICES } from '../../constants/networkConstants';

const VMNetworkFields = ({ formData, onChange, isLoading, errors = {}, isNewVM }) => {
  return (
    <>
      {/* IP */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          IP
          {errors.ip && <span className="ml-1 text-red-500">*</span>}
        </label>
        <input
          type="text"
          name="ip"
          value={formData.ip || ''}
          onChange={onChange}
          className={`mt-1 block w-full border ${errors.ip ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm p-2`}
          placeholder="192.168.1.10"
          required
          disabled={isLoading}
          pattern="^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$"
        />
        {errors.ip && (
          <p className="mt-1 text-sm text-red-500">{errors.ip}</p>
        )}
      </div>

      {/* Netmask */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Netmask
          {errors.netmask && <span className="ml-1 text-red-500">*</span>}
        </label>
        <input
          type="text"
          name="netmask"
          value={formData.netmask || '255.255.255.0'}
          onChange={onChange}
          className={`mt-1 block w-full border ${errors.netmask ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm p-2`}
          disabled={isLoading}
        />
        {errors.netmask && (
          <p className="mt-1 text-sm text-red-500">{errors.netmask}</p>
        )}
      </div>

      {/* Gateway */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Gateway
          {errors.gateway && <span className="ml-1 text-red-500">*</span>}
        </label>
        <input
          type="text"
          name="gateway"
          value={formData.gateway || '192.168.1.1'}
          onChange={onChange}
          className={`mt-1 block w-full border ${errors.gateway ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm p-2`}
          disabled={isLoading}
        />
        {errors.gateway && (
          <p className="mt-1 text-sm text-red-500">{errors.gateway}</p>
        )}
      </div>

      {/* Network */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Network
          {errors.network && <span className="ml-1 text-red-500">*</span>}
        </label>
        <input
          type="text"
          name="network"
          value={formData.network || 'VM Network'}
          onChange={onChange}
          className={`mt-1 block w-full border ${errors.network ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm p-2`}
          required
          disabled={isLoading}
        />
        {errors.network && (
          <p className="mt-1 text-sm text-red-500">{errors.network}</p>
        )}
      </div>

      {/* Network Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Loại mạng
          {errors.network_type && <span className="ml-1 text-red-500">*</span>}
        </label>
        <select
          name="network_type"
          value={formData.network_type || 'static'}
          onChange={onChange}
          className={`mt-1 block w-full border ${errors.network_type ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm p-2`}
          disabled={isLoading}
        >
          <option value="static">Tĩnh (Static)</option>
          <option value="dhcp">Động (DHCP)</option>
        </select>
        {errors.network_type && (
          <p className="mt-1 text-sm text-red-500">{errors.network_type}</p>
        )}
      </div>

      {/* Network Device */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Network Device
          {errors.network_device && <span className="ml-1 text-red-500">*</span>}
        </label>
        <select
          name="network_device"
          value={formData.network_device || 'vmxnet3'}
          onChange={onChange}
          className={`mt-1 block w-full border ${errors.network_device ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm p-2`}
          disabled={isLoading}
        >
          {Object.entries(NETWORK_DEVICES).map(([key, value]) => (
            <option key={key} value={value}>{value}</option>
          ))}
        </select>
        {errors.network_device && (
          <p className="mt-1 text-sm text-red-500">{errors.network_device}</p>
        )}
      </div>

      {/* DNS Server */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          DNS Server
          {errors.dns_servers && <span className="ml-1 text-red-500">*</span>}
        </label>
        <input
          type="text"
          name="dns_servers"
          value={formData.dns_servers || '191.168.1.53'}
          onChange={onChange}
          className={`mt-1 block w-full border ${errors.dns_servers ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm p-2`}
          placeholder="191.168.1.53"
          disabled={isLoading}
        />
        {errors.dns_servers && (
          <p className="mt-1 text-sm text-red-500">{errors.dns_servers}</p>
        )}
      </div>

      {/* Domain */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Domain
          {errors.domain && <span className="ml-1 text-red-500">*</span>}
        </label>
        <input
          type="text"
          name="domain"
          value={formData.domain || 'idevops.io.vn'}
          onChange={onChange}
          className={`mt-1 block w-full border ${errors.domain ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm p-2`}
          placeholder="idevops.io.vn"
          disabled={isLoading}
        />
        {errors.domain && (
          <p className="mt-1 text-sm text-red-500">{errors.domain}</p>
        )}
      </div>
    </>
  );
};

export default VMNetworkFields;