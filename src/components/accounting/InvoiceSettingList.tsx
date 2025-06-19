'use client';

import { useState } from 'react';
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
  IconButton,
  Chip,
  FormControl,
  Select,
  MenuItem,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TextField,
  Button
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DeleteIcon from '@mui/icons-material/Delete';

// 請求品目の型定義
interface InvoiceItem {
  id: number;
  eventDate: string;
  itemName: string;
  unitPrice: number;
  quantity: number;
  amount: number;
  taxType: 'taxable' | 'tax-free';
}

// 請求データの型定義
interface Invoice {
  id: number;
  agencyName: string;
  sendTo: string;
  storeAddressSetting: string;
  fileName: string;
  totalAmount: number;
  createdAt: string;
  projectIds: number[];
  mainStoreNames: string[];
  coStoreNames: string[];
  items: InvoiceItem[];
}

interface InvoiceSettingListProps {
  invoices: Invoice[];
  availableStores: string[];
  expandedAccordions: Record<string | number, boolean>;
  editingItems: Record<string, boolean>;
  editingItemValues: Record<string, string>;
  onAccordionChange: (invoiceId: number | string) => (event: React.SyntheticEvent, isExpanded: boolean) => void;
  onDeleteInvoice: (invoiceId: number) => void;
  onMainStoreChange: (invoiceId: number, newStores: string[]) => void;
  onCoStoreChange: (invoiceId: number, newStores: string[]) => void;
  onItemEditStart: (invoiceId: number, itemId: number, currentName: string) => void;
  onItemEditCancel: (invoiceId: number, itemId: number) => void;
  onItemEditSave: (invoiceId: number, itemId: number) => void;
  onItemNameChange: (invoiceId: number, itemId: number, value: string) => void;
}

// 日付表示用フォーマット関数
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('ja-JP', {
    year: 'numeric', 
    month: 'numeric', 
    day: 'numeric'
  }).replace(/\//g, '/');
};

