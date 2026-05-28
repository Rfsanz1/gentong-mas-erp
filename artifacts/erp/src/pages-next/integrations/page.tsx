import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuthStore } from '@/store/useAuthStore';
import { OdooLayout } from '@/layout/OdooLayout';
import { Link2, Zap, RefreshCw } from 'lucide-react';

export default function IntegrationsPage() {
  const { token } = useAuthStore();
  const [, navigate] = useLocation();
  useEffect(() => { if (!token) navigate('/login'); }, [token]);
  if (!token) return null;

  return (
    <OdooLayout title="Integrasi" subtitle="Kelola integrasi sistem">
      <div className="p-6">
        <h1 className="text-xl font-bold mb-6" style={{ color: '#1E1B4B' }}>Integrasi Sistem</h1>
        <div className="rounded-2xl p-8 text-center" style={{ backgroundColor: '#FFF', border: '1.5px solid #EDE9FE' }}>
          <Link2 className="h-12 w-12 mx-auto mb-3" style={{ color: '#C4B5FD' }} />
          <p className="text-base font-semibold" style={{ color: '#1E1B4B' }}>Integrasi API</p>
          <p className="text-sm mt-1" style={{ color: '#9CA3AF' }}>Kelola koneksi dengan sistem eksternal</p>
        </div>
      </div>
    </OdooLayout>
  );
}
