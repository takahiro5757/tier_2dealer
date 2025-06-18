'use client';

import React, { useState } from 'react';
import {
  Drawer,
  Box,
  Typography,
  Button,
  IconButton,
  TextField,
  Grid,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Tooltip,
  FormControl,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Collapse,
  Slide,
  Grow,
  Fade,
} from '@mui/material';
import {
  Close as CloseIcon,
  LocationOn as LocationIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Business as BusinessIcon,
} from '@mui/icons-material';
import CommunicationPanel from './CommunicationPanel';
import LocationReservationModal from './LocationReservationModal';

// アニメーション設定
const drawerVariants = {
  initial: {
    x: '100%',
    opacity: 0,
    scale: 0.95,
  },
  animate: {
    x: 0,
    opacity: 1,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 30,
      duration: 0.4,
      ease: [0.23, 1, 0.32, 1],
    },
  },
  exit: {
    x: '100%',
    opacity: 0,
    scale: 0.95,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 40,
      duration: 0.3,
      ease: [0.76, 0, 0.24, 1],
    },
  },
};

const contentVariants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.1,
      duration: 0.3,
      ease: [0.23, 1, 0.32, 1],
    },
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: {
      duration: 0.2,
      ease: [0.76, 0, 0.24, 1],
    },
  },
};

// 型定義
interface Communication {
  id: string;
  userId: string;
  userName: string;
  message: string;
  timestamp: string;
  likes: string[];
  replies?: Communication[];
  quotedMessage?: string;
  parentId?: string;
}

interface LocationReservation {
  id: string;
  date: string;
  status: '申請中' | '日程NG' | '通信NG' | '代理店確認中' | '確定';
  arrangementCompany: string;
  wholesalePrice: number;
  purchasePrice: number;
}

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
  communications?: any[];
}

interface SalesDetailDrawerProps {
  open: boolean;
  record: SalesRecord | null;
  dayNames: string[];
  weekDates: number[];
  onClose: () => void;
  onUpdate: (updates: Partial<SalesRecord>) => void;
}

