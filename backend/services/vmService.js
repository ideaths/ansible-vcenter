const { vCenterConfig } = require('../config/vcenterConfig');
// const { Client } = require('vmware-vsphere'); // Remove this line

// Mock data for VMs
const mockVMs = [
  { vm_name: 'vm1', status: 'running' },
  { vm_name: 'vm2', status: 'stopped' }
];

const getVMs = async () => {
  // Return mock data instead of fetching from vCenter
  return mockVMs;
};

const createOrUpdateVM = async (vmData) => {
  // Mock implementation
  const existingVM = mockVMs.find(vm => vm.vm_name === vmData.vm_name);
  if (existingVM) {
    Object.assign(existingVM, vmData);
  } else {
    mockVMs.push(vmData);
  }
  return { success: true, message: 'VM created/updated successfully' };
};

const deleteVM = async (vmName) => {
  // Mock implementation
  const index = mockVMs.findIndex(vm => vm.vm_name === vmName);
  if (index !== -1) {
    mockVMs.splice(index, 1);
    return { success: true, message: 'VM deleted successfully' };
  } else {
    throw new Error('VM not found');
  }
};

const powerActionVM = async (vmName, action) => {
  // Mock implementation
  const vm = mockVMs.find(vm => vm.vm_name === vmName);
  if (vm) {
    vm.status = action === 'start' ? 'running' : 'stopped';
    return { success: true, message: `VM ${action} successfully` };
  } else {
    throw new Error('VM not found');
  }
};

module.exports = {
  getVMs,
  createOrUpdateVM,
  deleteVM,
  powerActionVM
};
