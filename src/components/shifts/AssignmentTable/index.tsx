'use client';

import { useState, useRef, useEffect } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  styled,
  Popover,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  InputAdornment,
  Divider,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  FormControlLabel,
  Checkbox
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import FlightIcon from '@mui/icons-material/Flight';
import CancelIcon from '@mui/icons-material/Cancel';
import LockIcon from '@mui/icons-material/Lock';
import SendIcon from '@mui/icons-material/Send';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import HistoryIcon from '@mui/icons-material/History';
import ColorLensIcon from '@mui/icons-material/ColorLens';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import ClearIcon from '@mui/icons-material/Clear';
import SettingsIcon from '@mui/icons-material/Settings';
import OrderFrameDialog from '../OrderFrameDialog';
import { AssignmentItem, DateInfo, MemoItem } from '@/types/shifts';

// スタイル付きコンポーネント
const StyledTableContainer = styled('div')(({ theme }) => ({
  maxHeight: 'calc(100vh - 180px)',
  overflowY: 'auto',
  '& .MuiTableCell-root': {
    padding: '4px',
    fontSize: '0.8rem',
  },
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  borderRight: '1px solid rgba(210, 210, 210, 0.8)',
  borderBottom: '1px solid rgba(210, 210, 210, 0.8)',
  '&:last-child': {
    borderRight: 'none',
  },
}));

const HeaderCell = styled(StyledTableCell)(({ theme }) => ({
  backgroundColor: theme.palette.grey[100],
  fontWeight: 'bold',
  position: 'sticky',
  top: 0,
  zIndex: 2,
}));

// styled componentsでカスタムpropsを使用するための型定義
interface DroppableCellProps {
  isAvailable: boolean;
}

interface OrderCellProps {
  isGirl: boolean;
}

const DroppableCell = styled(StyledTableCell, {
  shouldForwardProp: (prop) => prop !== 'isAvailable' && prop !== 'isGirl'
})<{ isAvailable?: boolean; isGirl?: boolean }>(({ theme, isAvailable, isGirl }) => ({
  width: '100px',
  height: '30px',
  minHeight: '30px',
  maxHeight: '30px',
  backgroundColor: isAvailable ? '#fff' : '#f5f5f5',
  position: 'relative',
  textAlign: 'center',
  padding: '2px',
  boxSizing: 'border-box',
  transition: 'background-color 0.2s ease',
  '&.dragOver': {
    backgroundColor: 'rgba(33, 150, 243, 0.08)',
    opacity: 0.9,
    border: '1px dashed #1976d2',
    boxShadow: '0 0 5px rgba(25, 118, 210, 0.3)'
  }
}));

const VenueCell = styled(StyledTableCell)(({ theme }) => ({
  maxWidth: '250px',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  position: 'relative',
}));

const AgencyCell = styled(StyledTableCell)(({ theme }) => ({
  width: '100px',
}));

const OrderCell = styled(TableCell, {
  shouldForwardProp: (prop) => prop !== 'isGirl'
})<{ isGirl?: boolean }>(({ theme, isGirl }) => ({
  width: '100px',
  color: isGirl ? '#e91e63' : '#2196f3',
  borderRight: '1px solid rgba(210, 210, 210, 0.8)',
  borderBottom: '1px solid rgba(210, 210, 210, 0.8)',
}));

// ステータスチップのスタイリング
const StatusChip = styled('div')<{ status: string }>(({ theme, status }) => ({
  display: 'inline-block',
  padding: '4px 8px',
  borderRadius: '4px',
  fontSize: '0.8rem',
  fontWeight: 'bold',
  width: '90%',
  boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
  backgroundColor: 
    status === 'absent' ? '#ffcdd2' : 
    status === 'tm' ? '#bbdefb' : 
    status === 'selected' ? '#dcedc8' : 'transparent',
  color:
    status === 'absent' ? '#c62828' :
    status === 'tm' ? '#0d47a1' :
    status === 'selected' ? '#33691e' : 'inherit',
}));

// 各セルの利用可否を計算するヘルパー関数
function getBackgroundColor(isAvailable: boolean, assignmentId: string, date: string, orderId: string): string {
  if (!isAvailable) return '#f5f5f5';
  
  // 同じセルで固定の背景色を得るためのハッシュ関数
  const hashCode = (str: string): number => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  };
  
  // 文字列を連結してハッシュを計算
  const combinedString = `${assignmentId}-${date}-${orderId}`;
  const hash = hashCode(combinedString);
  
  // 70%の確率で白、30%の確率で薄いグレー
  return hash % 10 < 7 ? '#ffffff' : '#f9f9f9';
}

// ステータスの表示テキストを取得
const getStatusDisplay = (status: string) => {
  switch(status) {
    case 'absent': return '欠勤';
    case 'tm': return 'TM';
    case 'selected': return '選択';
    default: return '';
  }
};

