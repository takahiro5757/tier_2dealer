'use client';

import { 
  Box, AppBar, Toolbar, Button, Typography, Avatar, Menu, MenuItem, 
  IconButton, Divider, ListItemIcon, ListItemText, Dialog, DialogTitle, 
  DialogContent, DialogActions, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Chip, Paper
} from '@mui/material';
import { 
  Settings as SettingsIcon, 
  Logout as LogoutIcon, 
  FileDownload as ExcelIcon,
  Event as EventIcon,
  History as HistoryIcon,
  Group as GroupIcon,
  Visibility,
  Comment as CommentIcon
} from '@mui/icons-material';
import { useRouter, usePathname } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';

interface AdminHeaderProps {
  onExcelExport?: () => void;
}

// コメント履歴の型定義
interface CommentHistory {
  id: string;
  timestamp: string; // ISO文字列
  author: string; // 承認者名
  comment: string;
  action?: 'approved' | 'rejected' | 'partial' | 'note'; // アクション種別
}

// 変更依頼履歴の型定義
interface ChangeRequestHistory {
  id: string;
  month: string;
  submittedAt: string;
  reason: string;
  status: 'pending' | 'approved' | 'mixed' | 'rejected' | 'answered';
  staffChanges: Array<{
    staffId: string;
    staffName: string;
    status?: 'pending' | 'approved' | 'rejected';
    approvedAt?: string;
    changes: Array<{
      field: 'status' | 'request';
      oldValue: string;
      newValue: string;
      date?: string;
      type: 'shift' | 'request';
    }>;
  }>;
  approverComment?: string;
  approvedCount: number;
  rejectedCount: number;
  pendingCount: number;
  commentHistory?: CommentHistory[];
}

// 変更依頼履歴を取得する関数（LocalStorageから）
const getChangeRequestHistory = (): ChangeRequestHistory[] => {
  if (typeof window === 'undefined') {
    return [];
  }
  
  try {
    const stored = localStorage.getItem('changeRequestHistory');
    if (stored) {
      const parsed = JSON.parse(stored);
      console.log('[AdminHeader] 変更依頼履歴を取得:', parsed);
      return parsed;
    }
    console.log('[AdminHeader] 変更依頼履歴が見つかりません');
    return [];
  } catch (error) {
    console.error('[AdminHeader] 変更依頼履歴の取得エラー:', error);
    return [];
  }
};

