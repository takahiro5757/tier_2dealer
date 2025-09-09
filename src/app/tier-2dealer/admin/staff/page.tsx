'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Box, Container, Typography, Paper, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Grid, Chip, IconButton, Alert, AppBar, Toolbar, MenuItem, Select, FormControl, InputLabel, InputAdornment,
  Avatar, Menu, Popover, Checkbox, ListItemText
} from '@mui/material';
import { 
  Edit, Delete, Add, ArrowBack, Person, Logout, CalendarToday, Visibility, VisibilityOff, 
  FilterList, ArrowDropDown, Close
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import AdminHeader from '../../../../components/AdminHeader';
import { useShiftStore } from '../../../../stores/shiftStore';
import { initialStaffMembers } from './initialStaffMembers';
import { StaffMember } from '@/types/staff';
import Switch from '@mui/material/Switch';
import Tooltip from '@mui/material/Tooltip';



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
    name: [] as string[],
    nameKana: [] as string[],
    station: [] as string[],
    role: [] as string[],
    month: '2025-01', // デフォルトを最新月に設定
    isActive: [] as string[]
  });

  // フィルター検索状態
  const [filterSearches, setFilterSearches] = useState({
    name: '',
    nameKana: '',
    station: '',
    role: '',
    isActive: ''
  });

  // パスワード表示状態
  const [showPassword, setShowPassword] = useState(false);

  // 画像クロップ関連の状態
  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [originalImage, setOriginalImage] = useState<string>('');
  const [crop, setCrop] = useState({ x: 0, y: 0, width: 200, height: 200 });
  const [zoom, setZoom] = useState(1);

  // 画像表示モーダル状態
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // フィルターポップアップの状態管理
  const [filterAnchorEls, setFilterAnchorEls] = useState<{[key: string]: HTMLElement | null}>({});
  
  // フィルターポップアップを開く
  const handleFilterClick = (column: string, event: React.MouseEvent<HTMLElement>) => {
    setFilterAnchorEls(prev => ({
      ...prev,
      [column]: event.currentTarget
    }));
  };

  // フィルターポップアップを閉じる
  const handleFilterClose = (column: string) => {
    setFilterAnchorEls(prev => ({
      ...prev,
      [column]: null
    }));
  };

  // 各列の一意値を取得
  const getUniqueValues = (field: keyof StaffMember): string[] => {
    const values = staffMembers.map(staff => {
      if (field === 'isActive') {
        return staff[field] ? '有効' : '無効';
      }
      return String(staff[field]);
    });
    const uniqueSet = new Set(values);
    return Array.from(uniqueSet).sort();
  };

  // フィルター検索の変更
  const handleFilterSearchChange = (column: string, value: string) => {
    setFilterSearches(prev => ({
      ...prev,
      [column]: value
    }));
  };

  // フィルター値の切り替え
  const handleFilterValueToggle = (column: string, value: string) => {
    setFilters(prev => {
      const currentValues = prev[column as keyof typeof prev] as string[];
      const newValues = currentValues.includes(value)
        ? currentValues.filter((v: string) => v !== value)
        : [...currentValues, value];
      
      return {
        ...prev,
        [column]: newValues
      };
    });
  };

  // 全て選択/解除
  const handleSelectAll = (column: string, allValues: string[]) => {
    const currentValues = filters[column as keyof typeof filters] as string[];
    const isAllSelected = allValues.every(value => currentValues.includes(value));
    
    setFilters(prev => ({
      ...prev,
      [column]: isAllSelected ? [] : allValues
    }));
  };

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
      name: [],
      nameKana: [],
      station: [],
      role: [],
      month: '2025-01',
      isActive: []
    });
    setFilterSearches({
      name: '',
      nameKana: '',
      station: '',
      role: '',
      isActive: ''
    });
  };

  // フィルター適用されたスタッフリスト
  const filteredStaffMembers = staffMembers.filter(staff => {
    // 有効フィルター
    if (filters.isActive.length > 0) {
      const activeStatus = staff.isActive ? '有効' : '無効';
      if (!filters.isActive.includes(activeStatus)) return false;
    }
    
    // 氏名フィルター
    if (filters.name.length > 0) {
      if (!filters.name.includes(staff.name)) return false;
    }
    
    // カナフィルター
    if (filters.nameKana.length > 0) {
      if (!filters.nameKana.includes(staff.nameKana)) return false;
    }
    
    // 最寄駅フィルター
    if (filters.station.length > 0) {
      if (!filters.station.includes(staff.station)) return false;
    }
    
    // 役職フィルター
    if (filters.role.length > 0) {
      if (!filters.role.includes(staff.role)) return false;
    }
    
    return true;
  });

  // パスワード表示切り替え
  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // 画像アップロード処理
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    console.log('Selected file:', {
      name: file.name,
      type: file.type,
      size: file.size,
      lastModified: file.lastModified
    });

    // ファイルサイズチェック（5MB制限に拡張）
    if (file.size > 5 * 1024 * 1024) {
      setMessage(`画像サイズが大きすぎます (${(file.size / 1024 / 1024).toFixed(1)}MB)。5MB以下にしてください。`);
      setTimeout(() => setMessage(''), 5000);
      return;
    }

    // ファイル形式チェック（より多くの形式に対応）
    if (!file.type.match(/^image\/(jpeg|jpg|png|gif|webp|bmp)$/i)) {
      setMessage(`サポートされていない画像形式です (${file.type || '不明'})。JPEG、PNG、GIF、WebP、BMP形式を選択してください。`);
      setTimeout(() => setMessage(''), 5000);
      return;
    }

    // ファイルが破損していないかチェック
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const base64 = e.target?.result as string;
        if (!base64 || !base64.startsWith('data:image/')) {
          setMessage('画像ファイルの読み込みに失敗しました。ファイルが破損している可能性があります。');
          setTimeout(() => setMessage(''), 5000);
          return;
        }
        
        setOriginalImage(base64);
        setCropDialogOpen(true);
        // 初期クロップ設定をリセット
        setCrop({ x: 0, y: 0, width: 200, height: 200 });
        setZoom(1);
      } catch (error) {
        console.error('Image processing error:', error);
        setMessage('画像の処理中にエラーが発生しました。別の画像を試してください。');
        setTimeout(() => setMessage(''), 5000);
      }
    };
    
    reader.onerror = () => {
      setMessage('画像ファイルの読み込みに失敗しました。ファイルを確認してください。');
      setTimeout(() => setMessage(''), 5000);
    };
    
    reader.readAsDataURL(file);
    
    // ファイル入力をリセット
    event.target.value = '';
  };

  // 画像削除処理
  const handleImageRemove = () => {
    setEditForm(prev => ({
      ...prev,
      profileImage: undefined
    }));
  };

  // 円形クロップの適用
  const applyCrop = useCallback(() => {
    if (!imageRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const image = imageRef.current;

    if (!ctx) return;

    // キャンバスサイズを設定（円形なので正方形）
    const size = 200;
    canvas.width = size;
    canvas.height = size;

    // 背景をクリア
    ctx.clearRect(0, 0, size, size);

    // 円形クリッピングパスを作成
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
    ctx.clip();

    // プレビュー領域のサイズ（300px）とCanvas出力サイズ（200px）の比率
    const previewSize = 300;
    const scale = size / previewSize;

    // プレビューでの画像サイズを計算
    const previewImageWidth = previewSize * zoom;
    const previewImageHeight = previewImageWidth * (image.naturalHeight / image.naturalWidth);

    // Canvas上での描画サイズ
    const canvasImageWidth = previewImageWidth * scale;
    const canvasImageHeight = previewImageHeight * scale;

    // プレビューでの位置をCanvas座標系に変換
    // プレビューの中心（150, 150）を基準とした相対位置
    const previewCenterX = previewSize / 2;
    const previewCenterY = previewSize / 2;
    
    // 画像の左上角の位置（プレビュー座標系）
    const previewImageX = previewCenterX - previewImageWidth / 2 + crop.x;
    const previewImageY = previewCenterY - previewImageHeight / 2 + crop.y;

    // Canvas座標系に変換
    const canvasImageX = previewImageX * scale;
    const canvasImageY = previewImageY * scale;

    // 画像を描画
    ctx.drawImage(
      image, 
      canvasImageX, 
      canvasImageY, 
      canvasImageWidth, 
      canvasImageHeight
    );

    // Base64として取得
    const croppedImageBase64 = canvas.toDataURL('image/png');
    
    // フォームに設定
    setEditForm(prev => ({
      ...prev,
      profileImage: croppedImageBase64
    }));

    // ダイアログを閉じる
    setCropDialogOpen(false);
  }, [crop, zoom]);

  // クロップダイアログを閉じる
  const handleCropCancel = () => {
    setCropDialogOpen(false);
    setOriginalImage('');
  };

  // 画像モーダルを開く
  const handleImageModalOpen = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setImageModalOpen(true);
  };

  // 画像モーダルを閉じる
  const handleImageModalClose = () => {
    setImageModalOpen(false);
    setSelectedImage('');
  };

  // editFormの初期値を共通化
  const emptyStaffMember: StaffMember = {
    id: '',
    name: '',
    nameKana: '',
    gender: '男性',
    station: '',
    weekdayRate: 15000,
    holidayRate: 18000,
    tel: '',
    role: 'クローザー',
    company: '株式会社Festal',
    email: '',
    password: '',
    lineId: '',
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
    setEditForm(prev => ({
      ...prev,
      [field]: field === 'weekdayRate' || field === 'holidayRate' ? Number(value) || 0 : value
    }));
  };

  // スタッフ追加ダイアログを開く
  const handleAddOpen = () => {
    setEditForm({
      ...emptyStaffMember,
      id: `staff${String(Date.now()).slice(-3)}`,
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
    setEditForm(emptyStaffMember);
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
    setEditForm(emptyStaffMember);
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
          <Grid container spacing={3} alignItems="center" sx={{ mb: 3 }}>
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
                variant="outlined"
                onClick={handleResetFilters}
                sx={{ mr: 2, minWidth: 120 }}
              >
                フィルターリセット
              </Button>
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
            <Table sx={{ 
              minWidth: 1200,
              tableLayout: 'fixed',
              width: '100%'
            }}>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell sx={{ 
                    fontWeight: 'bold', 
                    textAlign: 'center', 
                    width: '5%',
                    position: 'relative'
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Tooltip title="有効にするとシフト管理画面に表示されます。無効にすると非表示になります。" arrow>
                        <span>有効</span>
                      </Tooltip>
                      <IconButton
                        size="small"
                        onClick={(e) => handleFilterClick('isActive', e)}
                        sx={{ ml: 0.5 }}
                      >
                        <ArrowDropDown fontSize="small" />
                      </IconButton>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ 
                    fontWeight: 'bold', 
                    textAlign: 'left',
                    width: '18%'
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
                      氏名
                      <IconButton
                        size="small"
                        onClick={(e) => handleFilterClick('name', e)}
                        sx={{ ml: 0.5 }}
                      >
                        <ArrowDropDown fontSize="small" />
                      </IconButton>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ 
                    fontWeight: 'bold', 
                    textAlign: 'left',
                    width: '14%'
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
                      カナ
                      <IconButton
                        size="small"
                        onClick={(e) => handleFilterClick('nameKana', e)}
                        sx={{ ml: 0.5 }}
                      >
                        <ArrowDropDown fontSize="small" />
                      </IconButton>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ 
                    fontWeight: 'bold', 
                    textAlign: 'left',
                    width: '12%'
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
                      最寄駅
                      <IconButton
                        size="small"
                        onClick={(e) => handleFilterClick('station', e)}
                        sx={{ ml: 0.5 }}
                      >
                        <ArrowDropDown fontSize="small" />
                      </IconButton>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ 
                    fontWeight: 'bold', 
                    textAlign: 'center',
                    width: '10%'
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      役職
                      <IconButton
                        size="small"
                        onClick={(e) => handleFilterClick('role', e)}
                        sx={{ ml: 0.5 }}
                      >
                        <ArrowDropDown fontSize="small" />
                      </IconButton>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ 
                    fontWeight: 'bold', 
                    textAlign: 'right',
                    width: '10%'
                  }}>
                    平日単価
                  </TableCell>
                  <TableCell sx={{ 
                    fontWeight: 'bold', 
                    textAlign: 'right',
                    width: '10%'
                  }}>
                    土日単価
                  </TableCell>
                  <TableCell sx={{ 
                    fontWeight: 'bold', 
                    textAlign: 'left',
                    width: '13%'
                  }}>
                    電話番号
                  </TableCell>

                  <TableCell sx={{ 
                    fontWeight: 'bold', 
                    textAlign: 'center',
                    width: '8%'
                  }}>
                    操作
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredStaffMembers.map((staff) => (
                  <TableRow key={staff.id} hover>
                    <TableCell sx={{ 
                      textAlign: 'center', 
                      width: '5%'
                    }}>
                      <Switch
                        checked={staff.isActive}
                        onChange={() => handleActiveToggle(staff.id)}
                        color="primary"
                        inputProps={{ 'aria-label': '有効/無効切り替え' }}
                      />
                    </TableCell>
                    <TableCell sx={{ 
                      width: '18%',
                      textAlign: 'left'
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar
                          src={staff.profileImage}
                          sx={{ 
                            width: 64, 
                            height: 64,
                            cursor: staff.profileImage ? 'pointer' : 'default',
                            '&:hover': staff.profileImage ? {
                              opacity: 0.8,
                              transform: 'scale(1.05)'
                            } : {}
                          }}
                          onClick={() => staff.profileImage && handleImageModalOpen(staff.profileImage)}
                        >
                          {!staff.profileImage && <Person />}
                        </Avatar>
                        <Typography variant="body2">
                          {staff.name}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ 
                      width: '14%',
                      textAlign: 'left'
                    }}>{staff.nameKana}</TableCell>
                    <TableCell sx={{ 
                      width: '12%',
                      textAlign: 'left'
                    }}>{staff.station}</TableCell>
                    <TableCell sx={{ 
                      textAlign: 'center',
                      width: '10%'
                    }}>
                      <Chip 
                        label={staff.role}
                        color={staff.role === 'クローザー' ? 'primary' : 'secondary'}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell sx={{ 
                      textAlign: 'right',
                      width: '10%'
                    }}>¥{staff.weekdayRate.toLocaleString()}</TableCell>
                    <TableCell sx={{ 
                      textAlign: 'right',
                      width: '10%'
                    }}>¥{staff.holidayRate.toLocaleString()}</TableCell>
                    <TableCell sx={{ 
                      width: '13%',
                      textAlign: 'left'
                    }}>{staff.tel}</TableCell>
                    <TableCell sx={{ 
                      textAlign: 'center',
                      width: '8%'
                    }}>
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

        {/* Excel風フィルターポップアップ */}
        {['isActive', 'name', 'nameKana', 'station', 'role'].map((column) => {
          const fieldMap = {
            isActive: 'isActive' as keyof StaffMember,
            name: 'name' as keyof StaffMember,
            nameKana: 'nameKana' as keyof StaffMember,
            station: 'station' as keyof StaffMember,
            role: 'role' as keyof StaffMember
          };
          
          const uniqueValues = getUniqueValues(fieldMap[column as keyof typeof fieldMap]);
          const searchValue = filterSearches[column as keyof typeof filterSearches];
          const filteredValues = uniqueValues.filter(value => 
            value.toLowerCase().includes(searchValue.toLowerCase())
          );
          const currentFilters = filters[column as keyof typeof filters] as string[];
          const isAllSelected = filteredValues.every(value => currentFilters.includes(value));

          return (
            <Popover
              key={column}
              anchorEl={filterAnchorEls[column]}
              open={Boolean(filterAnchorEls[column])}
              onClose={() => handleFilterClose(column)}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              PaperProps={{
                sx: { minWidth: 280, maxHeight: 400 }
              }}
            >
              <Box sx={{ p: 2 }}>
                {/* ヘッダー */}
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                  {column === 'isActive' ? '有効でフィルター' :
                   column === 'name' ? '氏名でフィルター' :
                   column === 'nameKana' ? 'カナでフィルター' :
                   column === 'station' ? '最寄駅でフィルター' :
                   column === 'role' ? '役職でフィルター' : ''}
                </Typography>

                {/* 選択数表示 */}
                <Typography variant="caption" color="primary" sx={{ mb: 2, display: 'block' }}>
                  {currentFilters.length}件選択
                </Typography>

                {/* 検索ボックス */}
                <TextField
                  size="small"
                  placeholder="検索..."
                  value={searchValue}
                  onChange={(e) => handleFilterSearchChange(column, e.target.value)}
                  fullWidth
                  sx={{ mb: 2 }}
                  InputProps={{
                    startAdornment: <Box sx={{ mr: 1 }}>🔍</Box>
                  }}
                />

                {/* 全て選択チェックボックス */}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, pb: 1, borderBottom: '1px solid #e0e0e0' }}>
                  <Checkbox
                    checked={isAllSelected && filteredValues.length > 0}
                    indeterminate={currentFilters.length > 0 && !isAllSelected}
                    onChange={() => handleSelectAll(column, filteredValues)}
                    size="small"
                  />
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    全て選択
                  </Typography>
                </Box>

                {/* 値一覧 */}
                <Box sx={{ maxHeight: 200, overflowY: 'auto' }}>
                  {filteredValues.map((value) => (
                    <Box key={value} sx={{ display: 'flex', alignItems: 'center', py: 0.5 }}>
                      <Checkbox
                        checked={currentFilters.includes(value)}
                        onChange={() => handleFilterValueToggle(column, value)}
                        size="small"
                      />
                      <ListItemText
                        primary={value}
                        primaryTypographyProps={{ variant: 'body2' }}
                      />
                    </Box>
                  ))}
                </Box>

                {/* ボタン */}
                <Box sx={{ display: 'flex', gap: 1, mt: 2, pt: 2, borderTop: '1px solid #e0e0e0' }}>
                  <Button
                    size="small"
                    onClick={() => {
                      setFilters(prev => ({ ...prev, [column]: [] }));
                      setFilterSearches(prev => ({ ...prev, [column]: '' }));
                    }}
                    sx={{ flex: 1 }}
                  >
                    ✕ クリア
                  </Button>
                  <Button
                    size="small"
                    variant="contained"
                    onClick={() => handleFilterClose(column)}
                    sx={{ flex: 1 }}
                  >
                    適用
                  </Button>
                </Box>
              </Box>
            </Popover>
          );
        })}


      </Container>

      {/* 編集ダイアログ */}
      <Dialog open={editDialogOpen} onClose={handleEditClose} maxWidth="md" fullWidth>
        <DialogTitle>スタッフ情報編集</DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            {/* 顔写真アップロードセクション */}
            <Grid item xs={12}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  顔写真
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar
                    src={editForm.profileImage}
                    sx={{ width: 64, height: 64 }}
                  >
                    {!editForm.profileImage && <Person />}
                  </Avatar>
                  <Box>
                    <input
                      accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,image/bmp"
                      style={{ display: 'none' }}
                      id="profile-image-upload-edit"
                      type="file"
                      onChange={handleImageUpload}
                    />
                    <label htmlFor="profile-image-upload-edit">
                      <Button
                        variant="outlined"
                        component="span"
                        size="small"
                        sx={{ mr: 1 }}
                      >
                        画像選択
                      </Button>
                    </label>
                    {editForm.profileImage && (
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        onClick={handleImageRemove}
                      >
                        削除
                      </Button>
                    )}
                    <Typography variant="caption" display="block" sx={{ mt: 1, color: 'text.secondary' }}>
                      JPEG・PNG・GIF・WebP・BMP形式、5MB以下
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Grid>
            
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
              <FormControl fullWidth>
                <InputLabel>性別</InputLabel>
                <Select
                  value={editForm.gender}
                  onChange={handleFormChange('gender')}
                  label="性別"
                  required
                >
                  <MenuItem value="男性">男性</MenuItem>
                  <MenuItem value="女性">女性</MenuItem>
                </Select>
              </FormControl>
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

            {/* 連絡先情報 */}
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
                label="LINE ID"
                value={editForm.lineId}
                onChange={handleFormChange('lineId')}
                helperText="API連携での通知送信に使用されます"
              />
            </Grid>

            {/* 勤務関連情報 */}
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

            {/* 単価情報 */}
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

            {/* アカウント情報 */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="初期パスワード"
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
                helperText="※スタッフが初回ログイン後に変更することを推奨します"
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
            {/* 顔写真アップロードセクション */}
            <Grid item xs={12}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  顔写真
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar
                    src={editForm.profileImage}
                    sx={{ width: 64, height: 64 }}
                  >
                    {!editForm.profileImage && <Person />}
                  </Avatar>
                  <Box>
                    <input
                      accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,image/bmp"
                      style={{ display: 'none' }}
                      id="profile-image-upload-add"
                      type="file"
                      onChange={handleImageUpload}
                    />
                    <label htmlFor="profile-image-upload-add">
                      <Button
                        variant="outlined"
                        component="span"
                        size="small"
                        sx={{ mr: 1 }}
                      >
                        画像選択
                      </Button>
                    </label>
                    {editForm.profileImage && (
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        onClick={handleImageRemove}
                      >
                        削除
                      </Button>
                    )}
                    <Typography variant="caption" display="block" sx={{ mt: 1, color: 'text.secondary' }}>
                      JPEG・PNG・GIF・WebP・BMP形式、5MB以下
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Grid>
            
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
              <FormControl fullWidth>
                <InputLabel>性別</InputLabel>
                <Select
                  value={editForm.gender}
                  onChange={handleFormChange('gender')}
                  label="性別"
                  required
                >
                  <MenuItem value="男性">男性</MenuItem>
                  <MenuItem value="女性">女性</MenuItem>
                </Select>
              </FormControl>
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

            {/* 連絡先情報 */}
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
                label="LINE ID"
                value={editForm.lineId}
                onChange={handleFormChange('lineId')}
                helperText="API連携での通知送信に使用されます"
              />
            </Grid>

            {/* 勤務関連情報 */}
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
            {/* 単価情報 */}
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

            {/* アカウント情報 */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="初期パスワード"
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
                helperText="※スタッフが初回ログイン後に変更することを推奨します"
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

      {/* 画像クロップダイアログ */}
      <Dialog open={cropDialogOpen} onClose={handleCropCancel} maxWidth="sm" fullWidth>
        <DialogTitle>画像を調整</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 2 }}>
            {originalImage && (
              <>
                {/* プレビュー用の円形エリア */}
                <Box 
                  onWheel={(e) => {
                    e.preventDefault();
                    const delta = e.deltaY > 0 ? -0.1 : 0.1;
                    setZoom(prev => Math.max(0.5, Math.min(3, prev + delta)));
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    const startX = e.clientX;
                    const startY = e.clientY;
                    const initialCropX = crop.x;
                    const initialCropY = crop.y;
                    
                    const handleMouseMove = (e: MouseEvent) => {
                      const deltaX = e.clientX - startX;
                      const deltaY = e.clientY - startY;
                      
                      setCrop(prev => ({
                        ...prev,
                        x: initialCropX + deltaX,
                        y: initialCropY + deltaY
                      }));
                    };
                    
                    const handleMouseUp = () => {
                      document.removeEventListener('mousemove', handleMouseMove);
                      document.removeEventListener('mouseup', handleMouseUp);
                    };
                    
                    document.addEventListener('mousemove', handleMouseMove);
                    document.addEventListener('mouseup', handleMouseUp);
                  }}
                  onTouchStart={(e) => {
                    if (e.touches.length === 2) {
                      e.preventDefault();
                      const touch1 = e.touches[0];
                      const touch2 = e.touches[1];
                      const distance = Math.sqrt(
                        Math.pow(touch2.clientX - touch1.clientX, 2) +
                        Math.pow(touch2.clientY - touch1.clientY, 2)
                      );
                      // 初期距離を記録
                      (e.currentTarget as any).initialDistance = distance;
                      (e.currentTarget as any).initialZoom = zoom;
                    }
                  }}
                  onTouchMove={(e) => {
                    if (e.touches.length === 2) {
                      e.preventDefault();
                      const touch1 = e.touches[0];
                      const touch2 = e.touches[1];
                      const distance = Math.sqrt(
                        Math.pow(touch2.clientX - touch1.clientX, 2) +
                        Math.pow(touch2.clientY - touch1.clientY, 2)
                      );
                      const initialDistance = (e.currentTarget as any).initialDistance;
                      const initialZoom = (e.currentTarget as any).initialZoom;
                      
                      if (initialDistance) {
                        const scale = distance / initialDistance;
                        const newZoom = initialZoom * scale;
                        setZoom(Math.max(0.5, Math.min(3, newZoom)));
                      }
                    }
                  }}
                  sx={{ 
                    position: 'relative', 
                    width: 300, 
                    height: 300, 
                    border: '2px dashed #ccc',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    mb: 3,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    touchAction: 'none', // タッチジェスチャーを有効にする
                    cursor: 'move'
                  }}
                >
                  <img
                    ref={imageRef}
                    src={originalImage}
                    alt="Crop preview"
                    style={{
                      width: `${300 * zoom}px`,
                      height: 'auto',
                      transform: `translate(${crop.x}px, ${crop.y}px)`,
                      cursor: 'move',
                      userSelect: 'none',
                      pointerEvents: 'none'
                    }}

                    draggable={false}
                  />
                </Box>

                {/* ズーム表示 */}
                <Box sx={{ width: '100%', mb: 2, textAlign: 'center' }}>
                  <Typography variant="body2" color="primary">
                    ズーム: {Math.round(zoom * 100)}%
                  </Typography>
                </Box>

                {/* 操作説明 */}
                <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center', lineHeight: 1.5 }}>
                  画像をドラッグして位置を調整<br/>
                  マウスホイールまたは2本指ジェスチャーでサイズを調整してください
                </Typography>

                {/* 隠しキャンバス */}
                <canvas ref={canvasRef} style={{ display: 'none' }} />
              </>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCropCancel}>キャンセル</Button>
          <Button variant="contained" onClick={applyCrop} color="primary">
            適用
          </Button>
        </DialogActions>
      </Dialog>

      {/* 画像表示モーダル */}
      <Dialog
        open={imageModalOpen}
        onClose={handleImageModalClose}
        maxWidth={false}
        PaperProps={{
          sx: {
            backgroundColor: 'transparent',
            boxShadow: 'none',
            overflow: 'visible'
          }
        }}
        BackdropProps={{
          sx: {
            backgroundColor: 'rgba(0, 0, 0, 0.5)'
          }
        }}
      >
        <Box sx={{ 
          position: 'relative',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          p: 0
        }}>
          <Avatar
            src={selectedImage}
            sx={{ 
              width: 300, 
              height: 300,
              border: '3px solid white',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
            }}
          />
          <IconButton
            onClick={handleImageModalClose}
            sx={{
              position: 'absolute',
              top: -15,
              right: -15,
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              border: '2px solid #ddd',
              width: 32,
              height: 32,
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 1)',
                transform: 'scale(1.1)'
              }
            }}
          >
            <Close fontSize="small" />
          </IconButton>
        </Box>
      </Dialog>
    </Box>
  );
} 