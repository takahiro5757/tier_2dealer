'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { 
  Box, Container, Typography, Paper,
  Grid, Chip, Stack, Button, Dialog, DialogTitle, DialogContent, DialogActions, Alert,
  AppBar, Toolbar, Card, CardContent
} from '@mui/material';
import YearMonthSelector from '../../../../components/YearMonthSelector';
import { SpreadsheetGrid } from '../../../../components/shifts/SpreadsheetGrid';
import { Shift } from '../../../../components/shifts/SpreadsheetGrid/types';
import { getWeeks, generateDummySummary } from '../../../../utils/dateUtils';
import { useRouter } from 'next/navigation';
import { Send, Person, Logout, CalendarToday } from '@mui/icons-material';

import { ShiftSubmission, SubmissionStatus, SyncStatus } from '../../../../components/shifts/SpreadsheetGrid/types';
import { StaffMember } from '@/types/staff';
import { useShiftStore, staffMembers } from '../../../../stores/shiftStore';
import NotificationSystem from '../../../../components/NotificationSystem';
import ExcelExport from '../../../../components/ExcelExport';
import { initialStaffMembers } from '@/app/tier-2dealer/admin/staff/initialStaffMembers';

// 2次店スタッフのダミーデータ（admin/staff/page.tsxと同期）
const dummyStaffMembers = initialStaffMembers;

const SUBMISSION_STATUS: Record<string, { label: string; color: 'success' | 'warning' | 'error' | 'default' }> = {
  submitted: { label: '提出済み', color: 'success' },
  draft: { label: '未提出', color: 'warning' }
};

// 決定論的な疑似ランダム関数
const seedRandom = (seed: number): number => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

