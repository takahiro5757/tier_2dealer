/**
 * 指定された年月の週情報を取得します
 * @param year 年（文字列）
 * @param month 月（文字列）
 * @returns 週情報の配列
 */
export const getWeeks = (year: string, month: string): string[] => {
  const numYear = parseInt(year);
  const numMonth = parseInt(month);
  
  // 月の最初の日を取得
  const firstDay = new Date(numYear, numMonth - 1, 1);
  // 月の最後の日を取得
  const lastDay = new Date(numYear, numMonth, 0);
  
  // 週情報の配列を初期化
  const weeks: string[] = [];
  
  // 現在の日付
  let currentDate = new Date(firstDay);
  
  // 月の最初の週の開始日を設定
  const firstWeekStart = new Date(currentDate);
  // 日曜日(0)になるまで日付を減らす
  while (firstWeekStart.getDay() !== 0) {
    firstWeekStart.setDate(firstWeekStart.getDate() - 1);
  }
  
  // 週ごとに処理
  for (let weekIndex = 0; weekIndex < 6; weekIndex++) {
    // 週の開始日
    const weekStart = new Date(firstWeekStart);
    weekStart.setDate(firstWeekStart.getDate() + (weekIndex * 7));
    
    // 週の終了日
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    
    // この週が指定された月に含まれるかチェック
    if (
      (weekStart.getMonth() + 1 === numMonth || weekEnd.getMonth() + 1 === numMonth) ||
      (weekStart.getDate() <= lastDay.getDate() && weekStart.getMonth() === numMonth - 1)
    ) {
      // 表示用の日付文字列を作成
      const weekStartStr = formatDate(weekStart);
      const weekEndStr = formatDate(weekEnd);
      weeks.push(`${weekStartStr}～${weekEndStr}`);
    }
    
    // 月の最終日を超えたら終了
    if (weekEnd > lastDay && weekEnd.getMonth() !== numMonth - 1) {
      break;
    }
  }
  
  return weeks;
};

/**
 * 日付を'MM/DD'形式にフォーマットします
 * @param date 日付オブジェクト
 * @returns フォーマットされた日付文字列
 */
const formatDate = (date: Date): string => {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${month}/${day}`;
};

/**
 * ダミーのサマリーデータを生成します
 * @returns サマリーデータ
 */
export const generateDummySummary = () => {
  return {
    closerCapacity: [30, 30, 30, 30, 30, 30],
    girlCapacity: [20, 20, 20, 20, 20, 20],
    freeCapacity: [10, 10, 10, 10, 10, 10],
    totalCapacity: [50, 50, 50, 50, 50, 50]
  };
};

/**
 * 指定した年月の火曜日を基準とした週情報を計算します
 * 0W: 月初から最初の火曜日の前日まで
 * 1W: 最初の火曜日から始まる週
 * 5W: 5回目の火曜日から月末まで（5回目の火曜日が存在する場合）
 * 
 * @param year 年（文字列または数値）
 * @param month 月（文字列または数値）
 * @returns 利用可能な週番号の配列（0～5）
 */
export const getAvailableWeeks = (year: string | number, month: string | number): number[] => {
  const numYear = typeof year === 'string' ? parseInt(year) : year;
  const numMonth = typeof month === 'string' ? parseInt(month) : month;
  
  // 月の最初の日と最後の日
  const firstDay = new Date(numYear, numMonth - 1, 1);
  const lastDay = new Date(numYear, numMonth, 0);
  
  // 利用可能な週番号
  const availableWeeks: number[] = [];
  
  // 月の最初の火曜日を見つける
  const firstTuesday = new Date(firstDay);
  while (firstTuesday.getDay() !== 2) { // 2は火曜日
    firstTuesday.setDate(firstTuesday.getDate() + 1);
  }
  
  // 0Wの判定: 月初日が火曜日でなければ0Wが存在する
  if (firstDay.getDay() !== 2) {
    availableWeeks.push(0);
  }
  
  // 1W～4Wは常に存在
  availableWeeks.push(1, 2, 3, 4);
  
  // 5Wの判定: 5回目の火曜日が存在するかチェック
  const fifthTuesday = new Date(firstTuesday);
  fifthTuesday.setDate(firstTuesday.getDate() + 28); // 4週間（28日）後
  
  // 5回目の火曜日が同じ月内にあれば5Wが存在
  if (fifthTuesday.getMonth() === numMonth - 1) {
    availableWeeks.push(5);
  }
  
  return availableWeeks;
}; 