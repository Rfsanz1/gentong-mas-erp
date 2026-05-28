'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SalesIndex() {
  const router = useRouter();
  useEffect(() => { router.replace('/sales/orders'); }, []);
  return null;
}
