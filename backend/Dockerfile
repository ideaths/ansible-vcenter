FROM node:16-alpine

# Cài đặt Ansible và các dependencies cần thiết
RUN apk add --no-cache \
    python3 \
    python3-dev \
    py3-pip \
    gcc \
    musl-dev \
    libffi-dev \
    openssl-dev \
    cargo \
    openssh-client \
    sshpass \
    git \
    bash \
    && pip3 install --upgrade pip \
    && pip3 install ansible==6.7.0 pyvmomi requests jmespath

# Tạo thư mục làm việc
WORKDIR /app

# Copy package.json và package-lock.json
COPY package*.json ./

# Cài đặt dependencies
RUN npm install

# Copy code
COPY . .

# Tạo thư mục cần thiết
RUN mkdir -p \
    data \
    /root/.ssh \
    /root/.ansible \
    /etc/ansible

# Cấu hình Ansible
COPY ansible.cfg /etc/ansible/ansible.cfg

# Cấp quyền cho các thư mục
RUN chmod -R 755 /app

# Expose port
EXPOSE 3001

# Command khi container khởi động
CMD ["node", "index.js"]