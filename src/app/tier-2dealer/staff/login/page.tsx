'use client';

import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Checkbox,
  FormControlLabel,
  Alert,
  Container,
  InputAdornment,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Link
} from '@mui/material';
import { Visibility, VisibilityOff, Email, Lock, AccountCircle } from '@mui/icons-material';
import { useRouter } from 'next/navigation';

export default function StaffLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // パスワードリセット関連の状態
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);
  const [resetError, setResetError] = useState('');
  const [isResetLoading, setIsResetLoading] = useState(false);

  // 有効なスタッフデータ（メールアドレスとパスワードのマッピング）
  const validStaffData = {
    'tanaka.taro@example.com': { id: 'staff001', name: '田中太郎', password: 'password123' },
    'sato.hanako@example.com': { id: 'staff002', name: '佐藤花子', password: 'password456' },
    'yamada.jiro@example.com': { id: 'staff003', name: '山田次郎', password: 'password789' },
    'suzuki.misaki@example.com': { id: 'staff004', name: '鈴木美咲', password: 'password101' },
    'takahashi.kenta@example.com': { id: 'staff005', name: '高橋健太', password: 'password202' },
    'nakamura.masato@example.com': { id: 'staff006', name: '中村雅人', password: 'password303' },
    'kobayashi.yumi@example.com': { id: 'staff007', name: '小林由美', password: 'password404' },
    'kato.tomoya@example.com': { id: 'staff008', name: '加藤智也', password: 'password505' },
    'ito.asami@example.com': { id: 'staff009', name: '伊藤麻美', password: 'password606' },
    'morita.daisuke@example.com': { id: 'staff010', name: '森田大輔', password: 'password707' }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      setError('メールアドレスとパスワードを入力してください');
      return;
    }

    // メールアドレス形式の簡単なバリデーション
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('正しいメールアドレス形式で入力してください');
      return;
    }

    setIsLoading(true);
    setError('');

    // モック認証
    setTimeout(() => {
      const staffData = validStaffData[email as keyof typeof validStaffData];
      if (staffData && password === staffData.password) {
        // ログイン成功
        if (rememberMe) {
          localStorage.setItem('staff_remember', 'true');
        }
        localStorage.setItem('staff_logged_in', 'true');
        localStorage.setItem('current_staff_id', staffData.id);
        localStorage.setItem('current_staff_name', staffData.name);
        localStorage.setItem('login_time', new Date().toISOString());
        router.push('/tier-2dealer/staff/dashboard'); // ダッシュボードにリダイレクト
      } else {
        setError('メールアドレスまたはパスワードが正しくありません');
      }
      setIsLoading(false);
    }, 1000);
  };

  const handlePasswordReset = async () => {
    if (!resetEmail) {
      setResetError('メールアドレスを入力してください');
      return;
    }

    // メールアドレス形式の簡単なバリデーション
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(resetEmail)) {
      setResetError('正しいメールアドレス形式で入力してください');
      return;
    }

    setIsResetLoading(true);
    setResetError('');

    // モックのパスワードリセット処理
    setTimeout(() => {
      const staffData = validStaffData[resetEmail as keyof typeof validStaffData];
      if (staffData) {
        setResetSuccess(true);
        setResetError('');
        // 実際の実装では、ここでメール送信APIを呼び出す
        console.log(`パスワードリセットメールを ${resetEmail} に送信しました`);
      } else {
        setResetError('登録されていないメールアドレスです');
      }
      setIsResetLoading(false);
    }, 1500);
  };

  const handleResetDialogClose = () => {
    setResetDialogOpen(false);
    setResetEmail('');
    setResetError('');
    setResetSuccess(false);
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4, mb: 4 }}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          minHeight: '70vh',
          justifyContent: 'center',
        }}
      >
        <Card
          sx={{
            width: '100%',
            maxWidth: 400,
            boxShadow: 3,
            borderRadius: 2,
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <AccountCircle sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
              <Typography variant="h4" component="h1" gutterBottom>
                スタッフログイン
              </Typography>
              <Typography variant="body2" color="text.secondary">
                シフト管理システム スタッフ専用ページ
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            <Box sx={{ mb: 3 }}>
              <TextField
                fullWidth
                label="メールアドレス"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyPress={handleKeyPress}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email color="action" />
                    </InputAdornment>
                  ),
                }}
                variant="outlined"
                placeholder="例: tanaka.taro@example.com"
                disabled={isLoading}
              />
            </Box>

            <Box sx={{ mb: 3 }}>
              <TextField
                fullWidth
                label="パスワード"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={handleKeyPress}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                variant="outlined"
                placeholder="パスワードを入力"
                disabled={isLoading}
              />
            </Box>

            <Box sx={{ mb: 3 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    disabled={isLoading}
                  />
                }
                label="ログイン状態を保持"
              />
            </Box>

            <Button
              fullWidth
              variant="contained"
              size="large"
              onClick={handleLogin}
              disabled={isLoading}
              sx={{ mb: 2, py: 1.5 }}
            >
              {isLoading ? 'ログイン中...' : 'ログイン'}
            </Button>

            <Box sx={{ textAlign: 'center', mb: 2 }}>
              <Link
                component="button"
                variant="body2"
                onClick={() => setResetDialogOpen(true)}
                sx={{ textDecoration: 'underline', cursor: 'pointer' }}
              >
                パスワードを忘れた方はこちら
              </Link>
            </Box>

            <Box sx={{ textAlign: 'center' }}>
              <Button
                variant="text"
                size="small"
                onClick={() => router.push('/tier-2dealer/admin/login')}
                sx={{ textDecoration: 'underline' }}
              >
                管理者ログインはこちら
              </Button>
            </Box>

            {/* デモ用の認証情報表示 */}
            <Box sx={{ mt: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                【デモ用認証情報】
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                メール: tanaka.taro@example.com
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                パスワード: password123
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* パスワードリセットダイアログ */}
      <Dialog open={resetDialogOpen} onClose={handleResetDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>パスワードリセット</DialogTitle>
        <DialogContent>
          {resetSuccess ? (
            <Box sx={{ textAlign: 'center', py: 2 }}>
              <Alert severity="success" sx={{ mb: 2 }}>
                パスワードリセットメールを送信しました
              </Alert>
              <Typography variant="body2" color="text.secondary">
                {resetEmail} にパスワードリセット用のURLを送信しました。
                メールをご確認いただき、記載されているURLからパスワードの再設定を行ってください。
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                ※メールが届かない場合は、迷惑メールフォルダもご確認ください。
              </Typography>
            </Box>
          ) : (
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                登録されているメールアドレスを入力してください。
                パスワードリセット用のURLをメールでお送りします。
              </Typography>
              
              {resetError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {resetError}
                </Alert>
              )}

              <TextField
                fullWidth
                label="メールアドレス"
                type="email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                placeholder="例: tanaka.taro@example.com"
                disabled={isResetLoading}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleResetDialogClose}>
            {resetSuccess ? '閉じる' : 'キャンセル'}
          </Button>
          {!resetSuccess && (
            <Button
              variant="contained"
              onClick={handlePasswordReset}
              disabled={isResetLoading || !resetEmail}
            >
              {isResetLoading ? '送信中...' : 'リセットメール送信'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Container>
  );
} 