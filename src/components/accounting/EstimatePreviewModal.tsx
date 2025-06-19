'use client';

import {
  Box,
  Typography,
  Modal,
  Paper,
  IconButton
} from '@mui/material';
import CancelIcon from '@mui/icons-material/Cancel';

// 見積品目の型定義
interface EstimateItem {
  id: number;
  eventDate: string;
  itemName: string;
  unitPrice: number;
  quantity: number;
  amount: number;
  taxType: 'taxable' | 'tax-free';
}

// 見積データの型定義
interface Estimate {
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
  items: EstimateItem[];
}

interface EstimatePreviewModalProps {
  open: boolean;
  estimate: Estimate | null;
  onClose: () => void;
}

export default function EstimatePreviewModal({
  open,
  estimate,
  onClose
}: EstimatePreviewModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Paper sx={{ 
        width: '90%', 
        height: '90%', 
        p: 3,
        outline: 'none',
        overflow: 'auto'
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">見積書プレビュー</Typography>
          <IconButton onClick={onClose}>
            <CancelIcon />
          </IconButton>
        </Box>
        {estimate ? (
          <Box sx={{ 
            height: 'calc(100% - 60px)', 
            backgroundColor: '#f5f5f5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 1,
            backgroundImage: `linear-gradient(45deg, #f5f5f5 25%, transparent 25%), 
                            linear-gradient(-45deg, #f5f5f5 25%, transparent 25%), 
                            linear-gradient(45deg, transparent 75%, #f5f5f5 75%), 
                            linear-gradient(-45deg, transparent 75%, #f5f5f5 75%)`,
            backgroundSize: '20px 20px',
            backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
          }}>
            {/* 見積書のイメージ（拡大版） */}
            <Box sx={{ 
              width: '70%', 
              height: '95%', 
              backgroundColor: '#fff',
              border: '2px solid #ddd',
              borderRadius: 1,
              boxShadow: '0 8px 16px rgba(0,0,0,0.15)',
              display: 'flex',
              flexDirection: 'column',
              p: 4,
              position: 'relative',
              aspectRatio: '210/297' // A4の比率
            }}>
              {/* ヘッダー部分 */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                {/* 左側：会社ロゴエリア */}
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ 
                    width: 80, 
                    height: 80, 
                    background: 'linear-gradient(45deg, #ff6b35, #f7931e, #ffd100, #8bc34a, #2196f3, #9c27b0)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mr: 2
                  }}>
                    <Typography sx={{ color: 'white', fontWeight: 'bold', fontSize: '1.2rem' }}>
                      LOGO
                    </Typography>
                  </Box>
                </Box>
                
                {/* 右側：日付と見積書タイトル */}
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="body1" sx={{ display: 'block', mb: 1 }}>
                    2025/04/24
                  </Typography>
                  <Typography variant="h3" sx={{ fontWeight: 'bold', borderBottom: '4px solid #1976d2', pb: 1 }}>
                    御見積書
                  </Typography>
                  <Box sx={{ 
                    border: '3px solid #d32f2f', 
                    width: 120, 
                    height: 120, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    mt: 2,
                    ml: 'auto'
                  }}>
                    <Typography sx={{ fontSize: '1rem', color: '#d32f2f', fontWeight: 'bold', textAlign: 'center' }}>
                      印鑑<br/>エリア
                    </Typography>
                  </Box>
                </Box>
              </Box>
              
              {/* 会社情報 */}
              <Box sx={{ textAlign: 'right', mb: 3 }}>
                <Typography variant="body1" sx={{ fontSize: '1rem', display: 'block' }}>
                  株式会社ANSTYPE
                </Typography>
                <Typography variant="body1" sx={{ fontSize: '1rem', display: 'block' }}>
                  〒334-0067 埼玉県春日部市中央1丁目2-7F
                </Typography>
                <Typography variant="body1" sx={{ fontSize: '1rem', display: 'block' }}>
                  代表 荒川昭美
                </Typography>
              </Box>
              
              {/* 宛先 */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  {estimate.agencyName} 御中
                </Typography>
              </Box>
              
              {/* 合計金額ボックス */}
              <Box sx={{ 
                border: '3px solid #1976d2', 
                p: 2, 
                mb: 3, 
                backgroundColor: '#e3f2fd',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                  合計金額<br/>（税込金額）
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                  ¥{estimate.totalAmount.toLocaleString()}
                </Typography>
              </Box>
              
              {/* 見積番号 */}
              <Box sx={{ textAlign: 'right', mb: 3 }}>
                <Typography variant="body1" sx={{ fontSize: '1.1rem' }}>
                  見積番号：T80300011358591
                </Typography>
              </Box>
              
              {/* 明細テーブル */}
              <Box sx={{ flex: 1, mb: 3 }}>
                {/* テーブルヘッダー */}
                <Box sx={{ 
                  display: 'grid', 
                  gridTemplateColumns: '120px 1fr 100px 80px 120px',
                  backgroundColor: '#1976d2',
                  color: 'white',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  p: 1
                }}>
                  <Box>納期予定日</Box>
                  <Box>品目名</Box>
                  <Box>単価(円)</Box>
                  <Box>数(回)</Box>
                  <Box>金額(円)</Box>
                </Box>
                
                {/* テーブル行 */}
                {estimate.items.slice(0, 2).map((item, index) => (
                  <Box key={index} sx={{ 
                    display: 'grid', 
                    gridTemplateColumns: '120px 1fr 100px 80px 120px',
                    backgroundColor: index % 2 === 0 ? '#f5f5f5' : '#fff',
                    fontSize: '0.9rem',
                    p: 1,
                    borderBottom: '1px solid #ddd'
                  }}>
                    <Box>3/1,3/2</Box>
                    <Box>{item.itemName}</Box>
                    <Box>{item.unitPrice.toLocaleString()}</Box>
                    <Box>{item.quantity}</Box>
                    <Box>{item.amount.toLocaleString()}</Box>
                  </Box>
                ))}
                
                {/* 空行 */}
                {Array.from({ length: 8 }).map((_, index) => (
                  <Box key={`empty-${index}`} sx={{ 
                    display: 'grid', 
                    gridTemplateColumns: '120px 1fr 100px 80px 120px',
                    backgroundColor: (index + 2) % 2 === 0 ? '#f5f5f5' : '#fff',
                    fontSize: '0.9rem',
                    p: 1,
                    borderBottom: '1px solid #ddd',
                    minHeight: '40px'
                  }}>
                    <Box></Box>
                    <Box></Box>
                    <Box></Box>
                    <Box></Box>
                    <Box>0</Box>
                  </Box>
                ))}
              </Box>
              
              {/* フッター計算部分 */}
              <Box sx={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr 150px 120px',
                gap: 1,
                fontSize: '1rem',
                backgroundColor: '#1976d2',
                color: 'white',
                p: 1
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography sx={{ fontSize: '0.9rem' }}>
                    振込期日: 2025年04月末日　課税小計 (10%対象)　120,000
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography sx={{ fontSize: '0.9rem' }}>非課税</Typography>
                  <Typography sx={{ fontSize: '0.9rem' }}>消費税</Typography>
                  <Typography sx={{ fontSize: '0.9rem', fontWeight: 'bold' }}>合計</Typography>
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography sx={{ fontSize: '0.9rem' }}>0</Typography>
                  <Typography sx={{ fontSize: '0.9rem' }}>12,000</Typography>
                  <Typography sx={{ fontSize: '0.9rem', fontWeight: 'bold' }}>132,000</Typography>
                </Box>
              </Box>
              
              {/* 最下部情報 */}
              <Box sx={{ mt: 2, fontSize: '0.9rem', color: '#666' }}>
                <Typography sx={{ fontSize: '0.9rem' }}>
                  埼玉りそな銀行 春日部支店 普通4338463
                </Typography>
              </Box>
            </Box>
          </Box>
        ) : (
          <Box sx={{ 
            height: 'calc(100% - 60px)', 
            backgroundColor: '#fff', 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 1,
            border: '1px dashed #ccc'
          }}>
            <Typography variant="body1" color="text.secondary">
              見積を選択してください
            </Typography>
          </Box>
        )}
      </Paper>
    </Modal>
  );
} 