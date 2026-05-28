
import { useEffect } from 'react';
import { useLocation } from 'wouter';


export default function CRMIndex() {
  const [, navigate] = useLocation();
  useEffect(() => { navigate('/crm/leads'); }, []);
  return null;
}
