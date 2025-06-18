// initialStaffMembersの定義とexportのみを記載
export interface StaffMember {
  id: string;
  name: string;
  nameKana: string;
  station: string;
  weekdayRate: number;
  holidayRate: number;
  tel: string;
  role: string;
  company: string;
  email: string;
  password: string;
  businessTripNG: 'OK' | 'NG';
  submissionHistory: Record<string, 'submitted' | 'draft'>;
}

export const initialStaffMembers: StaffMember[] = [
  {
    id: 'staff001',
    name: '田中太郎',
    nameKana: 'タナカタロウ',
    station: '池袋駅',
    weekdayRate: 15000,
    holidayRate: 18000,
    tel: '090-1111-1111',
    role: 'クローザー',
    company: '株式会社Festal',
    email: 'tanaka.taro@example.com',
    password: 'password123',
    businessTripNG: 'OK',
    submissionHistory: {
      '2025-01': 'draft',
      '2025-02': 'submitted',
      '2025-03': 'submitted',
      '2025-04': 'submitted',
      '2025-05': 'submitted',
      '2025-06': 'submitted',
      '2025-07': 'submitted',
      '2025-08': 'submitted',
      '2025-09': 'submitted',
      '2025-10': 'submitted',
      '2025-11': 'submitted',
      '2025-12': 'submitted'
    }
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
    company: '株式会社Festal',
    email: 'sato.hanako@example.com',
    password: 'password456',
    businessTripNG: 'NG',
    submissionHistory: {
      '2025-01': 'draft',
      '2025-02': 'submitted',
      '2025-03': 'submitted',
      '2025-04': 'draft',
      '2025-05': 'submitted',
      '2025-06': 'submitted',
      '2025-07': 'submitted',
      '2025-08': 'draft',
      '2025-09': 'submitted',
      '2025-10': 'submitted',
      '2025-11': 'submitted',
      '2025-12': 'submitted'
    }
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
    company: '株式会社Festal',
    email: 'yamada.jiro@example.com',
    password: 'password789',
    businessTripNG: 'OK',
    submissionHistory: {
      '2025-01': 'draft',
      '2025-02': 'draft',
      '2025-03': 'submitted',
      '2025-04': 'submitted',
      '2025-05': 'draft',
      '2025-06': 'submitted',
      '2025-07': 'submitted',
      '2025-08': 'submitted',
      '2025-09': 'draft',
      '2025-10': 'submitted',
      '2025-11': 'submitted',
      '2025-12': 'submitted'
    }
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
    company: '株式会社Festal',
    email: 'suzuki.misaki@example.com',
    password: 'password101',
    businessTripNG: 'OK',
    submissionHistory: {
      '2025-01': 'draft',
      '2025-02': 'submitted',
      '2025-03': 'submitted',
      '2025-04': 'submitted',
      '2025-05': 'submitted',
      '2025-06': 'draft',
      '2025-07': 'submitted',
      '2025-08': 'submitted',
      '2025-09': 'submitted',
      '2025-10': 'draft',
      '2025-11': 'submitted',
      '2025-12': 'submitted'
    }
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
    company: '株式会社Festal',
    email: 'takahashi.kenta@example.com',
    password: 'password202',
    businessTripNG: 'NG',
    submissionHistory: {
      '2025-01': 'draft',
      '2025-02': 'draft',
      '2025-03': 'draft',
      '2025-04': 'submitted',
      '2025-05': 'submitted',
      '2025-06': 'submitted',
      '2025-07': 'draft',
      '2025-08': 'submitted',
      '2025-09': 'submitted',
      '2025-10': 'submitted',
      '2025-11': 'draft',
      '2025-12': 'submitted'
    }
  },
  {
    id: 'staff006',
    name: '中村雅人',
    nameKana: 'ナカムラマサト',
    station: '品川駅',
    weekdayRate: 15200,
    holidayRate: 18200,
    tel: '090-6666-6666',
    role: 'クローザー',
    company: '株式会社Festal',
    email: 'nakamura.masato@example.com',
    password: 'password303',
    businessTripNG: 'OK',
    submissionHistory: {
      '2025-01': 'draft',
      '2025-02': 'submitted',
      '2025-03': 'submitted',
      '2025-04': 'submitted',
      '2025-05': 'submitted',
      '2025-06': 'submitted',
      '2025-07': 'submitted',
      '2025-08': 'submitted',
      '2025-09': 'submitted',
      '2025-10': 'submitted',
      '2025-11': 'submitted',
      '2025-12': 'draft'
    }
  }
]; 