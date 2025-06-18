'use client';

import React, { useState, useRef, useEffect, memo } from 'react';
import { Box, TableCell, styled } from '@mui/material';
import { useShiftContext } from '../context/ShiftContext';

const Cell = styled(TableCell)(({ theme }) => ({
  padding: theme.spacing(0.5),
  textAlign: 'center',
  fontSize: 14,
  fontWeight: 600,
  whiteSpace: 'nowrap',
  height: 36,
  lineHeight: 1,
  borderRight: '1px solid #000000',
}));

interface RateCellProps {
  staffId: string;
  date: Date;
  hasConfirmedLocation: boolean;
  isReadOnly?: boolean;
}

const RateCell: React.FC<RateCellProps> = ({ staffId, date, hasConfirmedLocation, isReadOnly = false }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  
  const { getRate, updateRate } = useShiftContext();
  const isWeekend = date.getDay() === 0 || date.getDay() === 6;
  const rate = getRate(staffId, date, isWeekend);
  
  useEffect(() => {
    if (isEditing) {
      setValue(rate.toString());
      // フォーカスを自動設定
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing, rate]);
  
  // 編集開始
  const handleClick = () => {
    if (hasConfirmedLocation && !isReadOnly) {
      setIsEditing(true);
    }
  };
  
  // 単価入力変更
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    // 数字のみ許可
    if (/^\d*$/.test(newValue)) {
      setValue(newValue);
    }
  };
  
  // 更新を確定
  const handleUpdate = () => {
    const rateValue = parseInt(value);
    if (rateValue > 0) {
      updateRate(staffId, date, rateValue);
    }
    setIsEditing(false);
  };
  
  // キーボードイベント処理
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleUpdate();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
    }
  };
  
  // 外部クリック検出用イベントリスナー
  useEffect(() => {
    if (isEditing) {
      const handleClickOutside = (e: MouseEvent) => {
        if (inputRef.current && !inputRef.current.contains(e.target as Node)) {
          handleUpdate();
        }
      };
      
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isEditing, value]);
  
  return (
    <Cell 
      onClick={handleClick}
      sx={{
        backgroundColor: isWeekend ? '#ffdbac' : undefined,
        cursor: hasConfirmedLocation && !isReadOnly ? 'pointer' : 'default',
        '&:hover': hasConfirmedLocation && !isReadOnly ? { 
          backgroundColor: isWeekend ? '#ffccaa' : '#f0f0f0',
          textDecoration: 'underline'
        } : {}
      }}
    >
      {isEditing ? (
        <Box sx={{ 
          display: 'flex', 
          width: '100%', 
          justifyContent: 'center', 
          alignItems: 'center' 
        }}>
          <span style={{ marginRight: '4px' }}>¥</span>
          <input
            ref={inputRef}
            className="rate-edit-input"
            type="text"
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '60px',
              padding: '2px 4px',
              fontSize: '14px',
              fontWeight: 600,
              border: '1px solid #1976d2',
              borderRadius: '4px',
              textAlign: 'right'
            }}
            readOnly={isReadOnly}
            disabled={isReadOnly}
          />
        </Box>
      ) : (
        hasConfirmedLocation ? `¥${rate.toLocaleString()}` : ''
      )}
    </Cell>
  );
};

export default memo(RateCell); 