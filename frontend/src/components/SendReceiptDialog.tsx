'use client';

import { useState } from 'react';
import { api } from '@/lib/api';

type Sale = {
  id: string;
  invoiceNo: string;
  total: string;
  customer?: { name: string; phone: string; email?: string | null } | null;
};

type Step = 'email' | 'code' | 'sent';

export function SendReceiptDialog({ sale, onClose }: { sale: Sale; onClose: () => void }) {
  const [email, setEmail] = useState(sale.customer?.email || '');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<Step>('email');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  async function requestCode() {
    setBusy(true); setError(null); setInfo(null);
    try {
      await api('/otp/request', { method: 'POST', body: JSON.stringify({ email }) });
      setStep('code');
      setInfo(`Code sent to ${email}. Check inbox (and spam).`);
    } catch (e: any) { setError(e.message); }
    finally { setBusy(false); }
  }

  async function verifyAndSend() {
    setBusy(true); setError(null); setInfo(null);
    try {
      const v = await api<{ verifyToken: string }>('/otp/verify', {
        method: 'POST',
        body: JSON.stringify({ email, code }),
      });
      await api(`/sales/${sale.id}/send-receipt`, {
        method: 'POST',
        body: JSON.stringify({ email, verifyToken: v.verifyToken }),
      });
      setStep('sent');
      setInfo('Receipt emailed successfully.');
    } catch (e: any) { setError(e.message); }
    finally { setBusy(false); }
  }

  function whatsappShare() {
    const phone = sale.customer?.phone?.replace(/[^\d]/g, '') || '';
    const text = encodeURIComponent(
      `Receipt ${sale.invoiceNo} — Total $${Number(sale.total).toFixed(2)}. Thank you for your purchase!`,
    );
    const url = phone ? `https://wa.me/${phone}?text=${text}` : `https://wa.me/?text=${text}`;
    window.open(url, '_blank');
  }

  return (
    <div className="fixed inset-0 bg-black/40 grid place-items-center p-4 z-50" onClick={onClose}>
      <div className="card w-full max-w-md space-y-3" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-lg font-semibold">Send Receipt</h2>
            <p className="text-sm text-slate-500">Invoice {sale.invoiceNo}</p>
          </div>
          <button className="text-slate-400 hover:text-slate-700" onClick={onClose}>×</button>
        </div>

        {step === 'email' && (
          <>
            <label className="label">Customer email</label>
            <input
              type="email" className="input" value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="customer@example.com"
            />
            <div className="flex justify-between gap-2 pt-2">
              <button type="button" className="btn-ghost" onClick={whatsappShare}>
                Share via WhatsApp
              </button>
              <button
                className="btn-primary"
                disabled={busy || !email.includes('@')}
                onClick={requestCode}
              >
                {busy ? 'Sending…' : 'Send code'}
              </button>
            </div>
          </>
        )}

        {step === 'code' && (
          <>
            <label className="label">6-digit code sent to {email}</label>
            <input
              className="input tracking-[0.5em] text-center text-lg"
              maxLength={6} value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              placeholder="123456"
            />
            <div className="flex justify-between pt-2">
              <button className="btn-ghost" onClick={() => setStep('email')}>Back</button>
              <button
                className="btn-primary"
                disabled={busy || code.length !== 6}
                onClick={verifyAndSend}
              >
                {busy ? 'Verifying…' : 'Verify & email receipt'}
              </button>
            </div>
          </>
        )}

        {step === 'sent' && (
          <>
            <p className="text-green-700">Receipt sent to {email}.</p>
            <div className="flex justify-end gap-2">
              <button className="btn-ghost" onClick={whatsappShare}>Also share via WhatsApp</button>
              <button className="btn-primary" onClick={onClose}>Done</button>
            </div>
          </>
        )}

        {error && <p className="text-red-600 text-sm">{error}</p>}
        {info && !error && <p className="text-slate-500 text-sm">{info}</p>}
      </div>
    </div>
  );
}
