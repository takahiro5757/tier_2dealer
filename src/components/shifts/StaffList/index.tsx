'use client';

import { useState, useRef, useEffect } from 'react';
import { 
  Box, 
  Button, 
  Typography, 
  IconButton, 
  ToggleButton, 
  ToggleButtonGroup,
  Paper,
  styled,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Radio,
  RadioGroup,
  FormControl,
  Divider,
  List,
  ListItem,
  ListItemText,
  TextField,
  InputAdornment,
  Popover,
  Card,
  CardContent
} from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import SearchIcon from '@mui/icons-material/Search';
import InfoIcon from '@mui/icons-material/Info';
import { Draggable, Droppable } from '@hello-pangea/dnd';
import { StaffAvailability, StaffDetails } from '@/types/shifts';

// スタイル付きコンポーネント
const StaffListContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  maxWidth: '800px',
  backgroundColor: '#ffffff',
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(3),
  boxShadow: theme.shadows[1],
}));

const DateToggleButton = styled(ToggleButton)(({ theme }) => ({
  padding: '2px 4px',
  border: '1px solid #e0e0e0',
  borderRadius: '4px !important',
  minWidth: '60px',
  fontSize: '0.75rem',
  backgroundColor: '#f5f5f5',
  '&:hover': {
    backgroundColor: '#eeeeee',
  },
  '&.Mui-selected': {
    backgroundColor: theme.palette.primary.light,
    color: theme.palette.primary.contrastText,
    '&:hover': {
      backgroundColor: theme.palette.primary.main,
    }
  }
}));

interface StatusTileProps {
  color: string;
}

const StatusTile = styled(Paper)<StatusTileProps>(({ theme, color }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  width: '80px',
  height: '32px',
  margin: theme.spacing(0.75),
  backgroundColor: color,
  borderRadius: '4px',
  cursor: 'grab',
  userSelect: 'none',
  textAlign: 'center',
  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
  fontSize: '0.8rem',
  padding: '4px 8px',
  fontWeight: 'bold',
}));

const OrganizationButton = styled(ToggleButton)(({ theme }) => ({
  padding: '4px 12px',
  border: '1px solid #e0e0e0',
  borderRadius: '20px !important',
  whiteSpace: 'nowrap',
  fontSize: '0.875rem',
  margin: theme.spacing(0.5),
  textTransform: 'none',
  backgroundColor: '#f5f5f5',
  '&:hover': {
    backgroundColor: '#eeeeee',
  },
  '&.Mui-selected': {
    backgroundColor: theme.palette.primary.light,
    color: theme.palette.primary.contrastText,
    '&:hover': {
      backgroundColor: theme.palette.primary.main,
    }
  }
}));

const ScrollIconButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  zIndex: 2,
  backgroundColor: 'rgba(255, 255, 255, 0.8)',
  border: '1px solid #e0e0e0',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  padding: 4,
}));

// インターフェース定義
interface StaffListProps {
  year: number;
  month: number;
  selectedWeek: number; // 選択された週を追加
}

// 日付データの生成
const generateDates = (year: number, month: number, weekIndex: number) => {
  const dates = [];
  const dayNames = ['日', '月', '火', '水', '木', '金', '土'];
  
  // 月の最初の日を取得
  const firstDayOfMonth = new Date(year, month - 1, 1);
  
  // 月の最初の火曜日を見つける
  const firstTuesday = new Date(firstDayOfMonth);
  while (firstTuesday.getDay() !== 2) { // 2は火曜日
    firstTuesday.setDate(firstTuesday.getDate() + 1);
  }
  
  // 週インデックスに基づいて、その週の火曜日を計算
  let startDate: Date;
  
  if (weekIndex === 0) {
    // 0Wの場合、月初から最初の火曜日の前日までなので、前月の日付を含む
    startDate = new Date(firstDayOfMonth);
    // 前月の最後の火曜日を見つける
    const lastDayOfPrevMonth = new Date(year, month - 1, 0);
    const prevMonthTuesday = new Date(lastDayOfPrevMonth);
    while (prevMonthTuesday.getDay() !== 2) {
      prevMonthTuesday.setDate(prevMonthTuesday.getDate() - 1);
    }
    startDate = prevMonthTuesday;
  } else {
    // それ以外の週は、最初の火曜日から (weekIndex - 1) * 7 日後
    startDate = new Date(firstTuesday);
    startDate.setDate(firstTuesday.getDate() + (weekIndex - 1) * 7);
  }
  
  // 7日分の日付データを生成
  for (let i = 0; i < 7; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    const currentMonth = date.getMonth() + 1; // 月は0始まり
    
    // 指定した月と異なる月かどうかをチェック
    const isOtherMonth = currentMonth !== month;
    
    // 他の月の日付はスキップ
    if (!isOtherMonth) {
      const dayName = dayNames[date.getDay()];
      const dateStr = `${date.getMonth() + 1}/${date.getDate()}`;
      const dateValue = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
      
      dates.push({ 
        dayName, 
        dateStr, 
        value: dateValue,
        date: dateValue // availability検索用のフォーマット
      });
    }
  }
  
  return dates;
};

