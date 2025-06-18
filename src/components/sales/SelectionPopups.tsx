'use client';

import React from 'react';
import {
  Dialog,
  Box,
  Button,
  Chip,
} from '@mui/material';

// SalesRecordの型をインポート
interface SalesRecord {
  status: '起票' | '連絡前' | '連絡済' | '連絡不要' | 'お断り';
  detailStatus: '未登録' | '公開済み';
  dayType: '平日' | '週末';
}

// 型定義
interface PopupState {
  recordId: number;
  anchorEl: HTMLElement;
}

interface SelectionPopupsProps {
  assignedUserPopup: PopupState | null;
  statusPopup: PopupState | null;
  agencyPopup: PopupState | null;
  detailStatusPopup: PopupState | null;
  dayTypePopup: PopupState | null;
  eventLocationPopup: PopupState | null;
  managerPopup: PopupState | null;
  onAssignedUserClose: () => void;
  onAssignedUserSelect: (recordId: number, user: string) => void;
  onStatusClose: () => void;
  onStatusSelect: (recordId: number, status: SalesRecord['status']) => void;
  onAgencyClose: () => void;
  onAgencySelect: (recordId: number, agency: string) => void;
  onDetailStatusClose: () => void;
  onDetailStatusSelect: (recordId: number, status: SalesRecord['detailStatus']) => void;
  onDayTypeClose: () => void;
  onDayTypeSelect: (recordId: number, dayType: SalesRecord['dayType']) => void;
  onEventLocationClose: () => void;
  onEventLocationSelect: (recordId: number, location: string) => void;
  onManagerClose: () => void;
  onManagerSelect: (recordId: number, manager: { name: string; phone: string }) => void;
}

// ユーティリティ関数
const getStatusColor = (status: string) => {
  switch (status) {
    case '起票': return 'default';
    case '連絡前': return 'warning';
    case '連絡済': return 'success';
    case '連絡不要': return 'info';
    case 'お断り': return 'error';
    default: return 'default';
  }
};

const getDetailStatusColor = (status: string) => {
  return status === '公開済み' ? 'success' : 'default';
};

const getDetailStatusDisplayText = (status: string) => {
  return status === '公開済み' ? '公開' : '非公開';
};

