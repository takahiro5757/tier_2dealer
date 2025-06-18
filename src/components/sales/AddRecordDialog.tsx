'use client';

import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  Select,
  MenuItem,
  TextField,
  Checkbox,
  Typography,
  Box,
  Grid,
  Chip,
  IconButton,
  InputLabel,
} from '@mui/material';
import {
  LocationOn as LocationIcon,
  Business as BusinessIcon,
  Flag as FlagIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';

interface NewRecordForm {
  assignedUser: string;
  agency: string;
  detailStatus: '未登録' | '公開済み';
  dayType: '平日' | '週末';
  isBandProject: boolean;
  bandWorkDays: number;
  eventLocation: string;
  managerName: string;
  managerPhone: string;
  hostStore: string;
  partnerStores: string[];
  hasLocationReservation: boolean;
  locationReservationDetails: {
    id: string;
    date: string;
    status: '申請中' | '日程NG' | '通信NG' | '代理店確認中' | '確定';
    arrangementCompany: string;
    wholesalePrice: number;
    purchasePrice: number;
  }[];
  isExternalVenue: boolean;
  hasBusinessTrip: boolean;
  closerCount: number;
  closerUnitPrice: number;
  closerTransportFee: number;
  girlCount: number;
  girlUnitPrice: number;
  girlTransportFee: number;
  fieldContactName: string;
  fieldContactPhone: string;
  meetingTime: string;
  meetingPlace: string;
  workStartTime: string;
  workEndTime: string;
  uniform: string;
  target: string;
  memo: string;
  selectedEventDates: string[];
}

interface AddRecordDialogProps {
  open: boolean;
  form: NewRecordForm;
  onClose: () => void;
  onFormChange: (field: string, value: any) => void;
  onConfirm: () => void;
}

const AddRecordDialog: React.FC<AddRecordDialogProps> = ({
  open,
  form,
  onClose,
  onFormChange,
  onConfirm,
}) => {
  // 火曜スタートの週の日付を生成する関数
  const generateWeekDates = () => {
    const today = new Date();
    const currentDay = today.getDay(); // 0: 日曜, 1: 月曜, ..., 6: 土曜
    
    // 火曜日を基準にする（火曜 = 2）
    const daysSinceTuesday = currentDay >= 2 ? currentDay - 2 : currentDay + 5;
    
    const tuesday = new Date(today);
    tuesday.setDate(today.getDate() - daysSinceTuesday);
    
    const weekDates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(tuesday);
      date.setDate(tuesday.getDate() + i);
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      const dayOfWeek = ['日', '月', '火', '水', '木', '金', '土'][date.getDay()];
      weekDates.push(`${month}/${day}(${dayOfWeek})`);
    }
    return weekDates;
  };

  const weekDates = generateWeekDates();

  // イベント開催日の選択ハンドラー
  const handleDateSelection = (date: string, checked: boolean) => {
    const currentDates = form.selectedEventDates || [];
    if (checked) {
      onFormChange('selectedEventDates', [...currentDates, date]);
    } else {
      onFormChange('selectedEventDates', currentDates.filter(d => d !== date));
    }
  };

  // オプションデータ
  const assignedUserOptions = ['田中', '佐藤', '鈴木', '高橋', '渡辺', '伊藤', '山本', '中村'];
  const agencyOptions = ['ピーアップ', 'ラネット', 'CS', 'エージェントA', 'マーケティング会社B'];
  const eventLocationOptions = ['東京ビッグサイト', '幕張メッセ', 'パシフィコ横浜', 'インテックス大阪', '京都国際会館', 'ポートメッセなごや'];
  const managerOptions = [
    { name: '山田太郎', phone: '090-1234-5678' },
    { name: '佐藤花子', phone: '090-2345-6789' },
    { name: '田中次郎', phone: '090-3456-7890' },
    { name: '鈴木美咲', phone: '090-4567-8901' },
    { name: '高橋健一', phone: '090-5678-9012' }
  ];
  const availableStores = ['新宿店', '渋谷店', '池袋店', '銀座店', '浦和店', '大宮店', '横浜店', '川崎店', '千葉店', '船橋店'];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '8px',
          maxHeight: '90vh',
          overflow: 'hidden',
        }
      }}
    >
      <DialogContent sx={{ 
        p: 3, 
        pt: 3,
        maxHeight: 'calc(90vh - 80px)',
        overflowY: 'auto',
      }}>
        <Grid container spacing={3}>
          {/* 左列：基本情報 */}
          <Grid item xs={12} md={6}>
            <Box sx={{ 
              p: 2, 
              border: '1px solid #e0e0e0',
              borderRadius: '8px', 
            }}>
              <Typography variant="h6" sx={{ 
                mb: 2, 
                fontWeight: 'bold',
                color: '#333'
              }}>
                基本情報
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {/* イベント開催日 */}
                <Box>
                  <Typography variant="subtitle2" sx={{ 
                    mb: 1, 
                    fontWeight: 'bold'
                  }}>
                    イベント開催日
                  </Typography>
                  <Box sx={{ 
                    p: 2, 
                    border: '1px solid #e0e0e0',
                    borderRadius: '4px',
                    backgroundColor: '#f9f9f9',
                  }}>
                    <Grid container spacing={1}>
                      {weekDates.map((date, index) => {
                        const isSelected = (form.selectedEventDates || []).includes(date);
                        const dayIndex = index; // 火曜スタート: 0=火, 1=水, 2=木, 3=金, 4=土, 5=日, 6=月
                        
                        // 曜日別の軽微な色分け
                        const getDateStyle = () => {
                          if (dayIndex === 4) { // 土曜日
                            return {
                              borderColor: isSelected ? '#1976d2' : '#e3f2fd',
                              backgroundColor: isSelected ? '#e3f2fd' : 'white',
                              color: isSelected ? '#1976d2' : '#666'
                            };
                          } else if (dayIndex === 5) { // 日曜日
                            return {
                              borderColor: isSelected ? '#d32f2f' : '#ffebee',
                              backgroundColor: isSelected ? '#ffebee' : 'white',
                              color: isSelected ? '#d32f2f' : '#666'
                            };
                          } else { // 平日
                            return {
                              borderColor: isSelected ? '#2e7d32' : '#f1f8e9',
                              backgroundColor: isSelected ? '#f1f8e9' : 'white',
                              color: isSelected ? '#2e7d32' : '#666'
                            };
                          }
                        };
                        
                        const style = getDateStyle();
                        
                        return (
                          <Grid item xs={6} sm={3} key={date}>
                            <Box 
                              onClick={() => handleDateSelection(date, !isSelected)}
                              sx={{ 
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                p: 1.5,
                                borderRadius: '4px',
                                backgroundColor: style.backgroundColor,
                                border: `1px solid ${style.borderColor}`,
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                minHeight: '48px',
                                position: 'relative',
                                '&:hover': {
                                  backgroundColor: isSelected ? style.backgroundColor : '#f5f5f5',
                                  borderColor: style.borderColor,
                                }
                              }}
                            >
                              {/* 選択済みの場合のチェックマーク */}
                              {isSelected && (
                                <Box sx={{
                                  position: 'absolute',
                                  top: 4,
                                  right: 4,
                                  fontSize: '12px',
                                  color: style.color
                                }}>
                                  ✓
                                </Box>
                              )}
                              
                              {/* 日付表示 */}
                              <Typography variant="body2" sx={{ 
                                color: style.color,
                                fontWeight: isSelected ? 'bold' : 'normal',
                                fontSize: '0.85rem',
                                textAlign: 'center'
                              }}>
                                {date}
                              </Typography>
                            </Box>
                          </Grid>
                        );
                      })}
                    </Grid>
                    
                    {/* 選択状況の表示 */}
                    {(form.selectedEventDates || []).length > 0 && (
                      <Box sx={{ 
                        mt: 2, 
                        pt: 1, 
                        borderTop: '1px solid #e0e0e0',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        flexWrap: 'wrap'
                      }}>
                        <Typography variant="caption" sx={{ 
                          color: '#666',
                          fontSize: '0.75rem'
                        }}>
                          選択中:
                        </Typography>
                        
                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                          {(form.selectedEventDates || []).map((selectedDate) => (
                            <Box 
                              key={selectedDate}
                              sx={{
                                px: 1,
                                py: 0.2,
                                backgroundColor: '#e0e0e0',
                                color: '#666',
                                borderRadius: '12px',
                                fontSize: '0.7rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.5
                              }}
                            >
                              {selectedDate}
                              <Box 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDateSelection(selectedDate, false);
                                }}
                                sx={{
                                  cursor: 'pointer',
                                  fontSize: '10px',
                                  fontWeight: 'bold',
                                  '&:hover': {
                                    color: '#333',
                                  }
                                }}
                              >
                                ×
                              </Box>
                            </Box>
                          ))}
                        </Box>
                      </Box>
                    )}
                  </Box>
                </Box>

                {/* 担当者 */}
                <FormControl fullWidth>
                  <Typography variant="subtitle2" sx={{ 
                    mb: 1, 
                    fontWeight: 'bold'
                  }}>
                    担当者
                  </Typography>
                  <Select
                    value={form.assignedUser}
                    onChange={(e) => onFormChange('assignedUser', e.target.value)}
                    size="small"
                  >
                    {assignedUserOptions.map((user) => (
                      <MenuItem key={user} value={user}>{user}</MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* 代理店選択 */}
                <FormControl fullWidth>
                  <Typography variant="subtitle2" sx={{ 
                    mb: 1, 
                    fontWeight: 'bold'
                  }}>
                    代理店
                  </Typography>
                  <Select
                    value={form.agency}
                    onChange={(e) => onFormChange('agency', e.target.value)}
                    size="small"
                  >
                    {agencyOptions.map((agency) => (
                      <MenuItem key={agency} value={agency}>{agency}</MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* 曜日選択 */}
                <FormControl fullWidth>
                  <Typography variant="subtitle2" sx={{ 
                    mb: 1, 
                    fontWeight: 'bold'
                  }}>
                    平日or週末
                  </Typography>
                  <Select
                    value={form.dayType}
                    onChange={(e) => onFormChange('dayType', e.target.value)}
                    size="small"
                    disabled={form.isBandProject}
                    displayEmpty
                  >
                    <MenuItem value="">
                      {form.isBandProject ? '帯案件のため選択不要' : '選択してください'}
                    </MenuItem>
                    <MenuItem value="平日">平日</MenuItem>
                    <MenuItem value="週末">週末</MenuItem>
                  </Select>
                </FormControl>

                {/* 帯案件チェック */}
                <Box sx={{ 
                  p: 2, 
                  border: '1px solid #e0e0e0',
                  borderRadius: '4px',
                  backgroundColor: '#f9f9f9',
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                    <Checkbox
                      checked={form.isBandProject}
                      onChange={(e) => {
                        onFormChange('isBandProject', e.target.checked);
                        // 帯案件にチェックした時、稼働日数が0の場合は20をデフォルト値として設定
                        if (e.target.checked && form.bandWorkDays === 0) {
                          onFormChange('bandWorkDays', 20);
                        }
                        // 帯案件にチェックした時、平日or週末を未選択状態にする
                        if (e.target.checked) {
                          onFormChange('dayType', '');
                        }
                      }}
                      size="small"
                    />
                    <Typography variant="body2">帯案件</Typography>
                    {form.isBandProject && (
                      <TextField
                        type="number"
                        value={form.bandWorkDays}
                        onChange={(e) => onFormChange('bandWorkDays', parseInt(e.target.value) || 0)}
                        size="small"
                        sx={{ width: '100px', ml: 2 }}
                        inputProps={{ min: 1, max: 31 }}
                        label="稼働日数"
                      />
                    )}
                  </Box>
                </Box>

                {/* イベント情報 */}
                <FormControl fullWidth>
                  <Typography variant="subtitle2" sx={{ 
                    mb: 1, 
                    fontWeight: 'bold'
                  }}>
                    イベント実施場所
                  </Typography>
                  <Select
                    value={form.eventLocation}
                    onChange={(e) => onFormChange('eventLocation', e.target.value)}
                    size="small"
                  >
                    {eventLocationOptions.map((location) => (
                      <MenuItem key={location} value={location}>{location}</MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* 担当MG選択 */}
                <FormControl fullWidth>
                  <Typography variant="subtitle2" sx={{ 
                    mb: 1, 
                    fontWeight: 'bold'
                  }}>
                    担当MG
                  </Typography>
                  <Select
                    value={`${form.managerName}-${form.managerPhone}`}
                    onChange={(e) => {
                      const selectedManager = managerOptions.find(
                        manager => `${manager.name}-${manager.phone}` === e.target.value
                      );
                      if (selectedManager) {
                        onFormChange('managerName', selectedManager.name);
                        onFormChange('managerPhone', selectedManager.phone);
                      }
                    }}
                    size="small"
                  >
                    {managerOptions.map((manager) => (
                      <MenuItem key={`${manager.name}-${manager.phone}`} value={`${manager.name}-${manager.phone}`}>
                        {manager.name} ({manager.phone})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* 開催店舗 */}
                <Box>
                  <Typography variant="subtitle2" sx={{ 
                    mb: 1, 
                    fontWeight: 'bold'
                  }}>
                    開催店舗
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, alignItems: 'center' }}>
                    {form.hostStore && (
                      <Chip
                        label={form.hostStore}
                        size="small"
                        sx={{
                          backgroundColor: '#2196f3',
                          color: 'white',
                          fontWeight: 'medium',
                          '& .MuiChip-deleteIcon': {
                            color: 'white',
                            '&:hover': {
                              color: '#ffcdd2',
                            },
                          },
                        }}
                        onDelete={() => onFormChange('hostStore', '')}
                      />
                    )}
                    <FormControl size="small" sx={{ minWidth: 120 }}>
                      <Select
                        value=""
                        onChange={(e) => {
                          if (e.target.value) {
                            onFormChange('hostStore', e.target.value);
                          }
                        }}
                        displayEmpty
                        renderValue={() => form.hostStore ? '変更' : '選択'}
                        sx={{
                          height: 24,
                          minHeight: 24,
                          '& .MuiSelect-select': {
                            padding: '0 8px',
                            display: 'flex',
                            alignItems: 'center',
                            fontSize: '0.75rem',
                            color: '#999',
                            backgroundColor: '#f8f9fa',
                            borderRadius: '12px',
                            minHeight: '24px !important',
                            height: '24px !important',
                            lineHeight: '24px',
                          },
                          '& .MuiOutlinedInput-notchedOutline': {
                            border: '1px solid #e0e0e0',
                            borderRadius: '12px',
                          },
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#ccc',
                          },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#666',
                            borderWidth: '1px',
                          },
                        }}
                      >
                        {availableStores.map((store) => (
                          <MenuItem key={store} value={store}>
                            {store}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>
                </Box>

                {/* 連名店舗 */}
                <Box>
                  <Typography variant="subtitle2" sx={{ 
                    mb: 1, 
                    fontWeight: 'bold'
                  }}>
                    連名店舗
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, alignItems: 'center' }}>
                    {(form.partnerStores || []).map((store, index) => (
                      <Chip
                        key={index}
                        label={store}
                        size="small"
                        sx={{
                          backgroundColor: '#e0e0e0',
                          color: '#666',
                          fontWeight: 'normal',
                          '& .MuiChip-deleteIcon': {
                            color: '#666',
                            '&:hover': {
                              color: '#d32f2f',
                            },
                          },
                        }}
                        onDelete={() => {
                          const newStores = (form.partnerStores || []).filter((_, i) => i !== index);
                          onFormChange('partnerStores', newStores);
                        }}
                      />
                    ))}
                    <FormControl size="small" sx={{ minWidth: 120 }}>
                      <Select
                        value=""
                        onChange={(e) => {
                          if (e.target.value && !(form.partnerStores || []).includes(e.target.value as string) && e.target.value !== form.hostStore) {
                            onFormChange('partnerStores', [...(form.partnerStores || []), e.target.value as string]);
                          }
                        }}
                        displayEmpty
                        renderValue={() => '追加'}
                        sx={{
                          height: 24,
                          minHeight: 24,
                          '& .MuiSelect-select': {
                            padding: '0 8px',
                            display: 'flex',
                            alignItems: 'center',
                            fontSize: '0.75rem',
                            color: '#999',
                            backgroundColor: '#f8f9fa',
                            borderRadius: '12px',
                            minHeight: '24px !important',
                            height: '24px !important',
                            lineHeight: '24px',
                          },
                          '& .MuiOutlinedInput-notchedOutline': {
                            border: '1px solid #e0e0e0',
                            borderRadius: '12px',
                          },
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#ccc',
                          },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#666',
                            borderWidth: '1px',
                          },
                        }}
                      >
                        {availableStores
                          .filter(store => !(form.partnerStores || []).includes(store) && store !== form.hostStore)
                          .map((store) => (
                            <MenuItem key={store} value={store}>
                              {store}
                            </MenuItem>
                          ))}
                      </Select>
                    </FormControl>
                  </Box>
                </Box>
              </Box>
            </Box>
          </Grid>

          {/* 右列：詳細情報 */}
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {/* 枠集計表 */}
              <Box sx={{ 
                p: 2, 
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
              }}>
                <Typography variant="h6" sx={{ 
                  mb: 2, 
                  fontWeight: 'bold',
                  color: '#333'
                }}>
                  人数/単価
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {/* クローザー */}
                  <Box sx={{ 
                    p: 2, 
                    backgroundColor: '#e3f2fd',
                    borderRadius: '4px',
                  }}>
                    <Typography variant="subtitle2" sx={{ 
                      mb: 1, 
                      fontWeight: 'bold', 
                      color: '#1976d2'
                    }}>
                      クローザー
                    </Typography>
                    <Grid container spacing={1}>
                      <Grid item xs={3}>
                        <TextField
                          label="人数"
                          type="number"
                          value={form.closerCount}
                          onChange={(e) => onFormChange('closerCount', parseInt(e.target.value) || 0)}
                          size="small"
                          fullWidth
                          inputProps={{ min: 0 }}
                        />
                      </Grid>
                      <Grid item xs={4.5}>
                        <TextField
                          label="単価"
                          value={form.closerUnitPrice.toLocaleString()}
                          onChange={(e) => {
                            const value = e.target.value.replace(/,/g, '');
                            onFormChange('closerUnitPrice', parseInt(value) || 0);
                          }}
                          size="small"
                          fullWidth
                          InputProps={{
                            startAdornment: <Typography sx={{ color: '#666', mr: 0.5 }}>¥</Typography>
                          }}
                        />
                      </Grid>
                      <Grid item xs={4.5}>
                        <TextField
                          label="交通費"
                          value={form.closerTransportFee.toLocaleString()}
                          onChange={(e) => {
                            const value = e.target.value.replace(/,/g, '');
                            onFormChange('closerTransportFee', parseInt(value) || 0);
                          }}
                          size="small"
                          fullWidth
                          InputProps={{
                            startAdornment: <Typography sx={{ color: '#666', mr: 0.5 }}>¥</Typography>
                          }}
                        />
                      </Grid>
                    </Grid>
                  </Box>

                  {/* ガール */}
                  <Box sx={{ 
                    p: 2, 
                    backgroundColor: '#fce4ec',
                    borderRadius: '4px',
                  }}>
                    <Typography variant="subtitle2" sx={{ 
                      mb: 1, 
                      fontWeight: 'bold', 
                      color: '#e91e63'
                    }}>
                      ガール
                    </Typography>
                    <Grid container spacing={1}>
                      <Grid item xs={3}>
                        <TextField
                          label="人数"
                          type="number"
                          value={form.girlCount}
                          onChange={(e) => onFormChange('girlCount', parseInt(e.target.value) || 0)}
                          size="small"
                          fullWidth
                          inputProps={{ min: 0 }}
                        />
                      </Grid>
                      <Grid item xs={4.5}>
                        <TextField
                          label="単価"
                          value={form.girlUnitPrice.toLocaleString()}
                          onChange={(e) => {
                            const value = e.target.value.replace(/,/g, '');
                            onFormChange('girlUnitPrice', parseInt(value) || 0);
                          }}
                          size="small"
                          fullWidth
                          InputProps={{
                            startAdornment: <Typography sx={{ color: '#666', mr: 0.5 }}>¥</Typography>
                          }}
                        />
                      </Grid>
                      <Grid item xs={4.5}>
                        <TextField
                          label="交通費"
                          value={form.girlTransportFee.toLocaleString()}
                          onChange={(e) => {
                            const value = e.target.value.replace(/,/g, '');
                            onFormChange('girlTransportFee', parseInt(value) || 0);
                          }}
                          size="small"
                          fullWidth
                          InputProps={{
                            startAdornment: <Typography sx={{ color: '#666', mr: 0.5 }}>¥</Typography>
                          }}
                        />
                      </Grid>
                    </Grid>
                  </Box>
                </Box>
              </Box>

              {/* フラグ設定 */}
              <Box sx={{ 
                p: 2, 
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
              }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {/* 場所取りあり */}
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Checkbox
                      checked={form.hasLocationReservation}
                      onChange={(e) => onFormChange('hasLocationReservation', e.target.checked)}
                    />
                    <LocationIcon sx={{ mr: 1, color: '#4caf50' }} />
                    <Typography variant="body2">場所取りあり</Typography>
                  </Box>

                  {/* 場所取り詳細（場所取りありがTrueの場合のみ表示） */}
                  {form.hasLocationReservation && (
                    <Box sx={{ ml: 4, mt: 1, mb: 1 }}>
                      {/* 既存のレコード表示 */}
                      {form.locationReservationDetails.map((detail, index) => (
                        <Box 
                          key={detail.id}
                          sx={{ 
                            mb: 1,
                            p: 2,
                            border: '1px solid #e0e0e0',
                            borderRadius: '6px',
                            backgroundColor: '#fafafa',
                            '&:hover': { backgroundColor: '#f5f5f5' },
                            position: 'relative'
                          }}
                        >
                          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
                            <IconButton 
                              size="small" 
                              onClick={() => {
                                const updatedDetails = form.locationReservationDetails.filter((_, i) => i !== index);
                                onFormChange('locationReservationDetails', updatedDetails);
                              }}
                              sx={{ 
                                color: '#d32f2f',
                                '&:hover': { backgroundColor: 'rgba(211, 47, 47, 0.1)' }
                              }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Box>
                          
                          <Grid container spacing={1} sx={{ mb: 1 }}>
                            <Grid item xs={6}>
                              <TextField
                                label="日付"
                                type="date"
                                value={detail.date}
                                onChange={(e) => {
                                  const updatedDetails = [...form.locationReservationDetails];
                                  updatedDetails[index].date = e.target.value;
                                  onFormChange('locationReservationDetails', updatedDetails);
                                }}
                                size="small"
                                fullWidth
                                InputLabelProps={{ shrink: true }}
                              />
                            </Grid>
                            <Grid item xs={6}>
                              <FormControl fullWidth size="small">
                                <InputLabel>ステータス</InputLabel>
                                <Select
                                  value={detail.status}
                                  onChange={(e) => {
                                    const updatedDetails = [...form.locationReservationDetails];
                                    updatedDetails[index].status = e.target.value as '申請中' | '日程NG' | '通信NG' | '代理店確認中' | '確定';
                                    onFormChange('locationReservationDetails', updatedDetails);
                                  }}
                                  label="ステータス"
                                >
                                  <MenuItem value="申請中">申請中</MenuItem>
                                  <MenuItem value="日程NG">日程NG</MenuItem>
                                  <MenuItem value="通信NG">通信NG</MenuItem>
                                  <MenuItem value="代理店確認中">代理店確認中</MenuItem>
                                  <MenuItem value="確定">確定</MenuItem>
                                </Select>
                              </FormControl>
                            </Grid>
                          </Grid>
                          
                          <Grid container spacing={1}>
                            <Grid item xs={12}>
                              <TextField
                                label="手配会社"
                                value={detail.arrangementCompany}
                                onChange={(e) => {
                                  const updatedDetails = [...form.locationReservationDetails];
                                  updatedDetails[index].arrangementCompany = e.target.value;
                                  onFormChange('locationReservationDetails', updatedDetails);
                                }}
                                size="small"
                                fullWidth
                              />
                            </Grid>
                            <Grid item xs={6}>
                              <TextField
                                label="卸単価"
                                value={detail.wholesalePrice.toLocaleString()}
                                onChange={(e) => {
                                  const value = e.target.value.replace(/,/g, '');
                                  const updatedDetails = [...form.locationReservationDetails];
                                  updatedDetails[index].wholesalePrice = parseInt(value) || 0;
                                  onFormChange('locationReservationDetails', updatedDetails);
                                }}
                                size="small"
                                fullWidth
                                InputProps={{
                                  startAdornment: <Typography sx={{ color: '#666', mr: 0.5 }}>¥</Typography>
                                }}
                              />
                            </Grid>
                            <Grid item xs={6}>
                              <TextField
                                label="仕入れ単価"
                                value={detail.purchasePrice.toLocaleString()}
                                onChange={(e) => {
                                  const value = e.target.value.replace(/,/g, '');
                                  const updatedDetails = [...form.locationReservationDetails];
                                  updatedDetails[index].purchasePrice = parseInt(value) || 0;
                                  onFormChange('locationReservationDetails', updatedDetails);
                                }}
                                size="small"
                                fullWidth
                                InputProps={{
                                  startAdornment: <Typography sx={{ color: '#666', mr: 0.5 }}>¥</Typography>
                                }}
                              />
                            </Grid>
                          </Grid>
                        </Box>
                      ))}
                      
                      {/* 追加ボタン */}
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => {
                          const newDetail = {
                            id: Date.now().toString(),
                            date: '',
                            status: '申請中' as const,
                            arrangementCompany: '',
                            wholesalePrice: 0,
                            purchasePrice: 0
                          };
                          onFormChange('locationReservationDetails', [...form.locationReservationDetails, newDetail]);
                        }}
                        sx={{
                          borderColor: '#4caf50',
                          color: '#4caf50',
                          fontSize: '0.75rem',
                          py: 0.5,
                          px: 2,
                          '&:hover': {
                            borderColor: '#388e3c',
                            backgroundColor: 'rgba(76, 175, 80, 0.1)'
                          }
                        }}
                      >
                        + 場所取り追加
                      </Button>
                    </Box>
                  )}

                  {/* 外現場 */}
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Checkbox
                      checked={form.isExternalVenue}
                      onChange={(e) => onFormChange('isExternalVenue', e.target.checked)}
                    />
                    <BusinessIcon sx={{ mr: 1, color: '#ff9800' }} />
                    <Typography variant="body2">外現場</Typography>
                  </Box>

                  {/* 出張あり */}
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Checkbox
                      checked={form.hasBusinessTrip}
                      onChange={(e) => onFormChange('hasBusinessTrip', e.target.checked)}
                    />
                    <FlagIcon sx={{ mr: 1, color: '#2196f3' }} />
                    <Typography variant="body2">出張あり</Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </DialogContent>
      
      <DialogActions sx={{ 
        p: 3, 
        borderTop: '1px solid #e0e0e0',
        gap: 1
      }}>
        <Button 
          onClick={onClose}
          variant="outlined"
          sx={{
            px: 3,
            py: 1,
            minWidth: '100px',
          }}
        >
          キャンセル
        </Button>
        <Button 
          onClick={onConfirm}
          variant="contained"
          sx={{
            px: 3,
            py: 1,
            minWidth: '100px',
          }}
        >
          登録
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddRecordDialog; 