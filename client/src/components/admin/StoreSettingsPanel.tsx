import React, { useEffect, useState } from 'react';
import {
  CheckCircle2,
  Plus,
  Save,
  Settings,
  Tag,
  Trash2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useUpdateSettings } from '../../hooks/useProducts';
import { PromoCode, PromoType, StoreSetting } from '../../types';

interface StoreSettingsPanelProps {
  settings: StoreSetting;
  promoCodes: PromoCode[];
}

export function StoreSettingsPanel({
  settings,
  promoCodes,
}: StoreSettingsPanelProps): React.ReactElement {
  const { user } = useAuth();
  const updateSettingsMutation = useUpdateSettings();

  const isAdmin = user?.role === 'ADMIN';

  const [storeName, setStoreName] = useState(settings.storeName);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(
    String(settings.freeShippingThreshold)
  );
  const [lowStockThreshold, setLowStockThreshold] = useState(
    String(settings.lowStockThreshold)
  );
  const [taxRatePercent, setTaxRatePercent] = useState(
    String(settings.taxRatePercent)
  );
  const [editablePromos, setEditablePromos] = useState<PromoCode[]>(promoCodes);

  const [newCode, setNewCode] = useState('');
  const [newType, setNewType] = useState<PromoType>('PERCENT');
  const [newValue, setNewValue] = useState('15');
  const [newMinSpend, setNewMinSpend] = useState('400');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    setStoreName(settings.storeName);
    setFreeShippingThreshold(String(settings.freeShippingThreshold));
    setLowStockThreshold(String(settings.lowStockThreshold));
    setTaxRatePercent(String(settings.taxRatePercent));
    setEditablePromos(promoCodes);
  }, [settings, promoCodes]);

  const handleAddPromo = (): void => {
    const clean = newCode.trim().toUpperCase();
    if (clean.length < 2) return;
    if (editablePromos.some((p) => p.code === clean)) {
      setErrorMsg(`Promo code "${clean}" already exists.`);
      return;
    }

    setEditablePromos((prev) => [
      ...prev,
      {
        id: `temp-${Date.now()}`,
        code: clean,
        type: newType,
        value: Number.parseFloat(newValue) || 10,
        minSpend: Number.parseFloat(newMinSpend) || 0,
        active: true,
      },
    ]);
    setNewCode('');
    setErrorMsg(null);
  };

  const handleSaveAll = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!isAdmin) return;
    setErrorMsg(null);
    try {
      await updateSettingsMutation.mutateAsync({
        storeName: storeName.trim(),
        freeShippingThreshold: Number.parseFloat(freeShippingThreshold) || 0,
        lowStockThreshold: Number.parseInt(lowStockThreshold, 10) || 0,
        taxRatePercent: Number.parseFloat(taxRatePercent) || 0,
        promoCodes: editablePromos.map((p) => ({
          code: p.code,
          type: p.type,
          value: p.value,
          minSpend: p.minSpend,
          active: p.active,
        })),
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to save settings');
    }
  };

  return (
    <form onSubmit={(e) => void handleSaveAll(e)} className="space-y-6 max-w-4xl">
      {!isAdmin && (
        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-500">
          Viewing in STAFF read-only mode. Sign in as ADMIN (`admin@voltops.io`) to modify global store parameters and promo codes.
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-500">
          {errorMsg}
        </div>
      )}

      {/* Global Store Parameters */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex items-center gap-2">
          <Settings className="w-4 h-4 text-cyan-500" />
          <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
            Omnichannel Storefront &amp; Warehouse Thresholds
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">
              Store Brand Name
            </label>
            <input
              type="text"
              disabled={!isAdmin}
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white disabled:opacity-60"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">
              Free Insured Express Shipping Threshold ($ USD)
            </label>
            <input
              type="number"
              step="1"
              min={0}
              disabled={!isAdmin}
              value={freeShippingThreshold}
              onChange={(e) => setFreeShippingThreshold(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl font-mono text-sm bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white disabled:opacity-60"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">
              Low-Stock Alert Threshold (Serialized Units)
            </label>
            <input
              type="number"
              min={0}
              max={100}
              disabled={!isAdmin}
              value={lowStockThreshold}
              onChange={(e) => setLowStockThreshold(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl font-mono text-sm bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white disabled:opacity-60"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">
              Sales Tax Rate (%)
            </label>
            <input
              type="number"
              step="0.1"
              min={0}
              max={30}
              disabled={!isAdmin}
              value={taxRatePercent}
              onChange={(e) => setTaxRatePercent(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl font-mono text-sm bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white disabled:opacity-60"
            />
          </div>
        </div>
      </div>

      {/* Promo Codes Manager */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex items-center gap-2">
          <Tag className="w-4 h-4 text-cyan-500" />
          <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
            Promotional Discount Engine
          </h3>
        </div>

        <div className="space-y-2.5">
          {editablePromos.map((promo) => (
            <div
              key={promo.code}
              className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3">
                <span className="font-mono font-bold text-sm text-cyan-600 dark:text-cyan-400">
                  {promo.code}
                </span>
                <span className="text-xs text-slate-600 dark:text-slate-300">
                  {promo.type === 'PERCENT'
                    ? `${promo.value}% OFF`
                    : `$${promo.value} FIXED OFF`}{' '}
                  · Min Spend ${promo.minSpend}
                </span>
              </div>

              {isAdmin && (
                <div className="flex items-center gap-3">
                  <label className="inline-flex items-center gap-1.5 text-xs cursor-pointer">
                    <input
                      type="checkbox"
                      checked={promo.active}
                      onChange={() =>
                        setEditablePromos((prev) =>
                          prev.map((p) =>
                            p.code === promo.code ? { ...p, active: !p.active } : p
                          )
                        )
                      }
                      className="accent-cyan-500"
                    />
                    <span className="text-slate-600 dark:text-slate-300">Active</span>
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setEditablePromos((prev) =>
                        prev.filter((p) => p.code !== promo.code)
                      )
                    }
                    className="p-1.5 text-slate-400 hover:text-rose-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {isAdmin && (
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5 pt-2 border-t border-slate-200 dark:border-slate-800">
            <input
              type="text"
              value={newCode}
              onChange={(e) => setNewCode(e.target.value.toUpperCase())}
              placeholder="CODE (e.g. VIP20)"
              className="px-3 py-2 rounded-xl font-mono text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white"
            />
            <select
              value={newType}
              onChange={(e) => setNewType(e.target.value as PromoType)}
              className="px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white"
            >
              <option value="PERCENT">Percent (%)</option>
              <option value="FIXED">Fixed ($)</option>
            </select>
            <input
              type="number"
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              placeholder="Value"
              className="px-3 py-2 rounded-xl font-mono text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white"
            />
            <input
              type="number"
              value={newMinSpend}
              onChange={(e) => setNewMinSpend(e.target.value)}
              placeholder="Min Spend ($)"
              className="px-3 py-2 rounded-xl font-mono text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white"
            />
            <button
              type="button"
              onClick={handleAddPromo}
              className="inline-flex items-center justify-center gap-1 px-3 py-2 rounded-xl bg-slate-800 hover:bg-cyan-500 hover:text-slate-950 text-white text-xs font-bold transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Code</span>
            </button>
          </div>
        )}
      </div>

      {isAdmin && (
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={updateSettingsMutation.isPending}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold text-xs sm:text-sm shadow-lg shadow-cyan-500/25"
          >
            <Save className="w-4 h-4" />
            <span>
              {updateSettingsMutation.isPending
                ? 'Saving Configuration...'
                : 'Save Store Settings & Promo Codes'}
            </span>
          </button>

          {savedSuccess && (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-500">
              <CheckCircle2 className="w-4 h-4" />
              <span>Synchronized across Storefront &amp; POS!</span>
            </span>
          )}
        </div>
      )}
    </form>
  );
}
