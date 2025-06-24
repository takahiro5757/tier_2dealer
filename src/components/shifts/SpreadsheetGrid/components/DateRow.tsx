'use client';

import React, { memo } from 'react';
import { TableRow } from '@mui/material';
import { DateInfo } from '../types';
import StatusCell from './StatusCell';
import RateCell from './RateCell';
import LocationCell from './LocationCell';
import { styled } from '@mui/material';
import { TableCell } from '@mui/material';
import { useShiftContext } from '../context/ShiftContext';

// 列の幅と位置を定義 - SpreadsheetGridと統一
const WIDTH = {
  date: 70,
  closerCase: 80,
  girlCase: 80,
  closerAvailable: 80,
  girlAvailable: 80,
  close: 80,
  girl: 80,
  // 折りたたみ時の幅を追加
  closerSection: 320 // クローザーセクション全体の幅（折りたたみ時）
};

// 列の左位置を計算 - SpreadsheetGridと統一
const LEFT = {
  date: 0,
  closerCase: WIDTH.date,
  girlCase: WIDTH.date + WIDTH.closerCase,
  closerAvailable: WIDTH.date + WIDTH.closerCase + WIDTH.girlCase,
  girlAvailable: WIDTH.date + WIDTH.closerCase + WIDTH.girlCase + WIDTH.closerAvailable,
  close: WIDTH.date + WIDTH.closerCase + WIDTH.girlCase + WIDTH.closerAvailable + WIDTH.girlAvailable,
  girl: WIDTH.date + WIDTH.closerCase + WIDTH.girlCase + WIDTH.closerAvailable + WIDTH.girlAvailable + WIDTH.close,
  // 折りたたみ時の位置
  closerSection: WIDTH.date,
  closeCollapsed: WIDTH.date + WIDTH.closerSection,
  girlCollapsed: WIDTH.date + WIDTH.closerSection + WIDTH.close
};

const DateCellFix = styled(TableCell)(({ theme }) => ({
  padding: theme.spacing(0.5),
  textAlign: 'center',
  fontSize: 14,
  fontWeight: 600,
  whiteSpace: 'nowrap',
  height: 36,
  lineHeight: 1,
  borderRight: '2px solid #000000',
  position: 'sticky',
  left: LEFT.date,
  zIndex: 400,
  background: '#f5f5f5',
  boxShadow: 'inset 0 -1px 0 #000000',
  width: WIDTH.date,
  minWidth: WIDTH.date,
  maxWidth: WIDTH.date,
  // モバイル対応
  [theme.breakpoints.down('md')]: {
    fontSize: 12,
    padding: theme.spacing(0.25),
    height: 32,
    width: WIDTH.date,
    minWidth: WIDTH.date,
    maxWidth: WIDTH.date
  }
}));

const CloserCaseCellFix = styled(TableCell)(({ theme }) => ({
  padding: theme.spacing(0.5),
  textAlign: 'center',
  fontSize: 14,
  fontWeight: 600,
  whiteSpace: 'nowrap',
  height: 36,
  lineHeight: 1,
  borderRight: '2px solid #000000',
  position: 'sticky',
  left: LEFT.closerCase,
  zIndex: 400,
  background: '#e3f2fd',
  boxShadow: 'inset 0 -1px 0 #000000',
  width: WIDTH.closerCase,
  minWidth: WIDTH.closerCase,
  maxWidth: WIDTH.closerCase,
  // モバイル対応
  [theme.breakpoints.down('md')]: {
    fontSize: 12,
    padding: theme.spacing(0.25),
    height: 32,
    width: WIDTH.closerCase,
    minWidth: WIDTH.closerCase,
    maxWidth: WIDTH.closerCase
  }
}));

const GirlCaseCellFix = styled(TableCell)(({ theme }) => ({
  padding: theme.spacing(0.5),
  textAlign: 'center',
  fontSize: 14,
  fontWeight: 600,
  whiteSpace: 'nowrap',
  height: 36,
  lineHeight: 1,
  borderRight: '2px solid #000000',
  position: 'sticky',
  left: LEFT.girlCase,
  zIndex: 400,
  background: '#e3f2fd',
  boxShadow: 'inset 0 -1px 0 #000000',
  width: WIDTH.girlCase,
  minWidth: WIDTH.girlCase,
  maxWidth: WIDTH.girlCase,
  // モバイル対応
  [theme.breakpoints.down('md')]: {
    fontSize: 12,
    padding: theme.spacing(0.25),
    height: 32,
    width: WIDTH.girlCase,
    minWidth: WIDTH.girlCase,
    maxWidth: WIDTH.girlCase,
    position: 'sticky'
  }
}));

