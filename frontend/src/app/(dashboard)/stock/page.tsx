'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

type Product = { id: string; name: string; sku: string; stock: number };
type Movement = {
  id: string;
  quantity: number;
  reason: string;
  note?: string;
  createdAt: string;
  product: { name: string; sku: string };
  user: { name: string };
};

export default function StockPage() {
  const [movements, setMovements] = useState<Movement[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState({ productId: '', quantity: 0, reason: 'PURCHASE', note: '' });
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const [m, p] = await Promise.all([
      api<Movement[]>('/stock/movements'),
      api<Product[]>('/products'),
    ]);
    setMovements(m); setProducts(p);
    if (!form.productId && p[0]) setForm((f) => ({ ...f, productId: p[0].id }));
  }
  useEffect(() => { load(); }, []);

  async function adjust(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await api('/stock/adjust', { method: 'POST', body: JSON.stringify(form) });
      setForm({ ...form, quantity: 0, note: '' });
      load();
    } catch (err: any) { setError(err.message); }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Stock Management</h1>

      <form onSubmit={adjust} className="card space-y-3">
        <h2 className="font-medium">Adjust Stock</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <label className="label">Product</label>
            <select className="input" value={form.productId} onChange={(e) => setForm({ ...form, productId: e.target.value })}>
              {products.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.stock})</option>)}
            </select>
          </div>
          <div>
            <label className="label">Quantity (+/-)</label>
            <input type="number" className="input" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: +e.target.value })}/>
          </div>
          <div>
            <label className="label">Reason</label>
            <select className="input" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })}>
              <option value="PURCHASE">Purchase (restock)</option>
              <option value="ADJUSTMENT">Adjustment</option>
              <option value="RETURN">Return</option>
              <option value="DAMAGE">Damage</option>
            </select>
          </div>
          <div>
            <label className="label">Note</label>
            <input className="input" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })}/>
          </div>
        </div>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button className="btn-primary">Apply Adjustment</button>
      </form>

      <div className="card overflow-x-auto p-0">
        <table className="table">
          <thead>
            <tr><th>Date</th><th>Product</th><th>Qty</th><th>Reason</th><th>By</th><th>Note</th></tr>
          </thead>
          <tbody>
            {movements.map((m) => (
              <tr key={m.id}>
                <td>{new Date(m.createdAt).toLocaleString()}</td>
                <td>{m.product.name}</td>
                <td className={m.quantity < 0 ? 'text-red-600' : 'text-green-600'}>
                  {m.quantity > 0 ? `+${m.quantity}` : m.quantity}
                </td>
                <td className="text-xs">{m.reason}</td>
                <td>{m.user.name}</td>
                <td className="text-slate-500 text-xs">{m.note || '—'}</td>
              </tr>
            ))}
            {movements.length === 0 && (
              <tr><td colSpan={6} className="text-center text-slate-400 py-8">No stock movements yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