const SalesDetailDrawer: React.FC<SalesDetailDrawerProps> = ({
  open,
  record,
  dayNames,
  weekDates,
  onClose,
  onUpdate,
}) => {
  const [detailEditMode, setDetailEditMode] = useState(false);
  const [locationModal, setLocationModal] = useState<{ open: boolean; recordId: number } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; reservationId: string } | null>(null);
  const [detailInfoExpanded, setDetailInfoExpanded] = useState(false);

  if (!record) return null;

  // 詳細情報の編集切り替え
  const handleDetailEditToggle = () => {
    setDetailEditMode(!detailEditMode);
  };

  // 公開/非公開の切り替え
  const handlePublishToggle = () => {
    if (record) {
      const newStatus = record.detailStatus === '公開済み' ? '未登録' : '公開済み';
      onUpdate({ detailStatus: newStatus });
    }
  };

  // 場所取り詳細モーダル関連
  const handleLocationReservationModalClose = () => {
    setLocationModal(null);
  };

  const handleLocationReservationAdd = (recordId: number) => {
    const newReservation: LocationReservation = {
      id: Date.now().toString(),
      date: '',
      status: '申請中',
      arrangementCompany: '',
      wholesalePrice: 0,
      purchasePrice: 0
    };
    
    const currentReservations = record?.locationReservations || [];
    onUpdate({
      locationReservations: [...currentReservations, newReservation]
    });
  };

  const handleLocationReservationRemove = (recordId: number, reservationId: string) => {
    const currentReservations = record?.locationReservations || [];
    const updatedReservations = currentReservations.filter(r => r.id !== reservationId);
    onUpdate({ locationReservations: updatedReservations });
  };

  const handleLocationReservationUpdate = (recordId: number, reservationId: string, updates: any) => {
    const currentReservations = record?.locationReservations || [];
    const updatedReservations = currentReservations.map(reservation =>
      reservation.id === reservationId ? { ...reservation, ...updates } : reservation
    );
    onUpdate({ locationReservations: updatedReservations });
  };

  // コミュニケーション機能のハンドラー
  const handleSendMessage = (message: string) => {
    if (!record) return;
    
    const newMessage: Communication = {
      id: Date.now().toString(),
      userId: 'user1',
      userName: '田中太郎',
      message: message,
      timestamp: new Date().toISOString(),
      likes: []
    };

    const currentCommunications = record.communications || [];
    const updatedCommunications = [newMessage, ...currentCommunications];
    onUpdate({ communications: updatedCommunications });
  };

  const handleSendReply = (parentId: string, message: string) => {
    if (!record) return;

    const newReply: Communication = {
      id: Date.now().toString(),
      userId: 'user1',
      userName: '田中太郎',
      message: message,
      timestamp: new Date().toISOString(),
      likes: [],
      parentId: parentId
    };

    const addReply = (communications: Communication[]): Communication[] => {
      return communications.map(comm => {
        if (comm.id === parentId) {
          return {
            ...comm,
            replies: [...(comm.replies || []), newReply]
          };
        } else if (comm.replies) {
          return {
            ...comm,
            replies: addReply(comm.replies)
          };
        }
        return comm;
      });
    };

    const currentCommunications = record.communications || [];
    const updatedCommunications = addReply(currentCommunications);
    onUpdate({ communications: updatedCommunications });
  };

  const handleLikeMessage = (messageId: string) => {
    if (!record) return;

    const updateLikes = (communications: Communication[]): Communication[] => {
      return communications.map(comm => {
        if (comm.id === messageId) {
          const hasLiked = comm.likes.includes('user1');
          return {
            ...comm,
            likes: hasLiked 
              ? comm.likes.filter(id => id !== 'user1')
              : [...comm.likes, 'user1']
          };
        } else if (comm.replies) {
          return {
            ...comm,
            replies: updateLikes(comm.replies)
          };
        }
        return comm;
      });
    };

    const currentCommunications = record.communications || [];
    const updatedCommunications = updateLikes(currentCommunications);
    onUpdate({ communications: updatedCommunications });
  };

  const handleDeleteMessage = (messageId: string) => {
    if (!record) return;

    const deleteMessage = (communications: Communication[]): Communication[] => {
      return communications.filter(comm => {
        if (comm.id === messageId) {
          return false;
        }
        if (comm.replies) {
          comm.replies = deleteMessage(comm.replies);
        }
        return true;
      });
    };

    const currentCommunications = record.communications || [];
    const updatedCommunications = deleteMessage(currentCommunications);
    onUpdate({ communications: updatedCommunications });
  };

  const handleEditMessage = (messageId: string, newMessage: string) => {
    if (!record) return;

    const editMessage = (communications: Communication[]): Communication[] => {
      return communications.map(comm => {
        if (comm.id === messageId) {
          return { ...comm, message: newMessage };
        }
        if (comm.replies) {
          return { ...comm, replies: editMessage(comm.replies) };
        }
        return comm;
      });
    };

    const currentCommunications = record.communications || [];
    const updatedCommunications = editMessage(currentCommunications);
    onUpdate({ communications: updatedCommunications });
  };

  // 稼働日の取得
  const workDates = record.schedule.map((hasWork, index) => {
    if (!hasWork) return null;
    const date = weekDates[index];
    const dayName = dayNames[index];
    return { date, dayName, index };
  }).filter((item): item is { date: number; dayName: string; index: number } => item !== null);

  return (
    <>
      <Drawer
        anchor="right"
        open={open}
        onClose={onClose}
        PaperProps={{
          sx: {
            width: '1200px',
            maxWidth: '90vw',
            borderRadius: '16px 0 0 16px'
          }
        }}
      >
        <Box sx={{ p: 3, height: '100%', overflowY: 'auto' }}>
          {/* ヘッダー部分 */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant={record.detailStatus === '公開済み' ? 'contained' : 'outlined'}
                color="success"
                size="small"
                onClick={handlePublishToggle}
                sx={{ 
                  minWidth: '80px',
                  fontWeight: 'bold'
                }}
              >
                公開
              </Button>
              <Button
                variant={record.detailStatus === '未登録' ? 'contained' : 'outlined'}
                color="inherit"
                size="small"
                onClick={() => onUpdate({ detailStatus: '未登録' })}
                sx={{
                  minWidth: '80px',
                  fontWeight: 'bold',
                  backgroundColor: record.detailStatus === '未登録' ? '#666' : 'transparent',
                  color: record.detailStatus === '未登録' ? 'white' : '#666',
                  '&:hover': { 
                    backgroundColor: record.detailStatus === '未登録' ? '#555' : 'rgba(0,0,0,0.04)',
                  }
                }}
              >
                非公開
              </Button>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <IconButton 
                onClick={handleDetailEditToggle} 
                color={detailEditMode ? 'primary' : 'default'} 
                size="small"
                sx={{
                  backgroundColor: detailEditMode ? 'rgba(25, 118, 210, 0.1)' : 'transparent',
                  '&:hover': {
                    backgroundColor: detailEditMode ? 'rgba(25, 118, 210, 0.2)' : 'rgba(0, 0, 0, 0.04)',
                  }
                }}
              >
                <EditIcon />
              </IconButton>
              <IconButton onClick={onClose} size="small">
                <CloseIcon />
              </IconButton>
            </Box>
          </Box>
          
          {/* コンテンツエリア */}
          <Box sx={{ minHeight: '400px' }}>
            {/* 基本情報と枠別表 */}
            <Box sx={{ display: 'flex', gap: 5, mt: 3 }}>
              {/* 左側：基本情報 */}
              <Box sx={{ flex: '0 0 320px', display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                {/* 代理店名 */}
                <Box sx={{ 
                  backgroundColor: '#e8d5f0',
                  color: '#6a1b9a',
                  px: 2,
                  py: 0.8,
                  borderRadius: '8px',
                  display: 'inline-block',
                  alignSelf: 'flex-start',
                  boxShadow: '0 2px 4px rgba(232, 213, 240, 0.3)'
                }}>
                  <Typography variant="body1" sx={{ fontWeight: 'bold', fontSize: '1rem' }}>
                    {record.agency}
                  </Typography>
                </Box>
                
                {/* イベント実施場所 */}
                <Box sx={{ mt: 1 }}>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 2, color: '#2c3e50', letterSpacing: '0.5px' }}>
                    {record.eventLocation}
                  </Typography>
                </Box>
                
                {/* 開催店舗・連名店舗 */}
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Typography variant="body2" sx={{ fontSize: '0.95rem', fontWeight: '500', color: '#5d6d7e' }}>開催</Typography>
                    <Box sx={{ 
                      backgroundColor: '#e3f2fd',
                      color: '#1976d2',
                      px: 2.5, 
                      py: 0.7, 
                      borderRadius: '20px',
                      fontSize: '0.9rem',
                      fontWeight: '600',
                      boxShadow: '0 2px 4px rgba(227, 242, 253, 0.3)'
                    }}>
                      {record.hostStore.join(', ')}
                    </Box>
                  </Box>
                  
                  {record.partnerStores.length > 0 && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Typography variant="body2" sx={{ fontSize: '0.95rem', fontWeight: '500', color: '#5d6d7e' }}>連名</Typography>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        {record.partnerStores.map((store, index) => (
                          <Box key={index} sx={{ 
                            backgroundColor: '#ecf0f1', 
                            color: '#34495e', 
                            px: 2.5, 
                            py: 0.7, 
                            borderRadius: '20px',
                            fontSize: '0.9rem',
                            fontWeight: '600',
                            border: '1px solid #bdc3c7'
                          }}>
                            {store}
                          </Box>
                        ))}
                      </Box>
                    </Box>
                  )}
                </Box>
                
                {/* フラグ（外現場のみ） */}
                {record.flags.isExternalVenue && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 1 }}>
                    <BusinessIcon fontSize="small" sx={{ color: '#f39c12' }} />
                    <Typography variant="body2" sx={{ color: '#f39c12', fontWeight: '600', fontSize: '0.95rem' }}>
                      外現場
                    </Typography>
                  </Box>
                )}
              </Box>
              
              {/* 右側：枠別表 */}
              <Box sx={{ flex: 1 }}>
                <Table sx={{ 
                  border: '1px solid #d5dbdb', 
                  borderRadius: '12px', 
                  tableLayout: 'auto', 
                  width: '100%',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
                  overflow: 'hidden'
                }}>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#f5f6fa' }}>
                      <TableCell sx={{ 
                        fontWeight: 'bold', 
                        border: '1px solid #e1e5e9',
                        padding: '12px 16px', 
                        fontSize: '0.9rem', 
                        whiteSpace: 'nowrap',
                        color: '#2c3e50'
                      }}>役割</TableCell>
                      <TableCell sx={{ 
                        fontWeight: 'bold', 
                        border: '1px solid #e1e5e9',
                        textAlign: 'center', 
                        padding: '12px 16px', 
                        fontSize: '0.9rem',
                        color: '#2c3e50'
                      }}>人数</TableCell>
                      {workDates.map((workDate) => {
                        if (!workDate) return null;
                        const isWeekend = workDate.index === 4 || workDate.index === 5;
                        return (
                          <TableCell 
                            key={workDate.index} 
                            sx={{ 
                              fontWeight: 'bold', 
                              border: '1px solid #e1e5e9',
                              textAlign: 'center',
                              padding: '12px 16px',
                              fontSize: '0.9rem',
                              minWidth: '90px',
                              color: '#2c3e50',
                              backgroundColor: isWeekend ? '#fef7f0' : '#f5f6fa'
                            }}
                          >
                            {workDate.date}/{workDate.dayName}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {/* クローザー行 */}
                    <TableRow sx={{ '&:hover': { backgroundColor: '#f8f9fa' } }}>
                      <TableCell sx={{ 
                        border: '1px solid #d5dbdb', 
                        color: '#2980b9', 
                        fontWeight: 'bold',
                        padding: '12px 16px',
                        fontSize: '0.9rem',
                        whiteSpace: 'nowrap',
                        backgroundColor: '#ebf3fd'
                      }}>
                        クローザー
                      </TableCell>
                      <TableCell sx={{ 
                        border: '1px solid #d5dbdb', 
                        textAlign: 'center',
                        fontWeight: 'bold',
                        padding: '12px 16px',
                        fontSize: '1rem',
                        backgroundColor: '#ebf3fd'
                      }}>
                        {record.quotaTable.closer.count}
                      </TableCell>
                      {workDates.map((workDate) => {
                        if (!workDate) return null;
                        const isWeekend = workDate.index === 4 || workDate.index === 5;
                        return (
                          <TableCell 
                            key={workDate.index} 
                            sx={{ 
                              border: '1px solid #d5dbdb', 
                              textAlign: 'center',
                              padding: '12px 16px',
                              backgroundColor: isWeekend ? '#fdf2f8' : '#ffffff'
                            }}
                          >
                            {Array.from({ length: record.quotaTable.closer.count }, (_, i) => (
                              <Typography key={i} variant="caption" sx={{ 
                                display: 'block', 
                                fontSize: '0.8rem', 
                                lineHeight: 1.4,
                                fontWeight: '500',
                                color: '#2c3e50'
                              }}>
                                田中太郎
                              </Typography>
                            ))}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                    
                    {/* ガール行 */}
                    <TableRow sx={{ '&:hover': { backgroundColor: '#f8f9fa' } }}>
                      <TableCell sx={{ 
                        border: '1px solid #d5dbdb', 
                        color: '#e91e63', 
                        fontWeight: 'bold',
                        padding: '12px 16px',
                        fontSize: '0.9rem',
                        whiteSpace: 'nowrap',
                        backgroundColor: '#fce4ec'
                      }}>
                        ガール
                      </TableCell>
                      <TableCell sx={{ 
                        border: '1px solid #d5dbdb', 
                        textAlign: 'center',
                        fontWeight: 'bold',
                        padding: '12px 16px',
                        fontSize: '1rem',
                        backgroundColor: '#fce4ec'
                      }}>
                        {record.quotaTable.girl.count}
                      </TableCell>
                      {workDates.map((workDate) => {
                        if (!workDate) return null;
                        const isWeekend = workDate.index === 4 || workDate.index === 5;
                        return (
                          <TableCell 
                            key={workDate.index} 
                            sx={{ 
                              border: '1px solid #d5dbdb', 
                              textAlign: 'center',
                              padding: '12px 16px',
                              backgroundColor: isWeekend ? '#fdf2f8' : '#ffffff'
                            }}
                          >
                            {Array.from({ length: record.quotaTable.girl.count }, (_, i) => (
                              <Typography key={i} variant="caption" sx={{ 
                                display: 'block', 
                                fontSize: '0.8rem', 
                                lineHeight: 1.4,
                                fontWeight: '500',
                                color: '#2c3e50'
                              }}>
                                田中太郎
                              </Typography>
                            ))}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                    
                    {/* 無料入店行 */}
                    <TableRow sx={{ '&:hover': { backgroundColor: '#f8f9fa' } }}>
                      <TableCell 
                        colSpan={2}
                        sx={{ 
                          border: '1px solid #d5dbdb', 
                          fontWeight: 'bold',
                          padding: '12px 16px',
                          fontSize: '0.9rem',
                          whiteSpace: 'nowrap',
                          backgroundColor: '#f8f9fa',
                          color: '#5d6d7e',
                          textAlign: 'left'
                        }}
                      >
                        無料入店
                      </TableCell>
                      {workDates.map((workDate) => {
                        if (!workDate) return null;
                        const isWeekend = workDate.index === 4 || workDate.index === 5;
                        // 無料入店者のダミー名前データ
                        const freeEntryNames = ['佐藤花子', '山田次郎', '鈴木美咲', '田中一郎', '高橋由美'];
                        const entryCount = record.freeEntry[`day${workDate.index + 1}`] || 0;
                        const namesForDay = freeEntryNames.slice(0, entryCount);
                        
                        return (
                          <TableCell 
                            key={workDate.index} 
                            sx={{ 
                              border: '1px solid #d5dbdb', 
                              textAlign: 'center',
                              padding: '12px 16px',
                              backgroundColor: isWeekend ? '#fdf2f8' : '#ffffff'
                            }}
                          >
                            {namesForDay.map((name, i) => (
                              <Typography key={i} variant="caption" sx={{ 
                                display: 'block', 
                                fontSize: '0.8rem', 
                                lineHeight: 1.4,
                                fontWeight: '500',
                                color: '#5d6d7e'
                              }}>
                                {name}
                              </Typography>
                            ))}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  </TableBody>
                </Table>
              </Box>
            </Box>
            
            {/* 詳細項目フォーム - 全幅で表示 */}
            <Box sx={{ mt: 4 }}>
              {/* 詳細を表示リンク */}
              <Box sx={{ mb: 2 }}>
                <Typography
                  component="a"
                  onClick={() => setDetailInfoExpanded(!detailInfoExpanded)}
                  sx={{
                    color: '#1976d2',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    fontSize: '0.95rem',
                    fontWeight: '500',
                    '&:hover': {
                      color: '#1565c0',
                    }
                  }}
                >
                  {detailInfoExpanded ? '非表示にする' : '詳細を表示'}
                </Typography>
              </Box>

              {/* 詳細情報（アニメーション付き表示） */}
              <Collapse in={detailInfoExpanded} timeout={300}>
                <Box sx={{ 
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  padding: '20px',
                  backgroundColor: '#fafafa',
                  mb: 2
                }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                    {/* 現場連絡先 */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Typography variant="body2" sx={{ minWidth: '80px', fontWeight: '500', color: '#5d6d7e' }}>
                        現場連絡先
                      </Typography>
                      {detailEditMode ? (
                        <Box sx={{ display: 'flex', gap: 1, flex: 1 }}>
                          <TextField
                            value={record?.fieldContactName || ''}
                            onChange={(e) => onUpdate({ fieldContactName: e.target.value })}
                            size="small"
                            variant="outlined"
                            placeholder="名前"
                            sx={{ flex: 1, maxWidth: '200px' }}
                          />
                          <TextField
                            value={record?.fieldContactPhone || ''}
                            onChange={(e) => onUpdate({ fieldContactPhone: e.target.value })}
                            size="small"
                            variant="outlined"
                            placeholder="電話番号"
                            sx={{ flex: 1, maxWidth: '200px' }}
                          />
                        </Box>
                      ) : (
                        <Typography variant="body2" sx={{ flex: 1, color: (record?.fieldContactName || record?.fieldContactPhone) ? '#2c3e50' : '#999' }}>
                          {record?.fieldContactName || record?.fieldContactPhone ? 
                            `${record?.fieldContactName || '未設定'} ${record?.fieldContactPhone || ''}`.trim() : 
                            '未入力'
                          }
                        </Typography>
                      )}
                    </Box>
                    
                    {/* 他社 */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Typography variant="body2" sx={{ minWidth: '80px', fontWeight: '500', color: '#5d6d7e' }}>
                        他社
                      </Typography>
                      {detailEditMode ? (
                        <TextField
                          value={record?.otherCompany || ''}
                          onChange={(e) => onUpdate({ otherCompany: e.target.value })}
                          size="small"
                          variant="outlined"
                          placeholder="未入力"
                          sx={{ flex: 1 }}
                        />
                      ) : (
                        <Typography variant="body2" sx={{ flex: 1, color: record?.otherCompany ? '#2c3e50' : '#999' }}>
                          {record?.otherCompany || '未入力'}
                        </Typography>
                      )}
                    </Box>
                    
                    {/* 常勤 */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Typography variant="body2" sx={{ minWidth: '80px', fontWeight: '500', color: '#5d6d7e' }}>
                        常勤
                      </Typography>
                      {detailEditMode ? (
                        <TextField
                          value={record?.regularStaff || ''}
                          onChange={(e) => onUpdate({ regularStaff: e.target.value })}
                          size="small"
                          variant="outlined"
                          placeholder="未入力"
                          sx={{ flex: 1 }}
                        />
                      ) : (
                        <Typography variant="body2" sx={{ flex: 1, color: record?.regularStaff ? '#2c3e50' : '#999' }}>
                          {record?.regularStaff || '未入力'}
                        </Typography>
                      )}
                    </Box>
                    
                    {/* 集合 */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Typography variant="body2" sx={{ minWidth: '80px', fontWeight: '500', color: '#5d6d7e' }}>
                        集合
                      </Typography>
                      {detailEditMode ? (
                        <Box sx={{ display: 'flex', gap: 1, flex: 1 }}>
                          <TextField
                            type="time"
                            value={record?.meetingTime || ''}
                            onChange={(e) => onUpdate({ meetingTime: e.target.value })}
                            size="small"
                            variant="outlined"
                            label="時間"
                            InputLabelProps={{ shrink: true }}
                            sx={{ width: '140px' }}
                          />
                          <TextField
                            value={record?.meetingPlace || ''}
                            onChange={(e) => onUpdate({ meetingPlace: e.target.value })}
                            size="small"
                            variant="outlined"
                            placeholder="場所"
                            sx={{ flex: 1 }}
                          />
                        </Box>
                      ) : (
                        <Typography variant="body2" sx={{ flex: 1, color: (record?.meetingTime || record?.meetingPlace) ? '#2c3e50' : '#999' }}>
                          {record?.meetingTime || record?.meetingPlace ? 
                            `${record?.meetingTime || '未設定'} ${record?.meetingPlace || ''}`.trim() : 
                            '未入力'
                          }
                        </Typography>
                      )}
                    </Box>
                    
                    {/* 稼働時間 */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Typography variant="body2" sx={{ minWidth: '80px', fontWeight: '500', color: '#5d6d7e' }}>
                        稼働時間
                      </Typography>
                      {detailEditMode ? (
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flex: 1 }}>
                          <TextField
                            type="time"
                            value={record?.workStartTime || ''}
                            onChange={(e) => onUpdate({ workStartTime: e.target.value })}
                            size="small"
                            variant="outlined"
                            label="開始時刻"
                            InputLabelProps={{ shrink: true }}
                            sx={{ width: '140px' }}
                          />
                          <Typography sx={{ mx: 1 }}>〜</Typography>
                          <TextField
                            type="time"
                            value={record?.workEndTime || ''}
                            onChange={(e) => onUpdate({ workEndTime: e.target.value })}
                            size="small"
                            variant="outlined"
                            label="終了時刻"
                            InputLabelProps={{ shrink: true }}
                            sx={{ width: '140px' }}
                          />
                        </Box>
                      ) : (
                        <Typography variant="body2" sx={{ flex: 1, color: (record?.workStartTime || record?.workEndTime) ? '#2c3e50' : '#999' }}>
                          {record?.workStartTime || record?.workEndTime ? 
                            `${record?.workStartTime || '未設定'} 〜 ${record?.workEndTime || '未設定'}` : 
                            '未入力'
                          }
                        </Typography>
                      )}
                    </Box>
                    
                    {/* 服装 */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Typography variant="body2" sx={{ minWidth: '80px', fontWeight: '500', color: '#5d6d7e' }}>
                        服装
                      </Typography>
                      {detailEditMode ? (
                        <TextField
                          value={record?.uniform || ''}
                          onChange={(e) => onUpdate({ uniform: e.target.value })}
                          size="small"
                          variant="outlined"
                          placeholder="未入力"
                          sx={{ flex: 1 }}
                        />
                      ) : (
                        <Typography variant="body2" sx={{ flex: 1, color: record?.uniform ? '#2c3e50' : '#999' }}>
                          {record?.uniform || '未入力'}
                        </Typography>
                      )}
                    </Box>
                    
                    {/* 目標 */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Typography variant="body2" sx={{ minWidth: '80px', fontWeight: '500', color: '#5d6d7e' }}>
                        目標
                      </Typography>
                      {detailEditMode ? (
                        <TextField
                          value={record?.target || ''}
                          onChange={(e) => onUpdate({ target: e.target.value })}
                          size="small"
                          variant="outlined"
                          placeholder="未入力"
                          sx={{ flex: 1 }}
                        />
                      ) : (
                        <Typography variant="body2" sx={{ flex: 1, color: record?.target ? '#2c3e50' : '#999' }}>
                          {record?.target || '未入力'}
                        </Typography>
                      )}
                    </Box>
                    
                    {/* 特記事項 */}
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                      <Typography variant="body2" sx={{ minWidth: '80px', fontWeight: '500', color: '#5d6d7e', mt: 1 }}>
                        特記事項
                      </Typography>
                      {detailEditMode ? (
                        <TextField
                          value={record?.specialNotes || ''}
                          onChange={(e) => onUpdate({ specialNotes: e.target.value })}
                          size="small"
                          variant="outlined"
                          placeholder="未入力"
                          multiline
                          rows={3}
                          sx={{ flex: 1 }}
                        />
                      ) : (
                        <Typography variant="body2" sx={{ flex: 1, color: record?.specialNotes ? '#2c3e50' : '#999' }}>
                          {record?.specialNotes || '未入力'}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </Box>
              </Collapse>
              
              {/* 詳細情報の下に仕切り線 */}
              <Box sx={{ pt: 3, borderBottom: '1px solid #e0e0e0' }} />
            </Box>
            
            {/* コミュニケーション機能 */}
            <Box sx={{ mt: 4 }}>
              <CommunicationPanel
                communications={record.communications || []}
                onSendMessage={handleSendMessage}
                onSendReply={handleSendReply}
                onLikeMessage={handleLikeMessage}
                onDeleteMessage={handleDeleteMessage}
                onEditMessage={handleEditMessage}
              />
            </Box>
          </Box>
        </Box>
      </Drawer>

      {/* 場所取り詳細モーダル */}
      {locationModal && (
        <LocationReservationModal
          open={locationModal.open}
          recordId={locationModal.recordId}
          reservations={record.locationReservations || []}
          onClose={handleLocationReservationModalClose}
          onAdd={handleLocationReservationAdd}
          onRemove={handleLocationReservationRemove}
          onUpdate={handleLocationReservationUpdate}
        />
      )}
    </>
  );
};

export default SalesDetailDrawer;