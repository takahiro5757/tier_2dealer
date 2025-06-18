'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  TextField, 
  Typography,
  styled
} from '@mui/material';
import { StaffRequest } from '../types';

const RequestCellContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100% !important',
  height: 'auto',
  padding: theme.spacing(0.25),
  background: '#f3e5f5',
  borderTop: '2px solid #000000',
  color: '#9c27b0',
  minHeight: '36px',
  maxWidth: '100% !important',
  minWidth: '100% !important',
  overflow: 'hidden',
  cursor: 'pointer',
  flex: 'none !important',
  boxSizing: 'border-box',
  '&:hover': {
    backgroundColor: '#f8e5fa',
  }
}));

const RequestText = styled(Typography)(({ theme }) => ({
  fontSize: '0.7rem',
  fontWeight: 'bold',
  textAlign: 'center',
  color: '#9c27b0',
  userSelect: 'none',
  lineHeight: 1.1,
  wordBreak: 'break-word',
  padding: 0,
  width: '100% !important',
  maxWidth: '100% !important',
  overflow: 'hidden',
  whiteSpace: 'pre-wrap',
  flex: 'none !important',
  boxSizing: 'border-box'
}));

const EditTextField = styled(TextField)(({ theme }) => ({
  width: '100% !important',
  maxWidth: '100% !important',
  flex: 'none !important',
  '& .MuiInputBase-root': {
    fontSize: '0.65rem',
    color: '#9c27b0',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: '4px',
    minHeight: 'auto',
    width: '100% !important',
    flex: 'none !important',
  },
  '& .MuiInputBase-input': {
    padding: theme.spacing(0.2),
    textAlign: 'center',
    fontSize: '0.65rem',
    lineHeight: 1.1,
    width: '100% !important',
    boxSizing: 'border-box',
    flex: 'none !important',
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

interface RequestCellProps {
  staffId: string;
  request?: StaffRequest;
  isReadOnly?: boolean;
  onRequestTextChange?: (staffId: string, text: string) => void;
}

const RequestCell: React.FC<RequestCellProps> = ({
  staffId,
  request,
  isReadOnly = false,
  onRequestTextChange
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState('');
  const textFieldRef = useRef<HTMLInputElement>(null);

  // 表示用のテキストを生成
  const getDisplayText = () => {
    // requestがundefinedの場合のデフォルト表示
    if (!request) {
      return '20（土日5）';
    }
    
    // カスタムテキストがある場合はそれのみを表示
    if (request.requestText && request.requestText.trim()) {
      return request.requestText;
    }
    
    // カスタムテキストがない場合のみ数値表示
    const total = request.totalRequest || 20; // デフォルト値を20に変更
    const weekend = request.weekendRequest || 5; // デフォルト値を5に設定
    
    if (weekend > 0) {
      return `${total}（土日${weekend}）`;
    } else if (total > 0) {
      return `${total}`;
    } else {
      return '20（土日5）'; // 完全なデフォルト表示
    }
  };

  const handleCellClick = (event: React.MouseEvent) => {
    if (isReadOnly || isEditing) return;
    
    event.stopPropagation();
    setEditText(request?.requestText || '');
    setIsEditing(true);
  };

  const handleSave = () => {
    if (onRequestTextChange) {
      onRequestTextChange(staffId, editText);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditText(request?.requestText || '');
    setIsEditing(false);
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
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
    <RequestCellContainer onClick={handleCellClick}>
      {isEditing ? (
        <EditTextField
          ref={textFieldRef}
          size="small"
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          onKeyDown={handleKeyPress}
          onBlur={handleBlur}
          onClick={handleTextFieldClick}
          placeholder="要望を入力..."
          variant="outlined"
          multiline
          maxRows={2}
          minRows={1}
        />
      ) : (
        <RequestText>
          {getDisplayText()}
        </RequestText>
      )}
    </RequestCellContainer>
  );
};

export default RequestCell; 