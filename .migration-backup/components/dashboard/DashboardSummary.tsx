'use client';

import { motion } from 'framer-motion';
import { Card } from '../ui/Card';

interface DashboardSummaryProps {
  summary: { users: number; roles: number; notifications: number; permissions: number } | null;
  isLoading: boolean;
  error: string | null;
}

const metrics = [
  { label: 'Users', key: 'users' },
  { label: 'Roles', key: 'roles' },
  { label: 'Notifications', key: 'notifications' },
  { label: 'Permissions', key: 'permissions' },
] as const;

export function DashboardSummary({ summary, isLoading, error }: DashboardSummaryProps) {
  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {metrics.map((metric, index) => (
        <motion.div
          key={metric.key}
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.08, duration: 0.35 }}
        >
          <Card>
            <p className="text-sm uppercase tracking-[0.28em] text-cyan-300">{metric.label}</p>
            <p className="mt-4 text-4xl font-semibold text-white">
              {isLoading ? '...' : summary ? summary[metric.key] : '0'}
            </p>
          </Card>
        </motion.div>
      ))}

      <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.35 }}>
        <Card>
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <p className="text-sm uppercase tracking-[0.28em] text-cyan-300">Status</p>
              <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-sm text-emerald-300">Active</span>
            </div>
            <p className="text-slate-400">Monitoring ERP status and backend health in real time.</p>
            {error ? <p className="text-sm text-rose-400">{error}</p> : null}
          </div>
        </Card>
      </motion.div>
    </section>
  );
}
