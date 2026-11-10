import React, { useState } from 'react';
import {
  Check,
  Eye,
  EyeOff,
  Plus,
  Save,
  Search,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useUpdateProduct } from '../../hooks/useProducts';
import { Product } from '../../types';
import { AddSkuModal } from './AddSkuModal';

interface InventoryManagerProps {
  products: Product[];
  lowStockThreshold: number;
}

interface RowDraft {
  price: string;
  stock: string;
}

export function InventoryManager({
  products,
  lowStockThreshold,
}: InventoryManagerProps): React.ReactElement {
  const { user } = useAuth();
  const updateProductMutation = useUpdateProduct();

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [isAddSkuOpen, setIsAddSkuOpen] = useState(false);
  const [drafts, setDrafts] = useState<Record<string, RowDraft>>({});
  const [savedRowId, setSavedRowId] = useState<string | null>(null);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  const isAdmin = user?.role === 'ADMIN';

  const filteredProducts = products.filter((p) => {
    if (categoryFilter !== 'ALL' && p.category !== categoryFilter) return false;
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

  const getDraft = (product: Product): RowDraft => {
    return (
      drafts[product.id] ?? {
        price: product.price.toFixed(2),
        stock: String(product.stock),
      }
    );
  };

  const handleDraftChange = (
    product: Product,
    field: keyof RowDraft,
    value: string
  ): void => {
    const current = getDraft(product);
    setDrafts((prev) => ({
      ...prev,
      [product.id]: {
        ...current,
        [field]: value,
      },
    }));
  };

  const handleSaveRow = async (product: Product): Promise<void> => {
    setErrorBanner(null);
    const draft = getDraft(product);
    const parsedPrice = Number.parseFloat(draft.price);
    const parsedStock = Number.parseInt(draft.stock, 10);

    if (Number.isNaN(parsedPrice) || parsedPrice <= 0) {
      setErrorBanner('Price must be greater than $0.00');
      return;
    }
    if (Number.isNaN(parsedStock) || parsedStock < 0) {
      setErrorBanner('Stock count must be 0 or greater');
      return;
    }

    try {
      await updateProductMutation.mutateAsync({
        id: product.id,
        payload: {
          price: parsedPrice,
          stock: parsedStock,
        },
      });
      setDrafts((prev) => {
        const next = { ...prev };
        delete next[product.id];
        return next;
      });
      setSavedRowId(product.id);
      setTimeout(() => setSavedRowId(null), 1800);
    } catch (err) {
      setErrorBanner(err instanceof Error ? err.message : 'Update failed');
    }
  };

  const handleToggleBoolean = async (
    product: Product,
    field: 'visible' | 'featured'
  ): Promise<void> => {
    setErrorBanner(null);
    try {
      await updateProductMutation.mutateAsync({
        id: product.id,
        payload: { [field]: !product[field] },
      });
    } catch (err) {
      setErrorBanner(err instanceof Error ? err.message : 'Toggle failed');
    }
  };

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search SKU, model, or brand..."
              className="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
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

        {isAdmin && (
          <button
            type="button"
            onClick={() => setIsAddSkuOpen(true)}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Add SKU &amp; Mint Serials</span>
          </button>
        )}
      </div>

      {errorBanner && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-500">
          {errorBanner}
        </div>
      )}

      {/* Inline Editable SKU Table */}
      <div className="rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 font-mono uppercase border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">Hardware SKU</th>
                <th className="py-3 px-4">Specs</th>
                <th className="py-3 px-4">MSRP ($ USD)</th>
                <th className="py-3 px-4">Serialized Stock</th>
                <th className="py-3 px-4 text-center">Storefront</th>
                <th className="py-3 px-4 text-right">Sync Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {filteredProducts.map((product) => {
                const draft = getDraft(product);
                const isDirty =
                  Number.parseFloat(draft.price) !== product.price ||
                  Number.parseInt(draft.stock, 10) !== product.stock;
                const isLow = product.stock <= lowStockThreshold;

                return (
                  <tr
                    key={product.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-950/40"
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-11 h-11 rounded-lg object-cover bg-slate-100 dark:bg-slate-800 shrink-0"
                        />
                        <div>
                          <div className="font-mono text-[11px] text-cyan-600 dark:text-cyan-400">
                            {product.sku}
                          </div>
                          <div className="font-bold text-slate-900 dark:text-white">
                            {product.name}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {product.brand} · {product.category}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 max-w-[230px]">
                      <div className="truncate text-slate-700 dark:text-slate-300">
                        {product.specProcessor}
                      </div>
                      <div className="truncate text-[11px] text-slate-500">
                        {product.specMemory}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <input
                        type="number"
                        step="0.01"
                        value={draft.price}
                        onChange={(e) =>
                          handleDraftChange(product, 'price', e.target.value)
                        }
                        className="w-28 px-2.5 py-1.5 rounded-lg font-mono text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white focus:border-cyan-500 focus:outline-none"
                      />
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min={0}
                          max={500}
                          value={draft.stock}
                          onChange={(e) =>
                            handleDraftChange(product, 'stock', e.target.value)
                          }
                          className={`w-20 px-2.5 py-1.5 rounded-lg font-mono font-bold text-xs border focus:outline-none ${
                            isLow
                              ? 'bg-amber-500/10 border-amber-500/40 text-amber-500'
                              : 'bg-slate-50 dark:bg-slate-950 border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white'
                          }`}
                        />
                        <span className="text-[11px] font-mono text-slate-500">
                          units
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => void handleToggleBoolean(product, 'visible')}
                          title="Toggle Storefront Visibility"
                          className={`p-1.5 rounded-lg border ${
                            product.visible
                              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-500'
                              : 'border-slate-300 dark:border-slate-700 text-slate-400'
                          }`}
                        >
                          {product.visible ? (
                            <Eye className="w-3.5 h-3.5" />
                          ) : (
                            <EyeOff className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleToggleBoolean(product, 'featured')}
                          title="Toggle Featured Flagship"
                          className={`p-1.5 rounded-lg border ${
                            product.featured
                              ? 'border-cyan-500/30 bg-cyan-500/10 text-cyan-400'
                              : 'border-slate-300 dark:border-slate-700 text-slate-400'
                          }`}
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      {savedRowId === product.id ? (
                        <span className="inline-flex items-center gap-1 text-emerald-500 font-semibold">
                          <Check className="w-3.5 h-3.5" />
                          <span>Synced</span>
                        </span>
                      ) : (
                        <button
                          type="button"
                          disabled={!isDirty || updateProductMutation.isPending}
                          onClick={() => void handleSaveRow(product)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 disabled:bg-slate-200 dark:disabled:bg-slate-800 text-slate-950 disabled:text-slate-400 font-bold text-xs transition-colors"
                        >
                          <Save className="w-3.5 h-3.5" />
                          <span>Save</span>
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <AddSkuModal isOpen={isAddSkuOpen} onClose={() => setIsAddSkuOpen(false)} />
    </div>
  );
}
