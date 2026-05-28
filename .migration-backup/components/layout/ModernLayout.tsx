import { ReactNode } from 'react';
import { OdooLayout } from './OdooLayout';

interface ModernLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
}

// Kept for backwards compatibility — wraps the new OdooLayout
export function ModernLayout({ children, title, subtitle }: ModernLayoutProps) {
  return (
    <OdooLayout title={title} subtitle={subtitle}>
      {children}
    </OdooLayout>
  );
}

export default ModernLayout;
