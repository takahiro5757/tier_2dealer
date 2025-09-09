# Ansteype側通知UI設計仕様書

## 概要

2次店（Festal）システムから受信する通知を表示するためのUI設計仕様書です。  
ユーザビリティと視認性を重視し、効率的な通知管理を実現することを目的とします。

---

## 1. 全体レイアウト設計

### 1.1 通知アクセスポイント

**配置**: メインヘッダー右側  
**要素**: 
- 通知ベルアイコン
- 未読件数バッジ（赤色、数字表示）
- ホバー・アクティブ状態の視覚フィードバック

**サイズ・スペーシング**:
```css
.notification-trigger {
  width: 40px;
  height: 40px;
  margin-left: 8px;
  position: relative;
}

.notification-badge {
  position: absolute;
  top: -8px;
  right: -8px;
  min-width: 20px;
  height: 20px;
  border-radius: 10px;
  background: #f44336;
  color: white;
  font-size: 12px;
  font-weight: bold;
}
```

### 1.2 通知ドロワー

**表示方式**: 右からスライドイン  
**サイズ**: 幅400px、高さ画面フル  
**背景**: 半透明オーバーレイ（rgba(0,0,0,0.5)）

---

## 2. 通知一覧UI設計

### 2.1 ヘッダー部分

```
┌─────────────────────────────────────┐
│ 🔔 通知 (3)                    ✕ │
├─────────────────────────────────────┤
│ [全て] [未読のみ] [シフト提出] [変更依頼] [承認済み] │
└─────────────────────────────────────┘
```

**UI要素**:
- タイトル（未読件数表示）
- 閉じるボタン
- フィルターボタン群

**実装例**:
```tsx
const NotificationHeader = () => (
  <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
      <Typography variant="h6">
        🔔 通知 ({unreadCount})
      </Typography>
      <IconButton onClick={onClose}>
        <Close />
      </IconButton>
    </Box>
    
    <Stack direction="row" spacing={1}>
      <Chip label="全て" color={filter === 'all' ? 'primary' : 'default'} />
      <Chip label="未読のみ" color={filter === 'unread' ? 'primary' : 'default'} />
      <Chip label="シフト提出" color={filter === 'submission' ? 'primary' : 'default'} />
      <Chip label="変更依頼" color={filter === 'change' ? 'primary' : 'default'} />
      <Chip label="承認済み" color={filter === 'approved' ? 'primary' : 'default'} />
    </Stack>
  </Box>
);
```

### 2.2 通知アイテム設計

#### 2.2.1 シフト一括提出通知

```
┌─────────────────────────────────────┐
│ 📋 シフト一括提出          [未読●] │
│ Festalから2025年4月のシフト一括提出  │
│ (23名分)                           │
│ Festal                  1時間前    │
└─────────────────────────────────────┘
```

**視覚的要素**:
- アイコン: 📋 (Assignment) - 青色
- 未読状態: 右上に青い丸
- 背景色: 未読時は薄い青、既読時は白
- ボーダー: 左側に青色のアクセントライン

#### 2.2.2 シフト変更依頼通知

```
┌─────────────────────────────────────┐
│ ⏰ シフト変更依頼           [未読●] │
│ Festalから2025年4月のシフト変更依頼  │
│ (3名、5件の変更)                    │
│ Festal                  30分前     │
└─────────────────────────────────────┘
```

**視覚的要素**:
- アイコン: ⏰ (Schedule) - オレンジ色
- 未読状態: 右上にオレンジ色の丸
- 背景色: 未読時は薄いオレンジ、既読時は白
- ボーダー: 左側にオレンジ色のアクセントライン

#### 2.2.3 承認・却下通知

```
┌─────────────────────────────────────┐
│ ✅ 承認完了               [既読] │
│ シフト変更依頼が承認されました        │
│ System                  1日前     │
└─────────────────────────────────────┘
```

**視覚的要素**:
- アイコン: ✅ (CheckCircle) - 緑色、❌ (Cancel) - 赤色
- 未読状態: 右上に対応色の丸
- 背景色: 未読時は薄い緑/赤、既読時は白
- ボーダー: 左側に緑/赤色のアクセントライン