// メモテキストのフォーマット
const formatMemoText = (memos: MemoItem[]): string => {
  if (!memos || memos.length === 0) return '';
  
  // 新しいメモから順に並べる
  const sortedMemos = [...memos].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
  
  // 最新の3件まで表示
  const displayMemos = sortedMemos.slice(0, 3);
  
  if (memos.length > 3) {
    return `${memos.length}件のメモ (最新: ${displayMemos[0].text.substring(0, 20)}${displayMemos[0].text.length > 20 ? '...' : ''})`;
  } else if (memos.length === 1) {
    return displayMemos[0].text;
  } else {
    return `${memos.length}件のメモ`;
  }
};

// セルの背景色を取得するヘルパー関数
const getCellBackgroundColor = (
  assignmentId: string, 
  date: string, 
  orderId: string, 
  isAvailable: boolean, 
  isOtherMonth: boolean, 
  customColors: {[key: string]: string}, 
  displayMode?: string
) => {
  // 他の月の日付は薄いグレー
  if (isOtherMonth) return '#f5f5f5';
  
  // カスタムカラーが設定されている場合はそちらを優先
  const colorKey = `${assignmentId}-${date}-${orderId}`;
  if (customColors[colorKey]) return customColors[colorKey];
  
  // その他の場合はランダムだが固定の背景色を使用
  return getBackgroundColor(isAvailable, assignmentId, date, orderId);
};

// メモ入力のキーダウンハンドラ
const handleMemoKeyDown = (event: React.KeyboardEvent, onSend: () => void) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    onSend();
  }
};

// 帯案件残数の表示をレンダリング
const renderSeriesFrames = (assignment: AssignmentItem) => {
  if (!assignment.seriesFrames) return null;
  
  const { totalFrames, confirmedFrames } = assignment.seriesFrames;
  const percentage = Math.round((confirmedFrames / totalFrames) * 100);
  
  // 進捗バーの色を決定（50%以下は青、51-80%は黄色、81%以上は赤）
  let barColor = '#2196f3'; // 青
  if (percentage > 80) {
    barColor = '#f44336'; // 赤
  } else if (percentage > 50) {
    barColor = '#ff9800'; // オレンジ
  }

  return (
    <Box sx={{ 
      width: '100%', 
      mt: 1, 
      borderRadius: 1, 
      overflow: 'hidden',
      border: '1px solid #e0e0e0',
      bgcolor: '#f5f5f5'
    }}>
      <Box sx={{ 
        height: '12px', 
        width: `${percentage}%`, 
        bgcolor: barColor,
        borderRadius: '2px 0 0 2px'
      }} />
      <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', mt: 0.5 }}>
        {confirmedFrames}/{totalFrames} 枠（{percentage}%）
      </Typography>
    </Box>
  );
};

interface AssignmentTableProps {
  assignments: AssignmentItem[];
  dates: DateInfo[];
  onEdit?: (assignment: AssignmentItem) => void;
  displayMode?: string; // 表示モード: 'normal' または 'series'
}

// セルが利用可能かどうかを判断する関数を拡張
function isCellAvailable(baseAvailability: boolean, assignmentId: string, date: string, orderId: string, isOtherMonth: boolean, displayMode?: string): boolean {
  // 帯案件モードの場合は常に利用可能に
  if (displayMode === 'series') {
    // 他の月の日付セルは常に利用不可に（帯案件モードでも他の月は利用不可）
    if (isOtherMonth) {
      return false;
    }
    return true;
  }
  
  // 通常モードの処理（既存のロジック）
  // 他の月の日付セルは常に利用不可に
  if (isOtherMonth) {
    return false;
  }
  
  // 基本的な利用可能性が false なら利用不可
  if (!baseAvailability) return false;
  
  // 灰色セルも利用不可に設定
  const bgColor = getBackgroundColor(true, assignmentId, date, orderId);
  return bgColor === '#fff'; // 白いセルのみ利用可能
}

// 削除ボタン用のスタイル
const DeleteButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  top: '-8px',
  right: '-8px',
  padding: '2px',
  backgroundColor: '#fff',
  border: '1px solid #ddd',
  '&:hover': {
    backgroundColor: '#f5f5f5',
  },
  '& .MuiSvgIcon-root': {
    fontSize: '16px',
  },
  zIndex: 10,
  display: 'none',
  className: 'delete-button',
}));

// 要員情報表示用のスタイル付きコンポーネント
const StaffItem = styled(Box)<{ isGirl: boolean }>(({ theme, isGirl }) => ({
  backgroundColor: isGirl 
    ? 'rgba(233, 30, 99, 0.1)' // ガール用の薄いピンク
    : 'rgba(25, 118, 210, 0.1)', // クローザー用の薄い青
  color: isGirl ? '#e91e63' : '#2196f3', // フォントカラーを明示的に設定
  borderRadius: '4px',
  padding: '1px',
  margin: '1px auto',
  width: '98%',
  textAlign: 'center',
  position: 'relative',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  fontSize: '0.6rem',
  lineHeight: '1.1',
  '&:hover': {
    backgroundColor: isGirl 
      ? 'rgba(233, 30, 99, 0.2)' 
      : 'rgba(25, 118, 210, 0.2)',
    '& .delete-button': {
      display: 'block'
    }
  },
}));

// CellContentを調整して、複数の要素を配置できるようにする
const CellContent = styled(Box)({
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  height: '100%',
  padding: '2px',
});

