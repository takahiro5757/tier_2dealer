'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Box, Badge, IconButton, Drawer, Typography, List, ListItem, ListItemText,
  ListItemSecondaryAction, Button, Dialog, DialogTitle, DialogContent, 
  DialogActions, Alert, Chip, Stack, Divider, Card, CardContent,
  FormControl, InputLabel, Select, MenuItem, TextField
} from '@mui/material';
import { 
  Notifications, Close, CheckCircle, Cancel, Assignment, 
  Schedule, Person, Compare
} from '@mui/icons-material';

export interface ChangeRequest {
  id: string;
  staffId: string;
  staffName: string;
  year: string;
  month: string;
  reason: string;
  requestTime: Date;
  status: 'pending' | 'approved' | 'rejected';
  changes: {
    date: string;
    oldStatus: string;
    newStatus: string;
    oldLocation?: string;
    newLocation?: string;
  }[];
  rejectionReason?: string;
}

export interface NotificationItem {
  id: string;
  type: 'shift_submission' | 'change_request' | 'approval' | 'rejection';
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  changeRequest?: ChangeRequest;
  staffId?: string;
  staffName?: string;
  companyName?: string;
  targetAudience?: 'ansteype' | 'festal';
}

interface NotificationSystemProps {
  notifications: NotificationItem[];
  onMarkAsRead: (id: string) => void;
  onApproveChange: (requestId: string, comment?: string) => void;
  onRejectChange: (requestId: string, reason: string) => void;
  onClearAll: () => void;
  isAdminMode?: boolean;
  open?: boolean;
  onClose?: () => void;
  hideIcon?: boolean;
}