// 組織データ
const organizations = [
  { id: 'all', name: 'すべて' },
  { id: 'ansteype-employee', name: 'ANSTEYPE社員' },
  { id: 'ansteype-parttime', name: 'ANSTEYPEバイト' },
  { id: 'ansteype-freelance', name: 'ANSTEYPE個人事業主' },
  { id: 'festal', name: 'Festal' },
  { id: 'tmr', name: 'TMR' },
  { id: 'one-ft', name: 'One.ft' },
  { id: 'rista', name: 'リスタ' },
  { id: 'ppp', name: 'PPP' },
  { id: 'werz', name: 'ワーアズ' },
  { id: 'sou', name: 'sou' },
  { id: 'doors', name: 'ドアーズ' }
];

// ダミー要員データ

// StaffMemberインターフェースを拡張して詳細情報を追加
interface StaffMember {
  id: number;
  name: string;
  org: string;
  remote: boolean;
  noTrip: boolean;
  isGirl: boolean;
  isFemale: boolean;
  availability: StaffAvailability;
  details?: {
    nearestStation?: string;
    contact?: string;
    price?: number;
    ngStaff?: string[];
    ngAgencies?: string[];
    prevMonthDays?: number;
    prevPrevMonthDays?: number;
    note?: string;
  };
}

// 2025年4月と5月の稼働可能日を生成
const createStaffAvailability = (): StaffAvailability => {
  const availability: StaffAvailability = {};
  
  // 2025年4月と5月の日付を生成
  const months = [4, 5];
  const year = 2025;
  
  for (const month of months) {
    // 各月の日数を取得（4月は30日、5月は31日）
    const daysInMonth = month === 4 ? 30 : 31;
    
    for (let day = 1; day <= daysInMonth; day++) {
      const dateKey = `${year}-${month}-${day}`;
      
      // 70%の確率で稼働可能に設定
      availability[dateKey] = Math.random() > 0.3;
    }
  }
  
  return availability;
};

