
import { useEffect } from 'react';
import { useLocation } from 'wouter';


export default function PurchasingIndex() {
  const [, navigate] = useLocation();
  useEffect(() => { navigate('/purchasing/rfq'); }, []);
  return null;
}
