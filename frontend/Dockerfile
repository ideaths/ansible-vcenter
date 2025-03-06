### Stage 1: Build stage
FROM node:16-alpine as build

# Tạo thư mục làm việc
WORKDIR /app

# Copy package.json và package-lock.json
COPY package*.json ./

# Cài đặt dependencies
RUN npm install

# Copy code
COPY . .

# Build ứng dụng
RUN npm run build

### Stage 2: Production stage
FROM nginx:stable-alpine

# Copy build từ stage trước
COPY --from=build /app/build /usr/share/nginx/html

# Copy file cấu hình Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Chạy Nginx
CMD ["nginx", "-g", "daemon off;"]