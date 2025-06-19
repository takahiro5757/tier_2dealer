'use client';

import React, { useState, memo, useRef, useEffect } from 'react';
import { 
  Box, 
  TableCell, 
  styled, 
  Tooltip,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
  Menu,
  MenuItem,
  ButtonBase
} from '@mui/material';
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

interface StatusCellProps {
  staffId: string;
  date: Date;
  isWeekend: boolean;
  disableDoubleClick?: boolean; // ダブルクリック機能を無効にするオプション
  isReadOnly?: boolean; // 読み取り専用モード
}

// 履歴表示用のカスタムツールチップ内容
interface HistoryTooltipContentProps {
  history: Array<{
    timestamp: number;
    oldStatus: '○' | '×' | '-';
    newStatus: '○' | '×' | '-';
    username: string;
  }>;
}

const HistoryTooltipContent: React.FC<HistoryTooltipContentProps> = ({ history }) => {
  // 履歴がない場合は空のコンポーネントを返す
  if (history.length === 0) {
    return null;
  }

  // 履歴を新しい順（降順）にソートし、最新の3件だけを取得
  const sortedHistory = [...history]
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 3);

  return (
    <Paper sx={{ 
      p: 1, 
      maxWidth: 300, 
      // 高さを十分確保する
      maxHeight: 300,
      minHeight: 100,
      overflow: 'auto' 
    }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
        変更履歴
      </Typography>
      <Divider sx={{ mb: 1 }} />
      <List dense disablePadding sx={{ 
        // リストのスタイル調整
        '& .MuiListItem-root': {
          py: 0.5,
          display: 'block'
        }
      }}>
        {sortedHistory.map((entry, index) => (
          <ListItem key={index} sx={{ 
            py: 0.5,
            my: 0.5,
            border: '1px solid #f0f0f0',
            borderRadius: 1
          }}>
            <ListItemText
              disableTypography
              primary={
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    {entry.oldStatus} → {entry.newStatus}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                    {typeof window !== 'undefined' ? 
                    `${new Date(entry.timestamp).toLocaleDateString('ja-JP')} ${new Date(entry.timestamp).toLocaleTimeString('ja-JP')}` :
                    new Date(entry.timestamp).toISOString()
                  }
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    変更者: {entry.username}
                  </Typography>
                </Box>
              }
            />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};

const StatusCell: React.FC<StatusCellProps> = ({ staffId, date, isWeekend, disableDoubleClick, isReadOnly }) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [isHighlighted, setIsHighlighted] = useState<boolean>(false);
  const { 
    getStatus, 
    isStatusChanged, 
    updateStatus,
    getStatusHistory
  } = useShiftContext();
  
  const status = getStatus(staffId, date);
  const statusChanged = isStatusChanged(staffId, date);
  const statusHistory = getStatusHistory(staffId, date);
  const isMenuOpen = Boolean(anchorEl);

  // メニューが開いている時の外部クリック検出
  useEffect(() => {
    if (isMenuOpen) {
      const handleDocumentClick = (event: MouseEvent) => {
        if (anchorEl && !anchorEl.contains(event.target as Node)) {
          setAnchorEl(null);
        }
      };

      // 少し遅延させてイベントリスナーを追加
      const timeoutId = setTimeout(() => {
        document.addEventListener('click', handleDocumentClick);
      }, 100);

      return () => {
        clearTimeout(timeoutId);
        document.removeEventListener('click', handleDocumentClick);
      };
    }
  }, [isMenuOpen, anchorEl]);
  
  // メニューを開く
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    if (isReadOnly) return; // 読み取り専用の場合は何もしない
    setAnchorEl(event.currentTarget);
  };

  // ダブルクリックでハイライト切り替え
  const handleDoubleClick = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    if (isReadOnly) return; // 読み取り専用の場合は何もしない
    if (status === '○' && !disableDoubleClick) {
      setIsHighlighted(!isHighlighted);
    }
  };
  
  // メニューを閉じる
  const handleClose = () => {
    setAnchorEl(null);
  };
  
  // 希望を選択
  const handleStatusSelect = (newStatus: '○' | '×' | '-') => {
    updateStatus(staffId, date, newStatus);
    setAnchorEl(null); // 直接nullを設定してメニューを閉じる
    // ○以外を選択した場合はハイライトを解除
    if (newStatus !== '○') {
      setIsHighlighted(false);
    }
  };
  
  // 背景色を決定
  const getBackgroundColor = () => {
    // ダブルクリック機能が無効な場合はハイライトを適用しない
    if (status === '○' && isHighlighted && !disableDoubleClick) {
      return '#ffd54f'; // ダブルクリックのハイライトを最優先
    }
    // 土日の背景色を次に優先
    if (isWeekend) return '#ffdbac';
    if (status === '○') {
      return '#ffffff'; // 通常時は白
    }
    return undefined;
  };
  
  // ホバー時の背景色を決定
  const getHoverBackgroundColor = () => {
    // ダブルクリック機能が無効な場合はハイライトを適用しない
    if (status === '○' && isHighlighted && !disableDoubleClick) {
      return '#ffca28'; // ダブルクリックのハイライトホバーを最優先
    }
    // 土日のホバー色を次に優先
    if (isWeekend) return '#ffccaa';
    if (status === '○') {
      return '#f5f5f5'; // 通常時は薄いグレー
    }
    return '#f0f0f0';
  };
  
  return (
    <Tooltip
      title={<HistoryTooltipContent history={statusHistory} />}
      placement="right"
      enterDelay={500}
      enterNextDelay={100}
      PopperProps={{
        sx: {
          '& .MuiTooltip-tooltip': {
            backgroundColor: 'transparent',
            p: 0
          }
        }
      }}
      disableInteractive={false}
      disableHoverListener={statusHistory.length === 0} // 履歴がない場合はツールチップを表示しない
    >
      <Cell 
        onClick={handleClick}
        onDoubleClick={disableDoubleClick ? undefined : handleDoubleClick}
        sx={{
          backgroundColor: getBackgroundColor(),
          cursor: isReadOnly ? 'default' : 'pointer',
          '&:hover': isReadOnly ? {} : { 
            backgroundColor: getHoverBackgroundColor(),
            textDecoration: 'underline'
          },
          position: 'relative'
        }}
      >
        {status}
        
        {/* ステータス選択メニュー */}
        <Menu
          anchorEl={anchorEl}
          open={isMenuOpen}
          onClose={handleClose}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'center',
          }}
          transformOrigin={{
            vertical: 'bottom',
            horizontal: 'center',
          }}
          disableRestoreFocus
          MenuListProps={{
            'aria-labelledby': 'status-selection-button',
          }}
          PaperProps={{
            elevation: 3,
            sx: {
              mt: -1,
              minWidth: 120,
              '& .MuiMenuItem-root': {
                px: 2,
                py: 1,
                fontSize: '16px',
                fontWeight: 600,
                minHeight: 'auto',
                justifyContent: 'center'
              }
            }
          }}
        >
          <MenuItem 
            onClick={(e) => {
              e.stopPropagation();
              handleStatusSelect('○');
            }}
            sx={{ 
              color: '#2e7d32',
              '&:hover': { backgroundColor: '#e8f5e9' }
            }}
          >
            ○ 希望
          </MenuItem>
          <MenuItem 
            onClick={(e) => {
              e.stopPropagation();
              handleStatusSelect('×');
            }}
            sx={{ 
              color: '#d32f2f',
              '&:hover': { backgroundColor: '#ffebee' }
            }}
          >
            × 不可
          </MenuItem>
          <MenuItem 
            onClick={(e) => {
              e.stopPropagation();
              handleStatusSelect('-');
            }}
            sx={{ 
              color: '#757575',
              '&:hover': { backgroundColor: '#f5f5f5' }
            }}
          >
            - 未定
          </MenuItem>
        </Menu>
        
        {/* 変更履歴がある場合は小さなインジケーターを表示 */}
        {statusHistory.length > 0 && (
          <Box 
            sx={{ 
              position: 'absolute',
              top: 0,
              right: 0,
              width: 5,
              height: 5,
              borderRadius: '50%',
              backgroundColor: '#f44336',
            }}
          />
        )}
      </Cell>
    </Tooltip>
  );
};

export default memo(StatusCell); 