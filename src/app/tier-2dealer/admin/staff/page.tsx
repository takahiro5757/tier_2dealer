'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  Box, Container, Typography, Paper, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Grid, Chip, IconButton, Alert, AppBar, Toolbar, MenuItem, Select, FormControl, InputLabel, InputAdornment
} from '@mui/material';
import { 
  Edit, Delete, Add, ArrowBack, Person, Logout, CalendarToday, Visibility, VisibilityOff 
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import AdminHeader from '../../../../components/AdminHeader';
import { useShiftStore } from '../../../../stores/shiftStore';
import { initialStaffMembers } from './initialStaffMembers';
import { StaffMember } from '@/types/staff';
import Switch from '@mui/material/Switch';
import Tooltip from '@mui/material/Tooltip';

const SUBMISSION_STATUS: Record<string, { label: string; color: 'success' | 'warning' | 'error' | 'default' }> = {
  submitted: { label: '提出済み', color: 'success' },
  draft: { label: '未提出', color: 'warning' }
};

// localStorageキー
const STAFF_STORAGE_KEY = 'staff_members';

export default function AdminStaffPage() {
  const router = useRouter();
  
  // グローバルストアから通知関連の状態を取得
  const {
    notifications: globalNotifications,
    markNotificationAsRead,
    clearAllNotifications
  } = useShiftStore();
  
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>(initialStaffMembers);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);

  // フィルター状態
  const [filters, setFilters] = useState({
    name: '',
    nameKana: '',
    station: '',
    role: '',
    status: '',
    month: '2025-01', // デフォルトを最新月に設定
    isActive: ''
  });

  // パスワード表示状態
  const [showPassword, setShowPassword] = useState(false);

  // 2025年1月から12月の固定月リスト
  const uniqueMonths = [
    '2025-01', '2025-02', '2025-03', '2025-04', 
    '2025-05', '2025-06', '2025-07', '2025-08', 
    '2025-09', '2025-10', '2025-11', '2025-12'
  ];

  // ログアウト処理
  const handleLogout = () => {
    localStorage.removeItem('admin_logged_in');
    localStorage.removeItem('admin_id');
    router.push('/tier-2dealer/admin/login');
  };

  // 認証チェック
  useEffect(() => {
    const isLoggedIn = localStorage.getItem('admin_logged_in');
    if (!isLoggedIn) {
      router.push('/tier-2dealer/admin/login');
      return;
    }
  }, [router]);

  // 初期化時にlocalStorageから取得
  useEffect(() => {
    const stored = localStorage.getItem(STAFF_STORAGE_KEY);
    if (stored) {
      setStaffMembers(JSON.parse(stored));
    }
  }, []);

  // フィルター変更ハンドラー
  const handleFilterChange = (field: keyof typeof filters) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | { target: { value: unknown } }
  ) => {
    const value = event.target.value as string;
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // フィルターリセット
  const handleResetFilters = () => {
    setFilters({
      name: '',
      nameKana: '',
      station: '',
      role: '',
      status: '',
      month: '2025-01',
      isActive: ''
    });
  };

  // フィルター適用されたスタッフリスト（月フィルターは除外）
  const filteredStaffMembers = staffMembers.filter(staff => {
    const currentMonthStatus = staff.submissionHistory[filters.month] || 'draft';
    const isActiveMatch = filters.isActive === undefined || filters.isActive === ''
      ? true
      : String(staff.isActive) === filters.isActive;
    return (
      isActiveMatch &&
      staff.name.toLowerCase().includes(filters.name.toLowerCase()) &&
      staff.nameKana.toLowerCase().includes(filters.nameKana.toLowerCase()) &&
      staff.station.toLowerCase().includes(filters.station.toLowerCase()) &&
      (filters.role === '' || staff.role === filters.role) &&
      (filters.status === '' || currentMonthStatus === filters.status)
    );
  });

  // パスワード表示切り替え
  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // editFormの初期値を共通化
  const emptyStaffMember: StaffMember = {
    id: '',
    name: '',
    nameKana: '',
    station: '',
    weekdayRate: 15000,
    holidayRate: 18000,
    tel: '',
    role: 'クローザー',
    company: '株式会社Festal',
    email: '',
    password: '',
    businessTripNG: 'OK',
    submissionHistory: {},
    isActive: true
  };
  const [editForm, setEditForm] = useState<StaffMember>(emptyStaffMember);
  const [message, setMessage] = useState('');

  // フォーム入力ハンドラー
  const handleFormChange = (field: keyof StaffMember) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | { target: { value: unknown } }
  ) => {
    const value = event.target.value;
    if (field === 'submissionHistory') {
      // 提出状況の場合は、現在選択されている月の状況を更新
      setEditForm(prev => ({
        ...prev,
        submissionHistory: {
          ...prev.submissionHistory,
          [filters.month]: value as 'submitted' | 'draft'
        }
      }));
    } else {
      setEditForm(prev => ({
        ...prev,
        [field]: field === 'weekdayRate' || field === 'holidayRate' ? Number(value) || 0 : value
      }));
    }
  };

  // スタッフ追加ダイアログを開く
  const handleAddOpen = () => {
    setEditForm({
      ...emptyStaffMember,
      id: `staff${String(Date.now()).slice(-3)}`,
      submissionHistory: { [filters.month]: 'draft' },
      isActive: true
    });
    setAddDialogOpen(true);
  };

  // 編集ダイアログを開く
  const handleEditOpen = (staff: StaffMember) => {
    setSelectedStaff(staff);
    setEditForm({ ...staff });
    setEditDialogOpen(true);
  };

  // 編集ダイアログを閉じる
  const handleEditClose = () => {
    setEditDialogOpen(false);
    setSelectedStaff(null);
    setEditForm({
      id: '',
      name: '',
      nameKana: '',
      station: '',
      weekdayRate: 15000,
      holidayRate: 18000,
      tel: '',
      role: 'クローザー',
      company: '株式会社Festal',
      email: '',
      password: '',
      businessTripNG: 'OK',
      submissionHistory: {},
      isActive: true
    });
  };

  // 削除ダイアログを開く
  const handleDeleteOpen = (staff: StaffMember) => {
    setSelectedStaff(staff);
    setDeleteDialogOpen(true);
  };

  // 編集保存
  const handleEditSave = () => {
    setStaffMembers(prev =>
      prev.map(staff =>
        staff.id === selectedStaff?.id ? editForm : staff
      )
    );
    setMessage('スタッフ情報を更新しました');
    handleEditClose();
    setTimeout(() => {
      setMessage('');
    }, 3000);
  };

  // 削除ダイアログを閉じる
  const handleDeleteClose = () => {
    setDeleteDialogOpen(false);
    setSelectedStaff(null);
  };

  // 削除実行
  const handleDeleteConfirm = () => {
    if (selectedStaff) {
      setStaffMembers(prev => prev.filter(staff => staff.id !== selectedStaff.id));
      setMessage('スタッフを削除しました');
      handleDeleteClose();
      setTimeout(() => {
        setMessage('');
      }, 3000);
    }
  };

  // 追加ダイアログを閉じる
  const handleAddClose = () => {
    setAddDialogOpen(false);
    setEditForm({
      id: '',
      name: '',
      nameKana: '',
      station: '',
      weekdayRate: 15000,
      holidayRate: 18000,
      tel: '',
      role: 'クローザー',
      company: '株式会社Festal',
      email: '',
      password: '',
      businessTripNG: 'OK',
      submissionHistory: {},
      isActive: true
    });
  };

  // 追加保存
  const handleAddSave = () => {
    if (editForm.name && editForm.nameKana && editForm.station && editForm.tel && editForm.email && editForm.password) {
      setStaffMembers(prev => [...prev, editForm]);
      setMessage('新しいスタッフを追加しました');
      handleAddClose();
      setTimeout(() => {
        setMessage('');
      }, 3000);
    }
  };

  // スイッチ切り替え時にlocalStorageへ保存
  const handleActiveToggle = (id: string) => {
    setStaffMembers((prev) => {
      const updated = prev.map((s) =>
        s.id === id ? { ...s, isActive: !s.isActive } : s
      );
      localStorage.setItem(STAFF_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <Box sx={{ backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      {/* AdminHeader */}
      <AdminHeader />

      <Container maxWidth={false} sx={{ py: 3, px: 2 }}>
        {message && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {message}
          </Alert>
        )}

        {/* ヘッダー情報 */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item>
              <Typography variant="h5" gutterBottom>
                スタッフ一覧
              </Typography>
              <Typography variant="body2" color="text.secondary">
                登録スタッフ数：{staffMembers.length}名 / 表示中：{filteredStaffMembers.length}名
              </Typography>
              <Typography variant="body2" color="text.secondary">
                クローザー：{staffMembers.filter(staff => staff.role === 'クローザー').length}名 / ガール：{staffMembers.filter(staff => staff.role === 'ガール').length}名
              </Typography>
            </Grid>
            <Grid item sx={{ ml: 'auto' }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<Add />}
                onClick={handleAddOpen}
                sx={{ minWidth: 150 }}
              >
                スタッフ追加
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* スタッフテーブル */}
        <Paper sx={{ mb: 3 }}>
          <TableContainer>
            <Table>
              <TableHead>
                {/* 1行目：月フィルターまたは空白 */}
                <TableRow sx={{ backgroundColor: '#f5f5f5', height: 48 }}>
                  <TableCell sx={{ border: 'none', p: 0 }}></TableCell>
                  <TableCell sx={{ border: 'none', p: 0 }}></TableCell>
                  <TableCell sx={{ border: 'none', p: 0 }}></TableCell>
                  <TableCell sx={{ border: 'none', p: 0 }}></TableCell>
                  <TableCell sx={{ border: 'none', p: 0 }}></TableCell>
                  <TableCell sx={{ border: 'none', p: 0 }}></TableCell>
                  <TableCell sx={{ border: 'none', p: 0 }}></TableCell>
                  <TableCell sx={{ border: 'none', p: 0 }}></TableCell>
                  <TableCell sx={{ textAlign: 'center', verticalAlign: 'middle', p: 1 }}>
                    <FormControl size="small" sx={{ minWidth: 100 }}>
                      <Select
                        value={filters.month}
                        onChange={handleFilterChange('month')}
                        sx={{ fontSize: '0.8rem' }}
                      >
                        {uniqueMonths.map(month => (
                          <MenuItem key={month} value={month}>
                            {month.replace(/-(\d{2})$/, '年$1月')}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </TableCell>
                  <TableCell sx={{ border: 'none', p: 0 }}></TableCell>
                </TableRow>
                {/* 2行目：各項目のラベル */}
                <TableRow sx={{ backgroundColor: '#f5f5f5', height: 48 }}>
                  <TableCell sx={{ fontWeight: 'bold', textAlign: 'center', verticalAlign: 'middle' }}>
                    <Tooltip title="有効にするとシフト管理画面に表示されます。無効にすると非表示になります。" arrow>
                      <span>有効</span>
                    </Tooltip>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold', textAlign: 'center', verticalAlign: 'middle' }}>氏名</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', textAlign: 'center', verticalAlign: 'middle' }}>カナ</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', textAlign: 'center', verticalAlign: 'middle' }}>最寄駅</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', textAlign: 'center', verticalAlign: 'middle' }}>役職</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', textAlign: 'center', verticalAlign: 'middle' }}>平日単価</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', textAlign: 'center', verticalAlign: 'middle' }}>土日単価</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', textAlign: 'center', verticalAlign: 'middle' }}>電話番号</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', textAlign: 'center', verticalAlign: 'middle' }}>提出状況</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', textAlign: 'center', verticalAlign: 'middle' }}>操作</TableCell>
                </TableRow>
                {/* フィルター行 */}
                <TableRow sx={{ backgroundColor: '#fafafa' }}>
                  {/* 有効フィルター */}
                  <TableCell sx={{ py: 1 }}>
                    <FormControl size="small" sx={{ width: '100%' }}>
                      <Select
                        value={filters.isActive ?? ''}
                        onChange={e => setFilters(prev => ({ ...prev, isActive: e.target.value }))}
                        displayEmpty
                      >
                        <MenuItem value="">すべて</MenuItem>
                        <MenuItem value="true">有効</MenuItem>
                        <MenuItem value="false">無効</MenuItem>
                      </Select>
                    </FormControl>
                  </TableCell>
                  {/* 氏名フィルター */}
                  <TableCell sx={{ py: 1 }}>
                    <TextField
                      size="small"
                      placeholder="氏名で検索"
                      value={filters.name}
                      onChange={handleFilterChange('name')}
                      sx={{ width: '100%' }}
                    />
                  </TableCell>
                  {/* カナフィルター */}
                  <TableCell sx={{ py: 1 }}>
                    <TextField
                      size="small"
                      placeholder="カナで検索"
                      value={filters.nameKana}
                      onChange={handleFilterChange('nameKana')}
                      sx={{ width: '100%' }}
                    />
                  </TableCell>
                  {/* 最寄駅フィルター */}
                  <TableCell sx={{ py: 1 }}>
                    <TextField
                      size="small"
                      placeholder="最寄駅で検索"
                      value={filters.station}
                      onChange={handleFilterChange('station')}
                      sx={{ width: '100%' }}
                    />
                  </TableCell>
                  {/* 役職フィルター */}
                  <TableCell sx={{ py: 1 }}>
                    <FormControl size="small" sx={{ width: '100%' }}>
                      <Select
                        value={filters.role}
                        onChange={handleFilterChange('role')}
                        displayEmpty
                      >
                        <MenuItem value="">すべて</MenuItem>
                        <MenuItem value="クローザー">クローザー</MenuItem>
                        <MenuItem value="ガール">ガール</MenuItem>
                      </Select>
                    </FormControl>
                  </TableCell>
                  {/* 平日単価・土日単価・電話番号はフィルターなし */}
                  <TableCell sx={{ py: 1 }}></TableCell>
                  <TableCell sx={{ py: 1 }}></TableCell>
                  <TableCell sx={{ py: 1 }}></TableCell>
                  {/* 提出状況フィルター */}
                  <TableCell sx={{ py: 1 }}>
                    <FormControl size="small" sx={{ width: '100%' }}>
                      <Select
                        value={filters.status}
                        onChange={handleFilterChange('status')}
                        displayEmpty
                      >
                        <MenuItem value="">すべて</MenuItem>
                        <MenuItem value="submitted">提出済み</MenuItem>
                        <MenuItem value="draft">未提出</MenuItem>
                      </Select>
                    </FormControl>
                  </TableCell>
                  {/* リセットボタン */}
                  <TableCell sx={{ py: 1, textAlign: 'center' }}>
                    <Button
                      size="small"
                      onClick={handleResetFilters}
                      sx={{ fontSize: '0.75rem' }}
                    >
                      リセット
                    </Button>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredStaffMembers.map((staff) => (
                  <TableRow key={staff.id} hover>
                    <TableCell>
                      <Switch
                        checked={staff.isActive}
                        onChange={() => handleActiveToggle(staff.id)}
                        color="primary"
                        inputProps={{ 'aria-label': '有効/無効切り替え' }}
                      />
                    </TableCell>
                    <TableCell>{staff.name}</TableCell>
                    <TableCell>{staff.nameKana}</TableCell>
                    <TableCell>{staff.station}</TableCell>
                    <TableCell>
                      <Chip 
                        label={staff.role}
                        color={staff.role === 'クローザー' ? 'primary' : 'secondary'}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>¥{staff.weekdayRate.toLocaleString()}</TableCell>
                    <TableCell>¥{staff.holidayRate.toLocaleString()}</TableCell>
                    <TableCell>{staff.tel}</TableCell>
                    <TableCell>
                      <Chip
                        label={SUBMISSION_STATUS[staff.submissionHistory[filters.month] || 'draft']?.label || '未提出'}
                        color={SUBMISSION_STATUS[staff.submissionHistory[filters.month] || 'draft']?.color || 'warning'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell sx={{ textAlign: 'center' }}>
                      <IconButton
                        color="primary"
                        onClick={() => handleEditOpen(staff)}
                        sx={{ mr: 1 }}
                      >
                        <Edit />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => handleDeleteOpen(staff)}
                      >
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Container>

      {/* 編集ダイアログ */}
      <Dialog open={editDialogOpen} onClose={handleEditClose} maxWidth="md" fullWidth>
        <DialogTitle>スタッフ情報編集</DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="氏名"
                value={editForm.name}
                onChange={handleFormChange('name')}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="カナ"
                value={editForm.nameKana}
                onChange={handleFormChange('nameKana')}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="最寄駅"
                value={editForm.station}
                onChange={handleFormChange('station')}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="電話番号"
                value={editForm.tel}
                onChange={handleFormChange('tel')}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>役職</InputLabel>
                <Select
                  value={editForm.role}
                  onChange={handleFormChange('role')}
                  label="役職"
                >
                  <MenuItem value="クローザー">クローザー</MenuItem>
                  <MenuItem value="ガール">ガール</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>出張可否</InputLabel>
                <Select
                  value={editForm.businessTripNG}
                  onChange={handleFormChange('businessTripNG')}
                  label="出張可否"
                >
                  <MenuItem value="OK">OK</MenuItem>
                  <MenuItem value="NG">NG</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="平日単価"
                type="number"
                value={editForm.weekdayRate}
                onChange={handleFormChange('weekdayRate')}
                InputProps={{
                  startAdornment: '¥',
                  readOnly: true
                }}
                disabled
                helperText="※ANSTEYPE側が決定します"
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="土日単価"
                type="number"
                value={editForm.holidayRate}
                onChange={handleFormChange('holidayRate')}
                InputProps={{
                  startAdornment: '¥',
                  readOnly: true
                }}
                disabled
                helperText="※ANSTEYPE側が決定します"
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>提出状況</InputLabel>
                <Select
                  value={editForm.submissionHistory[filters.month] || ''}
                  onChange={handleFormChange('submissionHistory')}
                  label="提出状況"
                >
                  <MenuItem value="submitted">提出済み</MenuItem>
                  <MenuItem value="draft">未提出</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="メールアドレス"
                type="email"
                value={editForm.email}
                onChange={handleFormChange('email')}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="パスワード"
                type={showPassword ? 'text' : 'password'}
                value={editForm.password}
                onChange={handleFormChange('password')}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={handleTogglePasswordVisibility}
                        edge="end"
                        size="small"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                required
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditClose}>キャンセル</Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleEditSave}
            disabled={!editForm.name || !editForm.nameKana || !editForm.station || !editForm.tel || !editForm.email || !editForm.password}
          >
            保存
          </Button>
        </DialogActions>
      </Dialog>

      {/* 削除確認ダイアログ */}
      <Dialog open={deleteDialogOpen} onClose={handleDeleteClose}>
        <DialogTitle>スタッフ削除確認</DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            以下のスタッフを削除しますか？
          </Typography>
          <Typography variant="body2" color="text.secondary">
            氏名：{selectedStaff?.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            カナ：{selectedStaff?.nameKana}
          </Typography>
          <Typography variant="body2" color="error" sx={{ mt: 2 }}>
            ※この操作は元に戻せません。
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteClose}>キャンセル</Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDeleteConfirm}
          >
            削除する
          </Button>
        </DialogActions>
      </Dialog>

      {/* 追加ダイアログ */}
      <Dialog open={addDialogOpen} onClose={handleAddClose} maxWidth="md" fullWidth>
        <DialogTitle>新しいスタッフ追加</DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="氏名"
                value={editForm.name}
                onChange={handleFormChange('name')}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="カナ"
                value={editForm.nameKana}
                onChange={handleFormChange('nameKana')}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="最寄駅"
                value={editForm.station}
                onChange={handleFormChange('station')}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="電話番号"
                value={editForm.tel}
                onChange={handleFormChange('tel')}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>役職</InputLabel>
                <Select
                  value={editForm.role}
                  onChange={handleFormChange('role')}
                  label="役職"
                >
                  <MenuItem value="クローザー">クローザー</MenuItem>
                  <MenuItem value="ガール">ガール</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>出張可否</InputLabel>
                <Select
                  value={editForm.businessTripNG}
                  onChange={handleFormChange('businessTripNG')}
                  label="出張可否"
                >
                  <MenuItem value="OK">OK</MenuItem>
                  <MenuItem value="NG">NG</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="平日単価"
                type="number"
                value={editForm.weekdayRate}
                onChange={handleFormChange('weekdayRate')}
                InputProps={{
                  startAdornment: '¥'
                }}
                helperText="※新規登録時のみ入力可能"
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="土日単価"
                type="number"
                value={editForm.holidayRate}
                onChange={handleFormChange('holidayRate')}
                InputProps={{
                  startAdornment: '¥'
                }}
                helperText="※新規登録時のみ入力可能"
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="メールアドレス"
                type="email"
                value={editForm.email}
                onChange={handleFormChange('email')}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="パスワード"
                type={showPassword ? 'text' : 'password'}
                value={editForm.password}
                onChange={handleFormChange('password')}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={handleTogglePasswordVisibility}
                        edge="end"
                        size="small"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                required
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleAddClose}>キャンセル</Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleAddSave}
            disabled={!editForm.name || !editForm.nameKana || !editForm.station || !editForm.tel || !editForm.email || !editForm.password}
          >
            追加
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 