// ダミーシフトデータ生成（提出状況に応じて）
const generateDummyShifts = (year: number, month: number): Shift[] => {
  const shifts: Shift[] = [];
  const daysInMonth = new Date(year, month, 0).getDate();
  
  console.log(`=== generateDummyShifts開始 (${year}年${month}月, ${daysInMonth}日) ===`);
  
  // 稼働場所のリスト - managementページと同じものを使用
  const locations = [
    'イオンモール上尾センターコート',
    'イトーヨーカドー立場',
    'マルエツ松江',
    'コーナン西新井',
    '錦糸町マルイ たい焼き屋前',
    'ららぽーと富士見　1階スリコ前',
    'イオンモール春日部 風の広場',
    'イトーヨーカドー東久留米',
    'イオンタウン吉川美南',
    'イオン南越谷',
    'イトーヨーカドー埼玉大井',
    'スーパーバリュー草加',
    'エルミこうのす2F',
    'モラージュ菖蒲',
    'カインズ羽生',
    'ベイシア行田',
    'レイクタウンkaze3階ブリッジ',
    'さいたまスーパーアリーナけやき広場(ラーメンフェス)',
    'ソフトバンクエミテラス所沢店頭',
    'アリオ上尾',
    'イオン板橋',
    'イオンモール石巻',
    'イオンマリンピア(稲毛海岸)',
    'イオン市川妙典',
    '島忠ホームズ東村山',
    'コピス吉祥寺デッキイベント',
    'ロピア小平',
    'イトーヨーカドー大井町',
    'ドン・キホーテ浦和原山',
    'イオン大井',
    'ドン・キホーテ武蔵浦和',
    '草加セーモンプラザ',
    'イオンモール北戸田'
  ];
  
  // スタッフ別のコメント例
  const staffComments: Record<string, string> = {
    '1205000011': '土日は早番希望です。平日は遅番でも大丈夫です。',
    '1205000017': '体調面で配慮が必要な日があります。事前にご相談します。',
    '1205000018': '交通費の関係で、できるだけ近場の現場を希望します。',
    '1205000026': '月末は他の予定があるため、調整をお願いします。',
    '1205000027': '新人研修のため、ベテランスタッフとの同行を希望します。',
    '1205000029': '夜勤は体調的に厳しいため、日中の勤務を希望します。',
    'girl4': '子供の送迎があるため、10時〜16時の勤務を希望します。',
    'girl11': '学校があるため、平日は17時以降の勤務を希望します。'
  };
  
  dummyStaffMembers.forEach((staff, staffIndex) => {
    const staffIdNum = parseInt(staff.id.replace(/[^0-9]/g, '')) || 1;
    
    const ymKey = `${year}-${month.toString().padStart(2, '0')}`;
    const submissionStatus = staff.submissionHistory?.[ymKey] || 'draft';
    if (staffIndex === 0) {
      console.log(`スタッフ例 (${staff.name}): ID=${staff.id}, IDNum=${staffIdNum}, SubmissionStatus=${submissionStatus}, Role=${staff.role}`);
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
      const date = new Date(year, month - 1, day);
      const dayOfWeek = date.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      
      if (submissionStatus === 'submitted') {
        // 提出済み：全日程に希望を入力
        // managementページと同じロジックを適用
        const dateNum = day + month * 100 + year * 10000;
        const pseudoRandom = seedRandom(staffIdNum * 123 + dateNum * 456);
        
        let status: '○' | '×' | '-' = '-';
        
        // 6月の場合は特別処理：20日分の○を確実に設定
        if (month === 6) {
          // 6月は1-20日に○、21日以降は×または-
          if (day <= 20) {
            status = '○';
            if (staffIndex === 0 && day <= 5) {
              console.log(`[6月特別処理] ${staff.name} 6/${day}: 強制的に○を設定 (SubmissionStatus=${submissionStatus})`);
            }
          } else {
            status = day <= 25 ? '×' : '-';
          }
        } else {
          // ガールとクローザーで出勤確率を変える
          if (staff.role === 'ガール') {
            // ガールは確率が少し高め
            if (pseudoRandom < 0.7) {
              status = '○';
            } else if (pseudoRandom < 0.9) {
              status = '×';
            }
          } else {
            // クローザー
            if (pseudoRandom < 0.6) {
              status = '○';
            } else if (pseudoRandom < 0.9) {
              status = '×';
            }
          }
        }
        
        // 最初のスタッフの最初の5日間のデバッグ
        if (staffIndex === 0 && day <= 5) {
          console.log(`${staff.name} 4/${day}: pseudoRandom=${pseudoRandom.toFixed(3)}, status=${status}, role=${staff.role}`);
        }
        
        // 土日は出勤率を下げる
        if ((dayOfWeek === 0 || dayOfWeek === 6) && status === '○') {
          // ガールは土日の出勤率を低くする
          if (staff.role === 'ガール' && ((staffIdNum + day) % 10) < 5) {
            status = '×';
          }
          // クローザーも土日の調整
          else if (staff.role !== 'ガール' && ((staffIdNum + day) % 10) < 3) {
            status = '×';
          }
        }
        
        // 場所の決定（○の場合のみ）
        let location: string | undefined = undefined;
        
        if (status === '○') {
          const locationIndex = (staffIdNum + day + (staff.role === 'ガール' ? 2 : 0)) % locations.length;
          
          // 6月の場合は特別処理：前半10日は必ず場所を設定
          if (month === 6 && day <= 10) {
            location = locations[locationIndex];
          } else {
            // 一部は未確定にする（約40%）
            const unassignedRandom = seedRandom(staffIdNum * day * 31 + dateNum);
            if (unassignedRandom >= 0.4) {
              location = locations[locationIndex]; // 60%は場所を設定
            }
            // 残り40%は未確定（locationはundefinedのまま）
          }
          
          // 最初のスタッフの○の日のデバッグ
          if (staffIndex === 0) {
            console.log(`${staff.name} ${month}/${day} ○: locationIndex=${locationIndex}, location=${location || '未確定'} (SubmissionStatus=${submissionStatus})`);
          }
        }
        
        const shift: Shift = {
          date: dateStr,
          staffId: staff.id,
          status: status,
          location: location,
          comment: staffComments[staff.id] || undefined
        };
        
        // デバッグログ追加（最初の日のみ）
        if (day === 1) {
          console.log(`${staff.name} (${staff.id}, SubmissionStatus=${submissionStatus}): コメント="${shift.comment}"`);
        }
        
        // ○で場所が確定している場合のみ単価を設定
        if (status === '○' && location) {
          shift.rate = isWeekend ? staff.holidayRate : staff.weekdayRate;
        }
        
        shifts.push(shift);
      } else if (submissionStatus === 'draft') {
        // 未提出：約50%の日程のみ入力（決定論的で半分程度）
        const shouldHaveData = seedRandom(staffIdNum * day * 7 + year * 30) > 0.5;
        if (shouldHaveData) {
          // 同じロジックを適用
          const dateNum = day + month * 100 + year * 10000;
          const pseudoRandom = seedRandom(staffIdNum * 123 + dateNum * 456);
          
          let status: '○' | '×' | '-' = '-';
          
          // 6月の場合は特別処理：20日分の○を確実に設定
          if (month === 6) {
            // 6月は1-20日に○、21日以降は×または-
            if (day <= 20) {
              status = '○';
              if (staffIndex === 0 && day <= 5) {
                console.log(`[6月特別処理(未提出)] ${staff.name} 6/${day}: 強制的に○を設定 (SubmissionStatus=${submissionStatus})`);
              }
            } else {
              status = day <= 25 ? '×' : '-';
            }
          } else {
            // ガールとクローザーで出勤確率を変える
            if (staff.role === 'ガール') {
              if (pseudoRandom < 0.7) {
                status = '○';
              } else if (pseudoRandom < 0.9) {
                status = '×';
              }
            } else {
              if (pseudoRandom < 0.6) {
                status = '○';
              } else if (pseudoRandom < 0.9) {
                status = '×';
              }
            }
          }
          
          // 土日は出勤率を下げる
          if ((dayOfWeek === 0 || dayOfWeek === 6) && status === '○') {
            if (staff.role === 'ガール' && ((staffIdNum + day) % 10) < 5) {
              status = '×';
            } else if (staff.role !== 'ガール' && ((staffIdNum + day) % 10) < 3) {
              status = '×';
            }
          }
          
          // 場所の決定（○の場合のみ）
          let location: string | undefined = undefined;
          
          if (status === '○') {
            const locationIndex = (staffIdNum + day + (staff.role === 'ガール' ? 2 : 0)) % locations.length;
            
            // 6月の場合は特別処理：前半10日は必ず場所を設定
            if (month === 6 && day <= 10) {
              location = locations[locationIndex];
            } else {
              // 一部は未確定にする（約40%）
              const unassignedRandom = seedRandom(staffIdNum * day * 31 + dateNum);
              if (unassignedRandom >= 0.4) {
                location = locations[locationIndex]; // 60%は場所を設定
              }
            }
          }
          
          const shift: Shift = {
            date: dateStr,
            staffId: staff.id,
            status: status,
            location: location,
            comment: staffComments[staff.id] || undefined
          };
          
          // デバッグログ追加（最初の日のみ）
          if (day === 1) {
            console.log(`${staff.name} (${staff.id}, SubmissionStatus=${submissionStatus}, draft): コメント="${shift.comment}"`);
          }
          
          // ○で場所が確定している場合のみ単価を設定
          if (status === '○' && location) {
            shift.rate = isWeekend ? staff.holidayRate : staff.weekdayRate;
          }
          
          shifts.push(shift);
        }
        // shouldHaveDataがfalseの場合は、シフトデータを作成しない（空欄表示）
      }
      // not_started：シフトデータを作成しない（全て空欄表示）
    }
  });
  
  // 結果サマリー
  const totalShifts = shifts.length;
  const statusCounts = {
    '○': shifts.filter(s => s.status === '○').length,
    '×': shifts.filter(s => s.status === '×').length,
    '-': shifts.filter(s => s.status === '-').length,
  };
  const locationCounts = {
    'with_location': shifts.filter(s => s.status === '○' && s.location).length,
    'without_location': shifts.filter(s => s.status === '○' && !s.location).length,
  };
  
  console.log('=== generateDummyShifts結果 ===');
  console.log(`総シフト数: ${totalShifts}`);
  console.log('ステータス別:', statusCounts);
  console.log('場所設定:', locationCounts);
  console.log('========================');
  
  return shifts;
};

