/**
 * シフト管理に関する型定義
 */

// 日付データの型
export interface DateInfo {
  date: string;
  dayOfWeek: string;
  display: string;
  isOtherMonth?: boolean;
}

// スタッフの可用性
export interface StaffAvailability {
  [key: string]: boolean;
}

// スタッフ詳細情報
export interface StaffDetails {
  nearestStation?: string;
  contact?: string;
  price?: number;
  ngStaff?: string[];
  ngAgencies?: string[];
  prevMonthDays?: number;
  prevPrevMonthDays?: number;
  note?: string;
}

// スタッフメンバー
export interface StaffMember {
  id: number;
  name: string;
  nameKana?: string;
  org: string;
  remote: boolean;
  noTrip: boolean;
  isGirl: boolean;
  isFemale: boolean;
  availability: StaffAvailability;
  details?: StaffDetails;
}

// オーダー情報
export interface Order {
  id: string;
  name: string;
  isGirl: boolean;
}

// スタッフアサイン情報
export interface StaffAssignment {
  id: string;
  name: string;
  isGirl: boolean;
  isFemale: boolean;
}

// オーダー枠情報
export interface OrderFrameInfo {
  frames: number;
  priceType: string; // '平日' or '週末'
  priceAmount: number;
}

// メモ情報
export interface MemoItem {
  id: string;
  text: string;
  timestamp: string;
  user: string;
}

// 帯案件情報
export interface SeriesFrameInfo {
  totalFrames: number;
  confirmedFrames: number;
}

// アサインメントアイテム
export interface AssignmentItem {
  id: string;
  agency: string;
  venue: string;
  venueDetail: string;
  hasTrip: boolean;
  isOutdoor: boolean;
  orders: Order[];
  
  // 利用可能日
  availability: {
    [key: string]: boolean;
  };
  
  // ステータス情報 ('absent', 'tm', 'selected'のいずれか)
  statuses?: {
    [orderId: string]: {
      [date: string]: string;
    };
  };
  
  // スタッフアサイン情報
  staff?: {
    [orderId: string]: {
      [date: string]: StaffAssignment;
    };
  };
  
  // メモ情報
  memos?: {
    [orderId: string]: {
      [date: string]: MemoItem[];
    };
  };
  
  // ロック情報
  locks?: {
    [orderId: string]: {
      [date: string]: boolean;
    };
  };
  
  // オーダー枠数と単価情報
  orderFrames?: {
    [orderId: string]: {
      [dayOfWeek: string]: OrderFrameInfo; // '0'=日曜, '1'=月曜, ..., '6'=土曜
    };
  };
  
  // 帯案件情報
  seriesFrames?: SeriesFrameInfo;
  
  // 帯案件モードでの店舗名
  seriesVenue?: string;
} 