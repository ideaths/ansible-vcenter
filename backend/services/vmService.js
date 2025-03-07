const { vCenterConfig } = require('../config/vcenterConfig');
const { Client } = require('vmware-vsphere');

const client = new Client({
  hostname: vCenterConfig.hostname,
  username: vCenterConfig.username,
  password: vCenterConfig.password,
  insecure: !vCenterConfig.validateCerts
});

const getVMs = async () => {
  try {
    await client.login();
    const vms = await client.vms.list();
    await client.logout();
    return vms;
  } catch (error) {
    console.error('Error fetching VMs:', error);
    throw error;
  }
};

const createOrUpdateVM = async (vmData) => {
  try {
    await client.login();
    const existingVM = await client.vms.get(vmData.vm_name);
    if (existingVM) {
      await client.vms.update(vmData.vm_name, vmData);
    } else {
      await client.vms.create(vmData);
    }
    await client.logout();
    return { success: true, message: 'VM created/updated successfully' };
  } catch (error) {
    console.error('Error creating/updating VM:', error);
    throw error;
  }
};

const deleteVM = async (vmName) => {
  try {
    await client.login();
    await client.vms.delete(vmName);
    await client.logout();
    return { success: true, message: 'VM deleted successfully' };
  } catch (error) {
    console.error('Error deleting VM:', error);
    throw error;
  }
};

const powerActionVM = async (vmName, action) => {
  try {
    await client.login();
    if (action === 'start') {
      await client.vms.powerOn(vmName);
    } else if (action === 'stop') {
      await client.vms.powerOff(vmName);
    }
    await client.logout();
    return { success: true, message: `VM ${action} successfully` };
  } catch (error) {
    console.error('Error performing power action on VM:', error);
    throw error;
  }
};

module.exports = {
  getVMs,
  createOrUpdateVM,
  deleteVM,
  powerActionVM
};
