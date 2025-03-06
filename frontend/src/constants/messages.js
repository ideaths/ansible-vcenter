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
