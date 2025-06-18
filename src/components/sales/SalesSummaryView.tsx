'use client';

import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Chip,
  IconButton,
  Box,
  Checkbox,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  Select,
  MenuItem,
  Button,
  TextField,
  Menu,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Edit as EditIcon,
  Check as CheckIcon,
  LocationOn as LocationIcon,
  Business as BusinessIcon,
  Flag as FlagIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  Woman as WomanIcon,
} from '@mui/icons-material';
import SelectionPopups from './SelectionPopups';
import AddRecordDialog from './AddRecordDialog';
import DeleteConfirmDialog from './DeleteConfirmDialog';
import SalesDetailDrawer from './SalesDetailDrawer';

// SalesRecordの型定義をインポート（SalesTableと同じ）
interface SalesRecord {
  id: number;
  assignedUser: string;
  updatedUser: string;
  status: '起票' | '連絡前' | '連絡済' | '連絡不要' | 'お断り';
  agency: string;
  detailStatus: '未登録' | '公開済み';
  schedule: boolean[];
  dayType: '平日' | '週末';
  isBandProject: boolean;
  bandWorkDays?: number;
  eventLocation: string;
  managerName: string;
  managerPhone: string;
  hostStore: string[];
  partnerStores: string[];
  flags: {
    hasLocationReservation: boolean;
    isExternalVenue: boolean;
    hasBusinessTrip: boolean;
  };
  quotaTable: {
    closer: {
      count: number;
      unitPrice: number;
      transportFee: number;
    };
    girl: {
      count: number;
      unitPrice: number;
      transportFee: number;
    };
  };
  freeEntry: { [day: string]: number | undefined };
  locationReservations?: {
    id: string;
    date: string;
    status: '申請中' | '日程NG' | '通信NG' | '代理店確認中' | '確定';
    arrangementCompany: string;
    wholesalePrice: number;
    purchasePrice: number;
  }[];
  memo: string;
  fieldContactName?: string;
  fieldContactPhone?: string;
  otherCompany?: string;
  regularStaff?: string;
  meetingTime?: string;
  meetingPlace?: string;
  workStartTime?: string;
  workEndTime?: string;
  uniform?: string;
  target?: string;
  specialNotes?: string;
  selectedEventDates?: string[];
  communications?: any[];
}

interface SalesSummaryViewProps {
  records: SalesRecord[];
  selectedWeek: Date;
  onRecordUpdate: (recordId: number, updates: Partial<SalesRecord>) => void;
  onRecordAdd: (newRecord: SalesRecord) => void;
}

// ユーティリティ関数（SalesTableと同じ）
const getStatusColor = (status: SalesRecord['status']) => {
  switch (status) {
    case '起票': return 'default';
    case '連絡前': return 'warning';
    case '連絡済': return 'success';
    case '連絡不要': return 'info';
    case 'お断り': return 'error';
    default: return 'default';
  }
};

const getDetailStatusColor = (status: SalesRecord['detailStatus']) => {
  return status === '公開済み' ? 'success' : 'default';
};

const getDetailStatusDisplayText = (status: SalesRecord['detailStatus']) => {
  return status === '公開済み' ? '公開' : '非公開';
};

const getDayNames = () => ['火', '水', '木', '金', '土', '日', '月'];

const getWeekDates = (selectedWeek: Date) => {
  const dates = [];
  const startDate = new Date(selectedWeek);
  const dayOfWeek = startDate.getDay();
  const daysToTuesday = dayOfWeek === 0 ? 2 : (2 - dayOfWeek + 7) % 7;
  startDate.setDate(startDate.getDate() - daysToTuesday);
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    dates.push(date.getDate());
  }
  
  return dates;
};

const getWeekendStyle = (dayIndex: number) => {
  if (dayIndex === 4) {
    return { backgroundColor: '#e3f2fd', color: '#1976d2' };
  } else if (dayIndex === 5) {
    return { backgroundColor: '#ffebee', color: '#d32f2f' };
  }
  return { backgroundColor: 'inherit', color: 'inherit' };
};

const getAgencyStyle = (agency: string) => {
  switch (agency) {
    case 'ピーアップ':
      return { backgroundColor: '#e0f2f1', color: '#00796b' };
    case 'エージェントA':
      return { backgroundColor: '#fff3e0', color: '#ef6c00' };
    case 'マーケティング会社B':
      return { backgroundColor: '#f3e5f5', color: '#7b1fa2' };
    default:
      return { backgroundColor: '#f5f5f5', color: '#424242' };
  }
};

