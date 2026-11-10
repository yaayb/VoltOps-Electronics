import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Cpu,
  CreditCard,
  Lock,
  MapPin,
  ShieldCheck,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useCreateOrder } from '../../hooks/useOrders';
import { useStoreSettings } from '../../hooks/useProducts';

export function CheckoutModal(): React.ReactElement | null {
  const { user } = useAuth();
  const {
    items,
    subtotal,
    appliedPromo,
    discount,
    isCheckoutOpen,
    closeCheckout,
    clearCart,
    setReceiptOrder,
  } = useCart();

  const { data: settingsData } = useStoreSettings();
  const createOrderMutation = useCreateOrder();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [street, setStreet] = useState('742 Silicon Avenue, Suite 400');
  const [cityStateZip, setCityStateZip] = useState('San Jose, CA 95110');
  const [paymentMethod, setPaymentMethod] = useState<
    'Credit Card (•••• 4242)' | 'Apple Pay Express' | 'VoltOps Net-30 Financing'
  >('Credit Card (•••• 4242)');
  const [stepError, setStepError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setCustomerName(user.name);
      setCustomerEmail(user.email);
    }
  }, [user]);

  useEffect(() => {
    if (isCheckoutOpen) {
      setStep(1);
      setStepError(null);
    }
  }, [isCheckoutOpen]);

  if (!isCheckoutOpen) return null;

  const freeShippingThreshold = settingsData?.settings.freeShippingThreshold ?? 500;
  const taxRatePercent = settingsData?.settings.taxRatePercent ?? 0;

  const discountedSubtotal = Math.max(0, subtotal - discount);
  const shippingFee = discountedSubtotal >= freeShippingThreshold ? 0 : 25;
  const taxAmount =
    Math.round((discountedSubtotal * (taxRatePercent / 100) + Number.EPSILON) * 100) /
    100;
  const finalTotal =
    Math.round((discountedSubtotal + shippingFee + taxAmount + Number.EPSILON) * 100) /
    100;

  const validateStep1 = (): boolean => {
    if (customerName.trim().length < 2) {
      setStepError('Please enter your full recipient name.');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail.trim())) {
      setStepError('Please enter a valid email for your Digital Warranty Certificate.');
      return false;
    }
    if (street.trim().length < 4 || cityStateZip.trim().length < 4) {
      setStepError('Please provide a complete street and city/postal shipping address.');
      return false;
    }
    setStepError(null);
    return true;
  };

  const handlePlaceOrder = async (): Promise<void> => {
    setStepError(null);
    try {
      const response = await createOrderMutation.mutateAsync({
        channel: 'STOREFRONT',
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim(),
        shippingAddress: `${street.trim()}, ${cityStateZip.trim()}`,
        paymentMethod,
        promoCode: appliedPromo?.code,
        items: items.map((entry) => ({
          productId: entry.product.id,
          quantity: entry.quantity,
        })),
      });

      clearCart();
      closeCheckout();
      setReceiptOrder(response.order);
    } catch (err) {
      setStepError(err instanceof Error ? err.message : 'Checkout failed. Please retry.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-2xl rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-8">
        {/* Header & 3-Step Indicator */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-cyan-500" />
              <h2 className="font-bold text-slate-900 dark:text-white text-base sm:text-lg">
                3-Step Serialized Hardware Checkout
              </h2>
            </div>
            <button
              type="button"
              onClick={closeCheckout}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[
              { num: 1, label: '1. Shipping' },
              { num: 2, label: '2. Payment' },
              { num: 3, label: '3. Serial Lock' },
            ].map((s) => {
              const active = step === s.num;
              const done = step > s.num;
              return (
                <div
                  key={s.num}
                  className={`px-3 py-2 rounded-xl text-xs font-mono font-semibold flex items-center justify-center gap-1.5 border ${
                    active
                      ? 'bg-cyan-500/15 border-cyan-500 text-cyan-600 dark:text-cyan-400'
                      : done
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500'
                      : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-400'
                  }`}
                >
                  {done && <CheckCircle2 className="w-3.5 h-3.5" />}
                  <span>{s.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="p-6 space-y-5">
          {stepError && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-500 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{stepError}</span>
            </div>
          )}

          {/* STEP 1: Shipping & Owner Registration */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                <MapPin className="w-4 h-4 text-cyan-500" />
                <span>Owner Warranty Registration &amp; Insured Delivery</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                    Full Name (Printed on Warranty Certificate)
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Jordan Taylor"
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="client@voltops.io"
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                  Street Address
                </label>
                <input
                  type="text"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                  City, State &amp; Postal Code
                </label>
                <input
                  type="text"
                  value={cityStateZip}
                  onChange={(e) => setCityStateZip(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          )}

          {/* STEP 2: Payment Method */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                <CreditCard className="w-4 h-4 text-cyan-500" />
                <span>Select Payment Settlement Method</span>
              </div>

              <div className="space-y-2.5">
                {(
                  [
                    {
                      id: 'Credit Card (•••• 4242)',
                      desc: 'Instant Visa / Mastercard authorization with 3D-Secure protection',
                    },
                    {
                      id: 'Apple Pay Express',
                      desc: 'Biometric hardware enclave settlement',
                    },
                    {
                      id: 'VoltOps Net-30 Financing',
                      desc: '0% APR 12-month enterprise hardware financing',
                    },
                  ] as const
                ).map((option) => (
                  <label
                    key={option.id}
                    className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                      paymentMethod === option.id
                        ? 'border-cyan-500 bg-cyan-500/10'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === option.id}
                      onChange={() => setPaymentMethod(option.id)}
                      className="mt-1 accent-cyan-500"
                    />
                    <div>
                      <div className="text-sm font-bold text-slate-900 dark:text-white">
                        {option.id}
                      </div>
                      <p className="text-xs text-slate-500">{option.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: Serial Allocation Confirmation */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-start gap-3">
                <Cpu className="w-5 h-5 text-cyan-500 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <p className="font-bold text-slate-900 dark:text-white">
                    Atomic Warehouse Serial / IMEI Lock Ready
                  </p>
                  <p className="text-slate-600 dark:text-slate-300">
                    Confirming this order executes a Prisma ACID transaction that locks{' '}
                    <strong>
                      {items.reduce((acc, i) => acc + i.quantity, 0)} IN_STOCK hardware unit(s)
                    </strong>
                    , assigns their unique Serial/IMEI numbers to{' '}
                    <strong>{customerName}</strong>, and activates your warranty certificate.
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 dark:border-slate-800 divide-y divide-slate-200 dark:divide-slate-800 text-xs">
                {items.map(({ product, quantity }) => (
                  <div
                    key={product.id}
                    className="p-3.5 flex items-center justify-between gap-3"
                  >
                    <div>
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {quantity}x {product.name}
                      </span>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono mt-0.5">
                        <span>{product.sku}</span>
                        <span>·</span>
                        <span className="text-emerald-500">
                          {product.warrantyMonths}M Warranty
                        </span>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">
                      ${(product.price * quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1.5 text-xs">
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
                  <span>Insured Express Shipping</span>
                  <span className="font-mono">
                    {shippingFee === 0 ? 'FREE' : `$${shippingFee.toFixed(2)}`}
                  </span>
                </div>
                {taxAmount > 0 && (
                  <div className="flex justify-between text-slate-500">
                    <span>Tax ({taxRatePercent}%)</span>
                    <span className="font-mono">${taxAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-extrabold text-slate-900 dark:text-white pt-2 border-t border-slate-200 dark:border-slate-800">
                  <span>Total Due</span>
                  <span className="font-mono text-cyan-600 dark:text-cyan-400">
                    ${finalTotal.toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Footer */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep((prev) => (prev === 3 ? 2 : 1))}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <button
              type="button"
              onClick={() => {
                if (step === 1 && !validateStep1()) return;
                setStep((prev) => (prev === 1 ? 2 : 3));
              }}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs sm:text-sm"
            >
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              disabled={createOrderMutation.isPending || items.length === 0}
              onClick={() => void handlePlaceOrder()}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs sm:text-sm shadow-lg shadow-emerald-500/25 disabled:opacity-50"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>
                {createOrderMutation.isPending
                  ? 'Allocating Serials...'
                  : `Authorize $${finalTotal.toFixed(2)} & Issue Serials`}
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
