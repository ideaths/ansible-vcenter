export const NETWORK_TYPES = {
  STATIC: 'static',
  DHCP: 'dhcp'
};

export const NETWORK_DEVICES = {
  VMXNET3: 'vmxnet3',
  E1000: 'e1000',
  E1000E: 'e1000e'
};

export const SCSI_TYPES = {
  PARAVIRTUAL: 'paravirtual',
  LSI: 'lsi',
  BUSLOGIC: 'buslogic'
};

export const BOOT_FIRMWARE = {
  BIOS: 'bios',
  EFI: 'efi'
};

export const DISK_TYPES = {
  THIN: 'thin',
  THICK: 'thick',
  EAGER_ZEROED: 'eager_zeroed'
};

export const DEFAULT_NETWORK_CONFIG = {
  network: 'VM Network',
  netmask: '255.255.255.0',
  gateway: '192.168.1.1',
  dns_servers: '191.168.1.53',
  domain: 'idevops.io.vn'
};
