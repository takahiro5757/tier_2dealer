'use client';

import { useState, useEffect, useMemo } from 'react';
import { 
  Box, Container, Typography, Paper, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Button, Alert, AppBar, Toolbar, Chip, Grid
} from '@mui/material';
import { 
  CheckCircle, Cancel, Remove, Logout, CalendarToday, ArrowBack, Dashboard, HelpOutline 
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import YearMonthSelector from '../../../../components/YearMonthSelector';
import WorkDetailDrawer from '../../../../components/shifts/WorkDetailDrawer';
import StaffHeader from '../../../../components/staff/StaffHeader';

// 確定シフトデータの型定義
interface ConfirmedShift {
  date: string;
  staffId: string;
  requestedStatus: '○' | '×' | '-'; // スタッフが希望した記号
  status: '確定' | '休み' | '現場未確定' | '詳細未確定';
  agency?: string;
  location?: string;
  startTime?: string;
  endTime?: string;
  rate: number;
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
}

// 稼働詳細データの型定義（WorkDetailDrawer用）
interface WorkDetail {
  id: string;
  date: string;
  dayOfWeek: string;
  requestedStatus: '○' | '×' | '-';
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
    company: '2次店スタッフ',
    status: 'submitted'
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
    company: '2次店スタッフ',
    status: 'submitted'
  },
  {
    id: 'staff003',
    name: '山田次郎',
    nameKana: 'ヤマダジロウ',
    station: '渋谷駅',
    weekdayRate: 16000,
    holidayRate: 19000,
    tel: '090-3333-3333',
    role: 'クローザー',
    company: '2次店スタッフ',
    status: 'draft'
  },
  {
    id: 'staff004',
    name: '鈴木美咲',
    nameKana: 'スズキミサキ',
    station: '銀座駅',
    weekdayRate: 15500,
    holidayRate: 18500,
    tel: '090-4444-4444',
    role: 'ガール',
    company: '2次店スタッフ',
    status: 'submitted'
  },
  {
    id: 'staff005',
    name: '高橋健太',
    nameKana: 'タカハシケンタ',
    station: '浦和駅',
    weekdayRate: 14500,
    holidayRate: 17500,
    tel: '090-5555-5555',
    role: 'クローザー',
    company: '2次店スタッフ',
    status: 'draft'
  }
];

// エリア別の代表的な場所リスト
const LOCATIONS = [
  '新宿エリア', '渋谷エリア', '池袋エリア', '銀座エリア', '六本木エリア',
  '恵比寿エリア', '表参道エリア', '秋葉原エリア', '上野エリア', '品川エリア'
];

// 決定論的な疑似ランダム関数
const seedRandom = (seed: number): number => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

