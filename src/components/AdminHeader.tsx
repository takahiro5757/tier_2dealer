'use client';

import { 
  Box, AppBar, Toolbar, Button, Typography, Avatar, Menu, MenuItem, 
  IconButton, Divider, ListItemIcon, ListItemText, Dialog, DialogTitle, 
  DialogContent, DialogActions, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Chip, Paper, Badge
} from '@mui/material';
import { 
  Settings as SettingsIcon, 
  Logout as LogoutIcon, 
  FileDownload as ExcelIcon,
  Event as EventIcon,
  History as HistoryIcon,
  Group as GroupIcon,
  Visibility,
  Notifications as NotificationsIcon
} from '@mui/icons-material';
import { useRouter, usePathname } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';

interface AdminHeaderProps {
  onExcelExport?: () => void;
}

// 変更依頼履歴の型定義（管理ページと同じ）
interface ChangeRequestHistory {
  id: string;
  requestDate: string; // ISO文字列
  targetYear: number;
  targetMonth: number;
  staffChanges: Array<{
    staffId: string;
    staffName: string;
    changes: Array<{
      date: string;
      field: 'status' | 'requestText' | 'totalRequest' | 'weekendRequest';
      oldValue: string;
      newValue: string;
    }>;
  }>;
  status: 'pending' | 'approved' | 'rejected';
  totalChanges: number;
  reason?: string; // 変更理由
  approverComment?: string; // 承認者コメント
}

// 旧型定義（後方互換性のため残す）




// ローカルストレージから履歴を取得するユーティリティ関数
const CHANGE_REQUEST_STORAGE_KEY = 'tier2dealer_change_requests';

const getChangeRequestsFromStorage = (): ChangeRequestHistory[] => {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(CHANGE_REQUEST_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('[AdminHeader] 履歴取得エラー:', error);
    return [];
  }
};

