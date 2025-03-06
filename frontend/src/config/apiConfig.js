export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:3001/api',
  TIMEOUT: 30000,
  HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
};

export const VCENTER_DEFAULT_CONFIG = {
  hostname: "vcenter.example.com",
  username: "administrator@vsphere.local",
  password: "",
  validateCerts: false,
  datacenter: "Home"
};
