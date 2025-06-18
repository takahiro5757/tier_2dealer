import { format, addDays, isWeekend, setDate, getDate, getMonth, getYear, addMonths, subMonths } from 'date-fns';
import { ja } from 'date-fns/locale';

// 日付データを生成する関数
export const generateDates = (startDate: Date, days: number = 7) => {
  const dates = [];
  const dayOfWeekMap = ['日', '月', '火', '水', '木', '金', '土'];

  // 現在の日付から最も近い火曜日を見つける
  const currentDay = startDate.getDay(); // 0=日, 1=月, 2=火, ...
  const daysUntilTuesday = (currentDay <= 2) ? (2 - currentDay) : (9 - currentDay);
  const tuesdayDate = addDays(startDate, daysUntilTuesday);
  
  for (let i = 0; i < days; i++) {
    const date = addDays(tuesdayDate, i);
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayOfWeek = dayOfWeekMap[date.getDay()];
    const display = format(date, 'M/d');

    dates.push({
      date: dateStr,
      dayOfWeek,
      display,
    });
  }

  return dates;
};

/**
 * 指定した年月の特定の週の日付データを生成する関数
 * @param year 年
 * @param month 月（1-12）
 * @param weekIndex 週番号（0-5）
 * @returns 7日分の日付データ
 */
export const generateWeekDates = (year: string | number, month: string | number, weekIndex: number) => {
  const numYear = typeof year === 'string' ? parseInt(year) : year;
  const numMonth = typeof month === 'string' ? parseInt(month) : month;
  
  // 月の最初の日を取得
  const firstDayOfMonth = new Date(numYear, numMonth - 1, 1);
  
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
    const lastDayOfPrevMonth = new Date(numYear, numMonth - 1, 0);
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
  
  const dayOfWeekMap = ['日', '月', '火', '水', '木', '金', '土'];
  const dates = [];
  
  // 7日分の日付データを生成
  for (let i = 0; i < 7; i++) {
    const date = addDays(startDate, i);
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayOfWeek = dayOfWeekMap[date.getDay()];
    const display = format(date, 'M/d');
    const month = date.getMonth() + 1; // 月は0始まり
    
    // 指定した月と異なる月かどうかをチェック
    const isOtherMonth = month !== numMonth;
    
    dates.push({
      date: dateStr,
      dayOfWeek,
      display,
      isOtherMonth, // 他の月の日付かどうか
    });
  }
  
  return dates;
};

// 利用可能状態の型定義
interface Availability {
  [key: string]: boolean;
}

// アサインメントの型定義
interface AssignmentItem {
  id: string;
  agency: string;
  venue: string;
  venueDetail: string;
  hasTrip: boolean;
  isOutdoor: boolean;
  orders: {
    id: string;
    name: string;
    isGirl: boolean;
  }[];
  availability: Availability;
  statuses?: {
    [orderId: string]: {
      [date: string]: string;
    };
  };
  // 帯案件情報を追加
  seriesFrames?: {
    totalFrames: number;
    confirmedFrames: number;
  };
  // 帯案件モードでの店舗名
  seriesVenue?: string;
}

