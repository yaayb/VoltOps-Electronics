import React, { useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Tag,
  Trash2,
  Truck,
  X,
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useStoreSettings } from '../../hooks/useProducts';
import { useValidatePromo } from '../../hooks/useOrders';

export function CartDrawer(): React.ReactElement | null {
  const {
    items,
    subtotal,
    appliedPromo,
    discount,
    isCartOpen,
    closeCart,
    openCheckout,
    updateQuantity,
    removeFromCart,
    applyValidatedPromo,
  } = useCart();

  const { data: settingsData } = useStoreSettings();
  const validatePromoMutation = useValidatePromo();

  const [promoInput, setPromoInput] = useState('');
  const [promoError, setPromoError] = useState<string | null>(null);

  if (!isCartOpen) return null;

  const freeShippingThreshold = settingsData?.settings.freeShippingThreshold ?? 500;
  const taxRatePercent = settingsData?.settings.taxRatePercent ?? 0;
  const activePromos = (settingsData?.promoCodes ?? []).filter((p) => p.active);

  const discountedSubtotal = Math.max(0, subtotal - discount);
  const amountRemainingForFreeShipping = Math.max(
    0,
    freeShippingThreshold - discountedSubtotal
  );
  const progressPercent =
    freeShippingThreshold <= 0
      ? 100
      : Math.min(100, Math.round((discountedSubtotal / freeShippingThreshold) * 100));

  const shippingFee =
    items.length === 0 ? 0 : discountedSubtotal >= freeShippingThreshold ? 0 : 25;
  const estimatedTax =
    Math.round((discountedSubtotal * (taxRatePercent / 100) + Number.EPSILON) * 100) /
    100;
  const estimatedTotal =
    Math.round((discountedSubtotal + shippingFee + estimatedTax + Number.EPSILON) * 100) /
    100;

  const handleApplyPromo = async (codeToApply: string): Promise<void> => {
    const trimmed = codeToApply.trim().toUpperCase();
    if (!trimmed) return;
    setPromoError(null);
    try {
      const res = await validatePromoMutation.mutateAsync({
        code: trimmed,
        subtotal,
      });
      applyValidatedPromo(res);
      setPromoInput('');
    } catch (err) {
      setPromoError(err instanceof Error ? err.message : 'Invalid promo code');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/70 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white dark:bg-slate-950 border-l border-slate-200 dark:border-slate-800 h-full flex flex-col shadow-2xl">
        {/* Drawer Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="w-5 h-5 text-cyan-500" />
            <h2 className="font-bold text-lg text-slate-900 dark:text-white">
              Hardware Bag
            </h2>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-600 dark:text-cyan-400">
              {items.reduce((acc, i) => acc + i.quantity, 0)} units
            </span>
          </div>
          <button
            type="button"
            onClick={closeCart}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free-Shipping Progress Bar */}
        <div className="px-6 py-3.5 bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between text-xs mb-2">
            <div className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-200">
              <Truck className="w-4 h-4 text-cyan-500" />
              {amountRemainingForFreeShipping === 0 && items.length > 0 ? (
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                  Unlocked FREE Insured Express Shipping!
                </span>
              ) : (
                <span>
                  Add{' '}
                  <strong className="font-mono text-cyan-600 dark:text-cyan-400">
                    ${amountRemainingForFreeShipping.toFixed(2)}
                  </strong>{' '}
                  for Free Express Shipping
                </span>
              )}
            </div>
            <span className="font-mono text-[11px] text-slate-500">{progressPercent}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-300"
              style={{ width: `${items.length === 0 ? 0 : progressPercent}%` }}
            />
          </div>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-12">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center mb-3">
                <ShoppingBag className="w-6 h-6 text-slate-400" />
              </div>
              <p className="font-semibold text-slate-800 dark:text-slate-200">
                Your hardware bag is empty
              </p>
              <p className="text-xs text-slate-500 mt-1 max-w-xs">
                Every device includes automatic warehouse Serial / IMEI allocation and digital warranty registration at checkout.
              </p>
            </div>
          ) : (
            items.map(({ product, quantity }) => (
              <div
                key={product.id}
                className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 flex gap-3.5"
              >
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-20 h-20 rounded-xl object-cover bg-slate-200 dark:bg-slate-800 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-mono uppercase text-cyan-600 dark:text-cyan-400">
                        {product.sku}
                      </span>
                      <h3 className="text-sm font-semibold text-slate-900 dark:text-white leading-snug line-clamp-1">
                        {product.name}
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFromCart(product.id)}
                      className="text-slate-400 hover:text-rose-500 p-1"
                      title="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                    <span>{product.warrantyMonths}M Serialized Warranty</span>
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    <div className="inline-flex items-center rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
                      <button
                        type="button"
                        onClick={() => updateQuantity(product.id, quantity - 1)}
                        className="p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-white"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-2.5 text-xs font-mono font-bold text-slate-900 dark:text-white">
                        {quantity}
                      </span>
                      <button
                        type="button"
                        disabled={quantity >= product.stock}
                        onClick={() => updateQuantity(product.id, quantity + 1)}
                        className="p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-white disabled:opacity-30"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <span className="font-mono font-bold text-sm text-slate-900 dark:text-white">
                      ${(product.price * quantity).toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Promo Engine & Totals Footer */}
        {items.length > 0 && (
          <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 space-y-4">
            {/* Promo Code Input */}
            <div>
              {appliedPromo ? (
                <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                  <div className="flex items-center gap-2 text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {appliedPromo.code}
                    </span>
                    <span className="text-slate-600 dark:text-slate-300">
                      (-${discount.toFixed(2)} saved)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => applyValidatedPromo(null)}
                    className="text-xs text-rose-500 hover:underline font-medium"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={promoInput}
                        onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                        placeholder="Promo code (e.g. TECH10)"
                        className="w-full pl-8 pr-3 py-2 rounded-xl font-mono text-xs bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                    <button
                      type="button"
                      disabled={validatePromoMutation.isPending || !promoInput.trim()}
                      onClick={() => void handleApplyPromo(promoInput)}
                      className="px-3.5 py-2 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-cyan-500 dark:hover:bg-cyan-500 hover:text-slate-950 text-white text-xs font-semibold transition-colors disabled:opacity-40"
                    >
                      Apply
                    </button>
                  </div>

                  {activePromos.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Sparkles className="w-3 h-3 text-cyan-500" />
                      {activePromos.map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => void handleApplyPromo(p.code)}
                          className="text-[11px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/25 hover:bg-cyan-500/20"
                        >
                          {p.code} ({p.type === 'PERCENT' ? `${p.value}%` : `$${p.value}`} off ≥$
                          {p.minSpend})
                        </button>
                      ))}
                    </div>
                  )}

                  {promoError && (
                    <p className="text-xs text-rose-500">{promoError}</p>
                  )}
                </div>
              )}
            </div>

            {/* Financial Breakdown */}
            <div className="space-y-1.5 text-xs border-t border-slate-200 dark:border-slate-800 pt-3">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Subtotal</span>
                <span className="font-mono">${subtotal.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                  <span>Promo Discount ({appliedPromo?.code})</span>
                  <span className="font-mono">-${discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Insured Hardware Shipping</span>
                <span className="font-mono">
                  {shippingFee === 0 ? 'FREE' : `$${shippingFee.toFixed(2)}`}
                </span>
              </div>
              {taxRatePercent > 0 && (
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Estimated Tax ({taxRatePercent}%)</span>
                  <span className="font-mono">${estimatedTax.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-bold text-slate-900 dark:text-white pt-2 border-t border-slate-200 dark:border-slate-800">
                <span>Total</span>
                <span className="font-mono text-cyan-600 dark:text-cyan-400">
                  ${estimatedTotal.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={openCheckout}
              className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25 transition-all"
            >
              <span>Proceed to Serialized Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
