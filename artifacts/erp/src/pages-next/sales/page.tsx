
import { useEffect } from 'react';
import { useLocation } from 'wouter';


export default function SalesIndex() {
  const [, navigate] = useLocation();
  useEffect(() => { navigate('/sales/orders'); }, []);
  return null;
}