// 稼働可能数用の固定セル（クローザー）
const CloserAvailableCellFix = styled(TableCell)(({ theme }) => ({
  padding: theme.spacing(0.5),
  textAlign: 'center',
  fontSize: 14,
  fontWeight: 600,
  whiteSpace: 'nowrap',
  height: 36,
  lineHeight: 1,
  borderRight: '2px solid #000000',
  position: 'sticky',
  left: LEFT.closerAvailable,
  zIndex: 400,
  background: '#e8f5e9',
  boxShadow: 'inset 0 -1px 0 #000000',
  width: WIDTH.closerAvailable,
  minWidth: WIDTH.closerAvailable,
  maxWidth: WIDTH.closerAvailable,
  // モバイル対応
  [theme.breakpoints.down('md')]: {
    fontSize: 12,
    padding: theme.spacing(0.25),
    height: 32,
    width: WIDTH.closerAvailable,
    minWidth: WIDTH.closerAvailable,
    maxWidth: WIDTH.closerAvailable,
    position: 'sticky'
  }
}));

// 稼働可能数用の固定セル（ガール）
const GirlAvailableCellFix = styled(TableCell)(({ theme }) => ({
  padding: theme.spacing(0.5),
  textAlign: 'center',
  fontSize: 14,
  fontWeight: 600,
  whiteSpace: 'nowrap',
  height: 36,
  lineHeight: 1,
  borderRight: '2px solid #000000',
  position: 'sticky',
  left: LEFT.girlAvailable,
  zIndex: 400,
  background: '#e8f5e9',
  boxShadow: 'inset 0 -1px 0 #000000',
  width: WIDTH.girlAvailable,
  minWidth: WIDTH.girlAvailable,
  maxWidth: WIDTH.girlAvailable,
  // モバイル対応
  [theme.breakpoints.down('md')]: {
    fontSize: 12,
    padding: theme.spacing(0.25),
    height: 32,
    width: WIDTH.girlAvailable,
    minWidth: WIDTH.girlAvailable,
    maxWidth: WIDTH.girlAvailable,
    position: 'sticky'
  }
}));

const CloseCellFix = styled(TableCell)(({ theme }) => ({
  padding: theme.spacing(0.5),
  textAlign: 'center',
  fontSize: 14,
  fontWeight: 600,
  whiteSpace: 'nowrap',
  height: 36,
  lineHeight: 1,
  borderRight: '2px solid #000000',
  position: 'sticky',
  left: LEFT.close,
  zIndex: 400,
  background: '#fffde7',
  boxShadow: 'inset 0 -1px 0 #000000',
  width: WIDTH.close,
  minWidth: WIDTH.close,
  maxWidth: WIDTH.close,
  // モバイル対応
  [theme.breakpoints.down('md')]: {
    fontSize: 12,
    padding: theme.spacing(0.25),
    height: 32,
    width: WIDTH.close,
    minWidth: WIDTH.close,
    maxWidth: WIDTH.close,
    position: 'sticky'
  }
}));

const GirlCellFix = styled(TableCell)(({ theme }) => ({
  padding: theme.spacing(0.5),
  textAlign: 'center',
  fontSize: 14,
  fontWeight: 600,
  whiteSpace: 'nowrap',
  height: 36,
  lineHeight: 1,
  borderRight: '2px solid #000000',
  position: 'sticky',
  left: LEFT.girl,
  zIndex: 400,
  background: '#fffde7', // 元の黄色に戻す（未決C列と同じ色）
  boxShadow: 'inset 0 -1px 0 #000000',
  width: WIDTH.girl,
  minWidth: WIDTH.girl,
  maxWidth: WIDTH.girl,
  // モバイル対応
  [theme.breakpoints.down('md')]: {
    fontSize: 12,
    padding: theme.spacing(0.25),
    height: 32,
    width: WIDTH.girl,
    minWidth: WIDTH.girl,
    maxWidth: WIDTH.girl,
    position: 'sticky'
  }
}));

// クローザーセクション（折りたたみ時）用のスタイル付きセル
const CloserSectionCellFix = styled(TableCell)(({ theme }) => ({
  padding: theme.spacing(0.5),
  textAlign: 'center',
  fontSize: 14,
  fontWeight: 600,
  whiteSpace: 'nowrap',
  height: 36,
  lineHeight: 1,
  borderRight: '2px solid #000000',
  position: 'sticky',
  left: LEFT.closerSection,
  zIndex: 400,
  background: '#e3f2fd',
  boxShadow: 'inset 0 -1px 0 #000000',
  width: WIDTH.closerSection,
  minWidth: WIDTH.closerSection,
  maxWidth: WIDTH.closerSection,
  // モバイル対応
  [theme.breakpoints.down('md')]: {
    fontSize: 12,
    padding: theme.spacing(0.25),
    height: 32,
    width: WIDTH.closerSection,
    minWidth: WIDTH.closerSection,
    maxWidth: WIDTH.closerSection,
    position: 'sticky'
  }
}));

