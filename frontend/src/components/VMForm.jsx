import React, { useState, useEffect } from 'react';
import { XCircle, Save, RefreshCw } from 'lucide-react';
import VMBasicFields from './vm-form/VMBasicFields';
import VMNetworkFields from './vm-form/VMNetworkFields';
import VMAdvancedFields from './vm-form/VMAdvancedFields';
import { DEFAULT_VM } from '../constants/vmConstants';
import styles from '../styles/components/VMForm.module.css';
import btnStyles from '../styles/common/buttons.module.css';

const VMForm = ({ vm, onSubmit, onCancel, isLoading }) => {
  const [formData, setFormData] = useState(vm || DEFAULT_VM);

  useEffect(() => {
    const mergedData = { ...DEFAULT_VM, ...(vm || {}) };
    setFormData(mergedData);
  }, [vm]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? (checked ? 'yes' : 'no') : value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.vm_name?.trim()) {
      alert('Tên VM không được để trống');
      return;
    }

    const cleanedData = { ...formData };
    // Giữ nguyên action từ VM gốc nếu đang edit, hoặc dùng giá trị mặc định nếu tạo mới
    cleanedData.action = vm?.action || DEFAULT_VM.action;
    
    Object.keys(cleanedData).forEach(key => {
      if (cleanedData[key] === '' || cleanedData[key] === null || 
          (typeof cleanedData[key] === 'string' && cleanedData[key].trim() === '')) {
        delete cleanedData[key];
      }
    });

    if (!cleanedData.hostname) {
      cleanedData.hostname = cleanedData.vm_name;
    }
    
    onSubmit(cleanedData);
  };

  return (
    <div className={styles.formOverlay}>
      <div className={styles.formContainer}>
        <div className={styles.formContent}>
          <div className={styles.formHeader}>
            <h2 className={styles.formTitle}>
              {formData.vm_name ? `Chỉnh sửa VM: ${formData.vm_name}` : 'Thêm VM mới'}
            </h2>
            <button 
              onClick={onCancel}
              className={btnStyles.iconBtn}
              disabled={isLoading}
              type="button"
            >
              <XCircle className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className={styles.formGrid}>
              <VMBasicFields 
                formData={formData} 
                onChange={handleChange} 
                isLoading={isLoading} 
              />

              <VMNetworkFields 
                formData={formData} 
                onChange={handleChange} 
                isLoading={isLoading} 
              />

              <VMAdvancedFields 
                formData={formData} 
                onChange={handleChange} 
                isLoading={isLoading} 
              />
            </div>

            <div className={styles.formFooter}>
              <button
                type="button"
                onClick={onCancel}
                className={btnStyles.btnSecondary}
                disabled={isLoading}
              >
                Hủy
              </button>
              <button
                type="submit"
                className={btnStyles.btnPrimary}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="animate-spin h-4 w-4 mr-2" />
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Lưu
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default VMForm;