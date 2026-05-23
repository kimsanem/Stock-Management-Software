import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

export type ReceiptSale = {
  invoiceNo: string;
  createdAt: Date;
  type: string;
  subtotal: any;
  discount: any;
  tax: any;
  total: any;
  paid: any;
  customer?: { name: string; phone: string } | null;
  user: { name: string };
  items: { quantity: number; unitPrice: any; lineTotal: any; product: { name: string; sku: string } }[];
};

const STORE_NAME = process.env.STORE_NAME || 'Mall Inventory';

export async function buildReceiptPdf(sale: ReceiptSale): Promise<Buffer> {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([400, 600]);
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);

  const { width } = page.getSize();
  let y = 570;
  const left = 20;
  const right = width - 20;

  const drawText = (text: string, x: number, yy: number, opts: { font?: any; size?: number } = {}) => {
    page.drawText(text, { x, y: yy, size: opts.size ?? 10, font: opts.font ?? font, color: rgb(0, 0, 0) });
  };
  const drawRight = (text: string, yy: number, opts: { font?: any; size?: number } = {}) => {
    const f = opts.font ?? font;
    const size = opts.size ?? 10;
    const w = f.widthOfTextAtSize(text, size);
    drawText(text, right - w, yy, opts);
  };
  const line = (yy: number) => {
    page.drawLine({ start: { x: left, y: yy }, end: { x: right, y: yy }, thickness: 0.5, color: rgb(0.7, 0.7, 0.7) });
  };

  drawText(STORE_NAME, left, y, { font: bold, size: 16 });
  y -= 22;
  drawText(`Invoice: ${sale.invoiceNo}`, left, y); y -= 14;
  drawText(`Date: ${new Date(sale.createdAt).toLocaleString()}`, left, y); y -= 14;
  drawText(`Type: ${sale.type}`, left, y); y -= 14;
  drawText(`Cashier: ${sale.user.name}`, left, y); y -= 14;
  if (sale.customer) {
    drawText(`Customer: ${sale.customer.name} (${sale.customer.phone})`, left, y);
    y -= 14;
  }
  y -= 6; line(y); y -= 14;

  drawText('Item', left, y, { font: bold });
  drawText('Qty', left + 200, y, { font: bold });
  drawRight('Total', y, { font: bold });
  y -= 12; line(y); y -= 12;

  for (const item of sale.items) {
    const name = item.product.name.length > 30 ? item.product.name.slice(0, 28) + '…' : item.product.name;
    drawText(name, left, y);
    drawText(`${item.quantity} × ${Number(item.unitPrice).toFixed(2)}`, left + 200, y);
    drawRight(Number(item.lineTotal).toFixed(2), y);
    y -= 14;
  }

  y -= 4; line(y); y -= 14;

  const row = (label: string, value: string, boldRow = false) => {
    drawText(label, left + 200, y, boldRow ? { font: bold } : {});
    drawRight(value, y, boldRow ? { font: bold } : {});
    y -= 14;
  };
  row('Subtotal', Number(sale.subtotal).toFixed(2));
  if (Number(sale.discount) > 0) row('Discount', `-${Number(sale.discount).toFixed(2)}`);
  if (Number(sale.tax) > 0) row('Tax', Number(sale.tax).toFixed(2));
  row('Total', Number(sale.total).toFixed(2), true);
  row('Paid', Number(sale.paid).toFixed(2));

  y -= 20;
  drawText('Thank you for your purchase!', left, y, { font: bold });

  const bytes = await pdf.save();
  return Buffer.from(bytes);
}

export function receiptHtml(sale: ReceiptSale): string {
  const rows = sale.items
    .map(
      (i) =>
        `<tr><td>${escapeHtml(i.product.name)}</td><td style="text-align:right">${i.quantity}</td><td style="text-align:right">${Number(i.unitPrice).toFixed(2)}</td><td style="text-align:right">${Number(i.lineTotal).toFixed(2)}</td></tr>`,
    )
    .join('');
  return `
    <div style="font-family:Arial,sans-serif;max-width:520px">
      <h2 style="margin:0">${escapeHtml(STORE_NAME)}</h2>
      <p style="color:#555;margin:4px 0">Invoice <strong>${sale.invoiceNo}</strong> — ${new Date(sale.createdAt).toLocaleString()}</p>
      ${sale.customer ? `<p style="margin:4px 0">Customer: ${escapeHtml(sale.customer.name)}</p>` : ''}
      <table style="width:100%;border-collapse:collapse;margin-top:12px">
        <thead><tr style="border-bottom:1px solid #ccc"><th align="left">Item</th><th align="right">Qty</th><th align="right">Price</th><th align="right">Total</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
      <p style="text-align:right;margin-top:12px;font-size:18px"><strong>Total: ${Number(sale.total).toFixed(2)}</strong></p>
      <p>Receipt PDF is attached. Thank you!</p>
    </div>`;
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
}
