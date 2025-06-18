'use client';

import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from '@mui/material';

interface DeleteConfirmDialogProps {
  // レコード削除
  recordDeleteOpen: boolean;
  onRecordDeleteCancel: () => void;
  onRecordDeleteConfirm: () => void;
  
  // コミュニケーション削除
  messageDeleteOpen: boolean;
  onMessageDeleteCancel: () => void;
  onMessageDeleteConfirm: () => void;
}

const DeleteConfirmDialog: React.FC<DeleteConfirmDialogProps> = ({
  recordDeleteOpen,
  onRecordDeleteCancel,
  onRecordDeleteConfirm,
  messageDeleteOpen,
  onMessageDeleteCancel,
  onMessageDeleteConfirm,
}) => {
  return (
    <>
      {/* レコード削除確認ダイアログ */}
      <Dialog
        open={recordDeleteOpen}
        onClose={onRecordDeleteCancel}
        PaperProps={{
          sx: {
            borderRadius: '16px',
            minWidth: '320px',
            maxWidth: '400px',
          }
        }}
      >
        <DialogTitle sx={{ 
          fontWeight: 'bold', 
          fontSize: '1.2rem',
          pb: 1
        }}>
          レコードを削除
        </DialogTitle>
        
        <DialogContent sx={{ pb: 2 }}>
          <Typography variant="body1" sx={{ 
            color: '#536471',
            fontSize: '0.95rem',
            lineHeight: 1.4
          }}>
            この案件レコードを削除しますか？この操作は取り消せません。
          </Typography>
        </DialogContent>
        
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button 
            onClick={onRecordDeleteCancel}
            variant="outlined"
            sx={{
              borderRadius: '20px',
              px: 3,
              py: 1,
              fontWeight: '600',
              fontSize: '0.9rem',
              textTransform: 'none',
              borderColor: '#d0d7de',
              color: '#656d76',
              '&:hover': {
                borderColor: '#bcc4cc',
                backgroundColor: 'rgba(0, 0, 0, 0.02)',
              }
            }}
          >
            キャンセル
          </Button>
          <Button 
            onClick={onRecordDeleteConfirm}
            variant="contained"
            sx={{
              borderRadius: '20px',
              px: 3,
              py: 1,
              fontWeight: '600',
              fontSize: '0.9rem',
              textTransform: 'none',
              backgroundColor: '#f4212e',
              '&:hover': {
                backgroundColor: '#dc1c2e',
              }
            }}
          >
            削除
          </Button>
        </DialogActions>
      </Dialog>

      {/* コミュニケーション削除確認ダイアログ */}
      <Dialog
        open={messageDeleteOpen}
        onClose={onMessageDeleteCancel}
        PaperProps={{
          sx: {
            borderRadius: '16px',
            minWidth: '320px',
            maxWidth: '400px',
          }
        }}
      >
        <DialogTitle sx={{ 
          fontWeight: 'bold', 
          fontSize: '1.2rem',
          pb: 1
        }}>
          投稿を削除
        </DialogTitle>
        
        <DialogContent sx={{ pb: 2 }}>
          <Typography variant="body1" sx={{ 
            color: '#536471',
            fontSize: '0.95rem',
            lineHeight: 1.4
          }}>
            この投稿を削除しますか？この操作は取り消せません。リプライがある場合は、それらも一緒に削除されます。
          </Typography>
        </DialogContent>
        
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button 
            onClick={onMessageDeleteCancel}
            variant="outlined"
            sx={{
              borderRadius: '20px',
              px: 3,
              py: 1,
              fontWeight: '600',
              fontSize: '0.9rem',
              textTransform: 'none',
              borderColor: '#d0d7de',
              color: '#656d76',
              '&:hover': {
                borderColor: '#bcc4cc',
                backgroundColor: 'rgba(0, 0, 0, 0.02)',
              }
            }}
          >
            キャンセル
          </Button>
          <Button 
            onClick={onMessageDeleteConfirm}
            variant="contained"
            sx={{
              borderRadius: '20px',
              px: 3,
              py: 1,
              fontWeight: '600',
              fontSize: '0.9rem',
              textTransform: 'none',
              backgroundColor: '#f4212e',
              '&:hover': {
                backgroundColor: '#dc1c2e',
              }
            }}
          >
            削除
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default DeleteConfirmDialog; 