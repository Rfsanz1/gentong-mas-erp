'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../lib/store/useAuthStore';
import AppShell from '../../components/layout/AppShell';
import { DELIVERY_CONFIG, DELIVERY_NAV } from '../../lib/nav-configs';
import { api } from '../../lib/api';
import { Truck, MapPin, CheckCircle, Clock } from 'lucide-react';

export default function DriverPage() {
  const { token } = useAuthStore();
  const router = useRouter();
  const [areas, setAreas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (!token) router.push('/login'); }, [token]);

  useEffect(() => {
    if (token) {
      api.get('/driver-areas').then(r => setAreas(r.data ?? [])).catch(() => {}).finally(() => setLoading(false));
    }
  }, [token]);

  if (!token) return null;

  return (
    <AppShell {...DELIVERY_CONFIG} navItems={DELIVERY_NAV} activeHref="/driver">
      <div className="p-6 space-y-6 max-w-5xl mx-auto">
        <div>
          <h1 className="text-xl font-bold" style={{ color: '#1E1B4B' }}>Dashboard Driver</h1>
          <p className="text-sm mt-0.5" style={{ color: '#9CA3AF' }}>Kelola wilayah pengiriman & penugasan driver</p>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Wilayah Aktif',      value: areas.length, color: '#1565C0', bg: 'rgba(21,101,192,.1)',  icon: MapPin },
            { label: 'Pengiriman Aktif',   value: 0,            color: '#4CAF50', bg: 'rgba(76,175,80,.1)',   icon: Truck },
            { label: 'Selesai Hari Ini',   value: 0,            color: '#2196F3', bg: 'rgba(33,150,243,.1)',  icon: CheckCircle },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-2xl p-5" style={{ border: '1.5px solid #EDE8F5', boxShadow: '0 1px 4px rgba(47,43,61,.06)' }}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium" style={{ color: '#9CA3AF' }}>{s.label}</p>
                  <p className="text-2xl font-bold mt-1" style={{ color: '#1E1B4B' }}>{s.value}</p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: s.bg }}>
                  <s.icon className="h-5 w-5" style={{ color: s.color }} />
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-2xl" style={{ border: '1.5px solid #EDE8F5', boxShadow: '0 1px 4px rgba(47,43,61,.06)' }}>
          <div className="px-6 py-4" style={{ borderBottom: '1px solid #EDE8F5' }}>
            <h2 className="text-sm font-bold" style={{ color: '#1E1B4B' }}>Wilayah Pengiriman</h2>
          </div>
          {loading ? (
            <p className="p-6 text-sm" style={{ color: '#9CA3AF' }}>Memuat data...</p>
          ) : areas.length === 0 ? (
            <p className="p-6 text-sm" style={{ color: '#9CA3AF' }}>Belum ada wilayah terdaftar</p>
          ) : (
            <div>
              {areas.map((a: any, i: number) => (
                <div key={a.id} className="flex items-center justify-between px-6 py-4"
                  style={{ borderBottom: i < areas.length - 1 ? '1px solid #F5F2FB' : 'none' }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#FDFCFF'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}>
                  <div>
                    <p className="text-sm font-medium" style={{ color: '#1E1B4B' }}>{a.wilayah}</p>
                    <p className="text-xs mt-0.5" style={{ color: '#9CA3AF' }}>{a.driver || 'Driver belum ditugaskan'}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5" style={{ color: '#9CA3AF' }} />
                    <span className="text-xs" style={{ color: '#9CA3AF' }}>{a.jadwal || '–'}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
