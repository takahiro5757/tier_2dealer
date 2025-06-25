'use client';

import { Box, Container, Typography, Paper, Chip, Button, Divider } from '@mui/material';
import { 
  CheckCircle, Cancel, Remove, HelpOutline, LocationOn, AccessTime, Info
} from '@mui/icons-material';

// テスト用のダミーデータ
const testShifts = [
  {
    date: '2025-01-15',
    dayOfWeek: '水',
    requestedStatus: '○' as const,
    status: '確定' as const,
    location: '新宿エリア',
    startTime: '09:00',
    endTime: '18:00'
  },
  {
    date: '2025-01-16',
    dayOfWeek: '木',
    requestedStatus: '○' as const,
    status: '詳細未確定' as const,
    location: '渋谷エリア',
    startTime: undefined,
    endTime: undefined
  },
  {
    date: '2025-01-17',
    dayOfWeek: '金',
    requestedStatus: '○' as const,
    status: '現場未確定' as const,
    location: undefined,
    startTime: undefined,
    endTime: undefined
  },
  {
    date: '2025-01-18',
    dayOfWeek: '土',
    requestedStatus: '×' as const,
    status: '休み' as const,
    location: undefined,
    startTime: undefined,
    endTime: undefined
  },
  {
    date: '2025-01-19',
    dayOfWeek: '日',
    requestedStatus: '○' as const,
    status: '確定' as const,
    location: '池袋エリア（非常に長い場所名テスト）',
    startTime: '10:30',
    endTime: '19:30'
  }
];

// ステータス設定
const STATUS_CONFIG = {
  '確定': { icon: <CheckCircle />, label: '確定', color: 'success' as const },
  '詳細未確定': { icon: <HelpOutline />, label: '詳細未確定', color: 'warning' as const },
  '現場未確定': { icon: <Remove />, label: '現場未確定', color: undefined },
  '休み': { icon: <Cancel />, label: '休み', color: 'error' as const }
};