export default function NotificationSystem({
  notifications,
  onMarkAsRead,
  onApproveChange,
  onRejectChange,
  onClearAll,
  isAdminMode = false,
  open,
  onClose,
  hideIcon = false
}: NotificationSystemProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  
  // 親コンポーネントからopenプロパティが渡された場合はそれを優先
  const isDrawerOpen = open !== undefined ? open : drawerOpen;
  const [selectedNotification, setSelectedNotification] = useState<NotificationItem | null>(null);
  const [detailDialog, setDetailDialog] = useState(false);
  const [approvalDialog, setApprovalDialog] = useState(false);
  const [rejectionDialog, setRejectionDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [approvalComment, setApprovalComment] = useState('');
  const [isClient, setIsClient] = useState(false);

  // クライアントサイドでの初期化
  useEffect(() => {
    setIsClient(true);
  }, []);

  // 既存の通知データを使用

  // 現在のユーザーの所属を判定（useMemoで最適化）
  const getCurrentUserCompany = useMemo(() => {
    const userId = typeof window !== 'undefined' ? localStorage.getItem('user_id') : null;
    const isAdmin = typeof window !== 'undefined' ? localStorage.getItem('admin_logged_in') : null;
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
    
    // 2次店（tier-2dealer）配下は必ずfestal
    if (currentPath.includes('/tier-2dealer')) {
      return 'festal';
    }
    
    // URLパスで判定（最優先）
    if (currentPath.includes('/shifts/management/admin') || currentPath.includes('/shifts/management/staff')) {
      return 'festal'; // 2次店側の管理画面・スタッフ画面
    }
    
    if (currentPath === '/shifts/management' || currentPath.startsWith('/shifts/management/page')) {
      return 'ansteype'; // ANSTEYPE側の管理画面
    }
    
    // 管理者ログインしている場合（URLパス判定後）
    if (isAdmin) {
      return 'ansteype';
    }
    
    // user_idでの判定
    if (userId) {
      return 'festal';
    }
    
    // デフォルトはANSTEYPE（ホーム画面など）
    return 'ansteype';
  }, []);

  // 通知をフィルタリング（useMemoで最適化）
  const filteredNotifications = useMemo(() => {
    return notifications.filter(notification => {
      // targetAudienceが設定されている場合、それに基づいてフィルタリング
      if (notification.targetAudience) {
        return notification.targetAudience === getCurrentUserCompany;
      }
      
      // 旧形式の通知は全員に表示（後方互換性）
      return true;
    });
  }, [notifications, getCurrentUserCompany]);

  const unreadCount = isClient ? filteredNotifications.filter(n => !n.isRead).length : 0;

  // ブラウザ通知の許可を要求
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // 新しい通知があった時にブラウザ通知を送信（一時的に無効化）
  // useEffect(() => {
  //   const latestNotification = notifications
  //     .filter(n => !n.isRead)
  //     .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0];

  //   if (latestNotification && 'Notification' in window && Notification.permission === 'granted') {
  //     const notification = new Notification(latestNotification.title, {
  //       body: latestNotification.message,
  //       icon: '/favicon.ico',
  //       tag: latestNotification.id
  //     });

  //     notification.onclick = () => {
  //       setSelectedNotification(latestNotification);
  //       setDetailDialog(true);
  //       setDrawerOpen(true);
  //       notification.close();
  //     };

  //     // 5秒後に自動で閉じる
  //     setTimeout(() => notification.close(), 5000);
  //   }
  // }, [notifications]);

  const handleNotificationClick = (notification: NotificationItem) => {
    if (!notification.isRead) {
      onMarkAsRead(notification.id);
    }
    setSelectedNotification(notification);
    setDetailDialog(true);
  };

  const handleApprove = () => {
    if (selectedNotification?.changeRequest) {
      onApproveChange(selectedNotification.changeRequest.id, approvalComment);
      setApprovalDialog(false);
      setDetailDialog(false);
      setApprovalComment('');
    }
  };

  const handleReject = () => {
    if (selectedNotification?.changeRequest && rejectionReason.trim()) {
      onRejectChange(selectedNotification.changeRequest.id, rejectionReason);
      setRejectionDialog(false);
      setDetailDialog(false);
      setRejectionReason('');
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'shift_submission': return <Assignment color="primary" />;
      case 'change_request': return <Schedule color="warning" />;
      case 'approval': return <CheckCircle color="success" />;
      case 'rejection': return <Cancel color="error" />;
      default: return <Assignment />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'shift_submission': return 'primary';
      case 'change_request': return 'warning';
      case 'approval': return 'success';
      case 'rejection': return 'error';
      default: return 'default';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'shift_submission': return 'シフト提出';
      case 'change_request': return 'シフト変更依頼';
      case 'approval': return '承認完了';
      case 'rejection': return '却下';
      default: return '通知';
    }
  };

  return (
    <>
      {/* 通知アイコンボタン */}
      {!hideIcon && (
        <IconButton
          color="inherit"
          onClick={() => {
            if (open !== undefined) {
              // 親コンポーネントから制御される場合は何もしない
              // 親コンポーネントのhandleNotificationClickが呼ばれるはず
              return;
            } else {
              // 自分で制御する場合
              setDrawerOpen(true);
            }
          }}
          sx={{ position: 'relative' }}
        >
          <Badge 
            badgeContent={unreadCount} 
            color="primary"
          >
            <Notifications />
          </Badge>
        </IconButton>
      )}

      {/* 通知一覧ドロワー */}
      <Drawer
        anchor="right"
        open={isDrawerOpen}
        onClose={() => {
          if (onClose) {
            onClose();
          } else {
            setDrawerOpen(false);
          }
        }}
        PaperProps={{ sx: { width: 400 } }}
      >
        <Box sx={{ p: 2 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Typography variant="h6">通知</Typography>
            <Stack direction="row" spacing={1}>
              {notifications.length > 0 && (
                <Button size="small" onClick={onClearAll}>
                  全削除
                </Button>
              )}
              <IconButton onClick={() => {
                if (onClose) {
                  onClose();
                } else {
                  setDrawerOpen(false);
                }
              }}>
                <Close />
              </IconButton>
            </Stack>
          </Stack>

          {notifications.length === 0 ? (
            <Typography color="text.secondary" textAlign="center" sx={{ py: 4 }}>
              通知はありません
            </Typography>
          ) : (
            <List>
              {filteredNotifications
                .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
                .map((notification) => (
                <ListItem
                  key={notification.id}
                  button
                  onClick={() => handleNotificationClick(notification)}
                  sx={{ 
                    border: 1, 
                    borderColor: 'divider', 
                    borderRadius: 1, 
                    mb: 1,
                    bgcolor: notification.isRead ? 'transparent' : 'action.hover'
                  }}
                >
                  <Box sx={{ mr: 2 }}>
                    {getNotificationIcon(notification.type)}
                  </Box>
                  <ListItemText
                    primary={
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="subtitle2">
                          {notification.title}
                        </Typography>
                        <Chip 
                          label={getTypeLabel(notification.type)} 
                          size="small" 
                          color={getNotificationColor(notification.type)}
                          variant="outlined"
                        />
                      </Stack>
                    }
                    secondary={
                      <Stack spacing={0.5}>
                        <Typography variant="body2" color="text.secondary">
                          {notification.message}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {isClient ? notification.timestamp.toLocaleString('ja-JP') : ''}
                        </Typography>
                      </Stack>
                    }
                  />
                  {!notification.isRead && (
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        bgcolor: 'primary.main',
                        ml: 1
                      }}
                    />
                  )}
                </ListItem>
              ))}
            </List>
          )}
        </Box>
      </Drawer>

      {/* 詳細表示ダイアログ */}
      <Dialog
        open={detailDialog}
        onClose={() => setDetailDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Stack direction="row" spacing={1} alignItems="center">
            {selectedNotification && getNotificationIcon(selectedNotification.type)}
            <Typography variant="h6">
              {selectedNotification?.title}
            </Typography>
            <Chip 
              label={selectedNotification ? getTypeLabel(selectedNotification.type) : ''} 
              size="small" 
              color={selectedNotification ? getNotificationColor(selectedNotification.type) : 'default'}
              variant="outlined"
            />
          </Stack>
        </DialogTitle>
        <DialogContent>
          {selectedNotification && (
            <Stack spacing={2}>
              <Typography variant="body1">
                {selectedNotification.message}
              </Typography>
              
              {selectedNotification.staffName && (
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle2" gutterBottom>
                      スタッフ情報
                    </Typography>
                    <Stack spacing={1}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Person fontSize="small" />
                        <Typography>{selectedNotification.staffName}</Typography>
                      </Stack>
                      {selectedNotification.companyName && (
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Typography variant="body2" color="text.secondary">
                            所属:
                          </Typography>
                          <Chip 
                            label={selectedNotification.companyName} 
                            size="small" 
                            color="primary" 
                            variant="outlined"
                          />
                        </Stack>
                      )}
                    </Stack>
                  </CardContent>
                </Card>
              )}

              {selectedNotification.changeRequest && (
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle2" gutterBottom>
                      変更内容
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                      理由: {selectedNotification.changeRequest.reason}
                    </Typography>
                    
                    {selectedNotification.changeRequest.changes.map((change, index) => (
                      <Box key={index} sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          {change.date}
                        </Typography>
                        <Stack spacing={1}>
                          <Stack direction="row" spacing={2} alignItems="center">
                            <Typography variant="body2" color="text.secondary">
                              出勤可否:
                            </Typography>
                            <Typography>{change.oldStatus}</Typography>
                            <Typography>→</Typography>
                            <Typography color="primary">{change.newStatus}</Typography>
                          </Stack>
                        </Stack>
                      </Box>
                    ))}
                  </CardContent>
                </Card>
              )}

              <Typography variant="body2" color="text.secondary">
                受信時刻: {isClient ? selectedNotification.timestamp.toLocaleString('ja-JP') : ''}
              </Typography>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          {selectedNotification?.type === 'change_request' && 
           selectedNotification.changeRequest?.status === 'pending' && 
           isAdminMode && (
            <>
              <Button 
                onClick={() => setRejectionDialog(true)}
                color="error"
                variant="outlined"
              >
                却下
              </Button>
              <Button 
                onClick={() => setApprovalDialog(true)}
                color="primary"
                variant="contained"
              >
                承認
              </Button>
            </>
          )}
          <Button onClick={() => setDetailDialog(false)}>
            閉じる
          </Button>
        </DialogActions>
      </Dialog>

      {/* 承認ダイアログ */}
      <Dialog open={approvalDialog} onClose={() => setApprovalDialog(false)}>
        <DialogTitle>変更承認</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            この変更依頼を承認しますか？
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label="コメント（任意）"
            fullWidth
            variant="outlined"
            value={approvalComment}
            onChange={(e) => setApprovalComment(e.target.value)}
            multiline
            rows={3}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setApprovalDialog(false)}>キャンセル</Button>
          <Button onClick={handleApprove} variant="contained" color="primary">
            承認
          </Button>
        </DialogActions>
      </Dialog>

      {/* 却下ダイアログ */}
      <Dialog open={rejectionDialog} onClose={() => setRejectionDialog(false)}>
        <DialogTitle>変更却下</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            却下の理由を入力してください：
          </Typography>
          <FormControl fullWidth margin="dense">
            <InputLabel>却下理由</InputLabel>
            <Select
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              label="却下理由"
            >
              <MenuItem value="スケジュール調整困難">スケジュール調整困難</MenuItem>
              <MenuItem value="人員配置の問題">人員配置の問題</MenuItem>
              <MenuItem value="情報不足">情報不足</MenuItem>
              <MenuItem value="承認期限切れ">承認期限切れ</MenuItem>
              <MenuItem value="その他">その他</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectionDialog(false)}>キャンセル</Button>
          <Button 
            onClick={handleReject} 
            variant="contained" 
            color="error"
            disabled={!rejectionReason.trim()}
          >
            却下
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
} 