export default function InvoiceSettingList({
  invoices,
  availableStores,
  expandedAccordions,
  editingItems,
  editingItemValues,
  onAccordionChange,
  onDeleteInvoice,
  onMainStoreChange,
  onCoStoreChange,
  onItemEditStart,
  onItemEditCancel,
  onItemEditSave,
  onItemNameChange
}: InvoiceSettingListProps) {
  // 代理店ごとにグループ化
  const groupedInvoices = invoices.reduce<Record<string, Invoice[]>>((acc, invoice) => {
    if (!acc[invoice.agencyName]) acc[invoice.agencyName] = [];
    acc[invoice.agencyName].push(invoice);
    return acc;
  }, {});

  return (
    <>
      {Object.entries(groupedInvoices).map(([agencyName, agencyInvoices]) => (
        <Box key={agencyName} sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Box sx={{ width: 4, height: 28, bgcolor: '#17424d', mr: 1 }} />
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{agencyName}</Typography>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {agencyInvoices.map((invoice) => (
              <Accordion
                key={invoice.id}
                expanded={expandedAccordions[invoice.id] || false}
                onChange={onAccordionChange(invoice.id)}
                sx={{
                  border: '1px solid #e0e0e0',
                  '&:before': {
                    display: 'none',
                  },
                  boxShadow: 'none',
                  '&.Mui-expanded': {
                    margin: 0,
                  },
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  sx={{
                    '&.Mui-expanded': {
                      minHeight: 48,
                    },
                    '& .MuiAccordionSummary-content': {
                      '&.Mui-expanded': {
                        margin: '12px 0',
                      },
                    },
                    '& .MuiAccordionSummary-expandIconWrapper': {
                      order: 2,
                      marginLeft: 1,
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                    <Grid container spacing={3} sx={{ flexGrow: 1 }}>
                      <Grid item xs={12} sm={6} md={3}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                          送付先
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, alignItems: 'center' }}>
                          {invoice.mainStoreNames.map((store, index) => (
                            <Chip
                              key={index}
                              label={store}
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
                              onDelete={(e) => {
                                e.stopPropagation();
                                const newStores = invoice.mainStoreNames.filter((_, i) => i !== index);
                                onMainStoreChange(invoice.id, newStores);
                              }}
                            />
                          ))}
                          <FormControl size="small" sx={{ minWidth: 120 }}>
                            <Select
                              value=""
                              onChange={(e) => {
                                e.stopPropagation();
                                if (e.target.value && !invoice.mainStoreNames.includes(e.target.value as string)) {
                                  onMainStoreChange(invoice.id, [...invoice.mainStoreNames, e.target.value as string]);
                                }
                              }}
                              displayEmpty
                              renderValue={() => '追加'}
                              onClick={(e) => e.stopPropagation()}
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
                                .filter(store => !invoice.mainStoreNames.includes(store))
                                .map((store) => (
                                  <MenuItem key={store} value={store}>
                                    {store}
                                  </MenuItem>
                                ))}
                            </Select>
                          </FormControl>
                        </Box>
                      </Grid>
                      
                      <Grid item xs={12} sm={6} md={3}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                          店舗アドレス
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, alignItems: 'center' }}>
                          {invoice.coStoreNames.map((store, index) => (
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
                              onDelete={(e) => {
                                e.stopPropagation();
                                const newStores = invoice.coStoreNames.filter((_, i) => i !== index);
                                onCoStoreChange(invoice.id, newStores);
                              }}
                            />
                          ))}
                          <FormControl size="small" sx={{ minWidth: 120 }}>
                            <Select
                              value=""
                              onChange={(e) => {
                                e.stopPropagation();
                                if (e.target.value && !invoice.coStoreNames.includes(e.target.value as string)) {
                                  onCoStoreChange(invoice.id, [...invoice.coStoreNames, e.target.value as string]);
                                }
                              }}
                              displayEmpty
                              renderValue={() => '追加'}
                              onClick={(e) => e.stopPropagation()}
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
                                .filter(store => !invoice.coStoreNames.includes(store))
                                .map((store) => (
                                  <MenuItem key={store} value={store}>
                                    {store}
                                  </MenuItem>
                                ))}
                            </Select>
                          </FormControl>
                        </Box>
                      </Grid>
                      
                      <Grid item xs={12} sm={6} md={3}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                          ファイル名
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                          {invoice.fileName}
                        </Typography>
                      </Grid>
                      
                      <Grid item xs={12} sm={6} md={3}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                          請求総額
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                          ¥{invoice.totalAmount.toLocaleString()}
                        </Typography>
                      </Grid>
                    </Grid>
                    
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteInvoice(invoice.id);
                      }}
                      sx={{ ml: 2, order: 1 }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </AccordionSummary>
                
                <AccordionDetails>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                    請求品目詳細
                  </Typography>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 'bold', width: '100px', minWidth: '100px' }}>開催日付</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', width: '200px', minWidth: '200px' }}>品目名</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold', width: '80px', minWidth: '80px' }}>単価</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold', width: '60px', minWidth: '60px' }}>数量</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold', width: '100px', minWidth: '100px' }}>金額</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 'bold', width: '80px', minWidth: '80px' }}>課税区分</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 'bold', width: '100px', minWidth: '100px' }}></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {invoice.items.map((item) => {
                        const editingKey = `${invoice.id}-${item.id}`;
                        const isEditing = editingItems[editingKey] || false;
                        const editingValue = editingItemValues[editingKey] || '';
                        
                        return (
                          <TableRow key={item.id} sx={{ height: '53px' }}>
                            <TableCell sx={{ width: '100px', minWidth: '100px' }}>{formatDate(item.eventDate)}</TableCell>
                            <TableCell sx={{ width: '200px', minWidth: '200px', padding: '8px' }}>
                              {isEditing ? (
                                <TextField
                                  value={editingValue}
                                  onChange={(e) => onItemNameChange(invoice.id, item.id, e.target.value)}
                                  size="small"
                                  variant="outlined"
                                  fullWidth
                                  autoFocus
                                  sx={{
                                    '& .MuiInputBase-root': {
                                      height: '32px',
                                      fontSize: '0.875rem'
                                    },
                                    '& .MuiInputBase-input': {
                                      padding: '6px 8px'
                                    }
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      onItemEditSave(invoice.id, item.id);
                                    } else if (e.key === 'Escape') {
                                      onItemEditCancel(invoice.id, item.id);
                                    }
                                  }}
                                />
                              ) : (
                                <Box sx={{ 
                                  height: '32px', 
                                  display: 'flex', 
                                  alignItems: 'center',
                                  fontSize: '0.875rem'
                                }}>
                                  {item.itemName}
                                </Box>
                              )}
                            </TableCell>
                            <TableCell align="right" sx={{ width: '80px', minWidth: '80px' }}>¥{item.unitPrice.toLocaleString()}</TableCell>
                            <TableCell align="right" sx={{ width: '60px', minWidth: '60px' }}>{item.quantity}</TableCell>
                            <TableCell align="right" sx={{ width: '100px', minWidth: '100px' }}>¥{item.amount.toLocaleString()}</TableCell>
                            <TableCell align="center" sx={{ width: '80px', minWidth: '80px' }}>
                              <Chip
                                label={item.taxType === 'taxable' ? '課税' : '非課税'}
                                size="small"
                                color={item.taxType === 'taxable' ? 'primary' : 'default'}
                                variant={item.taxType === 'taxable' ? 'filled' : 'outlined'}
                              />
                            </TableCell>
                            <TableCell align="center" sx={{ width: '100px', minWidth: '100px', padding: '4px' }}>
                              {isEditing ? (
                                <Box sx={{ 
                                  display: 'flex', 
                                  flexDirection: 'column', 
                                  gap: 0.5, 
                                  alignItems: 'center',
                                  width: '100%'
                                }}>
                                  <Button
                                    size="small"
                                    variant="contained"
                                    onClick={() => onItemEditSave(invoice.id, item.id)}
                                    sx={{ 
                                      fontSize: '0.7rem',
                                      width: '70px',
                                      height: '20px',
                                      padding: '2px 6px'
                                    }}
                                  >
                                    更新
                                  </Button>
                                  <Button
                                    size="small"
                                    variant="outlined"
                                    onClick={() => onItemEditCancel(invoice.id, item.id)}
                                    sx={{ 
                                      fontSize: '0.7rem',
                                      width: '70px',
                                      height: '20px',
                                      padding: '2px 6px',
                                      whiteSpace: 'nowrap'
                                    }}
                                  >
                                    キャンセル
                                  </Button>
                                </Box>
                              ) : (
                                <Button
                                  size="small"
                                  variant="text"
                                  onClick={() => onItemEditStart(invoice.id, item.id, item.itemName)}
                                  sx={{ 
                                    fontSize: '0.7rem',
                                    minWidth: '50px',
                                    height: '24px',
                                    padding: '2px 6px'
                                  }}
                                >
                                  編集
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                      <TableRow>
                        <TableCell colSpan={4} sx={{ fontWeight: 'bold', borderTop: '2px solid #e0e0e0' }}>
                          小計（税抜き）
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold', borderTop: '2px solid #e0e0e0', width: '100px', minWidth: '100px' }}>
                          ¥{invoice.items
                            .filter(item => item.taxType === 'taxable')
                            .reduce((sum, item) => sum + item.amount, 0)
                            .toLocaleString()}
                        </TableCell>
                        <TableCell sx={{ borderTop: '2px solid #e0e0e0', width: '80px', minWidth: '80px' }} />
                        <TableCell sx={{ borderTop: '2px solid #e0e0e0', width: '100px', minWidth: '100px' }} />
                      </TableRow>
                      <TableRow>
                        <TableCell colSpan={4} sx={{ fontWeight: 'bold' }}>
                          非課税分
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold', width: '100px', minWidth: '100px' }}>
                          ¥{invoice.items
                            .filter(item => item.taxType === 'tax-free')
                            .reduce((sum, item) => sum + item.amount, 0)
                            .toLocaleString()}
                        </TableCell>
                        <TableCell sx={{ width: '80px', minWidth: '80px' }} />
                        <TableCell sx={{ width: '100px', minWidth: '100px' }} />
                      </TableRow>
                      <TableRow>
                        <TableCell colSpan={4} sx={{ fontWeight: 'bold' }}>
                          消費税（10%）
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold', width: '100px', minWidth: '100px' }}>
                          ¥{Math.floor(invoice.items
                            .filter(item => item.taxType === 'taxable')
                            .reduce((sum, item) => sum + item.amount, 0) * 0.1)
                            .toLocaleString()}
                        </TableCell>
                        <TableCell sx={{ width: '80px', minWidth: '80px' }} />
                        <TableCell sx={{ width: '100px', minWidth: '100px' }} />
                      </TableRow>
                      <TableRow>
                        <TableCell colSpan={4} sx={{ fontWeight: 'bold', borderTop: '2px solid #e0e0e0', backgroundColor: '#f5f5f5' }}>
                          合計（税込み）
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold', borderTop: '2px solid #e0e0e0', backgroundColor: '#f5f5f5', fontSize: '1.1rem', width: '100px', minWidth: '100px' }}>
                          ¥{(invoice.items.reduce((sum, item) => sum + item.amount, 0) + 
                             Math.floor(invoice.items
                               .filter(item => item.taxType === 'taxable')
                               .reduce((sum, item) => sum + item.amount, 0) * 0.1))
                             .toLocaleString()}
                        </TableCell>
                        <TableCell sx={{ borderTop: '2px solid #e0e0e0', backgroundColor: '#f5f5f5', width: '80px', minWidth: '80px' }} />
                        <TableCell sx={{ borderTop: '2px solid #e0e0e0', backgroundColor: '#f5f5f5', width: '100px', minWidth: '100px' }} />
                      </TableRow>
                    </TableBody>
                  </Table>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        </Box>
      ))}
    </>
  );
} 