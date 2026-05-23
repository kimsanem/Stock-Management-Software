'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

type Customer = {
  id: string;
  name: string;
  phone: string;
  address?: string;
  email?: string;
  isWholesale: boolean;
};

export default function CustomersPage() {
  const [items, setItems] = useState<Customer[]>([]);
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: '', phone: '', address: '', email: '', isWholesale: false, notes: '',
  });

  async function load() {
    const res = await api<Customer[]>(`/customers${q ? `?q=${encodeURIComponent(q)}` : ''}`);
    setItems(res);
  }

  useEffect(() => { load(); }, []);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    await api('/customers', { method: 'POST', body: JSON.stringify(form) });
    setOpen(false);
    setForm({ name: '', phone: '', address: '', email: '', isWholesale: false, notes: '' });
    load();
  }

  async function remove(id: string) {
    if (!confirm('Remove this customer?')) return;
    await api(`/customers/${id}`, { method: 'DELETE' });
    load();
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 items-center justify-between">
        <h1 className="text-2xl font-semibold">Customers</h1>
        <button className="btn-primary" onClick={() => setOpen(true)}>+ New Customer</button>
      </div>

      <div className="flex gap-2">
        <input
          className="input max-w-sm"
          placeholder="Search name, phone, email"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && load()}
        />
        <button className="btn-ghost" onClick={load}>Search</button>
      </div>

      <div className="card overflow-x-auto p-0">
        <table className="table">
          <thead>
            <tr>
              <th>Name</th><th>Phone</th><th>Address</th><th>Email</th><th>Type</th><th></th>
            </tr>
          </thead>
          <tbody>
            {items.map((c) => (
              <tr key={c.id}>
                <td className="font-medium">{c.name}</td>
                <td>{c.phone}</td>
                <td>{c.address || '—'}</td>
                <td>{c.email || '—'}</td>
                <td>
                  {c.isWholesale
                    ? <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">Wholesale</span>
                    : <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">Retail</span>}
                </td>
                <td>
                  <button onClick={() => remove(c.id)} className="text-red-600 text-xs hover:underline">Delete</button>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr><td colSpan={6} className="text-center text-slate-400 py-8">No customers</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {open && (
        <div className="fixed inset-0 bg-black/40 grid place-items-center p-4 z-40" onClick={() => setOpen(false)}>
          <form onClick={(e) => e.stopPropagation()} onSubmit={create} className="card w-full max-w-lg space-y-3">
            <h2 className="text-lg font-semibold">New Customer</h2>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="label">Name</label><input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required/></div>
              <div><label className="label">Phone</label><input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required/></div>
              <div className="col-span-2"><label className="label">Address</label><input className="input" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })}/></div>
              <div><label className="label">Email</label><input type="email" className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}/></div>
              <div className="flex items-end gap-2">
                <label className="inline-flex items-center gap-2 pb-2">
                  <input type="checkbox" checked={form.isWholesale} onChange={(e) => setForm({ ...form, isWholesale: e.target.checked })}/>
                  <span className="text-sm">Wholesale customer</span>
                </label>
              </div>
              <div className="col-span-2"><label className="label">Notes</label><textarea className="input" rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}/></div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" className="btn-ghost" onClick={() => setOpen(false)}>Cancel</button>
              <button className="btn-primary">Create</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