// テストデータに詳細情報を追加
const staffData: StaffMember[] = [
  // クローザー
  { 
    id: 1, 
    name: '荒川拓実', 
    org: 'ansteype-employee', 
    remote: Math.random() > 0.8, 
    noTrip: Math.random() > 0.8, 
    isGirl: false, 
    isFemale: false, 
    availability: createStaffAvailability(),
    details: {
      nearestStation: '渋谷駅',
      contact: 'TEL: 090-1234-5678 / LINE: arakawa-t',
      ngStaff: ['山田太郎', '佐藤健'],
      ngAgencies: ['ABC代理店 田中マネージャー'],
      note: '土日の勤務可能。リーダー経験あり。特定クライアントのみ担当希望。'
    }
  },
  { 
    id: 2, 
    name: '山中翔', 
    org: 'ansteype-freelance', 
    remote: Math.random() > 0.8, 
    noTrip: Math.random() > 0.8, 
    isGirl: false, 
    isFemale: false, 
    availability: createStaffAvailability(),
    details: {
      nearestStation: '新宿駅',
      contact: 'Email: yamanaka@example.com',
      ngStaff: [],
      ngAgencies: ['XYZ代理店'],
      note: 'リモート勤務希望。平日夜間対応可能。'
    }
  },
  { 
    id: 3, 
    name: '石谷直斗', 
    org: 'ppp', 
    remote: Math.random() > 0.8, 
    noTrip: Math.random() > 0.8, 
    isGirl: false, 
    isFemale: false, 
    availability: createStaffAvailability(),
    details: {
      nearestStation: '池袋駅',
      contact: 'TEL: 080-9876-5432 / LINE: naoto-i',
      ngStaff: ['鈴木一郎'],
      ngAgencies: [],
      note: '週3日勤務希望。交通費上限なし。早朝対応可能。'
    }
  },
  { id: 4, name: '猪本留渚', org: 'ansteype-employee', remote: Math.random() > 0.8, noTrip: Math.random() > 0.8, isGirl: false, isFemale: true, availability: createStaffAvailability() },
  { id: 5, name: '吉岡海', org: 'ansteype-employee', remote: Math.random() > 0.8, noTrip: Math.random() > 0.8, isGirl: false, isFemale: false, availability: createStaffAvailability() },
  { id: 6, name: '岩田咲海', org: 'ansteype-employee', remote: Math.random() > 0.8, noTrip: Math.random() > 0.8, isGirl: false, isFemale: true, availability: createStaffAvailability() },
  { id: 7, name: '齋藤涼花', org: 'ansteype-employee', remote: Math.random() > 0.8, noTrip: Math.random() > 0.8, isGirl: false, isFemale: true, availability: createStaffAvailability() },
  { id: 8, name: '水谷亮介', org: 'ansteype-parttime', remote: Math.random() > 0.8, noTrip: Math.random() > 0.8, isGirl: false, isFemale: false, availability: createStaffAvailability() },
  { id: 9, name: '大久保卓哉', org: 'ansteype-employee', remote: Math.random() > 0.8, noTrip: Math.random() > 0.8, isGirl: false, isFemale: false, availability: createStaffAvailability() },
  { id: 10, name: '佐藤孝郁', org: 'festal', remote: Math.random() > 0.8, noTrip: Math.random() > 0.8, isGirl: false, isFemale: false, availability: createStaffAvailability() },
  { id: 11, name: '富岡勇太', org: 'ansteype-employee', remote: Math.random() > 0.8, noTrip: Math.random() > 0.8, isGirl: false, isFemale: false, availability: createStaffAvailability() },
  { id: 12, name: '髙橋愛結奈', org: 'ansteype-employee', remote: Math.random() > 0.8, noTrip: Math.random() > 0.8, isGirl: false, isFemale: true, availability: createStaffAvailability() },
  { id: 13, name: '和田美優', org: 'ansteype-freelance', remote: Math.random() > 0.8, noTrip: Math.random() > 0.8, isGirl: false, isFemale: false, availability: createStaffAvailability() },
  { id: 14, name: '中島悠喜', org: 'ansteype-freelance', remote: Math.random() > 0.8, noTrip: Math.random() > 0.8, isGirl: false, isFemale: false, availability: createStaffAvailability() },
  { id: 15, name: '石谷直斗', org: 'ppp', remote: Math.random() > 0.8, noTrip: Math.random() > 0.8, isGirl: false, isFemale: false, availability: createStaffAvailability() },
  
  // ガール
  { id: 16, name: '柴李佐紅', org: 'ansteype-parttime', remote: Math.random() > 0.8, noTrip: Math.random() > 0.8, isGirl: true, isFemale: true, availability: createStaffAvailability() },
  { id: 17, name: '佐藤祐未', org: 'ansteype-parttime', remote: Math.random() > 0.8, noTrip: Math.random() > 0.8, isGirl: true, isFemale: true, availability: createStaffAvailability() },
  { id: 18, name: '石嶋瑠花', org: 'ansteype-parttime', remote: Math.random() > 0.8, noTrip: Math.random() > 0.8, isGirl: true, isFemale: true, availability: createStaffAvailability() },
  { id: 19, name: '岸川明日菜', org: 'ansteype-parttime', remote: Math.random() > 0.8, noTrip: Math.random() > 0.8, isGirl: true, isFemale: true, availability: createStaffAvailability() },
  { id: 20, name: '山岸莉子', org: 'ansteype-parttime', remote: Math.random() > 0.8, noTrip: Math.random() > 0.8, isGirl: true, isFemale: true, availability: createStaffAvailability() },
  
  // 追加データ
  { id: 21, name: '森田来美', org: 'ansteype-employee', remote: Math.random() > 0.8, noTrip: Math.random() > 0.8, isGirl: false, isFemale: false, availability: createStaffAvailability() },
  { id: 22, name: '須郷瑠斗', org: 'festal', remote: Math.random() > 0.8, noTrip: Math.random() > 0.8, isGirl: false, isFemale: false, availability: createStaffAvailability() },
  { id: 23, name: '大滝晴香', org: 'rista', remote: Math.random() > 0.8, noTrip: Math.random() > 0.8, isGirl: true, isFemale: true, availability: createStaffAvailability() },
  { id: 24, name: '山下千尋', org: 'werz', remote: Math.random() > 0.8, noTrip: Math.random() > 0.8, isGirl: true, isFemale: true, availability: createStaffAvailability() },
  { id: 25, name: '小林希歩', org: 'werz', remote: Math.random() > 0.8, noTrip: Math.random() > 0.8, isGirl: true, isFemale: true, availability: createStaffAvailability() },
  { id: 26, name: '飯塚ひかり', org: 'rista', remote: Math.random() > 0.8, noTrip: Math.random() > 0.8, isGirl: true, isFemale: true, availability: createStaffAvailability() },
  { id: 27, name: '森保勇生', org: 'tmr', remote: Math.random() > 0.8, noTrip: Math.random() > 0.8, isGirl: false, isFemale: false, availability: createStaffAvailability() },
  { id: 28, name: '須貝真奈美', org: 'rista', remote: Math.random() > 0.8, noTrip: Math.random() > 0.8, isGirl: true, isFemale: true, availability: createStaffAvailability() },
  { id: 29, name: '森保大地', org: 'tmr', remote: Math.random() > 0.8, noTrip: Math.random() > 0.8, isGirl: false, isFemale: false, availability: createStaffAvailability() },
  { id: 30, name: '宮日向', org: 'tmr', remote: Math.random() > 0.8, noTrip: Math.random() > 0.8, isGirl: false, isFemale: true, availability: createStaffAvailability() },
  { id: 31, name: '中川ひかる', org: 'doors', remote: Math.random() > 0.8, noTrip: Math.random() > 0.8, isGirl: true, isFemale: true, availability: createStaffAvailability() },
  { id: 32, name: '美濃部椋太', org: 'sou', remote: Math.random() > 0.8, noTrip: Math.random() > 0.8, isGirl: false, isFemale: false, availability: createStaffAvailability() },
  { id: 33, name: '白畑龍弥', org: 'sou', remote: Math.random() > 0.8, noTrip: Math.random() > 0.8, isGirl: false, isFemale: false, availability: createStaffAvailability() },
  { id: 34, name: '長崎敬太', org: 'one-ft', remote: Math.random() > 0.8, noTrip: Math.random() > 0.8, isGirl: false, isFemale: false, availability: createStaffAvailability() },
  { id: 35, name: '安面遥夏', org: 'werz', remote: Math.random() > 0.8, noTrip: Math.random() > 0.8, isGirl: true, isFemale: true, availability: createStaffAvailability() },
  { id: 36, name: '加瀬悠貴', org: 'one-ft', remote: Math.random() > 0.8, noTrip: Math.random() > 0.8, isGirl: false, isFemale: false, availability: createStaffAvailability() },
  { id: 37, name: '篠知隆', org: 'one-ft', remote: Math.random() > 0.8, noTrip: Math.random() > 0.8, isGirl: false, isFemale: false, availability: createStaffAvailability() },
  { id: 38, name: '小林天音', org: 'werz', remote: Math.random() > 0.8, noTrip: Math.random() > 0.8, isGirl: true, isFemale: true, availability: createStaffAvailability() },
  { id: 39, name: '安藤心優', org: 'werz', remote: Math.random() > 0.8, noTrip: Math.random() > 0.8, isGirl: true, isFemale: true, availability: createStaffAvailability() },
  { id: 40, name: '水谷新菜', org: 'werz', remote: Math.random() > 0.8, noTrip: Math.random() > 0.8, isGirl: true, isFemale: true, availability: createStaffAvailability() }
];

