
import { useEffect } from 'react';
import { useLocation } from 'wouter';


export default function InvoiceIndex() {
  const [, navigate] = useLocation();
  useEffect(() => { navigate('/invoice/list'); }, []);
  return null;
}
