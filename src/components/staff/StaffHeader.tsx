'use client';

import { 
  Box, 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Chip,
  IconButton,
  useTheme,
  useMediaQuery,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from '@mui/material';
import { Logout, Dashboard } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface StaffHeaderProps {
  userName?: string;
  userRole?: string;
  showBackButton?: boolean;
  title?: string;
  currentPage?: string;
  onLogout?: () => void;
}

export default function StaffHeader({ 
  userName = '', 
  userRole = 'スタッフ',
  showBackButton = false,
  title = 'シフト管理',
  currentPage,
  onLogout
}: StaffHeaderProps) {
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

  const handleBack = () => {
    router.back();
  };

  const handleLogoutClick = () => {
    setLogoutDialogOpen(true);
  };

  const handleLogoutConfirm = () => {
    // ログアウト処理
    if (typeof window !== 'undefined') {
      localStorage.removeItem('staff_logged_in');
      localStorage.removeItem('user_id');
      localStorage.removeItem('user_name');
    }
    setLogoutDialogOpen(false);
    if (onLogout) {
      onLogout();
    } else {
      router.push('/tier-2dealer/staff/login');
    }
  };

  const handleLogoutCancel = () => {
    setLogoutDialogOpen(false);
  };

  const handleDashboard = () => {
    router.push('/tier-2dealer/staff/dashboard');
  };

  return (
    <AppBar position="static" sx={{ bgcolor: '#1976d2', mb: 2 }}>
      <Toolbar 
        sx={{ 
          justifyContent: 'space-between',
          minHeight: isMobile ? '48px' : '56px',
          px: isMobile ? 1 : 2
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: isMobile ? 0.5 : 2 }}>
          {showBackButton && (
            <Button
              variant="outlined"
              size="small"
              onClick={handleBack}
              sx={{ 
                color: 'white', 
                borderColor: 'white',
                fontSize: isMobile ? '0.7rem' : '0.875rem',
                px: isMobile ? 1 : 2,
                py: isMobile ? 0.5 : 1,
                minWidth: isMobile ? 'auto' : 'unset',
                '&:hover': { 
                  borderColor: 'rgba(255, 255, 255, 0.7)',
                  bgcolor: 'rgba(255, 255, 255, 0.1)'
                }
              }}
            >
              戻る
            </Button>
          )}
          <Typography 
            variant={isMobile ? "subtitle1" : "h6"} 
            sx={{ 
              color: 'white', 
              fontWeight: 600,
              fontSize: isMobile ? '0.9rem' : '1.25rem'
            }}
          >
            {title}
          </Typography>
        </Box>

        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: isMobile ? 0.5 : isTablet ? 1 : 2 
        }}>
          {/* ダッシュボードボタン - モバイルではアイコンのみ */}
          {isMobile ? (
            <IconButton
              onClick={handleDashboard}
              sx={{ 
                color: 'white',
                p: 0.5,
                '&:hover': { 
                  bgcolor: 'rgba(255, 255, 255, 0.1)'
                }
              }}
            >
              <Dashboard fontSize="small" />
            </IconButton>
          ) : (
            <Button
              variant="text"
              onClick={handleDashboard}
              sx={{ 
                color: 'white',
                fontSize: isTablet ? '0.75rem' : '0.875rem',
                px: isTablet ? 1 : 2,
                '&:hover': { 
                  bgcolor: 'rgba(255, 255, 255, 0.1)'
                }
              }}
            >
              ダッシュボード
            </Button>
          )}
          
          {/* 役職チップ - モバイルでは非表示 */}
          {!isMobile && (
            <Chip
              label={userRole}
              size="small"
              sx={{ 
                bgcolor: 'rgba(255, 255, 255, 0.2)', 
                color: 'white',
                fontSize: isTablet ? '0.7rem' : '0.75rem'
              }}
            />
          )}
          
          {/* ユーザー情報 */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: isMobile ? 0.5 : 1 }}>
            {/* ユーザー名 - モバイルでも表示 */}
            <Typography 
              variant="body2" 
              sx={{ 
                color: 'white', 
                fontWeight: 500,
                fontSize: isMobile ? '0.7rem' : isTablet ? '0.75rem' : '0.875rem',
                maxWidth: isMobile ? '80px' : 'none',
                overflow: isMobile ? 'hidden' : 'visible',
                textOverflow: isMobile ? 'ellipsis' : 'clip',
                whiteSpace: isMobile ? 'nowrap' : 'normal'
              }}
            >
              {userName}
            </Typography>
          </Box>

          {/* ログアウトボタン - モバイルではアイコンのみ */}
          {isMobile ? (
            <IconButton
              onClick={handleLogoutClick}
              sx={{ 
                color: 'white',
                p: 0.5,
                '&:hover': { 
                  bgcolor: 'rgba(255, 255, 255, 0.1)'
                }
              }}
            >
              <Logout fontSize="small" />
            </IconButton>
          ) : (
            <Button
              startIcon={<Logout />}
              onClick={handleLogoutClick}
              sx={{ 
                color: 'white',
                fontSize: isTablet ? '0.75rem' : '0.875rem',
                px: isTablet ? 1 : 2,
                '&:hover': { 
                  bgcolor: 'rgba(255, 255, 255, 0.1)'
                }
              }}
            >
              ログアウト
            </Button>
          )}
        </Box>
      </Toolbar>

      {/* ログアウト確認ダイアログ */}
      <Dialog
        open={logoutDialogOpen}
        onClose={handleLogoutCancel}
        aria-labelledby="logout-dialog-title"
        aria-describedby="logout-dialog-description"
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle id="logout-dialog-title" sx={{ textAlign: 'center' }}>
          ログアウト確認
        </DialogTitle>
        <DialogContent sx={{ textAlign: 'center', pb: 2 }}>
          <DialogContentText id="logout-dialog-description">
            このアカウントからログアウトしますか？
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', gap: 2, px: 3, pb: 3 }}>
          <Button 
            onClick={handleLogoutCancel} 
            color="primary" 
            variant="outlined"
            sx={{ flex: 1, minWidth: 100 }}
          >
            キャンセル
          </Button>
          <Button 
            onClick={handleLogoutConfirm} 
            color="primary" 
            variant="contained"
            sx={{ flex: 1, minWidth: 100 }}
          >
            ログアウト
          </Button>
        </DialogActions>
      </Dialog>
    </AppBar>
  );
} 