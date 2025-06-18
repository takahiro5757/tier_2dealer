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
import { Visibility, VisibilityOff, Person, Lock, Business, Email } from '@mui/icons-material';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
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

    // モック認証（実際の実装では適切な認証処理を行う）
    setTimeout(() => {
      // 複数の管理者アカウント対応（メールアドレスベース）
      const validAccounts = {
        'admin@ansteype.com': { id: 'admin001', password: 'admin123', type: 'general', name: '管理者' },
        'festal.admin@ansteype.com': { id: 'festal_admin', password: 'festal123', type: 'festal', name: 'Festal管理者' },
        'test@ansteype.com': { id: 'test', password: 'test', type: 'test', name: 'テスト管理者' }
      };
      
      const account = validAccounts[email as keyof typeof validAccounts];
      
      if (account && password === account.password) {
        // ログイン成功
        if (rememberMe) {
          localStorage.setItem('admin_remember', 'true');
        }
        localStorage.setItem('admin_logged_in', 'true');
        localStorage.setItem('admin_id', account.id);
        localStorage.setItem('admin_type', account.type);
        localStorage.setItem('admin_email', email);
        localStorage.setItem('admin_name', account.name);
        router.push('/tier-2dealer/admin/shifts');
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
      const validEmails = ['admin@ansteype.com', 'festal.admin@ansteype.com', 'test@ansteype.com'];
      if (validEmails.includes(resetEmail)) {
        setResetSuccess(true);
        setResetError('');
        // 実際の実装では、ここでメール送信APIを呼び出す
        console.log(`管理者メール ${resetEmail} にパスワードリセットメールを送信しました`);
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
              <Business sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
              <Typography variant="h4" component="h1" gutterBottom>
                管理者ログイン
              </Typography>
              <Typography variant="body2" color="text.secondary">
                シフト管理システム 管理者専用ページ
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
                placeholder="例: admin@ansteype.com"
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
                onClick={() => router.push('/tier-2dealer/staff/login')}
                sx={{ textDecoration: 'underline' }}
              >
                スタッフログインはこちら
              </Button>
            </Box>

            {/* デモ用の認証情報表示 */}
            <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
              <Typography variant="caption" color="text.secondary">
                【デモ用認証情報】<br />
                一般管理者: admin@ansteype.com / admin123<br />
                Festal管理者: festal.admin@ansteype.com / festal123<br />
                テスト用: test@ansteype.com / test
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* パスワードリセットダイアログ */}
      <Dialog open={resetDialogOpen} onClose={handleResetDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>管理者パスワードリセット</DialogTitle>
        <DialogContent>
          {resetSuccess ? (
            <Box sx={{ textAlign: 'center', py: 2 }}>
              <Alert severity="success" sx={{ mb: 2 }}>
                パスワードリセット情報を送信しました
              </Alert>
              <Typography variant="body2" color="text.secondary">
                メールアドレス「{resetEmail}」に
                パスワードリセット用の情報を送信しました。
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                メールをご確認いただき、記載されている手順に従って
                パスワードの再設定を行ってください。
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                ※メールが届かない場合は、システム管理者までお問い合わせください。
              </Typography>
            </Box>
          ) : (
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                登録されているメールアドレスを入力してください。
                パスワードリセット用の情報をメールでお送りします。
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
                placeholder="例: admin@ansteype.com"
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
              {isResetLoading ? '送信中...' : 'リセット情報送信'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Container>
  );
} 