import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Typography,
  Divider,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  InputAdornment,
  FormControlLabel,
  Switch,
  Badge,
  Chip,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import PersonIcon from '@mui/icons-material/Person';
import WomanIcon from '@mui/icons-material/Woman';
import GroupIcon from '@mui/icons-material/Group';
import PlaceIcon from '@mui/icons-material/Place';
import RoomIcon from '@mui/icons-material/Room';
import Drawer from '@mui/material/Drawer';
import DeleteIcon from '@mui/icons-material/Delete';

// プロジェクトの型定義
export interface Project {
  id: number;
  agencyName: string;
  storeName: string;
  coStores: string[]; // 連名店舗の配列
  venue: string;
  eventDate: string;
  unitPrice: number;
  days: number;
  addAmount: number;
  subAmount: number;
  status: string;
  revenue: number;
  // 追加プロパティ
  closerCount: number;
  girlCount: number;
  freeEntryCount: number;
  hasPlaceReservation: boolean;
  isMonthlyPayment: boolean; // 月払いフラグを追加
  transportationTaxFree: boolean; // 交通費非課税フラグを追加
  accountingMemo?: string; // 経理メモを追加
}

// ステータスの定義
const STATUS_OPTIONS = [
  { value: 'draft', label: '起票' },
  { value: 'quote_ready', label: '見積送付前' },
  { value: 'quote_sent', label: '見積送付済' },
  { value: 'quote_revision', label: '見積修正中' },
  { value: 'quote_revised', label: '見積修正済' },
  { value: 'on_hold', label: '保留' },
  { value: 'invoice_ready', label: '請求送付前' },
  { value: 'invoice_revision', label: '請求書修正中' },
  { value: 'invoice_revised', label: '請求書修正済' },
  { value: 'invoice_sent', label: '請求送付済' },
  { value: 'rejected', label: 'お断り' }
];

// 分割データの型定義
interface SplitAllocation {
  closerCount: number;
  girlCount: number;
  agencyName: string;
  storeName: string;
  coStores: string[];
}

interface ProjectDetailModalProps {
  open: boolean;
  project: Project | null;
  onClose: () => void;
  onSave: (project: Project) => void;
  onSplitCreate?: (newProjects: Project[]) => void; // 分割で作成された新案件のコールバック
}

