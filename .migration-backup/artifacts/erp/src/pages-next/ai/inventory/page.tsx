

import { useEffect } from 'react';
import { useLocation } from 'wouter';

import { useAuthStore } from '@/store/useAuthStore';

export default function AiInventoryRedirect() {
  const [, navigate] = useLocation();
  useEffect(() => {
    navigate('/ai/inventory-prediction');
  }, []);
  return null;
}