// 未決C（折りたたみ時）用のスタイル付きセル
const CloseCellFixCollapsed = styled(TableCell)(({ theme }) => ({
  padding: theme.spacing(0.5),
  textAlign: 'center',
  fontSize: 14,
  fontWeight: 600,
  whiteSpace: 'nowrap',
  height: 36,
  lineHeight: 1,
  borderRight: '2px solid #000000',
  position: 'sticky',
  left: LEFT.closeCollapsed,
  zIndex: 400,
  background: '#fffde7',
  boxShadow: 'inset 0 -1px 0 #000000',
  width: WIDTH.close,
  minWidth: WIDTH.close,
  maxWidth: WIDTH.close,
  // モバイル対応
  [theme.breakpoints.down('md')]: {
    fontSize: 12,
    padding: theme.spacing(0.25),
    height: 32,
    width: WIDTH.close,
    minWidth: WIDTH.close,
    maxWidth: WIDTH.close,
    position: 'sticky'
  }
}));

// 未決G（折りたたみ時）用のスタイル付きセル
const GirlCellFixCollapsed = styled(TableCell)(({ theme }) => ({
  padding: theme.spacing(0.5),
  textAlign: 'center',
  fontSize: 14,
  fontWeight: 600,
  whiteSpace: 'nowrap',
  height: 36,
  lineHeight: 1,
  borderRight: '2px solid #000000',
  position: 'sticky',
  left: LEFT.girlCollapsed,
  zIndex: 400,
  background: '#fffde7', // 元の黄色に戻す（未決C列と同じ色）
  boxShadow: 'inset 0 -1px 0 #000000',
  width: WIDTH.girl,
  minWidth: WIDTH.girl,
  maxWidth: WIDTH.girl,
  // モバイル対応
  [theme.breakpoints.down('md')]: {
    fontSize: 12,
    padding: theme.spacing(0.25),
    height: 32,
    width: WIDTH.girl,
    minWidth: WIDTH.girl,
    maxWidth: WIDTH.girl,
    position: 'sticky'
  }
}));

interface DateRowProps {
  dateInfo: DateInfo;
  staffMembers: Array<{id: string, role?: string}>;
  dateCloserCases: number;
  dateGirlCases: number;
  dateCloserAvailable: number;
  dateGirlAvailable: number;
  closerUnassignedCount: number;
  girlUnassignedCount: number;
  highlightedCellId: string | null;
  onUnassignedClick: (date: Date, role: string) => void;
  onCommentClick: (staffId: string, date: Date) => void;
  columnOrder: string[];
  isExpanded: boolean;
  hideCaseColumns?: boolean;
  isReadOnly?: boolean;
  onRateChange?: (staffId: string, date: string, rate: number) => void;
  disableDoubleClick?: boolean;
}

