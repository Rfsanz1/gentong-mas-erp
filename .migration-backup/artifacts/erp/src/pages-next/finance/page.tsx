import { useEffect } from 'react';
import { useLocation } from 'wouter';

export default function FinanceIndex() {
  const [, navigate] = useLocation();
  useEffect(() => { navigate('/finance/reports'); }, []);
  return null;
}
