'use client';

import React, { createContext, useState, useContext, useCallback } from 'react';
import { Shift } from '../types';
import { StaffMember } from '@/types/staff';

// 変更履歴の型定義を追加
interface StatusHistoryEntry {
  timestamp: number; // UNIXタイムスタンプ
  oldStatus: '○' | '×' | '△' | '-';
  newStatus: '○' | '×' | '△' | '-';
  username: string; // ユーザー名（実際の環境では認証から取得）
}

interface ShiftContextType {
  // 状態
  shifts: Shift[];
  customStatuses: {[key: string]: '○' | '×' | '△'};
  customRates: {[key: string]: number};
  changedStatuses: {[key: string]: boolean};
  lockedLocations: {[key: string]: boolean};
  // 変更履歴の追加
  statusHistory: {[key: string]: StatusHistoryEntry[]};
  
  // 関数
  getShift: (date: Date, staffId: string) => Shift | undefined;
  getStatus: (staffId: string, date: Date) => '○' | '×' | '△';
  getRate: (staffId: string, date: Date, isWeekend: boolean) => number;
  isStatusChanged: (staffId: string, date: Date) => boolean;
  isLocationLocked: (staffId: string, date: Date) => boolean;
  updateStatus: (staffId: string, date: Date, status: '○' | '×' | '△') => void;
  updateRate: (staffId: string, date: Date, rate: number) => void;
  toggleLocationLock: (staffId: string, date: Date) => void;
  // 変更履歴取得関数の追加
  getStatusHistory: (staffId: string, date: Date) => StatusHistoryEntry[];
}

const ShiftContext = createContext<ShiftContextType | undefined>(undefined);

export const useShiftContext = () => {
  const context = useContext(ShiftContext);
  if (!context) {
    throw new Error('useShiftContext must be used within a ShiftProvider');
  }
  return context;
};

interface ShiftProviderProps {
  children: React.ReactNode;
  shifts: Shift[];
  staffMembers: StaffMember[];
  onRateChange?: (staffId: string, date: string, rate: number) => void;
  onStatusChange?: (staffId: string, date: string, status: '○' | '×' | '△') => void;
}

