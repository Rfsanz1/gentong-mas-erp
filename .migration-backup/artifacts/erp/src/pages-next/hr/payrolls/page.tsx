
import { useEffect } from 'react';
import { useLocation } from 'wouter';


export default function PayrollsIndex() {
  const [, navigate] = useLocation();
  useEffect(() => { navigate('/hr/payrolls/components'); }, []);
  return null;
}
