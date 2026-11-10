import React, { useState } from 'react';
import {
  Check,
  CheckCircle2,
  Copy,
  Cpu,
  Printer,
  ShieldCheck,
  Store,
  Truck,
  X,
} from 'lucide-react';
import { Order } from '../../types';

interface WarrantyReceiptModalProps {
  order: Order | null;
  onClose: () => void;
}

export function WarrantyReceiptModal({
  order,
  onClose,
}: WarrantyReceiptModalProps): React.ReactElement | null {
  const [copied, setCopied] = useState(false);

  if (!order) return null;

  const allSerials =
    order.serialUnits.length > 0
      ? order.serialUnits.map((u) => u.serial)
      : order.items.flatMap((item) => item.allocatedSerials);

  const handleCopySerials = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(allSerials.join(', '));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard fallback ignored
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-2xl rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-8">
        {/* Top Banner */}
        <div className="px-6 py-5 bg-gradient-to-r from-cyan-500/15 via-slate-900/5 to-emerald-500/15 dark:from-cyan-500/20 dark:via-slate-900 dark:to-emerald-500/15 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6 text-emerald-500" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Digital Receipt &amp; Serialized Warranty Certificate
                </h2>
                <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30">
                  {order.channel === 'POS' ? 'WALK-IN POS' : 'STOREFRONT'}
                </span>
              </div>
              <p className="text-xs font-mono text-slate-500 dark:text-slate-400 mt-0.5">
                Order #{order.orderNumber} · Issued{' '}
                {new Date(order.createdAt).toLocaleString()}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Customer & Channel Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs">
            <div>
              <span className="text-slate-500 block mb-0.5">Registered Owner</span>
              <p className="font-semibold text-slate-900 dark:text-white">
                {order.customerName}
              </p>
              <p className="text-slate-500 truncate">{order.customerEmail}</p>
            </div>
            <div>
              <span className="text-slate-500 block mb-0.5">Fulfillment Destination</span>
              <div className="flex items-center gap-1 font-semibold text-slate-900 dark:text-white">
                {order.channel === 'POS' ? (
                  <Store className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
                ) : (
                  <Truck className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
                )}
                <span className="truncate">{order.shippingAddress}</span>
              </div>
              <p className="text-slate-500 mt-0.5">Status: {order.status}</p>
            </div>
            <div>
              <span className="text-slate-500 block mb-0.5">Payment Settlement</span>
              <p className="font-semibold text-slate-900 dark:text-white">
                {order.paymentMethod}
              </p>
              {order.promoCode && (
                <p className="font-mono text-emerald-500 mt-0.5">
                  Promo: {order.promoCode}
                </p>
              )}
            </div>
          </div>

          {/* Allocated Serial / IMEI & Factory Warranty Certificate */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-cyan-500" />
                <h3 className="text-xs font-mono uppercase tracking-wider font-bold text-slate-700 dark:text-slate-200">
                  Allocated Warehouse Serial / IMEI Registry ({allSerials.length} Units)
                </h3>
              </div>
              {allSerials.length > 0 && (
                <button
                  type="button"
                  onClick={() => void handleCopySerials()}
                  className="inline-flex items-center gap-1 text-xs font-mono text-cyan-600 dark:text-cyan-400 hover:underline"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Serials</span>
                    </>
                  )}
                </button>
              )}
            </div>

            <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/5 overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-cyan-500/10 text-slate-700 dark:text-slate-300 font-mono uppercase text-[10px]">
                  <tr>
                    <th className="py-2.5 px-3.5">Serial / IMEI Number</th>
                    <th className="py-2.5 px-3.5">Hardware Model</th>
                    <th className="py-2.5 px-3.5">Term</th>
                    <th className="py-2.5 px-3.5 text-right">Warranty Expires</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cyan-500/15">
                  {order.serialUnits.length > 0
                    ? order.serialUnits.map((unit) => (
                        <tr key={unit.id}>
                          <td className="py-2.5 px-3.5 font-mono font-bold text-cyan-700 dark:text-cyan-300">
                            <span className="inline-flex items-center gap-1.5">
                              <Cpu className="w-3.5 h-3.5 text-cyan-500" />
                              {unit.serial}
                            </span>
                          </td>
                          <td className="py-2.5 px-3.5 text-slate-800 dark:text-slate-200">
                            <div className="font-medium">{unit.product.name}</div>
                            <div className="text-[10px] font-mono text-slate-500">
                              {unit.product.sku}
                            </div>
                          </td>
                          <td className="py-2.5 px-3.5 font-mono text-slate-600 dark:text-slate-300">
                            {unit.product.warrantyMonths} Mo
                          </td>
                          <td className="py-2.5 px-3.5 text-right font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                            {unit.warrantyUntil
                              ? new Date(unit.warrantyUntil).toLocaleDateString()
                              : 'Active'}
                          </td>
                        </tr>
                      ))
                    : order.items.flatMap((item) =>
                        item.allocatedSerials.map((sn) => (
                          <tr key={sn}>
                            <td className="py-2.5 px-3.5 font-mono font-bold text-cyan-700 dark:text-cyan-300">
                              {sn}
                            </td>
                            <td className="py-2.5 px-3.5 text-slate-800 dark:text-slate-200">
                              {item.productName}
                            </td>
                            <td className="py-2.5 px-3.5 font-mono">
                              {item.warrantyMonths} Mo
                            </td>
                            <td className="py-2.5 px-3.5 text-right font-mono text-emerald-500">
                              Registered
                            </td>
                          </tr>
                        ))
                      )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Financial Line Items */}
          <div className="space-y-2 border-t border-slate-200 dark:border-slate-800 pt-4 text-xs">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between">
                <div>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {item.quantity}x {item.productName}
                  </span>
                  <span className="ml-2 font-mono text-[11px] text-slate-500">
                    (${item.unitPrice.toFixed(2)} ea)
                  </span>
                </div>
                <span className="font-mono font-medium text-slate-900 dark:text-white">
                  ${(item.unitPrice * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}

            <div className="border-t border-slate-200 dark:border-slate-800 pt-3 space-y-1.5">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal</span>
                <span className="font-mono">${order.subtotal.toFixed(2)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-emerald-500">
                  <span>Discount {order.promoCode ? `(${order.promoCode})` : ''}</span>
                  <span className="font-mono">-${order.discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-500">
                <span>Shipping</span>
                <span className="font-mono">
                  {order.shippingFee === 0 ? 'FREE' : `$${order.shippingFee.toFixed(2)}`}
                </span>
              </div>
              {order.taxAmount > 0 && (
                <div className="flex justify-between text-slate-500">
                  <span>Tax</span>
                  <span className="font-mono">${order.taxAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-bold text-slate-900 dark:text-white pt-2 border-t border-slate-200 dark:border-slate-800">
                <span>Total Paid</span>
                <span className="font-mono text-cyan-600 dark:text-cyan-400">
                  ${order.total.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:border-cyan-500 transition-colors"
          >
            <Printer className="w-4 h-4 text-cyan-500" />
            <span>Print Warranty Certificate</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
