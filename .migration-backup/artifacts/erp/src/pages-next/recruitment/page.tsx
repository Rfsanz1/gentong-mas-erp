
import { useEffect } from 'react';
import { useLocation } from 'wouter';


export default function RecruitmentIndex() {
  const [, navigate] = useLocation();
  useEffect(() => { navigate('/recruitment/positions'); }, []);
  return null;
}