export default function AdminHeader({ onExcelExport }: AdminHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  
  // 設定メニューの状態管理
  const [settingsMenuOpen, setSettingsMenuOpen] = useState(false);
  const settingsAnchorRef = useRef<HTMLButtonElement>(null);

  // 履歴ダイアログの状態管理
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<ChangeRequestHistory | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);



  // 変更依頼履歴のダミーデータ
  const [changeRequests] = useState<ChangeRequestHistory[]>([
    {
      id: 'FESTAL-20250805-142012',
      month: '2025年4月',
      submittedAt: '2025/8/5 14:20:12',
      reason: '従業員の家庭事情による勤務時間調整',
      status: 'answered',
      staffChanges: [
        {
          staffId: 'staff001',
          staffName: '井上雅美',
          status: 'approved',
          approvedAt: '2025-8-5 14:35:12',
          changes: [
            { field: 'request', oldValue: '6', newValue: '4', date: '', type: 'request' }
          ]
        },
        {
          staffId: 'staff002', 
          staffName: '渡辺健一',
          status: 'approved',
          approvedAt: '2025-8-5 14:40:12',
          changes: [
            { field: 'status', oldValue: '×', newValue: '○', date: '2025-04-25', type: 'shift' }
          ]
        }
      ],
      approverComment: '店舗の運営状況を考慮し、承認可能です。',
      approvedCount: 2,
      rejectedCount: 0,
      pendingCount: 0,
      commentHistory: [
        {
          id: 'comment1',
          timestamp: '2025-08-05T14:40:12.000Z',
          author: '店長 田中',
          comment: '店舗の運営状況を考慮し、承認可能です。',
          action: 'approved'
        }
      ]
    },
    {
      id: 'FESTAL-20250728-101530',
      month: '2025年3月',
      submittedAt: '2025/7/28 10:15:30',
      reason: 'スタッフの体調不良による緊急調整',
      status: 'answered',
      staffChanges: [
        {
          staffId: 'staff003',
          staffName: '田中花子',
          status: 'rejected',
          approvedAt: '2025-7-28 11:00:20',
          changes: [
            { field: 'status', oldValue: '○', newValue: '×', date: '2025-03-15', type: 'shift' },
            { field: 'request', oldValue: '8', newValue: '5', date: '', type: 'request' }
          ]
        }
      ],
      approverComment: '人員配置上、この変更は承認できません。',
      approvedCount: 0,
      rejectedCount: 1,
      pendingCount: 0,
      commentHistory: [
        {
          id: 'comment2',
          timestamp: '2025-07-28T11:00:20.000Z',
          author: '店長 田中',
          comment: '人員配置上、この変更は承認できません。',
          action: 'rejected'
        }
      ]
    },
    {
      id: 'FESTAL-20250801-154522',
      month: '2025年6月',
      submittedAt: '2025/8/1 15:45:22',
      reason: '複数スタッフの希望調整',
      status: 'answered',
      staffChanges: [
        {
          staffId: 'staff004',
          staffName: '佐藤太郎',
          status: 'approved',
          approvedAt: '2025-8-1 16:10:15',
          changes: [
            { field: 'request', oldValue: '12', newValue: '15', date: '', type: 'request' }
          ]
        },
        {
          staffId: 'staff005',
          staffName: '山田次郎',
          status: 'rejected',
          approvedAt: '2025-8-1 16:15:30',
          changes: [
            { field: 'status', oldValue: '△', newValue: '○', date: '2025-06-20', type: 'shift' }
          ]
        }
      ],
      approverComment: '一部承認・一部却下となります。',
      approvedCount: 1,
      rejectedCount: 1,
      pendingCount: 0,
      commentHistory: [
        {
          id: 'comment3',
          timestamp: '2025-08-01T16:15:30.000Z',
          author: '店長 田中',
          comment: '一部承認・一部却下となります。',
          action: 'partial'
        }
      ]
    },
    {
      id: 'FESTAL-20250810-091530',
      month: '2025年8月',
      submittedAt: '2025/8/10 09:15:30',
      reason: '急遽の人員調整による変更依頼',
      status: 'pending',
      staffChanges: [
        {
          staffId: 'staff006',
          staffName: '中村雅人',
          status: 'pending',
          changes: [
            { field: 'status', oldValue: '○', newValue: '×', date: '2025-08-15', type: 'shift' },
            { field: 'request', oldValue: '10', newValue: '12', date: '', type: 'request' }
          ]
        },
        {
          staffId: 'staff007',
          staffName: '小林優子',
          status: 'pending',
          changes: [
            { field: 'status', oldValue: '△', newValue: '○', date: '2025-08-20', type: 'shift' }
          ]
        },
        {
          staffId: 'staff008',
          staffName: '松本健司',
          status: 'pending',
          changes: [
            { field: 'request', oldValue: '8', newValue: '6', date: '', type: 'request' }
          ]
        }
      ],
      approvedCount: 0,
      rejectedCount: 0,
      pendingCount: 3,
      commentHistory: []
    }
  ]);

  const handleSettingsMenuToggle = () => {
    setSettingsMenuOpen(!settingsMenuOpen);
  };

  const handleSettingsMenuClose = () => {
    setSettingsMenuOpen(false);
  };

  const handleExcelExport = () => {
    handleSettingsMenuClose();
    if (onExcelExport) {
      onExcelExport();
    }
  };

  const handleLogout = () => {
    router.push('/tier-2dealer/admin/login');
  };

  const handleHistoryOpen = () => {
    setHistoryDialogOpen(true);
  };

  const handleHistoryClose = () => {
    setHistoryDialogOpen(false);
  };

  const handleDetailOpen = (request: ChangeRequestHistory) => {
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
    return `${month}月${day}日`;
  };

  // ステータス関連のヘルパー関数
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'approved': return 'success';
      case 'mixed': return 'info';
      case 'rejected': return 'error';
      case 'answered': return 'success';
      default: return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return '承認待ち';
      case 'approved': return '承認済み';
      case 'mixed': return '部分承認';
      case 'rejected': return '却下';
      case 'answered': return '回答済み';
      default: return status;
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
                bgcolor: pathname === '/tier-2dealer/admin/shifts' ? 'rgba(255, 255, 255, 0.15)' : 'transparent'
              }}
              onClick={() => router.push('/tier-2dealer/admin/shifts')}
            >
              シフト管理
            </Button>
            
            <Button
              startIcon={<GroupIcon />}
              sx={{
                ...buttonStyle,
                bgcolor: pathname === '/tier-2dealer/admin/staff' ? 'rgba(255, 255, 255, 0.15)' : 'transparent'
              }}
              onClick={() => router.push('/tier-2dealer/admin/staff')}
            >
              スタッフ管理
            </Button>

            {/* 中央スペーサー */}
            <Box sx={{ flexGrow: 1 }} />
            
            {/* 右側メニュー */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              
              {/* 履歴アイコン */}
              <IconButton
                onClick={handleHistoryOpen}
                sx={{ color: 'white' }}
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
          {changeRequests.length === 0 ? (
            <Typography>変更依頼履歴がありません</Typography>
          ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>依頼ID</TableCell>
                  <TableCell>対象スタッフ</TableCell>
                  <TableCell>対象月</TableCell>
                  <TableCell>提出日時</TableCell>
                  <TableCell>ステータス</TableCell>
                  <TableCell>変更件数</TableCell>
                  <TableCell>アクション</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                  {changeRequests.map((request) => {
                    // 対象スタッフ名を取得（3名以上は省略表示）
                    const getTargetStaff = () => {
                      if (!request.staffChanges || request.staffChanges.length === 0) return '-';
                      const staffNames = request.staffChanges.map(sc => sc.staffName);
                      if (staffNames.length <= 2) {
                        return staffNames.join('、');
                      } else {
                        return `${staffNames.slice(0, 2).join('、')}...`;
                      }
                    };

                    // 変更件数を計算
                    const getTotalChanges = () => {
                      if (!request.staffChanges) return 0;
                      return request.staffChanges.reduce((total, sc) => 
                        total + (sc.changes ? sc.changes.length : 0), 0
                      );
                    };

                    return (
                      <TableRow key={request.id}>
                        <TableCell>{request.id}</TableCell>
                        <TableCell>{getTargetStaff()}</TableCell>
                        <TableCell>{request.month}</TableCell>
                        <TableCell>{request.submittedAt}</TableCell>
                        <TableCell>
                          <Chip 
                            label={getStatusLabel(request.status)} 
                            color={getStatusColor(request.status) as any}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{getTotalChanges()}件</TableCell>
                        <TableCell>
                          <Button
                            startIcon={<Visibility />}
                            onClick={() => handleDetailOpen(request)}
                            size="small"
                          >
                            詳細
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          </TableContainer>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleHistoryClose}>閉じる</Button>
        </DialogActions>
      </Dialog>

      {/* 変更依頼詳細ダイアログ */}
      <Dialog open={detailDialogOpen} onClose={handleDetailClose} maxWidth="md" fullWidth>
        <DialogTitle>変更依頼詳細</DialogTitle>
        <DialogContent>
          {selectedRequest && (
            <>
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>基本情報</Typography>
                <Typography><strong>依頼ID:</strong> {selectedRequest.id}</Typography>
                <Typography><strong>対象月:</strong> {selectedRequest.month}</Typography>
                <Typography><strong>提出日時:</strong> {selectedRequest.submittedAt}</Typography>
                  <Typography><strong>変更理由:</strong> {selectedRequest.reason}</Typography>
                <Typography sx={{ mt: 1 }}>
                  <strong>ステータス:</strong> 
                  <Chip 
                    label={getStatusLabel(selectedRequest.status)} 
                    color={getStatusColor(selectedRequest.status) as any}
                    size="small"
                    sx={{ ml: 1 }}
                  />
                </Typography>
                
                {/* 承認者コメントを表示（承認済み・部分承認・却下の場合） */}
                {(selectedRequest.status === 'approved' || selectedRequest.status === 'mixed' || selectedRequest.status === 'rejected') && selectedRequest.approverComment && (
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
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                    {staffChange.staffName}
                  </Typography>
                    {staffChange.status && (
                      <Chip
                        label={getStatusLabel(staffChange.status)}
                        color={getStatusColor(staffChange.status) as any}
                        size="small"
                      />
                    )}
                  </Box>
                  <Box sx={{ ml: 2 }}>
                        {staffChange.changes.map((change, changeIndex) => {
                          const getFieldLabel = (field: string) => {
                            switch (field) {
                              case 'status': return 'シフト希望';
                          case 'request': return '要望';
                              default: return field;
                            }
                          };
                      
                      const formatChange = () => {
                        if (change.field === 'status') {
                          // シフト変更の場合：日付付き
                          return `${formatDateForDisplay(change.date || '')}: ${change.oldValue || '-'} → ${change.newValue || '-'} (${getFieldLabel(change.field)})`;
                        } else {
                          // 要望変更の場合：日付なし
                          return `${change.oldValue || '-'} → ${change.newValue || '-'} (${getFieldLabel(change.field)})`;
                        }
                      };
                          
                          return (
                        <Typography 
                          key={changeIndex} 
                          variant="body2" 
                          sx={{ 
                            mb: 0.5,
                            fontSize: '0.9rem'
                          }}
                        >
                          {formatChange()}
                        </Typography>
                          );
                        })}
                  </Box>
                  {/* スタッフ単位の処理日時表示 */}
                  {staffChange.approvedAt && (
                    <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
                      処理日時: {new Date(staffChange.approvedAt).toLocaleString('ja-JP')}
                    </Typography>
                  )}
                </Box>
              ))}

              {/* コメント履歴セクション */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CommentIcon sx={{ fontSize: '1.25rem' }} />
                  コメント履歴
                </Typography>
                <Box sx={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid #e0e0e0', borderRadius: 1, p: 2 }}>
                  {selectedRequest.commentHistory && selectedRequest.commentHistory.length > 0 ? (
                    selectedRequest.commentHistory.map((comment, index) => (
                      <Box 
                        key={comment.id} 
                        sx={{ 
                          mb: index < selectedRequest.commentHistory!.length - 1 ? 2 : 0,
                          pb: index < selectedRequest.commentHistory!.length - 1 ? 2 : 0,
                          borderBottom: index < selectedRequest.commentHistory!.length - 1 ? '1px solid #f0f0f0' : 'none'
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                            {comment.author}
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary', ml: 'auto' }}>
                            {new Date(comment.timestamp).toLocaleString('ja-JP', {
                              year: 'numeric',
                              month: '2-digit',
                              day: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </Typography>
                        </Box>
                        <Typography variant="body2" sx={{ color: 'text.primary', pl: 0 }}>
                          {comment.comment}
                        </Typography>
                      </Box>
                    ))
                  ) : (
                    <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center', py: 2 }}>
                      コメントはありません
                    </Typography>
                  )}
                </Box>
            </Box>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDetailClose}>閉じる</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 