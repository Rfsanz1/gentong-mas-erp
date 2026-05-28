
import { useEffect } from 'react';
import { useLocation } from 'wouter';


export default function HRIndex() {
  const [, navigate] = useLocation();
  useEffect(() => { navigate('/hr/employees'); }, []);
  return null;
}
