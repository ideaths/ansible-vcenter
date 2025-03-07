import React from 'react';
import { Search, X, Filter } from 'lucide-react';
import styles from '../../styles/components/VMList/VMFilters.module.css';
import { VM_STATUS } from '../../constants/vmConstants';

const VMFilters = ({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  guestOSFilter,
  setGuestOSFilter,
  tagFilter,   // Add this
  setTagFilter, // Add this
  availableTags, // Add this
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

      {/* Status Filter */}
      <div className={styles.filterWrapper}>
        <select 
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className={styles.select}
        >
          <option value="all">Tất cả trạng thái</option>
          <option value={VM_STATUS.RUNNING}>Đang chạy</option>
          <option value={VM_STATUS.STOPPED}>Đã dừng</option>
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

      {/* Tag Filter */}
      <div className={styles.filterWrapper}>
        <select 
          value={tagFilter}
          onChange={(e) => setTagFilter(e.target.value)}
          className={styles.select}
        >
          <option value="all">Tất cả tags</option>
          {availableTags.map(tag => (
            <option key={tag} value={tag}>{tag}</option>
          ))}
        </select>
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
