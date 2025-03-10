export const SUCCESS_MESSAGES = {
  VM_CREATED: 'VM đã được thêm thành công!',
  VM_UPDATED: 'VM đã được cập nhật thành công!',
  VM_DELETED: 'VM đã được đánh dấu xóa. Vui lòng nhấn "Chạy Ansible" để thực hiện!',
  ANSIBLE_COMPLETED: 'Các thay đổi đã được áp dụng thành công lên vCenter!',
  VCENTER_CONNECTED: 'Đã kết nối thành công đến vCenter: ',
  VCENTER_DISCONNECTED: 'Đã ngắt kết nối khỏi vCenter'
};

export const ERROR_MESSAGES = {
  VCENTER_CONNECTION_FAILED: 'Không thể kết nối đến vCenter: ',
  VM_LIST_FAILED: 'Lỗi khi tải danh sách VM: ',
  VM_ACTION_FAILED: 'Lỗi khi thao tác VM: ',
  ANSIBLE_FAILED: 'Lỗi khi chạy Ansible: ',
  POWER_ACTION_FAILED: 'Lỗi khi thay đổi trạng thái nguồn: '
};

export const INFO_MESSAGES = {
  LOADING_VM_LIST: 'Đang lấy danh sách VM...',
  CONNECTING_VCENTER: 'Đang kết nối tới vCenter...',
  RUNNING_ANSIBLE: 'Đang thực thi Ansible...',
  WAITING_FOR_CHANGES: 'Vui lòng nhấn "Chạy Ansible" để thực hiện các thay đổi.',
  NO_VMS_FOUND: 'Không có VM nào. Hãy thêm VM mới để bắt đầu.',
  NOT_CONNECTED: 'Vui lòng kết nối vCenter để xem danh sách VM.'
};
// File: src/constants/errorMessages.js

/**
 * Các thông báo lỗi được chuẩn hóa cho ứng dụng
 * Sử dụng constants để đảm bảo tính nhất quán và dễ bảo trì
 */

// Lỗi kết nối vCenter
export const VCENTER_ERRORS = {
  UNKNOWN: 'Lỗi không xác định khi kết nối vCenter',
  NETWORK: 'Không thể kết nối đến máy chủ vCenter',
  INVALID_CREDENTIALS: 'Thông tin đăng nhập không chính xác',
  SERVER_ERROR: 'Lỗi máy chủ khi xử lý yêu cầu kết nối',
  MISSING_FIELDS: (field) => `Thiếu thông tin bắt buộc: ${field}`,
  DATACENTER_NOT_FOUND: 'Không tìm thấy Datacenter đã chỉ định',
  CONNECTION_TIMEOUT: 'Kết nối đến vCenter bị gián đoạn do hết thời gian chờ',
  SSL_ERROR: 'Lỗi xác thực chứng chỉ SSL',
  PERMISSION_DENIED: 'Tài khoản không có đủ quyền để kết nối vCenter',
  INVALID_HOSTNAME: 'Hostname vCenter không hợp lệ'
};

// Lỗi API chung
export const API_ERRORS = {
  NETWORK: 'Không thể kết nối đến máy chủ',
  TIMEOUT: 'Yêu cầu đã hết thời gian chờ',
  UNAUTHORIZED: 'Không có quyền truy cập',
  SERVER_ERROR: 'Lỗi máy chủ nội bộ',
  NOT_FOUND: 'Không tìm thấy tài nguyên yêu cầu',
  BAD_REQUEST: 'Yêu cầu không hợp lệ',
  UNKNOWN: 'Lỗi không xác định khi thực hiện yêu cầu'
};

// Hàm helper để map mã lỗi từ server về thông báo thân thiện
export const getErrorMessage = (errorCode, defaultMessage) => {
  switch (errorCode) {
    case 'CONNECTION_FAILED':
      return VCENTER_ERRORS.NETWORK;
    case 'INVALID_CREDENTIALS':
      return VCENTER_ERRORS.INVALID_CREDENTIALS;
    case 'DATACENTER_NOT_FOUND':
      return VCENTER_ERRORS.DATACENTER_NOT_FOUND;
    case 'SSL_VERIFICATION_FAILED':
      return VCENTER_ERRORS.SSL_ERROR;
    case 'PERMISSION_DENIED':
      return VCENTER_ERRORS.PERMISSION_DENIED;
    case 'SERVER_ERROR':
      return VCENTER_ERRORS.SERVER_ERROR;
    case 'UNKNOWN_ERROR':
      return VCENTER_ERRORS.UNKNOWN;
    default:
      return defaultMessage || VCENTER_ERRORS.UNKNOWN;
  }
};