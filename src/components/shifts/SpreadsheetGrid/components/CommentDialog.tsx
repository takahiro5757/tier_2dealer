'use client';

import React, { useState, useEffect, memo } from 'react';
import { Box } from '@mui/material';

interface CommentDialogProps {
  isOpen: boolean;
  initialComment: string;
  onSave: (comment: string) => void;
  onCancel: () => void;
}

const CommentDialog: React.FC<CommentDialogProps> = ({ 
  isOpen, 
  initialComment, 
  onSave, 
  onCancel 
}) => {
  const [commentText, setCommentText] = useState('');
  
  // ダイアログが開かれたときに初期値を設定
  useEffect(() => {
    if (isOpen) {
      setCommentText(initialComment);
    }
  }, [isOpen, initialComment]);
  
  // コメント保存処理
  const handleSave = () => {
    onSave(commentText);
  };
  
  if (!isOpen) return null;
  
  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999
      }}
      onClick={onCancel}
    >
      <Box
        onClick={(e) => e.stopPropagation()}
        sx={{
          backgroundColor: 'white',
          padding: '16px',
          borderRadius: '8px',
          width: '300px',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
        }}
      >
        <h3 style={{ margin: '0 0 16px 0' }}>コメントを入力</h3>
        <textarea
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          style={{
            width: '100%',
            height: '100px',
            padding: '8px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            marginBottom: '16px',
            resize: 'vertical'
          }}
          placeholder="コメントを入力してください..."
        />
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
          <button
            onClick={onCancel}
            style={{
              padding: '8px 16px',
              border: 'none',
              borderRadius: '4px',
              backgroundColor: '#e0e0e0',
              cursor: 'pointer'
            }}
          >
            キャンセル
          </button>
          <button
            onClick={handleSave}
            style={{
              padding: '8px 16px',
              border: 'none',
              borderRadius: '4px',
              backgroundColor: '#2196f3',
              color: 'white',
              cursor: 'pointer'
            }}
          >
            保存
          </button>
        </Box>
      </Box>
    </Box>
  );
};

export default memo(CommentDialog); 