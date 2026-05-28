
import { useEffect } from 'react';
import { useLocation } from 'wouter';


export default function ManufacturingIndex() {
  const [, navigate] = useLocation();
  useEffect(() => { navigate('/manufacturing/mrp'); }, []);
  return null;
}