const mockNotifications = [
  {
    id: '1',
    type: 'shift_submission' as const,
    title: 'シフト提出',
    message: '田中太郎さんが6月分のシフトを提出しました',
    timestamp: new Date(),
    isRead: false,
    staffName: '田中太郎',
    companyName: '2次店スタッフ',
    targetAudience: 'festal' as const
  },
  {
    id: '2',
    type: 'approval' as const,
    title: 'シフト変更承認',
    message: 'ANSTEYPEが6月分のシフト変更を承認しました',
    timestamp: new Date(),
    isRead: false,
    staffName: '田中太郎',
    companyName: '2次店スタッフ',
    targetAudience: 'festal' as const,
    changeRequest: {
      id: 'cr-202506-001',
      staffId: '1205000011',
      staffName: '田中太郎',
      year: '2025',
      month: '6',
      reason: '家庭の都合で出勤希望を変更',
      requestTime: new Date(),
      status: 'approved' as const,
      changes: [
        { date: '2025-06-12', oldStatus: '○', newStatus: '×' },
        { date: '2025-06-15', oldStatus: '×', newStatus: '○' }
      ],
      rejectionReason: undefined
    }
  }
];

const STAFF_STORAGE_KEY = 'staff_members';

type StaffMemberWithStatus = StaffMember & { submissionStatus: SubmissionStatus };