export default function AdminHeader({ onExcelExport }: AdminHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  
  // 設定メニューの状態管理
  const [settingsMenuOpen, setSettingsMenuOpen] = useState(false);
  const settingsAnchorRef = useRef<HTMLButtonElement>(null);

  // 履歴ポップアップの状態管理
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<ChangeRequestHistory | null>(null);
  
  // 実際の履歴データ（ローカルストレージから取得）
  const [changeRequests, setChangeRequests] = useState<ChangeRequestHistory[]>([]);
  
  // コンポーネントマウント時に履歴を読み込み
  useEffect(() => {
    const loadChangeRequests = () => {
      const requests = getChangeRequestsFromStorage();
      setChangeRequests(requests);
      console.log('[AdminHeader] 履歴読み込み完了:', requests.length, '件');
    };
    
    loadChangeRequests();
    
    // 定期的に履歴を更新（他の画面で追加された場合）
    const interval = setInterval(loadChangeRequests, 5000);
    
    return () => clearInterval(interval);
  }, []);

  // 設定メニューの表示/非表示を切り替える
  const handleSettingsMenuToggle = () => {
    setSettingsMenuOpen(!settingsMenuOpen);
  };

  // 設定メニューを閉じる
  const handleSettingsMenuClose = () => {
    setSettingsMenuOpen(false);
  };

  // ログアウト処理
  const handleLogout = () => {
    localStorage.removeItem('admin_logged_in');
    localStorage.removeItem('admin_id');
    router.push('/tier-2dealer/admin/login');
    handleSettingsMenuClose();
  };

  // エクセルエクスポート処理
  const handleExcelExport = () => {
    if (onExcelExport) {
      onExcelExport();
    }
    handleSettingsMenuClose();
  };

  // 履歴ダイアログの処理
  const handleHistoryOpen = () => {
    setHistoryDialogOpen(true);
  };

  const handleHistoryClose = () => {
    setHistoryDialogOpen(false);
  };

  const handleViewDetailNew = (request: ChangeRequestHistory) => {
    setSelectedRequest(request);
    setDetailDialogOpen(true);
  };

  const handleDetailClose = () => {
    setSelectedRequest(null);
    setDetailDialogOpen(false);
  };

  // 日付フォーマット関数
  const formatDateForDisplay = (dateStr: string) => {
    if (!dateStr) return '-';
    const [year, month, day] = dateStr.split('-');
    return `${year}年${month}月${day}日`;
  };

  // ステータス関連のヘルパー関数
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'success';
      case 'rejected': return 'error';
      case 'pending': return 'warning';
      default: return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'approved': return '承認済み';
      case 'rejected': return '却下';
      case 'pending': return '承認待ち';
      default: return '不明';
    }
  };

  // 共通のボタンスタイル
  const buttonStyle = {
    color: 'white',
    fontSize: '0.9rem',
    px: 2,
    minWidth: '120px',
    height: '40px',
    '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.2)' }
  };

  return (
    <Box>
      <AppBar position="static" sx={{ bgcolor: '#1976d2' }}>
        <Toolbar sx={{ minHeight: '56px', px: 2 }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1, 
            width: '100%'
          }}>
            {/* ナビゲーションメニュー */}
            <Button
              startIcon={<EventIcon />}
              sx={{
                ...buttonStyle,
                bgcolor: pathname === '/tier-2dealer/admin/shifts' ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
              }}
              onClick={() => router.push('/tier-2dealer/admin/shifts')}
            >
              シフト管理
            </Button>
            

            
            <Button
              startIcon={<GroupIcon />}
              sx={{
                ...buttonStyle,
                bgcolor: pathname === '/tier-2dealer/admin/staff' ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
              }}
              onClick={() => router.push('/tier-2dealer/admin/staff')}
            >
              スタッフ管理
            </Button>

            {/* 右側のエリア */}
            <Box sx={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ width: 32, height: 32 }} />
              <Typography sx={{ fontSize: '0.9rem', color: 'white' }}>
                管理者
              </Typography>
              
              {/* 履歴アイコン */}
              <IconButton
                onClick={handleHistoryOpen}
                sx={{ color: 'white' }}
                title="変更依頼履歴"
              >
                <HistoryIcon />
              </IconButton>
              
              {/* 設定メニュー */}
              <IconButton
                ref={settingsAnchorRef}
                onClick={handleSettingsMenuToggle}
                sx={{ color: 'white' }}
              >
                <SettingsIcon />
              </IconButton>
              
              <Menu
                anchorEl={settingsAnchorRef.current}
                open={settingsMenuOpen}
                onClose={handleSettingsMenuClose}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
              >
                <MenuItem onClick={handleExcelExport}>
                  <ListItemIcon>
                    <ExcelIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>エクセルエクスポート</ListItemText>
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleLogout}>
                  <ListItemIcon>
                    <LogoutIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>ログアウト</ListItemText>
                </MenuItem>
              </Menu>
            </Box>
          </Box>
        </Toolbar>
      </AppBar>

      {/* 履歴ダイアログ */}
      <Dialog open={historyDialogOpen} onClose={handleHistoryClose} maxWidth="lg" fullWidth>
        <DialogTitle>変更依頼履歴</DialogTitle>
        <DialogContent>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>依頼ID</TableCell>
                  <TableCell>対象スタッフ</TableCell>
                  <TableCell>対象月</TableCell>
                  <TableCell>依頼日時</TableCell>
                  <TableCell>ステータス</TableCell>
                  <TableCell>変更件数</TableCell>
                  <TableCell>操作</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {changeRequests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      変更依頼履歴がありません
                    </TableCell>
                  </TableRow>
                ) : (
                  changeRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell>{request.id}</TableCell>
                      <TableCell>
                        {request.staffChanges.map(staff => staff.staffName).join(', ')}
                        {request.staffChanges.length > 2 && '...'}
                      </TableCell>
                      <TableCell>{request.targetYear}年{request.targetMonth}月</TableCell>
                      <TableCell>
                        {new Date(request.requestDate).toLocaleDateString('ja-JP')} {new Date(request.requestDate).toLocaleTimeString('ja-JP')}
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={getStatusLabel(request.status)} 
                          color={getStatusColor(request.status) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{request.totalChanges}件</TableCell>
                      <TableCell>
                        <Button
                          size="small"
                          startIcon={<Visibility />}
                          onClick={() => handleViewDetailNew(request)}
                        >
                          詳細
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleHistoryClose}>閉じる</Button>
        </DialogActions>
      </Dialog>

      {/* 詳細ダイアログ */}
      <Dialog open={detailDialogOpen} onClose={handleDetailClose} maxWidth="md" fullWidth>
        <DialogTitle>変更依頼詳細</DialogTitle>
        <DialogContent>
          {selectedRequest && (
            <Box>
              <Typography variant="h6" gutterBottom>
                基本情報
              </Typography>
              <Box sx={{ mb: 3 }}>
                <Typography><strong>依頼ID:</strong> {selectedRequest.id}</Typography>
                <Typography><strong>対象月:</strong> {selectedRequest.targetYear}年{selectedRequest.targetMonth}月</Typography>
                <Typography><strong>対象スタッフ:</strong> {selectedRequest.staffChanges.length}名</Typography>
                <Typography><strong>総変更件数:</strong> {selectedRequest.totalChanges}件</Typography>
                <Typography><strong>依頼日時:</strong> {new Date(selectedRequest.requestDate).toLocaleString('ja-JP')}</Typography>
                {selectedRequest.reason && (
                  <Typography><strong>変更理由:</strong> {selectedRequest.reason}</Typography>
                )}
                <Typography>
                  <strong>ステータス:</strong> 
                  <Chip 
                    label={getStatusLabel(selectedRequest.status)} 
                    color={getStatusColor(selectedRequest.status) as any}
                    size="small"
                    sx={{ ml: 1 }}
                  />
                </Typography>
                {/* 承認済みの場合は承認者コメントを表示 */}
                {selectedRequest.status === 'approved' && selectedRequest.approverComment && (
                  <Typography sx={{ mt: 1, color: 'primary.main' }}>
                    <strong>承認者コメント:</strong> {selectedRequest.approverComment}
                  </Typography>
                )}
              </Box>

              <Typography variant="h6" gutterBottom>
                スタッフ別変更内容
              </Typography>
              {selectedRequest.staffChanges.map((staffChange, staffIndex) => (
                <Box key={staffChange.staffId} sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                    {staffChange.staffName}
                  </Typography>
                  <TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>項目</TableCell>
                          <TableCell>日付</TableCell>
                          <TableCell>変更前</TableCell>
                          <TableCell>変更後</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {staffChange.changes.map((change, changeIndex) => {
                          const getFieldLabel = (field: string) => {
                            switch (field) {
                              case 'status': return 'シフト希望';
                              case 'requestText': return '要望テキスト';
                              case 'totalRequest': return '平日希望数';
                              case 'weekendRequest': return '土日希望数';
                              default: return field;
                            }
                          };
                          
                          return (
                            <TableRow key={changeIndex}>
                              <TableCell>{getFieldLabel(change.field)}</TableCell>
                              <TableCell>
                                {formatDateForDisplay(change.date)}
                              </TableCell>
                              <TableCell>{change.oldValue || '-'}</TableCell>
                              <TableCell>{change.newValue || '-'}</TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDetailClose}>閉じる</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 