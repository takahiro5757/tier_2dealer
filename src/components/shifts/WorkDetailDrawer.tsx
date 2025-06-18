'use client';

import React, { useState } from 'react';
import {
  Drawer,
  Box,
  Typography,
  Button,
  IconButton,
  TextField,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Collapse,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Paper,
  Avatar
} from '@mui/material';
import {
  Close as CloseIcon,
  LocationOn as LocationIcon,
  Edit as EditIcon,
  Business as BusinessIcon,
  AccessTime,
  Person,
  Phone,
  Group,
  AttachMoney,
  ExpandMore,
  ExpandLess,
  Chat
} from '@mui/icons-material';
import CommunicationPanel from '../sales/CommunicationPanel';

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

interface Shift {
  id: string;
  staffId: string;
  date: string;
  status: '○' | '×' | '-';
  location?: string;
  rate?: number;
  comment?: string;
}

interface StaffMember {
  id: string;
  name: string;
  nameKana: string;
  station: string;
  weekdayRate: number;
  holidayRate: number;
  tel: string;
  role: string;
  company: string;
}

interface WorkDetailDrawerProps {
  open: boolean;
  onClose: () => void;
  date: string;
  assignments: Shift[];
  staff: StaffMember[];
}

const WorkDetailDrawer: React.FC<WorkDetailDrawerProps> = ({
  open,
  onClose,
  date,
  assignments,
  staff
}) => {
  const [detailEditMode, setDetailEditMode] = useState(false);
  const [detailInfoExpanded, setDetailInfoExpanded] = useState(true);
  const [workDetails, setWorkDetails] = useState({
    agency: 'ANSTEYPE',
    location: '東京ビッグサイト',
    managerName: '田中管理者',
    managerPhone: '090-1234-5678',
    fieldContactName: '未入力',
    fieldContactPhone: '未入力',
    otherCompany: '未入力',
    regularStaff: '未入力',
    meetingTime: '10:00',
    meetingPlace: '新宿駅東口',
    workStartTime: '10:30',
    workEndTime: '18:00',
    uniform: 'スーツ着用',
    target: '新規顧客獲得20件',
    specialNotes: '雨天時は屋内での活動に変更',
    communications: [] as Communication[]
  });

  // 複数日のデータを生成（サンプル）
  const workDates = [
    { date: '31', day: '火', fullDate: '2024-03-31' },
    { date: '1', day: '水', fullDate: '2024-04-01' },
    { date: '3', day: '金', fullDate: '2024-04-03' },
    { date: '5', day: '日', fullDate: '2024-04-05' }
  ];

  const getStaffName = (staffId: string) => {
    const staffMember = staff.find(s => s.id === staffId);
    return staffMember ? staffMember.name : '不明';
  };

  const getStaffRole = (staffId: string) => {
    const staffMember = staff.find(s => s.id === staffId);
    return staffMember?.role || 'スタッフ';
  };

  // 各日付のスタッフ配置をシミュレート
  const getStaffForDate = (dateStr: string, role: string): string[] => {
    // サンプルデータ生成
    const sampleStaff: Record<string, Record<string, string[]>> = {
      '31': {
        'クローザー': ['田中太郎', '田中太郎'],
        'ガール': ['田中太郎', '田中太郎', '田中太郎']
      },
      '1': {
        'クローザー': ['田中太郎', '田中太郎'],
        'ガール': ['田中太郎', '田中太郎', '田中太郎']
      },
      '3': {
        'クローザー': ['田中太郎', '田中太郎'],
        'ガール': ['田中太郎', '田中太郎', '田中太郎']
      },
      '5': {
        'クローザー': ['田中太郎', '田中太郎'],
        'ガール': ['田中太郎', '田中太郎', '田中太郎']
      }
    };
    
    return sampleStaff[dateStr]?.[role] || [];
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) {
      return '日付不明';
    }
    
    try {
      let normalizedDate = dateStr;
      if (dateStr.includes('/')) {
        const parts = dateStr.split('/');
        if (parts.length === 3) {
          normalizedDate = `${parts[2]}-${parts[0].padStart(2, '0')}-${parts[1].padStart(2, '0')}`;
        }
      }
      
      const date = new Date(normalizedDate);
      
      if (isNaN(date.getTime())) {
        return '日付不明';
      }
      
      const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
      const month = date.getMonth() + 1;
      const day = date.getDate();
      const weekday = weekdays[date.getDay()];
      return `${month}月${day}日(${weekday})`;
    } catch (error) {
      console.error('日付フォーマットエラー:', error, 'dateStr:', dateStr);
      return '日付不明';
    }
  };

  // 詳細編集モード切り替え
  const handleDetailEditToggle = () => {
    setDetailEditMode(!detailEditMode);
  };

  // コミュニケーション機能のハンドラー
  const handleSendMessage = (message: string) => {
    const newMessage: Communication = {
      id: Date.now().toString(),
      userId: 'user1',
      userName: '田中太郎',
      message: message,
      timestamp: new Date().toISOString(),
      likes: []
    };

    const updatedCommunications = [newMessage, ...workDetails.communications];
    setWorkDetails(prev => ({ ...prev, communications: updatedCommunications }));
  };

  const handleSendReply = (parentId: string, message: string) => {
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

    const updatedCommunications = addReply(workDetails.communications);
    setWorkDetails(prev => ({ ...prev, communications: updatedCommunications }));
  };

  const handleLikeMessage = (messageId: string) => {
    const currentUserId = 'user1';
    
    const updateLikes = (communications: Communication[]): Communication[] => {
      return communications.map(comm => {
        if (comm.id === messageId) {
          const likes = comm.likes.includes(currentUserId) 
            ? comm.likes.filter(id => id !== currentUserId)
            : [...comm.likes, currentUserId];
          return { ...comm, likes };
        }
        if (comm.replies) {
          return { ...comm, replies: updateLikes(comm.replies) };
        }
        return comm;
      });
    };

    const updatedCommunications = updateLikes(workDetails.communications);
    setWorkDetails(prev => ({ ...prev, communications: updatedCommunications }));
  };

  const handleDeleteMessage = (messageId: string) => {
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

    const updatedCommunications = deleteMessage(workDetails.communications);
    setWorkDetails(prev => ({ ...prev, communications: updatedCommunications }));
  };

  const handleEditMessage = (messageId: string, newMessage: string) => {
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

    const updatedCommunications = editMessage(workDetails.communications);
    setWorkDetails(prev => ({ ...prev, communications: updatedCommunications }));
  };

  const handleWorkDetailsUpdate = (field: string, value: string) => {
    setWorkDetails(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 400, md: 500 },
          maxWidth: '100vw'
        }
      }}
    >
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* ヘッダー */}
        <Box sx={{ 
          p: 2, 
          borderBottom: '1px solid #e0e0e0',
          bgcolor: '#f8f9fa'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold', mb: 1, color: '#2c3e50' }}>
                勤務詳細
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AccessTime color="primary" fontSize="small" />
                <Typography variant="body2" sx={{ color: '#34495e' }}>
                  {formatDate(date)}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <IconButton onClick={onClose} size="small">
                <CloseIcon />
              </IconButton>
            </Box>
          </Box>
        </Box>

        {/* メインコンテンツ */}
        <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
          {/* 基本情報 */}
          <Box sx={{ mb: 3 }}>
            {/* 代理店名 */}
            <Box sx={{ 
              backgroundColor: '#e8d5f0',
              color: '#6a1b9a',
              px: 2,
              py: 0.8,
              borderRadius: '8px',
              display: 'inline-block',
              mb: 2,
              boxShadow: '0 2px 4px rgba(232, 213, 240, 0.3)'
            }}>
              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                {workDetails.agency}
              </Typography>
            </Box>
            
            {/* 勤務地 */}
            <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2, color: '#2c3e50' }}>
              {detailEditMode ? (
                <TextField
                  value={workDetails.location}
                  onChange={(e) => handleWorkDetailsUpdate('location', e.target.value)}
                  variant="outlined"
                  size="small"
                  fullWidth
                />
              ) : (
                workDetails.location
              )}
            </Typography>
            
            {/* 開催・連名 */}
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Typography variant="body2" sx={{ fontSize: '0.9rem', fontWeight: '500', color: '#5d6d7e' }}>開催</Typography>
                <Box sx={{ 
                  backgroundColor: '#e3f2fd',
                  color: '#1976d2',
                  px: 2, 
                  py: 0.5, 
                  borderRadius: '16px',
                  fontSize: '0.8rem',
                  fontWeight: '600'
                }}>
                  新宿店
                </Box>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                <Typography variant="body2" sx={{ fontSize: '0.9rem', fontWeight: '500', color: '#5d6d7e' }}>連名</Typography>
                <Box sx={{ 
                  backgroundColor: '#ecf0f1', 
                  color: '#34495e', 
                  px: 2, 
                  py: 0.5, 
                  borderRadius: '16px',
                  fontSize: '0.8rem',
                  fontWeight: '600',
                  border: '1px solid #bdc3c7'
                }}>
                  渋谷店
                </Box>
                <Box sx={{ 
                  backgroundColor: '#ecf0f1', 
                  color: '#34495e', 
                  px: 2, 
                  py: 0.5, 
                  borderRadius: '16px',
                  fontSize: '0.8rem',
                  fontWeight: '600',
                  border: '1px solid #bdc3c7'
                }}>
                  浦和店
                </Box>
              </Box>
            </Box>
          </Box>

          {/* 要員表 */}
          <Box sx={{ mb: 3 }}>
            <Table sx={{ 
              border: '1px solid #d5dbdb', 
              borderRadius: '8px', 
              width: '100%',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
              overflow: 'hidden'
            }}>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f6fa' }}>
                  <TableCell sx={{ 
                    fontWeight: 'bold', 
                    border: '1px solid #e1e5e9',
                    padding: '8px', 
                    fontSize: '0.8rem', 
                    color: '#2c3e50'
                  }}>役割</TableCell>
                  {workDates.map((workDate) => {
                    const isWeekend = workDate.day === '土' || workDate.day === '日';
                    return (
                      <TableCell 
                        key={workDate.date} 
                        sx={{ 
                          fontWeight: 'bold', 
                          border: '1px solid #e1e5e9',
                          textAlign: 'center',
                          padding: '8px',
                          fontSize: '0.7rem',
                          minWidth: '60px',
                          color: '#2c3e50',
                          backgroundColor: isWeekend ? '#fef7f0' : '#f5f6fa'
                        }}
                      >
                        {workDate.date}/{workDate.day}
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
                    padding: '8px',
                    fontSize: '0.8rem',
                    backgroundColor: '#ebf3fd'
                  }}>
                    クローザー
                  </TableCell>
                  {workDates.map((workDate) => {
                    const staffList = getStaffForDate(workDate.date, 'クローザー');
                    return (
                      <TableCell 
                        key={workDate.date} 
                        sx={{ 
                          border: '1px solid #d5dbdb', 
                          textAlign: 'center',
                          padding: '4px',
                          fontSize: '0.7rem',
                          backgroundColor: '#ebf3fd',
                          verticalAlign: 'top'
                        }}
                      >
                        {staffList.map((name: string, index: number) => (
                          <Box key={index} sx={{ mb: 0.3 }}>
                            <Typography variant="caption" sx={{ fontSize: '0.65rem', lineHeight: 1.1 }}>
                              {name}
                            </Typography>
                          </Box>
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
                    padding: '8px',
                    fontSize: '0.8rem',
                    backgroundColor: '#fce4ec'
                  }}>
                    ガール
                  </TableCell>
                  {workDates.map((workDate) => {
                    const staffList = getStaffForDate(workDate.date, 'ガール');
                    return (
                      <TableCell 
                        key={workDate.date} 
                        sx={{ 
                          border: '1px solid #d5dbdb', 
                          textAlign: 'center',
                          padding: '4px',
                          fontSize: '0.7rem',
                          backgroundColor: '#fce4ec',
                          verticalAlign: 'top'
                        }}
                      >
                        {staffList.map((name: string, index: number) => (
                          <Box key={index} sx={{ mb: 0.3 }}>
                            <Typography variant="caption" sx={{ fontSize: '0.65rem', lineHeight: 1.1 }}>
                              {name}
                            </Typography>
                          </Box>
                        ))}
                      </TableCell>
                    );
                  })}
                </TableRow>
                
                {/* 無料入店行 */}
                <TableRow>
                  <TableCell sx={{ 
                    border: '1px solid #d5dbdb',
                    padding: '8px',
                    fontSize: '0.8rem',
                    backgroundColor: 'white'
                  }}>
                    無料入店
                  </TableCell>
                  {workDates.map((workDate) => {
                    // 無料入店のスタッフ（サンプルデータ）
                    const freeEntryStaff = workDate.date === '31' ? ['佐藤花子', '山田次郎', '鈴木美咲', '田中一郎', '高橋由美'] : 
                                          workDate.date === '1' ? ['佐藤花子', '山田次郎', '鈴木美咲'] : [];
                    return (
                      <TableCell 
                        key={workDate.date} 
                        sx={{ 
                          border: '1px solid #d5dbdb', 
                          textAlign: 'center',
                          padding: '4px',
                          fontSize: '0.7rem',
                          backgroundColor: 'white',
                          verticalAlign: 'top'
                        }}
                      >
                        {freeEntryStaff.map((name: string, index: number) => (
                          <Box key={index} sx={{ mb: 0.3 }}>
                            <Typography variant="caption" sx={{ fontSize: '0.65rem', lineHeight: 1.1 }}>
                              {name}
                            </Typography>
                          </Box>
                        ))}
                      </TableCell>
                    );
                  })}
                </TableRow>
              </TableBody>
            </Table>
          </Box>

          {/* 詳細情報（展開可能） */}
          <Box sx={{ mb: 3 }}>
            <Button
              onClick={() => setDetailInfoExpanded(!detailInfoExpanded)}
              sx={{ 
                width: '100%', 
                justifyContent: 'space-between',
                textTransform: 'none',
                p: 2,
                backgroundColor: '#f8f9fa',
                border: '1px solid #e9ecef',
                borderRadius: '8px',
                '&:hover': { backgroundColor: '#e9ecef' }
              }}
              endIcon={detailInfoExpanded ? <ExpandLess /> : <ExpandMore />}
            >
              <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#2c3e50' }}>
                詳細情報
              </Typography>
            </Button>

            <Collapse in={detailInfoExpanded}>
              <Box sx={{ pt: 2 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {/* 現場連絡先 */}
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: '500', color: '#5d6d7e', mb: 1 }}>
                      現場連絡先
                    </Typography>
                    {detailEditMode ? (
                      <TextField
                        value={workDetails.fieldContactName}
                        onChange={(e) => handleWorkDetailsUpdate('fieldContactName', e.target.value)}
                        size="small"
                        variant="outlined"
                        fullWidth
                        placeholder="未入力"
                      />
                    ) : (
                      <Typography variant="body2" sx={{ color: '#2c3e50' }}>
                        {workDetails.fieldContactName}
                      </Typography>
                    )}
                  </Box>
                  
                  {/* 稼働時間 */}
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: '500', color: '#5d6d7e', mb: 1 }}>
                      稼働時間
                    </Typography>
                    {detailEditMode ? (
                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        <TextField
                          type="time"
                          value={workDetails.workStartTime}
                          onChange={(e) => handleWorkDetailsUpdate('workStartTime', e.target.value)}
                          size="small"
                          variant="outlined"
                          sx={{ width: '120px' }}
                        />
                        <Typography sx={{ mx: 1 }}>〜</Typography>
                        <TextField
                          type="time"
                          value={workDetails.workEndTime}
                          onChange={(e) => handleWorkDetailsUpdate('workEndTime', e.target.value)}
                          size="small"
                          variant="outlined"
                          sx={{ width: '120px' }}
                        />
                      </Box>
                    ) : (
                      <Typography variant="body2" sx={{ color: '#2c3e50' }}>
                        {workDetails.workStartTime} 〜 {workDetails.workEndTime}
                      </Typography>
                    )}
                  </Box>
                  
                  {/* 服装 */}
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: '500', color: '#5d6d7e', mb: 1 }}>
                      服装
                    </Typography>
                    {detailEditMode ? (
                      <TextField
                        value={workDetails.uniform}
                        onChange={(e) => handleWorkDetailsUpdate('uniform', e.target.value)}
                        size="small"
                        variant="outlined"
                        fullWidth
                      />
                    ) : (
                      <Typography variant="body2" sx={{ color: '#2c3e50' }}>
                        {workDetails.uniform}
                      </Typography>
                    )}
                  </Box>
                  
                  {/* 目標 */}
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: '500', color: '#5d6d7e', mb: 1 }}>
                      目標
                    </Typography>
                    {detailEditMode ? (
                      <TextField
                        value={workDetails.target}
                        onChange={(e) => handleWorkDetailsUpdate('target', e.target.value)}
                        size="small"
                        variant="outlined"
                        fullWidth
                      />
                    ) : (
                      <Typography variant="body2" sx={{ color: '#2c3e50' }}>
                        {workDetails.target}
                      </Typography>
                    )}
                  </Box>
                  
                  {/* 他社 */}
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: '500', color: '#5d6d7e', mb: 1 }}>
                      他社
                    </Typography>
                    {detailEditMode ? (
                      <TextField
                        value={workDetails.otherCompany}
                        onChange={(e) => handleWorkDetailsUpdate('otherCompany', e.target.value)}
                        size="small"
                        variant="outlined"
                        fullWidth
                        placeholder="未入力"
                      />
                    ) : (
                      <Typography variant="body2" sx={{ color: '#2c3e50' }}>
                        {workDetails.otherCompany}
                      </Typography>
                    )}
                  </Box>
                  
                  {/* 常勤 */}
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: '500', color: '#5d6d7e', mb: 1 }}>
                      常勤
                    </Typography>
                    {detailEditMode ? (
                      <TextField
                        value={workDetails.regularStaff}
                        onChange={(e) => handleWorkDetailsUpdate('regularStaff', e.target.value)}
                        size="small"
                        variant="outlined"
                        fullWidth
                        placeholder="未入力"
                      />
                    ) : (
                      <Typography variant="body2" sx={{ color: '#2c3e50' }}>
                        {workDetails.regularStaff}
                      </Typography>
                    )}
                  </Box>
                  
                  {/* 集合 */}
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: '500', color: '#5d6d7e', mb: 1 }}>
                      集合
                    </Typography>
                    {detailEditMode ? (
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <TextField
                          type="time"
                          value={workDetails.meetingTime}
                          onChange={(e) => handleWorkDetailsUpdate('meetingTime', e.target.value)}
                          size="small"
                          variant="outlined"
                          fullWidth
                        />
                        <TextField
                          value={workDetails.meetingPlace}
                          onChange={(e) => handleWorkDetailsUpdate('meetingPlace', e.target.value)}
                          size="small"
                          variant="outlined"
                          placeholder="場所"
                          fullWidth
                        />
                      </Box>
                    ) : (
                      <Typography variant="body2" sx={{ color: '#2c3e50' }}>
                        {workDetails.meetingTime} {workDetails.meetingPlace}
                      </Typography>
                    )}
                  </Box>
                  
                  {/* 特記事項 */}
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: '500', color: '#5d6d7e', mb: 1 }}>
                      特記事項
                    </Typography>
                    {detailEditMode ? (
                      <TextField
                        value={workDetails.specialNotes}
                        onChange={(e) => handleWorkDetailsUpdate('specialNotes', e.target.value)}
                        size="small"
                        variant="outlined"
                        multiline
                        rows={3}
                        fullWidth
                      />
                    ) : (
                      <Typography variant="body2" sx={{ color: '#2c3e50' }}>
                        {workDetails.specialNotes}
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Box>
            </Collapse>
          </Box>

          {/* コミュニケーション機能 */}
          <Box sx={{ mt: 3 }}>
            <CommunicationPanel
              communications={workDetails.communications}
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
  );
};

export default WorkDetailDrawer; 