export default function TestPage() {
  // 希望記号の色を取得
  const getRequestedStatusColor = (status: '○' | '×' | '-') => {
    switch (status) {
      case '○': return '#2e7d32';
      case '×': return '#d32f2f';
      case '-': return '#ef6c00';
    }
  };

  // 背景色を取得
  const getBackgroundColor = (status: string) => {
    if (status === '確定') return '#e8f5e8';
    if (status === '休み') return '#f5f5f5';
    return '#ffffff';
  };

  return (
    <Container maxWidth="sm" sx={{ py: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3, textAlign: 'center' }}>
        パターン2c改良版バリエーション
      </Typography>

      {/* パターン2c-1-1: 枠線強調型（中央揃え・標準サイズ） */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold' }}>
          パターン2c-1-1: 枠線強調型（中央揃え・標準サイズ）
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          希望記号は太字のみ、ステータスは左枠内中央揃え、outlined Chip で枠線強調
        </Typography>
        
        {testShifts.map((shift, index) => (
          <Paper 
            key={index}
            sx={{ 
              p: 1.5, 
              mb: 1, 
              borderRadius: 2,
              backgroundColor: getBackgroundColor(shift.status),
              border: shift.status === '確定' ? '2px solid #4caf50' : '1px solid #e0e0e0'
            }}
          >
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              minHeight: 40
            }}>
              {/* 左セクション: 基本情報 (40%) */}
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center',
                flex: '0 0 40%',
                borderRight: '1px solid #e0e0e0',
                pr: 1.5,
                position: 'relative'
              }}>
                {/* 日付（固定位置・左寄り） */}
                <Box sx={{ 
                  width: '70px',
                  display: 'flex',
                  justifyContent: 'flex-start'
                }}>
                  <Typography variant="body1" sx={{ fontWeight: 'bold', fontSize: '0.8rem' }}>
                    {shift.date.split('-')[2]}日({shift.dayOfWeek})
                  </Typography>
                </Box>

                {/* 希望記号（固定位置・左寄り・日付に近づける） */}
                <Box sx={{ 
                  width: '20px',
                  display: 'flex',
                  justifyContent: 'flex-start',
                  ml: -1.7
                }}>
                  <Typography sx={{ 
                    minWidth: 5,
                    height: 20,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    color: getRequestedStatusColor(shift.requestedStatus)
                  }}>
                    {shift.requestedStatus}
                  </Typography>
                </Box>

                {/* ステータス（中央揃え・残りスペース使用） */}
                <Box sx={{ 
                  flex: 1,
                  display: 'flex',
                  justifyContent: 'center'
                }}>
                  <Chip
                    label={STATUS_CONFIG[shift.status].label}
                    variant="outlined"
                    color={shift.status === '現場未確定' ? undefined : STATUS_CONFIG[shift.status].color}
                    size="small"
                    sx={{ 
                      fontSize: '0.6rem',
                      height: 24,
                      fontWeight: 'bold',
                      borderWidth: 2,
                      '& .MuiChip-label': { px: 0.4 },
                      ...(shift.status === '現場未確定' && {
                        borderColor: '#C3AF45',
                        color: '#C3AF45'
                      })
                    }}
                  />
                </Box>
              </Box>

              {/* 右セクション: 詳細情報 (60%) */}
              <Box sx={{ pl: 1.5, flex: '0 0 60%' }}>
                {shift.status !== '休み' ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.3 }}>
                    {/* 稼働エリア */}
                    {shift.location && (
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontSize: '0.8rem',
                          fontWeight: 'bold',
                          color: '#1976d2',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        ▶ {shift.location}
                      </Typography>
                    )}
                    
                    {/* 時間と詳細 */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      {shift.startTime && shift.endTime && (
                        <Typography variant="body2" sx={{ fontSize: '0.7rem', fontWeight: 'bold' }}>
                          時間: {shift.startTime}-{shift.endTime}
                        </Typography>
                      )}
                      {shift.status === '確定' && (
                        <Typography variant="caption" color="primary" sx={{ fontSize: '0.6rem' }}>
                          ＞詳細
                        </Typography>
                      )}
                    </Box>
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                    お休み
                  </Typography>
                )}
              </Box>
            </Box>
          </Paper>
        ))}
      </Box>

      <Divider sx={{ my: 3 }} />

      {/* パターン2c-1-2: 枠線強調型（中央揃え・コンパクト） */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold' }}>
          パターン2c-1-2: 枠線強調型（中央揃え・コンパクト）
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          左枠内中央揃え、ステータスChipをよりコンパクトに表示
        </Typography>
        
        {testShifts.map((shift, index) => (
          <Paper 
            key={index}
            sx={{ 
              p: 1.5, 
              mb: 1, 
              borderRadius: 2,
              backgroundColor: getBackgroundColor(shift.status),
              border: shift.status === '確定' ? '2px solid #4caf50' : '1px solid #e0e0e0'
            }}
          >
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              minHeight: 36
            }}>
              {/* 左セクション: 基本情報 (40%) */}
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center',
                flex: '0 0 40%',
                borderRight: '1px solid #e0e0e0',
                pr: 1.5,
                position: 'relative'
              }}>
                {/* 日付（固定位置・左寄り） */}
                <Box sx={{ 
                  width: '70px',
                  display: 'flex',
                  justifyContent: 'flex-start'
                }}>
                  <Typography variant="body1" sx={{ fontWeight: 'bold', fontSize: '0.75rem' }}>
                    {shift.date.split('-')[2]}日({shift.dayOfWeek})
                  </Typography>
                </Box>

                {/* 希望記号（固定位置・左寄り） */}
                <Box sx={{ 
                  width: '30px',
                  display: 'flex',
                  justifyContent: 'flex-start'
                }}>
                  <Typography sx={{ 
                    minWidth: 20,
                    height: 20,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.9rem',
                    fontWeight: 'bold',
                    color: getRequestedStatusColor(shift.requestedStatus)
                  }}>
                    {shift.requestedStatus}
                  </Typography>
                </Box>

                {/* ステータス（中央揃え・残りスペース使用） */}
                <Box sx={{ 
                  flex: 1,
                  display: 'flex',
                  justifyContent: 'center'
                }}>
                  <Chip
                    label={STATUS_CONFIG[shift.status].label}
                    variant="outlined"
                    color={shift.status === '現場未確定' ? undefined : STATUS_CONFIG[shift.status].color}
                    size="small"
                    sx={{ 
                      fontSize: '0.55rem',
                      height: 18,
                      fontWeight: 'bold',
                      borderWidth: 2,
                      '& .MuiChip-label': { px: 0.3 },
                      ...(shift.status === '現場未確定' && {
                        borderColor: '#C3AF45',
                        color: '#C3AF45'
                      })
                    }}
                  />
                </Box>
              </Box>

              {/* 右セクション: 詳細情報 (60%) */}
              <Box sx={{ pl: 1.5, flex: '0 0 60%' }}>
                {shift.status !== '休み' ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.3 }}>
                    {/* 稼働エリア */}
                    {shift.location && (
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontSize: '0.8rem',
                          fontWeight: 'bold',
                          color: '#1976d2',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        ▶ {shift.location}
                      </Typography>
                    )}
                    
                    {/* 時間と詳細 */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      {shift.startTime && shift.endTime && (
                        <Typography variant="body2" sx={{ fontSize: '0.7rem', fontWeight: 'bold' }}>
                          時間: {shift.startTime}-{shift.endTime}
                        </Typography>
                      )}
                      {shift.status === '確定' && (
                        <Typography variant="caption" color="primary" sx={{ fontSize: '0.6rem' }}>
                          ＞詳細
                        </Typography>
                      )}
                    </Box>
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                    お休み
                  </Typography>
                )}
              </Box>
            </Box>
          </Paper>
        ))}
      </Box>

      <Divider sx={{ my: 3 }} />

      {/* パターン2c-1-3: 枠線強調型（縦配置） */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold' }}>
          パターン2c-1-3: 枠線強調型（縦配置）
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          左枠内で要素を縦に配置、中央揃えでバランス重視
        </Typography>
        
        {testShifts.map((shift, index) => (
          <Paper 
            key={index}
            sx={{ 
              p: 1.5, 
              mb: 1, 
              borderRadius: 2,
              backgroundColor: getBackgroundColor(shift.status),
              border: shift.status === '確定' ? '2px solid #4caf50' : '1px solid #e0e0e0'
            }}
          >
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              minHeight: 40
            }}>
              {/* 左セクション: 基本情報 (40%) */}
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                flex: '0 0 40%',
                borderRight: '1px solid #e0e0e0',
                pr: 1.5,
                position: 'relative'
              }}>
                {/* 日付（固定位置・中央） */}
                <Typography variant="body1" sx={{ fontWeight: 'bold', fontSize: '0.8rem', mb: 0.5 }}>
                  {shift.date.split('-')[2]}日({shift.dayOfWeek})
                </Typography>

                {/* 希望記号とステータスの行（固定配置） */}
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  width: '100%',
                  justifyContent: 'space-between',
                  px: 1
                }}>
                  {/* 希望記号（固定位置・左寄り） */}
                  <Typography sx={{ 
                    minWidth: 24,
                    height: 24,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    color: getRequestedStatusColor(shift.requestedStatus)
                  }}>
                    {shift.requestedStatus}
                  </Typography>

                  {/* ステータス（右寄り・固定位置） */}
                  <Chip
                    label={STATUS_CONFIG[shift.status].label}
                    variant="outlined"
                    color={shift.status === '現場未確定' ? undefined : STATUS_CONFIG[shift.status].color}
                    size="small"
                    sx={{ 
                      fontSize: '0.6rem',
                      height: 22,
                      fontWeight: 'bold',
                      borderWidth: 2,
                      '& .MuiChip-label': { px: 0.4 },
                      ...(shift.status === '現場未確定' && {
                        borderColor: '#C3AF45',
                        color: '#C3AF45'
                      })
                    }}
                  />
                </Box>
              </Box>

              {/* 右セクション: 詳細情報 (60%) */}
              <Box sx={{ pl: 1.5, flex: '0 0 60%' }}>
                {shift.status !== '休み' ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.3 }}>
                    {/* 稼働エリア */}
                    {shift.location && (
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontSize: '0.8rem',
                          fontWeight: 'bold',
                          color: '#1976d2',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        ▶ {shift.location}
                      </Typography>
                    )}
                    
                    {/* 時間と詳細 */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      {shift.startTime && shift.endTime && (
                        <Typography variant="body2" sx={{ fontSize: '0.7rem', fontWeight: 'bold' }}>
                          時間: {shift.startTime}-{shift.endTime}
                        </Typography>
                      )}
                      {shift.status === '確定' && (
                        <Typography variant="caption" color="primary" sx={{ fontSize: '0.6rem' }}>
                          ＞詳細
                        </Typography>
                      )}
                    </Box>
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                    お休み
                  </Typography>
                )}
              </Box>
            </Box>
          </Paper>
        ))}
      </Box>

      <Divider sx={{ my: 3 }} />

      {/* パターン2c-1-4: 枠線強調型（左右バランス重視） */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold' }}>
          パターン2c-1-4: 枠線強調型（左右バランス重視）
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          左枠内中央揃え、要素間のバランスと視認性を最適化
        </Typography>
        
        {testShifts.map((shift, index) => (
          <Paper 
            key={index}
            sx={{ 
              p: 1.5, 
              mb: 1, 
              borderRadius: 2,
              backgroundColor: getBackgroundColor(shift.status),
              border: shift.status === '確定' ? '2px solid #4caf50' : '1px solid #e0e0e0'
            }}
          >
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              minHeight: 40
            }}>
              {/* 左セクション: 基本情報 (40%) */}
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center',
                flex: '0 0 40%',
                borderRight: '1px solid #e0e0e0',
                pr: 1.5,
                position: 'relative'
              }}>
                {/* 日付（固定位置・左寄り） */}
                <Box sx={{ 
                  width: '60px',
                  display: 'flex',
                  justifyContent: 'flex-start'
                }}>
                  <Typography variant="body1" sx={{ fontWeight: 'bold', fontSize: '0.8rem' }}>
                    {shift.date.split('-')[2]}日<br />({shift.dayOfWeek})
                  </Typography>
                </Box>

                {/* 希望記号（固定位置・左寄り） */}
                <Box sx={{ 
                  width: '40px',
                  display: 'flex',
                  justifyContent: 'flex-start'
                }}>
                  <Typography sx={{ 
                    minWidth: 28,
                    height: 28,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                    color: getRequestedStatusColor(shift.requestedStatus),
                    border: '1px solid #e0e0e0',
                    borderRadius: '50%'
                  }}>
                    {shift.requestedStatus}
                  </Typography>
                </Box>

                {/* ステータス（中央揃え・残りスペース使用） */}
                <Box sx={{ 
                  flex: 1,
                  display: 'flex',
                  justifyContent: 'center'
                }}>
                  <Chip
                    label={STATUS_CONFIG[shift.status].label}
                    variant="outlined"
                    color={shift.status === '現場未確定' ? undefined : STATUS_CONFIG[shift.status].color}
                    size="small"
                    sx={{ 
                      fontSize: '0.55rem',
                      height: 20,
                      fontWeight: 'bold',
                      borderWidth: 2,
                      '& .MuiChip-label': { px: 0.3 },
                      ...(shift.status === '現場未確定' && {
                        borderColor: '#C3AF45',
                        color: '#C3AF45'
                      })
                    }}
                  />
                </Box>
              </Box>

              {/* 右セクション: 詳細情報 (60%) */}
              <Box sx={{ pl: 1.5, flex: '0 0 60%' }}>
                {shift.status !== '休み' ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.3 }}>
                    {/* 稼働エリア */}
                    {shift.location && (
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontSize: '0.8rem',
                          fontWeight: 'bold',
                          color: '#1976d2',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        ▶ {shift.location}
                      </Typography>
                    )}
                    
                    {/* 時間と詳細 */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      {shift.startTime && shift.endTime && (
                        <Typography variant="body2" sx={{ fontSize: '0.7rem', fontWeight: 'bold' }}>
                          時間: {shift.startTime}-{shift.endTime}
                        </Typography>
                      )}
                      {shift.status === '確定' && (
                        <Typography variant="caption" color="primary" sx={{ fontSize: '0.6rem' }}>
                          ＞詳細
                        </Typography>
                      )}
                    </Box>
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                    お休み
                  </Typography>
                )}
              </Box>
            </Box>
          </Paper>
        ))}
      </Box>

      <Divider sx={{ my: 3 }} />

      {/* パターン2c-2: 影付き強調型 */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold' }}>
          パターン2c-2: 影付き強調型
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          希望記号は太字のみ、ステータスは影と背景で強調表示
        </Typography>
        
        {testShifts.map((shift, index) => (
          <Paper 
            key={index}
            sx={{ 
              p: 1.5, 
              mb: 1, 
              borderRadius: 2,
              backgroundColor: getBackgroundColor(shift.status),
              border: shift.status === '確定' ? '2px solid #4caf50' : '1px solid #e0e0e0'
            }}
          >
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              minHeight: 40
            }}>
              {/* 左セクション: 基本情報 (40%) */}
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1, 
                flex: '0 0 40%',
                borderRight: '1px solid #e0e0e0',
                pr: 1.5
              }}>
                <Typography variant="body1" sx={{ fontWeight: 'bold', fontSize: '0.8rem', minWidth: 'fit-content' }}>
                  {shift.date.split('-')[2]}日({shift.dayOfWeek})
                </Typography>

                {/* 希望記号（背景色なし、太字のみ） */}
                <Typography sx={{ 
                  minWidth: 24,
                  height: 24,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  color: getRequestedStatusColor(shift.requestedStatus)
                }}>
                  {shift.requestedStatus}
                </Typography>

                {/* ステータス（影付き背景で強調） */}
                <Chip
                  label={STATUS_CONFIG[shift.status].label}
                  color={shift.status === '現場未確定' ? undefined : STATUS_CONFIG[shift.status].color}
                  size="small"
                  sx={{ 
                    fontSize: '0.6rem',
                    height: 24,
                    fontWeight: 'bold',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                    '& .MuiChip-label': { px: 0.4 },
                    ...(shift.status === '現場未確定' && {
                      backgroundColor: '#C3AF45',
                      color: '#ffffff'
                    })
                  }}
                />
              </Box>

              {/* 右セクション: 詳細情報 (60%) */}
              <Box sx={{ pl: 1.5, flex: '0 0 60%' }}>
                {shift.status !== '休み' ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.3 }}>
                    {/* 稼働エリア */}
                    {shift.location && (
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontSize: '0.8rem',
                          fontWeight: 'bold',
                          color: '#1976d2',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        ▶ {shift.location}
                      </Typography>
                    )}
                    
                    {/* 時間と詳細 */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      {shift.startTime && shift.endTime && (
                        <Typography variant="body2" sx={{ fontSize: '0.7rem', fontWeight: 'bold' }}>
                          時間: {shift.startTime}-{shift.endTime}
                        </Typography>
                      )}
                      {shift.status === '確定' && (
                        <Typography variant="caption" color="primary" sx={{ fontSize: '0.6rem' }}>
                          ＞詳細
                        </Typography>
                      )}
                    </Box>
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                    お休み
                  </Typography>
                )}
              </Box>
            </Box>
          </Paper>
        ))}
      </Box>

      <Divider sx={{ my: 3 }} />

      {/* パターン2c-3: 下線強調型 */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold' }}>
          パターン2c-3: 下線強調型
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          希望記号は太字のみ、ステータスは下線で強調表示
        </Typography>
        
        {testShifts.map((shift, index) => (
          <Paper 
            key={index}
            sx={{ 
              p: 1.5, 
              mb: 1, 
              borderRadius: 2,
              backgroundColor: getBackgroundColor(shift.status),
              border: shift.status === '確定' ? '2px solid #4caf50' : '1px solid #e0e0e0'
            }}
          >
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              minHeight: 40
            }}>
              {/* 左セクション: 基本情報 (40%) */}
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1, 
                flex: '0 0 40%',
                borderRight: '1px solid #e0e0e0',
                pr: 1.5
              }}>
                <Typography variant="body1" sx={{ fontWeight: 'bold', fontSize: '0.8rem', minWidth: 'fit-content' }}>
                  {shift.date.split('-')[2]}日({shift.dayOfWeek})
                </Typography>

                {/* 希望記号（背景色なし、太字のみ） */}
                <Typography sx={{ 
                  minWidth: 24,
                  height: 24,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  color: getRequestedStatusColor(shift.requestedStatus)
                }}>
                  {shift.requestedStatus}
                </Typography>

                {/* ステータス（下線で強調） */}
                <Typography
                  variant="body2"
                  sx={{ 
                    fontSize: '0.65rem',
                    fontWeight: 'bold',
                    px: 0.5,
                    py: 0.2,
                    borderBottom: `3px solid ${
                      shift.status === '確定' ? '#4caf50' :
                      shift.status === '詳細未確定' ? '#ff9800' :
                      shift.status === '現場未確定' ? '#C3AF45' : '#f44336'
                    }`,
                    color: 
                      shift.status === '確定' ? '#4caf50' :
                      shift.status === '詳細未確定' ? '#ff9800' :
                      shift.status === '現場未確定' ? '#C3AF45' : '#f44336'
                  }}
                >
                  {STATUS_CONFIG[shift.status].label}
                </Typography>
              </Box>

              {/* 右セクション: 詳細情報 (60%) */}
              <Box sx={{ pl: 1.5, flex: '0 0 60%' }}>
                {shift.status !== '休み' ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.3 }}>
                    {/* 稼働エリア */}
                    {shift.location && (
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontSize: '0.8rem',
                          fontWeight: 'bold',
                          color: '#1976d2',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        ▶ {shift.location}
                      </Typography>
                    )}
                    
                    {/* 時間と詳細 */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      {shift.startTime && shift.endTime && (
                        <Typography variant="body2" sx={{ fontSize: '0.7rem', fontWeight: 'bold' }}>
                          時間: {shift.startTime}-{shift.endTime}
                        </Typography>
                      )}
                      {shift.status === '確定' && (
                        <Typography variant="caption" color="primary" sx={{ fontSize: '0.6rem' }}>
                          ＞詳細
                        </Typography>
                      )}
                    </Box>
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                    お休み
                  </Typography>
                )}
              </Box>
            </Box>
          </Paper>
        ))}
      </Box>

      <Divider sx={{ my: 3 }} />

      {/* パターン2c-4: 左線強調型 */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold' }}>
          パターン2c-4: 左線強調型
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          希望記号は太字のみ、ステータスは左側の色線で強調表示
        </Typography>
        
        {testShifts.map((shift, index) => (
          <Paper 
            key={index}
            sx={{ 
              p: 1.5, 
              mb: 1, 
              borderRadius: 2,
              backgroundColor: getBackgroundColor(shift.status),
              border: shift.status === '確定' ? '2px solid #4caf50' : '1px solid #e0e0e0',
              borderLeft: `4px solid ${
                shift.status === '確定' ? '#4caf50' :
                shift.status === '詳細未確定' ? '#ff9800' :
                shift.status === '現場未確定' ? '#C3AF45' : '#f44336'
              }`
            }}
          >
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              minHeight: 40
            }}>
              {/* 左セクション: 基本情報 (40%) */}
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1, 
                flex: '0 0 40%',
                borderRight: '1px solid #e0e0e0',
                pr: 1.5
              }}>
                <Typography variant="body1" sx={{ fontWeight: 'bold', fontSize: '0.8rem', minWidth: 'fit-content' }}>
                  {shift.date.split('-')[2]}日({shift.dayOfWeek})
                </Typography>

                {/* 希望記号（背景色なし、太字のみ） */}
                <Typography sx={{ 
                  minWidth: 24,
                  height: 24,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  color: getRequestedStatusColor(shift.requestedStatus)
                }}>
                  {shift.requestedStatus}
                </Typography>

                {/* ステータス（シンプルなテキスト） */}
                <Typography
                  variant="body2"
                  sx={{ 
                    fontSize: '0.65rem',
                    fontWeight: 'bold',
                    color: 
                      shift.status === '確定' ? '#4caf50' :
                      shift.status === '詳細未確定' ? '#ff9800' :
                      shift.status === '現場未確定' ? '#C3AF45' : '#f44336'
                  }}
                >
                  {STATUS_CONFIG[shift.status].label}
                </Typography>
              </Box>

              {/* 右セクション: 詳細情報 (60%) */}
              <Box sx={{ pl: 1.5, flex: '0 0 60%' }}>
                {shift.status !== '休み' ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.3 }}>
                    {/* 稼働エリア */}
                    {shift.location && (
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontSize: '0.8rem',
                          fontWeight: 'bold',
                          color: '#1976d2',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        ▶ {shift.location}
                      </Typography>
                    )}
                    
                    {/* 時間と詳細 */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      {shift.startTime && shift.endTime && (
                        <Typography variant="body2" sx={{ fontSize: '0.7rem', fontWeight: 'bold' }}>
                          時間: {shift.startTime}-{shift.endTime}
                        </Typography>
                      )}
                      {shift.status === '確定' && (
                        <Typography variant="caption" color="primary" sx={{ fontSize: '0.6rem' }}>
                          ＞詳細
                        </Typography>
                      )}
                    </Box>
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                    お休み
                  </Typography>
                )}
              </Box>
            </Box>
          </Paper>
        ))}
      </Box>

      {/* 戻るボタン */}
      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Button 
          variant="outlined" 
          onClick={() => window.history.back()}
          sx={{ borderRadius: 2 }}
        >
          戻る
        </Button>
      </Box>
    </Container>
  );
} 