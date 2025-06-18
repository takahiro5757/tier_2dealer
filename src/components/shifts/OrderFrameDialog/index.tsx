'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TextField,
  Select,
  MenuItem,
  FormControl,
  Typography,
  Box,
  styled,
  InputAdornment
} from '@mui/material';

// アサインメントの型定義（AssignmentTable/index.tsxのものと合わせる）
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
  availability: {
    [key: string]: boolean;
  };
  statuses?: {
    [orderId: string]: {
      [date: string]: string;
    };
  };
  staff?: {
    [orderId: string]: {
      [date: string]: {
        id: string;
        name: string;
        isGirl: boolean;
        isFemale: boolean;
      };
    };
  };
  memos?: {
    [orderId: string]: {
      [date: string]: {
        id: string;
        text: string;
        timestamp: string;
        user: string;
      }[];
    };
  };
  locks?: {
    [orderId: string]: {
      [date: string]: boolean;
    };
  };
  orderFrames?: {
    [orderId: string]: {
      [dayOfWeek: string]: { // '0'=日曜, '1'=月曜, ..., '6'=土曜
        frames: number;
        priceType: string; // '平日' or '週末'
        priceAmount: number;
      }
    }
  };
}

interface OrderFrameDialogProps {
  open: boolean;
  assignment: AssignmentItem | null;
  onClose: () => void;
  onSave: (updatedAssignment: AssignmentItem) => void;
}

const HeaderCell = styled(TableCell)(({ theme }) => ({
  fontWeight: 'bold',
  backgroundColor: '#f5f5f5',
  padding: '8px 16px',
  borderBottom: '2px solid #ddd',
}));

const DayCell = styled(TableCell)(({ theme }) => ({
  padding: '8px 16px',
  fontWeight: 'bold',
  textAlign: 'center',
  width: '40px',
}));

const InputCell = styled(TableCell)(({ theme }) => ({
  padding: '4px 8px',
}));

// 固定のオーダータイプ定義
const FIXED_ORDER_TYPES = [
  { name: 'クローザー', isGirl: false },
  { name: 'ガール', isGirl: true },
  { name: '無料入店', isGirl: false, isSpecial: true }
];

