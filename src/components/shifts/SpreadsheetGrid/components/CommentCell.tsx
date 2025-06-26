'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  TextField, 
  Typography,
  styled,
  TableCell
} from '@mui/material';

const CommentCellContainer = styled(TableCell)(({ theme }) => ({
  background: '#f3e5f5',
  borderTop: '1px solid #000000',
  color: '#9c27b0',
  fontSize: '0.75rem',
  textAlign: 'left',
  padding: '8px',
  maxWidth: '200px',
  minHeight: '40px',
  height: 'auto',
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-word',
  lineHeight: 1.4,
  verticalAlign: 'top',
  cursor: 'pointer',
  '&:hover': {
    backgroundColor: '#f0e0f5',
  }
}));

const CommentText = styled(Typography)(({ theme }) => ({
  fontSize: '0.75rem',
  color: '#9c27b0',
  textAlign: 'left',
  padding: 0,
  width: '100%',
  overflow: 'hidden',
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-word',
  lineHeight: 1.4,
  minHeight: '20px'
}));

const EditTextField = styled(TextField)(({ theme }) => ({
  width: '100%',
  '& .MuiInputBase-root': {
    fontSize: '0.75rem',
    color: '#9c27b0',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: '4px',
    minHeight: 'auto',
    width: '100%',
  },
  '& .MuiInputBase-input': {
    padding: theme.spacing(0.5),
    textAlign: 'left',
    fontSize: '0.75rem',
    lineHeight: 1.4,
    width: '100%',
    boxSizing: 'border-box',
  },
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: '#9c27b0',
  },
  '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': {
    borderColor: '#9c27b0',
  },
  '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
    borderColor: '#9c27b0',
  }
}));

interface CommentCellProps {
  staffId: string;
  comment?: string;
  onCommentChange?: (staffId: string, comment: string) => void;
}

const CommentCell: React.FC<CommentCellProps> = ({
  staffId,
  comment = '',
  onCommentChange
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState('');
  const textFieldRef = useRef<HTMLInputElement>(null);

  const handleCellClick = (event: React.MouseEvent) => {
    if (isEditing) return;
    
    event.stopPropagation();
    setEditText(comment || '');
    setIsEditing(true);
  };

  const handleSave = () => {
    if (onCommentChange) {
      onCommentChange(staffId, editText);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditText(comment || '');
    setIsEditing(false);
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSave();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      handleCancel();
    }
  };

  const handleBlur = (event: React.FocusEvent) => {
    // 少し遅延させて確実にBlurイベントを処理
    setTimeout(() => {
      handleSave();
    }, 100);
  };

  const handleTextFieldClick = (event: React.MouseEvent) => {
    // テキストフィールド内のクリックは伝播を停止
    event.stopPropagation();
  };

  // 編集モードに入ったときにフォーカスを当てる
  useEffect(() => {
    if (isEditing && textFieldRef.current) {
      const input = textFieldRef.current;
      input.focus();
      // テキスト全選択
      setTimeout(() => {
        if (input.setSelectionRange) {
          input.setSelectionRange(0, input.value.length);
        }
      }, 0);
    }
  }, [isEditing]);

  // 外部クリックを検知して編集モードを終了
  useEffect(() => {
    if (!isEditing) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (textFieldRef.current && !textFieldRef.current.contains(event.target as Node)) {
        handleSave();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isEditing, editText]);

  return (
    <CommentCellContainer 
      colSpan={3}
      className="staff-section"
      onClick={handleCellClick}
    >
      {isEditing ? (
        <EditTextField
          ref={textFieldRef}
          size="small"
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          onKeyDown={handleKeyPress}
          onBlur={handleBlur}
          onClick={handleTextFieldClick}
          placeholder="コメントを入力..."
          variant="outlined"
          multiline
          maxRows={3}
          minRows={1}
        />
      ) : (
        <CommentText>
          {comment || '（コメントなし）'}
        </CommentText>
      )}
    </CommentCellContainer>
  );
};

export default CommentCell; 