// ダミーのアサインメントデータを生成する関数
export const generateDummyAssignments = () => {
  const now = new Date();
  const dates = generateDates(now);
  
  // 利用可能曜日を設定（全て利用可能にする）
  const generateAvailability = (): Availability => {
    const availability: Availability = {};
    dates.forEach(date => {
      // すべてのセルを利用可能に設定
      availability[date.date] = true;
    });
    return availability;
  };

  return [
    {
      id: 'assign1',
      agency: 'ピーアップ',
      venue: 'イオンモール上尾センターコート',
      venueDetail: '埼玉県上尾市愛宕3丁目8-1',
      hasTrip: false,
      isOutdoor: false,
      orders: [
        { id: 'order1', name: 'クローザー', isGirl: false },
        { id: 'order2', name: 'クローザー', isGirl: false },
        { id: 'order3', name: 'ガール', isGirl: true },
        { id: 'order4', name: 'ガール', isGirl: true },
      ],
      availability: generateAvailability(),
    },
    {
      id: 'assign2',
      agency: 'ピーアップ',
      venue: 'イトーヨーカドー立場',
      venueDetail: '神奈川県横浜市泉区中田西1-1-15',
      hasTrip: true,
      isOutdoor: false,
      orders: [
        { id: 'order5', name: 'クローザー', isGirl: false },
        { id: 'order6', name: 'クローザー', isGirl: false },
        { id: 'order7', name: 'ガール', isGirl: true },
      ],
      availability: generateAvailability(),
    },
    {
      id: 'assign3',
      agency: 'ラネット',
      venue: '錦糸町マルイ たい焼き屋前',
      venueDetail: '東京都墨田区江東橋3-9-10',
      hasTrip: false,
      isOutdoor: true,
      orders: [
        { id: 'order8', name: 'クローザー', isGirl: false },
        { id: 'order9', name: 'ガール', isGirl: true },
        { id: 'order10', name: 'ガール', isGirl: true },
      ],
      availability: generateAvailability(),
    },
    {
      id: 'assign4',
      agency: 'CS',
      venue: 'イオンタウン吉川美南',
      venueDetail: '埼玉県吉川市美南3丁目23-1',
      hasTrip: false,
      isOutdoor: true,
      orders: [
        { id: 'order11', name: 'クローザー', isGirl: false },
        { id: 'order12', name: 'クローザー', isGirl: false },
        { id: 'order13', name: 'ガール', isGirl: true },
      ],
      availability: generateAvailability(),
    },
    {
      id: 'assign5',
      agency: 'コスモネット',
      venue: 'エルミこうのす2F',
      venueDetail: '埼玉県鴻巣市本町1-1-2',
      hasTrip: false,
      isOutdoor: false,
      orders: [
        { id: 'order14', name: 'クローザー', isGirl: false },
        { id: 'order15', name: 'ガール', isGirl: true },
        { id: 'order16', name: 'ガール', isGirl: true },
      ],
      availability: generateAvailability(),
    },
    {
      id: 'assign6',
      agency: 'ベルパーク',
      venue: 'レイクタウンkaze3階ブリッジ',
      venueDetail: '埼玉県越谷市レイクタウン4-2-2',
      hasTrip: true,
      isOutdoor: false,
      orders: [
        { id: 'order17', name: 'クローザー', isGirl: false },
        { id: 'order18', name: 'クローザー', isGirl: false },
        { id: 'order19', name: 'ガール', isGirl: true },
      ],
      availability: generateAvailability(),
    },
    {
      id: 'assign7',
      agency: 'ニューコム',
      venue: 'イオンマリンピア(稲毛海岸)',
      venueDetail: '千葉県千葉市美浜区高洲3-21-1',
      hasTrip: true,
      isOutdoor: true,
      orders: [
        { id: 'order20', name: 'クローザー', isGirl: false },
        { id: 'order21', name: 'ガール', isGirl: true },
        { id: 'order22', name: 'ガール', isGirl: true },
      ],
      availability: generateAvailability(),
    },
    {
      id: 'assign8',
      agency: 'エムデジ',
      venue: 'コピス吉祥寺デッキイベント',
      venueDetail: '東京都武蔵野市吉祥寺本町1-11-5',
      hasTrip: false,
      isOutdoor: true,
      orders: [
        { id: 'order23', name: 'クローザー', isGirl: false },
        { id: 'order24', name: 'クローザー', isGirl: false },
        { id: 'order25', name: 'ガール', isGirl: true },
      ],
      availability: generateAvailability(),
    },
    {
      id: 'assign9',
      agency: 'ケインズ',
      venue: 'ドン・キホーテ浦和原山',
      venueDetail: '埼玉県さいたま市緑区原山4-3-3',
      hasTrip: false,
      isOutdoor: false,
      orders: [
        { id: 'order26', name: 'クローザー', isGirl: false },
        { id: 'order27', name: 'ガール', isGirl: true },
      ],
      availability: generateAvailability(),
    },
    {
      id: 'assign10',
      agency: 'RD',
      venue: 'ドン・キホーテ武蔵浦和',
      venueDetail: '埼玉県さいたま市南区沼影1-12-1',
      hasTrip: true,
      isOutdoor: false,
      orders: [
        { id: 'order28', name: 'クローザー', isGirl: false },
        { id: 'order29', name: 'クローザー', isGirl: false },
        { id: 'order30', name: 'ガール', isGirl: true },
      ],
      availability: generateAvailability(),
    },
  ];
};

/**
 * 特定の年月に対応した利用可能性データを生成する
 * 平日のみか週末のみで枠が利用可能になるように設定
 * @param year 年
 * @param month 月
 * @param isWeekdayAvailable 平日に利用可能かどうか
 * @returns 日付ごとの利用可能状態
 */
export const generateAvailabilityByMonth = (
  year: number,
  month: number,
  isWeekdayAvailable: boolean
): Availability => {
  // 指定した月の日数を取得
  const lastDay = new Date(year, month, 0).getDate();
  const availability: Availability = {};
  
  // 月の各日について処理
  for (let day = 1; day <= lastDay; day++) {
    const date = new Date(year, month - 1, day);
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayOfWeek = date.getDay(); // 0=日曜日, 6=土曜日
    
    // 平日: 月～金（1-5）、週末: 土日（0,6）
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    
    // 平日モードなら平日のみ利用可能、週末モードなら週末のみ利用可能
    availability[dateStr] = isWeekdayAvailable ? !isWeekend : isWeekend;
  }
  
  return availability;
};

/**
 * 2025年4月と5月に特化したアサインメントデータを生成
 * 各現場で平日のみか週末のみで枠が利用可能
 */
export const generate2025AprilMayAssignments = (): AssignmentItem[] => {
  // ベースとなるアサインメントデータを取得
  const baseAssignments = generateDummyAssignments();
  
  // 2025年4月の利用可能性データ（奇数ID=平日利用可、偶数ID=週末利用可）
  const april2025Availability = (id: string): Availability => {
    // IDの末尾の数字を取得して奇数か偶数かを判定
    const lastChar = id.charAt(id.length - 1);
    const lastDigit = parseInt(lastChar);
    const isWeekdayAvailable = isNaN(lastDigit) || lastDigit % 2 === 1;
    
    return generateAvailabilityByMonth(2025, 4, isWeekdayAvailable);
  };
  
  // 2025年5月の利用可能性データ（4月と逆にする）
  const may2025Availability = (id: string): Availability => {
    // IDの末尾の数字を取得して奇数か偶数かを判定
    const lastChar = id.charAt(id.length - 1);
    const lastDigit = parseInt(lastChar);
    const isWeekdayAvailable = isNaN(lastDigit) || lastDigit % 2 === 0; // 4月と逆
    
    return generateAvailabilityByMonth(2025, 5, isWeekdayAvailable);
  };
  
  // 新しい利用可能性データを設定
  return baseAssignments.map(assignment => {
    // 4月と5月の利用可能性データを結合
    const combinedAvailability = {
      ...april2025Availability(assignment.id),
      ...may2025Availability(assignment.id)
    };
    
    return {
      ...assignment,
      availability: combinedAvailability
    };
  });
}; 