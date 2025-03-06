// backend/index.js
const express = require('express');
const cors = require('cors');
const path = require('path');
const vmRoutes = require('./routes/vmRoutes');
const fs = require('fs');

// Khởi tạo ứng dụng Express
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Đảm bảo thư mục data tồn tại
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Tạo route đơn giản để kiểm tra server
app.get('/api/status', (req, res) => {
  res.json({ status: 'running', time: new Date().toISOString() });
});

// Route mặc định
app.get('/api', (req, res) => {
  res.json({ message: 'VM Management API' });
});

// Đảm bảo API routes tồn tại (comment cho đến khi có file routes)
// app.use('/api', vmRoutes);

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: err.message,
    stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack,
  });
});

// Khởi động server
app.listen(PORT, () => {
  console.log(`Server đang chạy trên cổng ${PORT}`);
});

// Xử lý thoát ứng dụng
process.on('SIGINT', () => {
  console.log('Đóng ứng dụng...');
  process.exit(0);
});

module.exports = app;