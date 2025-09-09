'use client';

import React, { useState, useRef } from 'react';
import { 
  Box, 
  TextField, 
  Typography,
  styled
} from '@mui/material';
import { StaffRequest } from '../types';

const RequestCellContainer = styled(Box)<{ backgroundColor?: string }>(({ backgroundColor }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  height: '36px',
  padding: '4px',
  background: backgroundColor || '#f3e5f5',
  borderTop: '2px solid #000000',
  color: '#9c27b0',
  border: '2px solid transparent',
  position: 'relative',
}));

interface RequestCellProps {
  staffId: string;
  request?: StaffRequest;
  isReadOnly?: boolean;
  requestCellReadOnly?: boolean;
  onRequestTextChange?: (staffId: string, text: string) => void;
}

export type { RequestCellProps };

const RequestCell: React.FC<RequestCellProps> = ({
  staffId,
  request,
  isReadOnly = false,
  requestCellReadOnly = false,
  onRequestTextChange
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // 表示する値を取得
  const getDisplayValue = (): string => {
    if (!request) return '15';
    
    // 新しいrequestフィールドを優先
    if (request.request && request.request > 0) {
      return request.request.toString();
    }
    
    // 古い文字列データを検出
    const oldTextValues = ['平日希望', '土日出勤可能', '夜勤希望', '短時間勤務希望', '連勤可能', '早番希望', '遅番希望', '週末のみ', '平日のみ', '時短勤務', '残業可能', '急な出勤対応可'];
    if (request.requestText && oldTextValues.includes(request.requestText)) {
      // 古いデータの場合は15を返し、自動更新
      if (onRequestTextChange) {
        setTimeout(() => {
          onRequestTextChange(staffId, '15');
        }, 100);
      }
      return '15';
    }
    
    // 数値の場合（requestTextから）
    if (request.requestText && /^\d+$/.test(request.requestText)) {
      const num = parseInt(request.requestText);
      if (!isNaN(num) && num > 0) {
        return num.toString();
      }
    }
    
    // totalRequestから取得（後方互換性）
    if (request.totalRequest && request.totalRequest > 0) {
      return request.totalRequest.toString();
    }
    
    return '15';
  };

  // 編集可能かどうかを判定
  const canEdit = () => {
    // onRequestTextChangeが提供されている場合のみ編集可能（これがシフト変更操作時の条件）
    return !isReadOnly && !requestCellReadOnly && !!onRequestTextChange;
  };

  // クリックハンドラー
  const handleClick = () => {
    if (!canEdit()) {
      return;
    }

    const currentValue = getDisplayValue();
    setEditValue(currentValue);
    setIsEditing(true);

    // 次のレンダリング後にフォーカスとselect
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        // selectRangeを使用してエラーを回避
        if (inputRef.current.setSelectionRange) {
          inputRef.current.setSelectionRange(0, inputRef.current.value.length);
        }
      }
    }, 0);
  };

  // 保存処理
  const handleSave = () => {
    const numValue = parseInt(editValue);
    let finalValue = '15';

    if (!isNaN(numValue) && numValue > 0) {
      finalValue = numValue.toString();
    }

    if (onRequestTextChange) {
      onRequestTextChange(staffId, finalValue);
    }

    setIsEditing(false);
    setEditValue('');
  };

  // キャンセル処理
  const handleCancel = () => {
    setIsEditing(false);
    setEditValue('');
  };

  // キー入力処理
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    }
  };

  // 入力値の変更処理
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // 数字のみ許可
    if (/^\d*$/.test(value)) {
      setEditValue(value);
    }
  };

  // 編集中の場合
  if (isEditing) {
    return (
      <RequestCellContainer backgroundColor="#f3e5f5">
        <TextField
          ref={inputRef}
          value={editValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onBlur={handleSave}
          variant="outlined"
          size="small"
          placeholder="整数"
          inputProps={{
            style: {
              textAlign: 'center',
              fontSize: '14px',
              fontWeight: 'bold',
              padding: '4px'
            },
            inputMode: 'numeric',
            pattern: '[0-9]*'
          }}
          sx={{
            width: '60px',
            '& .MuiOutlinedInput-root': {
              height: '28px',
              '& fieldset': {
                borderColor: '#9c27b0',
              },
              '&:hover fieldset': {
                borderColor: '#9c27b0',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#9c27b0',
              },
            },
          }}
        />
      </RequestCellContainer>
    );
  }

  // 表示中の場合
  return (
    <RequestCellContainer 
      backgroundColor="#f3e5f5"
      onClick={handleClick}
      data-testid={`request-cell-${staffId}`}
      title={canEdit() ? `クリックして編集 (現在値: ${getDisplayValue()})` : `読み取り専用 (現在値: ${getDisplayValue()})`}
      sx={{
        cursor: canEdit() ? 'pointer' : 'default',
        '&:hover': canEdit() ? {
          backgroundColor: '#e1bee7',
          border: '2px solid #9c27b0',
        } : {}
      }}
    >
      <Typography
        variant="body2"
        sx={{
          fontSize: '14px',
          fontWeight: 'bold',
          color: '#9c27b0',
          userSelect: 'none'
        }}
      >
        {getDisplayValue()}
      </Typography>
    </RequestCellContainer>
  );
};

export default RequestCell; 