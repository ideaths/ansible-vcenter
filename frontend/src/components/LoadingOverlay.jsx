import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { CircularProgress, Dialog, DialogContent, Typography } from '@mui/material';
import { stopLoading } from '../store/loadingSlice';

const LoadingOverlay = () => {
  const { isLoading, message } = useSelector((state) => state.loading);
  const dispatch = useDispatch();

  useEffect(() => {
    // Thêm event listener để lắng nghe kết thúc task
    const handleTaskComplete = () => {
      dispatch(stopLoading());
    };

    window.addEventListener('taskComplete', handleTaskComplete);

    // Cleanup function
    return () => {
      window.removeEventListener('taskComplete', handleTaskComplete);
    };
  }, [dispatch]);

  // Ngăn chặn việc đóng dialog bằng cách click bên ngoài
  const handleClose = () => {
    return false;
  };

  return (
    <Dialog
      open={isLoading}
      onClose={handleClose}
      disableEscapeKeyDown
      PaperProps={{
        style: {
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          boxShadow: 'none',
          padding: '20px',
        },
      }}
    >
      <DialogContent style={{ textAlign: 'center' }}>
        <CircularProgress size={60} />
        <Typography
          variant="h6"
          style={{ marginTop: '20px', color: '#666' }}
        >
          {message || 'Đang xử lý...'}
        </Typography>
      </DialogContent>
    </Dialog>
  );
};

export default LoadingOverlay;