import React from 'react';
import {
  ArrowDownRight,
  Cpu,
  Layers,
  ShieldCheck,
  Sparkles,
  Truck,
  Zap,
} from 'lucide-react';
import { PromoCode } from '../../types';

interface StoreHeroProps {
  storeName: string;
  freeShippingThreshold: number;
  promoCodes: PromoCode[];
  totalAvailableUnits: number;
  onExploreCatalog: () => void;
  onOpenCompare: () => void;
}

export function StoreHero({
  storeName,
  freeShippingThreshold,
  promoCodes,
  totalAvailableUnits,
  onExploreCatalog,
  onOpenCompare,
}: StoreHeroProps): React.ReactElement {
  const activePromos = promoCodes.filter((p) => p.active);

  return (
    <section className="relative overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800/90 bg-gradient-to-br from-slate-900 via-[#020617] to-slate-950 text-white p-6 sm:p-10 lg:p-12 shadow-2xl">
      {/* Subtle Cyan Studio Grid Glow */}
      <div className="pointer-events-none absolute -top-24 -right-24 w-96 h-96 rounded-full bg-cyan-500/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-28 -left-20 w-80 h-80 rounded-full bg-indigo-500/10 blur-3xl" />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <div className="lg:col-span-7 space-y-5">
          <div className="inline-flex flex-wrap items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono">
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            <span>FLAGSHIP SERIALIZED HARDWARE · {totalAvailableUnits} UNITS READY TO SHIP</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.1]">
            Precision Silicon.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400">
              Verified By Serial.
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
            Welcome to <strong>{storeName}</strong>. Every MacBook, Galaxy Ultra, iPhone Pro, console, and studio headphone ships with an individually locked warehouse Serial / IMEI certificate and instant RMA hardware protection.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              type="button"
              onClick={onExploreCatalog}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm shadow-lg shadow-cyan-500/25 transition-all"
            >
              <span>Shop Flagship Hardware</span>
              <ArrowDownRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onOpenCompare}
              className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700 text-sm font-semibold transition-colors"
            >
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>Spec Comparator</span>
            </button>
          </div>
        </div>

        {/* Right Telemetry & Promo Card */}
        <div className="lg:col-span-5 space-y-3">
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-semibold">
                Omnichannel Perks &amp; Promo Engine
              </span>
              <Sparkles className="w-4 h-4 text-cyan-400" />
            </div>

            <div className="space-y-2.5">
              {activePromos.map((promo) => (
                <div
                  key={promo.id}
                  className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-slate-950/90 border border-slate-800/90"
                >
                  <div>
                    <span className="font-mono font-bold text-sm text-cyan-400">
                      {promo.code}
                    </span>
                    <p className="text-xs text-slate-400">
                      {promo.type === 'PERCENT'
                        ? `${promo.value}% OFF`
                        : `$${promo.value} OFF`}{' '}
                      orders ≥ ${promo.minSpend}
                    </p>
                  </div>
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    Active
                  </span>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-slate-800 text-xs">
              <div className="flex items-center gap-2 text-slate-300">
                <Truck className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Free Express ≥ ${freeShippingThreshold}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Auto Serial Certificate</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300 col-span-2">
                <Cpu className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>Live SQLite / Prisma Atomic Stock Locking</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
