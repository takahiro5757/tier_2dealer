'use client';

import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button,
  IconButton,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TextField,
  FormControl,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Close as CloseIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';

// 型定義
interface LocationReservation {
  id: string;
  date: string;
  status: '申請中' | '日程NG' | '通信NG' | '代理店確認中' | '確定';
  arrangementCompany: string;
  wholesalePrice: number;
  purchasePrice: number;
}

interface LocationReservationModalProps {
  open: boolean;
  recordId: number;
  reservations: LocationReservation[];
  onClose: () => void;
  onAdd: (recordId: number) => void;
  onRemove: (recordId: number, reservationId: string) => void;
  onUpdate: (recordId: number, reservationId: string, updates: any) => void;
}

const LocationReservationModal: React.FC<LocationReservationModalProps> = ({
  open,
  recordId,
  reservations,
  onClose,
  onAdd,
  onRemove,
  onUpdate,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          minHeight: '400px',
          maxHeight: '80vh',
          minWidth: '900px'
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'none'
      }}>
      </DialogTitle>
      
      <DialogContent sx={{ p: 3 }}>
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mb: 2, mt: 3 }}>
            <Button
              variant="contained"
              size="small"
              onClick={() => onAdd(recordId)}
              sx={{ minWidth: '100px' }}
            >
              + 追加
            </Button>
          </Box>
          
          {reservations.length === 0 ? (
            <Box sx={{ 
              textAlign: 'center', 
              py: 4, 
              color: '#666',
              border: '2px dashed #e0e0e0',
              borderRadius: '8px'
            }}>
              <Typography variant="body1">
                場所取りレコードがありません
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                「+ 追加」ボタンで新しいレコードを追加してください
              </Typography>
            </Box>
          ) : (
            <Table size="small" sx={{ border: '1px solid #e0e0e0' }}>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell sx={{ fontWeight: 'bold', width: '120px' }}>日付</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', width: '140px' }}>ステータス</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', width: '200px' }}>手配会社</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', width: '140px' }}>卸単価</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', width: '140px' }}>仕入単価</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', width: '60px', textAlign: 'center' }}></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reservations.map((reservation) => (
                  <TableRow key={reservation.id}>
                    <TableCell sx={{ width: '120px' }}>
                      <TextField
                        type="date"
                        value={reservation.date}
                        onChange={(e) => onUpdate(recordId, reservation.id, { date: e.target.value })}
                        size="small"
                        variant="outlined"
                        sx={{ width: '110px' }}
                      />
                    </TableCell>
                    <TableCell sx={{ width: '140px' }}>
                      <FormControl size="small" sx={{ width: '130px' }}>
                        <Select
                          value={reservation.status}
                          onChange={(e) => onUpdate(recordId, reservation.id, { status: e.target.value })}
                        >
                          <MenuItem value="申請中">申請中</MenuItem>
                          <MenuItem value="日程NG">日程NG</MenuItem>
                          <MenuItem value="通信NG">通信NG</MenuItem>
                          <MenuItem value="代理店確認中">代理店確認中</MenuItem>
                          <MenuItem value="確定">確定</MenuItem>
                        </Select>
                      </FormControl>
                    </TableCell>
                    <TableCell sx={{ width: '200px' }}>
                      <TextField
                        value={reservation.arrangementCompany}
                        onChange={(e) => onUpdate(recordId, reservation.id, { arrangementCompany: e.target.value })}
                        size="small"
                        variant="outlined"
                        placeholder="手配会社名"
                        sx={{ width: '190px' }}
                      />
                    </TableCell>
                    <TableCell sx={{ width: '140px' }}>
                      <TextField
                        type="number"
                        value={reservation.wholesalePrice}
                        onChange={(e) => onUpdate(recordId, reservation.id, { wholesalePrice: parseInt(e.target.value) || 0 })}
                        size="small"
                        variant="outlined"
                        InputProps={{
                          startAdornment: '¥',
                        }}
                        sx={{ 
                          width: '130px',
                          '& .MuiInputBase-input': { textAlign: 'right' }
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ width: '140px' }}>
                      <TextField
                        type="number"
                        value={reservation.purchasePrice}
                        onChange={(e) => onUpdate(recordId, reservation.id, { purchasePrice: parseInt(e.target.value) || 0 })}
                        size="small"
                        variant="outlined"
                        InputProps={{
                          startAdornment: '¥',
                        }}
                        sx={{ 
                          width: '130px',
                          '& .MuiInputBase-input': { textAlign: 'right' }
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ width: '60px', textAlign: 'center' }}>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => onRemove(recordId, reservation.id)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ p: 2, borderTop: '1px solid #e0e0e0' }}>
        <Button onClick={onClose} variant="outlined" color="inherit" sx={{ minWidth: '100px' }}>
          キャンセル
        </Button>
        <Button onClick={onClose} variant="contained" color="primary" sx={{ minWidth: '100px' }}>
          登録
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LocationReservationModal; 