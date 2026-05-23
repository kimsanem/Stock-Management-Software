'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { SendReceiptDialog } from '@/components/SendReceiptDialog';

type Product = { id: string; name: string; sku: string; priceRetail: string; priceWholesale: string; stock: number };
type Customer = { id: string; name: string; phone: string; isWholesale: boolean };
type Sale = {
  id: string;
  invoiceNo: string;
  type: 'RETAIL' | 'WHOLESALE';
  total: string;
  createdAt: string;
  customer?: { name: string; phone: string; email?: string | null } | null;
  user: { name: string };
  items: { quantity: number; product: { name: string } }[];
};

export default function SalesPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [open, setOpen] = useState(false);
  const [receiptSale, setReceiptSale] = useState<Sale | null>(null);
  const [type, setType] = useState<'RETAIL' | 'WHOLESALE'>('RETAIL');
  const [customerId, setCustomerId] = useState<string>('');
  const [cart, setCart] = useState<{ productId: string; quantity: number }[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const [s, p, c] = await Promise.all([
      api<Sale[]>('/sales'),
      api<Product[]>('/products'),
      api<Customer[]>('/customers'),
    ]);
    setSales(s); setProducts(p); setCustomers(c);
  }
  useEffect(() => { load(); }, []);

  const total = cart.reduce((acc, item) => {
    const p = products.find((x) => x.id === item.productId);
    if (!p) return acc;
    const price = Number(type === 'WHOLESALE' ? p.priceWholesale : p.priceRetail);
    return acc + price * item.quantity;
  }, 0);

  function addRow() {
    setCart([...cart, { productId: products[0]?.id || '', quantity: 1 }]);
  }
  function updateRow(i: number, patch: Partial<{ productId: string; quantity: number }>) {
    setCart(cart.map((row, idx) => (idx === i ? { ...row, ...patch } : row)));
  }
  function removeRow(i: number) { setCart(cart.filter((_, idx) => idx !== i)); }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await api('/sales', {
        method: 'POST',
        body: JSON.stringify({
          type,
          customerId: customerId || undefined,
          items: cart.filter((i) => i.productId && i.quantity > 0),
        }),
      });
      setOpen(false); setCart([]); setCustomerId('');
      load();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 items-center justify-between">
        <h1 className="text-2xl font-semibold">Sales</h1>
        <button className="btn-primary" onClick={() => { setOpen(true); setCart([{ productId: products[0]?.id || '', quantity: 1 }]); }}>
          + New Sale
        </button>
      </div>

      <div className="card overflow-x-auto p-0">
        <table className="table">
          <thead>
            <tr>
              <th>Invoice</th><th>Date</th><th>Type</th><th>Customer</th><th>Cashier</th><th>Items</th><th>Total</th><th></th>
            </tr>
          </thead>
          <tbody>
            {sales.map((s) => (
              <tr key={s.id}>
                <td className="font-mono text-xs">{s.invoiceNo}</td>
                <td>{new Date(s.createdAt).toLocaleString()}</td>
                <td>
                  <span className={`text-xs px-2 py-1 rounded ${s.type === 'WHOLESALE' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                    {s.type}
                  </span>
                </td>
                <td>{s.customer?.name || 'Walk-in'}</td>
                <td>{s.user.name}</td>
                <td>{s.items.reduce((a, i) => a + i.quantity, 0)}</td>
                <td className="font-semibold">${Number(s.total).toFixed(2)}</td>
                <td>
                  <button className="btn-ghost text-xs" onClick={() => setReceiptSale(s)}>
                    Send receipt
                  </button>
                </td>
              </tr>
            ))}
            {sales.length === 0 && (
              <tr><td colSpan={8} className="text-center text-slate-400 py-8">No sales yet</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {receiptSale && <SendReceiptDialog sale={receiptSale} onClose={() => setReceiptSale(null)} />}

      {open && (
        <div className="fixed inset-0 bg-black/40 grid place-items-center p-4 z-40 overflow-auto" onClick={() => setOpen(false)}>
          <form onClick={(e) => e.stopPropagation()} onSubmit={submit} className="card w-full max-w-2xl space-y-3 my-8">
            <h2 className="text-lg font-semibold">New Sale</h2>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Type</label>
                <select className="input" value={type} onChange={(e) => setType(e.target.value as any)}>
                  <option value="RETAIL">Retail</option>
                  <option value="WHOLESALE">Wholesale</option>
                </select>
              </div>
              <div>
                <label className="label">Customer (optional)</label>
                <select className="input" value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
                  <option value="">Walk-in</option>
                  {customers.map((c) => <option key={c.id} value={c.id}>{c.name} — {c.phone}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="label">Items</label>
              <div className="space-y-2">
                {cart.map((row, i) => {
                  const p = products.find((x) => x.id === row.productId);
                  const price = p ? Number(type === 'WHOLESALE' ? p.priceWholesale : p.priceRetail) : 0;
                  return (
                    <div key={i} className="flex gap-2 items-center">
                      <select className="input flex-1" value={row.productId} onChange={(e) => updateRow(i, { productId: e.target.value })}>
                        {products.map((p) => <option key={p.id} value={p.id}>{p.name} (stock: {p.stock})</option>)}
                      </select>
                      <input type="number" min={1} className="input w-20" value={row.quantity} onChange={(e) => updateRow(i, { quantity: +e.target.value })}/>
                      <span className="text-sm w-20 text-right">${(price * row.quantity).toFixed(2)}</span>
                      <button type="button" className="text-red-600 text-sm" onClick={() => removeRow(i)}>×</button>
                    </div>
                  );
                })}
              </div>
              <button type="button" className="btn-ghost mt-2" onClick={addRow}>+ Add item</button>
            </div>

            <div className="flex justify-between items-center pt-3 border-t">
              <span className="text-lg">Total: <strong>${total.toFixed(2)}</strong></span>
            </div>
            {error && <p className="text-red-600 text-sm">{error}</p>}
            <div className="flex justify-end gap-2">
              <button type="button" className="btn-ghost" onClick={() => setOpen(false)}>Cancel</button>
              <button className="btn-primary" disabled={submitting || cart.length === 0}>
                {submitting ? 'Processing…' : 'Complete Sale'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
