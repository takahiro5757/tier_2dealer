export interface StaffMember {
  id: string; 
  name: string; 
  nameKana: string; 
  station: string;
  weekdayRate: number; 
  holidayRate: number; 
  tel: string; 
  role?: string;
  company?: string; // 所属会社フィールド
  submissionStatus?: SubmissionStatus; // 提出状態（スタッフ別の状態管理用）
}

// 提出状態の定義
export type SubmissionStatus = 'draft' | 'submitted' | 'approved' | 'rejected' | 'pending_approval';

// 同期状態の定義
export type SyncStatus = 'synced' | 'pending' | 'conflict' | 'error';

export interface Shift {
  id?: string; // シフトの一意識別子
  date: string; 
  staffId: string; 
  status: '○' | '×' | '-'; 
  location?: string;
  rate?: number; // 単価
  comment?: string; // コメント（シフト提出時のコメント）
  
  // 連携システム用フィールド
  submissionStatus?: SubmissionStatus; // 提出状態
  syncStatus?: SyncStatus; // 同期状態
  submittedAt?: string; // 提出日時（ISO文字列）
  approvedAt?: string; // 承認日時（ISO文字列）
  lastModified?: Date; // 最終更新日時
  lastSyncTime?: Date; // 最終同期日時
  lastSubmitted?: Date; // 最終提出日時
  version?: number; // データバージョン（楽観的排他制御用）
  
  // 変更申請用フィールド
  originalStatus?: '○' | '×' | '-'; // 変更前のステータス（変更申請時のみ）
  changeReason?: string; // 変更理由
  isChangeRequest?: boolean; // 変更申請フラグ
}

// 提出データのまとまり
export interface ShiftSubmission {
  id: string; // 提出ID
  companyId: string; // 提出元会社ID（例：'Festal'）
  yearMonth: string; // 対象年月（例：'2025-04'）
  shifts: Shift[]; // シフトデータ
  submissionStatus: SubmissionStatus;
  submittedAt: string; // 提出日時
  submittedBy: string; // 提出者ID
  approvedAt?: string; // 承認日時
  approvedBy?: string; // 承認者ID
  rejectionReason?: string; // 却下理由
  isInitialSubmission: boolean; // 初回提出フラグ
}

export interface SpreadsheetGridProps {
  year: number; 
  month: number; 
  staffMembers: StaffMember[]; 
  shifts: Shift[];
  onRateChange?: (staffId: string, date: string, rate: number) => void; 
  onStatusChange?: (staffId: string, date: string, status: '○' | '×' | '-') => void;
  onRequestTextChange?: (staffId: string, text: string) => void; // 要望テキスト変更コールバック
  hideCaseColumns?: boolean; // C案件からG未決までの列を隠すオプション
  hideCommentRow?: boolean; // コメント行を隠すオプション
  
  // 連携システム用プロップ
  isReadOnly?: boolean; // 読み取り専用モード
  showSyncStatus?: boolean; // 同期状態表示
  onSubmitToAnsteype?: (shifts: Shift[]) => Promise<void>; // Ansteyp提出コールバック
  disableDoubleClick?: boolean; // ダブルクリック機能を無効にするオプション
}

export interface DateInfo { 
  date: Date; 
  dayOfWeek: string; 
  isWeekend: boolean; 
}

export interface StaffRequest {
  id: string;
  totalRequest: number;
  weekendRequest: number;
  company: string;
  requestText?: string; // フリーテキスト要望
}

export type CellPosition = {
  staffId: string;
  date: Date;
};

// 同期管理用のインターフェース
export interface SyncManager {
  // Ansteype → Festal 同期
  syncFromAnsteype: (yearMonth: string) => Promise<Shift[]>;
  
  // Festal → Ansteype 提出
  submitToAnsteype: (submission: ShiftSubmission) => Promise<{success: boolean, submissionId?: string, error?: string}>;
  
  // 同期状態確認
  checkSyncStatus: (yearMonth: string) => Promise<SyncStatus>;
  
  // 承認状態確認
  checkApprovalStatus: (submissionId: string) => Promise<SubmissionStatus>;
} 