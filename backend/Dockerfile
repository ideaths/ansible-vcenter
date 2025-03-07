FROM node:16-alpine

# Tạo thư mục làm việc
WORKDIR /app

# Tạo thư mục cần thiết
RUN mkdir -p \
    data \
    /root/.ssh

# Cấp quyền cho các thư mục
RUN chmod -R 755 /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy the rest of the application code
COPY . .

# Command khi container khởi động
CMD ["node", "index.js"]
