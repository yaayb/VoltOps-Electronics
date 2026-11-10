import React, { useState } from 'react';
import {
  Cpu,
  HardDrive,
  Heart,
  Layers,
  Minus,
  Monitor,
  Plus,
  ShieldCheck,
  ShoppingBag,
  X,
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { Product } from '../../types';

interface QuickViewModalProps {
  product: Product | null;
  onClose: () => void;
}

export function QuickViewModal({
  product,
  onClose,
}: QuickViewModalProps): React.ReactElement | null {
  const { addToCart, wishlistIds, toggleWishlist, compareIds, toggleCompare } =
    useCart();
  const [qty, setQty] = useState(1);

  if (!product) return null;

  const isWishlisted = wishlistIds.includes(product.id);
  const isCompared = compareIds.includes(product.id);
  const nextSerialPreview = product.serialUnits?.[0]?.serial;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="w-full max-w-3xl rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Hardware Image Column */}
          <div className="relative bg-slate-100 dark:bg-slate-950 min-h-[260px]">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            <span className="absolute top-4 left-4 px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-slate-950/85 text-cyan-400 border border-slate-800">
              {product.sku}
            </span>
          </div>

          {/* Datasheet Details Column */}
          <div className="p-6 flex flex-col justify-between space-y-5">
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-xs font-mono uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
                    {product.brand} · {product.category}
                  </p>
                  <h2 className="text-xl font-extrabold text-slate-900 dark:text-white mt-0.5">
                    {product.name}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="text-2xl font-mono font-extrabold text-slate-900 dark:text-white">
                ${product.price.toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </div>

              {/* Technical Datasheet */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2.5 text-xs">
                <div className="flex items-start gap-2.5">
                  <Cpu className="w-4 h-4 text-cyan-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-slate-500 block">Silicon / Architecture</span>
                    <span className="font-semibold text-slate-900 dark:text-slate-200">
                      {product.specProcessor}
                    </span>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <HardDrive className="w-4 h-4 text-cyan-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-slate-500 block">Memory &amp; Storage</span>
                    <span className="font-semibold text-slate-900 dark:text-slate-200">
                      {product.specMemory}
                    </span>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <Monitor className="w-4 h-4 text-cyan-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-slate-500 block">Display / Acoustics</span>
                    <span className="font-semibold text-slate-900 dark:text-slate-200">
                      {product.specDisplay}
                    </span>
                  </div>
                </div>
              </div>

              {/* Live Warehouse Serial Readiness */}
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span className="text-slate-700 dark:text-slate-200 font-medium">
                    {product.warrantyMonths}-Month Serialized Coverage
                  </span>
                </div>
                {nextSerialPreview ? (
                  <span className="font-mono text-[11px] text-emerald-600 dark:text-emerald-400">
                    Next Unit: {nextSerialPreview}
                  </span>
                ) : (
                  <span className="font-mono text-[11px] text-rose-500">Out of Stock</span>
                )}
              </div>
            </div>

            <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="inline-flex items-center rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
                  <button
                    type="button"
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    className="p-2.5 text-slate-500 hover:text-slate-900 dark:hover:text-white"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-3 font-mono font-bold text-sm text-slate-900 dark:text-white">
                    {qty}
                  </span>
                  <button
                    type="button"
                    disabled={qty >= product.stock}
                    onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
                    className="p-2.5 text-slate-500 hover:text-slate-900 dark:hover:text-white disabled:opacity-30"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <button
                  type="button"
                  disabled={product.stock <= 0}
                  onClick={() => {
                    addToCart(product, qty);
                    onClose();
                  }}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-40"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add to Bag</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => toggleCompare(product.id)}
                  className="py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold flex items-center justify-center gap-1.5 text-slate-700 dark:text-slate-300 hover:border-cyan-500"
                >
                  <Layers className="w-3.5 h-3.5 text-cyan-500" />
                  <span>{isCompared ? 'In Comparator' : 'Compare Specs'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => toggleWishlist(product.id)}
                  className="py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold flex items-center justify-center gap-1.5 text-slate-700 dark:text-slate-300 hover:border-rose-500"
                >
                  <Heart
                    className={`w-3.5 h-3.5 ${
                      isWishlisted ? 'fill-rose-500 text-rose-500' : 'text-rose-500'
                    }`}
                  />
                  <span>{isWishlisted ? 'Saved in Wishlist' : 'Save Wishlist'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
