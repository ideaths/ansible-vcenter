import React, { useState, useEffect } from 'react';
import { XCircle, Save, RefreshCw, AlertCircle } from 'lucide-react';
import VMBasicFields from './vm-form/VMBasicFields';
import VMNetworkFields from './vm-form/VMNetworkFields';
import VMAdvancedFields from './vm-form/VMAdvancedFields';
import { DEFAULT_VM, VM_ACTIONS } from '../constants/vmConstants';
import styles from '../styles/components/VMForm.module.css';
import btnStyles from '../styles/common/buttons.module.css';

const VMForm = ({ vm, vms, onSubmit, onCancel, isLoading }) => {
  const [formData, setFormData] = useState(vm || DEFAULT_VM);
  const [tags, setTags] = useState(vm?.tags?.split(',').filter(Boolean).map(t => t.trim()) || []);
  const [newTag, setNewTag] = useState('');
  const [errors, setErrors] = useState({}); // State cho các lỗi
  
  // Xác định xem đang tạo mới hay chỉnh sửa VM
  const isNewVM = !vm; // Nếu không có vm, tức là đang tạo mới

  useEffect(() => {
    const mergedData = { ...DEFAULT_VM, ...(vm || {}) };
    
    // Đảm bảo trạng thái mặc định là 'on' cho VM mới
    if (!vm) {
      mergedData.status = 'on';
    }
    
    // Đảm bảo nếu action là destroy thì status là off
    if (mergedData.action === VM_ACTIONS.DESTROY) {
      mergedData.status = 'off';
    }
    
    setFormData(mergedData);
    setTags(mergedData.tags?.split(',').filter(Boolean).map(t => t.trim()) || []);
  }, [vm]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? (checked ? 'yes' : 'no') : value;
    
    // Nếu thay đổi action thành destroy, tự động set status thành off
    if (name === 'action' && value === VM_ACTIONS.DESTROY) {
      setFormData(prev => ({
        ...prev,
        [name]: newValue,
        status: 'off'
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: newValue
      }));
    }
    
    // Xóa lỗi khi người dùng sửa trường
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const addTag = () => {
    if (newTag && !tags.includes(newTag)) {
      setTags([...tags, newTag]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Kiểm tra tên VM không được để trống
    if (!formData.vm_name?.trim()) {
      newErrors.vm_name = 'Tên VM không được để trống';
    }
    
    // Chỉ kiểm tra tên VM và IP trùng lặp khi ĐANG TẠO MỚI
    if (isNewVM) {
      // Kiểm tra tên VM trùng lặp khi tạo mới
      if (formData.vm_name && vms) {
        const duplicateName = vms.find(existingVM => 
          existingVM.vm_name === formData.vm_name
        );
        
        if (duplicateName) {
          newErrors.vm_name = `Tên VM "${formData.vm_name}" đã tồn tại`;
        }
      }
      
      // Kiểm tra IP trùng lặp khi tạo mới
      if (formData.ip && vms) {
        const duplicateIP = vms.find(existingVM => 
          existingVM.ip === formData.ip && 
          existingVM.action !== 'destroy'
        );
        
        if (duplicateIP) {
          newErrors.ip = `IP ${formData.ip} đã được sử dụng bởi VM "${duplicateIP.vm_name}"`;
        }
      }
    }
    
    // Luôn kiểm tra điều kiện action và status cho cả tạo mới và chỉnh sửa
    if (formData.action === VM_ACTIONS.DESTROY && formData.status !== 'off') {
      newErrors.status = 'Khi action là destroy, status phải là off';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Kiểm tra form hợp lệ
    if (!validateForm()) {
      return;
    }

    const cleanedData = { ...formData };
    
    // Xóa các trường rỗng
    Object.keys(cleanedData).forEach(key => {
      if (cleanedData[key] === '' || cleanedData[key] === null || 
          (typeof cleanedData[key] === 'string' && cleanedData[key].trim() === '')) {
        delete cleanedData[key];
      }
    });

    // Đảm bảo hostname giống với vm_name nếu không được cung cấp
    if (!cleanedData.hostname) {
      cleanedData.hostname = cleanedData.vm_name;
    }
    
    // Đảm bảo nếu action là destroy thì status là off
    if (cleanedData.action === VM_ACTIONS.DESTROY) {
      cleanedData.status = 'off';
    }
    
    const updatedFormData = {
      ...cleanedData,
      tags: tags.join(',')
    };
    
    onSubmit(updatedFormData);
  };

  return (
    <div className={styles.formOverlay}>
      <div className={styles.formContainer} style={{ width: '95%', maxWidth: '1400px' }}>
        <div className={styles.formContent} style={{ padding: '1.5rem' }}>
          <div className={styles.formHeader}>
            <h2 className={styles.formTitle}>
              {formData.vm_name && !isNewVM ? `Chỉnh sửa VM: ${formData.vm_name}` : 'Thêm VM mới'}
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

          {/* Hiển thị lỗi form */}
          {Object.keys(errors).length > 0 && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 mt-0.5 mr-2 flex-shrink-0" />
                <div>
                  <p className="font-medium mb-1">Vui lòng sửa các lỗi sau:</p>
                  <ul className="list-disc pl-5">
                    {Object.entries(errors).map(([field, error]) => (
                      <li key={field}>{error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className={styles.formGrid}>
              <h3 className={styles.sectionHeader}>Thông tin cơ bản</h3>
              <VMBasicFields 
                formData={formData} 
                onChange={handleChange} 
                isLoading={isLoading}
                errors={errors}
                isNewVM={isNewVM}
              />

              <h3 className={styles.sectionHeader}>Cấu hình mạng</h3>
              <VMNetworkFields 
                formData={formData} 
                onChange={handleChange} 
                isLoading={isLoading}
                errors={errors}
                isNewVM={isNewVM}
              />

              <h3 className={styles.sectionHeader}>Cấu hình nâng cao</h3>
              <VMAdvancedFields 
                formData={formData} 
                onChange={handleChange} 
                isLoading={isLoading}
                errors={errors}
              />
            </div>

            {/* Tags Section */}
            <div className={styles.tagsSection}>
              <label className={styles.label}>Tags</label>
              <div className={styles.tagInput}>
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && e.preventDefault() && addTag()}
                  placeholder="Add a tag..."
                  className={styles.input}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={addTag}
                  className={btnStyles.btnSecondary}
                  disabled={isLoading || !newTag}
                >
                  Add
                </button>
              </div>
              <div className={styles.tagsList}>
                {tags.map(tag => (
                  <span key={tag} className={styles.tag}>
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className={styles.tagRemove}
                      disabled={isLoading}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
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