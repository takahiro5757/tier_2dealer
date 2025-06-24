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
  lockEnabled
}) => {
  const { 
    isLocationLocked, 
    toggleLocationLock
  } = useShiftContext();
  const [clickCount, setClickCount] = React.useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const lastClickTime = useRef<number>(0);
  const locationLocked = lockEnabled !== false && hasConfirmedLocation && isLocationLocked(staffId, date);
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const now = Date.now();
    const timeSinceLastClick = now - lastClickTime.current;
    if (lockEnabled !== false && timeSinceLastClick < 300) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      if (hasConfirmedLocation) {
        toggleLocationLock(staffId, date);
      }
      setClickCount(0);
      lastClickTime.current = 0;
      return;
    }
    lastClickTime.current = now;
    const newClickCount = clickCount + 1;
    setClickCount(newClickCount);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    timerRef.current = setTimeout(() => {
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
        title={location || ''}
        arrow
        placement="top"
        enterDelay={300}
        enterNextDelay={300}
        disableHoverListener={!location}
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
        </Box>
      </Tooltip>
    </Cell>
  );
};

export default memo(LocationCell); 