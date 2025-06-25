'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Container,
  Paper,
  Alert,
  Chip,
  AppBar,
  Toolbar,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField
} from '@mui/material';
import {
  Send,
  Person,
  Visibility,
  Info,
  Dashboard,
  Comment
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useShiftStore } from '../../../../stores/shiftStore';
import StaffHeader from '../../../../components/staff/StaffHeader';

type ShiftStatus = '○' | '×' | '△';

interface ShiftData {
  [key: string]: ShiftStatus;
}

export default function StaffInputPage() {
  const router = useRouter();
  
  const [currentYear, setCurrentYear] = useState(2025);
  const [currentMonth, setCurrentMonth] = useState(6);
  const [selectedMode, setSelectedMode] = useState<ShiftStatus>('○');
  const [shiftData, setShiftData] = useState<ShiftData>({});
  const [comment, setComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUserName, setCurrentUserName] = useState<string>('');
  const [message, setMessage] = useState('');

  // グローバルストアの利用
  const {
    getShifts,
    updateShift
  } = useShiftStore();
  
  // ダミー関数
  const saveAsDraft = async () => {
    // ダミー実装
  };
  
  const updateStaffSubmissionStatus = (staffId: string, status: string) => {
    // ダミー実装
  };
  
  const staffMembers: any[] = [];

  // 安全なlocalStorageアクセス関数
  const safeGetLocalStorage = (key: string): string | null => {
    if (typeof window === 'undefined') return null;
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error('localStorage読み取りエラー:', error);
      return null;
    }
  };

  const safeSetLocalStorage = (key: string, value: string): boolean => {
    if (typeof window === 'undefined') return false;
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (error) {
      console.error('localStorage書き込みエラー:', error);
      return false;
    }
  };

  // 認証とユーザー情報の初期化
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isLoggedIn = safeGetLocalStorage('staff_logged_in');
      const userId = safeGetLocalStorage('user_id');
      const userName = safeGetLocalStorage('user_name');
      
      if (!isLoggedIn || !userId) {
        safeSetLocalStorage('staff_logged_in', 'true');
        safeSetLocalStorage('user_id', '1205000011');
        safeSetLocalStorage('user_name', '佐藤孝郁');
        setCurrentUserId('1205000011');
        setCurrentUserName('佐藤孝郁');
        setIsLoggedIn(true);
      } else {
        setCurrentUserId(userId);
        setCurrentUserName(userName || '');
        setIsLoggedIn(true);
      }
    }
  }, []);

  // 提出状態の確認
  useEffect(() => {
    if (currentUserId && staffMembers.length > 0) {
      const currentStaff = staffMembers.find(staff => staff.id === currentUserId);
      if (currentStaff) {
        setIsSubmitted(currentStaff.submissionStatus === 'submitted');
      }
    }
  }, [currentUserId, staffMembers]);

  // グローバルストアの年月と同期（一時的に無効化）
  // useEffect(() => {
  //   setCurrentDate(currentYear.toString(), currentMonth.toString());
  // }, [currentYear, currentMonth, setCurrentDate]);

  // グローバルストアからシフトデータを読み込み
  useEffect(() => {
    if (currentUserId) {
      const globalShifts = getShifts(currentYear.toString(), currentMonth.toString());
      const userShifts = globalShifts.filter(shift => shift.staffId === currentUserId);
      
      const shiftDataFromGlobal: ShiftData = {};
      let savedComment = '';
      
      userShifts.forEach(shift => {
        const key = shift.date;
        shiftDataFromGlobal[key] = shift.status;
        // 最初に見つかったコメントを使用（通常は同じ月のシフトは同じコメント）
        if (shift.comment && !savedComment) {
          savedComment = shift.comment;
        }
      });
      
      setShiftData(shiftDataFromGlobal);
      if (savedComment && isSubmitted) {
        setComment(savedComment);
      }
    }
  }, [currentYear, currentMonth, currentUserId, getShifts, isSubmitted]);

  // カレンダー生成（月曜始まり）
  const generateCalendar = () => {
    const year = currentYear;
    const month = currentMonth;
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    const daysInMonth = lastDay.getDate();
    
    // 月曜始まりに調整：日曜=0を6に、月曜=1を0に変換
    const startWeekday = firstDay.getDay();
    const adjustedStartWeekday = startWeekday === 0 ? 6 : startWeekday - 1;
    
    const weeks = [];
    let currentWeek = [];
    
    // 前月の日付で空のセルを埋める
    for (let i = 0; i < adjustedStartWeekday; i++) {
      currentWeek.push(null);
    }
    
    // 今月の日付を追加
    for (let day = 1; day <= daysInMonth; day++) {
      currentWeek.push(day);
      
      // 週末（日曜日）になったら新しい週を開始
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    }
    
    // 最後の週が7日未満の場合、空のセルで埋める
    while (currentWeek.length < 7 && currentWeek.length > 0) {
      currentWeek.push(null);
    }
    if (currentWeek.length > 0) {
      weeks.push(currentWeek);
    }
    
    return weeks;
  };

  // 全ての日付が入力されているかチェックする関数
  const isAllDaysCompleted = () => {
    const year = currentYear;
    const month = currentMonth;
    const lastDay = new Date(year, month, 0);
    const daysInMonth = lastDay.getDate();
    
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      if (!shiftData[dateStr]) {
        return false;
      }
    }
    return true;
  };

  // シフト状態の設定
  const setShiftStatus = (day: number) => {
    if (!currentUserId || !isLoggedIn) {
      setMessage('ログインが必要です');
      return;
    }
    
    const dateStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    // ローカル状態を更新
    setShiftData(prev => ({
      ...prev,
      [dateStr]: selectedMode
    }));
    
    // グローバルストアも更新
    const shiftUpdate = {
      id: `${currentUserId}-${dateStr}`,
      date: dateStr,
      staffId: currentUserId,
      status: selectedMode as '○' | '×' | '△',
      submissionStatus: 'draft' as const,
      syncStatus: 'pending' as const,
      lastModified: new Date(),
      version: 1
    };
    
    updateShift(currentYear.toString(), currentMonth.toString(), shiftUpdate.id, shiftUpdate);
  };

  // 管理者に提出
  const handleSubmit = async () => {
    if (!currentUserId || !isLoggedIn) {
      setMessage('ユーザー情報が見つかりません');
      return;
    }

    const shiftEntries = Object.entries(shiftData).filter(([date]) => {
      const entryMonth = new Date(date).getMonth() + 1;
      return entryMonth === currentMonth;
    });

    if (shiftEntries.length === 0) {
      setMessage('シフト希望が入力されていません');
      return;
    }

    setIsLoading(true);
    try {
      for (const [date, status] of shiftEntries) {
        const shiftUpdate = {
          id: `${currentUserId}-${date}`,
          date: date,
          staffId: currentUserId,
          status: status as '○' | '×' | '△',
          submissionStatus: 'submitted' as const,
          syncStatus: 'pending' as const,
          lastModified: new Date(),
          version: 1,
          comment: comment.trim() || undefined
        };
        updateShift(currentYear.toString(), currentMonth.toString(), shiftUpdate.id, shiftUpdate);
      }
      
      updateStaffSubmissionStatus(currentUserId, 'submitted');
      await saveAsDraft();
      
      setIsSubmitted(true);
      setMessage(`${currentYear}年${currentMonth}月のシフト希望を提出しました！${comment.trim() ? '\nコメント: ' + comment.trim() : ''}`);
      setTimeout(() => setMessage(''), 5000);
     
    } catch (error) {
      console.error('提出エラー:', error);
      setMessage('提出に失敗しました');
      setTimeout(() => setMessage(''), 5000);
    } finally {
      setIsLoading(false);
    }
  };

  // セルのスタイルを取得
  const getCellStyle = (day: number | null, dayIndex: number) => {
    const isSaturday = dayIndex === 5;
    const isSunday = dayIndex === 6;
    
    if (!day) {
      return { 
        backgroundColor: isSaturday ? '#e3f2fd' : isSunday ? '#fce4ec' : '#fafafa',
        cursor: 'default',
        height: '48px',
        border: '1px solid #e0e0e0',
        borderTop: 0,
        borderLeft: dayIndex === 0 ? '1px solid #e0e0e0' : 0
      };
    }
    
    const dateStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const status = shiftData[dateStr] || '';
    
    // 土日の背景色をベースに設定
    let backgroundColor = '#ffffff';
    if (isSaturday) {
      backgroundColor = '#e3f2fd'; // 薄い青
    } else if (isSunday) {
      backgroundColor = '#fce4ec'; // 薄いピンク
    }

    return { 
      backgroundColor, 
      color: '#333333',
      cursor: 'pointer',
      height: '48px',
      border: '1px solid #e0e0e0',
      borderTop: 0,
      borderLeft: dayIndex === 0 ? '1px solid #e0e0e0' : 0,
      '&:hover': {
        boxShadow: 'inset 0 0 0 2px #1976d2'
      }
    };
  };

  // シフト状態のスタイルを取得（限定的な装飾）
  const getStatusStyle = (status: string) => {
    switch (status) {
      case '○':
        return {
          backgroundColor: '#e8f5e9',
          color: '#2e7d32',
          borderRadius: '4px',
          padding: '2px 6px',
          fontSize: '1rem',
          fontWeight: 600,
          minWidth: '20px',
          textAlign: 'center' as const,
          display: 'inline-block',
          boxShadow: '0 1px 3px rgba(76, 175, 80, 0.2)'
        };
      case '×':
        return {
          backgroundColor: '#ffebee',
          color: '#d32f2f',
          borderRadius: '4px',
          padding: '2px 6px',
          fontSize: '1rem',
          fontWeight: 600,
          minWidth: '20px',
          textAlign: 'center' as const,
          display: 'inline-block',
          boxShadow: '0 1px 3px rgba(244, 67, 54, 0.2)'
        };
      case '△':
        return {
          backgroundColor: '#fffbcc',
          color: '#b8860b',
          borderRadius: '4px',
          padding: '2px 6px',
          fontSize: '1rem',
          fontWeight: 600,
          minWidth: '20px',
          textAlign: 'center' as const,
          display: 'inline-block',
          boxShadow: '0 1px 3px rgba(184, 134, 11, 0.2)'
        };
      default:
        return null;
    }
  };

  // 曜日ヘッダーのスタイル
  const getHeaderStyle = (dayIndex: number) => {
    const isSaturday = dayIndex === 5;
    const isSunday = dayIndex === 6;
    
    return {
      backgroundColor: isSaturday ? '#2196f3' : isSunday ? '#e91e63' : '#9e9e9e',
      color: 'white',
      fontWeight: 600,
      textAlign: 'center' as const,
      padding: '6px 2px',
      fontSize: '0.75rem',
      border: '1px solid #e0e0e0',
      borderLeft: dayIndex === 0 ? '1px solid #e0e0e0' : 0
    };
  };

  const weeks = generateCalendar();
  const weekdays = ['月', '火', '水', '木', '金', '土', '日'];

  // ログイン状態が確定するまで待機
  if (!isLoggedIn) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Typography>ログイン情報を確認中...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ backgroundColor: '#fafafa', minHeight: '100vh' }}>
      {/* ヘッダー */}
      <StaffHeader 
        title="シフト希望入力"
        currentPage="input"
        userName={currentUserName}
      />

      <Container maxWidth="sm" sx={{ py: 2 }}>
        {/* メッセージ表示 */}
        {message && (
          <Alert severity={message.includes('失敗') ? 'error' : 'success'} sx={{ mb: 2 }}>
            {message}
          </Alert>
        )}

        {/* 月選択と入力モード */}
        <Paper elevation={1} sx={{ mb: 2 }}>
          <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, flexWrap: 'wrap' }}>
              <FormControl size="small" sx={{ minWidth: 80, flex: '0 0 auto' }}>
                <InputLabel>年</InputLabel>
                <Select
                  value={currentYear}
                  onChange={(e) => setCurrentYear(Number(e.target.value))}
                  label="年"
                >
                  <MenuItem value={2024}>2024</MenuItem>
                  <MenuItem value={2025}>2025</MenuItem>
                  <MenuItem value={2026}>2026</MenuItem>
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 70, flex: '0 0 auto' }}>
                <InputLabel>月</InputLabel>
                <Select
                  value={currentMonth}
                  onChange={(e) => setCurrentMonth(Number(e.target.value))}
                  label="月"
                >
                  {Array.from({ length: 12 }, (_, i) => (
                    <MenuItem key={i + 1} value={i + 1}>
                      {i + 1}月
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Chip 
                label={isSubmitted ? '提出済' : '未提出'}
                color={isSubmitted ? 'success' : 'warning'}
                size="small"
                sx={{ fontSize: '0.7rem', height: 24 }}
              />
            </Box>
            
            {/* プルダウン形式の入力モード */}
            <FormControl size="small" fullWidth>
              <InputLabel>入力モード</InputLabel>
              <Select
                value={selectedMode}
                onChange={(e) => setSelectedMode(e.target.value as ShiftStatus)}
                label="入力モード"
              >
                <MenuItem value="○">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{
                      width: 18,
                      height: 18,
                      backgroundColor: '#e8f5e9',
                      color: '#2e7d32',
                      borderRadius: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.7rem',
                      fontWeight: 600
                    }}>
                      ○
                    </Box>
                    <Typography sx={{ fontSize: '0.85rem' }}>勤務希望</Typography>
                  </Box>
                </MenuItem>
                <MenuItem value="×">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{
                      width: 18,
                      height: 18,
                      backgroundColor: '#ffebee',
                      color: '#d32f2f',
                      borderRadius: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.7rem',
                      fontWeight: 600
                    }}>
                      ×
                    </Box>
                    <Typography sx={{ fontSize: '0.85rem' }}>勤務不可</Typography>
                  </Box>
                </MenuItem>
                <MenuItem value="△">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{
                      width: 18,
                      height: 18,
                      backgroundColor: '#fffbcc',
                      color: '#b8860b',
                      borderRadius: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.7rem',
                      fontWeight: 600
                    }}>
                      △
                    </Box>
                    <Typography sx={{ fontSize: '0.85rem' }}>未定</Typography>
                  </Box>
                </MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/* カレンダー */}
          <Box sx={{ p: 0 }}>
            {/* 曜日ヘッダー */}
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
              {weekdays.map((day, index) => (
                <Box key={day} sx={getHeaderStyle(index)}>
                  {day}
                </Box>
              ))}
            </Box>

            {/* カレンダー本体 */}
            {weeks.map((week, weekIndex) => (
              <Box key={weekIndex} sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
                {week.map((day, dayIndex) => (
                  <Box
                    key={`${weekIndex}-${dayIndex}`}
                    onClick={() => day && setShiftStatus(day)}
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      ...getCellStyle(day, dayIndex)
                    }}
                  >
                    {day && (
                      <>
                        <Typography variant="body2" sx={{ fontSize: '0.7rem', lineHeight: 1, mb: 0.3 }}>
                          {day}
                        </Typography>
                        {shiftData[`${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`] ? (
                          <Box sx={getStatusStyle(shiftData[`${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`])}>
                            {shiftData[`${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`]}
                          </Box>
                        ) : null}
                      </>
                    )}
                  </Box>
                ))}
              </Box>
            ))}
          </Box>
        </Paper>

        {/* 備考 */}
        <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, color: '#666' }}>
            備考
          </Typography>
          <Typography variant="body2" sx={{ fontSize: '0.8rem', color: '#666', lineHeight: 1.4 }}>
            <strong>・全ての日付の希望を入力してから提出してください。</strong><br/>
            ・一度提出されたシフトは、システム上での訂正ができません。<br/>
            ※シフト提出後の変更につきましては、お手数をおかけいたしますが、自社管理者までお問い合わせください。
          </Typography>
        </Paper>

        {/* コメント入力 */}
        <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Comment sx={{ mr: 1, color: '#666', fontSize: '1.2rem' }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#666' }}>
              コメント（任意）
            </Typography>
          </Box>
          <TextField
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            fullWidth
            multiline
            rows={4}
            placeholder="シフト希望に関するコメントがあればご記入ください（例：特定の日の勤務時間の希望、体調面での配慮事項など）"
            variant="outlined"
            disabled={isSubmitted}
            helperText={`${comment.length}/500文字 ${isSubmitted ? '（提出済みのため編集できません）' : ''}`}
            inputProps={{ maxLength: 500 }}
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: isSubmitted ? '#f5f5f5' : 'white',
              }
            }}
          />
        </Paper>

        {/* アクションボタン */}
        <Box sx={{ display: 'flex', gap: 1, flexDirection: 'column' }}>
          {!isAllDaysCompleted() && !isSubmitted && (
            <Typography variant="body2" sx={{ fontSize: '0.8rem', color: '#d32f2f', textAlign: 'center', mb: 1 }}>
              すべての日付の希望を入力してください
            </Typography>
          )}
          <Button
            variant="contained"
            startIcon={<Send />}
            onClick={handleSubmit}
            disabled={isLoading || isSubmitted || !isAllDaysCompleted()}
            fullWidth
            sx={{ 
              backgroundColor: isSubmitted ? '#4caf50' : '#1976d2'
            }}
          >
            {isLoading ? '送信中...' : isSubmitted ? '提出済み' : '提出'}
          </Button>
        </Box>
      </Container>
    </Box>
  );
} 