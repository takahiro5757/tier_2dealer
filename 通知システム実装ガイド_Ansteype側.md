# Ansteype側通知システム実装ガイド

## 概要

2次店（Festal）システムから送信される通知をAnsteype側で受信・処理・表示するための実装ガイドです。  
技術的な実装詳細と開発時の注意点をまとめています。

---

## 1. システム全体のデータフロー

### 1.1 基本フロー図

```mermaid
graph TD
    A[スタッフ<br/>シフト入力] --> B[Festal<br/>システム]
    C[管理者<br/>シフト変更依頼] --> B
    B --> D{通知タイプ}
    D -->|shift_submission| E[シフト提出通知<br/>データ変換]
    D -->|change_request| F[変更依頼通知<br/>データ変換]
    E --> G[Ansteype<br/>システム]
    F --> G
    G --> H[通知保存・<br/>処理]
    H --> I[通知UI<br/>表示]
    I --> J[Ansteype<br/>管理者]
    J --> K{アクション}
    K -->|承認| L[承認処理]
    K -->|却下| M[却下処理]
    K -->|確認のみ| N[既読処理]
    L --> O[Festalへ<br/>結果送信]
    M --> O
```

### 1.2 データ変換フロー

1. **Festal → Ansteype データ変換**
   - Festaシステムの内部形式 → 標準API形式
   - 日付形式統一（ISO8601）
   - 会社識別子付与（companyName: "Festal"）
   - 通知ID生成（type-yearmonth-timestamp）

2. **Ansteype側 データ処理**
   - 受信データ検証・サニタイズ
   - 内部データベース形式に変換
   - 重複チェック・整合性確認
   - リアルタイム配信準備

---

## 2. データベース設計

### 2.1 通知テーブル (notifications)

```sql
CREATE TABLE notifications (
  id VARCHAR(255) PRIMARY KEY,
  type ENUM('shift_submission', 'change_request', 'approval', 'rejection') NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  timestamp DATETIME NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  staff_id VARCHAR(100),
  staff_name VARCHAR(100),
  company_name VARCHAR(100) NOT NULL DEFAULT 'Festal',
  target_audience ENUM('ansteype', 'festal') NOT NULL DEFAULT 'ansteype',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_timestamp (timestamp DESC),
  INDEX idx_is_read (is_read),
  INDEX idx_type (type),
  INDEX idx_staff_id (staff_id)
);
```

### 2.2 シフト提出データテーブル (shift_submissions)

```sql
CREATE TABLE shift_submissions (
  id VARCHAR(255) PRIMARY KEY,
  notification_id VARCHAR(255) NOT NULL,
  company_id VARCHAR(100) NOT NULL,
  year_month VARCHAR(7) NOT NULL, -- YYYY-MM
  submitted_at DATETIME NOT NULL,
  submitted_by VARCHAR(100) NOT NULL,
  is_initial_submission BOOLEAN DEFAULT TRUE,
  comment TEXT,
  shift_data JSON NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (notification_id) REFERENCES notifications(id) ON DELETE CASCADE,
  INDEX idx_year_month (year_month),
  INDEX idx_submitted_by (submitted_by)
);
```

### 2.3 シフト変更依頼テーブル (change_requests)

```sql
CREATE TABLE change_requests (
  id VARCHAR(255) PRIMARY KEY,
  notification_id VARCHAR(255) NOT NULL,
  request_date DATETIME NOT NULL,
  target_year INT NOT NULL,
  target_month INT NOT NULL,
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  total_changes INT NOT NULL,
  reason TEXT,
  approver_comment TEXT,
  staff_changes JSON NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (notification_id) REFERENCES notifications(id) ON DELETE CASCADE,
  INDEX idx_target_year_month (target_year, target_month),
  INDEX idx_status (status)
);
```

---

## 3. API実装

### 3.1 通知受信エンドポイント

