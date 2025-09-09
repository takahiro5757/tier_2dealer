export interface StaffMember {
  id: string;
  name: string;
  nameKana: string;
  gender: '男性' | '女性';
  station: string;
  weekdayRate: number;
  holidayRate: number;
  tel: string;
  role: string;
  company: string;
  email: string;
  password: string;
  lineId: string;
  businessTripNG: 'OK' | 'NG';
  submissionHistory: Record<string, 'submitted' | 'draft'>;
  isActive: boolean;
  profileImage?: string; // Base64エンコードされた画像データ
} 