import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuthStore } from '@/store/useAuthStore';
import { OdooLayout } from '@/layout/OdooLayout';
import { Receipt, FileText, Settings } from 'lucide-react';

export default function TaxPage() {
  const { token } = useAuthStore();
  const [, navigate] = useLocation();
  useEffect(() => { if (!token) navigate('/login'); }, [token]);
  if (!token) return null;

  return (
    <OdooLayout title="Pajak" subtitle="Manajemen pajak">
      <div className="p-6">
        <h1 className="text-xl font-bold mb-6" style={{ color: '#1E1B4B' }}>Manajemen Pajak</h1>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'e-Faktur', icon: Receipt, href: '/tax/efaktur' },
            { label: 'Rekap PPN', icon: FileText, href: '/tax/rekap-ppn' },
            { label: 'Setup Pajak', icon: Settings, href: '/tax/setup' },
          ].map(({ label, icon: Icon, href }) => (
            <a key={href} href={href} className="flex flex-col items-center gap-3 rounded-2xl p-6 cursor-pointer transition-all"
              style={{ backgroundColor: '#FFF', border: '1.5px solid #EDE9FE', boxShadow: '0 2px 8px rgba(91,82,209,0.06)' }}>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl" style={{ backgroundColor: 'rgba(91,82,209,0.08)' }}>
                <Icon className="h-6 w-6" style={{ color: '#5B52D1' }} />
              </div>
              <span className="text-sm font-semibold" style={{ color: '#1E1B4B' }}>{label}</span>
            </a>
          ))}
        </div>
      </div>
    </OdooLayout>
  );
}