// 確定シフトダミーデータ生成
const generateConfirmedShifts = (year: number, month: number, staffId: string): ConfirmedShift[] => {
  const shifts: ConfirmedShift[] = [];
  const daysInMonth = new Date(year, month, 0).getDate();
  
  // スタッフ情報を取得
  const staff = dummyStaffMembers.find(s => s.id === staffId);
  if (!staff) return shifts;
  
  const staffIdNum = parseInt(staffId.replace(/[^0-9]/g, '')) || 1;
  
  // 希望記号を事前に配分（○22日、残りは×）
  const requestedStatusArray: ('○' | '×' | '-')[] = [];
  
  // ○を22日分追加（月の日数が22日未満の場合は全日）
  const marumDays = Math.min(22, daysInMonth);
  for (let i = 0; i < marumDays; i++) {
    requestedStatusArray.push('○');
  }
  
  // 残りは×
  const batchuDays = daysInMonth - marumDays;
  for (let i = 0; i < batchuDays; i++) {
    requestedStatusArray.push('×');
  }
  
  // 配列を決定論的にシャッフル
  for (let i = requestedStatusArray.length - 1; i > 0; i--) {
    const j = Math.floor(seedRandom(staffIdNum * i + year * month) * (i + 1));
    [requestedStatusArray[i], requestedStatusArray[j]] = [requestedStatusArray[j], requestedStatusArray[i]];
  }
  
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month - 1, day);
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const dateStr = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    
    // 事前に配分した希望記号を取得
    const requestedStatus = requestedStatusArray[day - 1];
    
    // 希望に基づいて確定結果を決定
    let status: '確定' | '休み' | '現場未確定' | '詳細未確定' = '休み'; // デフォルト値を設定
    let location = undefined;
    let startTime = undefined;
    let endTime = undefined;
    
    if (requestedStatus === '×') {
      // ×（稼働不可）→ 休み
      status = '休み';
    } else if (requestedStatus === '○') {
      // ○（希望あり）→ 様々なパターンで稼働
      const rand = seedRandom(staffIdNum * day + year * 50);
      
      if (day >= 25) {
        // 25日以降は現場未確定
        status = '現場未確定';
      } else if (day >= 20) {
        // 20-24日は詳細未確定（勤務地あり、詳細なし）
        location = LOCATIONS[Math.floor(seedRandom(staffIdNum * day * 2 + year * 70) * LOCATIONS.length)];
        const startHour = 9 + Math.floor(seedRandom(staffIdNum * day * 3 + year * 80) * 3);
        startTime = `${startHour.toString().padStart(2, '0')}:00`;
        endTime = `${(startHour + 8).toString().padStart(2, '0')}:00`;
        status = '詳細未確定';
      } else {
        // 19日以前は確定または詳細未確定
        location = LOCATIONS[Math.floor(seedRandom(staffIdNum * day * 2 + year * 70) * LOCATIONS.length)];
        const startHour = 9 + Math.floor(seedRandom(staffIdNum * day * 3 + year * 80) * 3);
        startTime = `${startHour.toString().padStart(2, '0')}:00`;
        endTime = `${(startHour + 8).toString().padStart(2, '0')}:00`;
        
        // 60%で確定、40%で詳細未確定
        if (rand < 0.6) {
          status = '確定'; // 仮設定（詳細情報の有無で最終決定）
        } else {
          status = '詳細未確定';
        }
      }
    }
    
    // より詳細な稼働情報を追加（確定の場合のみ）
    let agency = undefined;
    let managerName = undefined;
    let managerPhone = undefined;
    let meetingTime = undefined;
    let meetingPlace = undefined;
    let uniform = undefined;
    let notes = undefined;
    let otherCompany = undefined;
    let regularStaff = undefined;
    let workStartTime = undefined;
    let workEndTime = undefined;
    let target = undefined;
    
    if ((status === '確定' || status === '詳細未確定') && location) {
      const agencies = ['ABC商事株式会社', 'XYZ企画', 'DEF物産', '株式会社ライフサポート', 'マーケティング・ジャパン'];
      agency = agencies[Math.floor(seedRandom(staffIdNum * day * 4 + year * 110) * agencies.length)];
      const managers = ['田中現場責任者', '佐藤現場管理者', '山田エリアマネージャー'];
      managerName = managers[Math.floor(seedRandom(staffIdNum * day * 5 + year * 120) * managers.length)];
      managerPhone = '090-1234-' + (1000 + Math.floor(seedRandom(staffIdNum * day * 6 + year * 130) * 9000));
      
      // 確定の場合のみ詳細情報を設定するかチェック
      if (status === '確定' && startTime) {
        // 詳細情報がある場合は「確定」のまま
        status = '確定';
        const startHour = parseInt(startTime.split(':')[0]);
        meetingTime = `${(startHour - 1).toString().padStart(2, '0')}:45`;
        workStartTime = startTime;
        workEndTime = endTime;
        
        meetingPlace = location.includes('新宿') ? '新宿駅東口' : 
                     location.includes('渋谷') ? '渋谷駅ハチ公前' :
                     location.includes('池袋') ? '池袋駅東口' :
                     location.includes('銀座') ? '銀座駅A4出口' : '現地集合';
        
        const uniforms = ['スーツ（黒・紺）', 'ビジネスカジュアル', '私服（清潔感重視）'];
        uniform = uniforms[Math.floor(seedRandom(staffIdNum * day * 7 + year * 140) * uniforms.length)];
        
        const companies = ['ABC商事', 'XYZ企画', 'DEF物産'];
        if (seedRandom(staffIdNum * day * 8 + year * 150) < 0.4) {
          otherCompany = companies[Math.floor(seedRandom(staffIdNum * day * 9 + year * 160) * companies.length)];
        }
        
        const staffNames = ['鈴木常勤スタッフ', '高橋常勤スタッフ', '田中常勤スタッフ'];
        if (seedRandom(staffIdNum * day * 10 + year * 170) < 0.5) {
          regularStaff = staffNames[Math.floor(seedRandom(staffIdNum * day * 11 + year * 180) * staffNames.length)];
        }
        
        const targets = ['新規契約5件', '既存顧客フォロー10件', 'アンケート回収30件', '商品説明20件'];
        if (seedRandom(staffIdNum * day * 12 + year * 190) < 0.6) {
          target = targets[Math.floor(seedRandom(staffIdNum * day * 13 + year * 200) * targets.length)];
        }
        
        if (seedRandom(staffIdNum * day * 14 + year * 210) < 0.3) {
          const notesList = [
            '雨天の場合は室内での活動になります',
            '昼食は現地で用意いたします',
            'タブレット端末を使用するため、操作に慣れておいてください',
            '初回の方は30分前に集合してください'
          ];
          notes = notesList[Math.floor(seedRandom(staffIdNum * day * 15 + year * 220) * notesList.length)];
        }
      }
      // 詳細未確定の場合は詳細情報を設定しない（勤務地と時間のみ）
    }

    shifts.push({
      date: dateStr,
      staffId,
      requestedStatus,
      status,
      agency,
      location,
      startTime,
      endTime,
      rate: isWeekend ? staff.holidayRate : staff.weekdayRate,
      managerName,
      managerPhone,
      meetingTime,
      meetingPlace,
      uniform,
      notes,
      otherCompany,
      regularStaff,
      workStartTime,
      workEndTime,
      target,
      communications: status === '確定' && seedRandom(staffIdNum * day * 16 + year * 230) < 0.4 ? [
        {
          id: `msg_${day}_1`,
          userId: 'manager_001',
          userName: '田中マネージャー',
          message: day % 3 === 0 ? 
            '明日の現場についてですが、集合場所が変更になりました。新宿駅東口のスタバ前に変更です。よろしくお願いします。' :
            day % 3 === 1 ?
            'お疲れ様です。明日は雨の予報ですので、雨具をご持参ください。現場は屋内のため問題ありませんが、移動時にご注意ください。' :
            '明日の現場についてご連絡します。制服は私服でお願いします。清潔感のあるカジュアルな服装でお越しください。',
          timestamp: new Date(Date.now() - seedRandom(staffIdNum * day * 17 + year * 240) * 24 * 60 * 60 * 1000).toLocaleString('ja-JP'),
          likes: [],
          replies: seedRandom(staffIdNum * day * 18 + year * 250) < 0.3 ? [
            {
              id: `reply_${day}_1`,
              userId: 'current_staff',
              userName: staff.name,
              message: '承知いたしました。ありがとうございます。',
              timestamp: new Date(Date.now() - seedRandom(staffIdNum * day * 19 + year * 260) * 12 * 60 * 60 * 1000).toLocaleString('ja-JP'),
              likes: ['manager_001'],
              parentId: `msg_${day}_1`,
              replies: seedRandom(staffIdNum * day * 20 + year * 270) < 0.5 ? [
                {
                  id: `reply_${day}_2`,
                  userId: 'manager_001',
                  userName: '田中マネージャー',
                  message: 'よろしくお願いします！何かご不明な点があればお気軽にご連絡ください。',
                  timestamp: new Date(Date.now() - seedRandom(staffIdNum * day * 21 + year * 280) * 6 * 60 * 60 * 1000).toLocaleString('ja-JP'),
                  likes: [],
                  parentId: `reply_${day}_1`
                }
              ] : []
            }
          ] : []
        }
      ] : []
    });
  }

  return shifts;
};

