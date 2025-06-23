'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { 
  Box, Container, Typography, Paper,
  Grid, Chip, Stack, Button, Dialog, DialogTitle, DialogContent, DialogActions, Alert,
  AppBar, Toolbar, Card, CardContent, TextField, Table, TableHead, TableBody, TableRow, TableCell, TableContainer
} from '@mui/material';
import YearMonthSelector from '../../../../components/YearMonthSelector';
import { SpreadsheetGrid } from '../../../../components/shifts/SpreadsheetGrid';
import { Shift, ShiftSubmission, SubmissionStatus, SyncStatus } from '../../../../components/shifts/SpreadsheetGrid/types';
import { getWeeks, generateDummySummary } from '../../../../utils/dateUtils';
import { useRouter } from 'next/navigation';
import { Send, Person, Logout, CalendarToday } from '@mui/icons-material';
import { useShiftStore, staffMembers } from '../../../../stores/shiftStore';
import NotificationSystem, { NotificationItem } from '../../../../components/NotificationSystem';
import ExcelExport from '../../../../components/ExcelExport';
import AdminHeader from '../../../../components/AdminHeader';
import { initialStaffMembers } from '@/app/tier-2dealer/admin/staff/initialStaffMembers';
import { StaffMember } from '../../../../types/staff';

// 変更依頼履歴の型定義
interface ChangeRequestHistory {
  id: string;
  requestDate: string; // ISO文字列
  targetYear: number;
  targetMonth: number;
  staffChanges: Array<{
    staffId: string;
    staffName: string;
    changes: Array<{
      date: string;
      field: 'status' | 'requestText' | 'totalRequest' | 'weekendRequest';
      oldValue: string;
      newValue: string;
    }>;
  }>;
  status: 'pending' | 'approved' | 'rejected';
  totalChanges: number;
  reason?: string; // 変更理由
}

// 2次店スタッフのダミーデータ（admin/staff/page.tsxと同期）
const dummyStaffMembers = initialStaffMembers;

const SUBMISSION_STATUS: Record<string, { label: string; color: 'success' | 'warning' | 'error' | 'default' }> = {
  submitted: { label: '提出済み', color: 'success' },
  draft: { label: '未提出', color: 'warning' }
};

// ローカルストレージ管理のユーティリティ関数
const CHANGE_REQUEST_STORAGE_KEY = 'tier2dealer_change_requests';

const saveChangeRequestToStorage = (changeRequest: ChangeRequestHistory) => {
  if (typeof window === 'undefined') return;
  
  try {
    const existingRequests = getChangeRequestsFromStorage();
    const updatedRequests = [changeRequest, ...existingRequests];
    localStorage.setItem(CHANGE_REQUEST_STORAGE_KEY, JSON.stringify(updatedRequests));
    console.log('[ChangeRequestStorage] 履歴を保存:', changeRequest.id);
  } catch (error) {
    console.error('[ChangeRequestStorage] 保存エラー:', error);
  }
};

const getChangeRequestsFromStorage = (): ChangeRequestHistory[] => {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(CHANGE_REQUEST_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('[ChangeRequestStorage] 取得エラー:', error);
    return [];
  }
};

