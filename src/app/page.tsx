'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // 管理者ログイン画面にリダイレクト
    router.push('/tier-2dealer/admin/login');
  }, [router]);

  return <div>管理者ログイン画面に移動中...</div>;
} 