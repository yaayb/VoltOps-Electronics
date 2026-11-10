import React from 'react';
import {
  Cpu,
  HardDrive,
  Layers,
  Monitor,
  ShieldCheck,
  ShoppingBag,
  Trash2,
  X,
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { Product } from '../../types';

interface SpecCompareModalProps {
  allProducts: Product[];
}

export function SpecCompareModal({
  allProducts,
}: SpecCompareModalProps): React.ReactElement | null {
  const {
    isCompareOpen,
    closeCompare,
    compareIds,
    toggleCompare,
    clearCompare,
    addToCart,
  } = useCart();

  if (!isCompareOpen) return null;

  const comparedProducts = compareIds
    .map((id) => allProducts.find((p) => p.id === id))
    .filter((p): p is Product => Boolean(p));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="w-full max-w-6xl rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Layers className="w-5 h-5 text-cyan-500" />
            <div>
              <h2 className="font-bold text-slate-900 dark:text-white text-base sm:text-lg">
                Side-by-Side Hardware Spec Comparator
              </h2>
              <p className="text-xs text-slate-500">
                Compare up to 4 serialized electronics SKUs across silicon, memory, display, and warranty
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {comparedProducts.length > 0 && (
              <button
                type="button"
                onClick={clearCompare}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-rose-500 hover:bg-rose-500/10"
              >
                Clear All
              </button>
            )}
            <button
              type="button"
              onClick={closeCompare}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-6">
          {comparedProducts.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <Layers className="w-10 h-10 text-slate-400 mx-auto" />
              <p className="font-bold text-slate-800 dark:text-slate-200">
                No hardware selected for comparison yet
              </p>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Click the <strong className="font-mono text-cyan-500">+ Compare</strong> button on up to 4 product cards in the storefront catalog to inspect silicon specs side by side.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px] border-collapse text-left text-xs sm:text-sm">
                <thead>
                  <tr>
                    <th className="w-44 p-3 align-bottom font-mono text-xs uppercase text-slate-500 border-b border-slate-200 dark:border-slate-800">
                      Specification
                    </th>
                    {comparedProducts.map((product) => (
                      <th
                        key={product.id}
                        className="p-3 align-top border-b border-l border-slate-200 dark:border-slate-800 min-w-[210px]"
                      >
                        <div className="space-y-2.5">
                          <div className="relative">
                            <img
                              src={product.imageUrl}
                              alt={product.name}
                              className="w-full h-32 object-cover rounded-xl bg-slate-100 dark:bg-slate-950"
                            />
                            <button
                              type="button"
                              onClick={() => toggleCompare(product.id)}
                              title="Remove from comparison"
                              className="absolute top-2 right-2 p-1.5 rounded-lg bg-slate-950/80 text-slate-300 hover:text-rose-400"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <div>
                            <span className="text-[10px] font-mono text-cyan-500 block">
                              {product.sku}
                            </span>
                            <div className="font-bold text-slate-900 dark:text-white leading-snug">
                              {product.name}
                            </div>
                          </div>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  <tr>
                    <td className="p-3 font-semibold text-slate-500">Launch MSRP</td>
                    {comparedProducts.map((p) => (
                      <td
                        key={p.id}
                        className="p-3 border-l border-slate-200 dark:border-slate-800 font-mono font-extrabold text-base text-cyan-600 dark:text-cyan-400"
                      >
                        ${p.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-500">Brand / Category</td>
                    {comparedProducts.map((p) => (
                      <td
                        key={p.id}
                        className="p-3 border-l border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200"
                      >
                        {p.brand} · <span className="font-mono text-xs">{p.category}</span>
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-500">
                      <span className="inline-flex items-center gap-1.5">
                        <Cpu className="w-3.5 h-3.5 text-cyan-500" />
                        Processor / Chip
                      </span>
                    </td>
                    {comparedProducts.map((p) => (
                      <td
                        key={p.id}
                        className="p-3 border-l border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 font-medium"
                      >
                        {p.specProcessor}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-500">
                      <span className="inline-flex items-center gap-1.5">
                        <HardDrive className="w-3.5 h-3.5 text-cyan-500" />
                        Memory &amp; Storage
                      </span>
                    </td>
                    {comparedProducts.map((p) => (
                      <td
                        key={p.id}
                        className="p-3 border-l border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200"
                      >
                        {p.specMemory}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-500">
                      <span className="inline-flex items-center gap-1.5">
                        <Monitor className="w-3.5 h-3.5 text-cyan-500" />
                        Display / Output
                      </span>
                    </td>
                    {comparedProducts.map((p) => (
                      <td
                        key={p.id}
                        className="p-3 border-l border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200"
                      >
                        {p.specDisplay}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-500">
                      <span className="inline-flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                        Warranty &amp; Stock
                      </span>
                    </td>
                    {comparedProducts.map((p) => (
                      <td
                        key={p.id}
                        className="p-3 border-l border-slate-200 dark:border-slate-800 font-mono text-xs"
                      >
                        <span className="text-emerald-500 font-semibold">
                          {p.warrantyMonths} Months
                        </span>{' '}
                        · {p.stock} units IN_STOCK
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-500">Action</td>
                    {comparedProducts.map((p) => (
                      <td
                        key={p.id}
                        className="p-3 border-l border-slate-200 dark:border-slate-800"
                      >
                        <button
                          type="button"
                          disabled={p.stock <= 0}
                          onClick={() => {
                            addToCart(p, 1);
                            closeCompare();
                          }}
                          className="w-full py-2 px-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 disabled:opacity-40"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>{p.stock > 0 ? 'Add to Bag' : 'Out of Stock'}</span>
                        </button>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
