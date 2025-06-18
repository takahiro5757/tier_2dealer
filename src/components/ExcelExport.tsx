'use client';

import React, { useState } from 'react';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Box,
  Typography,
  SelectChangeEvent,
  CircularProgress
} from '@mui/material';
import { FileDownload } from '@mui/icons-material';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { Shift, StaffRequest } from '@/components/shifts/SpreadsheetGrid/types';
import { StaffMember } from '@/types/staff';

interface ExcelExportProps {
  staffMembers: StaffMember[];
  shifts: Shift[];
  currentYear: number;
  currentMonth: number;
  onGetShiftsForMonth: (year: number, month: number) => Shift[];
  onGetStaffRequestsForMonth?: (year: number, month: number) => StaffRequest[];
}

interface MonthOption {
  year: number;
  month: number;
  label: string;
}

const ExcelExport: React.FC<ExcelExportProps> = ({
  staffMembers,
  shifts,
  currentYear,
  currentMonth,
  onGetShiftsForMonth,
  onGetStaffRequestsForMonth
}) => {
  const [open, setOpen] = useState(false);
  const [selectedMonths, setSelectedMonths] = useState<string[]>([]);
  const [isExporting, setIsExporting] = useState(false);

  // 利用可能な月のオプションを生成（現在月から前後6ヶ月）
  const generateMonthOptions = (): MonthOption[] => {
    const options: MonthOption[] = [];
    const currentDate = new Date(currentYear, currentMonth - 1);
    
    // 前後6ヶ月の範囲で月オプションを生成
    for (let i = -6; i <= 6; i++) {
      const date = new Date(currentDate);
      date.setMonth(date.getMonth() + i);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      
      options.push({
        year,
        month,
        label: `${year}年${month}月`
      });
    }
    
    return options;
  };

  const monthOptions = generateMonthOptions();

  const handleOpen = () => {
    setOpen(true);
    // デフォルトで現在の月を選択
    setSelectedMonths([`${currentYear}-${currentMonth}`]);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedMonths([]);
  };

  const handleMonthChange = (event: SelectChangeEvent<typeof selectedMonths>) => {
    const value = event.target.value;
    setSelectedMonths(typeof value === 'string' ? value.split(',') : value);
  };

  const getDaysInMonth = (year: number, month: number): number => {
    return new Date(year, month, 0).getDate();
  };

  const formatDate = (year: number, month: number, day: number): string => {
    return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
  };

  const exportToExcel = async () => {
    if (selectedMonths.length === 0) return;

    setIsExporting(true);

    try {
      const workbook = XLSX.utils.book_new();

      for (const monthKey of selectedMonths) {
        const [yearStr, monthStr] = monthKey.split('-');
        const year = parseInt(yearStr);
        const month = parseInt(monthStr);
        const monthShifts = onGetShiftsForMonth(year, month);
        const monthRequests = onGetStaffRequestsForMonth ? onGetStaffRequestsForMonth(year, month) : [];
        
        // シートデータを作成
        const sheetData = createSheetData(year, month, staffMembers, monthShifts, monthRequests);
        
        // ワークシートを作成
        const worksheet = XLSX.utils.aoa_to_sheet(sheetData);
        
        // 列幅を設定
        const colWidths = [
          { wch: 12 }, // 左端の固定列（日付、曜日など）
        ];
        
        // スタッフ分の列幅を追加（各スタッフ3列：シフト状況、稼働場所、単価）
        for (let i = 0; i < staffMembers.length; i++) {
          colWidths.push({ wch: 8 });  // シフト状況
          colWidths.push({ wch: 20 }); // 稼働場所
          colWidths.push({ wch: 10 }); // 単価
        }
        
        worksheet['!cols'] = colWidths;
        
        // セル結合の設定
        const merges: any[] = [];
        
        // スタッフ種別行（ヘッダー行1）のセル結合
        for (let i = 0; i < staffMembers.length; i++) {
          const startCol = 1 + i * 3; // 1から始まる（A列は0）
          const endCol = startCol + 2; // 3列分
          merges.push({
            s: { r: 0, c: startCol }, // スタッフ種別行
            e: { r: 0, c: endCol }
          });
        }
        
        // 所属会社行のセル結合
        for (let i = 0; i < staffMembers.length; i++) {
          const startCol = 1 + i * 3;
          const endCol = startCol + 2;
          merges.push({
            s: { r: 1, c: startCol }, // 所属会社行
            e: { r: 1, c: endCol }
          });
        }
        
        // 氏名行のセル結合
        for (let i = 0; i < staffMembers.length; i++) {
          const startCol = 1 + i * 3;
          const endCol = startCol + 2;
          merges.push({
            s: { r: 2, c: startCol }, // 氏名行
            e: { r: 2, c: endCol }
          });
        }
        
        // カナ行のセル結合
        for (let i = 0; i < staffMembers.length; i++) {
          const startCol = 1 + i * 3;
          const endCol = startCol + 2;
          merges.push({
            s: { r: 3, c: startCol }, // カナ行
            e: { r: 3, c: endCol }
          });
        }
        
        // 最寄り駅行のセル結合
        for (let i = 0; i < staffMembers.length; i++) {
          const startCol = 1 + i * 3;
          const endCol = startCol + 2;
          merges.push({
            s: { r: 4, c: startCol }, // 最寄り駅行
            e: { r: 4, c: endCol }
          });
        }
        
        // 平日単価行のセル結合
        for (let i = 0; i < staffMembers.length; i++) {
          const startCol = 1 + i * 3;
          const endCol = startCol + 2;
          merges.push({
            s: { r: 5, c: startCol }, // 平日単価行
            e: { r: 5, c: endCol }
          });
        }
        
        // 土日単価行のセル結合
        for (let i = 0; i < staffMembers.length; i++) {
          const startCol = 1 + i * 3;
          const endCol = startCol + 2;
          merges.push({
            s: { r: 6, c: startCol }, // 土日単価行
            e: { r: 6, c: endCol }
          });
        }
        
        // TEL行のセル結合
        for (let i = 0; i < staffMembers.length; i++) {
          const startCol = 1 + i * 3;
          const endCol = startCol + 2;
          merges.push({
            s: { r: 7, c: startCol }, // TEL行
            e: { r: 7, c: endCol }
          });
        }
        
        // ID行のセル結合
        for (let i = 0; i < staffMembers.length; i++) {
          const startCol = 1 + i * 3;
          const endCol = startCol + 2;
          merges.push({
            s: { r: 8, c: startCol }, // ID行
            e: { r: 8, c: endCol }
          });
        }
        
        // シフトヘッダー行（希望、単価、稼働場所）は結合しない
        
        // 要望行のセル結合
        const daysInMonth = getDaysInMonth(year, month);
        const requestRowIndex = 10 + daysInMonth; // 10行のヘッダー + 日数分の行
        for (let i = 0; i < staffMembers.length; i++) {
          const startCol = 1 + i * 3;
          const endCol = startCol + 2;
          merges.push({
            s: { r: requestRowIndex, c: startCol },
            e: { r: requestRowIndex, c: endCol }
          });
        }
        
        // 稼働数行のセル結合
        const workingRowIndex = requestRowIndex + 1;
        for (let i = 0; i < staffMembers.length; i++) {
          const startCol = 1 + i * 3;
          const endCol = startCol + 2;
          merges.push({
            s: { r: workingRowIndex, c: startCol },
            e: { r: workingRowIndex, c: endCol }
          });
        }
        
        // 実績行のセル結合
        const resultRowIndex = workingRowIndex + 1;
        for (let i = 0; i < staffMembers.length; i++) {
          const startCol = 1 + i * 3;
          const endCol = startCol + 2;
          merges.push({
            s: { r: resultRowIndex, c: startCol },
            e: { r: resultRowIndex, c: endCol }
          });
        }
        
        // コメント行のセル結合
        const commentRowIndex = resultRowIndex + 1;
        for (let i = 0; i < staffMembers.length; i++) {
          const startCol = 1 + i * 3;
          const endCol = startCol + 2;
          merges.push({
            s: { r: commentRowIndex, c: startCol },
            e: { r: commentRowIndex, c: endCol }
          });
        }
        
        worksheet['!merges'] = merges;
        
        // シート名を設定
        const sheetName = `${year}年${month}月`;
        XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
      }

      // ファイル名を生成
      let fileName: string;
      if (selectedMonths.length === 1) {
        const [year, month] = selectedMonths[0].split('-');
        fileName = `シフト表_${year}年${month}月.xlsx`;
      } else {
        const sortedMonths = [...selectedMonths].sort();
        const firstMonth = sortedMonths[0].split('-');
        const lastMonth = sortedMonths[sortedMonths.length - 1].split('-');
        fileName = `シフト表_${firstMonth[0]}年${firstMonth[1]}月-${lastMonth[0]}年${lastMonth[1]}月.xlsx`;
      }

      // ファイルを保存
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(data, fileName);

    } catch (error) {
      console.error('Excel export error:', error);
      alert('エクスポート中にエラーが発生しました。');
    } finally {
      setIsExporting(false);
      handleClose();
    }
  };

    const createSheetData = (year: number, month: number, staffMembers: StaffMember[], shifts: Shift[], staffRequests: StaffRequest[] = []): any[][] => {
    const daysInMonth = getDaysInMonth(year, month);
    const data: any[][] = [];

    // SpreadsheetGridと同じ構造で作成（hideCaseColumns=trueの場合）
    
    // ヘッダー行1: スタッフ種別（クローザー、ガールなど）
    const roleRow = ['日付'];
    staffMembers.forEach(staff => {
      roleRow.push(staff.role || 'スタッフ');
      roleRow.push('');
      roleRow.push('');
    });
    data.push(roleRow);

    // 所属会社行
    const companyRow = ['所属会社'];
    staffMembers.forEach(staff => {
      companyRow.push(staff.company || '');
      companyRow.push('');
      companyRow.push('');
    });
    data.push(companyRow);

    // 氏名行
    const nameRow = ['氏名'];
    staffMembers.forEach(staff => {
      nameRow.push(staff.name);
      nameRow.push('');
      nameRow.push('');
    });
    data.push(nameRow);

    // カナ行
    const kanaRow = ['カナ'];
    staffMembers.forEach(staff => {
      kanaRow.push(staff.nameKana);
      kanaRow.push('');
      kanaRow.push('');
    });
    data.push(kanaRow);

    // 最寄り駅行
    const stationRow = ['最寄駅'];
    staffMembers.forEach(staff => {
      stationRow.push(staff.station);
      stationRow.push('');
      stationRow.push('');
    });
    data.push(stationRow);

    // 平日単価行
    const weekdayRateRow = ['平日'];
    staffMembers.forEach(staff => {
      weekdayRateRow.push(`¥${staff.weekdayRate.toLocaleString()}`);
      weekdayRateRow.push('');
      weekdayRateRow.push('');
    });
    data.push(weekdayRateRow);

    // 土日単価行
    const holidayRateRow = ['土日'];
    staffMembers.forEach(staff => {
      holidayRateRow.push(`¥${staff.holidayRate.toLocaleString()}`);
      holidayRateRow.push('');
      holidayRateRow.push('');
    });
    data.push(holidayRateRow);

    // TEL行
    const telRow = ['TEL'];
    staffMembers.forEach(staff => {
      telRow.push(staff.tel);
      telRow.push('');
      telRow.push('');
    });
    data.push(telRow);

    // ID行
    const idRow = ['ID'];
    staffMembers.forEach(staff => {
      idRow.push(staff.id);
      idRow.push('');
      idRow.push('');
    });
    data.push(idRow);

    // シフトヘッダー行
    const shiftHeaderRow = ['日付'];
    staffMembers.forEach(staff => {
      shiftHeaderRow.push('希望');
      shiftHeaderRow.push('単価');
      shiftHeaderRow.push('稼働場所');
    });
    data.push(shiftHeaderRow);

    // 各日のデータ行
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = formatDate(year, month, day);
      const date = new Date(year, month - 1, day);
      const dayOfWeek = ['日', '月', '火', '水', '木', '金', '土'][date.getDay()];
      
      const dayRow = [`${month}/${day}(${dayOfWeek})`];
      
      staffMembers.forEach(staff => {
        const shift = shifts.find(s => s.staffId === staff.id && s.date === dateStr);
        
        // 希望（シフト状況）
        dayRow.push(shift?.status || '-');
        
        // 単価
        if (shift && shift.status === '○') {
          const isWeekend = dayOfWeek === '日' || dayOfWeek === '土';
          const rate = isWeekend ? staff.holidayRate : staff.weekdayRate;
          dayRow.push(`¥${rate.toLocaleString()}`);
        } else {
          dayRow.push('');
        }
        
        // 稼働場所
        dayRow.push(shift?.location || '');
      });
      
      data.push(dayRow);
    }

    // 要望行
    const requestRow = ['要望'];
    staffMembers.forEach(staff => {
      // 要望データを取得
      const request = staffRequests.find(req => req.id === staff.id);
      const totalRequest = request ? request.totalRequest : 0;
      const weekendRequest = request ? request.weekendRequest : 0;
      
      // 「19回（土日7）」の形式で表示
      const requestText = weekendRequest > 0 
        ? `${totalRequest}回（土日${weekendRequest}）`
        : `${totalRequest}回`;
      
      requestRow.push(requestText);
      requestRow.push('');
      requestRow.push('');
    });
    data.push(requestRow);

    // 稼働数行
    const workingRow = ['稼働数'];
    staffMembers.forEach(staff => {
      // 稼働数を計算
      const workingCount = shifts.filter(s => s.staffId === staff.id && s.status === '○').length;
      workingRow.push(workingCount.toString());
      workingRow.push('');
      workingRow.push('');
    });
    data.push(workingRow);

    // 実績行
    const resultRow = ['実績'];
    staffMembers.forEach(staff => {
      // 実績を計算（金額）
      const workingShifts = shifts.filter(s => s.staffId === staff.id && s.status === '○');
      let totalAmount = 0;
      
      workingShifts.forEach(shift => {
        const shiftDate = new Date(shift.date);
        const isWeekend = shiftDate.getDay() % 6 === 0; // 土曜日(6)または日曜日(0)
        
        // カスタム単価があればそれを使用、なければデフォルト単価
        if (shift.rate) {
          totalAmount += shift.rate;
        } else {
          const rate = isWeekend ? staff.holidayRate : staff.weekdayRate;
          totalAmount += rate;
        }
      });
      
      resultRow.push(`¥${totalAmount.toLocaleString()}`);
      resultRow.push('');
      resultRow.push('');
    });
    data.push(resultRow);

    // コメント行（hideCommentRowがfalseの場合のみ）
    const commentRow = ['コメント'];
    staffMembers.forEach(staff => {
      const staffShifts = shifts.filter(s => s.staffId === staff.id);
      const latestComment = staffShifts.find(s => s.comment)?.comment || '';
      commentRow.push(latestComment || '（コメントなし）');
      commentRow.push('');
      commentRow.push('');
    });
    data.push(commentRow);

    return data;
  };

  return (
    <>
      <Button
        variant="contained"
        startIcon={<FileDownload />}
        onClick={handleOpen}
        sx={{ ml: 2 }}
      >
        Excelエクスポート
      </Button>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Excelエクスポート</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <FormControl fullWidth>
              <InputLabel id="month-select-label">エクスポート対象月</InputLabel>
              <Select
                labelId="month-select-label"
                multiple
                value={selectedMonths}
                onChange={handleMonthChange}
                label="エクスポート対象月"
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => {
                      const [year, month] = value.split('-');
                      return (
                        <Chip
                          key={value}
                          label={`${year}年${month}月`}
                          size="small"
                        />
                      );
                    })}
                  </Box>
                )}
              >
                {monthOptions.map((option) => (
                  <MenuItem
                    key={`${option.year}-${option.month}`}
                    value={`${option.year}-${option.month}`}
                  >
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              ※ 複数月を選択した場合、各月が別シートとして出力されます
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={isExporting}>
            キャンセル
          </Button>
          <Button
            onClick={exportToExcel}
            variant="contained"
            disabled={selectedMonths.length === 0 || isExporting}
            startIcon={isExporting ? <CircularProgress size={16} /> : <FileDownload />}
          >
            {isExporting ? 'エクスポート中...' : 'エクスポート'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ExcelExport; 