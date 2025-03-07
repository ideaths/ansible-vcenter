import React from 'react';
import { Search, X, Filter, Plus } from 'lucide-react';
import styles from '../../styles/components/VMList/VMFilters.module.css';

const VMFilters = ({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  guestOSFilter,
  setGuestOSFilter,
  tagFilter,
  setTagFilter,
  availableTags,
  guestOSMap,
  resetFilters
}) => {
  const showResetButton = searchTerm !== '' || statusFilter !== 'all' || guestOSFilter !== 'all';

  return (
    <div className={styles.container}>
      {/* Search Input */}
      <div className={styles.searchWrapper}>
        <input 
          type="text" 
          placeholder="Tìm kiếm VM (tên hoặc IP)..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles.searchInput}
        />
        <Search className={styles.searchIcon} size={20} />
        {searchTerm && (
          <button 
            onClick={() => setSearchTerm('')}
            className={styles.clearButton}
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Status Filter - Updated for new status display */}
      <div className={styles.filterWrapper}>
        <select 
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className={styles.select}
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="running">Đang chạy</option>
          <option value="stopped">Đang dừng</option>
          <option value="deleted">Deleted</option>
        </select>
      </div>

      {/* Guest OS Filter */}
      <div className={styles.filterWrapper}>
        <select 
          value={guestOSFilter}
          onChange={(e) => setGuestOSFilter(e.target.value)}
          className={styles.select}
        >
          <option value="all">Tất cả OS</option>
          {Object.entries(guestOSMap).map(([key, value]) => (
            <option key={key} value={value}>{value}</option>
          ))}
        </select>
      </div>

      {/* Multi-select Tag Filter */}
      <div className={styles.filterWrapper}>
        <div className={styles.multiSelect}>
          <div className={styles.selectedTags}>
            {tagFilter.map(tag => (
              <span key={tag} className={styles.tagBadge}>
                {tag}
                <button
                  onClick={() => setTagFilter(prev => prev.filter(t => t !== tag))}
                  className={styles.tagRemove}
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
          <select
            value=""
            onChange={(e) => {
              if (e.target.value && !tagFilter.includes(e.target.value)) {
                setTagFilter(prev => [...prev, e.target.value]);
              }
            }}
            className={styles.select}
          >
            <option value="">Thêm tag...</option>
            {availableTags
              .filter(tag => !tagFilter.includes(tag))
              .map(tag => (
                <option key={tag} value={tag}>{tag}</option>
              ))
            }
          </select>
        </div>
      </div>

      {/* Reset Filters Button */}
      {showResetButton && (
        <button 
          onClick={resetFilters}
          className={styles.resetButton}
          title="Đặt lại bộ lọc"
        >
          <Filter className="h-4 w-4 mr-2" />
          Đặt lại bộ lọc
        </button>
      )}
    </div>
  );
};

export default VMFilters;