export const ShiftProvider: React.FC<ShiftProviderProps> = ({ 
  children, 
  shifts,
  staffMembers,
  onRateChange,
  onStatusChange
}) => {
  // 状態管理
  const [customStatuses, setCustomStatuses] = useState<{[key: string]: '○' | '×' | '△'}>({});
  const [customRates, setCustomRates] = useState<{[key: string]: number}>({});
  const [changedStatuses, setChangedStatuses] = useState<{[key: string]: boolean}>({});
  const [lockedLocations, setLockedLocations] = useState<{[key: string]: boolean}>({});
  // 変更履歴の状態を追加
  const [statusHistory, setStatusHistory] = useState<{[key: string]: StatusHistoryEntry[]}>({});

  // 日付をローカル日付文字列に変換するヘルパー関数
  const getLocalDateString = useCallback((date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, []);

  // シフト取得ヘルパー関数
  const getShift = useCallback((date: Date, staffId: string) => {
    const dateStr = getLocalDateString(date);
    return shifts.find(s => 
      s.date === dateStr && 
      s.staffId === staffId
    );
  }, [shifts, getLocalDateString]);

  // 希望の値を取得する - カスタム値を優先
  const getStatus = useCallback((staffId: string, date: Date): '○' | '×' | '△' => {
    const dateStr = getLocalDateString(date);
    const key = `${staffId}-${dateStr}`;
    
    // カスタム希望があればそれを返す
    if (customStatuses[key]) {
      return customStatuses[key];
    }
    
    // 元のシフトから取得
    const shift = getShift(date, staffId);
    return shift?.status || '△';
  }, [customStatuses, getShift, getLocalDateString]);

  // 対象日の単価を取得（カスタム単価があればそれを優先）
  const getRate = useCallback((staffId: string, date: Date, isWeekend: boolean): number => {
    const staff = staffMembers.find(s => s.id === staffId);
    if (!staff) return 0;
    
    const dateStr = getLocalDateString(date);
    
    // カスタム単価が設定されていればそれを返す
    const customRateKey = `${staffId}-${dateStr}`;
    if (customRates[customRateKey]) {
      return customRates[customRateKey];
    }
    
    // デフォルト単価を返す（曜日で判定）
    return isWeekend ? staff.holidayRate : staff.weekdayRate;
  }, [staffMembers, customRates, getLocalDateString]);

  // セルが変更されたかどうかを判定
  const isStatusChanged = useCallback((staffId: string, date: Date): boolean => {
    const dateStr = getLocalDateString(date);
    const key = `${staffId}-${dateStr}`;
    return !!changedStatuses[key];
  }, [changedStatuses, getLocalDateString]);

  // 稼働場所が鍵かかっているかどうかを判定
  const isLocationLocked = useCallback((staffId: string, date: Date): boolean => {
    const dateStr = getLocalDateString(date);
    const key = `${staffId}-${dateStr}`;
    return !!lockedLocations[key];
  }, [lockedLocations, getLocalDateString]);

  // 変更履歴取得関数
  const getStatusHistory = useCallback((staffId: string, date: Date): StatusHistoryEntry[] => {
    const dateStr = getLocalDateString(date);
    const key = `${staffId}-${dateStr}`;
    return statusHistory[key] || [];
  }, [statusHistory, getLocalDateString]);

  // 希望更新
  const updateStatus = useCallback((staffId: string, date: Date, status: '○' | '×' | '△'): void => {
    const dateStr = getLocalDateString(date);
    const key = `${staffId}-${dateStr}`;
    
    // 元の値を取得
    const originalShift = shifts.find(s => s.date === dateStr && s.staffId === staffId);
    const originalStatus = originalShift?.status || '△';
    const currentStatus = getStatus(staffId, date);
    
    // 変更がない場合は何もしない
    if (currentStatus === status) return;
    
    // 外部コールバックがある場合は、そちらを優先（一時データ管理）
    if (onStatusChange) {
      onStatusChange(staffId, dateStr, status);
      return;
    }
    
    // 外部コールバックがない場合のみ、内部状態を更新
    // カスタム希望を保存
    setCustomStatuses(prev => ({
      ...prev,
      [key]: status
    }));
    
    // 元の値と同じ場合は変更なしとして記録から削除
    if (status === originalStatus) {
      setChangedStatuses(prev => {
        const newStatuses = {...prev};
        delete newStatuses[key]; // キーを削除
        return newStatuses;
      });
    } else {
      // 元の値と異なる場合は変更として記録
      setChangedStatuses(prev => ({
        ...prev,
        [key]: true
      }));
    }
    
    // 変更履歴を記録（現在のユーザー名はサンプルとして「システム」を使用）
    const historyEntry: StatusHistoryEntry = {
      timestamp: Date.now(),
      oldStatus: currentStatus,
      newStatus: status,
      username: 'システム' // 実際の環境では認証からユーザー名を取得
    };
    
    setStatusHistory(prev => {
      const keyHistory = prev[key] || [];
      return {
        ...prev,
        [key]: [...keyHistory, historyEntry]
      };
    });
  }, [shifts, onStatusChange, getStatus, getLocalDateString]);

  // 単価更新
  const updateRate = useCallback((staffId: string, date: Date, rate: number): void => {
    if (rate <= 0) return;
    
    const dateStr = getLocalDateString(date);
    const key = `${staffId}-${dateStr}`;
    
    // 内部状態を更新
    setCustomRates(prev => ({
      ...prev,
      [key]: rate
    }));
    
    // 親コンポーネントにコールバックを通知
    if (onRateChange) {
      onRateChange(staffId, dateStr, rate);
    }
  }, [onRateChange, getLocalDateString]);

  // 鍵をトグル
  const toggleLocationLock = useCallback((staffId: string, date: Date): void => {
    const dateStr = getLocalDateString(date);
    const key = `${staffId}-${dateStr}`;
    
    setLockedLocations(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  }, [getLocalDateString]);

  const value = {
    shifts,
    customStatuses,
    customRates,
    changedStatuses,
    lockedLocations,
    statusHistory,
    getShift,
    getStatus,
    getRate,
    isStatusChanged,
    isLocationLocked,
    updateStatus,
    updateRate,
    toggleLocationLock,
    getStatusHistory
  };

  return (
    <ShiftContext.Provider value={value}>
      {children}
    </ShiftContext.Provider>
  );
}; 