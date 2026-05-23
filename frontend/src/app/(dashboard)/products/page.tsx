'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

type Product = {
  id: string;
  sku: string;
  name: string;
  category?: string;
  priceRetail: string;
  priceWholesale: string;
  stock: number;
  lowStockAlert: number;
  isActive: boolean;
};

export default function ProductsPage() {
  const [items, setItems] = useState<Product[]>([]);
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    sku: '',
    name: '',
    category: '',
    priceRetail: 0,
    priceWholesale: 0,
    cost: 0,
    stock: 0,
    lowStockAlert: 10,
  });

  async function load() {
    const res = await api<Product[]>(`/products${q ? `?q=${encodeURIComponent(q)}` : ''}`);
    setItems(res);
  }

  useEffect(() => {
    load();
  }, []);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    await api('/products', { method: 'POST', body: JSON.stringify(form) });
    setOpen(false);
    setForm({ sku: '', name: '', category: '', priceRetail: 0, priceWholesale: 0, cost: 0, stock: 0, lowStockAlert: 10 });
    load();
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 items-center justify-between">
        <h1 className="text-2xl font-semibold">Products</h1>
        <button className="btn-primary" onClick={() => setOpen(true)}>+ New Product</button>
      </div>

      <div className="flex gap-2">
        <input
          className="input max-w-sm"
          placeholder="Search by name, SKU, category"
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
              <th>SKU</th><th>Name</th><th>Category</th>
              <th>Retail</th><th>Wholesale</th><th>Stock</th><th>Status</th>
            </tr>
          </thead>
          <tbody>
            {items.map((p) => (
              <tr key={p.id}>
                <td className="font-mono text-xs">{p.sku}</td>
                <td>{p.name}</td>
                <td>{p.category || '—'}</td>
                <td>${Number(p.priceRetail).toFixed(2)}</td>
                <td>${Number(p.priceWholesale).toFixed(2)}</td>
                <td>
                  <span className={p.stock <= p.lowStockAlert ? 'text-red-600 font-medium' : ''}>
                    {p.stock}
                  </span>
                </td>
                <td>
                  {p.isActive
                    ? <span className="text-green-600 text-xs">Active</span>
                    : <span className="text-slate-400 text-xs">Inactive</span>}
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr><td colSpan={7} className="text-center text-slate-400 py-8">No products</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {open && (
        <div className="fixed inset-0 bg-black/40 grid place-items-center p-4 z-40" onClick={() => setOpen(false)}>
          <form onClick={(e) => e.stopPropagation()} onSubmit={create} className="card w-full max-w-lg space-y-3">
            <h2 className="text-lg font-semibold">New Product</h2>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="label">SKU</label><input className="input" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} required/></div>
              <div><label className="label">Name</label><input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required/></div>
              <div className="col-span-2"><label className="label">Category</label><input className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}/></div>
              <div><label className="label">Retail Price</label><input type="number" step="0.01" className="input" value={form.priceRetail} onChange={(e) => setForm({ ...form, priceRetail: +e.target.value })} required/></div>
              <div><label className="label">Wholesale Price</label><input type="number" step="0.01" className="input" value={form.priceWholesale} onChange={(e) => setForm({ ...form, priceWholesale: +e.target.value })} required/></div>
              <div><label className="label">Cost</label><input type="number" step="0.01" className="input" value={form.cost} onChange={(e) => setForm({ ...form, cost: +e.target.value })} required/></div>
              <div><label className="label">Initial Stock</label><input type="number" className="input" value={form.stock} onChange={(e) => setForm({ ...form, stock: +e.target.value })}/></div>
              <div><label className="label">Low Stock Alert</label><input type="number" className="input" value={form.lowStockAlert} onChange={(e) => setForm({ ...form, lowStockAlert: +e.target.value })}/></div>
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
