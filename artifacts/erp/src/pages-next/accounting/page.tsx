
import { useEffect } from 'react';
import { useLocation } from 'wouter';


export default function AccountingIndex() {
  const [, navigate] = useLocation();
  useEffect(() => { navigate('/finance/journal-entries'); }, []);
  return null;
}
