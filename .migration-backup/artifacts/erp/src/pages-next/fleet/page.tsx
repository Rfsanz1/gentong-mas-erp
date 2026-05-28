
import { useEffect } from 'react';
import { useLocation } from 'wouter';


export default function FleetIndex() {
  const [, navigate] = useLocation();
  useEffect(() => { navigate('/fleet/vehicles'); }, []);
  return null;
}
