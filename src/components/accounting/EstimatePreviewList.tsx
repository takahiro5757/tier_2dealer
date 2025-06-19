'use client';

import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

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

interface EstimatePreviewListProps {
  estimates: Estimate[];
  selectedEstimate: Estimate | null;
  expandedAccordions: Record<string, boolean>;
  onEstimateSelect: (estimate: Estimate) => void;
  onAccordionToggle: (key: string) => void;
}

export default function EstimatePreviewList({
  estimates,
  selectedEstimate,
  expandedAccordions,
  onEstimateSelect,
  onAccordionToggle
}: EstimatePreviewListProps) {
  // 代理店ごとにグループ化
  const groupedEstimates = estimates.reduce<Record<string, Estimate[]>>((acc, estimate) => {
    if (!acc[estimate.agencyName]) acc[estimate.agencyName] = [];
    acc[estimate.agencyName].push(estimate);
    return acc;
  }, {});

  return (
    <>
      {Object.entries(groupedEstimates).map(([agencyName, agencyEstimates]) => {
        // 送付先ごとにグループ化
        const groupedByMainStore = agencyEstimates.reduce<Record<string, Estimate[]>>((acc, estimate) => {
          const mainStoreKey = estimate.mainStoreNames.join(', ');
          if (!acc[mainStoreKey]) acc[mainStoreKey] = [];
          acc[mainStoreKey].push(estimate);
          return acc;
        }, {});

        return (
          <Box key={agencyName} sx={{ mb: 3 }}>
            {/* 代理店名 */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Box sx={{ width: 4, height: 24, bgcolor: '#1976d2', mr: 1 }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#333' }}>
                {agencyName}
              </Typography>
            </Box>
            
            {/* 送付先ごとのアコーディオンリスト */}
            {Object.entries(groupedByMainStore).map(([mainStoreKey, estimates]) => (
              <Accordion
                key={`${agencyName}-${mainStoreKey}`}
                expanded={expandedAccordions[`${agencyName}-${mainStoreKey}`] || false}
                onChange={() => {}} // 自動展開を無効化
                sx={{
                  mb: 1,
                  border: selectedEstimate && estimates.some(est => est.id === selectedEstimate.id) 
                    ? '2px solid #1976d2' 
                    : '1px solid #e0e0e0',
                  backgroundColor: selectedEstimate && estimates.some(est => est.id === selectedEstimate.id)
                    ? '#e3f2fd'
                    : 'transparent',
                  '&:before': {
                    display: 'none',
                  },
                  boxShadow: 'none',
                  '&.Mui-expanded': {
                    margin: '0 0 8px 0',
                  },
                }}
              >
                <AccordionSummary
                  expandIcon={
                    <ExpandMoreIcon 
                      onClick={(e) => {
                        e.stopPropagation();
                        onAccordionToggle(`${agencyName}-${mainStoreKey}`);
                      }}
                    />
                  }
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
                    cursor: 'pointer',
                  }}
                  onClick={(e) => {
                    // リスト自体がクリックされた場合はメール情報プレビュー表示のみ
                    e.stopPropagation();
                    onEstimateSelect(estimates[0]);
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                    {mainStoreKey}
                  </Typography>
                </AccordionSummary>
                
                <AccordionDetails>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {estimates.map((estimate) => (
                      <Box key={estimate.id} sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        {/* 店舗アドレス */}
                        {estimate.coStoreNames.length > 0 && (
                          <Typography variant="caption" color="text.secondary">
                            <strong>店舗アドレス:</strong> {estimate.coStoreNames.join(', ')}
                          </Typography>
                        )}
                        {/* ファイル名（クリック可能） */}
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            color: 'primary.main',
                            cursor: 'pointer',
                            textDecoration: 'underline',
                            '&:hover': {
                              color: 'primary.dark'
                            }
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            onEstimateSelect(estimate);
                          }}
                        >
                          📄 {estimate.fileName}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        );
      })}
    </>
  );
} 