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
  isActive: boolean;
} 