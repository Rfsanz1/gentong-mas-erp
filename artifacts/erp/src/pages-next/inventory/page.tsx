
import { useEffect } from 'react';
import { useLocation } from 'wouter';


export default function InventoryIndex() {
  const [, navigate] = useLocation();
  useEffect(() => { navigate('/inventory/products'); }, []);
  return null;
}
