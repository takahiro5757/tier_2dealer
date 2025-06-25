'use client';

import React from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Grid,
  Card,
  CardContent,
  Chip
} from '@mui/material';
import StaffHeader from '@/components/staff/StaffHeader';
import { useRouter } from 'next/navigation';

// WorkDetailの型定義
interface WorkDetail {
  date: string;
  dayOfWeek: string;
  status: '確定' | '現場未確定' | '休み' | '詳細未確定';
  agency?: string;
  location?: string;
  startTime?: string;
  endTime?: string;
  rate?: number;
  managerName?: string;
  managerPhone?: string;
  meetingTime?: string;
  meetingPlace?: string;
  uniform?: string;
  notes?: string;
  communications?: any[];
}

export default function DashboardTestPage() {
  const router = useRouter();

  // テスト用のサンプルデータ
  const testWorkDetails: { work: WorkDetail; title: string }[] = [
    {
      work: {
        date: '2024-06-25',
        dayOfWeek: '火',
        status: '確定',
        agency: 'アリオ株式会社',
        location: 'アリオ上尾',
        startTime: '11:00',
        endTime: '19:00',
        meetingTime: '10:30',
        meetingPlace: '現地集合',
        rate: 15000,
        managerName: '田中マネージャー',
        managerPhone: '090-1234-5678'
      },
      title: '確定ステータス'
    },
    {
      work: {
        date: '2024-06-26',
        dayOfWeek: '水',
        status: '詳細未確定',
        agency: 'サンプル株式会社',
        location: 'ららぽーと豊洲',
        rate: 14500
      },
      title: '詳細未定ステータス'
    },
    {
      work: {
        date: '2024-06-27',
        dayOfWeek: '木',
        status: '現場未確定',
        agency: 'テスト株式会社',
        rate: 15500
      },
      title: '現場未定ステータス'
    },
    {
      work: {
        date: '2024-06-28',
        dayOfWeek: '金',
        status: '休み'
      },
      title: '休みステータス'
    }
  ];

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}月${date.getDate()}日`;
  };

  const handleLogout = () => {
    router.push('/tier-2dealer/staff/login');
  };

  // WorkDetailCardコンポーネント（ダッシュボードと同じもの）
  const WorkDetailCard = ({ work, title }: { work: WorkDetail | null, title: string }) => {
    if (!work) {
      return (
        <Card sx={{ height: 'fit-content', border: '1px solid #f0f0f0', backgroundColor: '#fafafa' }}>
          <CardContent sx={{ pt: 1, px: 1, pb: 0, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', fontSize: '0.93rem', textAlign: 'center', mb: 0.5 }}>
              {title}
            </Typography>
            <Typography variant="body2" sx={{ textAlign: 'center', color: 'text.secondary', fontSize: '0.8rem' }}>
              予定なし
            </Typography>
          </CardContent>
        </Card>
      );
    }

    const hasWork = work.status !== '休み';
    const isClickable = hasWork;

    // ステータス設定（ダッシュボードと同じ）
    const statusConfig: Record<string, { label: string; color: 'success' | 'warning' | 'info' | 'error' | 'default' | 'primary' | 'secondary' }> = {
      '確定': { label: '確定', color: 'success' },
      '現場未確定': { label: '現場未定', color: 'warning' },
      '詳細未確定': { label: '詳細未定', color: 'info' },
      '休み': { label: '休み', color: 'error' }
    };

    const currentStatus = statusConfig[work.status] || { label: work.status, color: 'default' };
    const targetDate = new Date(work.date);

    return (
      <Card 
        sx={{ 
          height: 'fit-content',
          border: hasWork ? '2px solid #e0e0e0' : '1px solid #f0f0f0',
          backgroundColor: hasWork ? '#fff' : '#fafafa',
          cursor: isClickable ? 'pointer' : 'default',
          transition: 'all 0.2s ease',
          '&:hover': isClickable ? {
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            transform: 'translateY(-2px)'
          } : {}
        }}
      >
        <CardContent sx={{ pt: 1, px: 1, pb: 0, display: 'flex', flexDirection: 'column' }}>
          {/* タイトル＋上部左右分割レイアウト */}
          <Box sx={{ mb: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', fontSize: '0.93rem', textAlign: 'center', mb: 0.5 }}>
              {title}
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1 }}>
              {/* 左：日付・曜日 */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '1rem' }}>
                  {formatDate(work.date)}
                </Typography>
                <Typography variant="body2" sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>
                  ({work.dayOfWeek})
                </Typography>
              </Box>
              {/* 右：ステータスChipのみ */}
              <Chip
                label={currentStatus.label}
                variant="outlined"
                color={work.status === '現場未確定' ? undefined : currentStatus.color}
                size="small"
                sx={{
                  fontSize: '0.6rem',
                  height: 24,
                  fontWeight: 'bold',
                  borderWidth: 2,
                  '& .MuiChip-label': { px: 0.4 },
                  ...(work.status === '現場未確定' && {
                    borderColor: '#C3AF45',
                    color: '#C3AF45'
                  })
                }}
              />
            </Box>
          </Box>

          {/* 下部：詳細情報（勤務がある場合のみ） */}
          {work.status === '確定' && (
            <Box sx={{ pt: 0.2, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 0.3, pb: 0 }}>
              {/* 左下：勤務情報まとめて表示 */}
              <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 0.3, pb: 0 }}>
                <Typography variant="body2" sx={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'text.secondary', mb: 0 }}>
                  勤務場所：<span style={{ color: '#222' }}>{work.location || '未定'}</span>
                </Typography>
                <Typography variant="body2" sx={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'text.secondary', mb: 0 }}>
                  勤務時間：<span style={{ color: '#222' }}>{work.startTime && work.endTime ? `${work.startTime}-${work.endTime}` : '未定'}</span>
                </Typography>
                <Typography variant="body2" sx={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'text.secondary', mb: 0 }}>
                  集　　合：<span style={{ color: '#222' }}>{(work.meetingTime || work.meetingPlace) ? `${work.meetingTime || ''} ${work.meetingPlace || ''}`.trim() : '未定'}</span>
                </Typography>
              </Box>
              {/* 右端：詳細タップ */}
              <Box sx={{ textAlign: 'right', minWidth: 'fit-content', pb: 0 }}>
                <Typography variant="body2" color="primary" sx={{ fontSize: '0.7rem', fontWeight: 'bold', mb: 0 }}>
                  詳細
                </Typography>
                <Typography variant="body2" sx={{ fontSize: '0.65rem', color: 'text.secondary', mb: 0 }}>
                  タップ
                </Typography>
              </Box>
            </Box>
          )}
          {work.status === '詳細未確定' && (
            <Box sx={{ pt: 0.2, display: 'flex', alignItems: 'flex-start', gap: 0.3 }}>
              {/* 左下：勤務場所のみ */}
              <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 0.1 }}>
                <Typography variant="body2" sx={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'text.secondary' }}>
                  勤務場所：<span style={{ color: '#222' }}>{work.location || '未定'}</span>
                </Typography>
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      {/* ヘッダー */}
      <StaffHeader 
        userName="テストユーザー"
        userRole="スタッフ"
        title="ダッシュボードテスト"
        currentPage="dashboard"
        onLogout={handleLogout}
      />

      <Container maxWidth="md" sx={{ py: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2, textAlign: 'center' }}>
          カードデザインテスト
        </Typography>
        
        <Typography variant="body1" sx={{ mb: 3, textAlign: 'center', color: 'text.secondary' }}>
          すべてのステータスのカードデザインを確認できます
        </Typography>

        {/* テストカード一覧 */}
        <Grid container spacing={2}>
          {testWorkDetails.map((item, index) => (
            <Grid item xs={12} md={6} key={index}>
              <WorkDetailCard work={item.work} title={item.title} />
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
} 