// メモ通知インジケーター用のスタイル
const MemoIndicator = styled('div')({
  position: 'absolute',
  top: '2px',
  right: '2px',
  width: '16px',
  height: '16px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '50%',
  backgroundColor: '#ffb74d',
  color: '#fff',
  fontSize: '10px',
  fontWeight: 'bold',
});

export default function AssignmentTable({ assignments, dates, onEdit, displayMode }: AssignmentTableProps) {
  // 状態管理
  const [editDialogOpen, setEditDialogOpen] = useState<boolean>(false);
  const [currentAssignment, setCurrentAssignment] = useState<AssignmentItem | null>(null);
  const [editedAgency, setEditedAgency] = useState<string>('');
  const [editedVenue, setEditedVenue] = useState<string>('');
  const [editedVenueDetail, setEditedVenueDetail] = useState<string>('');
  const [editedHasTrip, setEditedHasTrip] = useState<boolean>(false);
  const [editedIsOutdoor, setEditedIsOutdoor] = useState<boolean>(false);
  const [hoveredCell, setHoveredCell] = useState<string | null>(null);
  
  // メモポップアップ用の状態
  const [memoAnchorEl, setMemoAnchorEl] = useState<HTMLElement | null>(null);
  const [memoPopupPosition, setMemoPopupPosition] = useState<{ top: number; left: number } | null>(null);
  const [memoText, setMemoText] = useState<string>('');
  const [currentMemoCell, setCurrentMemoCell] = useState<{
    assignmentId: string;
    date: string;
    orderId: string;
  } | null>(null);
  
  // クリックタイマー（シングルクリックとダブルクリックを区別するため）
  const clickTimerRef = useRef<NodeJS.Timeout | null>(null);
  const clickCountRef = useRef<number>(0);
  
  // メモポップアップの開閉状態
  const isMemoOpen = Boolean(memoPopupPosition);
  
  // 右クリックメニュー用の状態
  const [contextMenu, setContextMenu] = useState<{
    mouseX: number;
    mouseY: number;
    assignmentId: string;
    date: string;
    orderId: string;
  } | null>(null);
  
  // カラーピッカーダイアログの状態
  const [colorDialog, setColorDialog] = useState(false);
  const [selectedCellForColor, setSelectedCellForColor] = useState<{
    assignmentId: string;
    date: string;
    orderId: string;
  } | null>(null);
  
  // 編集履歴ダイアログの状態
  const [historyDialog, setHistoryDialog] = useState(false);
  const [selectedCellForHistory, setSelectedCellForHistory] = useState<{
    assignmentId: string;
    date: string;
    orderId: string;
  } | null>(null);
  
  // カスタムセル色の状態
  const [customCellColors, setCustomCellColors] = useState<{
    [key: string]: string;
  }>({});
  
  // オーダー枠設定ダイアログ用の状態
  const [orderFrameDialogOpen, setOrderFrameDialogOpen] = useState<boolean>(false);

  // メモポップアップを開く - クリックイベントハンドラ
  const handleCellClick = (
    event: React.MouseEvent<HTMLElement>,
    assignmentId: string,
    date: string,
    orderId: string
  ) => {
    console.log('=== Cell Click ===');
    console.log('Target:', event.currentTarget);
    console.log('Assignment ID:', assignmentId);
    console.log('Date:', date);
    console.log('Order ID:', orderId);
    
    event.preventDefault();
    
    // セルがロックされている場合はクリックを無視
    const isLocked = assignments.find(a => a.id === assignmentId)?.locks?.[orderId]?.[date] || false;
    if (isLocked) {
      console.log('Cell is locked, ignoring click');
      return;
    }
    
    // クリックカウントを増加
    clickCountRef.current += 1;
    console.log('Click count:', clickCountRef.current);
    
    // マウスイベントの位置を保存
    const clickPosition = {
      top: event.clientY,
      left: event.clientX
    };
    
    // シングルクリックかダブルクリックかを判定するタイマーをセット
    if (clickTimerRef.current === null) {
      console.log('Setting click timer');
      clickTimerRef.current = setTimeout(() => {
        console.log('Timer fired, click count:', clickCountRef.current);
        // シングルクリックの場合
        if (clickCountRef.current === 1) {
          // メモポップアップを開く
          console.log('Single click detected - opening memo popup');
          console.log('Setting popup position:', clickPosition);
          setMemoPopupPosition(clickPosition);
          setCurrentMemoCell({ assignmentId, date, orderId });
          setMemoText('');
          console.log('Memo popup state (isMemoOpen):', Boolean(clickPosition));
        }
        // カウンタとタイマーをリセット
        clickCountRef.current = 0;
        clickTimerRef.current = null;
      }, 250);
    }
  };

  // セルのダブルクリックハンドラ - ロック切り替え
  const handleCellDoubleClick = (
    event: React.MouseEvent<HTMLElement>,
    assignmentId: string, 
    date: string, 
    orderId: string
  ) => {
    console.log('=== Double Click ===');
    event.preventDefault();
    event.stopPropagation();
    
    // ダブルクリックの場合は、タイマーをクリアしてシングルクリックのアクションを防止
    if (clickTimerRef.current) {
      console.log('Clearing click timer for double click');
      clearTimeout(clickTimerRef.current);
      clickTimerRef.current = null;
    }
    
    // カウンタをリセット
    clickCountRef.current = 0;
    
    // セルのロック状態を切り替え
    console.log('Double click detected - toggling lock state');
    toggleCellLock(assignmentId, date, orderId);
  };

  // セルのロック状態を切り替える
  const toggleCellLock = (assignmentId: string, date: string, orderId: string) => {
    if (!onEdit) return;
    
    const targetAssignment = assignments.find(a => a.id === assignmentId);
    
    if (targetAssignment) {
      // 深いコピーを作成
      const updatedAssignment = JSON.parse(JSON.stringify(targetAssignment));
      
      // ロック情報がない場合は初期化
      if (!updatedAssignment.locks) {
        updatedAssignment.locks = {};
      }
      
      // 特定のオーダーのロック情報がない場合は初期化
      if (!updatedAssignment.locks[orderId]) {
        updatedAssignment.locks[orderId] = {};
      }
      
      // ロック状態を切り替え
      updatedAssignment.locks[orderId][date] = !updatedAssignment.locks[orderId][date];
      
      // 更新を適用
      onEdit(updatedAssignment);
    }
  };

  // メモポップアップを閉じる
  const handleCloseMemoPopup = () => {
    console.log('Closing memo popup');
    setMemoPopupPosition(null);
    setCurrentMemoCell(null);
  };

  // メモ送信ハンドラ
  const handleSendMemo = () => {
    if (!currentMemoCell || !memoText.trim()) return;
    
    const { assignmentId, date, orderId } = currentMemoCell;
    console.log('Sending memo:', memoText);
    console.log('For cell:', assignmentId, date, orderId);
    
    // 新しいメモオブジェクトを作成
    const newMemo = {
      id: `memo-${Date.now()}`,
      text: memoText.trim(),
      timestamp: new Date().toISOString(),
      user: 'Current User' // 実際のシステムではログインユーザー名を使用
    };
    
    // 新しい配列を作成してステート更新
    const updatedAssignments = assignments.map(assignment => {
      if (assignment.id === assignmentId) {
        // メモオブジェクトが存在しない場合は初期化
        const updatedMemos = { ...(assignment.memos || {}) };
        if (!updatedMemos[orderId]) {
          updatedMemos[orderId] = {};
        }
        if (!updatedMemos[orderId][date]) {
          updatedMemos[orderId][date] = [];
        }
        
        // 新しいメモを追加
        updatedMemos[orderId][date] = [
          ...updatedMemos[orderId][date],
          newMemo
        ];
        
        return {
          ...assignment,
          memos: updatedMemos
        };
      }
      return assignment;
    });
    
    // メモポップアップを閉じて状態をリセット
    handleCloseMemoPopup();
    
    // コンソールで確認（実際のシステムではAPIに送信など）
    console.log('Updated assignments with new memo:', updatedAssignments);
  };

  // コンポーネントのアンマウント時にタイマーをクリア
  useEffect(() => {
    return () => {
      if (clickTimerRef.current) {
        clearTimeout(clickTimerRef.current);
        clickTimerRef.current = null;
      }
    };
  }, []);

  // メモポップアップの開閉状態を監視
  useEffect(() => {
    console.log('Memo popup state changed:', isMemoOpen);
    console.log('Popup position:', memoPopupPosition);
    console.log('Current memo cell:', currentMemoCell);
  }, [isMemoOpen, memoPopupPosition, currentMemoCell]);

  // 編集ダイアログを開く
  const handleOpenEditDialog = (assignment: AssignmentItem) => {
    setCurrentAssignment(assignment);
    setEditedAgency(assignment.agency);
    setEditedVenue(assignment.venue);
    setEditedVenueDetail(assignment.venueDetail);
    setEditedHasTrip(assignment.hasTrip);
    setEditedIsOutdoor(assignment.isOutdoor);
    setEditDialogOpen(true);
  };

  // 編集ダイアログを閉じる
  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
    setCurrentAssignment(null);
  };

  // 編集を保存
  const handleSaveEdit = () => {
    if (currentAssignment && onEdit) {
      const updatedAssignment = {
        ...currentAssignment,
        agency: editedAgency,
        venue: editedVenue,
        venueDetail: editedVenueDetail,
        hasTrip: editedHasTrip,
        isOutdoor: editedIsOutdoor
      };
      onEdit(updatedAssignment);
    }
    handleCloseEditDialog();
  };

  // 利用可能日のドロップ領域IDを生成
  const getDroppableId = (assignmentId: string, date: string, orderId: string) => {
    return `assignment-${assignmentId}-date-${date}-order-${orderId}`;
  };

  // セルからステータスを削除する関数
  const handleRemoveStatus = (assignmentId: string, date: string, orderId: string) => {
    // ステータスの削除処理を実装
    if (onEdit) {
      const targetAssignment = assignments.find(a => a.id === assignmentId);
      if (targetAssignment && targetAssignment.statuses?.[orderId]?.[date]) {
        // 深いコピーを作成
        const updatedAssignment = JSON.parse(JSON.stringify(targetAssignment));
        
        // 該当するステータスを削除
        delete updatedAssignment.statuses[orderId][date];
        
        // 更新を適用
        onEdit(updatedAssignment);
      }
    }
  };

  // 右クリックハンドラー
  const handleContextMenu = (
    event: React.MouseEvent,
    assignmentId: string,
    date: string,
    orderId: string
  ) => {
    event.preventDefault();
    setContextMenu({
      mouseX: event.clientX - 2,
      mouseY: event.clientY - 4,
      assignmentId,
      date,
      orderId
    });
  };

  // 右クリックメニューを閉じる
  const handleCloseContextMenu = () => {
    setContextMenu(null);
  };

  // 編集履歴を表示
  const handleOpenHistory = () => {
    if (contextMenu) {
      setSelectedCellForHistory({
        assignmentId: contextMenu.assignmentId,
        date: contextMenu.date,
        orderId: contextMenu.orderId
      });
      setHistoryDialog(true);
      handleCloseContextMenu();
    }
  };

  // 編集履歴ダイアログを閉じる
  const handleCloseHistoryDialog = () => {
    setHistoryDialog(false);
    setSelectedCellForHistory(null);
  };

  // セル色変更ダイアログを開く
  const handleOpenColorDialog = () => {
    if (contextMenu) {
      setSelectedCellForColor({
        assignmentId: contextMenu.assignmentId,
        date: contextMenu.date,
        orderId: contextMenu.orderId
      });
      setColorDialog(true);
      handleCloseContextMenu();
    }
  };

  // セル色変更ダイアログを閉じる
  const handleCloseColorDialog = () => {
    setColorDialog(false);
    setSelectedCellForColor(null);
  };

  // セルの色を変更する
  const handleChangeColor = (color: string) => {
    if (selectedCellForColor) {
      const cellId = `${selectedCellForColor.assignmentId}-${selectedCellForColor.date}-${selectedCellForColor.orderId}`;
      setCustomCellColors({
        ...customCellColors,
        [cellId]: color
      });
      handleCloseColorDialog();
    }
  };

  // オーダー枠設定ダイアログを開く
  const handleOpenOrderFrameDialog = (assignment: AssignmentItem) => {
    setCurrentAssignment(assignment);
    setOrderFrameDialogOpen(true);
  };

  // オーダー枠設定ダイアログを閉じる
  const handleCloseOrderFrameDialog = () => {
    setOrderFrameDialogOpen(false);
  };

  // オーダー枠設定を保存
  const handleSaveOrderFrames = (updatedAssignment: AssignmentItem) => {
    if (onEdit) {
      onEdit(updatedAssignment);
    }
    handleCloseOrderFrameDialog();
  };

  // セル内の内容をレンダリングする関数
  const renderCellContent = (assignment: AssignmentItem, date: string, orderId: string, isAvailable: boolean, isOtherMonth: boolean) => {
    const dateObj = new Date(date);
    const isLocked = assignment.locks?.[orderId]?.[date] || false;
    
    // セルが利用可能かどうかを判断
    const cellAvailable = isCellAvailable(isAvailable, assignment.id, date, orderId, isOtherMonth, displayMode);
    
    // 割り当てられているスタッフを取得
    const staff = assignment.staff?.[orderId]?.[date];
    
    // ステータスを取得
    const status = assignment.statuses?.[orderId]?.[date];
    
    // メモを取得
    const memos = assignment.memos?.[orderId]?.[date];
    const hasMemos = memos && memos.length > 0;
    const memoCount = hasMemos ? memos.length : 0;
    
    const renderMemoIndicator = () => {
      if (!hasMemos) return null;
      
      const memoTooltipText = formatMemoText(memos);
      
      return (
        <Tooltip title={memoTooltipText} arrow placement="top">
          <MemoIndicator>
            {memoCount > 9 ? '9+' : memoCount}
          </MemoIndicator>
        </Tooltip>
      );
    };
    
    return (
      <CellContent>
        {isLocked && (
          <Box 
            sx={{ 
              position: 'absolute',
              top: '0',
              left: '0',
              right: '0',
              bottom: '0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 5,
              backgroundColor: 'rgba(255, 255, 255, 0.7)',
            }}
          >
            <LockIcon sx={{ fontSize: 20, color: 'rgba(0, 0, 0, 0.5)' }} />
          </Box>
        )}
        
        {renderMemoIndicator()}
        
        {status && (
          <Box position="relative" width="100%" height="100%" display="flex" alignItems="center" justifyContent="center">
            <StatusChip status={status}>
              {getStatusDisplay(status)}
              {hoveredCell === `${assignment.id}-${date}-${orderId}` && (
                <DeleteButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveStatus(assignment.id, date, orderId);
                  }}
                >
                  <ClearIcon />
                </DeleteButton>
              )}
            </StatusChip>
          </Box>
        )}
        
        {staff && !status && (
          <Draggable
            draggableId={`assigned-staff-${assignment.id}-${date}-${orderId}`}
            index={0}
            isDragDisabled={isLocked}
          >
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.draggableProps}
                {...provided.dragHandleProps}
                onClick={(e) => e.stopPropagation()} // セルのクリックイベントが発火しないようにする
                style={{
                  ...provided.draggableProps.style,
                  width: snapshot.isDragging ? '100px' : '100%', // ドラッグ中は横幅を100pxに制限
                  height: '100%',
                  maxWidth: snapshot.isDragging ? '100px' : 'none', // ドラッグ中は最大幅も制限
                  zIndex: snapshot.isDragging ? 9999 : 'auto' // ドラッグ中は最前面に表示
                }}
              >
                <StaffItem 
                  isGirl={staff.isGirl}
                  title={staff.name} // ツールチップ用
                  sx={{
                    ...(snapshot.isDragging && { 
                      width: '96px', // ドラッグ中は固定幅
                    })
                  }}
                >
                  {staff.name}
                  <DeleteButton
                    className="delete-button"
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      // スタッフ削除のロジックを実装
                      if (onEdit) {
                        const targetAssignment = assignments.find(a => a.id === assignment.id);
                        if (targetAssignment && targetAssignment.staff?.[orderId]?.[date]) {
                          // 深いコピーを作成
                          const updatedAssignment = JSON.parse(JSON.stringify(targetAssignment));
                          
                          // 該当するスタッフを削除
                          delete updatedAssignment.staff[orderId][date];
                          
                          // 更新を適用
                          onEdit(updatedAssignment);
                        }
                      }
                    }}
                  >
                    <ClearIcon />
                  </DeleteButton>
                </StaffItem>
              </div>
            )}
          </Draggable>
        )}
      </CellContent>
    );
  };
  
  return (
    <>
      <Paper>
        <StyledTableContainer>
          <Table stickyHeader aria-label="アサイン表">
            <TableHead>
              <TableRow>
                <HeaderCell>編集</HeaderCell>
                <HeaderCell>代理店</HeaderCell>
                <HeaderCell>{displayMode === 'series' ? '店舗名' : 'イベント実施場所'}</HeaderCell>
                <HeaderCell>オーダー</HeaderCell>
                {dates.map((date) => (
                  <HeaderCell key={date.date} align="center">
                    <Typography 
                      variant="body2" 
                      fontWeight="bold" 
                      sx={{ 
                        color: date.dayOfWeek === '土' ? '#1976d2' : 
                               date.dayOfWeek === '日' ? '#e91e63' : 
                               'inherit' 
                      }}
                    >
                      {date.dayOfWeek}
                    </Typography>
                    <Typography variant="body2">
                      {date.display}
                    </Typography>
                  </HeaderCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {assignments.filter(assignment => displayMode !== 'series' || assignment.seriesVenue).map((assignment) => (
                assignment.orders.map((order, orderIndex) => (
                  <TableRow key={`${assignment.id}-${order.id}`}>
                    {orderIndex === 0 && (
                      <>
                        <StyledTableCell 
                          rowSpan={assignment.orders.length} 
                          align="center"
                        >
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            <IconButton
                              size="small"
                              onClick={() => {
                                handleOpenOrderFrameDialog(assignment);
                              }}
                              title="曜日別オーダー枠設定"
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </StyledTableCell>
                        <AgencyCell rowSpan={assignment.orders.length}>
                          {assignment.agency}
                        </AgencyCell>
                        <VenueCell rowSpan={assignment.orders.length}>
                          <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 0.5,
                            pr: displayMode === 'series' && assignment.seriesFrames ? 8 : 0, // 帯案件モードで残数表示がある場合に右側にスペースを確保
                            position: 'relative',
                            width: '100%'
                          }}>
                            <Typography variant="body2" sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {displayMode === 'series' && assignment.seriesVenue ? assignment.seriesVenue : assignment.venue}
                            </Typography>
                            {assignment.hasTrip && (
                              <Tooltip title="出張あり">
                                <FlightIcon fontSize="small" sx={{ fontSize: '1rem', color: 'action.active' }} />
                              </Tooltip>
                            )}
                            {assignment.isOutdoor && (
                              <Tooltip title="屋外">
                                <LocationOnIcon fontSize="small" sx={{ fontSize: '1rem', color: 'action.active' }} />
                              </Tooltip>
                            )}
                            {displayMode === 'series' && renderSeriesFrames(assignment)}
                          </Box>
                        </VenueCell>
                      </>
                    )}
                    <OrderCell 
                      isGirl={order.isGirl}
                    >
                      {order.name}
                    </OrderCell>
                    {dates.map((date) => {
                      // 基本的な利用可能性を確認
                      const baseAvailable = assignment.availability[date.date] === true;
                      
                      // 他の月のフラグを取得
                      const isOtherMonth = date.isOtherMonth === true;
                      
                      // 背景色を決定（displayModeも渡す）
                      const bgColor = getCellBackgroundColor(assignment.id, date.date, order.id, baseAvailable, isOtherMonth, customCellColors, displayMode);
                      
                      // セルが実際に利用可能かどうかを判断（displayModeを渡す）
                      const isAvailable = isCellAvailable(baseAvailable, assignment.id, date.date, order.id, isOtherMonth, displayMode);
                      
                      // デバッグ用ログを追加（開発時のみ表示）
                      if (process.env.NODE_ENV !== 'production' && orderIndex === 0) {
                        console.log(`Assignment: ${assignment.id}, Date: ${date.date}, Available: ${isAvailable}, Color: ${bgColor}`);
                      }
                      
                      // セルのステータスを取得
                      const status = assignment.statuses?.[order.id]?.[date.date] || '';
                      
                      // セルのユニークID
                      const cellId = `cell-${assignment.id}-${date.date}-${order.id}`;
                      
                      // セルのロック状態を取得
                      const isLocked = assignment.locks?.[order.id]?.[date.date] || false;
                      
                      // セルのメモリストを取得
                      const memos = assignment.memos?.[order.id]?.[date.date] || [];
                      
                      return (
                        <Droppable
                          key={`drop-${assignment.id}-${date.date}-${order.id}`}
                          droppableId={getDroppableId(assignment.id, date.date, order.id)}
                          isDropDisabled={!(displayMode === 'series' || isAvailable) || isLocked || isOtherMonth}
                        >
                          {(provided, snapshot) => (
                            <DroppableCell
                              ref={provided.innerRef}
                              {...provided.droppableProps}
                              isAvailable={(displayMode === 'series' && !isOtherMonth) || (baseAvailable && !isOtherMonth)}
                              isGirl={order.isGirl}
                              className={snapshot.isDraggingOver ? 'dragOver' : ''}
                              sx={{ 
                                backgroundColor: bgColor,
                                cursor: (displayMode === 'series' || isAvailable) && !isLocked && !isOtherMonth ? 'default' : 'not-allowed'
                              }}
                              onMouseEnter={() => setHoveredCell(cellId)}
                              onMouseLeave={() => setHoveredCell(null)}
                              onClick={(e) => handleCellClick(e, assignment.id, date.date, order.id)}
                              onDoubleClick={(e) => handleCellDoubleClick(e, assignment.id, date.date, order.id)}
                              onContextMenu={(e) => handleContextMenu(e, assignment.id, date.date, order.id)}
                            >
                              {renderCellContent(assignment, date.date, order.id, displayMode === 'series' ? true : baseAvailable, isOtherMonth)}
                              <div style={{ display: 'none' }}>{provided.placeholder}</div>
                            </DroppableCell>
                          )}
                        </Droppable>
                      );
                    })}
                  </TableRow>
                ))
              ))}
            </TableBody>
          </Table>
        </StyledTableContainer>
      </Paper>

      {/* メモポップアップ */}
      <Popover
        open={isMemoOpen}
        anchorReference="anchorPosition"
        anchorPosition={
          memoPopupPosition !== null
            ? { top: memoPopupPosition.top, left: memoPopupPosition.left }
            : undefined
        }
        onClose={handleCloseMemoPopup}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        PaperProps={{
          sx: {
            p: 2,
            width: 300,
            maxHeight: 400,
            display: 'flex',
            flexDirection: 'column'
          }
        }}
      >
        {/* メモスレッド表示 */}
        {currentMemoCell && (
          <Box sx={{ mb: 2, overflowY: 'auto', maxHeight: 200 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              メモ履歴
            </Typography>
            {assignments
              .find(a => a.id === currentMemoCell.assignmentId)
              ?.memos?.[currentMemoCell.orderId]?.[currentMemoCell.date]
              ?.map((memo, index) => (
                <Box key={memo.id} sx={{ mb: 1, pb: 1, borderBottom: index !== (assignments.find(a => a.id === currentMemoCell?.assignmentId)?.memos?.[currentMemoCell.orderId]?.[currentMemoCell.date]?.length || 0) - 1 ? '1px solid #eee' : 'none' }}>
                  <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary' }}>
                    {memo.user} | {new Date(memo.timestamp).toLocaleString('ja-JP')}
                  </Typography>
                  <Typography variant="body2">
                    {memo.text}
                  </Typography>
                </Box>
              )) || (
                <Typography variant="body2" color="text.secondary">
                  メモはありません
                </Typography>
              )}
          </Box>
        )}
        
        {/* メモ入力欄 */}
        <TextField
          label="メモを入力"
          multiline
          rows={3}
          variant="outlined"
          fullWidth
          value={memoText}
          onChange={(e) => setMemoText(e.target.value)}
          onKeyDown={(e) => handleMemoKeyDown(e, handleSendMemo)}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton 
                  onClick={handleSendMemo}
                  edge="end"
                  disabled={!memoText.trim()}
                >
                  <SendIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Popover>

      {/* 編集ダイアログ */}
      <Dialog 
        open={editDialogOpen} 
        onClose={handleCloseEditDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>イベント情報編集</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              autoFocus
              label="代理店"
              type="text"
              fullWidth
              variant="outlined"
              value={editedAgency}
              onChange={(e) => setEditedAgency(e.target.value)}
              size="small"
            />
            <TextField
              label="イベント実施場所"
              type="text"
              fullWidth
              variant="outlined"
              value={editedVenue}
              onChange={(e) => setEditedVenue(e.target.value)}
              size="small"
            />
            <TextField
              label="詳細情報"
              type="text"
              fullWidth
              variant="outlined"
              value={editedVenueDetail}
              onChange={(e) => setEditedVenueDetail(e.target.value)}
              size="small"
            />
            <Box sx={{ display: 'flex', gap: 3, mt: 1 }}>
              <FormControlLabel 
                control={
                  <Checkbox 
                    checked={editedHasTrip} 
                    onChange={(e) => setEditedHasTrip(e.target.checked)} 
                    color="primary"
                  />
                } 
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <FlightIcon 
                      color="primary" 
                      fontSize="small" 
                      sx={{ mr: 0.5 }}
                    />
                    <Typography variant="body2">出張あり</Typography>
                  </Box>
                }
              />
              <FormControlLabel 
                control={
                  <Checkbox 
                    checked={editedIsOutdoor} 
                    onChange={(e) => setEditedIsOutdoor(e.target.checked)} 
                    color="error"
                  />
                } 
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <LocationOnIcon 
                      color="error" 
                      fontSize="small" 
                      sx={{ mr: 0.5 }}
                    />
                    <Typography variant="body2">外現場</Typography>
                  </Box>
                }
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditDialog}>キャンセル</Button>
          <Button onClick={handleSaveEdit} variant="contained" color="primary">
            保存
          </Button>
        </DialogActions>
      </Dialog>

      {/* 右クリックメニュー */}
      <Menu
        open={contextMenu !== null}
        onClose={handleCloseContextMenu}
        anchorReference="anchorPosition"
        anchorPosition={
          contextMenu !== null
            ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
            : undefined
        }
      >
        <MenuItem onClick={() => {
          if (contextMenu) {
            const assignment = assignments.find(a => a.id === contextMenu.assignmentId);
            if (assignment) {
              handleOpenEditDialog(assignment);
              handleCloseContextMenu();
            }
          }
        }}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>イベント情報編集</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleOpenHistory}>
          <ListItemIcon>
            <HistoryIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>編集履歴</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleOpenColorDialog}>
          <ListItemIcon>
            <ColorLensIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>セル色変更</ListItemText>
        </MenuItem>
      </Menu>
      
      {/* 編集履歴ダイアログ */}
      <Dialog
        open={historyDialog}
        onClose={handleCloseHistoryDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>編集履歴</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {selectedCellForHistory && 
              `${dates.find(d => d.date === selectedCellForHistory.date)?.display || selectedCellForHistory.date} / 
              ${assignments.find(a => a.id === selectedCellForHistory.assignmentId)?.orders.find(o => o.id === selectedCellForHistory.orderId)?.name || '不明'}`
            }
          </Typography>
          <List>
            <ListItem>
              <ListItemAvatar>
                <Avatar>
                  <AccountCircleIcon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText 
                primary="田中 太郎" 
                secondary="2023/11/01 14:30 - ステータスを「不在」に変更" 
              />
            </ListItem>
            <Divider variant="inset" component="li" />
            <ListItem>
              <ListItemAvatar>
                <Avatar>
                  <AccountCircleIcon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText 
                primary="山田 花子" 
                secondary="2023/11/01 10:15 - メモを追加: 「当日までに調整」" 
              />
            </ListItem>
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseHistoryDialog}>閉じる</Button>
        </DialogActions>
      </Dialog>
      
      {/* セル色変更ダイアログ */}
      <Dialog
        open={colorDialog}
        onClose={handleCloseColorDialog}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>セル色変更</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {selectedCellForColor && 
              `${dates.find(d => d.date === selectedCellForColor.date)?.display || selectedCellForColor.date} / 
              ${assignments.find(a => a.id === selectedCellForColor.assignmentId)?.orders.find(o => o.id === selectedCellForColor.orderId)?.name || '不明'}`
            }
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
            {['#ffffff', '#f5f5f5', '#e3f2fd', '#e8f5e9', '#fff3e0', '#ffebee', '#f3e5f5'].map((color) => (
              <Box
                key={color}
                sx={{
                  width: 40,
                  height: 40,
                  backgroundColor: color,
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  '&:hover': {
                    boxShadow: '0 0 0 2px rgba(25, 118, 210, 0.5)',
                  },
                }}
                onClick={() => handleChangeColor(color)}
              />
            ))}
          </Box>
          <Button 
            variant="outlined" 
            fullWidth 
            sx={{ mt: 2 }}
            onClick={() => {
              if (selectedCellForColor) {
                const cellId = `${selectedCellForColor.assignmentId}-${selectedCellForColor.date}-${selectedCellForColor.orderId}`;
                const newColors = {...customCellColors};
                delete newColors[cellId];
                setCustomCellColors(newColors);
                handleCloseColorDialog();
              }
            }}
          >
            デフォルトに戻す
          </Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseColorDialog}>キャンセル</Button>
        </DialogActions>
      </Dialog>

      {/* オーダー枠設定ダイアログ */}
      <OrderFrameDialog
        open={orderFrameDialogOpen}
        assignment={currentAssignment}
        onClose={handleCloseOrderFrameDialog}
        onSave={handleSaveOrderFrames}
      />
    </>
  );
} 