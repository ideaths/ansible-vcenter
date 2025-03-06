export const VM_ACTIONS = {
  APPLY: 'apply',
  DESTROY: 'destroy'
};

export const VM_STATUS = {
  RUNNING: 'running',
  STOPPED: 'stopped',
  QUEUED_START: 'queued_start',
  QUEUED_STOP: 'queued_stop'
};

export const GUEST_OS_MAP = {
  'rhel8_64Guest': 'RHEL 8 (64-bit)',
  'ubuntu64Guest': 'Ubuntu Linux (64-bit)', 
  'windows9Server64Guest': 'Windows Server 2019 (64-bit)'
};

export const DEFAULT_VM = {
  action: VM_ACTIONS.APPLY,
  num_cpus: 2,
  memory_mb: 4096,
  disk_size_gb: 50,
  template: 'template-redhat8',
  guest_id: 'rhel8_64Guest',
  network: 'VM Network',
  datastore: 'datastore1',
  folder: '/',
  netmask: '255.255.255.0',
  gateway: '192.168.1.1',
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
