'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { clearToken } from '@/lib/api';
import {
  LayoutDashboard,
  Package,
  Users,
  ShoppingCart,
  Archive,
  LogOut,
  Menu,
  X,
} from 'lucide-react';

const links = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/products', label: 'Products', icon: Package },
  { href: '/customers', label: 'Customers', icon: Users },
  { href: '/sales', label: 'Sales', icon: ShoppingCart },
  { href: '/stock', label: 'Stock', icon: Archive },
];

export function Sidebar() {
  const path = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  function logout() {
    clearToken();
    router.push('/login');
  }

  return (
    <>
      <button
        className="md:hidden fixed top-3 left-3 z-30 p-2 rounded-lg bg-white shadow border"
        onClick={() => setOpen(!open)}
        aria-label="Toggle menu"
      >
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>

      <aside
        className={`fixed md:static inset-y-0 left-0 z-20 w-64 bg-white border-r border-slate-200 transform transition-transform md:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-5 border-b">
          <h1 className="text-lg font-bold text-brand">Mall Inventory</h1>
        </div>
        <nav className="p-3 space-y-1">
          {links.map(({ href, label, icon: Icon }) => {
            const active = path === href || path.startsWith(href + '/');
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${
                  active
                    ? 'bg-brand text-white'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Icon size={18} />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-3 border-t">
          <button
            onClick={logout}
            className="flex items-center gap-3 w-full rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
          >
            <LogOut size={18} /> Sign out
          </button>
        </div>
      </aside>
    </>
  );
}
