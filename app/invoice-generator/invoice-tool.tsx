"use client";

import { useState, useRef } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { Plus, Trash2, Download, Eye } from "lucide-react";

interface LineItem {
  id: number;
  description: string;
  qty: string;
  rate: string;
}

interface InvoiceData {
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  companyName: string;
  companyAddress: string;
  companyEmail: string;
  clientName: string;
  clientAddress: string;
  clientEmail: string;
  items: LineItem[];
  taxRate: string;
  notes: string;
  paymentTerms: string;
  logoDataUrl: string;
}

const defaultItems: LineItem[] = [
  { id: 1, description: "Web Development Services", qty: "10", rate: "150" },
  { id: 2, description: "UI/UX Design", qty: "5", rate: "120" },
];

const today = new Date().toISOString().split("T")[0];
const due = new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0];

export function InvoiceTool() {
  const [data, setData] = useState<InvoiceData>({
    invoiceNumber: "INV-001",
    invoiceDate: today,
    dueDate: due,
    companyName: "Your Company",
    companyAddress: "123 Main St, City, State 12345",
    companyEmail: "hello@company.com",
    clientName: "Client Name",
    clientAddress: "456 Oak Ave, City, State 67890",
    clientEmail: "client@example.com",
    items: defaultItems,
    taxRate: "10",
    notes: "Thank you for your business!",
    paymentTerms: "Net 30",
    logoDataUrl: "",
  });
  const [showPreview, setShowPreview] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const update = (field: keyof InvoiceData, value: string) =>
    setData((d) => ({ ...d, [field]: value }));

  const updateItem = (id: number, field: keyof LineItem, value: string) =>
    setData((d) => ({
      ...d,
      items: d.items.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    }));

  const addItem = () =>
    setData((d) => ({
      ...d,
      items: [...d.items, { id: Date.now(), description: "", qty: "1", rate: "0" }],
    }));

  const removeItem = (id: number) =>
    setData((d) => ({ ...d, items: d.items.filter((item) => item.id !== id) }));

  const handleLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => update("logoDataUrl", ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const subtotal = data.items.reduce((sum, item) => {
    const qty = parseFloat(item.qty) || 0;
    const rate = parseFloat(item.rate) || 0;
    return sum + qty * rate;
  }, 0);
  const taxAmount = subtotal * (parseFloat(data.taxRate) || 0) / 100;
  const total = subtotal + taxAmount;

  const fmt = (n: number) =>
    n.toLocaleString("en-US", { style: "currency", currency: "USD" });

  const printInvoice = () => {
    const printContent = `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Invoice ${data.invoiceNumber}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 13px; color: #111; padding: 40px; max-width: 800px; margin: 0 auto; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; }
  .logo { max-width: 120px; max-height: 60px; object-fit: contain; }
  .company-name { font-size: 22px; font-weight: 700; color: #111; }
  .invoice-title { font-size: 28px; font-weight: 800; color: #3b82f6; text-align: right; }
  .invoice-meta { text-align: right; color: #555; margin-top: 4px; }
  .parties { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 32px; }
  .party-label { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; color: #999; margin-bottom: 6px; }
  .party-name { font-size: 15px; font-weight: 600; margin-bottom: 2px; }
  .party-detail { color: #555; line-height: 1.5; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
  th { background: #f5f5f5; text-align: left; padding: 10px 12px; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; color: #555; }
  th:last-child, td:last-child { text-align: right; }
  td { padding: 10px 12px; border-bottom: 1px solid #f0f0f0; }
  .totals { margin-left: auto; max-width: 260px; }
  .total-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 13px; color: #555; }
  .total-final { display: flex; justify-content: space-between; padding: 12px 0 4px; font-size: 16px; font-weight: 700; border-top: 2px solid #111; }
  .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; }
  .footer-label { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; color: #999; margin-bottom: 4px; }
  @media print { body { padding: 20px; } }
</style>
</head>
<body>
<div class="header">
  <div>
    ${data.logoDataUrl ? `<img src="${data.logoDataUrl}" class="logo" alt="Logo" />` : ""}
    <div class="company-name">${data.companyName}</div>
    <div class="party-detail">${data.companyAddress.replace(/\n/g, "<br>")}</div>
    <div class="party-detail">${data.companyEmail}</div>
  </div>
  <div>
    <div class="invoice-title">INVOICE</div>
    <div class="invoice-meta"># ${data.invoiceNumber}</div>
    <div class="invoice-meta">Date: ${data.invoiceDate}</div>
    <div class="invoice-meta">Due: ${data.dueDate}</div>
    <div class="invoice-meta">Terms: ${data.paymentTerms}</div>
  </div>
</div>
<div class="parties">
  <div>
    <div class="party-label">Bill To</div>
    <div class="party-name">${data.clientName}</div>
    <div class="party-detail">${data.clientAddress.replace(/\n/g, "<br>")}</div>
    <div class="party-detail">${data.clientEmail}</div>
  </div>
</div>
<table>
  <thead>
    <tr><th>Description</th><th>Qty</th><th>Rate</th><th>Amount</th></tr>
  </thead>
  <tbody>
    ${data.items.map((item) => {
      const amt = (parseFloat(item.qty) || 0) * (parseFloat(item.rate) || 0);
      return `<tr>
        <td>${item.description}</td>
        <td>${item.qty}</td>
        <td>${fmt(parseFloat(item.rate) || 0)}</td>
        <td>${fmt(amt)}</td>
      </tr>`;
    }).join("")}
  </tbody>
</table>
<div class="totals">
  <div class="total-row"><span>Subtotal</span><span>${fmt(subtotal)}</span></div>
  ${parseFloat(data.taxRate) > 0 ? `<div class="total-row"><span>Tax (${data.taxRate}%)</span><span>${fmt(taxAmount)}</span></div>` : ""}
  <div class="total-final"><span>Total</span><span>${fmt(total)}</span></div>
</div>
${data.notes ? `<div class="footer"><div class="footer-label">Notes</div><div class="party-detail">${data.notes}</div></div>` : ""}
</body>
</html>`;

    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(printContent);
    win.document.close();
    win.onload = () => win.print();
  };

  return (
    <ToolLayout
      title="Invoice Generator"
      description="Create professional invoices with live preview — download as PDF via print"
    >
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setShowPreview(false)}
          className={`tab-btn ${!showPreview ? "active" : ""}`}
        >
          Edit Invoice
        </button>
        <button
          onClick={() => setShowPreview(true)}
          className={`tab-btn ${showPreview ? "active" : ""}`}
        >
          <Eye size={13} />
          Preview
        </button>
        <button onClick={printInvoice} className="action-btn primary ml-auto">
          <Download size={13} />
          Download PDF
        </button>
      </div>

      {!showPreview ? (
        <div className="space-y-6">
          {/* Invoice Info */}
          <div className="bg-card-bg border border-card-border rounded-xl p-5">
            <h3 className="text-sm font-semibold text-text-secondary mb-4">Invoice Details</h3>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <div>
                <label className="text-xs text-text-dimmed block mb-1">Invoice #</label>
                <input type="text" value={data.invoiceNumber} onChange={(e) => update("invoiceNumber", e.target.value)} className="tool-textarea w-full" style={{ height: "34px", padding: "6px 10px" }} />
              </div>
              <div>
                <label className="text-xs text-text-dimmed block mb-1">Invoice Date</label>
                <input type="date" value={data.invoiceDate} onChange={(e) => update("invoiceDate", e.target.value)} className="tool-textarea w-full" style={{ height: "34px", padding: "6px 10px" }} />
              </div>
              <div>
                <label className="text-xs text-text-dimmed block mb-1">Due Date</label>
                <input type="date" value={data.dueDate} onChange={(e) => update("dueDate", e.target.value)} className="tool-textarea w-full" style={{ height: "34px", padding: "6px 10px" }} />
              </div>
              <div>
                <label className="text-xs text-text-dimmed block mb-1">Payment Terms</label>
                <input type="text" value={data.paymentTerms} onChange={(e) => update("paymentTerms", e.target.value)} className="tool-textarea w-full" style={{ height: "34px", padding: "6px 10px" }} placeholder="Net 30" />
              </div>
            </div>
          </div>

          {/* Company & Client */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-card-bg border border-card-border rounded-xl p-5">
              <h3 className="text-sm font-semibold text-text-secondary mb-4">Your Company</h3>
              <div className="space-y-2">
                <div>
                  <label className="text-xs text-text-dimmed block mb-1">Company Name</label>
                  <input type="text" value={data.companyName} onChange={(e) => update("companyName", e.target.value)} className="tool-textarea w-full" style={{ height: "34px", padding: "6px 10px" }} />
                </div>
                <div>
                  <label className="text-xs text-text-dimmed block mb-1">Address</label>
                  <textarea value={data.companyAddress} onChange={(e) => update("companyAddress", e.target.value)} className="tool-textarea w-full" style={{ height: "60px", padding: "6px 10px" }} />
                </div>
                <div>
                  <label className="text-xs text-text-dimmed block mb-1">Email</label>
                  <input type="email" value={data.companyEmail} onChange={(e) => update("companyEmail", e.target.value)} className="tool-textarea w-full" style={{ height: "34px", padding: "6px 10px" }} />
                </div>
                <div>
                  <label className="text-xs text-text-dimmed block mb-1">Logo (optional)</label>
                  <button onClick={() => logoInputRef.current?.click()} className="action-btn text-xs">
                    {data.logoDataUrl ? "Change Logo" : "Upload Logo"}
                  </button>
                  <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogo} />
                </div>
              </div>
            </div>

            <div className="bg-card-bg border border-card-border rounded-xl p-5">
              <h3 className="text-sm font-semibold text-text-secondary mb-4">Bill To</h3>
              <div className="space-y-2">
                <div>
                  <label className="text-xs text-text-dimmed block mb-1">Client Name</label>
                  <input type="text" value={data.clientName} onChange={(e) => update("clientName", e.target.value)} className="tool-textarea w-full" style={{ height: "34px", padding: "6px 10px" }} />
                </div>
                <div>
                  <label className="text-xs text-text-dimmed block mb-1">Address</label>
                  <textarea value={data.clientAddress} onChange={(e) => update("clientAddress", e.target.value)} className="tool-textarea w-full" style={{ height: "60px", padding: "6px 10px" }} />
                </div>
                <div>
                  <label className="text-xs text-text-dimmed block mb-1">Email</label>
                  <input type="email" value={data.clientEmail} onChange={(e) => update("clientEmail", e.target.value)} className="tool-textarea w-full" style={{ height: "34px", padding: "6px 10px" }} />
                </div>
              </div>
            </div>
          </div>

          {/* Line Items */}
          <div className="bg-card-bg border border-card-border rounded-xl p-5">
            <h3 className="text-sm font-semibold text-text-secondary mb-4">Line Items</h3>
            <div className="space-y-2">
              <div className="grid grid-cols-[1fr_80px_100px_100px_40px] gap-2 text-xs text-text-dimmed font-medium px-1">
                <span>Description</span><span className="text-center">Qty</span><span className="text-center">Rate</span><span className="text-right">Amount</span><span />
              </div>
              {data.items.map((item) => {
                const amt = (parseFloat(item.qty) || 0) * (parseFloat(item.rate) || 0);
                return (
                  <div key={item.id} className="grid grid-cols-[1fr_80px_100px_100px_40px] gap-2 items-center">
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => updateItem(item.id, "description", e.target.value)}
                      placeholder="Description..."
                      className="tool-textarea"
                      style={{ height: "34px", padding: "6px 10px" }}
                    />
                    <input
                      type="number"
                      value={item.qty}
                      onChange={(e) => updateItem(item.id, "qty", e.target.value)}
                      className="tool-textarea text-center"
                      style={{ height: "34px", padding: "6px 4px" }}
                    />
                    <input
                      type="number"
                      value={item.rate}
                      onChange={(e) => updateItem(item.id, "rate", e.target.value)}
                      className="tool-textarea text-center"
                      style={{ height: "34px", padding: "6px 4px" }}
                    />
                    <div className="text-right text-sm font-mono text-text-primary pr-1">{fmt(amt)}</div>
                    <button onClick={() => removeItem(item.id)} className="action-btn p-1 justify-center" disabled={data.items.length === 1}>
                      <Trash2 size={12} />
                    </button>
                  </div>
                );
              })}
              <button onClick={addItem} className="action-btn mt-2">
                <Plus size={13} />
                Add Item
              </button>
            </div>

            {/* Totals */}
            <div className="mt-4 pt-4 border-t border-border-subtle ml-auto max-w-xs space-y-2">
              <div className="flex justify-between text-sm text-text-secondary">
                <span>Subtotal</span><span className="font-mono">{fmt(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-sm text-text-secondary">
                  <span>Tax</span>
                  <input
                    type="number"
                    value={data.taxRate}
                    onChange={(e) => update("taxRate", e.target.value)}
                    className="tool-textarea w-16 text-center"
                    style={{ height: "28px", padding: "4px 6px" }}
                  />
                  <span>%</span>
                </div>
                <span className="font-mono text-sm text-text-secondary">{fmt(taxAmount)}</span>
              </div>
              <div className="flex justify-between text-base font-bold border-t border-border-strong pt-2">
                <span>Total</span><span className="font-mono">{fmt(total)}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="bg-card-bg border border-card-border rounded-xl p-5">
            <h3 className="text-sm font-semibold text-text-secondary mb-3">Notes & Terms</h3>
            <textarea
              value={data.notes}
              onChange={(e) => update("notes", e.target.value)}
              placeholder="Additional notes, bank details, or payment instructions..."
              className="tool-textarea w-full"
              style={{ height: "80px", padding: "8px 12px" }}
            />
          </div>
        </div>
      ) : (
        /* Preview */
        <div className="bg-white border border-card-border rounded-xl p-8 text-gray-900 font-sans shadow-sm">
          <div className="flex justify-between items-start mb-8">
            <div>
              {data.logoDataUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={data.logoDataUrl} alt="Company logo" className="max-h-12 max-w-[120px] object-contain mb-2" />
              )}
              <div className="text-xl font-bold">{data.companyName}</div>
              <div className="text-gray-500 text-sm whitespace-pre-line">{data.companyAddress}</div>
              <div className="text-gray-500 text-sm">{data.companyEmail}</div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-extrabold text-blue-500">INVOICE</div>
              <div className="text-gray-500 text-sm mt-1">#{data.invoiceNumber}</div>
              <div className="text-gray-500 text-sm">Date: {data.invoiceDate}</div>
              <div className="text-gray-500 text-sm">Due: {data.dueDate}</div>
              <div className="text-gray-500 text-sm">Terms: {data.paymentTerms}</div>
            </div>
          </div>

          <div className="mb-6">
            <div className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">Bill To</div>
            <div className="font-semibold">{data.clientName}</div>
            <div className="text-gray-500 text-sm whitespace-pre-line">{data.clientAddress}</div>
            <div className="text-gray-500 text-sm">{data.clientEmail}</div>
          </div>

          <table className="w-full text-sm mb-6">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left px-3 py-2 text-xs font-semibold uppercase tracking-wider text-gray-500">Description</th>
                <th className="text-center px-3 py-2 text-xs font-semibold uppercase tracking-wider text-gray-500">Qty</th>
                <th className="text-right px-3 py-2 text-xs font-semibold uppercase tracking-wider text-gray-500">Rate</th>
                <th className="text-right px-3 py-2 text-xs font-semibold uppercase tracking-wider text-gray-500">Amount</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((item) => {
                const amt = (parseFloat(item.qty) || 0) * (parseFloat(item.rate) || 0);
                return (
                  <tr key={item.id} className="border-b border-gray-100">
                    <td className="px-3 py-2">{item.description}</td>
                    <td className="px-3 py-2 text-center">{item.qty}</td>
                    <td className="px-3 py-2 text-right font-mono">{fmt(parseFloat(item.rate) || 0)}</td>
                    <td className="px-3 py-2 text-right font-mono">{fmt(amt)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="ml-auto max-w-xs space-y-1">
            <div className="flex justify-between text-gray-500 text-sm"><span>Subtotal</span><span className="font-mono">{fmt(subtotal)}</span></div>
            {parseFloat(data.taxRate) > 0 && (
              <div className="flex justify-between text-gray-500 text-sm"><span>Tax ({data.taxRate}%)</span><span className="font-mono">{fmt(taxAmount)}</span></div>
            )}
            <div className="flex justify-between text-base font-bold border-t border-gray-200 pt-2"><span>Total</span><span className="font-mono">{fmt(total)}</span></div>
          </div>

          {data.notes && (
            <div className="mt-8 pt-4 border-t border-gray-100">
              <div className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">Notes</div>
              <div className="text-gray-500 text-sm">{data.notes}</div>
            </div>
          )}
        </div>
      )}

      {/* Related Tools */}
      <div className="mt-8 pt-6 border-t border-border-subtle">
        <h2 className="text-sm font-semibold text-text-secondary mb-3">Related Tools</h2>
        <div className="flex flex-wrap gap-2">
          {[
            { name: "QR Code Generator", href: "/qr-code-generator" },
            { name: "Lorem Ipsum", href: "/lorem-ipsum-generator" },
            { name: "UUID Generator", href: "/uuid-generator" },
            { name: "Slug Generator", href: "/slug-generator" },
          ].map((t) => (
            <a key={t.href} href={t.href} className="text-xs text-accent hover:underline px-2 py-1 rounded bg-[var(--dp-bg-subtle)]">
              {t.name}
            </a>
          ))}
        </div>
      </div>
    </ToolLayout>
  );
}