### 2.4 通知種類別の色分けシステム

| 通知タイプ | アイコン | 色 | 用途 |
|-----------|---------|---|------|
| シフト一括提出 | 📋 Assignment | 青色 (#1976d2) | Festalからの一括提出通知 |
| シフト変更依頼 | ⏰ Schedule | オレンジ色 (#ed6c02) | 個別変更依頼通知 |
| 承認完了 | ✅ CheckCircle | 緑色 (#2e7d32) | 処理完了（承認）通知 |
| 却下完了 | ❌ Cancel | 赤色 (#d32f2f) | 処理完了（却下）通知 |

### 2.5 未読・既読の視覚的表現

#### 未読状態の特徴
- **背景色**: 対応色の薄いトーン（例: 青系の場合 rgba(25, 118, 210, 0.04)）
- **左側ボーダー**: 太い色付きライン（4px）
- **未読マーク**: 右上に8px×8pxの色付き円
- **ホバー効果**: 背景色がやや濃くなる

#### 既読状態の特徴
- **背景色**: 白色
- **左側ボーダー**: 薄い色付きライン（2px）
- **未読マーク**: なし
- **ホバー効果**: 薄いグレー背景

### 2.3 通知アイテム実装

```tsx
const NotificationItem = ({ notification }) => {
  const getIcon = (type) => {
    switch (type) {
      case 'shift_bulk_submission': return <Assignment color="primary" />;
      case 'change_request': return <Schedule color="warning" />;
      case 'approval': return <CheckCircle color="success" />;
      case 'rejection': return <Cancel color="error" />;
      default: return <Notifications />;
    }
  };

  const getAccentColor = (type) => {
    switch (type) {
      case 'shift_bulk_submission': return '#1976d2';
      case 'change_request': return '#ed6c02';
      case 'approval': return '#2e7d32';
      case 'rejection': return '#d32f2f';
      default: return '#757575';
    }
  };

  return (
    <Card 
      sx={{ 
        mb: 1, 
        backgroundColor: notification.isRead ? 'white' : 'rgba(25, 118, 210, 0.04)',
        borderLeft: `4px solid ${getAccentColor(notification.type)}`,
        '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' }
      }}
    >
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
          {getIcon(notification.type)}
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="subtitle2" color="text.primary">
                {getTypeLabel(notification.type)}
              </Typography>
              {!notification.isRead && (
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: getAccentColor(notification.type) }} />
              )}
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {notification.message}
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="caption" color="text.secondary">
                {notification.companyName}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {formatRelativeTime(notification.timestamp)}
              </Typography>
            </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};
```

---

## 3. 通知詳細ダイアログ設計

### 3.1 シフト変更依頼詳細ダイアログ

```
┌─────────────────────────────────────────────────────────┐
│ シフト変更依頼詳細                                 ✕ │
├─────────────────────────────────────────────────────────┤
│ ⏰ 2025年4月のシフト変更依頼                            │
│                                                         │
│ 📅 対象月: 2025年4月                                    │
│ 🕒 依頼日時: 2025-01-27 14:45                          │
│ 📊 変更概要: 3名のスタッフ、計5件の変更                  │
│ 📝 変更理由: イベント会場の変更により人員調整が必要       │
│                                                         │
│ ┌─ 変更内容詳細（スタッフ単位承認） ──────────────┐       │
│ │ 田中太郎 [保留中]                 [承認] [却下]  │       │
│ │   4月15日: ○ → × (シフト希望)                    │       │
│ │   4月20日: △ → ○ (シフト希望)                    │       │
│ │   要望: 15 → 18                                   │       │
│ │                                                   │       │
│ │ 佐藤花子 [承認済み] ✅ 2025-01-27 16:00          │       │
│ │   要望: 6 → 8                                     │       │
│ │                                                   │       │
│ │ 山田次郎 [保留中]                 [承認] [却下]  │       │
│ │   4月10日: × → ○ (シフト希望)                    │       │
│ │   要望: 10 → 12                                   │       │
│ │                                                   │       │
│ └───────────────────────────────────────────────┘       │
│                                                         │
│ 全体ステータス: 部分承認 (承認:1 却下:0 保留:2)      │
│                                                         │
│ 承認者コメント入力欄（依頼全体に対するコメント）         │
│ ┌─────────────────────────────────────────────┐       │
│ │                                                 │       │
│ └─────────────────────────────────────────────┘       │
│                                                         │
│ [一括承認] [一括却下] [閉じる]                           │
└─────────────────────────────────────────────────────────┘
```

### 3.2 一括承認・一括却下機能

一括承認・一括却下ボタンは **pending状態のスタッフのみ** を対象とします：

```
一括承認の運用例：
スタッフA: rejected (個別却下済み) ← 対象外
スタッフB: pending (保留中) ← 一括承認対象
スタッフC: pending (保留中) ← 一括承認対象

[一括承認]クリック後
→ スタッフB・C のみ approved に変更
→ 全体ステータス: mixed (承認と却下が混在)

一括却下の運用例：
スタッフA: approved (個別承認済み) ← 対象外
スタッフB: pending (保留中) ← 一括却下対象
スタッフC: pending (保留中) ← 一括却下対象

[一括却下]クリック後
→ スタッフB・C のみ rejected に変更
→ 全体ステータス: mixed (承認と却下が混在)
```

### 3.3 メインダイアログ構造

```tsx
const ChangeRequestDetailDialog: React.FC<{
  open: boolean;
  changeRequest: ChangeRequestData;
  onClose: () => void;
}> = ({ open, changeRequest, onClose }) => {
  const [overallComment, setOverallComment] = useState(changeRequest.approverComment || '');
  
  const handleGlobalCommentUpdate = async () => {
    // 依頼全体のコメントを更新
    await updateChangeRequestComment(changeRequest.id, overallComment);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>シフト変更依頼詳細</DialogTitle>
      <DialogContent>
        {/* 基本情報表示 */}
        <Box sx={{ mb: 3 }}>
          <Typography>対象月: {changeRequest.targetYear}年{changeRequest.targetMonth}月</Typography>
          <Typography>変更理由: {changeRequest.reason}</Typography>
          <Typography>全体ステータス: {getStatusLabel(changeRequest.status)}</Typography>
        </Box>
        
        {/* スタッフ単位の変更内容表示・個別操作 */}
        {changeRequest.staffChanges.map((staffChange) => (
          <StaffChangeApproval
            key={staffChange.staffId}
            staffChange={staffChange}
            onApprove={(staffId) => handleIndividualApprove(staffId)}
            onReject={(staffId) => handleIndividualReject(staffId)}
          />
        ))}
        
        {/* 依頼全体の承認者コメント入力欄 */}
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            承認者コメント（依頼全体）
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="この変更依頼全体に対するコメント"
            value={overallComment}
            onChange={(e) => setOverallComment(e.target.value)}
            onBlur={handleGlobalCommentUpdate}
          />
        </Box>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={() => handleBulkApprove(overallComment)}>一括承認</Button>
        <Button onClick={() => handleBulkReject(overallComment)} color="error">一括却下</Button>
        <Button onClick={onClose}>閉じる</Button>
      </DialogActions>
    </Dialog>
  );
};
```

### 3.4 スタッフ単位承認コンポーネント

```tsx
const StaffChangeApproval: React.FC<{
  staffChange: StaffChangeData;
  onApprove: (staffId: string) => void; // 個別承認
  onReject: (staffId: string) => void; // 個別却下
}> = ({ staffChange, onApprove, onReject }) => {
  const [showRejectDialog, setShowRejectDialog] = useState(false);

  const getStatusChip = (status: string) => {
    const config = {
      pending: { label: '保留中', color: 'default' as const },
      approved: { label: '承認済み', color: 'success' as const },
      rejected: { label: '却下', color: 'error' as const }
    };
    return <Chip {...config[status]} size="small" />;
  };

  return (
    <Card sx={{ mb: 2, p: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="subtitle1" fontWeight="bold">
          {staffChange.staffName}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {getStatusChip(staffChange.status)}
          {staffChange.status === 'pending' && (
            <>
              <Button
                size="small"
                variant="contained"
                color="success"
                onClick={() => onApprove(staffChange.staffId)}
              >
                承認
              </Button>
              <Button
                size="small"
                variant="outlined"
                color="error"
                onClick={() => setShowRejectDialog(true)}
              >
                却下
              </Button>
            </>
          )}
          {staffChange.approvedAt && (
            <Typography variant="caption" color="text.secondary">
              {new Date(staffChange.approvedAt).toLocaleString()}
            </Typography>
          )}
        </Box>
      </Box>
      
      {/* 変更内容表示 */}
      {staffChange.changes.map((change, index) => (
        <Typography key={index} variant="body2" sx={{ ml: 2, mb: 0.5 }}>
          {change.date ? `${change.date}: ` : ''}
          {change.oldValue} → {change.newValue} ({change.field === 'status' ? 'シフト希望' : '要望'})
        </Typography>
      ))}
      
      {/* 承認者コメントは依頼全体で管理されるため、スタッフ単位では表示しない */}
      
      {/* 却下ダイアログ */}
      <Dialog open={showRejectDialog} onClose={() => setShowRejectDialog(false)}>
        <DialogTitle>変更内容の却下</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            {staffChange.staffName}さんの変更内容を却下しますか？
          </Typography>
          <Typography variant="body2" color="text.secondary">
            ※ 却下理由は依頼全体のコメント欄に入力してください
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowRejectDialog(false)}>キャンセル</Button>
          <Button
            onClick={() => {
              onReject(staffChange.staffId); // 個別却下（コメントは依頼全体で管理）
              setShowRejectDialog(false);
            }}
            color="error"
          >
            却下
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

// 一括承認ダイアログコンポーネント
const BulkApprovalDialog: React.FC<{
  open: boolean;
  pendingCount: number;
  onClose: () => void;
  onConfirm: (comment?: string) => void;
}> = ({ open, pendingCount, onClose, onConfirm }) => {
  const [comment, setComment] = useState('');

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>一括承認の確認</DialogTitle>
      <DialogContent>
        <Typography variant="body2" sx={{ mb: 2 }}>
          保留中の{pendingCount}件のスタッフ変更を一括で承認しますか？
        </Typography>
        <Alert severity="info" sx={{ mb: 2 }}>
          既に承認済み・却下済みのスタッフは対象外です
        </Alert>
        <TextField
          fullWidth
          multiline
          rows={3}
          label="承認者コメント（任意）"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>キャンセル</Button>
        <Button
          onClick={() => {
            onConfirm(comment || undefined);
            onClose();
            setComment('');
          }}
          variant="contained"
          color="success"
        >
          一括承認
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// 一括却下ダイアログコンポーネント
const BulkRejectDialog: React.FC<{
  open: boolean;
  pendingCount: number;
  onClose: () => void;
  onConfirm: (comment: string) => void;
}> = ({ open, pendingCount, onClose, onConfirm }) => {
  const [comment, setComment] = useState('');

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>一括却下の確認</DialogTitle>
      <DialogContent>
        <Typography variant="body2" sx={{ mb: 2 }}>
          保留中の{pendingCount}件のスタッフ変更を一括で却下しますか？
        </Typography>
        <Alert severity="warning" sx={{ mb: 2 }}>
          既に承認済み・却下済みのスタッフは対象外です
        </Alert>
        <TextField
          fullWidth
          multiline
          rows={3}
          label="却下理由（必須）"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          required
          error={!comment.trim()}
          helperText={!comment.trim() ? "却下理由は必須です" : ""}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>キャンセル</Button>
        <Button
          onClick={() => {
            if (comment.trim()) {
              onConfirm(comment);
              onClose();
              setComment('');
            }
          }}
          variant="contained"
          color="error"
          disabled={!comment.trim()}
        >
          一括却下
        </Button>
      </DialogActions>
    </Dialog>
  );
};
```

---

## 4. レスポンシブ対応

### 4.1 デスクトップ (1200px以上)

- 通知ドロワー幅: 400px
- 詳細ダイアログ: 800px × 600px
- カレンダー表示: 7列グリッド

### 4.2 タブレット (768px - 1199px)

- 通知ドロワー幅: 350px
- 詳細ダイアログ: 90vw × 80vh
- カレンダー表示: 7列グリッド（縮小）

### 4.3 スマートフォン (767px以下)

- 通知ドロワー: 全画面表示
- 詳細ダイアログ: 全画面モーダル
- カレンダー表示: スクロール可能な横並び

```css
@media (max-width: 767px) {
  .notification-drawer {
    width: 100vw;
    height: 100vh;
  }
  
  .notification-detail-dialog {
    width: 100vw;
    height: 100vh;
    max-width: none;
    max-height: none;
    margin: 0;
    border-radius: 0;
  }
  
  .shift-calendar {
    overflow-x: auto;
    white-space: nowrap;
  }
}
```

---

## 5. アニメーション・インタラクション

### 5.1 通知ドロワーアニメーション

```css
.notification-drawer-enter {
  transform: translateX(100%);
  opacity: 0;
}

.notification-drawer-enter-active {
  transform: translateX(0);
  opacity: 1;
  transition: transform 300ms ease-out, opacity 300ms ease-out;
}

.notification-drawer-exit {
  transform: translateX(0);
  opacity: 1;
}

.notification-drawer-exit-active {
  transform: translateX(100%);
  opacity: 0;
  transition: transform 300ms ease-in, opacity 300ms ease-in;
}
```

### 5.2 新着通知アニメーション

```css
@keyframes notification-pulse {
  0% { background-color: rgba(25, 118, 210, 0.1); }
  50% { background-color: rgba(25, 118, 210, 0.2); }
  100% { background-color: rgba(25, 118, 210, 0.1); }
}

.notification-new {
  animation: notification-pulse 2s ease-in-out infinite;
}
```

### 5.3 ホバー・フォーカス効果

```css
.notification-item:hover {
  background-color: rgba(0, 0, 0, 0.04);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 200ms ease-out;
}

.notification-trigger:hover {
  background-color: rgba(0, 0, 0, 0.04);
  transform: scale(1.1);
  transition: all 200ms ease-out;
}
```

---

## 6. アクセシビリティ対応

### 6.1 キーボード操作

- **Tab**: 通知間の移動
- **Enter/Space**: 通知詳細を開く
- **Escape**: ドロワー・ダイアログを閉じる
- **矢印キー**: リスト内の移動

### 6.2 スクリーンリーダー対応

```tsx
const NotificationItem = ({ notification }) => (
  <div
    role="listitem"
    tabIndex={0}
    aria-label={`${getTypeLabel(notification.type)}通知。${notification.message}。${notification.isRead ? '既読' : '未読'}。${formatRelativeTime(notification.timestamp)}`}
    aria-describedby={`notification-${notification.id}-details`}
  >
    {/* 通知内容 */}
  </div>
);
```

### 6.3 カラーコントラスト

- **AA準拠**: 最小4.5:1のコントラスト比
- **色だけに依存しない**: アイコンとテキストの併用
- **ハイコントラストモード**: システム設定に応じた調整

---

## 7. パフォーマンス最適化

### 7.1 仮想スクロール

```tsx
import { FixedSizeList as List } from 'react-window';

const VirtualNotificationList = ({ notifications }) => (
  <List
    height={600}
    itemCount={notifications.length}
    itemSize={80}
    itemData={notifications}
  >
    {({ index, style, data }) => (
      <div style={style}>
        <NotificationItem notification={data[index]} />
      </div>
    )}
  </List>
);
```

### 7.2 メモ化とコンポーネント最適化

```tsx
const MemoizedNotificationItem = React.memo(NotificationItem, (prevProps, nextProps) => {
  return prevProps.notification.id === nextProps.notification.id &&
         prevProps.notification.isRead === nextProps.notification.isRead;
});
```

### 7.3 画像最適化

- アイコンのSVG使用
- 遅延読み込み（必要に応じて）
- アイコンフォントの事前読み込み

---

## 8. 多言語対応（将来拡張）

### 8.1 テキストリソース管理

```typescript
const translations = {
  ja: {
    notifications: '通知',
    shift_submission: 'シフト提出',
    change_request: 'シフト変更依頼',
    approval: '承認完了',
    rejection: '却下',
    mark_all_read: '全て既読にする',
    clear_all: '全て削除'
  },
  en: {
    notifications: 'Notifications',
    shift_submission: 'Shift Submission',
    change_request: 'Change Request',
    approval: 'Approved',
    rejection: 'Rejected',
    mark_all_read: 'Mark All as Read',
    clear_all: 'Clear All'
  }
};
```

### 8.2 日付・時刻フォーマット

```typescript
const formatDateTime = (date: Date, locale: string) => {
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};
```

---

## 5. 操作フロー・使用シナリオ

### 5.1 通知表示の基本フロー

```
AdminHeader の 🔔(3) をクリック
    ↓
右側からドロワーがスライドイン（400px幅）
    ↓
フィルターで通知種類を絞り込み
    ↓
通知アイテムをクリックして詳細表示
    ↓
必要に応じて承認・却下処理を実行
    ↓
ドロワーを閉じてメイン画面に戻る
```

### 5.2 全体レイアウトイメージ

```
┌──────────────────────────────┬─────────────────┐
│                              │ 🔔 通知 (3)  ✕│
│                              ├─────────────────┤
│     メインコンテンツ           │[全て][未読][提出][依頼]│
│    （シフト管理画面等）         ├─────────────────┤
│                              │📋 シフト一括提出 ●│
│                              │Festal 23名分    │
│                              │1時間前          │
│                              ├─────────────────┤
│                              │⏰ シフト変更依頼 ●│
│                              │Festal 3名5件    │
│                              │30分前          │
│                              ├─────────────────┤
│                              │✅ 承認完了      │
│                              │変更依頼承認済み  │
│                              │1日前           │
│                              └─────────────────┘
```

### 5.3 使用シナリオ詳細

#### シナリオ1: 2次店からシフト一括提出
```
1. Festal管理者が23名分のシフトを一括提出
   ↓
2. Ansteype側のAdminHeaderに通知バッジ (1) が表示
   ↓
3. 管理者が通知アイコンをクリック
   ↓
4. 通知一覧で確認：
   「📋 Festalから2025年4月のシフト一括提出 (23名分)」
   ↓
5. 必要に応じて通知内容を確認
```

#### シナリオ2: シフト変更依頼の処理
```
1. Festal管理者が3名のシフト変更依頼を送信
   ↓
2. 通知一覧に表示：
   「⏰ Festalから2025年4月のシフト変更依頼 (3名、5件の変更)」
   ↓
3. 管理者が通知をクリック → 変更依頼詳細ダイアログが開く
   ↓
4. スタッフ単位で承認・却下を実行
   ↓
5. 依頼全体にコメントを入力
   ↓
6. 処理完了後、Festal側に結果通知
```

### 5.4 フィルター機能詳細

- **[全て]**: 全ての通知を時系列順で表示
- **[未読のみ]**: 未読通知のみを表示（新着順）
- **[シフト提出]**: 一括提出通知のみ表示
- **[変更依頼]**: 変更依頼通知のみ表示
- **[承認済み]**: 承認・却下完了通知のみ表示

### 5.5 通知の優先度・並び順

1. **未読通知が既読通知より上位**
2. **同一読取状態内では新しい順**
3. **緊急度の高い変更依頼が一括提出より優先**
4. **無限スクロールで大量通知に対応**

### 5.6 リアルタイム更新

- WebSocketによる新着通知の即座反映
- 通知カウントのリアルタイム更新
- 他の管理者による処理状況の自動同期

---

**作成日**: 2025年1月27日  
**更新日**: 2025年1月27日  
**バージョン**: 2.0  
**対象システム**: Ansteype側通知管理UI