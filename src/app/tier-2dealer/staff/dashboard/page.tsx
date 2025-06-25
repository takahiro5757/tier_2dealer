'use client';

import { useState, useEffect, useMemo } from 'react';
import { 
  Box, Container, Typography, Paper, Button, Card, CardContent, 
  Chip, Grid, Alert, Divider
} from '@mui/material';
import { 
  CalendarToday, Schedule, LocationOn, Person, Logout, 
  EditCalendar, CheckCircle, Work, Phone, AccessTime, Cancel, Remove, HelpOutline,
  WorkOutline
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import WorkDetailDrawer from '../../../../components/shifts/WorkDetailDrawer';
import StaffHeader from '../../../../components/staff/StaffHeader';

// 稼働詳細データの型定義
interface WorkDetail {
  date: string;
  dayOfWeek: string;
  status: '確定' | '現場未確定' | '休み' | '詳細未確定';
  agency?: string;
  location?: string;
  startTime?: string;
  endTime?: string;
  rate?: number;
  managerName?: string;
  managerPhone?: string;
  meetingTime?: string;
  meetingPlace?: string;
  uniform?: string;
  notes?: string;
  communications?: any[];
}

// WorkDetailDrawer用の型定義（checkページと同じ仕様）
interface DrawerWorkDetail {
  id: string;
  date: string;
  dayOfWeek: string;
  requestedStatus: '○' | '×' | '△';
  status: '確定' | '休み' | '現場未確定' | '詳細未確定';
  agency?: string;
  location?: string;
  startTime?: string;
  endTime?: string;
  rate: number;
  staffName: string;
  staffRole: string;
  managerName?: string;
  managerPhone?: string;
  meetingTime?: string;
  meetingPlace?: string;
  uniform?: string;
  notes?: string;
  otherCompany?: string;
  regularStaff?: string;
  workStartTime?: string;
  workEndTime?: string;
  target?: string;
  communications?: any[];
  staffDetails?: {
    roles: {
      name: string;
      count: number;
      members: string[];
    }[];
  };
}

// 曜日の日本語変換
const getDayOfWeekJP = (date: Date): string => {
  const days = ['日', '月', '火', '水', '木', '金', '土'];
  return days[date.getDay()];
};

// 日付フォーマット関数
const formatDate = (date: Date): string => {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${month}月${day}日`;
};

// ダミーデータ生成関数
const generateWorkDetail = (date: Date): WorkDetail | null => {
  const dateStr = date.toISOString().split('T')[0];
  const dayOfWeek = getDayOfWeekJP(date);
  const isWeekend = date.getDay() === 0 || date.getDay() === 6;
  
  // 決定論的な疑似ランダム（日付ベース）
  const seed = date.getDate() + date.getMonth() * 31;
  const random = Math.sin(seed) * 10000;
  const pseudoRandom = random - Math.floor(random);
  
  // 70%の確率で稼働あり
  if (pseudoRandom < 0.7) {
    const locations = [
      'イオンモール春日部 風の広場',
      'ららぽーと富士見 1階スリコ前',
      'イオンモール北戸田',
      'アリオ上尾',
      'マルエツ松江',
      '武蔵小山駅前',
      '草加セーモンプラザ',
      '北千住駅前'
    ];
    
    const agencies = ['ピーアップ', '株式会社イベントプロ', '株式会社マーケティングラボ'];
    const managers = ['田中管理者', '佐藤管理者', '山田管理者', '鈴木管理者'];
    const phones = ['090-1111-2222', '090-3333-4444', '090-5555-6666', '090-7777-8888'];
    
    const locationIndex = Math.floor(pseudoRandom * locations.length);
    const agencyIndex = Math.floor((pseudoRandom * 1000) % agencies.length);
    const managerIndex = Math.floor((pseudoRandom * 10000) % managers.length);
    
    // 80%の確率で確定、20%で現場未確定
    const isConfirmed = pseudoRandom > 0.2;
    
    return {
      date: dateStr,
      dayOfWeek,
      status: isConfirmed ? '確定' : '現場未確定',
      agency: agencies[agencyIndex],
      location: isConfirmed ? locations[locationIndex] : undefined,
      startTime: isWeekend ? '10:00' : '11:00',
      endTime: isWeekend ? '18:00' : '19:00',
      rate: isWeekend ? 18000 : 15000,
      managerName: managers[managerIndex],
      managerPhone: phones[managerIndex],
      meetingTime: isConfirmed ? (isWeekend ? '09:30' : '10:30') : undefined,
      meetingPlace: isConfirmed ? '現地集合' : undefined,
      uniform: isConfirmed ? 'スーツ着用' : undefined,
      notes: isConfirmed ? '笑顔で接客をお願いします' : '詳細は後日連絡いたします',
      communications: []
    };
  }
  
  return {
    date: dateStr,
    dayOfWeek,
    status: '休み',
    communications: []
  };
};

// 2次店スタッフのダミーデータ
const dummyStaffMembers = [
  {
    id: 'staff001',
    name: '田中太郎',
    nameKana: 'タナカタロウ',
    station: '池袋駅',
    weekdayRate: 15000,
    holidayRate: 18000,
    tel: '090-1111-1111',
    role: 'クローザー',
    company: '2次店スタッフ'
  },
  {
    id: 'staff002',
    name: '佐藤花子',
    nameKana: 'サトウハナコ',
    station: '新宿駅',
    weekdayRate: 14000,
    holidayRate: 17000,
    tel: '090-2222-2222',
    role: 'ガール',
    company: '2次店スタッフ'
  }
];

export default function StaffDashboardPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<{id: string, name: string} | null>(null);
  const [selectedWorkDetail, setSelectedWorkDetail] = useState<DrawerWorkDetail | null>(null);
  const [isWorkDetailOpen, setIsWorkDetailOpen] = useState(false);
  
  // 認証チェック
  useEffect(() => {
    const isLoggedIn = localStorage.getItem('staff_logged_in');
    const userId = localStorage.getItem('current_staff_id');
    const userName = localStorage.getItem('current_staff_name');
    
    if (!isLoggedIn || !userId) {
      router.push('/tier-2dealer/staff/login');
      return;
    }
    
    setCurrentUser({ id: userId, name: userName || 'スタッフ' });
  }, [router]);

  // 今日と明日の日付
  const today = useMemo(() => new Date(), []);
  const tomorrow = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    return date;
  }, []);

  // 稼働詳細データ
  const todayWork = useMemo(() => {
    const work = generateWorkDetail(today);
    if (work && work.status !== '休み') {
      // 今日は常に確定にする
      return {
        ...work,
        status: '確定' as const
      };
    }
    return work;
  }, [today]);
  
  const tomorrowWork = useMemo(() => {
    const work = generateWorkDetail(tomorrow);
    if (work && work.status !== '休み') {
      // 明日は常に詳細未確定にする
      return {
        ...work,
        status: '現場未確定' as const
      };
    }
    return work;
  }, [tomorrow]);

  // ログアウト処理
  const handleLogout = () => {
    localStorage.removeItem('staff_logged_in');
    localStorage.removeItem('current_staff_id');
    localStorage.removeItem('current_staff_name');
    localStorage.removeItem('login_time');
    router.push('/tier-2dealer/staff/login');
  };

  // WorkDetailをDrawerWorkDetailに変換（checkページと同じ仕様）
  const convertToDrawerWorkDetail = (work: WorkDetail, title: string): DrawerWorkDetail => {
    const targetDate = title === '今日の稼働' ? today : tomorrow;
    const day = targetDate.getDate();
    const month = targetDate.getMonth() + 1;
    
    // statusの正しい変換
    let drawerStatus: '確定' | '休み' | '現場未確定' | '詳細未確定';
    if (work.status === '休み') {
      drawerStatus = '休み';
    } else if (work.status === '確定') {
      drawerStatus = '確定';
    } else {
      drawerStatus = '現場未確定';
    }
    
    return {
      id: work.date,
      date: `${month}月${day}日`, // checkページと同じフォーマット
      dayOfWeek: work.dayOfWeek,
      requestedStatus: '○', // 稼働がある場合は希望していたと仮定
      status: drawerStatus,
      agency: work.agency,
      location: work.location,
      startTime: work.startTime,
      endTime: work.endTime,
      rate: work.rate || 0,
      staffName: currentUser?.name || 'スタッフ',
      staffRole: 'クローザー',
      managerName: work.managerName,
      managerPhone: work.managerPhone,
      meetingTime: work.meetingTime,
      meetingPlace: work.meetingPlace,
      uniform: work.uniform,
      notes: work.notes,
      otherCompany: work.agency,
      regularStaff: undefined,
      workStartTime: work.startTime,
      workEndTime: work.endTime,
      target: '一般客',
      communications: work.communications || [],
      staffDetails: {
        roles: [
          {
            name: 'クローザー',
            count: 6,
            members: ['田中太郎', '佐藤次郎', '山田三郎', '鈴木四郎', '高橋五郎', '渡辺六郎']
          },
          {
            name: 'ガール',
            count: 9,
            members: ['田中花子', '佐藤美咲', '山田由美', '鈴木愛子', '高橋香織', '渡辺真理', '伊藤優子', '中村恵子', '小林麻衣']
          },
          {
            name: '無料入店',
            count: 12,
            members: ['佐藤花子', '山田次郎', '鈴木美咲', '田中一郎', '高橋由美', '渡辺健太', '伊藤直子', '中村浩二', '小林あかり', '松本和也', '木村さくら', '加藤大輔']
          }
        ]
      }
    };
  };

  // 稼働詳細ポップアップを開く
  const handleOpenWorkDetail = (work: WorkDetail, title: string) => {
    if (work.status === '休み') return; // 休みの場合は開かない
    
    const drawerWorkDetail = convertToDrawerWorkDetail(work, title);
    setSelectedWorkDetail(drawerWorkDetail);
    setIsWorkDetailOpen(true);
  };

  // 稼働詳細ポップアップを閉じる
  const handleCloseWorkDetail = () => {
    setIsWorkDetailOpen(false);
    setSelectedWorkDetail(null);
  };

  // 稼働詳細更新（今回は読み取り専用なので空実装）
  const handleUpdateWorkDetail = (updates: Partial<WorkDetail>) => {
    if (selectedWorkDetail) {
      // DrawerWorkDetailからWorkDetailに必要な部分のみ更新
      const workDetailUpdates: Partial<DrawerWorkDetail> = {};
      
      // 共通のプロパティのみコピー
      if (updates.status) workDetailUpdates.status = updates.status;
      if (updates.agency) workDetailUpdates.agency = updates.agency;
      if (updates.location) workDetailUpdates.location = updates.location;
      if (updates.startTime) workDetailUpdates.startTime = updates.startTime;
      if (updates.endTime) workDetailUpdates.endTime = updates.endTime;
      if (updates.managerName) workDetailUpdates.managerName = updates.managerName;
      if (updates.managerPhone) workDetailUpdates.managerPhone = updates.managerPhone;
      if (updates.meetingTime) workDetailUpdates.meetingTime = updates.meetingTime;
      if (updates.meetingPlace) workDetailUpdates.meetingPlace = updates.meetingPlace;
      if (updates.uniform) workDetailUpdates.uniform = updates.uniform;
      if (updates.notes) workDetailUpdates.notes = updates.notes;
      if (updates.communications) workDetailUpdates.communications = updates.communications;
      
      setSelectedWorkDetail({ ...selectedWorkDetail, ...workDetailUpdates });
    }
  };

  // 稼働詳細カードコンポーネント（コンパクト版）
  const WorkDetailCard = ({ work, title }: { work: WorkDetail | null, title: string }) => {
    if (!work) return null;

    const hasWork = work.status !== '休み';
    const isConfirmed = work.status && work.status === '確定';
    const isClickable = hasWork && isConfirmed;
    const targetDate = title === '今日の稼働' ? today : tomorrow;

    // checkページと同じステータス設定
    const statusConfig: Record<string, { label: string; color: 'success' | 'warning' | 'info' | 'error' | 'default' | 'primary' | 'secondary'; icon: React.ReactElement }> = {
      '確定': { label: '確定', color: 'success', icon: <WorkOutline /> },
      '現場未確定': { label: '現場未定', color: 'warning', icon: <LocationOn /> },
      '詳細未確定': { label: '詳細未定', color: 'info', icon: <Schedule /> },
      '休み': { label: '休み', color: 'error', icon: <Cancel /> }
    };

    const currentStatus = statusConfig[work.status];

    return (
      <Card 
        sx={{ 
          height: 'fit-content',
          border: hasWork ? '2px solid #e0e0e0' : '1px solid #f0f0f0',
          backgroundColor: hasWork ? '#fff' : '#fafafa',
          cursor: isClickable ? 'pointer' : 'default',
          transition: 'all 0.2s ease',
          '&:hover': isClickable ? {
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            transform: 'translateY(-2px)'
          } : {}
        }}
        onClick={() => isClickable && handleOpenWorkDetail(work, title)}
      >
        <CardContent sx={{ pt: 1, px: 1, pb: 0, display: 'flex', flexDirection: 'column' }}>
          {/* タイトル＋上部左右分割レイアウト */}
          <Box sx={{ mb: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', fontSize: '0.93rem', textAlign: 'center', mb: 0.5 }}>
              {title}
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1 }}>
              {/* 左：日付・曜日 */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '1rem' }}>
                  {formatDate(targetDate)}
                </Typography>
                <Typography variant="body2" sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>
                  ({work.dayOfWeek})
                </Typography>
              </Box>
              {/* 右：ステータスChipのみ */}
              <Chip
                label={currentStatus.label}
                variant="outlined"
                color={work.status === '現場未確定' ? undefined : currentStatus.color as 'success' | 'warning' | 'info' | 'error' | 'default' | 'primary' | 'secondary'}
                size="small"
                sx={{
                  fontSize: '0.6rem',
                  height: 24,
                  fontWeight: 'bold',
                  borderWidth: 2,
                  '& .MuiChip-label': { px: 0.4 },
                  ...(work.status === '現場未確定' && {
                    borderColor: '#C3AF45',
                    color: '#C3AF45'
                  })
                }}
              />
            </Box>
          </Box>

          {/* 下部：詳細情報（勤務がある場合のみ） */}
          {work.status === '確定' && (
            <Box sx={{ pt: 0.2, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 0.3, pb: 0 }}>
              {/* 左下：勤務情報まとめて表示 */}
              <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 0.3, pb: 0 }}>
                <Typography variant="body2" sx={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'text.secondary', mb: 0 }}>
                  勤務場所：<span style={{ color: '#222' }}>{work.location || '未定'}</span>
                </Typography>
                <Typography variant="body2" sx={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'text.secondary', mb: 0 }}>
                  勤務時間：<span style={{ color: '#222' }}>{work.startTime && work.endTime ? `${work.startTime}-${work.endTime}` : '未定'}</span>
                </Typography>
                <Typography variant="body2" sx={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'text.secondary', mb: 0 }}>
                  集　　合：<span style={{ color: '#222' }}>{(work.meetingTime || work.meetingPlace) ? `${work.meetingTime || ''} ${work.meetingPlace || ''}`.trim() : '未定'}</span>
                </Typography>
              </Box>
              {/* 右端：詳細タップ */}
              <Box sx={{ textAlign: 'right', minWidth: 'fit-content', pb: 0 }}>
                <Typography variant="body2" color="primary" sx={{ fontSize: '0.7rem', fontWeight: 'bold', mb: 0 }}>
                  詳細
                </Typography>
                <Typography variant="body2" sx={{ fontSize: '0.65rem', color: 'text.secondary', mb: 0 }}>
                  タップ
                </Typography>
              </Box>
            </Box>
          )}
          {work.status === '詳細未確定' && (
            <Box sx={{ pt: 0.2, display: 'flex', alignItems: 'flex-start', gap: 0.3 }}>
              {/* 左下：勤務場所のみ */}
              <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 0.1 }}>
                <Typography variant="body2" sx={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'text.secondary' }}>
                  勤務場所：<span style={{ color: '#222' }}>{work.location || '未定'}</span>
                </Typography>
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>
    );
  };

  if (!currentUser) {
    return null; // ローディング中
  }

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      {/* ヘッダー */}
      <StaffHeader 
        userName={currentUser?.name}
        userRole="スタッフ"
        title="シフトホーム"
        currentPage="dashboard"
        onLogout={handleLogout}
      />

      <Container maxWidth="md" sx={{ py: 0.5 }}>
        {/* 稼働詳細セクション */}
        <Box sx={{ mb: 1.2 }}>
          <Grid container spacing={1}>
            <Grid item xs={12} md={6}>
              <WorkDetailCard work={todayWork} title="今日の稼働" />
            </Grid>
            <Grid item xs={12} md={6}>
              <WorkDetailCard work={tomorrowWork} title="明日の稼働" />
            </Grid>
          </Grid>
        </Box>

        {/* 重要なお知らせ */}
        {(todayWork?.status === '確定' || tomorrowWork?.status === '確定') && (
          <Alert severity="info" sx={{ mb: 1.2, py: 0.7 }}>
            <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
              稼働が確定している日は、集合時間と場所を必ずご確認ください。
            </Typography>
          </Alert>
        )}

        {/* ナビゲーションボタン */}
        <Paper sx={{ p: 1.2, borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 1, fontSize: '0.95rem' }}>
            メニュー
          </Typography>
          
          <Grid container spacing={1}>
            <Grid item xs={12} sm={6}>
              <Button
                variant="contained"
                fullWidth
                size="medium"
                startIcon={<EditCalendar />}
                onClick={() => router.push('/tier-2dealer/staff/input')}
                sx={{ 
                  py: 1,
                  backgroundColor: '#2e7d32',
                  '&:hover': { backgroundColor: '#1b5e20' }
                }}
              >
                <Box>
                  <Typography variant="button" sx={{ fontWeight: 'bold', fontSize: '0.85rem' }}>
                    シフト希望入力
                  </Typography>
                  <Typography variant="caption" sx={{ display: 'block', fontSize: '0.6rem' }}>
                    来月のシフト希望を入力
                  </Typography>
                </Box>
              </Button>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Button
                variant="contained"
                fullWidth
                size="medium"
                startIcon={<CheckCircle />}
                onClick={() => router.push('/tier-2dealer/staff/check')}
                sx={{ 
                  py: 1,
                  backgroundColor: '#1976d2',
                  '&:hover': { backgroundColor: '#1565c0' }
                }}
              >
                <Box>
                  <Typography variant="button" sx={{ fontWeight: 'bold', fontSize: '0.85rem' }}>
                    シフト確認
                  </Typography>
                  <Typography variant="caption" sx={{ display: 'block', fontSize: '0.6rem' }}>
                    確定したシフトを確認
                  </Typography>
                </Box>
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </Container>

      {/* 稼働詳細ポップアップ */}
      {selectedWorkDetail && (
        <WorkDetailDrawer
          open={isWorkDetailOpen}
          onClose={handleCloseWorkDetail}
          date={selectedWorkDetail.date}
          assignments={[]}
          staff={dummyStaffMembers}
        />
      )}
    </Box>
  );
} 