const updateChangeRequestStatus = (id: string, status: 'approved' | 'rejected') => {
  if (typeof window === 'undefined') return;
  
  try {
    const requests = getChangeRequestsFromStorage();
    const updatedRequests = requests.map(req => 
      req.id === id ? { ...req, status } : req
    );
    localStorage.setItem(CHANGE_REQUEST_STORAGE_KEY, JSON.stringify(updatedRequests));
    console.log('[ChangeRequestStorage] ステータス更新:', id, status);
  } catch (error) {
    console.error('[ChangeRequestStorage] ステータス更新エラー:', error);
  }
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
  const [notificationDrawerOpen, setNotificationDrawerOpen] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [isDataInitialized, setIsDataInitialized] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  
  // バックアップ用の状態（編集開始時にデータを保存）
  const [backupShifts, setBackupShifts] = useState<any[]>([]);
  const [backupRequests, setBackupRequests] = useState<any[]>([]);
  
  // 一時的な変更データ（承認されるまでは実際のデータに反映しない）
  const [tempShifts, setTempShifts] = useState<any[]>([]);
  const [tempRequests, setTempRequests] = useState<any[]>([]);
  const [isInEditMode, setIsInEditMode] = useState(false);
  
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

  // グローバルストアからシフトデータを取得（編集モード中は一時データを使用）
  const shifts = useMemo(() => {
    // 編集モード中は一時データを使用
    if (isInEditMode && tempShifts.length > 0) {
      console.log(`[AdminShifts] 一時データを使用: ${tempShifts.length}件`);
      return tempShifts;
    }
    
    const shiftsData = getShifts(currentYear, currentMonth);
    console.log(`[AdminShifts] shifts取得: ${currentYear}年${currentMonth}月 = ${shiftsData?.length || 0}件, 初期化済み=${isDataInitialized}`);
    return shiftsData || [];
  }, [currentYear, currentMonth, getShifts, isDataInitialized, isInEditMode, tempShifts]); // isDataInitializedを依存配列に追加

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
      
      // 変更内容を履歴に記録（一時データと元データの差分を計算）
      const originalShifts = backupShifts;
      const changedStaffs: any[] = [];
      
      // スタッフごとに変更内容を集計
      const staffIds = tempShifts.map(s => s.staffId).filter((id, index, array) => array.indexOf(id) === index);
      staffIds.forEach(staffId => {
        const staffMember = staffMembers?.find(s => s.id === staffId);
        if (!staffMember) return;
        
        const originalStaffShifts = originalShifts.filter(s => s.staffId === staffId);
        const tempStaffShifts = tempShifts.filter(s => s.staffId === staffId);
        
        const changes: any[] = [];
        
        // 変更されたシフトを特定
        tempStaffShifts.forEach(tempShift => {
          const originalShift = originalStaffShifts.find(s => s.date === tempShift.date);
          const originalStatus = originalShift?.status || '-';
          
          if (originalStatus !== tempShift.status) {
            changes.push({
              date: tempShift.date,
              oldStatus: originalStatus,
              newStatus: tempShift.status
            });
          }
        });
        
        if (changes.length > 0) {
          changedStaffs.push({
            staffId,
            staffName: staffMember.name,
            changes
          });
        }
      });
      
      // 変更依頼履歴を作成してローカルストレージに保存
      const changeRequestId = `cr-${currentYear}${currentMonth.padStart(2, '0')}-${Date.now()}`;
      const totalChanges = changedStaffs.reduce((sum, staff) => sum + staff.changes.length, 0);
      
      // 要望データの変更も含める（要望テキスト、平日希望数、土日希望数）
      const originalRequests = backupRequests;
      tempRequests.forEach(tempRequest => {
        const originalRequest = originalRequests.find(r => r.id === tempRequest.id);
        const staffMember = staffMembers?.find(s => s.id === tempRequest.id);
        if (!staffMember) return;
        
        const requestChanges: any[] = [];
        
        // 要望テキストの変更
        const originalRequestText = originalRequest?.requestText || '';
        if (originalRequestText !== tempRequest.requestText) {
          requestChanges.push({
            date: '',
            field: 'requestText' as const,
            oldValue: originalRequestText,
            newValue: tempRequest.requestText
          });
        }
        
        // 平日希望数の変更
        const originalTotalRequest = originalRequest?.totalRequest || 20;
        if (originalTotalRequest !== tempRequest.totalRequest) {
          requestChanges.push({
            date: '',
            field: 'totalRequest' as const,
            oldValue: originalTotalRequest.toString(),
            newValue: tempRequest.totalRequest.toString()
          });
        }
        
        // 土日希望数の変更
        const originalWeekendRequest = originalRequest?.weekendRequest || 5;
        if (originalWeekendRequest !== tempRequest.weekendRequest) {
          requestChanges.push({
            date: '',
            field: 'weekendRequest' as const,
            oldValue: originalWeekendRequest.toString(),
            newValue: tempRequest.weekendRequest.toString()
          });
        }
        
        if (requestChanges.length > 0) {
          const existingStaff = changedStaffs.find(s => s.staffId === tempRequest.id);
          
          if (existingStaff) {
            existingStaff.changes.push(...requestChanges);
          } else {
            changedStaffs.push({
              staffId: tempRequest.id,
              staffName: staffMember.name,
              changes: requestChanges
            });
          }
        }
      });
      
      // 履歴オブジェクトを作成
      const changeRequestHistory: ChangeRequestHistory = {
        id: changeRequestId,
        requestDate: new Date().toISOString(),
        targetYear: parseInt(currentYear),
        targetMonth: parseInt(currentMonth),
        staffChanges: changedStaffs.map(staff => ({
          staffId: staff.staffId,
          staffName: staff.staffName,
          changes: staff.changes.map((change: any) => ({
            date: change.date || '',
            field: change.field || 'status',
            oldValue: change.oldStatus || change.oldValue || '',
            newValue: change.newStatus || change.newValue || ''
          }))
        })),
        status: 'pending',
        totalChanges: changedStaffs.reduce((sum, staff) => sum + staff.changes.length, 0),
        reason: changeReason || undefined // 変更理由を追加
      };
      
      // ローカルストレージに保存
      saveChangeRequestToStorage(changeRequestHistory);
      
      console.log('[ChangeRequest] 変更依頼履歴作成・保存完了:', {
        id: changeRequestId,
        year: currentYear,
        month: currentMonth,
        staffChanges: changedStaffs,
        totalChanges: changeRequestHistory.totalChanges
      });
      
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
      
      // 一時データをクリアして編集モード終了（承認されるまで実際のデータには反映しない）
      setTempShifts([]);
      setTempRequests([]);
      setIsInEditMode(false);
      
      setMessage('シフト変更依頼を送信しました（承認されるまで変更は反映されません）');
      setChangeRequestDialog(false);
      setTimeout(() => setMessage(''), 5000);
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

  // 追加: シフト表編集可否と変更依頼フロー管理
  const [changeRequestStep, setChangeRequestStep] = useState<'none' | 'confirm' | 'editing'>('none');
  const [submitConfirmDialog, setSubmitConfirmDialog] = useState(false); // 変更内容提出確認ダイアログ
  const [changeReason, setChangeReason] = useState(''); // 変更理由

  // ANSTEYPE提出状態に応じて編集可否を制御
  useEffect(() => {
    if (!isSubmitted) {
      setChangeRequestStep('none');
    } else {
      setChangeRequestStep('none');
    }
  }, [isSubmitted]);

  // 希望列・要望行の編集ハンドラ（提出前は直接更新、提出後は一時データを更新）
  const handleStatusChange = (staffId: string, date: string, newStatus: '○' | '×' | '-') => {
    if (!isSubmitted) {
      // 提出前：直接ストアを更新
      const { useShiftStore } = require('../../../../stores/shiftStore');
      const store = useShiftStore.getState();
      const currentShifts = store.getShifts(currentYear, currentMonth) || [];
      
      const updatedShifts = [...currentShifts];
      const existingIndex = updatedShifts.findIndex(s => s.staffId === staffId && s.date === date);
      
      if (existingIndex >= 0) {
        updatedShifts[existingIndex] = { ...updatedShifts[existingIndex], status: newStatus };
      } else {
        updatedShifts.push({
          date,
          staffId,
          status: newStatus,
          location: undefined,
          comment: undefined
        });
      }
      
      store.updateShifts(currentYear, currentMonth, updatedShifts);
      
      // 強制的に再レンダリングを発生させるため、isDataInitializedを切り替え
      setIsDataInitialized(prev => !prev);
      
      console.log(`[DirectEdit] シフト状況更新: ${staffId} ${date} → ${newStatus}`);
      return;
    }
    
    // 提出後：編集モードの場合のみ一時データを更新
    if (!isInEditMode) return;
    
    setTempShifts(prevShifts => {
      const updatedShifts = [...prevShifts];
      const existingIndex = updatedShifts.findIndex(s => s.staffId === staffId && s.date === date);
      
      if (existingIndex >= 0) {
        updatedShifts[existingIndex] = { ...updatedShifts[existingIndex], status: newStatus };
      } else {
        updatedShifts.push({
          date,
          staffId,
          status: newStatus,
          location: undefined,
          comment: undefined
        });
      }
      
      console.log(`[TempData] シフト状況更新: ${staffId} ${date} → ${newStatus}`);
      return updatedShifts;
    });
  };
  
  const handleRequestTextChange = (staffId: string, text: string) => {
    if (!isSubmitted) {
      // 提出前：直接ストアを更新
      const { useShiftStore } = require('../../../../stores/shiftStore');
      const store = useShiftStore.getState();
      const currentRequests = store.getStaffRequests(currentYear, currentMonth) || [];
      
      const updatedRequests = [...currentRequests];
      const existingIndex = updatedRequests.findIndex(r => r.id === staffId);
      
      if (existingIndex >= 0) {
        updatedRequests[existingIndex] = { ...updatedRequests[existingIndex], requestText: text };
      } else {
        updatedRequests.push({
          id: staffId,
          totalRequest: 20,
          weekendRequest: 5,
          company: '',
          requestText: text
        });
      }
      
      store.updateStaffRequests(currentYear, currentMonth, updatedRequests);
      
      // 強制的に再レンダリングを発生させるため、isDataInitializedを切り替え
      setIsDataInitialized(prev => !prev);
      
      console.log(`[DirectEdit] 要望テキスト更新: ${staffId} → ${text}`);
      return;
    }
    
    // 提出後：編集モードの場合のみ一時データを更新
    if (!isInEditMode) return;
    
    setTempRequests(prevRequests => {
      const updatedRequests = [...prevRequests];
      const existingIndex = updatedRequests.findIndex(r => r.id === staffId);
      
      if (existingIndex >= 0) {
        updatedRequests[existingIndex] = { ...updatedRequests[existingIndex], requestText: text };
      } else {
        updatedRequests.push({
          id: staffId,
          totalRequest: 20,
          weekendRequest: 5,
          company: '',
          requestText: text
        });
      }
      
      console.log(`[TempData] 要望テキスト更新: ${staffId} → ${text}`);
      return updatedRequests;
    });
  };

  const handleRequestChange = (staffId: string, field: 'totalRequest' | 'weekendRequest', value: number) => {
    if (!isSubmitted) {
      // 提出前：直接ストアを更新
      const { useShiftStore } = require('../../../../stores/shiftStore');
      const store = useShiftStore.getState();
      const currentRequests = store.getStaffRequests(currentYear, currentMonth) || [];
      
      const updatedRequests = [...currentRequests];
      const existingIndex = updatedRequests.findIndex(r => r.id === staffId);
      
      if (existingIndex >= 0) {
        updatedRequests[existingIndex] = { ...updatedRequests[existingIndex], [field]: value };
      } else {
        updatedRequests.push({
          id: staffId,
          totalRequest: field === 'totalRequest' ? value : 20,
          weekendRequest: field === 'weekendRequest' ? value : 5,
          company: '',
          requestText: ''
        });
      }
      
      store.updateStaffRequests(currentYear, currentMonth, updatedRequests);
      
      // 強制的に再レンダリングを発生させるため、isDataInitializedを切り替え
      setIsDataInitialized(prev => !prev);
      
      console.log(`[DirectEdit] 要望数更新: ${staffId} ${field} → ${value}`);
      return;
    }
    
    // 提出後：編集モードの場合のみ一時データを更新
    if (!isInEditMode) return;
    
    setTempRequests(prevRequests => {
      const updatedRequests = [...prevRequests];
      const existingIndex = updatedRequests.findIndex(r => r.id === staffId);
      
      if (existingIndex >= 0) {
        updatedRequests[existingIndex] = { ...updatedRequests[existingIndex], [field]: value };
      } else {
        updatedRequests.push({
          id: staffId,
          totalRequest: field === 'totalRequest' ? value : 20,
          weekendRequest: field === 'weekendRequest' ? value : 5,
          company: '',
          requestText: ''
        });
      }
      
      console.log(`[TempData] 要望数更新: ${staffId} ${field} → ${value}`);
      return updatedRequests;
    });
  };

  // バックアップ機能を追加（編集モード管理も含む）
  const createBackup = () => {
    const { useShiftStore } = require('../../../../stores/shiftStore');
    const store = useShiftStore.getState();
    
    const currentShifts = store.getShifts(currentYear, currentMonth) || [];
    const currentRequests = store.getStaffRequests(currentYear, currentMonth) || [];
    
    setBackupShifts([...currentShifts]);
    setBackupRequests([...currentRequests]);
    
    // 編集モード開始：現在のデータを一時データとしてコピー
    setTempShifts([...currentShifts]);
    setTempRequests([...currentRequests]);
    setIsInEditMode(true);
    
    console.log('[Backup] データをバックアップし、編集モードを開始しました', { shifts: currentShifts.length, requests: currentRequests.length });
  };

  const restoreFromBackup = () => {
    // 一時データをクリアして編集モード終了
    setTempShifts([]);
    setTempRequests([]);
    setIsInEditMode(false);
    
    console.log('[Restore] 一時データをクリアし、編集モードを終了しました');
  };

  const clearBackup = () => {
    setBackupShifts([]);
    setBackupRequests([]);
    
    // 編集モード終了
    setTempShifts([]);
    setTempRequests([]);
    setIsInEditMode(false);
    
    console.log('[Backup] バックアップをクリアし、編集モードを終了しました');
  };

  // 一時データと元データをマージする関数
  const getMergedShifts = () => {
    if (!isInEditMode) {
      return shifts;
    }
    
    // 元データをベースに、一時データで上書き
    const mergedShifts = [...shifts];
    
    tempShifts.forEach(tempShift => {
      const existingIndex = mergedShifts.findIndex(
        s => s.staffId === tempShift.staffId && s.date === tempShift.date
      );
      
      if (existingIndex >= 0) {
        // 既存データを一時データで上書き
        mergedShifts[existingIndex] = { ...mergedShifts[existingIndex], ...tempShift };
      } else {
        // 新規データを追加
        mergedShifts.push(tempShift);
      }
    });
    
    return mergedShifts;
  };

  // 一時要望データと元要望データをマージする関数
  const getMergedRequests = () => {
    // 元データをベースに、一時データで上書き
    const { useShiftStore } = require('../../../../stores/shiftStore');
    const store = useShiftStore.getState();
    const originalRequests = store.getStaffRequests(currentYear, currentMonth) || [];
    
    if (!isInEditMode) {
      return originalRequests; // 編集モードでない場合は元データをそのまま返す
    }
    
    const mergedRequests = [...originalRequests];
    
    tempRequests.forEach(tempRequest => {
      const existingIndex = mergedRequests.findIndex(r => r.id === tempRequest.id);
      
      if (existingIndex >= 0) {
        // 既存データを一時データで上書き
        mergedRequests[existingIndex] = { ...mergedRequests[existingIndex], ...tempRequest };
      } else {
        // 新規データを追加
        mergedRequests.push(tempRequest);
      }
    });
    
    return mergedRequests;
  };

  // グローバルストアから要望データを取得（編集モード中は一時データを使用）
  const staffRequests = useMemo(() => {
    return getMergedRequests();
  }, [currentYear, currentMonth, isDataInitialized, isInEditMode, tempRequests]); // isDataInitializedを依存配列に追加

  // エクセルエクスポート機能（設定メニューから呼び出される）
  // 日付フォーマット関数
  const formatDateForDisplay = (dateStr: string) => {
    if (!dateStr) return '-';
    const [year, month, day] = dateStr.split('-');
    return `${year}年${month}月${day}日`;
  };

  // 変更内容を分析する関数
  const analyzeChanges = () => {
    const changes = {
      shiftChanges: [] as Array<{
        staffId: string;
        staffName: string;
        changes: Array<{
          date: string;
          oldValue: string;
          newValue: string;
        }>;
      }>,
      requestChanges: [] as Array<{
        staffId: string;
        staffName: string;
        changes: Array<{
          field: string;
          fieldLabel: string;
          oldValue: string;
          newValue: string;
        }>;
      }>,
      totalChanges: 0
    };

    // シフト変更の分析
    const staffIds = tempShifts.map(s => s.staffId).filter((id, index, array) => array.indexOf(id) === index);
    staffIds.forEach(staffId => {
      const staffMember = staffMembers?.find(s => s.id === staffId);
      if (!staffMember) return;

      const originalStaffShifts = backupShifts.filter(s => s.staffId === staffId);
      const tempStaffShifts = tempShifts.filter(s => s.staffId === staffId);

      const shiftChanges: Array<{
        date: string;
        oldValue: string;
        newValue: string;
      }> = [];

      tempStaffShifts.forEach(tempShift => {
        const originalShift = originalStaffShifts.find(s => s.date === tempShift.date);
        const originalStatus = originalShift?.status || '-';

        if (originalStatus !== tempShift.status) {
          shiftChanges.push({
            date: tempShift.date,
            oldValue: originalStatus,
            newValue: tempShift.status
          });
        }
      });

      if (shiftChanges.length > 0) {
        changes.shiftChanges.push({
          staffId,
          staffName: staffMember.name,
          changes: shiftChanges
        });
        changes.totalChanges += shiftChanges.length;
      }
    });

    // 要望変更の分析
    tempRequests.forEach(tempRequest => {
      const originalRequest = backupRequests.find(r => r.id === tempRequest.id);
      const staffMember = staffMembers?.find(s => s.id === tempRequest.id);
      if (!staffMember) return;

      const requestChanges: Array<{
        field: string;
        fieldLabel: string;
        oldValue: string;
        newValue: string;
      }> = [];

      // 要望テキストの変更
      const originalRequestText = originalRequest?.requestText || '';
      if (originalRequestText !== tempRequest.requestText) {
        requestChanges.push({
          field: 'requestText',
          fieldLabel: '要望テキスト',
          oldValue: originalRequestText || '（なし）',
          newValue: tempRequest.requestText || '（なし）'
        });
      }

      // 平日希望数の変更
      const originalTotalRequest = originalRequest?.totalRequest || 20;
      if (originalTotalRequest !== tempRequest.totalRequest) {
        requestChanges.push({
          field: 'totalRequest',
          fieldLabel: '平日希望数',
          oldValue: originalTotalRequest.toString(),
          newValue: tempRequest.totalRequest.toString()
        });
      }

      // 土日希望数の変更
      const originalWeekendRequest = originalRequest?.weekendRequest || 5;
      if (originalWeekendRequest !== tempRequest.weekendRequest) {
        requestChanges.push({
          field: 'weekendRequest',
          fieldLabel: '土日希望数',
          oldValue: originalWeekendRequest.toString(),
          newValue: tempRequest.weekendRequest.toString()
        });
      }

      if (requestChanges.length > 0) {
        changes.requestChanges.push({
          staffId: tempRequest.id,
          staffName: staffMember.name,
          changes: requestChanges
        });
        changes.totalChanges += requestChanges.length;
      }
    });

    return changes;
  };

  // 変更内容提出の実行
  const handleSubmitChangeRequest = async () => {
    try {
      await handleChangeRequest();
      clearBackup();
      setChangeRequestStep('none');
      setSubmitConfirmDialog(false);
      setChangeReason(''); // 変更理由をクリア
    } catch (error) {
      console.error('[AdminShifts] 変更内容提出エラー:', error);
      setMessage('変更内容の提出に失敗しました');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleExcelExportFromMenu = () => {
    // ExcelExportコンポーネントのボタンをプログラム的にクリック
    const excelExportButton = document.querySelector('[data-testid="excel-export-button"]') as HTMLButtonElement;
    if (excelExportButton) {
      excelExportButton.click();
    }
  };

  // 通知関連のハンドラー
  const handleNotificationClick = () => {
    setNotificationDrawerOpen(true);
  };

  const handleNotificationMarkAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const handleNotificationClearAll = () => {
    setNotifications([]);
  };

  // 未読通知数を計算
  const unreadNotificationCount = notifications.filter(n => !n.isRead).length;

  return (
    <Box sx={{ backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      {/* AdminHeader */}
      <AdminHeader 
        onExcelExport={handleExcelExportFromMenu}
        onNotificationClick={handleNotificationClick}
        notificationCount={unreadNotificationCount}
      />

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
                {!isSubmitted && (
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<Send />}
                    onClick={() => setSubmitDialog(true)}
                    disabled={isLoading}
                    sx={{ minWidth: 200 }}
                  >
                    {isLoading ? '全スタッフシフト提出中...' : '全スタッフシフトをANSTEYPEに提出'}
                  </Button>
                )}
                
                {/* シフト変更依頼ボタンエリア（提出済みの場合のみ表示） */}
                {isSubmitted && (
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    {changeRequestStep === 'editing' ? (
                      <>
                        <Button variant="outlined" onClick={() => { 
                          restoreFromBackup(); 
                          setChangeRequestStep('none'); 
                        }}>キャンセル</Button>
                        <Button variant="contained" color="primary" onClick={() => setSubmitConfirmDialog(true)}>
                          変更内容を提出
                        </Button>
                      </>
                    ) : (
                      <Button
                        variant="outlined"
                        color="primary"
                        onClick={() => setChangeRequestStep('confirm')}
                        sx={{ minWidth: 150 }}
                      >
                        シフト変更操作
                      </Button>
                    )}
                  </Box>
                )}
                
                {/* システム連携状態 */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mr: 1 }}>
                    連携状態:
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip
                      label={!isSubmitted ? "未連携（提出待ち）" : (isInEditMode ? "同期停止（編集中）" : (isAutoSyncing ? "Ansteyeと同期中" : "同期停止"))}
                      color={!isSubmitted ? "warning" : (isInEditMode ? "error" : (isAutoSyncing ? "success" : "default"))}
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
            shifts={isMounted ? getMergedShifts() : []}
            staffRequests={isMounted ? staffRequests : undefined}
            year={year}
            month={month}
            hideCaseColumns={true}
            isReadOnly={isSubmitted && !isInEditMode} // 提出前は編集可、提出後は編集モード時のみ編集可
            onStatusChange={!isSubmitted || isInEditMode ? handleStatusChange : undefined} // 提出前は常に有効、提出後は編集モード時のみ有効
            onRequestTextChange={!isSubmitted || isInEditMode ? handleRequestTextChange : undefined} // 提出前は常に有効、提出後は編集モード時のみ有効
            onRequestChange={!isSubmitted || isInEditMode ? handleRequestChange : undefined} // 提出前は常に有効、提出後は編集モード時のみ有効
            onRateChange={undefined}
            disableDoubleClick={true}
            requestCellReadOnly={isSubmitted && !isInEditMode} // 提出前は編集可、提出後は編集モード時のみ編集可
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

      {/* シフト変更操作確認ダイアログ */}
      <Dialog open={changeRequestStep === 'confirm'} onClose={() => setChangeRequestStep('none')}>
        <DialogTitle>シフト変更操作</DialogTitle>
        <DialogContent>
          <Typography color="primary.main" sx={{ mb: 2 }}>
            シフト表の編集が可能になります。編集後「変更内容を提出」してください。キャンセルも可能です。
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setChangeRequestStep('none')}>キャンセル</Button>
          <Button variant="contained" color="primary" onClick={() => { 
            createBackup(); 
            setChangeRequestStep('editing'); 
          }}>
            操作開始
          </Button>
        </DialogActions>
      </Dialog>

      {/* 変更内容提出確認ダイアログ */}
      <Dialog open={submitConfirmDialog} onClose={() => setSubmitConfirmDialog(false)} maxWidth="lg" fullWidth>
        <DialogTitle>変更内容の確認・提出</DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            以下の変更内容をANSTEYPE管理者に提出しますか？
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            ※提出後は承認されるまで変更内容は実際のシフトに反映されません。
          </Typography>
          
          {/* 基本情報 */}
          <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
              基本情報
            </Typography>
            <Typography variant="body2" color="primary.main">
              対象月: {currentYear}年{currentMonth}月
            </Typography>
            <Typography variant="body2" color="primary.main">
              総変更件数: {analyzeChanges().totalChanges}件
            </Typography>
          </Box>

          {/* 変更内容詳細 */}
          {(() => {
            const changes = analyzeChanges();
            return (
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
                  変更内容詳細
                </Typography>
                
                {/* シフト変更 */}
                {changes.shiftChanges.length > 0 && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1, color: 'primary.main' }}>
                      シフト希望の変更
                    </Typography>
                    {changes.shiftChanges.map((staffChange, staffIndex) => (
                      <Box key={staffChange.staffId} sx={{ mb: 2, ml: 2 }}>
                        <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                          {staffChange.staffName}
                        </Typography>
                        <TableContainer component={Paper} variant="outlined" sx={{ mb: 1 }}>
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell>日付</TableCell>
                                <TableCell>変更前</TableCell>
                                <TableCell>変更後</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {staffChange.changes.map((change, changeIndex) => (
                                <TableRow key={changeIndex}>
                                  <TableCell>
                                    {formatDateForDisplay(change.date)}
                                  </TableCell>
                                  <TableCell>{change.oldValue}</TableCell>
                                  <TableCell>{change.newValue}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </Box>
                    ))}
                  </Box>
                )}

                {/* 要望変更 */}
                {changes.requestChanges.length > 0 && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1, color: 'primary.main' }}>
                      要望の変更
                    </Typography>
                    {changes.requestChanges.map((staffChange, staffIndex) => (
                      <Box key={staffChange.staffId} sx={{ mb: 2, ml: 2 }}>
                        <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                          {staffChange.staffName}
                        </Typography>
                        <TableContainer component={Paper} variant="outlined" sx={{ mb: 1 }}>
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell>項目</TableCell>
                                <TableCell>変更前</TableCell>
                                <TableCell>変更後</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {staffChange.changes.map((change, changeIndex) => (
                                <TableRow key={changeIndex}>
                                  <TableCell>{change.fieldLabel}</TableCell>
                                  <TableCell>{change.oldValue}</TableCell>
                                  <TableCell>{change.newValue}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </Box>
                    ))}
                  </Box>
                )}

                {changes.totalChanges === 0 && (
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                    変更内容がありません
                  </Typography>
                )}
              </Box>
            );
          })()}

          {/* 変更理由入力 */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
              変更理由
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={3}
              placeholder="変更理由を入力してください（任意）"
              value={changeReason}
              onChange={(e) => setChangeReason(e.target.value)}
              variant="outlined"
            />
          </Box>

          <Typography variant="body2" color="error.main" sx={{ mb: 2 }}>
            ⚠️ 提出後は管理者の承認が必要です。内容をよく確認してから提出してください。
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSubmitConfirmDialog(false)}>キャンセル</Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmitChangeRequest}
            disabled={analyzeChanges().totalChanges === 0}
          >
            変更内容を提出する
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

      {/* 非表示のExcelExportコンポーネント（設定メニューから呼び出される） */}
      <Box sx={{ display: 'none' }}>
        <ExcelExport
          staffMembers={staffMembers || []}
          shifts={shifts}
          currentYear={parseInt(currentYear)}
          currentMonth={parseInt(currentMonth)}
          onGetShiftsForMonth={getShiftsForMonth}
          onGetStaffRequestsForMonth={getStaffRequestsForMonth}
        />
      </Box>

      {/* 通知システム */}
      <NotificationSystem
        notifications={notifications}
        onMarkAsRead={handleNotificationMarkAsRead}
        onApproveChange={approveChangeRequest}
        onRejectChange={rejectChangeRequest}
        onClearAll={handleNotificationClearAll}
        isAdminMode={true}
        open={notificationDrawerOpen}
        onClose={() => setNotificationDrawerOpen(false)}
        hideIcon={true}
      />
    </Box>
  );
} 