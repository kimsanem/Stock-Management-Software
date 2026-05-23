'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Package, Users, AlertTriangle, DollarSign, ShoppingCart } from 'lucide-react';

type Summary = {
  productCount: number;
  customerCount: number;
  lowStockCount: number;
  todaySales: number;
  todayRevenue: string | number;
};

export default function DashboardPage() {
  const [data, setData] = useState<Summary | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api<Summary>('/dashboard/summary').then(setData).catch((e) => setError(e.message));
  }, []);

  const cards = [
    { label: 'Products', value: data?.productCount ?? '—', icon: Package, color: 'bg-blue-500' },
    { label: 'Customers', value: data?.customerCount ?? '—', icon: Users, color: 'bg-green-500' },
    { label: 'Low stock', value: data?.lowStockCount ?? '—', icon: AlertTriangle, color: 'bg-amber-500' },
    { label: "Today's sales", value: data?.todaySales ?? '—', icon: ShoppingCart, color: 'bg-indigo-500' },
    { label: "Today's revenue", value: data ? `$${Number(data.todayRevenue).toFixed(2)}` : '—', icon: DollarSign, color: 'bg-emerald-500' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-slate-500 text-sm">Overview of your store</p>
      </div>

      {error && <div className="card text-red-600">{error}</div>}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {cards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card flex items-center gap-4">
            <div className={`${color} text-white p-3 rounded-lg`}>
              <Icon size={22} />
            </div>
            <div>
              <div className="text-xs text-slate-500 uppercase tracking-wide">{label}</div>
              <div className="text-xl font-semibold">{value}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
