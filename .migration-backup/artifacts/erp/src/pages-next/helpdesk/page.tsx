
import { useEffect } from 'react';
import { useLocation } from 'wouter';


export default function HelpdeskIndex() {
  const [, navigate] = useLocation();
  useEffect(() => { navigate('/service/work-orders'); }, []);
  return null;
}
