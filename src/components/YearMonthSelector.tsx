'use client';

import { Box, FormControl, InputLabel, Select, MenuItem, SelectChangeEvent, Typography } from '@mui/material';
import { useMemo } from 'react';

interface YearMonthSelectorProps {
  year: string;
  month: string;
  onYearChange: (year: string) => void;
  onMonthChange: (month: string) => void;
  years?: string[];
  months?: string[];
}

const YearMonthSelector = ({
  year,
  month,
  onYearChange,
  onMonthChange,
  years,
  months = Array.from({ length: 12 }, (_, i) => String(i + 1))
}: YearMonthSelectorProps) => {

  // システムアクセス時点の年から過去2年と未来1年のリストを生成
  const defaultYears = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const yearRange = [];
    
    for (let y = currentYear - 2; y <= currentYear + 1; y++) {
      yearRange.push(String(y));
    }
    
    return yearRange;
  }, []);

  // yearsが指定されていない場合はデフォルトの年リストを使用
  const yearOptions = years || defaultYears;

  const handleYearChange = (event: SelectChangeEvent) => {
    onYearChange(event.target.value);
  };

  const handleMonthChange = (event: SelectChangeEvent) => {
    onMonthChange(event.target.value);
  };

  return (
    <Box sx={{ display: 'flex', gap: 2 }}>
      <Box>
        <Select
          value={year}
          onChange={handleYearChange}
          size="small"
          sx={{ width: 150 }}
          displayEmpty
        >
          {yearOptions.map((yearValue) => (
            <MenuItem key={yearValue} value={yearValue}>{yearValue}年</MenuItem>
          ))}
        </Select>
      </Box>
      <Box>
        <Select
          value={month}
          onChange={handleMonthChange}
          size="small"
          sx={{ width: 120 }}
          displayEmpty
        >
          {months.map((monthValue) => (
            <MenuItem key={monthValue} value={monthValue}>{monthValue}月</MenuItem>
          ))}
        </Select>
      </Box>
    </Box>
  );
};

export default YearMonthSelector; 