const SalesSummaryView: React.FC<SalesSummaryViewProps> = ({ records, selectedWeek, onRecordUpdate, onRecordAdd }) => {
  const [editingRecord, setEditingRecord] = useState<number | null>(null);
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [assignedUserPopup, setAssignedUserPopup] = useState<{ recordId: number; anchorEl: HTMLElement } | null>(null);
  const [statusPopup, setStatusPopup] = useState<{ recordId: number; anchorEl: HTMLElement } | null>(null);
  const [agencyPopup, setAgencyPopup] = useState<{ recordId: number; anchorEl: HTMLElement } | null>(null);
  const [detailStatusPopup, setDetailStatusPopup] = useState<{ recordId: number; anchorEl: HTMLElement } | null>(null);
  const [dayTypePopup, setDayTypePopup] = useState<{ recordId: number; anchorEl: HTMLElement } | null>(null);
  const [eventLocationPopup, setEventLocationPopup] = useState<{ recordId: number; anchorEl: HTMLElement } | null>(null);
  const [managerPopup, setManagerPopup] = useState<{ recordId: number; anchorEl: HTMLElement } | null>(null);

  // 右クリックメニューと削除機能の状態
  const [contextMenu, setContextMenu] = useState<{ recordId: number; mouseX: number; mouseY: number } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ recordId: number; open: boolean } | null>(null);

  // 詳細情報ドロワーの状態
  const [detailDrawer, setDetailDrawer] = useState<{ recordId: number; open: boolean } | null>(null);

  // 新規追加ダイアログの状態
  const [addRecordDialog, setAddRecordDialog] = useState<boolean>(false);
  const [newRecordForm, setNewRecordForm] = useState({
    assignedUser: '',
    agency: '',
    detailStatus: '未登録' as const,
    dayType: '平日' as const,
    isBandProject: false,
    bandWorkDays: 0,
    eventLocation: '',
    managerName: '',
    managerPhone: '',
    hostStore: '',
    partnerStores: [],
    hasLocationReservation: false,
    locationReservationDetails: [],
    isExternalVenue: false,
    hasBusinessTrip: false,
    closerCount: 0,
    closerUnitPrice: 15000,
    closerTransportFee: 1000,
    girlCount: 0,
    girlUnitPrice: 12000,
    girlTransportFee: 800,
    fieldContactName: '',
    fieldContactPhone: '',
    meetingTime: '',
    meetingPlace: '',
    workStartTime: '',
    workEndTime: '',
    uniform: '',
    target: '',
    memo: '',
    selectedEventDates: [],
  });

  const dayNames = getDayNames();
  const weekDates = getWeekDates(selectedWeek);

  const availableUsers = ['田中', '佐藤', '鈴木', '高橋', '伊藤', '渡辺'];
  const availableAgencies = ['ピーアップ', 'エージェントA', 'マーケティング会社B', 'イベント企画', '販促サービス'];
  const availableEventLocations = ['東京ビッグサイト', '幕張メッセ', '横浜アリーナ', '大阪城ホール', '名古屋ドーム'];
  const availableStores = ['新宿店', '渋谷店', '池袋店', '浦和店', '川崎店', '横浜店'];
  const availableManagers = [
    { name: '山田太郎', phone: '090-1234-5678' },
    { name: '佐々木花子', phone: '080-9876-5432' },
    { name: '伊藤次郎', phone: '070-1111-2222' },
  ];

  const handleAddRecordDialogClose = () => {
    setAddRecordDialog(false);
    setNewRecordForm({
      assignedUser: '',
      agency: '',
      detailStatus: '未登録' as const,
      dayType: '平日' as const,
      isBandProject: false,
      bandWorkDays: 0,
      eventLocation: '',
      managerName: '',
      managerPhone: '',
      hostStore: '',
      partnerStores: [],
      hasLocationReservation: false,
      locationReservationDetails: [],
      isExternalVenue: false,
      hasBusinessTrip: false,
      closerCount: 0,
      closerUnitPrice: 15000,
      closerTransportFee: 1000,
      girlCount: 0,
      girlUnitPrice: 12000,
      girlTransportFee: 800,
      fieldContactName: '',
      fieldContactPhone: '',
      meetingTime: '',
      meetingPlace: '',
      workStartTime: '',
      workEndTime: '',
      uniform: '',
      target: '',
      memo: '',
      selectedEventDates: [],
    });
  };

  const handleFormChange = (field: string, value: any) => {
    setNewRecordForm(prev => ({ ...prev, [field]: value }));
  };

  const handleConfirmAddRecord = () => {
    // バリデーション（イベント開催日のみ必須）
    if (!newRecordForm.selectedEventDates || newRecordForm.selectedEventDates.length === 0) {
      alert('イベント開催日を選択してください');
      return;
    }

    // 新規レコード作成
    const newRecord: SalesRecord = {
      id: Date.now(),
      assignedUser: newRecordForm.assignedUser,
      updatedUser: '現在のユーザー',
      status: '起票',
      agency: newRecordForm.agency,
      detailStatus: newRecordForm.detailStatus,
      schedule: [false, false, false, false, false, false, false],
      dayType: newRecordForm.dayType,
      isBandProject: newRecordForm.isBandProject,
      bandWorkDays: newRecordForm.isBandProject ? newRecordForm.bandWorkDays : undefined,
      eventLocation: newRecordForm.eventLocation,
      managerName: newRecordForm.managerName,
      managerPhone: newRecordForm.managerPhone,
      hostStore: newRecordForm.hostStore ? [newRecordForm.hostStore] : [],
      partnerStores: newRecordForm.partnerStores,
      flags: {
        hasLocationReservation: newRecordForm.hasLocationReservation,
        isExternalVenue: newRecordForm.isExternalVenue,
        hasBusinessTrip: newRecordForm.hasBusinessTrip,
      },
      quotaTable: {
        closer: {
          count: newRecordForm.closerCount,
          unitPrice: newRecordForm.closerUnitPrice,
          transportFee: newRecordForm.closerTransportFee,
        },
        girl: {
          count: newRecordForm.girlCount,
          unitPrice: newRecordForm.girlUnitPrice,
          transportFee: newRecordForm.girlTransportFee,
        },
      },
      freeEntry: {},
      memo: newRecordForm.memo,
      fieldContactName: newRecordForm.fieldContactName,
      fieldContactPhone: newRecordForm.fieldContactPhone,
      meetingTime: newRecordForm.meetingTime,
      meetingPlace: newRecordForm.meetingPlace,
      workStartTime: newRecordForm.workStartTime,
      workEndTime: newRecordForm.workEndTime,
      uniform: newRecordForm.uniform,
      target: newRecordForm.target,
      selectedEventDates: newRecordForm.selectedEventDates,
      communications: [],
    };

    onRecordAdd(newRecord);
    handleAddRecordDialogClose();
  };

  // 編集機能のハンドラー
  const handleEditStart = (recordId: number) => {
    setEditingRecord(recordId);
  };

  const handleEditEnd = () => {
    setEditingRecord(null);
  };

  // 右クリック削除機能のハンドラー
  const handleRowContextMenu = (event: React.MouseEvent, recordId: number) => {
    event.preventDefault();
    setContextMenu({
      recordId,
      mouseX: event.clientX + 2,
      mouseY: event.clientY - 6,
    });
  };

  const handleContextMenuClose = () => {
    setContextMenu(null);
  };

  const handleDeleteFromContext = () => {
    if (contextMenu) {
      setDeleteConfirm({ recordId: contextMenu.recordId, open: true });
      setContextMenu(null);
    }
  };

  const handleRecordDeleteCancel = () => {
    setDeleteConfirm(null);
  };

  const handleRecordDeleteConfirm = () => {
    if (deleteConfirm) {
      // ここで実際の削除処理を行う（親コンポーネントに通知するなど）
      // 現在はコンソールログのみ
      console.log('レコード削除:', deleteConfirm.recordId);
      // TODO: onRecordDelete(deleteConfirm.recordId); などの削除処理を実装
      setDeleteConfirm(null);
    }
  };

  // 詳細情報ドロワーのハンドラー
  const handleDetailDrawerOpen = (recordId: number) => {
    setDetailDrawer({ recordId, open: true });
  };

  const handleDetailDrawerClose = () => {
    setDetailDrawer(null);
  };

  return (
    <Box sx={{ width: '100%' }}>
      {/* 新規追加ボタン */}
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => setAddRecordDialog(true)}
          sx={{
            borderRadius: '8px',
            px: 3,
            py: 1,
            fontWeight: '600',
            fontSize: '0.9rem',
            textTransform: 'none',
            boxShadow: '0 2px 8px rgba(25, 118, 210, 0.3)',
            '&:hover': {
              boxShadow: '0 4px 12px rgba(25, 118, 210, 0.4)',
            }
          }}
        >
          + 新規追加
        </Button>
      </Box>

      <TableContainer component={Paper} sx={{ width: '100%', overflowX: 'auto', maxHeight: '80vh' }}>
        <Table sx={{ minWidth: 2000 }} stickyHeader>
          <TableHead>
            <TableRow sx={{ 
              backgroundColor: '#ffffff', 
              '& .MuiTableCell-root': { 
                backgroundColor: '#ffffff',
                borderBottom: '2px solid #e0e0e0',
                zIndex: 100,
                position: 'sticky',
                top: 0
              }
            }}>
              {/* 左側基本情報列 */}
              <TableCell sx={{ width: '30px' }}></TableCell>
              <TableCell sx={{ width: '80px', fontSize: '0.7rem', whiteSpace: 'nowrap' }}>担当者</TableCell>
              <TableCell sx={{ width: '90px', fontSize: '0.7rem', whiteSpace: 'nowrap' }}>更新者</TableCell>
              <TableCell sx={{ width: '90px', fontSize: '0.7rem', whiteSpace: 'nowrap' }}>ステータス</TableCell>
              <TableCell sx={{ width: '100px', fontSize: '0.7rem', whiteSpace: 'nowrap' }}>代理店</TableCell>
              <TableCell sx={{ width: '80px', fontSize: '0.7rem', whiteSpace: 'nowrap' }}>詳細情報</TableCell>
              
              {/* 中央日付列 */}
              {dayNames.map((day, index) => (
                <TableCell 
                  key={day} 
                  align="center"
                  sx={{ 
                    width: '30px',
                    ...getWeekendStyle(index)
                  }}
                >
                  <Box>
                    <Typography variant="caption" display="block" sx={{ fontSize: '0.6rem' }}>{day}</Typography>
                    <Typography variant="caption" display="block" sx={{ fontSize: '0.6rem' }}>{weekDates[index]}</Typography>
                  </Box>
                </TableCell>
              ))}
              
              {/* 右側曜日・帯案件列 */}
              <TableCell sx={{ width: '80px', fontSize: '0.7rem', whiteSpace: 'nowrap' }}>曜日</TableCell>
              <TableCell sx={{ width: '80px', fontSize: '0.7rem', whiteSpace: 'nowrap' }}>帯案件</TableCell>
              <TableCell sx={{ width: '1200px', fontSize: '0.7rem' }}>詳細</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {records.map((record) => (
              <TableRow 
                key={record.id}
                onMouseEnter={() => setHoveredRow(record.id)}
                onMouseLeave={() => setHoveredRow(null)}
                onContextMenu={(e) => handleRowContextMenu(e, record.id)}
                sx={{ 
                  '&:hover': { backgroundColor: '#f5f5f5' },
                  backgroundColor: editingRecord === record.id ? '#fff3e0' : 'transparent'
                }}
              >
                {/* 編集アイコン */}
                <TableCell sx={{ width: '30px', padding: '4px' }}>
                  <Box sx={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {editingRecord === record.id ? (
                      <IconButton 
                        size="small"
                        sx={{
                          width: '28px',
                          height: '28px',
                          backgroundColor: 'rgba(76, 175, 80, 0.2)',
                          '&:hover': { 
                            backgroundColor: 'rgba(76, 175, 80, 0.3)',
                          }
                        }}
                        onClick={handleEditEnd}
                      >
                        <CheckIcon fontSize="small" color="success" />
                      </IconButton>
                    ) : (
                      <IconButton 
                        size="small" 
                        sx={{
                          width: '28px',
                          height: '28px',
                          backgroundColor: hoveredRow === record.id ? 'rgba(25, 118, 210, 0.2)' : 'rgba(25, 118, 210, 0.1)',
                          opacity: hoveredRow === record.id ? 1 : 0.3,
                          '&:hover': { 
                            backgroundColor: 'rgba(25, 118, 210, 0.3)',
                            opacity: 1,
                          }
                        }}
                        onClick={() => handleEditStart(record.id)}
                      >
                        <EditIcon fontSize="small" color="primary" />
                      </IconButton>
                    )}
                  </Box>
                </TableCell>

                {/* 担当者 */}
                <TableCell sx={{ width: '80px' }}>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      cursor: 'pointer',
                      '&:hover': { backgroundColor: 'rgba(25, 118, 210, 0.1)', borderRadius: '4px' },
                      padding: '2px 4px',
                      borderRadius: '4px'
                    }}
                    onClick={(e) => setAssignedUserPopup({ recordId: record.id, anchorEl: e.currentTarget })}
                  >
                    {record.assignedUser}
                  </Typography>
                </TableCell>

                {/* 更新者 */}
                <TableCell sx={{ width: '90px' }}>
                  <Typography variant="body2">{record.updatedUser}</Typography>
                </TableCell>

                {/* ステータス */}
                <TableCell sx={{ width: '90px' }}>
                  <Chip
                    label={record.status}
                    size="small"
                    color={getStatusColor(record.status)}
                    sx={{ 
                      fontSize: '0.65rem',
                      cursor: 'pointer',
                      '&:hover': { opacity: 0.8 }
                    }}
                    onClick={(e) => setStatusPopup({ recordId: record.id, anchorEl: e.currentTarget })}
                  />
                </TableCell>

                {/* 代理店 */}
                <TableCell sx={{ width: '100px' }}>
                  <Box sx={{ 
                    ...getAgencyStyle(record.agency),
                    px: 1,
                    py: 0.3,
                    borderRadius: '4px',
                    textAlign: 'center',
                    fontSize: '0.7rem',
                    fontWeight: 'bold',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    <Typography variant="body2" sx={{ 
                      fontSize: '0.7rem', 
                      fontWeight: 'bold',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>{record.agency}</Typography>
                  </Box>
                </TableCell>

                {/* 詳細情報 */}
                <TableCell sx={{ width: '80px', textAlign: 'center' }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.3 }}>
                    <Chip 
                      label={getDetailStatusDisplayText(record.detailStatus)} 
                      color={getDetailStatusColor(record.detailStatus)}
                      size="small"
                      sx={{ 
                        fontSize: '0.7rem', 
                        height: '20px'
                      }}
                    />
                    <Button 
                      size="small" 
                      variant="text"
                      sx={{ 
                        fontSize: '0.6rem', 
                        minHeight: '16px', 
                        padding: '1px 4px',
                        lineHeight: 1,
                        textTransform: 'none',
                        cursor: 'pointer',
                        '&:hover': { backgroundColor: '#e3f2fd' }
                      }}
                      onClick={() => handleDetailDrawerOpen(record.id)}
                    >
                      詳細情報
                    </Button>
                  </Box>
                </TableCell>

                {/* スケジュール（火〜月） */}
                {record.schedule.map((hasWork, dayIndex) => (
                  <TableCell 
                    key={dayIndex} 
                    align="center"
                    sx={{ 
                      width: '30px',
                      borderLeft: '1px solid #e0e0e0',
                      borderRight: '1px solid #e0e0e0',
                      ...getWeekendStyle(dayIndex),
                      cursor: editingRecord === record.id ? 'pointer' : 'default',
                      '&:hover': editingRecord === record.id ? { backgroundColor: 'rgba(25, 118, 210, 0.1)' } : {}
                    }}
                    onClick={() => {
                      if (editingRecord === record.id) {
                        const newSchedule = [...record.schedule];
                        newSchedule[dayIndex] = !newSchedule[dayIndex];
                        onRecordUpdate(record.id, { schedule: newSchedule });
                      }
                    }}
                  >
                    {(hasWork || record.isBandProject) && <CheckIcon color="primary" fontSize="small" />}
                  </TableCell>
                ))}

                {/* 曜日 */}
                <TableCell sx={{ 
                  width: '80px',
                  backgroundColor: record.isBandProject 
                    ? '#e3f2fd' // 帯案件の場合は薄い青
                    : record.dayType === '平日' ? '#f5f5f5' : '#fff9c4', // 通常は平日/週末に応じた色
                  cursor: editingRecord === record.id ? 'pointer' : 'default',
                  '&:hover': editingRecord === record.id ? { opacity: 0.8 } : {}
                }}
                onClick={(e) => {
                  if (editingRecord === record.id) {
                    // 曜日種別を切り替える処理
                    const newDayType = record.dayType === '平日' ? '週末' : '平日';
                    onRecordUpdate(record.id, { dayType: newDayType });
                  }
                }}
                >
                  <Typography variant="body2" sx={{ 
                    whiteSpace: 'nowrap',
                    color: record.isBandProject ? '#1976d2' : 'inherit', // 帯案件の場合は濃い青のテキスト
                    fontWeight: record.isBandProject ? 'bold' : 'normal' // 帯案件の場合は太字
                  }}>
                    {record.isBandProject ? '帯' : record.dayType}
                  </Typography>
                </TableCell>

                {/* 帯案件 */}
                <TableCell sx={{ 
                  width: '80px',
                  cursor: editingRecord === record.id ? 'pointer' : 'default',
                  '&:hover': editingRecord === record.id ? { backgroundColor: 'rgba(25, 118, 210, 0.1)' } : {}
                }}
                onClick={() => {
                  if (editingRecord === record.id) {
                    onRecordUpdate(record.id, { isBandProject: !record.isBandProject });
                  }
                }}
                >
                  {record.isBandProject ? (
                    <Box textAlign="center">
                      <CheckIcon color="primary" fontSize="small" />
                      {editingRecord === record.id ? (
                        <TextField
                          type="number"
                          value={record.bandWorkDays || 0}
                          onChange={(e) => {
                            const newValue = parseInt(e.target.value) || 0;
                            onRecordUpdate(record.id, { bandWorkDays: newValue });
                          }}
                          size="small"
                          variant="outlined"
                          sx={{
                            width: '50px',
                            mt: 0.5,
                            '& .MuiOutlinedInput-root': {
                              fontSize: '0.7rem',
                              height: '24px'
                            },
                            '& .MuiOutlinedInput-input': {
                              padding: '2px 4px',
                              textAlign: 'center'
                            }
                          }}
                          inputProps={{
                            min: 0,
                            max: 31
                          }}
                          onClick={(e) => e.stopPropagation()} // 親要素のクリックイベントを防ぐ
                        />
                      ) : (
                        <Typography variant="caption" display="block">
                          {record.bandWorkDays}日
                        </Typography>
                      )}
                    </Box>
                  ) : (
                    editingRecord === record.id && (
                      <Box textAlign="center" sx={{ opacity: 0.5 }}>
                        <CheckIcon color="disabled" fontSize="small" />
                        <Typography variant="caption" display="block" color="text.disabled">
                          帯案件
                        </Typography>
                      </Box>
                    )
                  )}
                </TableCell>

                {/* サマリー詳細列 */}
                <TableCell sx={{ width: '1200px', padding: '8px' }}>
                  <Box sx={{ display: 'flex', fontSize: '0.8rem', position: 'relative', height: '100%', alignItems: 'center' }}>
                    {/* イベント実施場所（左端固定） */}
                    <Box sx={{ position: 'absolute', left: 0, width: '160px' }}>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontWeight: 'bold', 
                          fontSize: '0.9rem', 
                          whiteSpace: 'nowrap', 
                          overflow: 'hidden', 
                          textOverflow: 'ellipsis',
                          cursor: editingRecord === record.id ? 'pointer' : 'default',
                          '&:hover': editingRecord === record.id ? { backgroundColor: 'rgba(25, 118, 210, 0.1)', borderRadius: '4px' } : {},
                          padding: editingRecord === record.id ? '2px 4px' : '0',
                          borderRadius: '4px'
                        }}
                        onClick={(e) => {
                          if (editingRecord === record.id) {
                            setEventLocationPopup({ recordId: record.id, anchorEl: e.currentTarget });
                          }
                        }}
                      >
                        {record.eventLocation}
                      </Typography>
                    </Box>
                    
                    {/* フラグエリア（固定位置） */}
                    <Box sx={{ position: 'absolute', left: '170px', width: '200px', display: 'flex', gap: 1 }}>
                      <Box 
                        sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 0.5,
                          cursor: editingRecord === record.id ? 'pointer' : 'default',
                          '&:hover': editingRecord === record.id ? { backgroundColor: 'rgba(76, 175, 80, 0.1)', borderRadius: '4px' } : {},
                          padding: editingRecord === record.id ? '2px 4px' : '0',
                          borderRadius: '4px'
                        }}
                        onClick={() => {
                          if (editingRecord === record.id) {
                            onRecordUpdate(record.id, { 
                              flags: { ...record.flags, hasLocationReservation: !record.flags.hasLocationReservation }
                            });
                          }
                        }}
                      >
                        <LocationIcon fontSize="small" sx={{ color: record.flags.hasLocationReservation ? '#4caf50' : (editingRecord === record.id ? '#ccc' : '#4caf50') }} />
                        <Typography variant="caption" sx={{ fontSize: '0.7rem', color: record.flags.hasLocationReservation ? '#4caf50' : (editingRecord === record.id ? '#ccc' : '#4caf50') }}>
                          場所取り
                        </Typography>
                      </Box>
                      
                      <Box 
                        sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 0.5,
                          cursor: editingRecord === record.id ? 'pointer' : 'default',
                          '&:hover': editingRecord === record.id ? { backgroundColor: 'rgba(255, 152, 0, 0.1)', borderRadius: '4px' } : {},
                          padding: editingRecord === record.id ? '2px 4px' : '0',
                          borderRadius: '4px'
                        }}
                        onClick={() => {
                          if (editingRecord === record.id) {
                            onRecordUpdate(record.id, { 
                              flags: { ...record.flags, isExternalVenue: !record.flags.isExternalVenue }
                            });
                          }
                        }}
                      >
                        <BusinessIcon fontSize="small" sx={{ color: record.flags.isExternalVenue ? '#ff9800' : (editingRecord === record.id ? '#ccc' : '#ff9800') }} />
                        <Typography variant="caption" sx={{ fontSize: '0.7rem', color: record.flags.isExternalVenue ? '#ff9800' : (editingRecord === record.id ? '#ccc' : '#ff9800') }}>
                          外現場
                        </Typography>
                      </Box>
                      
                      <Box 
                        sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 0.5,
                          cursor: editingRecord === record.id ? 'pointer' : 'default',
                          '&:hover': editingRecord === record.id ? { backgroundColor: 'rgba(33, 150, 243, 0.1)', borderRadius: '4px' } : {},
                          padding: editingRecord === record.id ? '2px 4px' : '0',
                          borderRadius: '4px'
                        }}
                        onClick={() => {
                          if (editingRecord === record.id) {
                            onRecordUpdate(record.id, { 
                              flags: { ...record.flags, hasBusinessTrip: !record.flags.hasBusinessTrip }
                            });
                          }
                        }}
                      >
                        <FlagIcon fontSize="small" sx={{ color: record.flags.hasBusinessTrip ? '#2196f3' : (editingRecord === record.id ? '#ccc' : '#2196f3') }} />
                        <Typography variant="caption" sx={{ fontSize: '0.7rem', color: record.flags.hasBusinessTrip ? '#2196f3' : (editingRecord === record.id ? '#ccc' : '#2196f3') }}>
                          出張
                        </Typography>
                      </Box>
                    </Box>
                    
                    {/* クローザー人数（固定位置） */}
                    <Box sx={{ position: 'absolute', left: '380px', width: '60px', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <PersonIcon fontSize="small" sx={{ color: '#1976d2' }} />
                      {editingRecord === record.id ? (
                        <TextField
                          type="number"
                          value={record.quotaTable.closer.count}
                          onChange={(e) => {
                            const newCount = parseInt(e.target.value) || 0;
                            onRecordUpdate(record.id, { 
                              quotaTable: { 
                                ...record.quotaTable, 
                                closer: { ...record.quotaTable.closer, count: newCount }
                              }
                            });
                          }}
                          size="small"
                          variant="outlined"
                          sx={{
                            width: '35px',
                            '& .MuiOutlinedInput-root': {
                              fontSize: '0.8rem',
                              height: '24px'
                            },
                            '& .MuiOutlinedInput-input': {
                              padding: '2px 4px',
                              textAlign: 'center'
                            }
                          }}
                          inputProps={{
                            min: 0,
                            max: 99
                          }}
                        />
                      ) : (
                        <Typography variant="body2" sx={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#1976d2' }}>
                          {record.quotaTable.closer.count}人
                        </Typography>
                      )}
                    </Box>
                    
                    {/* ガール人数（固定位置） */}
                    <Box sx={{ position: 'absolute', left: '450px', width: '60px', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <WomanIcon fontSize="small" sx={{ color: '#e91e63' }} />
                      {editingRecord === record.id ? (
                        <TextField
                          type="number"
                          value={record.quotaTable.girl.count}
                          onChange={(e) => {
                            const newCount = parseInt(e.target.value) || 0;
                            onRecordUpdate(record.id, { 
                              quotaTable: { 
                                ...record.quotaTable, 
                                girl: { ...record.quotaTable.girl, count: newCount }
                              }
                            });
                          }}
                          size="small"
                          variant="outlined"
                          sx={{
                            width: '35px',
                            '& .MuiOutlinedInput-root': {
                              fontSize: '0.8rem',
                              height: '24px'
                            },
                            '& .MuiOutlinedInput-input': {
                              padding: '2px 4px',
                              textAlign: 'center'
                            }
                          }}
                          inputProps={{
                            min: 0,
                            max: 99
                          }}
                        />
                      ) : (
                        <Typography variant="body2" sx={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#e91e63' }}>
                          {record.quotaTable.girl.count}人
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* 右クリックメニュー */}
      {contextMenu && (
        <Menu
          open={true}
          onClose={handleContextMenuClose}
          anchorReference="anchorPosition"
          anchorPosition={{
            top: contextMenu.mouseY,
            left: contextMenu.mouseX,
          }}
          PaperProps={{
            sx: {
              borderRadius: '8px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
              border: '1px solid #e0e0e0',
              minWidth: '150px',
            }
          }}
        >
          <MenuItem
            onClick={handleDeleteFromContext}
            sx={{
              color: '#f4212e',
              fontSize: '0.9rem',
              py: 1.5,
              px: 2,
              '&:hover': {
                backgroundColor: 'rgba(244, 33, 46, 0.1)',
              }
            }}
          >
            <ListItemIcon sx={{ color: '#f4212e' }}>
              <DeleteIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText 
              primary="削除" 
              primaryTypographyProps={{ 
                fontSize: '0.9rem',
                fontWeight: '600' 
              }} 
            />
          </MenuItem>
        </Menu>
      )}

      {/* 削除確認ダイアログ */}
      <DeleteConfirmDialog
        recordDeleteOpen={deleteConfirm?.open || false}
        onRecordDeleteCancel={handleRecordDeleteCancel}
        onRecordDeleteConfirm={handleRecordDeleteConfirm}
        messageDeleteOpen={false}
        onMessageDeleteCancel={() => {}}
        onMessageDeleteConfirm={() => {}}
      />

      {/* 詳細情報ドロワー */}
      {detailDrawer && (
        <SalesDetailDrawer
          open={detailDrawer.open}
          onClose={handleDetailDrawerClose}
          record={records.find(r => r.id === detailDrawer.recordId) || null}
          dayNames={dayNames}
          weekDates={weekDates}
          onUpdate={(updates) => {
            if (detailDrawer.recordId) {
              onRecordUpdate(detailDrawer.recordId, updates);
            }
          }}
        />
      )}

      {/* 新規追加ダイアログ */}
      <AddRecordDialog
        open={addRecordDialog}
        form={newRecordForm}
        onClose={handleAddRecordDialogClose}
        onFormChange={handleFormChange}
        onConfirm={handleConfirmAddRecord}
      />

      {/* SelectionPopups追加 */}
      <SelectionPopups
        assignedUserPopup={assignedUserPopup}
        statusPopup={statusPopup}
        agencyPopup={agencyPopup}
        detailStatusPopup={detailStatusPopup}
        dayTypePopup={dayTypePopup}
        eventLocationPopup={eventLocationPopup}
        managerPopup={managerPopup}
        onAssignedUserClose={() => setAssignedUserPopup(null)}
        onAssignedUserSelect={(recordId, user) => {
          onRecordUpdate(recordId, { assignedUser: user });
          setAssignedUserPopup(null);
        }}
        onStatusClose={() => setStatusPopup(null)}
        onStatusSelect={(recordId, status) => {
          onRecordUpdate(recordId, { status });
          setStatusPopup(null);
        }}
        onAgencyClose={() => setAgencyPopup(null)}
        onAgencySelect={(recordId, agency) => {
          onRecordUpdate(recordId, { agency });
          setAgencyPopup(null);
        }}
        onDetailStatusClose={() => setDetailStatusPopup(null)}
        onDetailStatusSelect={(recordId, detailStatus) => {
          onRecordUpdate(recordId, { detailStatus });
          setDetailStatusPopup(null);
        }}
        onDayTypeClose={() => setDayTypePopup(null)}
        onDayTypeSelect={(recordId, dayType) => {
          onRecordUpdate(recordId, { dayType });
          setDayTypePopup(null);
        }}
        onEventLocationClose={() => setEventLocationPopup(null)}
        onEventLocationSelect={(recordId, eventLocation) => {
          onRecordUpdate(recordId, { eventLocation });
          setEventLocationPopup(null);
        }}
        onManagerClose={() => setManagerPopup(null)}
        onManagerSelect={(recordId, manager) => {
          onRecordUpdate(recordId, { managerName: manager.name, managerPhone: manager.phone });
          setManagerPopup(null);
        }}
      />
    </Box>
  );
};

export default SalesSummaryView; 