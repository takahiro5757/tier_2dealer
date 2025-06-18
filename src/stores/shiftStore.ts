import { create } from 'zustand';
import { Shift, StaffRequest } from '@/components/shifts/SpreadsheetGrid/types';

// shiftStore専用のStaffMember型（軽量版）
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

// 通知の型定義
export interface Notification {
  id: string;
  type: 'change_request' | 'approval' | 'rejection' | 'info';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  staffId?: string;
  staffName?: string;
  companyName?: string;
  targetAudience?: 'ansteype' | 'festal' | 'all';
  changeDetails?: {
    yearMonth: string;
    changes: Array<{
      staffId: string;
      staffName: string;
      date: string;
      oldStatus: string;
      newStatus: string;
      reason?: string;
    }>;
  };
}

// スタッフメンバーのダミーデータ
export const staffMembers: StaffMember[] = [
  // クローザー
  {
    id: '1205000001',
    name: '荒川拓実',
    nameKana: 'アラカワタクミ',
    station: '渋谷駅',
    weekdayRate: 20000,
    holidayRate: 25000,
    tel: '090-1234-5678',
    role: 'クローザー',
    company: 'ANSTEYPE社員'
  },
  {
    id: '1205000002',
    name: '山中翔',
    nameKana: 'ヤマナカショウ',
    station: '新宿駅',
    weekdayRate: 18000,
    holidayRate: 22000,
    tel: '090-2345-6789',
    role: 'クローザー',
    company: 'ANSTEYPE個人事業主'
  },
  {
    id: '1205000003',
    name: '猪本留渚',
    nameKana: 'イノモトルナ',
    station: '池袋駅',
    weekdayRate: 19000,
    holidayRate: 23000,
    tel: '090-3456-7890',
    role: 'クローザー',
    company: 'ANSTEYPE社員'
  },
  {
    id: '1205000004',
    name: '吉岡海',
    nameKana: 'ヨシオカカイ',
    station: '東京駅',
    weekdayRate: 21000,
    holidayRate: 26000,
    tel: '090-4567-8901',
    role: 'クローザー',
    company: 'ANSTEYPE社員'
  },
  {
    id: '1205000005',
    name: '岩田咲海',
    nameKana: 'イワタサクミ',
    station: '品川駅',
    weekdayRate: 19500,
    holidayRate: 24000,
    tel: '090-5678-9012',
    role: 'クローザー',
    company: 'ANSTEYPE社員'
  },
  {
    id: '1205000006',
    name: '林宏樹',
    nameKana: 'ハヤシヒロキ',
    station: '上野駅',
    weekdayRate: 20500,
    holidayRate: 25500,
    tel: '090-6789-0123',
    role: 'クローザー',
    company: 'ANSTEYPE社員'
  },
  {
    id: '1205000007',
    name: '齋藤涼花',
    nameKana: 'サイトウリョウカ',
    station: '秋葉原駅',
    weekdayRate: 18500,
    holidayRate: 23500,
    tel: '090-7890-1234',
    role: 'クローザー',
    company: 'ANSTEYPE社員'
  },
  {
    id: '1205000009',
    name: '水谷亮介',
    nameKana: 'ミズタニリョウスケ',
    station: '赤坂駅',
    weekdayRate: 21500,
    holidayRate: 27000,
    tel: '090-8901-2345',
    role: 'クローザー',
    company: 'ANSTEYPEバイト'
  },
  {
    id: '1205000010',
    name: '大久保卓哉',
    nameKana: 'オオクボタクヤ',
    station: '三田駅',
    weekdayRate: 19800,
    holidayRate: 24500,
    tel: '090-9012-3456',
    role: 'クローザー',
    company: 'ANSTEYPE社員'
  },
  {
    id: '1205000011',
    name: '佐藤孝郁',
    nameKana: 'サトウタカフミ',
    station: '目黒駅',
    weekdayRate: 20200,
    holidayRate: 25200,
    tel: '090-0123-4567',
    role: 'クローザー',
    company: 'Festal'
  },
  {
    id: '1205000012',
    name: '富岡勇太',
    nameKana: 'トミオカユウタ',
    station: '五反田駅',
    weekdayRate: 19200,
    holidayRate: 24200,
    tel: '090-1122-3344',
    role: 'クローザー',
    company: 'ANSTEYPE社員'
  },
  {
    id: '1205000013',
    name: '髙橋愛結奈',
    nameKana: 'タカハシアユナ',
    station: '恵比寿駅',
    weekdayRate: 20800,
    holidayRate: 26300,
    tel: '090-2233-4455',
    role: 'クローザー',
    company: 'ANSTEYPE社員'
  },
  {
    id: '1205000014',
    name: '和田美優',
    nameKana: 'ワダミユ',
    station: '新橋駅',
    weekdayRate: 21300,
    holidayRate: 26800,
    tel: '090-3344-5566',
    role: 'クローザー',
    company: 'ANSTEYPE個人事業主'
  },
  {
    id: '1205000015',
    name: '中島悠喜',
    nameKana: 'ナカシマユウキ',
    station: '有楽町駅',
    weekdayRate: 19700,
    holidayRate: 24700,
    tel: '090-4455-6677',
    role: 'クローザー',
    company: 'ANSTEYPE個人事業主'
  },
  {
    id: '1205000016',
    name: '石谷直斗',
    nameKana: 'イシタニナオト',
    station: '御茶ノ水駅',
    weekdayRate: 20400,
    holidayRate: 25400,
    tel: '090-5566-7788',
    role: 'クローザー',
    company: 'PPP'
  },
  {
    id: '1205000017',
    name: '阿部将大',
    nameKana: 'アベショウダイ',
    station: '代々木駅',
    weekdayRate: 18800,
    holidayRate: 23800,
    tel: '090-6677-8899',
    role: 'クローザー',
    company: 'Festal'
  },
  {
    id: '1205000018',
    name: '本間大地',
    nameKana: 'ホンマダイチ',
    station: '四ツ谷駅',
    weekdayRate: 19900,
    holidayRate: 24900,
    tel: '090-7788-9900',
    role: 'クローザー',
    company: 'Festal'
  },
  {
    id: '1205000019',
    name: '田中健太',
    nameKana: 'タナカケンタ',
    station: '飯田橋駅',
    weekdayRate: 20100,
    holidayRate: 25100,
    tel: '090-8899-0011',
    role: 'クローザー',
    company: 'ANSTEYPE社員'
  },
  {
    id: '1205000020',
    name: '佐々木翔太',
    nameKana: 'ササキショウタ',
    station: '神田駅',
    weekdayRate: 19600,
    holidayRate: 24600,
    tel: '090-9900-1122',
    role: 'クローザー',
    company: 'ANSTEYPE社員'
  },
  {
    id: '1205000021',
    name: '高田雄大',
    nameKana: 'タカダユウダイ',
    station: '大手町駅',
    weekdayRate: 20600,
    holidayRate: 25600,
    tel: '090-0011-2233',
    role: 'クローザー',
    company: 'ANSTEYPE社員'
  },
  {
    id: '1205000022',
    name: '松本拓海',
    nameKana: 'マツモトタクミ',
    station: '日本橋駅',
    weekdayRate: 19300,
    holidayRate: 24300,
    tel: '090-1122-3344',
    role: 'クローザー',
    company: 'ANSTEYPE社員'
  },
  {
    id: '1205000023',
    name: '小林大輝',
    nameKana: 'コバヤシダイキ',
    station: '銀座駅',
    weekdayRate: 21200,
    holidayRate: 26200,
    tel: '090-2233-4455',
    role: 'クローザー',
    company: 'ANSTEYPE社員'
  },
  {
    id: '1205000024',
    name: '伊藤慎也',
    nameKana: 'イトウシンヤ',
    station: '築地駅',
    weekdayRate: 18900,
    holidayRate: 23900,
    tel: '090-3344-5566',
    role: 'クローザー',
    company: 'ANSTEYPE社員'
  },
  {
    id: '1205000025',
    name: '渡辺優斗',
    nameKana: 'ワタナベユウト',
    station: '月島駅',
    weekdayRate: 20300,
    holidayRate: 25300,
    tel: '090-4455-6677',
    role: 'クローザー',
    company: 'ANSTEYPE社員'
  },
  {
    id: '1205000026',
    name: '堀田慎之介',
    nameKana: 'ホッタシンノスケ',
    station: '飯田橋駅',
    weekdayRate: 20700,
    holidayRate: 25700,
    tel: '090-8899-0011',
    role: 'クローザー',
    company: 'Festal'
  },
  {
    id: '1205000027',
    name: '上堀内啓太',
    nameKana: 'カミホリウチケイタ',
    station: '神田駅',
    weekdayRate: 21100,
    holidayRate: 26100,
    tel: '090-9900-1122',
    role: 'クローザー',
    company: 'Festal'
  },
  {
    id: '1205000028',
    name: '清水大樹',
    nameKana: 'シミズダイキ',
    station: '水道橋駅',
    weekdayRate: 19400,
    holidayRate: 24400,
    tel: '090-0011-2233',
    role: 'クローザー',
    company: 'ANSTEYPE社員'
  },
  {
    id: '1205000029',
    name: '松山家銘',
    nameKana: 'マツヤマイエアキ',
    station: '六本木駅',
    weekdayRate: 19400,
    holidayRate: 24400,
    tel: '090-0011-2233',
    role: 'クローザー',
    company: 'Festal'
  },
  // ガール
  {
    id: 'girl1',
    name: '田中美咲',
    nameKana: 'タナカミサキ',
    station: '新宿駅',
    weekdayRate: 12000,
    holidayRate: 15000,
    tel: '090-1111-2222',
    role: 'ガール',
    company: 'ANSTEYPE社員'
  },
  {
    id: 'girl2',
    name: '佐藤花音',
    nameKana: 'サトウカノン',
    station: '渋谷駅',
    weekdayRate: 13500,
    holidayRate: 16500,
    tel: '090-2222-3333',
    role: 'ガール',
    company: 'ANSTEYPE社員'
  },
  {
    id: 'girl3',
    name: '鈴木彩香',
    nameKana: 'スズキアヤカ',
    station: '池袋駅',
    weekdayRate: 11500,
    holidayRate: 14500,
    tel: '090-3333-4444',
    role: 'ガール',
    company: 'ANSTEYPE社員'
  },
  {
    id: 'girl4',
    name: '長谷川愛',
    nameKana: 'ハセガワアイ',
    station: '自由が丘駅',
    weekdayRate: 13000,
    holidayRate: 16000,
    tel: '090-4444-5555',
    role: 'ガール',
    company: 'Festal'
  },
  {
    id: 'girl5',
    name: '山田結衣',
    nameKana: 'ヤマダユイ',
    station: '恵比寿駅',
    weekdayRate: 14000,
    holidayRate: 17000,
    tel: '090-5555-6666',
    role: 'ガール',
    company: 'ANSTEYPE社員'
  },
  {
    id: 'girl6',
    name: '中村桜',
    nameKana: 'ナカムラサクラ',
    station: '代官山駅',
    weekdayRate: 12500,
    holidayRate: 15500,
    tel: '090-6666-7777',
    role: 'ガール',
    company: 'ANSTEYPE社員'
  },
  {
    id: 'girl7',
    name: '小川真由',
    nameKana: 'オガワマユ',
    station: '中目黒駅',
    weekdayRate: 13200,
    holidayRate: 16200,
    tel: '090-7777-8888',
    role: 'ガール',
    company: 'ANSTEYPE社員'
  },
  {
    id: 'girl8',
    name: '加藤莉子',
    nameKana: 'カトウリコ',
    station: '学芸大学駅',
    weekdayRate: 11800,
    holidayRate: 14800,
    tel: '090-8888-9999',
    role: 'ガール',
    company: 'ANSTEYPE社員'
  },
  {
    id: 'girl9',
    name: '斉藤美羽',
    nameKana: 'サイトウミウ',
    station: '都立大学駅',
    weekdayRate: 13800,
    holidayRate: 16800,
    tel: '090-9999-0000',
    role: 'ガール',
    company: 'ANSTEYPE社員'
  },
  {
    id: 'girl10',
    name: '森田優花',
    nameKana: 'モリタユウカ',
    station: '洗足駅',
    weekdayRate: 12200,
    holidayRate: 15200,
    tel: '090-0101-0202',
    role: 'ガール',
    company: 'ANSTEYPE社員'
  },
  {
    id: 'girl11',
    name: '西村那奈',
    nameKana: 'ニシムラナナ',
    station: '阿佐ヶ谷駅',
    weekdayRate: 16500,
    holidayRate: 19500,
    tel: '090-0303-0404',
    role: 'ガール',
    company: 'Festal'
  },
  {
    id: 'girl12',
    name: '橋本麻衣',
    nameKana: 'ハシモトマイ',
    station: '高円寺駅',
    weekdayRate: 12800,
    holidayRate: 15800,
    tel: '090-0505-0606',
    role: 'ガール',
    company: 'ANSTEYPE社員'
  },
  {
    id: 'girl13',
    name: '井上咲良',
    nameKana: 'イノウエサクラ',
    station: '荻窪駅',
    weekdayRate: 13600,
    holidayRate: 16600,
    tel: '090-0707-0808',
    role: 'ガール',
    company: 'ANSTEYPE社員'
  },
  {
    id: 'girl14',
    name: '木村美月',
    nameKana: 'キムラミツキ',
    station: '西荻窪駅',
    weekdayRate: 11900,
    holidayRate: 14900,
    tel: '090-0909-1010',
    role: 'ガール',
    company: 'ANSTEYPE社員'
  },
  {
    id: 'girl15',
    name: '松井愛美',
    nameKana: 'マツイマナミ',
    station: '吉祥寺駅',
    weekdayRate: 14200,
    holidayRate: 17200,
    tel: '090-1111-1212',
    role: 'ガール',
    company: 'ANSTEYPE社員'
  }
];