```typescript
// POST /api/notifications/receive
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // リクエスト検証
    const validation = validateNotificationRequest(body);
    if (!validation.isValid) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      );
    }
    
    // データ変換
    const notificationData = transformFestalNotification(body);
    
    // データベース保存
    const result = await saveNotification(notificationData);
    
    // リアルタイム配信
    await broadcastNotification(notificationData);
    
    return NextResponse.json({
      success: true,
      notificationId: result.id,
      message: '通知を受信しました'
    });
    
  } catch (error) {
    console.error('通知受信エラー:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### 3.2 データ変換関数

```typescript
function transformFestalNotification(festalData: any): AnsteyteNotification {
  const timestamp = new Date();
  const notificationId = generateNotificationId(
    festalData.notificationType,
    festalData.data.yearMonth,
    timestamp
  );
  
      switch (festalData.notificationType) {
    case 'shift_bulk_submission':
      return {
        id: notificationId,
        type: 'shift_bulk_submission',
        title: 'シフト一括提出',
        message: `Festalから${festalData.data.yearMonth}のシフトが一括提出されました（${festalData.data.staffCount}名分）`,
        timestamp,
        isRead: false,
        companyName: 'Festal',
        targetAudience: 'ansteype',
        bulkSubmissionData: transformBulkSubmission(festalData.data)
      };
      
    case 'change_request':
      return {
        id: notificationId,
        type: 'change_request',
        title: 'シフト変更依頼',
        message: `Festalから${festalData.data.yearMonth}のシフト変更依頼（${festalData.data.staffCount}名、${festalData.data.totalChanges}件）`,
        timestamp,
        isRead: false,
        companyName: 'Festal',
        targetAudience: 'ansteype',
        changeRequestData: transformChangeRequest(festalData.data)
      };
      
    default:
      throw new Error(`未対応の通知タイプ: ${festalData.notificationType}`);
  }
}
```

### 3.3 リアルタイム配信

```typescript
// WebSocket実装例
import { Server as SocketIOServer } from 'socket.io';

export async function broadcastNotification(notification: AnsteyteNotification) {
  const io = getSocketIOInstance();
  
  // Ansteype管理者のみに配信
  io.to('ansteype-admins').emit('notification', {
    type: 'new_notification',
    data: notification
  });
  
  // ブラウザ通知（Web Push）
  if (notification.type === 'change_request') {
    await sendWebPushNotification({
      title: notification.title,
      body: notification.message,
      icon: '/icons/notification-icon.png',
      badge: '/icons/notification-badge.png',
      tag: notification.id
    });
  }
}
```

---

## 4. フロントエンド実装

### 4.1 一括承認機能

```typescript
// 一括承認処理（pending状態のスタッフのみ対象）
export async function bulkApproveChangeRequest(
  changeRequestId: string, 
  comment?: string
): Promise<void> {
  const response = await fetch(`/api/change-requests/${changeRequestId}/bulk-approve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ comment })
  });
  
  if (!response.ok) {
    throw new Error('一括承認処理に失敗しました');
  }
}
```

### 4.2 スタッフ単位承認ロジック

```typescript
// スタッフ単位承認処理（コメントは依頼全体で管理）
export async function approveStaffChange(
  changeRequestId: string, 
  staffId: string
): Promise<void> {
  const response = await fetch(`/api/change-requests/${changeRequestId}/staff/${staffId}/approve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });
  
  if (!response.ok) {
    throw new Error('承認処理に失敗しました');
  }
}

// スタッフ単位却下処理（コメントは依頼全体で管理）
export async function rejectStaffChange(
  changeRequestId: string, 
  staffId: string
): Promise<void> {
  const response = await fetch(`/api/change-requests/${changeRequestId}/staff/${staffId}/reject`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });
  
  if (!response.ok) {
    throw new Error('却下処理に失敗しました');
  }
}

// 全体ステータス自動計算
export function calculateOverallStatus(staffChanges: StaffChangeData[]): string {
  const approved = staffChanges.filter(s => s.status === 'approved').length;
  const rejected = staffChanges.filter(s => s.status === 'rejected').length;
  const pending = staffChanges.filter(s => s.status === 'pending').length;
  const total = staffChanges.length;
  
  if (approved === total) return 'approved'; // 全て承認済み
  if (rejected === total) return 'rejected'; // 全て却下
  if (approved > 0 || rejected > 0) return 'mixed'; // 承認・却下が混在（部分承認）
  return 'pending'; // 全て未処理
}
```

### 4.2 通知ストア（Zustand）

```typescript
interface NotificationStore {
  notifications: AnsteyteNotification[];
  unreadCount: number;
  isLoading: boolean;
  filter: 'all' | 'unread' | 'submission' | 'change' | 'approved';
  
  // アクション
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  clearAll: () => Promise<void>;
  setFilter: (filter: string) => void;
  addNotification: (notification: AnsteyteNotification) => void;
}

