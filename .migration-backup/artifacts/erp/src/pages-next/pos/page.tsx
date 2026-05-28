
import { useEffect } from 'react';
import { useLocation } from 'wouter';


export default function POSIndex() {
  const [, navigate] = useLocation();
  useEffect(() => { navigate('/pos/orders'); }, []);
  return null;
}
