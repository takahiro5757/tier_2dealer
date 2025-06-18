'use client';

import React, { memo, useRef, useEffect } from 'react';
import { Box, TableCell, styled, Tooltip } from '@mui/material';
import { useShiftContext } from '../context/ShiftContext';

const Cell = styled(TableCell)(({ theme }) => ({
  padding: theme.spacing(0.5),
  textAlign: 'center',
  fontSize: 12,
  fontWeight: 600,
  whiteSpace: 'normal',
  height: 36,
  minHeight: 36,
  maxHeight: 36,
  lineHeight: 1.2,
  borderRight: '1px solid #000000',
  '&.staff-section': { borderRight: '2px solid #000000' },
  width: 112.5,
  maxWidth: 112.5,
  overflow: 'hidden',
}));

interface LocationCellProps {
  staffId: string;
  date: Date;
  isWeekend: boolean;
  isHighlighted: boolean;
  hasConfirmedLocation: boolean;
  isUnassigned: boolean;
  location?: string;
  cellId?: string;
  onCommentClick: (staffId: string, date: Date) => void;
  lockEnabled?: boolean;
}

const LocationCell: React.FC<LocationCellProps> = ({ 
  staffId,
  date,
  isWeekend,
  isHighlighted,
  hasConfirmedLocation,
  isUnassigned,
  location,
  cellId,
  onCommentClick,
  lockEnabled
}) => {
  const { 
    isLocationLocked, 
    toggleLocationLock, 
    getComment 
  } = useShiftContext();
  
  const [clickCount, setClickCount] = React.useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const lastClickTime = useRef<number>(0);
  
  const locationLocked = lockEnabled !== false && hasConfirmedLocation && isLocationLocked(staffId, date);
  const comment = getComment(staffId, date);
  const hasComment = !!comment;
  
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    
    const now = Date.now();
    const timeSinceLastClick = now - lastClickTime.current;
    
    // ダブルクリック検出を改善（300ms以内のクリックをダブルクリックとして扱う）
    if (lockEnabled !== false && timeSinceLastClick < 300) {
      // これはダブルクリック
      // ロック機能が有効な場合のみ
      console.log(`ダブルクリック検出: staffId=${staffId}, date=${date instanceof Date ? date.toISOString() : 'Invalid Date'}`);
      console.log(`hasConfirmedLocation=${hasConfirmedLocation}, locationLocked=${locationLocked}`);
      
      // タイマーをクリア
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      
      // ロックをトグル（確認済みの場所のみ）
      if (hasConfirmedLocation) {
        toggleLocationLock(staffId, date);
        console.log(`ロック切替: staffId=${staffId}, date=${date instanceof Date ? date.toISOString() : 'Invalid Date'}, locked=${!locationLocked}`);
      } else {
        console.log(`ロック不可: 確認済み場所ではありません。staffId=${staffId}, date=${date instanceof Date ? date.toISOString() : 'Invalid Date'}`);
      }
      
      setClickCount(0);
      lastClickTime.current = 0; // リセット
      return;
    }
    
    // シングルクリックの処理
    lastClickTime.current = now;
    
    const newClickCount = clickCount + 1;
    setClickCount(newClickCount);
    
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    
    // シングルクリックの処理を遅延実行
    timerRef.current = setTimeout(() => {
      if (newClickCount === 1) {
        console.log(`シングルクリック検出: staffId=${staffId}, date=${date instanceof Date ? date.toISOString() : 'Invalid Date'}`);
        onCommentClick(staffId, date);
      }
      setClickCount(0);
    }, 250);
  };
  
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);
  
  return (
    <Cell 
      id={cellId}
      className="staff-section"
      onClick={handleClick}
      sx={{ 
        border: isUnassigned 
          ? (isHighlighted ? '2px solid #000000' : '1px dashed #000000')
          : undefined,
        backgroundColor: isHighlighted && isUnassigned 
          ? '#ffe0b2'
          : isWeekend 
            ? '#ffdbac'
            : isUnassigned 
              ? 'transparent'
              : undefined,
        boxShadow: isHighlighted ? '0 0 8px #000000' : undefined,
        cursor: 'pointer',
        position: 'relative',
        '&:hover': { 
          backgroundColor: isWeekend ? '#ffccaa' : '#f0f0f0'
        },
        width: 112.5,
        maxWidth: 112.5,
        fontSize: 12,
        height: 36,
        minHeight: 36,
        maxHeight: 36,
        lineHeight: 1.2,
        overflow: 'hidden',
      }}
    >
      <Tooltip 
        title={location && location.length > 10 ? location : (comment || '')}
        arrow
        placement="top"
        enterDelay={300}
        enterNextDelay={300}
        disableHoverListener={!hasComment && (!location || location.length <= 10)}
      >
        <Box sx={{ 
          width: '100%', 
          height: '100%', 
          position: 'relative',
          overflow: 'hidden',
          whiteSpace: 'normal',
          wordBreak: 'break-word',
          fontSize: 12,
          padding: '2px 0',
          textOverflow: 'ellipsis',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
        }}>
          {location || ''}
          {lockEnabled !== false && locationLocked && (
            <Box 
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                fontSize: 12,
                color: '#9e9e9e',
                opacity: 0.8,
                pointerEvents: 'none',
                zIndex: 10
              }}
            >
              🔒
            </Box>
          )}
          {hasComment && (
            <Box 
              sx={{
                position: 'absolute',
                top: '0',
                left: '0',
                width: 0,
                height: 0,
                borderStyle: 'solid',
                borderWidth: '10px 10px 0 0',
                borderColor: '#f44336 transparent transparent transparent',
                opacity: 0.8,
                pointerEvents: 'none',
                zIndex: 10
              }}
            />
          )}
        </Box>
      </Tooltip>
    </Cell>
  );
};

export default memo(LocationCell); 