const OrderFrameDialog: React.FC<OrderFrameDialogProps> = ({
  open,
  assignment,
  onClose,
  onSave
}) => {
  // 曜日ごとの枠数の状態
  const [orderFrames, setOrderFrames] = useState<{
    [orderType: string]: {
      [dayOfWeek: string]: {
        frames: number;
        priceType: string;
        priceAmount: number;
      }
    }
  }>({});

  // 曜日の表示名マッピング
  const daysOfWeek = [
    { value: '1', label: '月' },
    { value: '2', label: '火' },
    { value: '3', label: '水' },
    { value: '4', label: '木' },
    { value: '5', label: '金' },
    { value: '6', label: '土' },
    { value: '0', label: '日' },
  ];

  // 料金タイプオプション
  const priceTypes = [
    { value: '平日', label: '平日' },
    { value: '週末', label: '週末' },
  ];

  // ダイアログが開かれた時に現在の値を設定
  useEffect(() => {
    if (assignment && open) {
      // 既存のorderFramesがあれば使用し、なければ空のオブジェクトを作成
      const initialOrderFrames = assignment.orderFrames || {};
      
      // 固定の3つのオーダータイプに対してデフォルト値を設定
      const defaultFrames: typeof orderFrames = {};
      
      FIXED_ORDER_TYPES.forEach(orderType => {
        // 該当するオーダーIDを見つける（もしくはタイプ名をキーとして使用）
        const matchingOrder = assignment.orders.find(o => o.name === orderType.name);
        const orderKey = matchingOrder ? matchingOrder.id : orderType.name;
        
        defaultFrames[orderKey] = {};
        
        daysOfWeek.forEach(day => {
          const isWeekend = day.value === '0' || day.value === '6';
          
          // もし既存の設定があれば使用
          if (matchingOrder && initialOrderFrames[matchingOrder.id]?.[day.value]) {
            defaultFrames[orderKey][day.value] = initialOrderFrames[matchingOrder.id][day.value];
          } else {
            // なければデフォルト値を設定
            let defaultAmount = 0;
            if (orderType.name === "クローザー") {
              defaultAmount = isWeekend ? 20000 : 10000;
            } else if (orderType.name === "ガール") {
              defaultAmount = isWeekend ? 10000 : 10000;
            }
            
            defaultFrames[orderKey][day.value] = {
              frames: 0,
              priceType: isWeekend ? '週末' : '平日',
              priceAmount: defaultAmount
            };
          }
        });
      });
      
      setOrderFrames(defaultFrames);
    }
  }, [assignment, open]);

  // 枠数の変更ハンドラ
  const handleFrameChange = (orderKey: string, dayOfWeek: string, value: number) => {
    setOrderFrames(prev => ({
      ...prev,
      [orderKey]: {
        ...prev[orderKey],
        [dayOfWeek]: {
          ...prev[orderKey][dayOfWeek],
          frames: value
        }
      }
    }));
  };

  // 料金タイプの変更ハンドラ
  const handlePriceTypeChange = (orderKey: string, dayOfWeek: string, value: string) => {
    setOrderFrames(prev => ({
      ...prev,
      [orderKey]: {
        ...prev[orderKey],
        [dayOfWeek]: {
          ...prev[orderKey][dayOfWeek],
          priceType: value,
        }
      }
    }));
  };

  // 単価の変更ハンドラ
  const handlePriceAmountChange = (orderKey: string, dayOfWeek: string, value: number) => {
    setOrderFrames(prev => ({
      ...prev,
      [orderKey]: {
        ...prev[orderKey],
        [dayOfWeek]: {
          ...prev[orderKey][dayOfWeek],
          priceAmount: value
        }
      }
    }));
  };

  // 保存ハンドラ
  const handleSave = () => {
    if (!assignment) return;

    const updatedOrderFrames: typeof orderFrames = {};
    
    // 注文IDをキーとするオブジェクトに変換
    FIXED_ORDER_TYPES.forEach(orderType => {
      const matchingOrder = assignment.orders.find(o => o.name === orderType.name);
      if (matchingOrder) {
        const orderTypeKey = orderType.name;
        const orderId = matchingOrder.id;
        updatedOrderFrames[orderId] = orderFrames[orderId] || orderFrames[orderTypeKey] || {};
      }
    });

    const updatedAssignment = {
      ...assignment,
      orderFrames: updatedOrderFrames
    };

    onSave(updatedAssignment);
  };

  // 数値をカンマ区切りの文字列に変換するヘルパー関数
  const formatNumber = (value: number): string => {
    return value.toLocaleString();
  };

  // カンマ区切りの文字列から数値に変換するヘルパー関数
  const parseFormattedNumber = (formattedValue: string): number => {
    const value = Number(formattedValue.replace(/,/g, ''));
    return isNaN(value) ? 0 : value;
  };

  if (!assignment) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        {assignment.venue} ({assignment.agency})
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          {FIXED_ORDER_TYPES.map(orderType => {
            const matchingOrder = assignment.orders.find(o => o.name === orderType.name);
            const orderKey = matchingOrder ? matchingOrder.id : orderType.name;
            
            return (
              <Box key={orderKey} sx={{ mb: 4, border: '1px solid #ddd', borderRadius: '4px', overflow: 'hidden' }}>
                <Typography
                  variant="subtitle1"
                  sx={{
                    p: 1.5,
                    bgcolor: '#f5f5f5',
                    fontWeight: 'bold',
                    color: orderType.isSpecial ? '#000000' : (orderType.isGirl ? '#e91e63' : '#2196f3'),
                    borderBottom: '1px solid #ddd'
                  }}
                >
                  {orderType.name}
                </Typography>
                
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <HeaderCell sx={{ width: '60px' }}>曜日</HeaderCell>
                      <HeaderCell sx={{ width: '80px' }}>枠数</HeaderCell>
                      <HeaderCell sx={{ width: '120px' }}>平日or週末</HeaderCell>
                      <HeaderCell sx={{ width: '120px' }}>単価</HeaderCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {daysOfWeek.map(day => {
                      const isWeekend = day.value === '0' || day.value === '6';
                      const frames = orderFrames[orderKey]?.[day.value]?.frames || 0;
                      const priceType = orderFrames[orderKey]?.[day.value]?.priceType || (isWeekend ? '週末' : '平日');
                      const priceAmount = orderFrames[orderKey]?.[day.value]?.priceAmount || 0;
                      const showPrice = frames > 0;
                      
                      return (
                        <TableRow key={`${orderKey}-${day.value}`}>
                          <DayCell>
                            {day.label}
                          </DayCell>
                          <InputCell>
                            <TextField
                              type="number"
                              variant="outlined"
                              size="small"
                              InputProps={{ inputProps: { min: 0, max: 10 } }}
                              value={frames}
                              onChange={(e) => handleFrameChange(orderKey, day.value, Number(e.target.value))}
                              sx={{ width: '60px' }}
                            />
                          </InputCell>
                          <InputCell>
                            {showPrice && (
                              <FormControl variant="outlined" size="small" sx={{ width: '100px' }}>
                                <Select
                                  value={priceType}
                                  onChange={(e) => handlePriceTypeChange(orderKey, day.value, e.target.value)}
                                >
                                  {priceTypes.map(type => (
                                    <MenuItem key={type.value} value={type.value}>
                                      {type.label}
                                    </MenuItem>
                                  ))}
                                </Select>
                              </FormControl>
                            )}
                          </InputCell>
                          <InputCell>
                            {showPrice && (
                              <TextField
                                variant="outlined"
                                size="small"
                                value={formatNumber(priceAmount)}
                                onChange={(e) => {
                                  const value = parseFormattedNumber(e.target.value);
                                  handlePriceAmountChange(orderKey, day.value, value);
                                }}
                                InputProps={{
                                  startAdornment: (
                                    <InputAdornment position="start">¥</InputAdornment>
                                  ),
                                }}
                                sx={{ width: '120px' }}
                              />
                            )}
                          </InputCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </Box>
            );
          })}
        </Box>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose} color="primary">
          キャンセル
        </Button>
        <Button onClick={handleSave} variant="contained" color="primary">
          保存
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default OrderFrameDialog; 