export const useNotificationStore = create<NotificationStore>()((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  filter: 'all',
  
  fetchNotifications: async () => {
    set({ isLoading: true });
    try {
      const response = await fetch('/api/notifications');
      const data = await response.json();
      set({ 
        notifications: data.notifications,
        unreadCount: data.notifications.filter(n => !n.isRead).length,
        isLoading: false 
      });
    } catch (error) {
      console.error('通知取得エラー:', error);
      set({ isLoading: false });
    }
  },
  
  markAsRead: async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}/read`, { method: 'POST' });
      set(state => ({
        notifications: state.notifications.map(n => 
          n.id === id ? { ...n, isRead: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1)
      }));
    } catch (error) {
      console.error('既読更新エラー:', error);
    }
  },
  
  addNotification: (notification: AnsteyteNotification) => {
    set(state => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + (notification.isRead ? 0 : 1)
    }));
  }
}));
```

### 4.2 リアルタイム接続

```typescript
// hooks/useNotificationSocket.ts
export const useNotificationSocket = () => {
  const { addNotification } = useNotificationStore();
  
  useEffect(() => {
    const socket = io('/notifications', {
      auth: {
        role: 'ansteype-admin',
        token: getAuthToken()
      }
    });
    
    socket.on('notification', (data) => {
      if (data.type === 'new_notification') {
        addNotification(data.data);
        
        // ブラウザ通知表示
        if (Notification.permission === 'granted') {
          new Notification(data.data.title, {
            body: data.data.message,
            icon: '/icons/notification-icon.png',
            tag: data.data.id
          });
        }
      }
    });
    
    return () => {
      socket.disconnect();
    };
  }, [addNotification]);
};
```

### 4.3 通知コンポーネント

```typescript
// components/NotificationSystem.tsx
export const NotificationSystem: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<AnsteyteNotification | null>(null);
  
  const { 
    notifications, 
    unreadCount, 
    isLoading, 
    filter,
    fetchNotifications,
    markAsRead,
    setFilter 
  } = useNotificationStore();
  
  // WebSocket接続
  useNotificationSocket();
  
  // 初期データ取得
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);
  
  // フィルタリングされた通知
  const filteredNotifications = useMemo(() => {
    return notifications.filter(notification => {
      switch (filter) {
        case 'unread': return !notification.isRead;
        case 'submission': return notification.type === 'shift_bulk_submission';
        case 'change': return notification.type === 'change_request';
        case 'approved': return notification.type === 'approval';
        default: return true;
      }
    });
  }, [notifications, filter]);
  
  const handleNotificationClick = (notification: AnsteyteNotification) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
    setSelectedNotification(notification);
  };
  
  return (
    <>
      {/* 通知トリガーボタン */}
      <IconButton 
        onClick={() => setIsOpen(true)}
        color="inherit"
        sx={{ position: 'relative' }}
      >
        <Notifications />
        {unreadCount > 0 && (
          <Badge 
            badgeContent={unreadCount} 
            color="error"
            sx={{
              position: 'absolute',
              top: -8,
              right: -8
            }}
          />
        )}
      </IconButton>
      
      {/* 通知ドロワー */}
      <Drawer
        anchor="right"
        open={isOpen}
        onClose={() => setIsOpen(false)}
        PaperProps={{
          sx: { width: { xs: '100vw', sm: 400 } }
        }}
      >
        <NotificationHeader 
          unreadCount={unreadCount}
          filter={filter}
          onFilterChange={setFilter}
          onClose={() => setIsOpen(false)}
        />
        
        <Divider />
        
        <Box sx={{ flex: 1, overflow: 'auto' }}>
          {isLoading ? (
            <CircularProgress sx={{ m: 2 }} />
          ) : (
            <List>
              {filteredNotifications.map(notification => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onClick={() => handleNotificationClick(notification)}
                />
              ))}
            </List>
          )}
        </Box>
      </Drawer>
      
      {/* 通知詳細ダイアログ */}
      {selectedNotification && (
        <NotificationDetailDialog
          notification={selectedNotification}
          open={Boolean(selectedNotification)}
          onClose={() => setSelectedNotification(null)}
        />
      )}
    </>
  );
};
```

---

## 5. 設定・環境変数

### 5.1 環境変数設定

```env
# .env.local
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
DATABASE_URL=mysql://user:password@localhost:3306/ansteype_db
SOCKET_IO_SECRET=your-socket-secret
WEB_PUSH_VAPID_PUBLIC_KEY=your-vapid-public-key
WEB_PUSH_VAPID_PRIVATE_KEY=your-vapid-private-key
WEB_PUSH_VAPID_SUBJECT=mailto:admin@ansteype.com

# Festal連携用
FESTAL_API_SECRET=shared-secret-key
FESTAL_WEBHOOK_URL=https://festal-system.com/api/webhooks/ansteype
```

### 5.2 Next.js設定

```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: true,
  },
  async rewrites() {
    return [
      {
        source: '/api/socket',
        destination: '/api/socket',
      },
    ];
  },
  webpack: (config) => {
    config.resolve.fallback = { fs: false, net: false, tls: false };
    return config;
  },
};

module.exports = nextConfig;
```

---

## 6. テスト実装

### 6.1 単体テスト例

```typescript
// __tests__/notifications.test.ts
import { transformFestalNotification } from '@/lib/notifications';

describe('通知データ変換', () => {
  test('シフト変更依頼通知の変換', () => {
    const festalData = {
      notificationType: 'change_request',
      sourceSystem: 'festal',
      data: {
        yearMonth: '2025-04',
        staffCount: 2,
        totalChanges: 3,
        staffChanges: [
          {
            staffId: 'staff123',
            staffName: '田中太郎',
            changes: [
              {
                date: '2025-04-01',
                field: 'status',
                oldValue: '○',
                newValue: '×'
              },
              {
                date: '',
                field: 'request',
                oldValue: '15',
                newValue: '18'
              }
            ]
          }
        ]
      }
    };
    
    const result = transformFestalNotification(festalData);
    
    expect(result.type).toBe('change_request');
    expect(result.companyName).toBe('Festal');
    expect(result.targetAudience).toBe('ansteype');
  });
});
```

### 6.2 統合テスト例

```typescript
// __tests__/api/notifications.test.ts
import { POST } from '@/app/api/notifications/receive/route';

describe('/api/notifications/receive', () => {
  test('シフト変更依頼通知の受信', async () => {
    const request = new Request('http://localhost:3000/api/notifications/receive', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        notificationType: 'change_request',
        sourceSystem: 'festal',
        data: {
          yearMonth: '2025-04',
          staffCount: 3,
          totalChanges: 5,
          staffChanges: [
            {
              staffId: 'staff123',
              staffName: '田中太郎',
              changes: [
                {
                  date: '',
                  field: 'request',
                  oldValue: '15',
                  newValue: '18'
                }
              ]
            }
          ]
        }
      })
    });
    
    const response = await POST(request);
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.notificationId).toBeDefined();
  });
});
```

---

## 7. デプロイ・運用

### 7.1 Docker設定

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

### 7.2 監視設定

```yaml
# docker-compose.yml
version: '3.8'
services:
  ansteype-app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    depends_on:
      - mysql
      - redis
    
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: rootpassword
      MYSQL_DATABASE: ansteype_db
    volumes:
      - mysql_data:/var/lib/mysql
    
  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data

volumes:
  mysql_data:
  redis_data:
```

### 7.3 ログ設定

```typescript
// lib/logger.ts
import winston from 'winston';

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});
```

---

## 8. セキュリティ対策

### 8.1 認証・認可

```typescript
// middleware/auth.ts
export function authenticateFestalRequest(request: Request): boolean {
  const authHeader = request.headers.get('Authorization');
  const expectedSecret = process.env.FESTAL_API_SECRET;
  
  if (!authHeader || !expectedSecret) {
    return false;
  }
  
  const token = authHeader.replace('Bearer ', '');
  return token === expectedSecret;
}

// API Route例
export async function POST(request: Request) {
  if (!authenticateFestalRequest(request)) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }
  
  // 処理続行...
}
```

### 8.2 データ検証

```typescript
// lib/validation.ts
import { z } from 'zod';

const ShiftSubmissionSchema = z.object({
  notificationType: z.literal('shift_submission'),
  sourceSystem: z.literal('festal'),
  data: z.object({
    staffId: z.string().min(1),
    staffName: z.string().min(1),
    yearMonth: z.string().regex(/^\d{4}-\d{2}$/),
    shifts: z.array(z.object({
      date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      status: z.enum(['○', '×', '△']),
      comment: z.string().optional()
    }))
  })
});

export function validateNotificationRequest(data: any) {
  try {
    ShiftSubmissionSchema.parse(data);
    return { isValid: true };
  } catch (error) {
    return { isValid: false, error: error.message };
  }
}
```

---

**作成日**: 2025年1月27日  
**バージョン**: 1.0  
**対象システム**: Ansteype側通知システム実装