// スタイル付きコンポーネント
interface StaffItemProps {
  isGirl: boolean; // ガールかクローザーか
  isFemale: boolean; // 性別（女性かどうか）
}

const StaffItem = styled(Box)<StaffItemProps>(({ theme, isGirl, isFemale }) => ({
  display: 'inline-flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  backgroundColor: isGirl ? '#fce4ec' : '#e3f2fd', // ガールは薄いピンク、クローザーは薄い青
  padding: theme.spacing(0.5, 1),
  margin: theme.spacing(0.5),
  borderRadius: '4px',
  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
  fontSize: '0.8rem',
  width: '120px', // 固定幅を設定
  height: '32px',
  cursor: 'pointer',
  userSelect: 'none',
  color: isFemale ? '#d81b60' : '#1565c0', // 女性はピンク系、男性は青系のフォント
  '&:hover': {
    backgroundColor: isGirl ? '#f8bbd0' : '#bbdefb',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.15)',
  }
}));

const StaffSectionTitle = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(1),
  '&::before': {
    content: '""',
    display: 'inline-block',
    width: '4px',
    height: '18px',
    backgroundColor: theme.palette.primary.main,
    marginRight: theme.spacing(1),
    borderRadius: '2px',
  }
}));

export default function StaffList({ year, month, selectedWeek }: StaffListProps) {
  // 状態管理
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [selectedOrgs, setSelectedOrgs] = useState<string[]>(['all']);
  const [locationFilter, setLocationFilter] = useState(''); // 空文字は未選択を表す
  const [searchQuery, setSearchQuery] = useState(''); // 検索クエリの状態を追加
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  // 情報ポップアップの状態管理を追加
  const [infoAnchorEl, setInfoAnchorEl] = useState<HTMLElement | null>(null);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  
  // 日付データの生成 - 選択された週に基づいて生成
  const dates = generateDates(year, month, selectedWeek);
  
  // デバッグ用ログ
  console.log(`StaffList - Generated dates for ${year}年${month}月 Week:${selectedWeek}:`, dates);
  
  // useEffect を追加して日付が変更された際に選択をリセット
  useEffect(() => {
    setSelectedDates([]);
  }, [year, month, selectedWeek]);
  
  // 日付選択のハンドラ
  const handleDateChange = (event: React.MouseEvent<HTMLElement>, newDates: string[]) => {
    console.log('Selected dates:', newDates);
    setSelectedDates(newDates);
  };
  
  // 組織選択のハンドラ
  const handleOrgChange = (event: React.MouseEvent<HTMLElement>, newOrgs: string[]) => {
    // 新しく選択された組織がない場合（すべて解除された場合）は現状維持
    if (newOrgs.length === 0) {
      return;
    }
    
    // クリックされた組織を特定（最後に追加/削除されたもの）
    const clickedOrg = newOrgs.find(org => !selectedOrgs.includes(org)) || 
                       selectedOrgs.find(org => !newOrgs.includes(org));
                       
    // 「すべて」がクリックされた場合
    if (clickedOrg === 'all') {
      setSelectedOrgs(['all']);
      return;
    }
    
    // その他の組織がクリックされた場合
    // すべての選択を含む配列から「すべて」を削除
    const filteredOrgs = newOrgs.filter(org => org !== 'all');
    setSelectedOrgs(filteredOrgs);
  };
  
  // スクロールハンドラ
  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 200; // スクロール量
      const container = scrollContainerRef.current;
      if (direction === 'left') {
        container.scrollLeft -= scrollAmount;
      } else {
        container.scrollLeft += scrollAmount;
      }
    }
  };
  
  // ロケーションフィルターのハンドラ
  const handleLocationFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLocationFilter(event.target.value);
  };
  
  // 検索クエリのハンドラ
  const handleSearchQueryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };
  
  // フィルターに基づいて要員をフィルタリングする関数
  const getFilteredStaff = () => {
    return staffData.filter(staff => {
      // 組織フィルター
      const orgMatch = selectedOrgs.includes('all') || selectedOrgs.includes(staff.org);
      
      // 場所フィルター
      const locationMatch = 
        (locationFilter === 'remote' && staff.remote) ||
        (locationFilter === 'no-trip' && staff.noTrip) ||
        !locationFilter; // 指定なしの場合は全て
      
      // 検索クエリフィルター
      const searchMatch = 
        searchQuery === '' || 
        staff.name.toLowerCase().includes(searchQuery.toLowerCase());
      
      return orgMatch && locationMatch && searchMatch;
    });
  };
  
  // 連日稼働可能なスタッフを取得
  const getAvailableForAllSelectedDates = () => {
    if (selectedDates.length === 0) return [];
    
    console.log('Checking availability for dates:', selectedDates);
    
    return getFilteredStaff().filter(staff => {
      // 選択された各日付について利用可能かどうかをチェック
      const allAvailable = selectedDates.every(dateValue => {
        // 日付文字列から年月日を取得
        const parts = dateValue.split('-');
        const dateKey = `${parts[0]}-${parts[1]}-${parts[2]}`;
        
        const isAvailable = staff.availability[dateKey] === true;
        console.log(`Staff ${staff.name}, Date ${dateKey}, Available: ${isAvailable}`);
        return isAvailable;
      });
      
      console.log(`Staff ${staff.name}, All dates available: ${allAvailable}`);
      return allAvailable;
    });
  };
  
  // 選択された日付ごとに利用可能なスタッフを取得
  const getAvailableForDate = (dateValue: string) => {
    // 日付文字列から年月日を取得
    const parts = dateValue.split('-');
    const dateKey = `${parts[0]}-${parts[1]}-${parts[2]}`;
    
    return getFilteredStaff().filter(staff => staff.availability[dateKey] === true);
  };
  
  const availableForAllDates = getAvailableForAllSelectedDates();
  console.log('Staff available for all selected dates:', availableForAllDates.length);
  
  // 各日付ごとの利用可能なスタッフ
  const availableByDate = selectedDates.map(dateValue => {
    const staff = getAvailableForDate(dateValue);
    // 日付の表示形式を取得
    const dateObj = dates.find(d => d.value === dateValue);
    return {
      dateValue,
      display: dateObj ? `${dateObj.dateStr} (${dateObj.dayName})` : dateValue,
      staff
    };
  });
  
  // デバッグ用に日付データを表示
  console.log('Generated dates for staff list:', dates.map(d => d.dateStr));
  
  // 情報ボタンのクリックハンドラ
  const handleInfoClick = (event: React.MouseEvent<HTMLElement>, staff: StaffMember) => {
    event.stopPropagation();
    setInfoAnchorEl(event.currentTarget);
    setSelectedStaff(staff);
  };
  
  // 情報ポップアップを閉じるハンドラ
  const handleInfoClose = () => {
    setInfoAnchorEl(null);
    setSelectedStaff(null);
  };
  
  // インフォメーションポップアップが開いているかどうか
  const isInfoPopoverOpen = Boolean(infoAnchorEl);
  
  return (
    <StaffListContainer>
      {/* 上部のボタンとステータスタイル - 横並びに配置 */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4, alignItems: 'center', mt: 3 }}>
        {/* ステータスタイル */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
          <Droppable droppableId="status-tiles" direction="horizontal">
            {(provided) => (
              <Box
                ref={provided.innerRef}
                {...provided.droppableProps}
                sx={{ display: 'flex' }}
              >
                <Draggable draggableId="absent" index={0}>
                  {(provided) => (
                    <Box
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                    >
                      <StatusTile color="#ff8a80">
                        <Typography variant="body2">欠勤</Typography>
                      </StatusTile>
                    </Box>
                  )}
                </Draggable>
                <Draggable draggableId="tm" index={1}>
                  {(provided) => (
                    <Box
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                    >
                      <StatusTile color="#90caf9">
                        <Typography variant="body2">TM</Typography>
                      </StatusTile>
                    </Box>
                  )}
                </Draggable>
                <Draggable draggableId="selected" index={2}>
                  {(provided) => (
                    <Box
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                    >
                      <StatusTile color="#dce775">
                        <Typography variant="body2">選択中</Typography>
                      </StatusTile>
                    </Box>
                  )}
                </Draggable>
                {provided.placeholder}
              </Box>
            )}
          </Droppable>
        </Box>
        
        {/* ボタンとアイコン */}
        <Box sx={{ display: 'flex' }}>
          <Button
            variant="contained"
            color="primary"
            sx={{ mr: 1, borderRadius: '4px', textTransform: 'none' }}
          >
            自動配置実行
          </Button>
          <IconButton color="primary">
            <SettingsIcon />
          </IconButton>
        </Box>
      </Box>
      
      {/* 要員リストと日付選択 */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" sx={{ mr: 2, fontWeight: 'bold' }}>
          要員リスト
        </Typography>
        {dates.length > 0 ? (
          <ToggleButtonGroup
            value={selectedDates}
            onChange={handleDateChange}
            aria-label="日付選択"
            size="small"
            sx={{ flexWrap: 'wrap' }}
          >
            {dates.map((date, index) => (
              <DateToggleButton key={index} value={date.value} aria-label={date.dateStr}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <Typography variant="caption">{date.dayName}</Typography>
                  <Typography variant="caption">{date.dateStr}</Typography>
                </Box>
              </DateToggleButton>
            ))}
          </ToggleButtonGroup>
        ) : (
          <Typography variant="body2" color="text.secondary">
            選択した月に表示可能な日付はありません
          </Typography>
        )}
      </Box>
      
      {/* 組織選択ボタン */}
      <Box sx={{ mt: 4, mb: 3, position: 'relative' }}>
        <Box sx={{ position: 'relative', width: '100%' }}>
          {/* 左スクロールボタン */}
          <ScrollIconButton
            onClick={() => handleScroll('left')}
            size="small"
            sx={{ left: -18, top: '50%', transform: 'translateY(-50%)' }}
          >
            <ChevronLeftIcon fontSize="small" />
          </ScrollIconButton>
          
          {/* スクロール可能なボタングループコンテナ */}
          <Box
            ref={scrollContainerRef}
            sx={{
              display: 'flex',
              overflowX: 'hidden',
              scrollBehavior: 'smooth',
              position: 'relative',
              pt: 0.5,
              pb: 0.5,
              '&::-webkit-scrollbar': {
                display: 'none'
              },
              msOverflowStyle: 'none',
              scrollbarWidth: 'none',
            }}
          >
            <ToggleButtonGroup
              value={selectedOrgs}
              onChange={handleOrgChange}
              aria-label="組織選択"
              size="small"
              sx={{ flexWrap: 'nowrap' }}
            >
              {organizations.map((org) => (
                <OrganizationButton key={org.id} value={org.id} aria-label={org.name}>
                  {org.name}
                </OrganizationButton>
              ))}
            </ToggleButtonGroup>
          </Box>
          
          {/* 右スクロールボタン */}
          <ScrollIconButton
            onClick={() => handleScroll('right')}
            size="small"
            sx={{ right: -18, top: '50%', transform: 'translateY(-50%)' }}
          >
            <ChevronRightIcon fontSize="small" />
          </ScrollIconButton>
        </Box>
      </Box>
      
      {/* フィルターラジオボタンと検索ボックス */}
      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <FormControl component="fieldset">
          <RadioGroup 
            row 
            value={locationFilter}
            onChange={handleLocationFilterChange}
          >
            <FormControlLabel
              value="remote"
              control={<Radio size="small" />}
              label={<Typography variant="body2">遠方</Typography>}
              sx={{ mr: 4 }}
            />
            <FormControlLabel
              value="no-trip"
              control={<Radio size="small" />}
              label={<Typography variant="body2">出張NG</Typography>}
            />
            {locationFilter && (
              <FormControlLabel
                value=""
                control={<Radio size="small" />}
                label={<Typography variant="body2">指定なし</Typography>}
                sx={{ ml: 2 }}
              />
            )}
          </RadioGroup>
        </FormControl>
        
        {/* 検索ボックス */}
        <TextField
          size="small"
          placeholder="要員名を検索"
          value={searchQuery}
          onChange={handleSearchQueryChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
          sx={{ width: '200px' }}
        />
      </Box>
      
      {/* 情報ポップアップ */}
      <Popover
        open={Boolean(infoAnchorEl)}
        anchorEl={infoAnchorEl}
        onClose={handleInfoClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
      >
        {selectedStaff && (
          <Card sx={{ minWidth: 320 }}>
            <CardContent>
              <Typography variant="h6" component="div" gutterBottom>
                {selectedStaff.name}
              </Typography>
              
              <Typography variant="subtitle2" sx={{ mt: 1, fontWeight: 'bold', borderBottom: '1px solid #eee', pb: 0.5 }}>
                基本情報
              </Typography>
              
              <Typography variant="body2" sx={{ mt: 1 }}>
                <strong>所属:</strong> {organizations.find(org => org.id === selectedStaff.org)?.name || selectedStaff.org}
              </Typography>
              
              <Typography variant="body2">
                <strong>最寄り駅:</strong> {selectedStaff.details?.nearestStation || '未設定'}
              </Typography>
              
              <Typography variant="body2">
                <strong>連絡先:</strong> {selectedStaff.details?.contact || '未設定'}
              </Typography>
              
              <Typography variant="subtitle2" sx={{ mt: 2, fontWeight: 'bold', borderBottom: '1px solid #eee', pb: 0.5 }}>
                NG情報
              </Typography>
              
              <Typography variant="body2" sx={{ mt: 1 }}>
                <strong>NG要員:</strong> {selectedStaff.details?.ngStaff?.length ? selectedStaff.details.ngStaff.join('、') : 'なし'}
              </Typography>
              
              <Typography variant="body2">
                <strong>代理店NG:</strong> {selectedStaff.details?.ngAgencies?.length ? selectedStaff.details.ngAgencies.join('、') : 'なし'}
              </Typography>
              
              <Typography variant="subtitle2" sx={{ mt: 2, fontWeight: 'bold', borderBottom: '1px solid #eee', pb: 0.5 }}>
                その他
              </Typography>
              
              <Typography variant="body2" sx={{ mt: 1 }}>
                <strong>特記事項:</strong> {selectedStaff.details?.note || 'なし'}
              </Typography>
              
              <Typography variant="body2" sx={{ mt: 1 }}>
                <strong>リモート勤務:</strong> {selectedStaff.remote ? '可能' : '不可'}
              </Typography>
              
              <Typography variant="body2">
                <strong>遠方移動:</strong> {selectedStaff.noTrip ? '不可' : '可能'}
              </Typography>
            </CardContent>
          </Card>
        )}
      </Popover>
      
      {/* 要員リスト */}
      {selectedDates.length > 0 && (
        <Box sx={{ mt: 4 }}>
          {/* スクロール可能な要員リストコンテナ - 連日稼働可能と日付ごとの要員リストを含む */}
          <Box
            sx={{
              maxHeight: '400px',
              overflowY: 'auto',
              pr: 1,
              '&::-webkit-scrollbar': {
                width: '8px',
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: 'rgba(0, 0, 0, 0.2)',
                borderRadius: '4px',
              },
              '&::-webkit-scrollbar-track': {
                backgroundColor: 'rgba(0, 0, 0, 0.05)',
                borderRadius: '4px',
              },
            }}
          >
            {/* 連日稼働可能な要員 */}
            {availableForAllDates.length > 0 && (
              <>
                <StaffSectionTitle>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                    連日稼働可能
                  </Typography>
                </StaffSectionTitle>
                <Droppable droppableId="staff-all-dates" direction="horizontal" isDropDisabled={true}>
                  {(provided) => (
                    <Box 
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      sx={{ display: 'flex', flexWrap: 'wrap', pt: 1 }}
                    >
                      {availableForAllDates.map((staff, index) => (
                        <Draggable key={`staff-${staff.id}`} draggableId={`staff-${staff.id.toString()}`} index={index}>
                          {(provided) => (
                            <Box
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                            >
                              <StaffItem 
                                isGirl={staff.isGirl} 
                                isFemale={staff.isFemale}
                              >
                                <span>{staff.name}</span>
                                <IconButton
                                  size="small"
                                  onClick={(e) => handleInfoClick(e, staff)}
                                  sx={{ 
                                    ml: 1, 
                                    p: 0.25,
                                    color: 'rgba(0, 0, 0, 0.54)', // グレー系の色に変更
                                    '&:hover': {
                                      backgroundColor: 'rgba(0, 0, 0, 0.04)'
                                    }
                                  }}
                                >
                                  <InfoIcon fontSize="small" />
                                </IconButton>
                              </StaffItem>
                            </Box>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </Box>
                  )}
                </Droppable>
              </>
            )}
            
            {/* 日付ごとの要員リスト */}
            {availableByDate.map(({ dateValue, display, staff }) => (
              <Box key={dateValue} sx={{ mt: 3 }}>
                <StaffSectionTitle>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                    {display}
                  </Typography>
                </StaffSectionTitle>
                <Droppable droppableId={`staff-date-${dateValue}`} direction="horizontal" isDropDisabled={true}>
                  {(provided) => (
                    <Box 
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      sx={{ display: 'flex', flexWrap: 'wrap', pt: 1 }}
                    >
                      {staff.length > 0 ? (
                        staff.map((s, index) => (
                          <Draggable key={`staff-${s.id}-${dateValue}`} draggableId={`staff-${s.id.toString()}-${dateValue}`} index={index}>
                            {(provided) => (
                              <Box
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                              >
                                <StaffItem 
                                  isGirl={s.isGirl} 
                                  isFemale={s.isFemale}
                                >
                                  <span>{s.name}</span>
                                  <IconButton
                                    size="small"
                                    onClick={(e) => handleInfoClick(e, s)}
                                    sx={{ 
                                      ml: 1, 
                                      p: 0.25,
                                      color: 'rgba(0, 0, 0, 0.54)', // グレー系の色に変更
                                      '&:hover': {
                                        backgroundColor: 'rgba(0, 0, 0, 0.04)'
                                      }
                                    }}
                                  >
                                    <InfoIcon fontSize="small" />
                                  </IconButton>
                                </StaffItem>
                              </Box>
                            )}
                          </Draggable>
                        ))
                      ) : (
                        <Typography variant="body2" color="text.secondary" sx={{ pl: 1 }}>
                          稼働可能な要員はいません
                        </Typography>
                      )}
                      {provided.placeholder}
                    </Box>
                  )}
                </Droppable>
              </Box>
            ))}
          </Box>
        </Box>
      )}
    </StaffListContainer>
  );
} 