const STATUS_CONFIG: Record<string, { label: string; color: 'success' | 'warning' | 'error' | 'default' | 'info' | 'primary'; icon: React.ReactElement }> = {
  '確定': { label: '確定', color: 'success', icon: <CheckCircle /> },
  '現場未確定': { label: '現場未定', color: 'warning', icon: <Remove /> },
  '詳細未確定': { label: '詳細未定', color: 'info', icon: <HelpOutline /> },
  '休み': { label: '休み', color: 'error', icon: <Cancel /> }
};

export default function StaffCheckPage() {
  const router = useRouter();
  const [selectedYear, setSelectedYear] = useState<string>('2025');
  const [selectedMonth, setSelectedMonth] = useState<string>('4');
  const [currentStaff, setCurrentStaff] = useState<typeof dummyStaffMembers[0] | null>(null);
  const [selectedWorkDetail, setSelectedWorkDetail] = useState<WorkDetail | null>(null);
  const [workDetailOpen, setWorkDetailOpen] = useState(false);

  // 認証チェックとスタッフ情報取得
  useEffect(() => {
    const isLoggedIn = localStorage.getItem('staff_logged_in');
    const staffId = localStorage.getItem('current_staff_id');
    
    if (!isLoggedIn || !staffId) {
      router.push('/tier-2dealer/staff/login');
      return;
    }
    
    const staff = dummyStaffMembers.find(s => s.id === staffId);
    if (staff) {
      setCurrentStaff(staff);
    } else {
      router.push('/tier-2dealer/staff/login');
    }
  }, [router]);

  const year = parseInt(selectedYear);
  const month = parseInt(selectedMonth);
  
  // 確定シフトデータを生成
  const confirmedShifts = useMemo(() => {
    if (!currentStaff) return [];
    return generateConfirmedShifts(year, month, currentStaff.id);
  }, [year, month, currentStaff]);

  // 月間集計を計算
  const monthlySummary = useMemo(() => {
    const confirmed = confirmedShifts.filter(s => s.status === '確定');
    const pending = confirmedShifts.filter(s => s.status === '現場未確定' || s.status === '詳細未確定');
    const rest = confirmedShifts.filter(s => s.status === '休み');
    
    return {
      confirmed: confirmed.length,
      pending: pending.length,
      rest: rest.length
    };
  }, [confirmedShifts]);

  // 日付ごとのデータを作成
  const dateData = useMemo(() => {
    const daysInMonth = new Date(year, month, 0).getDate();
    const data = [];
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month - 1, day);
      const dayOfWeek = ['日', '月', '火', '水', '木', '金', '土'][date.getDay()];
      const isWeekend = date.getDay() === 0 || date.getDay() === 6;
      const dateStr = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
      
      const shift = confirmedShifts.find(s => s.date === dateStr);
      
      data.push({
        day,
        dayOfWeek,
        isWeekend,
        shift
      });
    }
    
    return data;
  }, [year, month, confirmedShifts]);

  const handleYearChange = (year: string) => {
    setSelectedYear(year);
  };

  const handleMonthChange = (month: string) => {
    setSelectedMonth(month);
  };

  const handleLogout = () => {
    localStorage.removeItem('staff_logged_in');
    localStorage.removeItem('current_staff_id');
    router.push('/tier-2dealer/staff/login');
  };

  // 稼働詳細を開く（確定の場合のみ）
  const handleOpenWorkDetail = (day: number, dayOfWeek: string, shift: ConfirmedShift | undefined) => {
    if (!shift || shift.status !== '確定' || !currentStaff) return;
    
    const workDetail: WorkDetail = {
      id: shift.date,
      date: shift.date, // 正しい日付形式（YYYY-MM-DD）を使用
      dayOfWeek,
      requestedStatus: shift.requestedStatus,
      status: shift.status,
      agency: shift.agency,
      location: shift.location,
      startTime: shift.startTime,
      endTime: shift.endTime,
      rate: shift.rate,
      staffName: currentStaff.name,
      staffRole: currentStaff.role,
      managerName: shift.managerName,
      managerPhone: shift.managerPhone,
      meetingTime: shift.meetingTime,
      meetingPlace: shift.meetingPlace,
      uniform: shift.uniform,
      notes: shift.notes,
      otherCompany: shift.otherCompany,
      regularStaff: shift.regularStaff,
      workStartTime: shift.workStartTime,
      workEndTime: shift.workEndTime,
      target: shift.target,
      communications: shift.communications || [],
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
    
    setSelectedWorkDetail(workDetail);
    setWorkDetailOpen(true);
  };

  // 稼働詳細を閉じる
  const handleCloseWorkDetail = () => {
    setWorkDetailOpen(false);
    setSelectedWorkDetail(null);
  };

  // 稼働詳細の更新
  const handleUpdateWorkDetail = (updates: Partial<WorkDetail>) => {
    if (!selectedWorkDetail) return;
    
    setSelectedWorkDetail({
      ...selectedWorkDetail,
      ...updates
    });
  };

  if (!currentStaff) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography>読み込み中...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      {/* ヘッダー */}
      <StaffHeader 
        title="シフト確認"
        currentPage="check"
        userName={currentStaff.name}
        onLogout={handleLogout}
      />

      <Box sx={{ p: 2 }}>
        {/* 年月選択 */}
        <Paper sx={{ p: 2, mb: 2, borderRadius: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
            <YearMonthSelector
              year={selectedYear}
              month={selectedMonth}
              onYearChange={handleYearChange}
              onMonthChange={handleMonthChange}
            />
          </Box>
        </Paper>

        {/* 確定シフト表（カード形式） */}
        <Box sx={{ mb: 2 }}>
          {dateData.map((data) => {
            const shift = data.shift;
            const hasShift = shift && shift.status !== '休み';
            const shouldApplyGreenBackground = (shift?.requestedStatus === '○' && data.day % 2 === 0) || shift?.status === '確定';
            
            return (
              <Paper 
                key={data.day}
                onClick={() => handleOpenWorkDetail(data.day, data.dayOfWeek, shift)}
                sx={{ 
                  mb: 1, 
                  borderRadius: 2,
                  border: hasShift ? '2px solid #e0e0e0' : '1px solid #f0f0f0',
                  backgroundColor: shouldApplyGreenBackground ? '#e7f5e0' : 
                                 hasShift ? '#fff' : '#d3d3d3',
                  cursor: shift?.status === '確定' ? 'pointer' : 'default',
                  transition: 'all 0.2s ease',
                  '&:hover': shift?.status === '確定' ? {
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    transform: 'translateY(-2px)'
                  } : {}
                }}
              >
                <Box sx={{ p: 1.2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: hasShift ? 0.5 : 0 }}>
                    {/* 左側：日付と曜日 */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          fontWeight: 'bold',
                          fontSize: '1rem',
                          color: !hasShift ? '#000000' : // 休みの場合は黒文字
                                 data.isWeekend ? (data.dayOfWeek === '日' ? '#d32f2f' : '#1976d2') : 'inherit'
                        }}
                      >
                        {data.day}
                      </Typography>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: !hasShift ? '#000000' : // 休みの場合は黒文字
                                 data.isWeekend ? (data.dayOfWeek === '日' ? '#d32f2f' : '#1976d2') : 'text.secondary',
                          fontSize: '0.75rem'
                        }}
                      >
                        ({data.dayOfWeek})
                      </Typography>
                    </Box>
                    
                    {/* 右側：希望記号と状況 */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0 }}>
                      {/* 希望記号 */}
                      {shift && (
                        <Box sx={{ 
                          minWidth: 36,
                          height: 36,
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '1.2rem',
                          fontWeight: 'bold',
                          backgroundColor: 'transparent',
                          color:
                            shift.requestedStatus === '○' ? '#2e7d32' :
                            shift.requestedStatus === '×' ? '#d32f2f' : '#ef6c00'
                        }}>
                          {shift.requestedStatus}
                        </Box>
                      )}
                      
                      {/* 状況チップ */}
                      {shift ? (
                        <Chip
                          icon={STATUS_CONFIG[shift.status].icon}
                          label={STATUS_CONFIG[shift.status].label}
                          color={shift.status === '現場未確定' ? undefined : STATUS_CONFIG[shift.status].color}
                          size="small"
                          sx={{ 
                            fontSize: '0.7rem',
                            height: 24,
                            '& .MuiChip-label': {
                              px: 1
                            },
                            ...(shift.status === '現場未確定' && {
                              backgroundColor: '#C3AF45',
                              color: '#ffffff',
                              '& .MuiChip-icon': {
                                color: '#ffffff'
                              }
                            })
                          }}
                        />
                      ) : (
                        <Chip
                          icon={<Cancel />}
                          label="休み"
                          color="error"
                          size="small"
                          sx={{ 
                            fontSize: '0.7rem',
                            height: 24,
                            '& .MuiChip-label': {
                              px: 1
                            }
                          }}
                        />
                      )}
                    </Box>
                  </Box>
                  
                  {/* 詳細情報（勤務がある場合のみ） */}
                  {hasShift && (
                    <Box sx={{ 
                      mt: 0.5,
                      pt: 0.5,
                      borderTop: '1px solid #f0f0f0'
                    }}>
                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'flex-start',
                        gap: 0.5
                      }}>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.65rem', mb: 0.2 }}>
                            勤務地
                          </Typography>
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              fontSize: '0.75rem', 
                              fontWeight: 'bold',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            {shift.location || '未定'}
                          </Typography>
                        </Box>
                        {shift.status !== '詳細未確定' && (
                          <Box sx={{ textAlign: 'center', minWidth: 'fit-content' }}>
                            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.65rem', mb: 0.2 }}>
                              時間
                            </Typography>
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                fontSize: '0.75rem', 
                                fontWeight: 'bold',
                                whiteSpace: 'nowrap'
                              }}
                            >
                              {shift.startTime && shift.endTime 
                                ? `${shift.startTime}-${shift.endTime}` 
                                : '未定'
                              }
                            </Typography>
                          </Box>
                        )}
                        {shift.status === '確定' && (
                          <Box sx={{ textAlign: 'right', minWidth: 'fit-content' }}>
                            <Typography variant="body2" color="primary" sx={{ fontSize: '0.65rem', fontWeight: 'bold', mb: 0.2 }}>
                              詳細
                            </Typography>
                            <Typography variant="body2" sx={{ fontSize: '0.6rem', color: 'text.secondary' }}>
                              タップ
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    </Box>
                  )}
                </Box>
              </Paper>
            );
          })}
        </Box>

        {/* 備考（ステータス説明） */}
        <Paper sx={{ p: 1.2, borderRadius: 2 }}>
          <Typography variant="subtitle2" gutterBottom sx={{ fontSize: '0.93rem', fontWeight: 'bold', mb: 0.5 }}>
            備考
          </Typography>
          <Box sx={{ mb: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 1, pl: 0.5 }}>
            {/* 確定 */}
            <Box sx={{ textAlign: 'left', mb: 1 }}>
              <Chip
                icon={STATUS_CONFIG['確定'].icon}
                label={STATUS_CONFIG['確定'].label}
                color={STATUS_CONFIG['確定'].color}
                size="small"
                sx={{ fontSize: '0.7rem', height: 24, px: 1, mb: 0.5, '& .MuiChip-label': { px: 1 } }}
              />
              <Typography variant="body2" sx={{ fontSize: '0.82rem', color: 'text.secondary', mt: 0.2 }}>
                現場と詳細がすべて確定している状態です。
              </Typography>
            </Box>
            {/* 詳細未確定 */}
            <Box sx={{ textAlign: 'left', mb: 1 }}>
              <Chip
                icon={STATUS_CONFIG['詳細未確定'].icon}
                label={STATUS_CONFIG['詳細未確定'].label}
                color={STATUS_CONFIG['詳細未確定'].color}
                size="small"
                sx={{ fontSize: '0.7rem', height: 24, px: 1, mb: 0.5, '& .MuiChip-label': { px: 1 } }}
              />
              <Typography variant="body2" sx={{ fontSize: '0.82rem', color: 'text.secondary', mt: 0.2 }}>
                現場は決まっていますが、集合時間や持ち物など詳細が未定の状態です。
              </Typography>
            </Box>
            {/* 現場未確定 */}
            <Box sx={{ textAlign: 'left', mb: 1 }}>
              <Chip
                icon={STATUS_CONFIG['現場未確定'].icon}
                label={STATUS_CONFIG['現場未確定'].label}
                color={STATUS_CONFIG['現場未確定'].color}
                size="small"
                sx={{ fontSize: '0.7rem', height: 24, px: 1, mb: 0.5, backgroundColor: '#C3AF45', color: '#fff', '& .MuiChip-label': { px: 1 }, '& .MuiChip-icon': { color: '#fff' } }}
              />
              <Typography variant="body2" sx={{ fontSize: '0.82rem', color: 'text.secondary', mt: 0.2 }}>
                現場が未定の状態です。
              </Typography>
            </Box>
            {/* 休み */}
            <Box sx={{ textAlign: 'left', mb: 1 }}>
              <Chip
                icon={STATUS_CONFIG['休み'].icon}
                label={STATUS_CONFIG['休み'].label}
                color={STATUS_CONFIG['休み'].color}
                size="small"
                sx={{ fontSize: '0.7rem', height: 24, px: 1, mb: 0.5, '& .MuiChip-label': { px: 1 } }}
              />
              <Typography variant="body2" sx={{ fontSize: '0.82rem', color: 'text.secondary', mt: 0.2 }}>
                お休みの日です。
              </Typography>
            </Box>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.78rem', lineHeight: 1.5, mt: 0.5 }}>
            <strong>背景色が緑</strong>のカードは「稼働が確約されている日」を表します。
          </Typography>
        </Paper>

        {/* ログアウトボタン */}
        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Button 
            variant="outlined" 
            onClick={handleLogout}
            startIcon={<Logout />}
            sx={{ 
              borderRadius: 2,
              fontSize: '0.9rem',
              px: 3
            }}
          >
            ログアウト
          </Button>
        </Box>
      </Box>

      {/* 稼働詳細Drawer */}
      {selectedWorkDetail && (
        <WorkDetailDrawer
          open={workDetailOpen}
          onClose={handleCloseWorkDetail}
          date={selectedWorkDetail.date}
          assignments={[{
            id: selectedWorkDetail.id,
            staffId: selectedWorkDetail.id,
            date: selectedWorkDetail.date,
            status: selectedWorkDetail.requestedStatus,
            location: selectedWorkDetail.location,
            rate: selectedWorkDetail.rate,
            comment: selectedWorkDetail.notes
          }]}
          staff={[{
            id: selectedWorkDetail.id,
            name: selectedWorkDetail.staffName,
            nameKana: '',
            station: '',
            weekdayRate: selectedWorkDetail.rate,
            holidayRate: selectedWorkDetail.rate,
            tel: '',
            role: selectedWorkDetail.staffRole,
            company: '2次店スタッフ'
          }]}
        />
      )}
    </Box>
  );
}