// ストアの型定義
interface ShiftStore {
  // シフトデータ
  shifts: Record<string, Shift[]>; // key: "year-month"
  staffRequests: Record<string, StaffRequest[]>; // key: "year-month"
  
  // 通知データ
  notifications: Notification[];
  
  // アクション
  getShifts: (year: string, month: string) => Shift[];
  updateShifts: (year: string, month: string, shifts: Shift[]) => void;
  addShift: (year: string, month: string, shift: Shift) => void;
  updateShift: (year: string, month: string, shiftId: string, updates: Partial<Shift>) => void;
  deleteShift: (year: string, month: string, shiftId: string) => void;
  
  // 要望データ関連
  getStaffRequests: (year: string, month: string) => StaffRequest[];
  initializeStaffRequests: (year: string, month: string) => void;
  updateStaffRequests: (year: string, month: string, requests: StaffRequest[]) => void;
  addStaffRequest: (year: string, month: string, request: StaffRequest) => void;
  updateStaffRequest: (year: string, month: string, requestId: string, updates: Partial<StaffRequest>) => void;
  
  // 通知関連
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => void;
  markNotificationAsRead: (notificationId: string) => void;
  clearAllNotifications: () => void;
  getNotificationsByAudience: (audience: 'ansteype' | 'festal' | 'all') => Notification[];
}

