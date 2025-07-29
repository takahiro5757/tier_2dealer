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
  getLocation?: (staffId: string, date: Date) => string; // 場所取得関数を追加
}

// 履歴表示用のカスタムツールチップ内容
interface HistoryTooltipContentProps {
  history: Array<{
    timestamp: number;
    oldStatus: string;
    newStatus: string;
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

const StatusCell: React.FC<StatusCellProps> = ({ staffId, date, isWeekend, disableDoubleClick, isReadOnly, getLocation }) => {
  const { getStatus, updateStatus, getStatusHistory } = useShiftContext();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const lastClickTime = useRef<number>(0);

  const currentStatus = getStatus(staffId, date);
  
  // 背景色を判定する関数
  const getCellBackgroundColor = (): string => {
    // ○かつ稼働場所が空白ではない場合は黄色
    if (currentStatus === '○' && getLocation) {
      const location = getLocation(staffId, date);
      if (location && location.trim() !== '') {
        return '#ffff80'; // 薄い黄色の背景
      }
    }
    
    // △の場合は赤色
    if (currentStatus === '△') {
      return '#ff9999'; // 薄い赤色の背景
    }
    
    // 土日の場合
    if (isWeekend) return '#ffdbac';
    
    // ○の場合は白
    if (currentStatus === '○') {
      return '#ffffff';
    }
    
    return ''; // デフォルト（透明）
  };

  // メニューが開いている時の外部クリック検出
  useEffect(() => {
    if (Boolean(anchorEl)) {
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
  }, [anchorEl]);
  
  // メニューを開く
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    if (isReadOnly) return; // 読み取り専用の場合は何もしない
    setAnchorEl(event.currentTarget);
  };

  // ダブルクリックでハイライト切り替え
  const handleDoubleClick = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    if (isReadOnly) return; // 読み取り専用の場合は何もしない
    if (currentStatus === '○' && !disableDoubleClick) {
      // ダブルクリックの間隔をチェック
      const now = Date.now();
      if (now - lastClickTime.current < 300) { // 300ms以内のクリック
        // ハイライトを切り替え
        // ここではisHighlightedを使用していないため、直接currentStatusを変更
        updateStatus(staffId, date, currentStatus === '○' ? '×' : '○');
      }
      lastClickTime.current = now; // クリック時刻を更新
    }
  };
  
  // メニューを閉じる
  const handleClose = () => {
    setAnchorEl(null);
  };
  
  // 希望を選択
  const handleStatusSelect = (newStatus: '○' | '×' | '△') => {
    updateStatus(staffId, date, newStatus as any);
    setAnchorEl(null); // 直接nullを設定してメニューを閉じる
    // ○以外を選択した場合はハイライトを解除
    if (newStatus !== '○') {
      // ダブルクリックの間隔をリセット
      lastClickTime.current = 0;
    }
  };
  

  
  // ホバー時の背景色を決定
  const getHoverBackgroundColor = () => {
    // ○かつ稼働場所が空白ではない場合は濃い黄色
    if (currentStatus === '○' && getLocation) {
      const location = getLocation(staffId, date);
      if (location && location.trim() !== '') {
        return '#ffff4d'; // 少し濃い薄い黄色のホバー
      }
    }
    
    // △の場合は濃い赤色
    if (currentStatus === '△') {
      return '#ff6666'; // 少し濃い薄い赤色のホバー
    }
    
    // 土日のホバー色を次に優先
    if (isWeekend) return '#ffccaa';
    if (currentStatus === '○') {
      return '#f5f5f5'; // 通常時は薄いグレー
    }
    return undefined;
  };
  
  return (
    <Tooltip
      title={<HistoryTooltipContent history={getStatusHistory(staffId, date)} />}
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
      disableHoverListener={getStatusHistory(staffId, date).length === 0} // 履歴がない場合はツールチップを表示しない
    >
      <Cell 
        onClick={handleClick}
        onDoubleClick={disableDoubleClick ? undefined : handleDoubleClick}
        sx={{
          backgroundColor: getCellBackgroundColor(),
          cursor: isReadOnly ? 'default' : 'pointer',
          '&:hover': isReadOnly ? {} : { 
            backgroundColor: getHoverBackgroundColor(),
            textDecoration: 'underline'
          },
          position: 'relative'
        }}
      >
        {currentStatus}
        
        {/* ステータス選択メニュー */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
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
              handleStatusSelect('△');
            }}
            sx={{ 
              color: '#b8860b',
              '&:hover': { backgroundColor: '#fffbcc' }
            }}
          >
            △ 未定
          </MenuItem>
        </Menu>
        
        {/* 変更履歴がある場合は小さなインジケーターを表示 */}
        {getStatusHistory(staffId, date).length > 0 && (
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