const DateRow: React.FC<DateRowProps> = ({ 
  dateInfo, 
  staffMembers,
  dateCloserCases,
  dateGirlCases,
  dateCloserAvailable,
  dateGirlAvailable,
  closerUnassignedCount,
  girlUnassignedCount,
  highlightedCellId,
  onUnassignedClick,
  onCommentClick,
  columnOrder,
  isExpanded,
  hideCaseColumns = false,
  isReadOnly = false,
  onRateChange,
  disableDoubleClick
}) => {
  const { date, dayOfWeek, isWeekend } = dateInfo;
  const { 
    getStatus, 
    getShift 
  } = useShiftContext();
  
  return (
    <TableRow>
      <DateCellFix
        sx={{
          backgroundColor: isWeekend ? '#ffdbac' : undefined,
          color: dayOfWeek === '日' ? '#ff0000' : dayOfWeek === '土' ? '#0000ff' : undefined
        }}
      >
        {date.getDate()}({dayOfWeek})
      </DateCellFix>
      
      {!hideCaseColumns && (isExpanded ? (
        // 通常表示モード
        <>
          {columnOrder.map(columnId => {
            if (columnId === 'closerCase') {
              return (
                <CloserCaseCellFix key={columnId} sx={{ backgroundColor: isWeekend ? '#ffdbac' : undefined }}>
                  {dateCloserCases}
                </CloserCaseCellFix>
              );
            } else if (columnId === 'girlCase') {
              return (
                <GirlCaseCellFix key={columnId} sx={{ backgroundColor: isWeekend ? '#ffdbac' : undefined }}>
                  {dateGirlCases}
                </GirlCaseCellFix>
              );
            } else if (columnId === 'closerAvailable') {
              return (
                <CloserAvailableCellFix key={columnId} sx={{ backgroundColor: isWeekend ? '#ffdbac' : '#e8f5e9' }}>
                  {dateCloserAvailable}
                </CloserAvailableCellFix>
              );
            } else if (columnId === 'girlAvailable') {
              return (
                <GirlAvailableCellFix key={columnId} sx={{ backgroundColor: isWeekend ? '#ffdbac' : '#e8f5e9' }}>
                  {dateGirlAvailable}
                </GirlAvailableCellFix>
              );
            }
            return null;
          })}
          
          <CloseCellFix
            onClick={() => onUnassignedClick(date, 'クローザー')}
            sx={{
              backgroundColor: isWeekend ? '#ffdbac' : undefined,
              cursor: 'pointer',
              '&:hover': { backgroundColor: isWeekend ? '#ffccaa' : '#f0f0f0' }
            }}
          >
            {closerUnassignedCount}
          </CloseCellFix>
          
          <GirlCellFix
            onClick={() => onUnassignedClick(date, 'ガール')}
            sx={{
              backgroundColor: isWeekend ? '#ffdbac' : undefined,
              cursor: 'pointer',
              '&:hover': { backgroundColor: isWeekend ? '#ffccaa' : '#f0f0f0' }
            }}
          >
            {girlUnassignedCount}
          </GirlCellFix>
        </>
      ) : (
        // 折りたたみ表示モード（スタイル付きコンポーネントを使用）
        <>
          <CloserSectionCellFix
            sx={{
              backgroundColor: isWeekend ? '#ffdbac' : '#e3f2fd',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span style={{ fontWeight: 'bold' }}>C:{dateCloserCases} G:{dateGirlCases}</span>
          </CloserSectionCellFix>
          
          <CloseCellFixCollapsed
            onClick={() => onUnassignedClick(date, 'クローザー')}
            sx={{
              backgroundColor: isWeekend ? '#ffdbac' : '#fffde7',
              cursor: 'pointer',
              '&:hover': { backgroundColor: isWeekend ? '#ffccaa' : '#f0f0f0' }
            }}
          >
            {closerUnassignedCount}
          </CloseCellFixCollapsed>
          
          <GirlCellFixCollapsed
            onClick={() => onUnassignedClick(date, 'ガール')}
            sx={{
              backgroundColor: isWeekend ? '#ffdbac' : '#fffde7',
              cursor: 'pointer',
              '&:hover': { backgroundColor: isWeekend ? '#ffccaa' : '#f0f0f0' }
            }}
          >
            {girlUnassignedCount}
          </GirlCellFixCollapsed>
        </>
      ))}
      
      {/* スタッフメンバーの表示部分 - 展開/折りたたみどちらの状態でも表示 */}
      {staffMembers.map(staff => {
        const shift = getShift(date, staff.id); 
        const status = getStatus(staff.id, date);
        const hasConfirmedLocation = status === '○' && shift?.location;
        const isUnassigned = status === '○' && !shift?.location;
        const cellId = isUnassigned ? `loc-${date.getDate()}-${staff.id}` : '';
        const isHighlighted = cellId && cellId === highlightedCellId;
        
        return (
          <React.Fragment key={`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}-${staff.id}`}>
            <StatusCell 
              staffId={staff.id}
              date={date}
              isWeekend={isWeekend}
              disableDoubleClick={disableDoubleClick}
              isReadOnly={isReadOnly}
            />
            
            <RateCell 
              staffId={staff.id}
              date={date}
              hasConfirmedLocation={!!hasConfirmedLocation}
              isReadOnly={isReadOnly || !onRateChange}
            />
            
            <LocationCell 
              staffId={staff.id}
              date={date}
              isWeekend={isWeekend}
              isHighlighted={!!isHighlighted}
              hasConfirmedLocation={!!hasConfirmedLocation}
              isUnassigned={!!isUnassigned}
              location={shift?.location}
              cellId={cellId}
              lockEnabled={typeof (window as any)?.__locationLockEnabled === 'boolean' ? (window as any).__locationLockEnabled : true}
            />
          </React.Fragment>
        );
      })}
    </TableRow>
  );
};

export default memo(DateRow); 