function getActiveStaffMembersWithStatus(year: string, month: string) {
  const stored = typeof window !== 'undefined' ? localStorage.getItem(STAFF_STORAGE_KEY) : null;
  const base = stored ? JSON.parse(stored) : dummyStaffMembers;
  const ymKey = `${year}-${month.toString().padStart(2, '0')}`;
  return base
    .filter((s: any) => s.isActive)
    .map((s: any) => ({
      ...s,
      submissionStatus: s.submissionHistory?.[ymKey] || 'draft'
    }));
}

export default function AdminShiftsPage() {
  const router = useRouter();
  const [submitDialog, setSubmitDialog] = useState(false);
  const [changeRequestDialog, setChangeRequestDialog] = useState(false);
  const [message, setMessage] = useState('');
  // 提出済みステータス（後でuseEffectで設定）
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [detailDialog, setDetailDialog] = useState<{
    open: boolean;
    status: string;
    staffList: StaffMember[];
  }>({
    open: false,
    status: '',
    staffList: []
  });
  
  // グローバルストアを使用
  const {
    getShifts,
    markNotificationAsRead,
    clearAllNotifications
  } = useShiftStore();

  // ダミー関数
  const approveChangeRequest = (id: string) => {
    console.log('Change request approved:', id);
  };

  const rejectChangeRequest = (id: string) => {
    console.log('Change request rejected:', id);
  };

  // ローカル状態で管理 - 2025年6月に設定
  const [currentYear, setCurrentYear] = useState('2025');
  const [currentMonth, setCurrentMonth] = useState('6');
  
  // 2025年6月は全員提出済みにする
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>(() => getActiveStaffMembersWithStatus('2025', '6'));
  
  // 年月変更時にstaffMembersのsubmissionStatusを再計算
  useEffect(() => {
    setStaffMembers(getActiveStaffMembersWithStatus(currentYear, currentMonth));
  }, [currentYear, currentMonth]);
  
  console.log(`[AdminShifts] 初期状態: currentYear=${currentYear}, currentMonth=${currentMonth}`);
  const [isLoading, setIsLoading] = useState(false);
  const [isAutoSyncing, setIsAutoSyncing] = useState(false);
  const [notifications, setNotifications] = useState(mockNotifications);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [isDataInitialized, setIsDataInitialized] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => { setIsMounted(true); }, []);

  // 即座にダミーデータを初期化（2025年6月の場合）
  useEffect(() => {
    console.log(`[AdminShifts] 即座初期化useEffect実行チェック: window=${typeof window !== 'undefined'}, year=${currentYear}, month=${currentMonth}`);
    
    if (typeof window !== 'undefined') {
      console.log(`[AdminShifts] クライアントサイド確認OK`);
      
      if (currentYear === '2025' && currentMonth === '6') {
        console.log(`[AdminShifts] 即座初期化開始: ${currentYear}年${currentMonth}月`);
        
        const { useShiftStore } = require('../../../../stores/shiftStore');
        const store = useShiftStore.getState();
        
        // シフトデータを生成
        const shifts = generateDummyShifts(parseInt(currentYear), parseInt(currentMonth));
        console.log(`[AdminShifts] 即座シフトデータ生成: ${shifts.length}件`);
        
        // シフトデータをストアに保存
        store.updateShifts(currentYear, currentMonth, shifts);
        
        // 要望データを生成
        const requests = dummyStaffMembers.map((staff, index) => ({
          id: staff.id,
          totalRequest: 20,
          weekendRequest: 5,
          company: staff.company || '',
          requestText: [
            '平日希望', '土日出勤可能', '夜勤希望', '短時間勤務希望',
            '連勤可能', '早番希望', '遅番希望', '週末のみ'
          ][index % 8]
        }));
        
        store.updateStaffRequests(currentYear, currentMonth, requests);
        console.log(`[AdminShifts] 即座初期化完了 - シフト: ${shifts.length}件, 要望: ${requests.length}件`);
        
        // 初期化完了フラグを設定
        setIsDataInitialized(true);
      } else {
        console.log(`[AdminShifts] 条件不一致: year=${currentYear}, month=${currentMonth}`);
      }
    } else {
      console.log(`[AdminShifts] サーバーサイドのため処理スキップ`);
    }
  }, [currentYear, currentMonth]); // 年月を依存配列に追加

  // 認証チェック
  useEffect(() => {
    const isLoggedIn = localStorage.getItem('admin_logged_in');
    const adminId = localStorage.getItem('admin_id');
    
    if (!isLoggedIn || !adminId) {
      router.push('/tier-2dealer/admin/login');
      return;
    }
    
    // 有効な管理者IDをチェック
    const validAdminIds = ['admin001', 'festal_admin', 'test'];
    if (!validAdminIds.includes(adminId)) {
      router.push('/tier-2dealer/admin/login');
      return;
    }

    // 自動同期を開始
    setIsAutoSyncing(true);

    // コンポーネントアンマウント時に同期停止
    return () => {
      setIsAutoSyncing(false);
    };
  }, [router]);

  // 2025年6月ダミーデータ初期化（年月変更時にも実行）
  useEffect(() => {
    console.log(`[AdminShifts] useEffect実行開始: window=${typeof window !== 'undefined'}, year=${currentYear}, month=${currentMonth}`);
    
    if (typeof window === 'undefined') {
      console.log(`[AdminShifts] サーバーサイドのため処理をスキップ`);
      return;
    }
    
    console.log(`[AdminShifts] データ初期化チェック: ${currentYear}年${currentMonth}月`);
    
    const { useShiftStore } = require('../../../../stores/shiftStore');
    const store = useShiftStore.getState();
    
    // 現在の年月のシフトデータを確認
    const existingShifts = store.getShifts(currentYear, currentMonth);
    console.log(`[AdminShifts] 既存シフトデータ: ${existingShifts?.length || 0}件`);
    
    // 2025年6月の場合は常にダミーデータを生成
    if (currentYear === '2025' && currentMonth === '6') {
      console.log(`[AdminShifts] ${currentYear}年${currentMonth}月のダミーデータを生成中...`);
      
      // シフトデータを生成
      const shifts = generateDummyShifts(parseInt(currentYear), parseInt(currentMonth));
      console.log(`[AdminShifts] シフトデータを生成: ${shifts.length}件`);
      
      // シフトデータをストアに保存
      store.updateShifts(currentYear, currentMonth, shifts);
      console.log(`[AdminShifts] シフトデータをストアに保存完了`);
      
      // 要望データを生成（各スタッフに○を付与）
      const requests = dummyStaffMembers.map((staff, index) => ({
        id: staff.id,
        totalRequest: 20, // 固定で20日
        weekendRequest: 5, // 固定で土日5日
        company: staff.company || '',
        requestText: [
          '平日希望',
          '土日出勤可能', 
          '夜勤希望',
          '短時間勤務希望',
          '連勤可能',
          '早番希望',
          '遅番希望',
          '週末のみ'
        ][index % 8]
      }));
      
      // ストアに保存
      store.updateStaffRequests(currentYear, currentMonth, requests);
      console.log(`[AdminShifts] 要望データを生成: ${requests.length}件`, requests);
      
      // 保存確認
      const savedShifts = store.getShifts(currentYear, currentMonth);
      const savedRequests = store.getStaffRequests(currentYear, currentMonth);
      console.log(`[AdminShifts] 保存確認 - シフト: ${savedShifts?.length || 0}件, 要望: ${savedRequests?.length || 0}件`);
      
      // 要望データの内容確認
      if (savedRequests && savedRequests.length > 0) {
        savedRequests.forEach((req: any) => {
          console.log(`[AdminShifts] 要望確認 - ${req.id}: 平日=${req.totalRequest}, 土日=${req.weekendRequest}, テキスト="${req.requestText}"`);
        });
      } else {
        console.error(`[AdminShifts] 要望データが保存されていません！`);
      }
    }

    // 2025年6月の場合は提出済みステータスに設定
    if (currentYear === '2025' && currentMonth === '6') {
      setIsSubmitted(true);
      console.log(`[AdminShifts] 2025年6月は提出済みステータスに設定`);
    } else {
      setIsSubmitted(false);
    }
  }, [currentYear, currentMonth]); // 年月が変更されるたびに実行

  // この画面のみロック機能を無効化
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).__locationLockEnabled = false;
    }
    return () => {
      if (typeof window !== 'undefined') {
        delete (window as any).__locationLockEnabled;
      }
    };
  }, []);

  const year = parseInt(currentYear);
  const month = parseInt(currentMonth);
  
  // デバッグ用ログ
  console.log(`[AdminShifts] 現在の年月: year=${year}, month=${month}, staffMembers.length=${staffMembers?.length || 0}`);
  console.log(`[AdminShifts] staffMembers状態:`, staffMembers?.slice(0, 3).map(s => ({ id: s.id, name: s.name })));

  // グローバルストアからシフトデータを取得
  const shifts = useMemo(() => {
    const shiftsData = getShifts(currentYear, currentMonth);
    console.log(`[AdminShifts] shifts取得: ${currentYear}年${currentMonth}月 = ${shiftsData?.length || 0}件, 初期化済み=${isDataInitialized}`);
    return shiftsData || [];
  }, [currentYear, currentMonth, getShifts, isDataInitialized]); // isDataInitializedを依存配列に追加

  // 提出状況別の統計を計算
  const submissionStats = useMemo(() => {
    if (!staffMembers || !Array.isArray(staffMembers)) {
      return {
        submitted: [],
        draft: []
      };
    }
    const staffWithStatus = staffMembers as StaffMemberWithStatus[];
    const stats = {
      submitted: staffWithStatus.filter((s) => s.submissionStatus === 'submitted'),
      draft: staffWithStatus.filter((s) => (s.submissionStatus || 'draft') === 'draft')
    };
    return stats;
  }, [staffMembers]);

  const handleYearChange = (year: string) => {
    setCurrentYear(year);
  };

  const handleMonthChange = (month: string) => {
    setCurrentMonth(month);
  };

  // Ansteyeからの同期処理
  const handleSyncFromAnsteype = async () => {
    try {
      console.log('[AdminShifts] Ansteyeからの同期開始');
      setIsLoading(true);
      // ダミー同期処理
      await new Promise(resolve => setTimeout(resolve, 1000));
      setLastSyncTime(new Date().toISOString());
      setMessage('Ansteyeから同期しました');
      setTimeout(() => setMessage(''), 3000);
      console.log('[AdminShifts] 同期完了');
    } catch (error) {
      console.error('[AdminShifts] 同期エラー:', error);
      setMessage('同期に失敗しました');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  // Ansteyeへの提出処理（2次店管理者用：全スタッフ一括提出）
  const handleSubmitToAnsteype = async () => {
    try {
      console.log('[AdminShifts] Ansteyeへの全スタッフシフト提出開始');
      setIsLoading(true);
      // ダミー提出処理
      await new Promise(resolve => setTimeout(resolve, 2000));
      setIsSubmitted(true);
      setMessage('ANSTEYPEに全スタッフのシフトを提出しました');
      setSubmitDialog(false);
      setTimeout(() => setMessage(''), 3000);
      console.log('[AdminShifts] 全スタッフシフト提出完了');
    } catch (error) {
      console.error('[AdminShifts] 提出処理エラー:', error);
      setMessage('提出に失敗しました');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  // ステータス表示用のラベル
  const getSubmissionStatusLabel = (status: SubmissionStatus): string => {
    switch (status) {
      case 'draft': return '未提出';
      case 'submitted': return '提出済み';
      case 'approved': return '承認済み';
      case 'rejected': return '却下';
      case 'pending_approval': return '承認待ち';
      default: return '不明';
    }
  };

  const getSyncStatusLabel = (status: SyncStatus): string => {
    switch (status) {
      case 'synced': return '同期済み';
      case 'pending': return '同期待ち';
      case 'conflict': return '競合';
      case 'error': return 'エラー';
      default: return '不明';
    }
  };

  // 詳細ダイアログを開く
  const openDetailDialog = (status: string) => {
    setDetailDialog({
      open: true,
      status,
      staffList: (submissionStats[status as keyof typeof submissionStats] as StaffMemberWithStatus[]).filter((s) => s.isActive)
    });
  };

  // 詳細ダイアログを閉じる
  const closeDetailDialog = () => {
    setDetailDialog({
      open: false,
      status: '',
      staffList: []
    });
  };

  // 指定された月のシフトデータを取得する関数
  const getShiftsForMonth = (year: number, month: number): Shift[] => {
    if (year === parseInt(currentYear) && month === parseInt(currentMonth)) {
      return shifts; // 現在表示中の月の場合は既存のデータを返す
    }
    
    // 他の月の場合はダミーデータを生成
    return generateDummyShifts(year, month);
  };

  // 指定された月の要望データを取得する関数
  const getStaffRequestsForMonth = (year: number, month: number) => {
    if (typeof window !== 'undefined') {
      const { useShiftStore } = require('../../../../stores/shiftStore');
      const store = useShiftStore.getState();
      return store.getStaffRequests(year.toString(), month.toString());
    }
    return [];
  };

  // シフト変更依頼の処理
  const handleChangeRequest = async () => {
    try {
      console.log('[AdminShifts] シフト変更依頼開始');
      
      // シフト変更依頼の通知をANSTEYPE管理者に送信
      const { addNotification } = useShiftStore.getState();
      addNotification({
        type: 'change_request',
        title: 'Festal シフト変更依頼',
        message: `Festalから${currentYear}年${currentMonth}月のシフト変更依頼が提出されました`,
        isRead: false,
        staffId: 'festal_admin',
        staffName: 'Festal管理者',
        companyName: 'Festal',
        targetAudience: 'ansteype' // ANSTEYPE管理者向け
      });
      
      setMessage('シフト変更依頼を送信しました');
      setChangeRequestDialog(false);
      setTimeout(() => setMessage(''), 3000);
      console.log('[AdminShifts] シフト変更依頼完了');
    } catch (error) {
      console.error('[AdminShifts] シフト変更依頼エラー:', error);
      setMessage('シフト変更依頼の送信に失敗しました');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleMarkAsRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  }, []);

  const handleClearAll = useCallback(() => setNotifications([]), []);
  const handleApproveChange = useCallback(() => {}, []);
  const handleRejectChange = useCallback(() => {}, []);

  return (
    <Box sx={{ backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      {/* ヘッダー */}
      <AppBar position="static" sx={{ backgroundColor: '#1976d2' }}>
        <Toolbar>
          <CalendarToday sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            シフト管理（管理者）
          </Typography>
          <NotificationSystem
            notifications={notifications}
            onMarkAsRead={handleMarkAsRead}
            onApproveChange={handleApproveChange}
            onRejectChange={handleRejectChange}
            onClearAll={handleClearAll}
            isAdminMode={true}
          />
          <Button color="inherit" onClick={() => router.push('/tier-2dealer/admin/staff')}>
            <Person sx={{ mr: 1 }} />
            スタッフ管理
          </Button>
          <Button color="inherit" onClick={() => {
            localStorage.removeItem('admin_logged_in');
            localStorage.removeItem('admin_id');
            router.push('/tier-2dealer/admin/login');
          }}>
            <Logout sx={{ mr: 1 }} />
            ログアウト
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth={false} sx={{ py: 3, px: 2 }}>
        {message && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {message}
          </Alert>
        )}

        {/* 年月選択、スタッフ提出状況、システム連携状態 */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Grid container spacing={3} alignItems="center">
            {/* 年月選択 */}
            <Grid item>
              <YearMonthSelector
                year={currentYear}
                month={currentMonth}
                onYearChange={handleYearChange}
                onMonthChange={handleMonthChange}
              />
            </Grid>
            
            {/* スタッフ提出状況 */}
            <Grid item>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mr: 1 }}>
                  提出状況:
                </Typography>
                <Card 
                  sx={{ 
                    cursor: 'pointer', 
                    '&:hover': { boxShadow: 2 },
                    minWidth: 60,
                    height: 40
                  }} 
                  onClick={() => openDetailDialog('submitted')}
                >
                  <CardContent sx={{ textAlign: 'center', p: 0.5, '&:last-child': { pb: 0.5 } }}>
                    <Typography variant="h6" color="success.main" sx={{ fontWeight: 'bold', fontSize: '1rem', lineHeight: 1 }}>
                      {isMounted ? submissionStats.submitted.length : '-'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                      提出済み
                    </Typography>
                  </CardContent>
                </Card>
                
                <Card 
                  sx={{ 
                    cursor: 'pointer', 
                    '&:hover': { boxShadow: 2 },
                    minWidth: 60,
                    height: 40
                  }} 
                  onClick={() => openDetailDialog('draft')}
                >
                  <CardContent sx={{ textAlign: 'center', p: 0.5, '&:last-child': { pb: 0.5 } }}>
                    <Typography variant="h6" color="warning.main" sx={{ fontWeight: 'bold', fontSize: '1rem', lineHeight: 1 }}>
                      {isMounted ? submissionStats.draft.length : '-'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                      未提出
                    </Typography>
                  </CardContent>
                </Card>
                

              </Box>
            </Grid>
            
            {/* ボタンエリア */}
            <Grid item sx={{ ml: 'auto' }}>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                {/* Excelエクスポートボタン */}
                <ExcelExport
                  staffMembers={staffMembers || []}
                  shifts={shifts}
                  currentYear={parseInt(currentYear)}
                  currentMonth={parseInt(currentMonth)}
                  onGetShiftsForMonth={getShiftsForMonth}
                  onGetStaffRequestsForMonth={getStaffRequestsForMonth}
                />
                
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<Send />}
                  onClick={() => setSubmitDialog(true)}
                  disabled={isSubmitted || isLoading}
                  sx={{ minWidth: 200 }}
                >
                  {isLoading ? '全スタッフシフト提出中...' : 
                   isSubmitted ? 'ANSTEYPE提出済み' : '全スタッフシフトをANSTEYPEに提出'}
                </Button>
                
                {/* シフト変更依頼ボタン（提出済みの場合のみ表示） */}
                {isSubmitted && (
                  <Button
                    variant="outlined"
                    color="warning"
                    onClick={() => setChangeRequestDialog(true)}
                    sx={{ minWidth: 150 }}
                  >
                    シフト変更依頼
                  </Button>
                )}
                
                {/* システム連携状態 */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mr: 1 }}>
                    連携状態:
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip
                      label={isAutoSyncing ? "リアルタイム同期中" : "同期停止"}
                      color={isAutoSyncing ? "success" : "default"}
                      size="small"
                    />
                    <Chip
                      label={isSubmitted ? "提出済み" : "未提出"}
                      color={isSubmitted ? "info" : "default"}
                      size="small"
                    />
                  </Box>
                </Box>
              </Box>
            </Grid>
          </Grid>
          
          {/* 最終同期時刻（下段に表示） */}
          {typeof window !== 'undefined' && lastSyncTime && (
            <Box sx={{ mt: 1, display: 'flex', justifyContent: 'flex-end' }}>
              <Typography variant="caption" color="text.secondary">
                最終同期: {new Date(lastSyncTime).toLocaleString('ja-JP')}
              </Typography>
            </Box>
          )}
        </Paper>

        {/* シフト表 */}
        <Paper sx={{ mb: 3, width: '100%', overflow: 'hidden' }}>
          <SpreadsheetGrid
            staffMembers={isMounted ? staffMembers : []}
            shifts={isMounted ? shifts : []}
            year={year}
            month={month}
            hideCaseColumns={true}
            isReadOnly={true}
            onRateChange={undefined}
            disableDoubleClick={true}
            requestCellReadOnly={false}
          />
        </Paper>
      </Container>

      {/* 提出確認ダイアログ */}
      <Dialog open={submitDialog} onClose={() => setSubmitDialog(false)}>
        <DialogTitle>ANSTEYPEへの全スタッフシフト提出確認</DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            {currentYear}年{currentMonth}月の全スタッフのシフト希望をANSTEYPEに提出しますか？
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            ※提出後はANSTEYPE管理者が承認するまで編集できません。
          </Typography>
          <Typography variant="body2" color="primary.main">
            対象スタッフ数: {staffMembers?.length || 0}名
          </Typography>
          <Typography variant="body2" color="primary.main">
            提出先: ANSTEYPE管理システム
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSubmitDialog(false)}>キャンセル</Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmitToAnsteype}
          >
            全スタッフシフトを提出する
          </Button>
        </DialogActions>
      </Dialog>

      {/* シフト変更依頼確認ダイアログ */}
      <Dialog open={changeRequestDialog} onClose={() => setChangeRequestDialog(false)}>
        <DialogTitle>シフト変更依頼</DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            {currentYear}年{currentMonth}月のシフトについて変更依頼を送信しますか？
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            ※変更依頼はANSTEYPE管理者に通知され、承認後にシフトが変更されます。
          </Typography>
          <Typography variant="body2" color="warning.main">
            送信先: ANSTEYPE管理システム
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setChangeRequestDialog(false)}>キャンセル</Button>
          <Button
            variant="contained"
            color="warning"
            onClick={handleChangeRequest}
          >
            変更依頼を送信する
          </Button>
        </DialogActions>
      </Dialog>

      {/* スタッフ詳細ダイアログ */}
      <Dialog open={detailDialog.open} onClose={closeDetailDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {detailDialog.status === 'submitted' && '提出済みスタッフ'}
          {detailDialog.status === 'draft' && '未提出スタッフ'}
          <Typography variant="subtitle2" color="text.secondary">
            {isMounted ? detailDialog.staffList.length : '-'}名
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={1}>
            {isMounted && (detailDialog.staffList as StaffMemberWithStatus[]).map((staff) => (
              <Box
                key={staff.id}
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  p: 2,
                  border: '1px solid #e0e0e0',
                  borderRadius: 1,
                  backgroundColor: '#f9f9f9'
                }}
              >
                <Box>
                  <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                    {staff.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {staff.nameKana} | {staff.role}
                  </Typography>
                </Box>
                <Chip
                  label={staff.submissionStatus || 'draft'}
                  color={
                    staff.submissionStatus === 'submitted' ? 'success' : 'warning'
                  }
                  size="small"
                />
              </Box>
            ))}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDetailDialog}>閉じる</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 