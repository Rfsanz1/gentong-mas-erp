
import { useEffect } from 'react';
import { useLocation } from 'wouter';


export default function ServiceIndex() {
  const [, navigate] = useLocation();
  useEffect(() => { navigate('/service/work-orders'); }, []);
  return null;
}
