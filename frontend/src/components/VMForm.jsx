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
  const [tags, setTags] = useState(vm?.tags?.split(',').map(t => t.trim()) || []);
  const [newTag, setNewTag] = useState('');

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

  const addTag = () => {
    if (newTag && !tags.includes(newTag)) {
      setTags([...tags, newTag]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.vm_name?.trim()) {
      alert('Tên VM không được để trống');
      return;
    }

    const cleanedData = { ...formData };
    
    // Clean up empty fields
    Object.keys(cleanedData).forEach(key => {
      if (cleanedData[key] === '' || cleanedData[key] === null || 
          (typeof cleanedData[key] === 'string' && cleanedData[key].trim() === '')) {
        delete cleanedData[key];
      }
    });

    if (!cleanedData.hostname) {
      cleanedData.hostname = cleanedData.vm_name;
    }
    
    const updatedFormData = {
      ...cleanedData,
      tags: tags.join(',')
    };
    onSubmit(updatedFormData); // Submit with original action value
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

            {/* Tags Section */}
            <div className={styles.tagsSection}>
              <label className={styles.label}>Tags</label>
              <div className={styles.tagInput}>
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addTag()}
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