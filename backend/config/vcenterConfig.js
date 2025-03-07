const path = require('path');
const fs = require('fs');

const configPath = path.join(__dirname, '../data/vcenter-config.json');
const configData = fs.readFileSync(configPath, 'utf8');
const vCenterConfig = JSON.parse(configData);

module.exports = { vCenterConfig };