const SelectionPopups: React.FC<SelectionPopupsProps> = ({
  assignedUserPopup,
  statusPopup,
  agencyPopup,
  detailStatusPopup,
  dayTypePopup,
  eventLocationPopup,
  managerPopup,
  onAssignedUserClose,
  onAssignedUserSelect,
  onStatusClose,
  onStatusSelect,
  onAgencyClose,
  onAgencySelect,
  onDetailStatusClose,
  onDetailStatusSelect,
  onDayTypeClose,
  onDayTypeSelect,
  onEventLocationClose,
  onEventLocationSelect,
  onManagerClose,
  onManagerSelect,
}) => {
  // オプションデータ
  const assignedUserOptions = ['田中', '佐藤', '鈴木', '高橋', '渡辺', '伊藤', '山本', '中村'];
  const statusOptions = ['起票', '連絡前', '連絡済', '連絡不要', 'お断り'];
  const agencyOptions = ['ピーアップ', 'ラネット', 'CS', 'エージェントA', 'マーケティング会社B'];
  const detailStatusOptions = ['未登録', '公開済み'];
  const dayTypeOptions = ['平日', '週末'];
  const eventLocationOptions = ['東京ビッグサイト', '幕張メッセ', 'パシフィコ横浜', 'インテックス大阪', '京都国際会館', 'ポートメッセなごや'];
  const managerOptions = [
    { name: '山田太郎', phone: '090-1234-5678' },
    { name: '佐藤花子', phone: '090-2345-6789' },
    { name: '田中次郎', phone: '090-3456-7890' },
    { name: '鈴木美咲', phone: '090-4567-8901' },
    { name: '高橋健一', phone: '090-5678-9012' }
  ];

  return (
    <>
      {/* 担当者選択ポップアップ */}
      {assignedUserPopup && (
        <Dialog
          open={true}
          onClose={onAssignedUserClose}
          PaperProps={{
            sx: {
              position: 'absolute',
              top: assignedUserPopup.anchorEl.getBoundingClientRect().bottom + window.scrollY,
              left: assignedUserPopup.anchorEl.getBoundingClientRect().left + window.scrollX,
              margin: 0,
              minWidth: '120px',
              maxWidth: '120px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            }
          }}
          BackdropProps={{
            sx: { backgroundColor: 'transparent' }
          }}
        >
          <Box sx={{ p: 1 }}>
            {assignedUserOptions.map((user) => (
              <Button
                key={user}
                fullWidth
                size="small" 
                variant="text"
                sx={{ 
                  justifyContent: 'flex-start',
                  fontSize: '0.8rem',
                  py: 0.5,
                  minHeight: '28px',
                  '&:hover': { backgroundColor: '#e3f2fd' }
                }}
                onClick={() => onAssignedUserSelect(assignedUserPopup.recordId, user)}
              >
                {user}
              </Button>
            ))}
          </Box>
        </Dialog>
      )}
      
      {/* ステータス選択ポップアップ */}
      {statusPopup && (
        <Dialog
          open={true}
          onClose={onStatusClose}
          PaperProps={{
            sx: {
              position: 'absolute',
              top: statusPopup.anchorEl.getBoundingClientRect().bottom + window.scrollY,
              left: statusPopup.anchorEl.getBoundingClientRect().left + window.scrollX,
              margin: 0,
              minWidth: '120px',
              maxWidth: '120px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            }
          }}
          BackdropProps={{
            sx: { backgroundColor: 'transparent' }
          }}
        >
          <Box sx={{ p: 1 }}>
            {statusOptions.map((status) => (
              <Button
                key={status}
                fullWidth
                size="small"
                variant="text"
                sx={{ 
                  justifyContent: 'flex-start',
                  fontSize: '0.8rem',
                  py: 0.5,
                  minHeight: '28px',
                  '&:hover': { backgroundColor: '#e3f2fd' }
                }}
                onClick={() => onStatusSelect(statusPopup.recordId, status as SalesRecord['status'])}
              >
                <Chip 
                  label={status} 
                  color={getStatusColor(status) as any}
                  size="small"
                  sx={{ fontSize: '0.7rem' }}
                />
              </Button>
            ))}
          </Box>
        </Dialog>
      )}
      
      {/* 代理店選択ポップアップ */}
      {agencyPopup && (
        <Dialog
          open={true}
          onClose={onAgencyClose}
          PaperProps={{
            sx: {
              position: 'absolute',
              top: agencyPopup.anchorEl.getBoundingClientRect().bottom + window.scrollY,
              left: agencyPopup.anchorEl.getBoundingClientRect().left + window.scrollX,
              margin: 0,
              minWidth: '140px',
              maxWidth: '140px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            }
          }}
          BackdropProps={{
            sx: { backgroundColor: 'transparent' }
          }}
        >
          <Box sx={{ p: 1 }}>
            {agencyOptions.map((agency) => (
              <Button
                key={agency}
                fullWidth
                size="small"
                variant="text"
                sx={{ 
                  justifyContent: 'flex-start',
                  fontSize: '0.8rem',
                  py: 0.5,
                  minHeight: '28px',
                  '&:hover': { backgroundColor: '#e3f2fd' }
                }}
                onClick={() => onAgencySelect(agencyPopup.recordId, agency)}
              >
                {agency}
              </Button>
            ))}
          </Box>
        </Dialog>
      )}

      {/* 詳細ステータス選択ポップアップ */}
      {detailStatusPopup && (
        <Dialog
          open={true}
          onClose={onDetailStatusClose}
          PaperProps={{
            sx: {
              position: 'absolute',
              top: detailStatusPopup.anchorEl.getBoundingClientRect().bottom + window.scrollY,
              left: detailStatusPopup.anchorEl.getBoundingClientRect().left + window.scrollX,
              margin: 0,
              minWidth: '120px',
              maxWidth: '120px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            }
          }}
          BackdropProps={{
            sx: { backgroundColor: 'transparent' }
          }}
        >
          <Box sx={{ p: 1 }}>
            {detailStatusOptions.map((status) => (
              <Button
                key={status}
                fullWidth
                size="small"
                variant="text"
                sx={{ 
                  justifyContent: 'flex-start',
                  fontSize: '0.8rem',
                  py: 0.5,
                  minHeight: '28px',
                  '&:hover': { backgroundColor: '#e3f2fd' }
                }}
                onClick={() => onDetailStatusSelect(detailStatusPopup.recordId, status as SalesRecord['detailStatus'])}
              >
                <Chip 
                  label={getDetailStatusDisplayText(status)} 
                  color={getDetailStatusColor(status) as any}
                  size="small"
                  sx={{ fontSize: '0.7rem' }}
                />
              </Button>
            ))}
          </Box>
        </Dialog>
      )}

      {/* 曜日選択ポップアップ */}
      {dayTypePopup && (
        <Dialog
          open={true}
          onClose={onDayTypeClose}
          PaperProps={{
            sx: {
              position: 'absolute',
              top: dayTypePopup.anchorEl.getBoundingClientRect().bottom + window.scrollY,
              left: dayTypePopup.anchorEl.getBoundingClientRect().left + window.scrollX,
              margin: 0,
              minWidth: '100px',
              maxWidth: '100px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            }
          }}
          BackdropProps={{
            sx: { backgroundColor: 'transparent' }
          }}
        >
          <Box sx={{ p: 1 }}>
            {dayTypeOptions.map((dayType) => (
              <Button
                key={dayType}
                fullWidth
                size="small"
                variant="text"
                sx={{ 
                  justifyContent: 'flex-start',
                  fontSize: '0.8rem',
                  py: 0.5,
                  minHeight: '28px',
                  '&:hover': { backgroundColor: '#e3f2fd' }
                }}
                onClick={() => onDayTypeSelect(dayTypePopup.recordId, dayType as SalesRecord['dayType'])}
              >
                {dayType}
              </Button>
            ))}
          </Box>
        </Dialog>
      )}
      
      {/* イベント実施場所選択ポップアップ */}
      {eventLocationPopup && (
        <Dialog
          open={true}
          onClose={onEventLocationClose}
          PaperProps={{
            sx: {
              position: 'absolute',
              top: eventLocationPopup.anchorEl.getBoundingClientRect().bottom + window.scrollY,
              left: eventLocationPopup.anchorEl.getBoundingClientRect().left + window.scrollX,
              margin: 0,
              minWidth: '200px',
              maxWidth: '200px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            }
          }}
          BackdropProps={{
            sx: { backgroundColor: 'transparent' }
          }}
        >
          <Box sx={{ p: 1 }}>
            {eventLocationOptions.map((location) => (
              <Button
                key={location}
                fullWidth
                size="small"
                variant="text"
                sx={{ 
                  justifyContent: 'flex-start',
                  fontSize: '0.8rem',
                  py: 0.5,
                  minHeight: '28px',
                  '&:hover': { backgroundColor: '#e3f2fd' }
                }}
                onClick={() => onEventLocationSelect(eventLocationPopup.recordId, location)}
              >
                {location}
              </Button>
            ))}
          </Box>
        </Dialog>
      )}

      {/* 担当MG選択ポップアップ */}
      {managerPopup && (
        <Dialog
          open={true}
          onClose={onManagerClose}
          PaperProps={{
            sx: {
              position: 'absolute',
              top: managerPopup.anchorEl.getBoundingClientRect().bottom + window.scrollY,
              left: managerPopup.anchorEl.getBoundingClientRect().left + window.scrollX,
              margin: 0,
              minWidth: '220px',
              maxWidth: '220px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            }
          }}
          BackdropProps={{
            sx: { backgroundColor: 'transparent' }
          }}
        >
          <Box sx={{ p: 1 }}>
            {managerOptions.map((manager) => (
              <Button
                key={manager.name}
                fullWidth
                size="small"
                variant="text"
                sx={{ 
                  justifyContent: 'flex-start',
                  fontSize: '0.8rem',
                  py: 0.5,
                  minHeight: '28px',
                  '&:hover': { backgroundColor: '#e3f2fd' }
                }}
                onClick={() => onManagerSelect(managerPopup.recordId, manager)}
              >
                {manager.name} ({manager.phone})
              </Button>
            ))}
          </Box>
        </Dialog>
      )}
    </>
  );
};

export default SelectionPopups; 