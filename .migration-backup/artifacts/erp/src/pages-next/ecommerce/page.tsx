
import { useEffect } from 'react';
import { useLocation } from 'wouter';


export default function EcommerceIndex() {
  const [, navigate] = useLocation();
  useEffect(() => { navigate('/marketplace/price-sync'); }, []);
  return null;
}
