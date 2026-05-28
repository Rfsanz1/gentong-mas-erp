
import { useEffect } from 'react';
import { useLocation } from 'wouter';


export default function DeliveryIndex() {
  const [, navigate] = useLocation();
  useEffect(() => { navigate('/delivery/areas'); }, []);
  return null;
}