// Zustandストアの作成（persistを一時的に無効化）
export const useShiftStore = create<ShiftStore>((set, get) => ({
      shifts: {},
      staffRequests: {},
      notifications: [],

      // シフトデータ取得
      getShifts: (year: string, month: string) => {
        const key = `${year}-${month}`;
        return get().shifts[key] || [];
      },

      // シフトデータ更新
      updateShifts: (year: string, month: string, shifts: Shift[]) => {
        const key = `${year}-${month}`;
        set((state) => ({
          shifts: {
            ...state.shifts,
            [key]: shifts
          }
        }));
      },

      // シフト追加
      addShift: (year: string, month: string, shift: Shift) => {
        const key = `${year}-${month}`;
        set((state) => ({
          shifts: {
            ...state.shifts,
            [key]: [...(state.shifts[key] || []), shift]
          }
        }));
      },

      // シフト更新
      updateShift: (year: string, month: string, shiftId: string, updates: Partial<Shift>) => {
        const key = `${year}-${month}`;
        set((state) => ({
          shifts: {
            ...state.shifts,
            [key]: (state.shifts[key] || []).map(shift =>
              shift.id === shiftId ? { ...shift, ...updates } : shift
            )
          }
        }));
      },

      // シフト削除
      deleteShift: (year: string, month: string, shiftId: string) => {
        const key = `${year}-${month}`;
        set((state) => ({
          shifts: {
            ...state.shifts,
            [key]: (state.shifts[key] || []).filter(shift => shift.id !== shiftId)
          }
        }));
      },

      // 要望データ取得
      getStaffRequests: (year: string, month: string) => {
        const key = `${year}-${month}`;
        return get().staffRequests[key] || [];
      },

      // 要望データ初期化（別メソッドとして分離）
      initializeStaffRequests: (year: string, month: string) => {
        const key = `${year}-${month}`;
        const existingRequests = get().staffRequests[key];
        
        if (!existingRequests || existingRequests.length === 0) {
          // ランダムな要望テキストを生成する関数
          const getRandomRequestText = () => {
            const requestTexts = [
              '平日希望',
              '土日出勤可能',
              '夜勤希望',
              '短時間勤務希望',
              '連勤可能',
              '早番希望',
              '遅番希望',
              '週末のみ',
              '平日のみ',
              '時短勤務',
              '残業可能',
              '急な出勤対応可',
              ''
            ];
            return requestTexts[Math.floor(Math.random() * requestTexts.length)];
          };

          const initialRequests: StaffRequest[] = staffMembers.map(staff => ({
            id: staff.id,
            totalRequest: Math.floor(Math.random() * 10) + 15, // 15-24の範囲
            weekendRequest: Math.floor(Math.random() * 5) + 3, // 3-7の範囲
            company: staff.company || '',
            requestText: getRandomRequestText()
          }));
          
          set((state) => ({
            staffRequests: {
              ...state.staffRequests,
              [key]: initialRequests
            }
          }));
        }
      },

      // 要望データ更新
      updateStaffRequests: (year: string, month: string, requests: StaffRequest[]) => {
        const key = `${year}-${month}`;
        set((state) => ({
          staffRequests: {
            ...state.staffRequests,
            [key]: requests
          }
        }));
      },

      // 要望追加
      addStaffRequest: (year: string, month: string, request: StaffRequest) => {
        const key = `${year}-${month}`;
        set((state) => ({
          staffRequests: {
            ...state.staffRequests,
            [key]: [...(state.staffRequests[key] || []), request]
          }
        }));
      },

      // 要望更新
      updateStaffRequest: (year: string, month: string, requestId: string, updates: Partial<StaffRequest>) => {
        const key = `${year}-${month}`;
        set((state) => ({
          staffRequests: {
            ...state.staffRequests,
            [key]: (state.staffRequests[key] || []).map(request =>
              request.id === requestId ? { ...request, ...updates } : request
            )
          }
        }));
      },

      // 通知追加
      addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => {
        const newNotification: Notification = {
          ...notification,
          id: `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          createdAt: new Date().toISOString()
        };

        set((state) => ({
          notifications: [newNotification, ...state.notifications]
        }));
      },

      // 通知を既読にする
      markNotificationAsRead: (notificationId: string) => {
        set((state) => ({
          notifications: state.notifications.map(notification =>
            notification.id === notificationId
              ? { ...notification, isRead: true }
              : notification
          )
        }));
      },

      // 全通知をクリア
      clearAllNotifications: () => {
        set({ notifications: [] });
      },

      // 対象者別通知取得
      getNotificationsByAudience: (audience: 'ansteype' | 'festal' | 'all') => {
        const notifications = get().notifications;
        return notifications.filter(notification =>
          notification.targetAudience === audience || notification.targetAudience === 'all'
        );
      }
})); 