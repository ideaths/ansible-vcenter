// backend/index.js
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const helmet = require('helmet');
const morgan = require('morgan');

// Import routes
const vmRoutes = require('./routes/vmRoutes');
const vCenterRoutes = require('./routes/vCenterRoutes');

// Khởi tạo ứng dụng Express
const app = express();
const PORT = process.env.PORT || 3001;

// CORS configuration
const corsOptions = {
  origin: [
    'http://localhost:3000',  // Frontend development server
    'http://localhost:3001',  // Backend server
    'http://127.0.0.1:3000'   // Alternative localhost
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json({
  // Tăng giới hạn kích thước body request
  limit: '10mb'
}));
app.use(express.urlencoded({ 
  extended: true,
  limit: '10mb'
}));
app.use(helmet()); // Bảo mật HTTP headers
app.use(morgan('dev')); // Log requests

// Đảm bảo thư mục data tồn tại
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Route đơn giản để kiểm tra server
app.get('/api/status', (req, res) => {
  res.json({ 
    status: 'running', 
    time: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Route mặc định
app.get('/api', (req, res) => {
  res.json({ 
    message: 'VM Management API',
    version: '1.0.0',
    endpoints: [
      '/api/vms',
      '/api/vcenter/connect'
    ]
  });
});

// Sử dụng API routes
app.use('/api', vmRoutes); 
app.use('/api', vCenterRoutes); // Mount chung với prefix /api

// 404 handler cho các route không tồn tại
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint không tồn tại',
    path: req.path
  });
});

// Error handler cuối cùng
app.use((err, req, res, next) => {
  console.error('Lỗi không mong muốn:', err);
  res.status(500).json({
    success: false,
    error: err.message || 'Lỗi máy chủ nội bộ',
    stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack,
  });
});

// Khởi động server
const server = app.listen(PORT, () => {
  console.log(`Server đang chạy trên cổng ${PORT}`);
  console.log(`Môi trường: ${process.env.NODE_ENV || 'development'}`);
});

// Xử lý thoát ứng dụng an toàn
process.on('SIGINT', () => {
  console.log('Đóng ứng dụng...');
  server.close(() => {
    console.log('Server đã dừng');
    process.exit(0);
  });
});

module.exports = app;