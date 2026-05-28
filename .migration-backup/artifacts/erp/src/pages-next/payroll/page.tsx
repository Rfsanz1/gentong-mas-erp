
import { useEffect } from 'react';
import { useLocation } from 'wouter';


export default function PayrollIndex() {
  const [, navigate] = useLocation();
  useEffect(() => { navigate('/hr/payrolls'); }, []);
  return null;
}