const ProjectDetailModal: React.FC<ProjectDetailModalProps> = ({
  open,
  project,
  onClose,
  onSave,
  onSplitCreate
}) => {
  const [isEditing, setIsEditing] = React.useState(false);
  const [editedProject, setEditedProject] = React.useState<Project | null>(null);
  const [newCoStore, setNewCoStore] = React.useState('');
  const [deductions, setDeductions] = React.useState<{ name: string; amount: number }[]>([]);
  
  // 案件分割関連の状態
  const [splitMode, setSplitMode] = React.useState(false);
  const [splitCount, setSplitCount] = React.useState(2);
  const [allocations, setAllocations] = React.useState<SplitAllocation[]>([]);

  // 代理店リストと利用可能店舗リスト
  const agencyList = ['株式会社ABC代理店', 'DEF広告株式会社', 'GHIプロモーション', '株式会社XYZ商事', 'LMNマーケティング'];
  const availableStores = ['新宿店', '渋谷店', '池袋店', '銀座店', '浦和店', '大宮店', '横浜店', '川崎店', '千葉店', '船橋店'];

  // モーダルが開いたときに編集用の状態を初期化
  React.useEffect(() => {
    if (project) {
      setEditedProject({ ...project });
      setNewCoStore('');
    }
  }, [project]);

  // 編集モードの切り替え
  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  // フィールド値の変更ハンドラー
  const handleFieldChange = (field: keyof Project, value: any) => {
    if (editedProject) {
      const updatedProject = { ...editedProject, [field]: value };
      
      // 収益を再計算する（unitPrice × days + addAmount - subAmount）
      if (['unitPrice', 'days', 'addAmount', 'subAmount'].includes(field)) {
        const { unitPrice, days, addAmount, subAmount } = updatedProject;
        updatedProject.revenue = (unitPrice * days) + addAmount - subAmount;
      }
      
      setEditedProject(updatedProject);
    }
  };

  // 連名店舗を追加するハンドラー
  const handleAddCoStore = () => {
    if (editedProject && newCoStore.trim() !== '') {
      const updatedCoStores = [...editedProject.coStores, newCoStore.trim()];
      handleFieldChange('coStores', updatedCoStores);
      setNewCoStore('');
    }
  };

  // 連名店舗を削除するハンドラー
  const handleRemoveCoStore = (index: number) => {
    if (editedProject) {
      const updatedCoStores = [...editedProject.coStores];
      updatedCoStores.splice(index, 1);
      handleFieldChange('coStores', updatedCoStores);
    }
  };

  // 減算項目リストの状態
  const handleAddDeduction = () => {
    setDeductions([...deductions, { name: '', amount: 0 }]);
  };
  // 項目削除
  const handleRemoveDeduction = (idx: number) => {
    setDeductions(deductions.filter((_, i) => i !== idx));
  };
  // 項目編集
  const handleDeductionChange = (idx: number, field: 'name' | 'amount', value: string | number) => {
    setDeductions(deductions.map((d, i) => i === idx ? { ...d, [field]: value } : d));
  };

  // 分割数の変更
  const handleSplitCountChange = (count: number) => {
    setSplitCount(count);
    // 新案件数 = 分割数 - 1 (元案件を含むため)
    const newProjectCount = count - 1;
    const newAllocations = Array.from({ length: newProjectCount }, (_, index) => 
      allocations[index] || { 
        closerCount: 0, 
        girlCount: 0,
        agencyName: editedProject?.agencyName || '',
        storeName: editedProject?.storeName || '',
        coStores: [...(editedProject?.coStores || [])]
      }
    );
    setAllocations(newAllocations);
  };

  // 分割モードの切り替え
  const handleSplitToggle = () => {
    if (!splitMode) {
      // 分割モード開始時の初期化
      const newProjectCount = splitCount - 1; // 元案件を含むため-1
      const initialAllocations = Array.from({ length: newProjectCount }, () => ({
        closerCount: 0,
        girlCount: 0,
        agencyName: editedProject?.agencyName || '',
        storeName: editedProject?.storeName || '',
        coStores: [...(editedProject?.coStores || [])]
      }));
      setAllocations(initialAllocations);
    }
    setSplitMode(!splitMode);
  };

  // 分割配分の変更
  const handleAllocationChange = (index: number, field: keyof SplitAllocation, value: any) => {
    const newAllocations = [...allocations];
    if (field === 'closerCount' || field === 'girlCount') {
      newAllocations[index] = { ...newAllocations[index], [field]: Math.max(0, value) };
    } else {
      newAllocations[index] = { ...newAllocations[index], [field]: value };
    }
    setAllocations(newAllocations);
  };

  // 連名店舗の追加
  const handleAddCoStoreToSplit = (index: number, storeName: string) => {
    if (storeName.trim() === '') return;
    const newAllocations = [...allocations];
    const updatedCoStores = [...newAllocations[index].coStores, storeName.trim()];
    newAllocations[index] = { ...newAllocations[index], coStores: updatedCoStores };
    setAllocations(newAllocations);
  };

  // 連名店舗の削除
  const handleRemoveCoStoreFromSplit = (allocationIndex: number, storeIndex: number) => {
    const newAllocations = [...allocations];
    const updatedCoStores = [...newAllocations[allocationIndex].coStores];
    updatedCoStores.splice(storeIndex, 1);
    newAllocations[allocationIndex] = { ...newAllocations[allocationIndex], coStores: updatedCoStores };
    setAllocations(newAllocations);
  };

  // 残り人員の計算
  const getRemainingPersonnel = () => {
    if (!editedProject) return { closerCount: 0, girlCount: 0 };
    
    const totalAllocatedClosers = allocations.reduce((sum, allocation) => sum + allocation.closerCount, 0);
    const totalAllocatedGirls = allocations.reduce((sum, allocation) => sum + allocation.girlCount, 0);
    
    return {
      closerCount: editedProject.closerCount - totalAllocatedClosers,
      girlCount: editedProject.girlCount - totalAllocatedGirls
    };
  };

  // 分割の妥当性チェック
  const isSplitValid = () => {
    const remaining = getRemainingPersonnel();
    const hasValidAllocations = allocations.some(allocation => 
      allocation.closerCount > 0 || allocation.girlCount > 0
    );
    
    return remaining.closerCount >= 0 && 
           remaining.girlCount >= 0 && 
           hasValidAllocations;
  };

  // 分割実行
  const handleExecuteSplit = () => {
    if (!editedProject || !isSplitValid()) return;

    const remaining = getRemainingPersonnel();
    
    // 元案件の更新
    const updatedOriginalProject = {
      ...editedProject,
      closerCount: remaining.closerCount,
      girlCount: remaining.girlCount,
      revenue: calculateRevenue(remaining.closerCount, remaining.girlCount, editedProject.days, editedProject.addAmount, editedProject.subAmount)
    };

    // 新案件の作成
    const newProjects = allocations
      .filter(allocation => allocation.closerCount > 0 || allocation.girlCount > 0)
      .map((allocation, index) => ({
        ...editedProject,
        id: Date.now() + index, // 一時的なID（実際のアプリではサーバーで生成）
        agencyName: allocation.agencyName,
        storeName: allocation.storeName,
        coStores: allocation.coStores,
        closerCount: allocation.closerCount,
        girlCount: allocation.girlCount,
        freeEntryCount: 0,
        revenue: calculateRevenue(allocation.closerCount, allocation.girlCount, editedProject.days, editedProject.addAmount, editedProject.subAmount),
        status: 'draft'
      }));

    // 分割実行のコールバック
    onSave(updatedOriginalProject);
    
    // 新案件作成のコールバック（親コンポーネントで処理）
    if (onSplitCreate) {
      onSplitCreate(newProjects);
    }

    // 分割モードを終了
    setSplitMode(false);
    setAllocations([]);
  };

  // 収益計算ロジック
  const calculateRevenue = (closers: number, girls: number, days: number, addAmount: number, subAmount: number) => {
    const closerTotal = closers * 18000 * days;
    const girlTotal = girls * 9000 * days;
    const transportationTotal = (closers * 4000 + girls * 2500) * days;
    return closerTotal + girlTotal + transportationTotal + addAmount - subAmount;
  };

  // 保存ボタンのハンドラー
  const handleSave = () => {
    if (editedProject) {
      onSave(editedProject);
      setIsEditing(false);
    }
  };

  // キャンセルボタンのハンドラー
  const handleCancel = () => {
    if (project) {
      setEditedProject({ ...project });
      setIsEditing(false);
    }
  };

  // 案件管理側のメモ（ダミー）
  const assignMemo = '';

  if (!project || !editedProject) {
    return null;
  }

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { width: 900, maxWidth: '100vw', borderRadius: '16px 0 0 16px' } }}
    >
      <Box sx={{ p: 0, height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* ステータスプルダウン＋アイコンボタン（最上部・横並び） */}
        <Box sx={{ px: 3, pt: 3, pb: 1, display: 'flex', alignItems: 'center', gap: 2, justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 10, bgcolor: 'background.paper' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel>ステータス</InputLabel>
              <Select
                value={editedProject.status}
                onChange={(e) => handleFieldChange('status', e.target.value)}
                label="ステータス"
                disabled={false}
              >
                {STATUS_OPTIONS.map(option => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControlLabel
              control={
                <Switch
                  checked={editedProject.isMonthlyPayment}
                  onChange={(e) => handleFieldChange('isMonthlyPayment', e.target.checked)}
                  color="primary"
                />
              }
              label="月払い"
              sx={{ ml: 1 }}
            />
          </Box>
          <Box>
            <IconButton onClick={handleEditToggle} color={isEditing ? 'primary' : 'default'} sx={{ mr: 1 }}>
              <EditIcon />
            </IconButton>
            <IconButton onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>
        <Divider />
        {/* 開催日程・代理店名ラベル */}
        <Box sx={{ px: 3, pt: 1, pb: 0 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 400, fontSize: '1.2rem', mb: 0.5 }}>
            {formatEventDate(editedProject.eventDate, editedProject.days)}
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 'normal', mb: 1 }}>
            {editedProject.agencyName}
            </Typography>
        </Box>
        {/* 開催店舗・連名店舗ラベル＋バッジ */}
        <Box sx={{ px: 3, pt: 1, pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Typography sx={{ width: 80, fontWeight: 500 }}>開催店舗</Typography>
            <Box sx={{ bgcolor: '#bcd3f7', color: '#222', px: 2, py: 0.5, borderRadius: 1, fontWeight: 'bold', fontSize: '1.1rem', mr: 1 }}>
              {editedProject.storeName}
            </Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography sx={{ width: 80, fontWeight: 500 }}>連名店舗</Typography>
            <Box sx={{ display: 'flex', gap: 1, mr: 1 }}>
              {editedProject.coStores.map((store, idx) => (
                <Box key={idx} sx={{ bgcolor: '#e0e0e0', color: '#222', px: 2, py: 0.5, borderRadius: 1, fontWeight: 500, fontSize: '1.05rem' }}>
                  {store}
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
        {/* 開催場所ラベル＋開催場所名 */}
        <Box sx={{ px: 3, pt: 1, pb: 1 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 400, fontSize: '1.1rem', mb: 0.5 }}>
            開催場所
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 'normal', mb: 1 }}>
            {editedProject.venue}
          </Typography>
        </Box>
        {/* 役割ごとの要員数・単価・交通費・小計・合計テーブル */}
        <Box sx={{ px: 3, pt: 1, pb: 2 }}>
          <Table size="small" sx={{ minWidth: 480, borderCollapse: 'separate', borderSpacing: 0 }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold', fontSize: '1.15rem' }}>役割</TableCell>
                <TableCell sx={{ fontWeight: 'bold', fontSize: '1.15rem' }}>人数</TableCell>
                <TableCell sx={{ fontWeight: 'bold', fontSize: '1.15rem' }}>日数</TableCell>
                <TableCell sx={{ fontWeight: 'bold', fontSize: '1.15rem' }}>単価</TableCell>
                <TableCell sx={{ fontWeight: 'bold', fontSize: '1.15rem' }}>交通費</TableCell>
                <TableCell sx={{ fontWeight: 'bold', fontSize: '1.15rem' }}>小計</TableCell>
                <TableCell sx={{ fontWeight: 'bold', fontSize: '1.15rem' }}>合計</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {/* クローザー */}
              <TableRow sx={{ height: 72 }}>
                <TableCell sx={{ color: '#1565c0', fontWeight: 'bold', fontSize: '1.15rem' }}>クローザー</TableCell>
                <TableCell sx={{ fontSize: '1.15rem' }}>{editedProject.closerCount}名</TableCell>
                <TableCell sx={{ fontSize: '1.15rem' }}>{editedProject.days}日</TableCell>
                <TableCell sx={{ fontSize: '1.15rem' }}>¥18,000</TableCell>
                <TableCell sx={{ fontSize: '1.15rem' }}>¥4,000</TableCell>
                <TableCell sx={{ color: '#1565c0', fontWeight: 'bold', fontSize: '1.15rem' }}>¥44,000</TableCell>
                <TableCell rowSpan={2} sx={{ color: '#1565c0', fontWeight: 'bold', fontSize: '1.3rem', borderLeft: '2px solid #e0e0e0', textAlign: 'center', verticalAlign: 'middle' }}>¥67,000</TableCell>
              </TableRow>
              {/* ガール */}
              <TableRow sx={{ height: 72 }}>
                <TableCell sx={{ color: '#e91e63', fontWeight: 'bold', fontSize: '1.15rem' }}>ガール</TableCell>
                <TableCell sx={{ fontSize: '1.15rem' }}>{editedProject.girlCount}名</TableCell>
                <TableCell sx={{ fontSize: '1.15rem' }}>{editedProject.days}日</TableCell>
                <TableCell sx={{ fontSize: '1.15rem' }}>¥9,000</TableCell>
                <TableCell sx={{ fontSize: '1.15rem' }}>¥2,500</TableCell>
                <TableCell sx={{ color: '#e91e63', fontWeight: 'bold', fontSize: '1.15rem' }}>¥23,000</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Box>
        {/* 交通費ページ分けチェックボックス */}
        <Box sx={{ px: 3, pb: 1, display: 'flex', alignItems: 'center', gap: 3 }}>
          <FormControlLabel
            control={<Switch color="primary" />}
            label="交通費ページ分け"
          />
          <FormControlLabel
            control={
              <Switch 
                color="primary" 
                checked={editedProject.transportationTaxFree || false}
                onChange={(e) => handleFieldChange('transportationTaxFree', e.target.checked)}
                disabled={!isEditing}
              />
            }
            label="交通費非課税"
          />
          <Button 
            variant="contained" 
            onClick={handleSplitToggle}
            startIcon={splitMode ? <CloseIcon /> : undefined}
            color={splitMode ? "secondary" : "primary"}
            disabled={!isEditing}
            size="small"
            sx={{ ml: 2, minWidth: 100, px: 2 }}
          >
            {splitMode ? "キャンセル" : "案件分割"}
          </Button>
        </Box>
        {/* 案件分割エディタ */}
        {splitMode && (
          <Box sx={{ px: 3, pb: 2 }}>
            <Box sx={{ border: '1px solid #e0e0e0', borderRadius: 2, p: 2, bgcolor: '#fafafa' }}>
              {/* 分割数選択 */}
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>分割数を選択</Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  {[2, 3, 4].map(count => (
                    <Button
                      key={count}
                      variant={splitCount === count ? "contained" : "outlined"}
                      size="small"
                      onClick={() => handleSplitCountChange(count)}
                      sx={{ minWidth: 60 }}
                    >
                      {count}分割
                    </Button>
                  ))}
                </Box>
              </Box>

              {/* 人員配分テーブル */}
              <TableContainer sx={{ bgcolor: 'white', borderRadius: 1 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>代理店</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>開催店舗</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>連名店舗</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>クローザー</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>ガール</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {/* 元案件（残り） */}
                    <TableRow sx={{ bgcolor: '#e3f2fd' }}>
                      <TableCell sx={{ fontWeight: 'bold' }}>{editedProject.agencyName}</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>{editedProject.storeName}</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>
                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                          {editedProject.coStores.map((store, idx) => (
                            <Chip key={idx} label={store} size="small" />
                          ))}
                        </Box>
                      </TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: getRemainingPersonnel().closerCount < 0 ? 'error.main' : 'inherit' }}>
                        {getRemainingPersonnel().closerCount}名
                      </TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: getRemainingPersonnel().girlCount < 0 ? 'error.main' : 'inherit' }}>
                        {getRemainingPersonnel().girlCount}名
                      </TableCell>
                    </TableRow>

                    {/* 新案件 */}
                    {allocations.map((allocation, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <FormControl size="small" sx={{ minWidth: 120 }}>
                            <Select
                              value={allocation.agencyName}
                              onChange={(e) => handleAllocationChange(index, 'agencyName', e.target.value)}
                              displayEmpty
                              sx={{ height: 32 }}
                            >
                              <MenuItem value="" disabled>
                                代理店を選択
                              </MenuItem>
                              {agencyList.map((agency) => (
                                <MenuItem key={agency} value={agency}>
                                  {agency}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </TableCell>
                        <TableCell>
                          <FormControl size="small" sx={{ minWidth: 100 }}>
                            <Select
                              value={allocation.storeName}
                              onChange={(e) => handleAllocationChange(index, 'storeName', e.target.value)}
                              displayEmpty
                              sx={{ height: 32 }}
                            >
                              <MenuItem value="" disabled>
                                店舗を選択
                              </MenuItem>
                              {availableStores.map((store) => (
                                <MenuItem key={store} value={store}>
                                  {store}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, minWidth: 150 }}>
                            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                              {allocation.coStores.map((store, storeIdx) => (
                                <Chip 
                                  key={storeIdx} 
                                  label={store} 
                                  size="small"
                                  sx={{
                                    backgroundColor: '#e0e0e0',
                                    color: '#666',
                                    fontWeight: 'normal',
                                    '& .MuiChip-deleteIcon': {
                                      color: '#666',
                                      '&:hover': {
                                        color: '#d32f2f',
                                      },
                                    },
                                  }}
                                  onDelete={() => handleRemoveCoStoreFromSplit(index, storeIdx)}
                                />
                              ))}
                            </Box>
                            <FormControl size="small" sx={{ minWidth: 120 }}>
                              <Select
                                value=""
                                onChange={(e) => {
                                  if (e.target.value && !allocation.coStores.includes(e.target.value as string)) {
                                    handleAddCoStoreToSplit(index, e.target.value as string);
                                  }
                                }}
                                displayEmpty
                                renderValue={() => '追加'}
                                sx={{
                                  height: 24,
                                  minHeight: 24,
                                  '& .MuiSelect-select': {
                                    padding: '0 8px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    fontSize: '0.75rem',
                                    color: '#999',
                                    backgroundColor: '#f8f9fa',
                                    borderRadius: '12px',
                                    minHeight: '24px !important',
                                    height: '24px !important',
                                    lineHeight: '24px',
                                  },
                                  '& .MuiOutlinedInput-notchedOutline': {
                                    border: '1px solid #e0e0e0',
                                    borderRadius: '12px',
                                  },
                                  '&:hover .MuiOutlinedInput-notchedOutline': {
                                    borderColor: '#ccc',
                                  },
                                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                    borderColor: '#666',
                                    borderWidth: '1px',
                                  },
                                }}
                              >
                                {availableStores
                                  .filter(store => !allocation.coStores.includes(store) && store !== allocation.storeName)
                                  .map((store) => (
                                    <MenuItem key={store} value={store}>
                                      {store}
                                    </MenuItem>
                                  ))}
                              </Select>
                            </FormControl>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <TextField
                            type="number"
                            size="small"
                            value={allocation.closerCount}
                            onChange={(e) => handleAllocationChange(index, 'closerCount', parseInt(e.target.value) || 0)}
                            inputProps={{ min: 0, max: editedProject.closerCount }}
                            sx={{ width: 80 }}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            type="number"
                            size="small"
                            value={allocation.girlCount}
                            onChange={(e) => handleAllocationChange(index, 'girlCount', parseInt(e.target.value) || 0)}
                            inputProps={{ min: 0, max: editedProject.girlCount }}
                            sx={{ width: 80 }}
                          />
                        </TableCell>
                      </TableRow>
                    ))}

                    {/* 合計行 */}
                    <TableRow sx={{ bgcolor: '#f5f5f5', borderTop: '2px solid #ddd' }}>
                      <TableCell sx={{ fontWeight: 'bold' }}>合計</TableCell>
                      <TableCell></TableCell>
                      <TableCell></TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>
                        {getRemainingPersonnel().closerCount + allocations.reduce((sum, a) => sum + a.closerCount, 0)}名
                        {getRemainingPersonnel().closerCount + allocations.reduce((sum, a) => sum + a.closerCount, 0) !== editedProject.closerCount && 
                          <Typography component="span" color="error" sx={{ ml: 1, fontSize: '0.75rem' }}>
                            (元: {editedProject.closerCount}名)
                          </Typography>
                        }
                      </TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>
                        {getRemainingPersonnel().girlCount + allocations.reduce((sum, a) => sum + a.girlCount, 0)}名
                        {getRemainingPersonnel().girlCount + allocations.reduce((sum, a) => sum + a.girlCount, 0) !== editedProject.girlCount && 
                          <Typography component="span" color="error" sx={{ ml: 1, fontSize: '0.75rem' }}>
                            (元: {editedProject.girlCount}名)
                          </Typography>
                        }
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>

              {/* 分割実行ボタン */}
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                {!isSplitValid() && (
                  <Typography variant="caption" color="error">
                    人員配分を正しく設定してください
                  </Typography>
                )}
                <Button
                  variant="contained"
                  onClick={handleExecuteSplit}
                  disabled={!isSplitValid()}
                  startIcon={<SaveIcon />}
                  color="primary"
                >
                  分割実行
                </Button>
              </Box>
            </Box>
          </Box>
        )}
        {/* 場所取り情報（場所ラベル） - テーブル直下 */}
        <Box sx={{ px: 3, pt: 2, pb: 2, display: 'flex', alignItems: 'center' }}>
          <RoomIcon sx={{ color: 'green', mr: 1, fontSize: 32 }} />
          <Typography variant="subtitle1" sx={{ fontSize: '1.5rem' }}>
            {editedProject.venue}
          </Typography>
        </Box>
        {/* 場所取り詳細テーブル */}
        <Box sx={{ px: 3, pb: 2 }}>
          <Table size="small" sx={{ minWidth: 480, borderCollapse: 'separate', borderSpacing: 0 }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold', fontSize: '1.15rem' }}>日付</TableCell>
                <TableCell sx={{ fontWeight: 'bold', fontSize: '1.15rem' }}>ステータス</TableCell>
                <TableCell sx={{ fontWeight: 'bold', fontSize: '1.15rem' }}>手配会社</TableCell>
                <TableCell sx={{ fontWeight: 'bold', fontSize: '1.15rem' }}>卸単価</TableCell>
                <TableCell sx={{ fontWeight: 'bold', fontSize: '1.15rem' }}>仕入単価</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell sx={{ fontSize: '1.15rem' }}>1/15</TableCell>
                <TableCell sx={{ fontSize: '1.15rem' }}>確定</TableCell>
                <TableCell sx={{ fontSize: '1.15rem' }}>場所とる.com</TableCell>
                <TableCell sx={{ fontSize: '1.15rem' }}>¥50,000</TableCell>
                <TableCell sx={{ fontSize: '1.15rem' }}>¥30,000</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontSize: '1.15rem' }}>1/16</TableCell>
                <TableCell sx={{ fontSize: '1.15rem' }}>確定</TableCell>
                <TableCell sx={{ fontSize: '1.15rem' }}>場所とる.com</TableCell>
                <TableCell sx={{ fontSize: '1.15rem' }}>¥50,000</TableCell>
                <TableCell sx={{ fontSize: '1.15rem' }}>¥30,000</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontSize: '1.15rem' }}>1/17</TableCell>
                <TableCell sx={{ fontSize: '1.15rem' }}>確定</TableCell>
                <TableCell sx={{ fontSize: '1.15rem' }}>場所とる.com</TableCell>
                <TableCell sx={{ fontSize: '1.15rem' }}>¥50,000</TableCell>
                <TableCell sx={{ fontSize: '1.15rem' }}>¥30,000</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Box>
        {/* 催事場費ページ分けチェックボックス */}
        <Box sx={{ px: 3, pb: 1 }}>
          <FormControlLabel
            control={<Switch color="primary" />}
            label="催事場費ページ分け"
          />
        </Box>
        {/* 減算金額入力セクション */}
        <Box sx={{ px: 3, pb: 2 }}>
          <Typography sx={{ fontWeight: 'normal', fontSize: '1.15rem', mb: 1, mt: 2 }}>
            減算登録
          </Typography>
          {deductions.map((deduction, idx) => (
            <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
              <TextField
                label="項目名"
                variant="outlined"
                size="small"
                sx={{ minWidth: 180 }}
                value={deduction.name}
                onChange={e => handleDeductionChange(idx, 'name', e.target.value)}
              />
              <TextField
                label="減算額"
                variant="outlined"
                size="small"
                type="number"
                InputProps={{ endAdornment: <InputAdornment position='end'>円</InputAdornment> }}
                sx={{ minWidth: 140 }}
                value={deduction.amount}
                onChange={e => handleDeductionChange(idx, 'amount', Number(e.target.value))}
              />
              <IconButton onClick={() => handleRemoveDeduction(idx)} size="small" color="error" disabled={!isEditing}>
                <DeleteIcon />
              </IconButton>
            </Box>
          ))}
          <Button onClick={handleAddDeduction} variant="outlined" size="small" sx={{ minWidth: 120 }} disabled={!isEditing}>⊕追加</Button>
        </Box>
        {/* メモセクション */}
        <Box sx={{ px: 3, pb: 2 }}>
          <Typography sx={{ fontWeight: 'normal', fontSize: '1.15rem', mb: 1, mt: 2 }}>
            営業/アサイン 担当メモ
          </Typography>
          {assignMemo ? (
            <Typography sx={{ fontSize: '1rem', color: '#222', whiteSpace: 'pre-line' }}>{assignMemo}</Typography>
          ) : (
            <Typography sx={{ fontSize: '1rem', color: '#888', bgcolor: '#f5f5f5', px: 2, py: 1, borderRadius: 1, display: 'inline-block' }}>
              メモはありません。
          </Typography>
          )}
        </Box>
        
        {/* 経理メモセクション */}
        <Box sx={{ px: 3, pb: 2 }}>
          <Typography sx={{ fontWeight: 'normal', fontSize: '1.15rem', mb: 1, mt: 2 }}>
            経理メモ
          </Typography>
          {isEditing ? (
            <TextField
              multiline
              rows={3}
              fullWidth
              variant="outlined"
              placeholder="経理メモを入力してください..."
              value={editedProject?.accountingMemo || ''}
              onChange={(e) => handleFieldChange('accountingMemo', e.target.value)}
              sx={{ 
                '& .MuiOutlinedInput-root': {
                  fontSize: '1rem'
                }
              }}
            />
          ) : (
            editedProject?.accountingMemo ? (
              <Typography sx={{ fontSize: '1rem', color: '#222', whiteSpace: 'pre-line', bgcolor: '#f9f9f9', px: 2, py: 1.5, borderRadius: 1, border: '1px solid #e0e0e0' }}>
                {editedProject.accountingMemo}
              </Typography>
            ) : (
              <Typography sx={{ fontSize: '1rem', color: '#888', bgcolor: '#f5f5f5', px: 2, py: 1, borderRadius: 1, display: 'inline-block' }}>
                メモはありません。
              </Typography>
            )
          )}
        </Box>

        {/* 必要最小限のボタンのみ表示 */}
        <Box sx={{ flex: 1 }} />
      <Divider />
      <DialogActions sx={{ px: 3, py: 2 }}>
        {isEditing ? (
            <Button 
              onClick={handleSave} 
              variant="contained" 
              color="primary" 
              startIcon={<SaveIcon />}
            >
              保存
            </Button>
          ) : null}
      </DialogActions>
      </Box>
    </Drawer>
  );
};

function formatEventDate(eventDate: string, days: number): string {
  // eventDate: '2025-01-15' など
  const date = new Date(eventDate);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const startDay = date.getDate();
  // 連続日付を生成
  const dayList = Array.from({ length: days }, (_, i) => startDay + i);
  // 週番号（2Wなど）
  const week = Math.floor((startDay - 1) / 7) + 1;
  return `${year}年${month}月 ${week}W ${dayList.map(d => `${d}日`).join('、')}（${days}日間）`;
}

export default ProjectDetailModal; 