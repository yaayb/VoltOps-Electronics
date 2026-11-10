import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  Banknote,
  CreditCard,
  Minus,
  Plus,
  Search,
  ShieldCheck,
  Smartphone,
  Tag,
  Trash2,
  Zap,
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useCreateOrder, useValidatePromo } from '../../hooks/useOrders';
import { Order, Product, ValidatedPromoResult } from '../../types';

interface PosTerminalProps {
  products: Product[];
  taxRatePercent: number;
}

interface PosLineItem {
  product: Product;
  quantity: number;
}

export function PosTerminal({
  products,
  taxRatePercent,
}: PosTerminalProps): React.ReactElement {
  const { setReceiptOrder } = useCart();
  const createOrderMutation = useCreateOrder();
  const validatePromoMutation = useValidatePromo();

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('ALL');
  const [posItems, setPosItems] = useState<PosLineItem[]>([]);
  const [customerName, setCustomerName] = useState('Walk-In Hardware Buyer');
  const [customerEmail, setCustomerEmail] = useState('walkin@voltops.io');
  const [paymentMethod, setPaymentMethod] = useState<
    'POS Card Terminal' | 'Tap to Pay NFC' | 'Cash Tender'
  >('POS Card Terminal');

  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<ValidatedPromoResult['promo'] | null>(
    null
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (category !== 'ALL' && p.category !== category) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [products, category, search]);

  const subtotal = useMemo(() => {
    const sum = posItems.reduce(
      (acc, entry) => acc + entry.product.price * entry.quantity,
      0
    );
    return Math.round((sum + Number.EPSILON) * 100) / 100;
  }, [posItems]);

  const discount = useMemo(() => {
    if (!appliedPromo || subtotal < appliedPromo.minSpend) return 0;
    const raw =
      appliedPromo.type === 'PERCENT'
        ? subtotal * (appliedPromo.value / 100)
        : appliedPromo.value;
    return Math.round((Math.min(subtotal, raw) + Number.EPSILON) * 100) / 100;
  }, [appliedPromo, subtotal]);

  const discountedSubtotal = Math.max(0, subtotal - discount);
  const taxAmount =
    Math.round((discountedSubtotal * (taxRatePercent / 100) + Number.EPSILON) * 100) /
    100;
  const total =
    Math.round((discountedSubtotal + taxAmount + Number.EPSILON) * 100) / 100;

  const addProductToRegister = (product: Product): void => {
    if (product.stock <= 0) return;
    setErrorMsg(null);
    setPosItems((prev) => {
      const found = prev.find((i) => i.product.id === product.id);
      if (found) {
        return prev.map((i) =>
          i.product.id === product.id
            ? { product, quantity: Math.min(product.stock, i.quantity + 1) }
            : i
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const adjustQty = (productId: string, nextQty: number): void => {
    if (nextQty <= 0) {
      setPosItems((prev) => prev.filter((i) => i.product.id !== productId));
      return;
    }
    setPosItems((prev) =>
      prev.map((i) =>
        i.product.id === productId
          ? { ...i, quantity: Math.min(i.product.stock, nextQty) }
          : i
      )
    );
  };

  const handleValidatePromo = async (): Promise<void> => {
    if (!promoCodeInput.trim()) return;
    setErrorMsg(null);
    try {
      const res = await validatePromoMutation.mutateAsync({
        code: promoCodeInput.trim().toUpperCase(),
        subtotal,
      });
      setAppliedPromo(res.promo);
      setPromoCodeInput('');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Invalid promo code');
    }
  };

  const handleCompletePosSale = async (): Promise<void> => {
    if (posItems.length === 0) return;
    setErrorMsg(null);
    try {
      const res: { order: Order } = await createOrderMutation.mutateAsync({
        channel: 'POS',
        customerName: customerName.trim() || 'Walk-In Hardware Buyer',
        customerEmail: customerEmail.trim() || 'walkin@voltops.io',
        shippingAddress: 'In-Store Flagship Counter Handover',
        paymentMethod,
        promoCode: appliedPromo?.code,
        items: posItems.map((i) => ({
          productId: i.product.id,
          quantity: i.quantity,
        })),
      });

      setPosItems([]);
      setAppliedPromo(null);
      setReceiptOrder(res.order);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'POS transaction failed');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left Register SKU Grid */}
      <div className="lg:col-span-7 space-y-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Scan SKU barcode or search hardware..."
              className="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
            />
          </div>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200"
          >
            <option value="ALL">All Categories</option>
            <option value="Laptops">Laptops</option>
            <option value="Smartphones">Smartphones</option>
            <option value="Tablets">Tablets</option>
            <option value="Gaming">Gaming</option>
            <option value="Audio">Audio</option>
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {filteredProducts.map((product) => {
            const depleted = product.stock <= 0;
            const nextSn = product.serialUnits?.[0]?.serial;
            return (
              <button
                key={product.id}
                type="button"
                disabled={depleted}
                onClick={() => addProductToRegister(product)}
                className="p-3.5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 hover:border-cyan-500 text-left flex gap-3 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-16 h-16 rounded-xl object-cover bg-slate-100 dark:bg-slate-950 shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[10px] font-mono text-cyan-500 truncate">
                      {product.sku}
                    </span>
                    <span
                      className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                        depleted
                          ? 'bg-rose-500/15 text-rose-500'
                          : 'bg-emerald-500/15 text-emerald-500'
                      }`}
                    >
                      {product.stock} left
                    </span>
                  </div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1 mt-0.5">
                    {product.name}
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="font-mono font-extrabold text-sm text-slate-900 dark:text-white">
                      ${product.price.toFixed(2)}
                    </span>
                    {nextSn && (
                      <span className="text-[10px] font-mono text-slate-500 truncate max-w-[105px]">
                        {nextSn}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Right POS Register Ticket */}
      <div className="lg:col-span-5">
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden flex flex-col">
          <div className="px-5 py-4 bg-slate-950 text-white flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-cyan-400" />
              <h3 className="font-bold text-sm">Walk-In POS Register Terminal</h3>
            </div>
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-400">
              Auto-Serial Lock
            </span>
          </div>

          <div className="p-5 space-y-4">
            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-500 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Walk-in Warranty Buyer Registration */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-mono text-slate-500 mb-1">
                  Buyer Name (Warranty Cert)
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-mono text-slate-500 mb-1">
                  Receipt Email
                </label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            {/* POS Line Items */}
            <div className="min-h-[160px] max-h-64 overflow-y-auto space-y-2 border-y border-slate-200 dark:border-slate-800 py-3">
              {posItems.length === 0 ? (
                <div className="py-10 text-center text-xs text-slate-500">
                  Tap any hardware tile on the left to ring up serialized units.
                </div>
              ) : (
                posItems.map(({ product, quantity }) => (
                  <div
                    key={product.id}
                    className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {product.name}
                      </div>
                      <div className="text-[10px] font-mono text-slate-500">
                        {product.sku} · ${product.price.toFixed(2)}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <div className="inline-flex items-center rounded-lg border border-slate-300 dark:border-slate-800">
                        <button
                          type="button"
                          onClick={() => adjustQty(product.id, quantity - 1)}
                          className="p-1 text-slate-500 hover:text-white"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 text-xs font-mono font-bold text-slate-900 dark:text-white">
                          {quantity}
                        </span>
                        <button
                          type="button"
                          disabled={quantity >= product.stock}
                          onClick={() => adjustQty(product.id, quantity + 1)}
                          className="p-1 text-slate-500 hover:text-white disabled:opacity-30"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => adjustQty(product.id, 0)}
                        className="text-slate-400 hover:text-rose-500"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Promo Input */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Tag className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={promoCodeInput}
                  onChange={(e) => setPromoCodeInput(e.target.value.toUpperCase())}
                  placeholder="Promo code (TECH10 / PRO50)"
                  className="w-full pl-8 pr-3 py-1.5 rounded-lg font-mono text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white"
                />
              </div>
              <button
                type="button"
                disabled={posItems.length === 0 || !promoCodeInput.trim()}
                onClick={() => void handleValidatePromo()}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-white text-xs font-semibold disabled:opacity-40"
              >
                Apply
              </button>
            </div>

            {/* Payment Tender Selector */}
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  { id: 'POS Card Terminal', label: 'Card', icon: CreditCard },
                  { id: 'Tap to Pay NFC', label: 'NFC Tap', icon: Smartphone },
                  { id: 'Cash Tender', label: 'Cash', icon: Banknote },
                ] as const
              ).map((tender) => {
                const Icon = tender.icon;
                const active = paymentMethod === tender.id;
                return (
                  <button
                    key={tender.id}
                    type="button"
                    onClick={() => setPaymentMethod(tender.id)}
                    className={`py-2 px-2 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 ${
                      active
                        ? 'border-cyan-500 bg-cyan-500/15 text-cyan-600 dark:text-cyan-400'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tender.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Register Totals */}
            <div className="space-y-1 text-xs pt-1">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal</span>
                <span className="font-mono">${subtotal.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-500">
                  <span>Promo ({appliedPromo?.code})</span>
                  <span className="font-mono">-${discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-500">
                <span>In-Store Handover</span>
                <span className="font-mono">FREE</span>
              </div>
              {taxRatePercent > 0 && (
                <div className="flex justify-between text-slate-500">
                  <span>Sales Tax ({taxRatePercent}%)</span>
                  <span className="font-mono">${taxAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-extrabold text-slate-900 dark:text-white pt-2 border-t border-slate-200 dark:border-slate-800">
                <span>Total Tender</span>
                <span className="font-mono text-cyan-600 dark:text-cyan-400">
                  ${total.toFixed(2)}
                </span>
              </div>
            </div>

            <button
              type="button"
              disabled={posItems.length === 0 || createOrderMutation.isPending}
              onClick={() => void handleCompletePosSale()}
              className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 disabled:opacity-40"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>
                {createOrderMutation.isPending
                  ? 'Locking Serials...'
                  : 'Complete POS Sale & Issue Warranty Cert'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
