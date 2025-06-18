'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/tier-2dealer/admin/login');
  }, [router]);

  return <div>トップページ</div>;
} 