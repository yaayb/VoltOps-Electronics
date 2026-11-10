import React, { useState } from 'react';
import { Cpu, Search, ShieldCheck, Wrench } from 'lucide-react';
import { SerialUnitDetail } from '../../types';

interface SerialRegistryProps {
  serials: SerialUnitDetail[];
  onStartRmaForSerial: (serial: string, customerName: string) => void;
}

export function SerialRegistry({
  serials,
  onStartRmaForSerial,
}: SerialRegistryProps): React.ReactElement {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filtered = serials.filter((unit) => {
    if (statusFilter !== 'ALL' && unit.status !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        unit.serial.toLowerCase().includes(q) ||
        unit.product.sku.toLowerCase().includes(q) ||
        unit.product.name.toLowerCase().includes(q) ||
        (unit.customerName?.toLowerCase().includes(q) ?? false) ||
        (unit.order?.orderNumber.toLowerCase().includes(q) ?? false)
      );
    }
    return true;
  });

  return (
    <div className="space-y-5">
      {/* Search & Status Filter Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Serial / IMEI (e.g. SN-APLMBP1-1001), SKU, buyer name, or order #..."
            className="w-full pl-9 pr-3 py-2 rounded-xl font-mono text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center gap-1.5">
          {(['ALL', 'IN_STOCK', 'SOLD', 'RMA'] as const).map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-2 rounded-xl text-xs font-mono font-bold transition-colors ${
                statusFilter === status
                  ? 'bg-cyan-500 text-slate-950'
                  : 'bg-slate-100 dark:bg-slate-950 text-slate-500 border border-transparent dark:border-slate-800'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Registry Table */}
      <div className="rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 font-mono uppercase border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">Serial / IMEI</th>
                <th className="py-3 px-4">Hardware SKU</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Registered Buyer / Order</th>
                <th className="py-3 px-4">Warranty Coverage</th>
                <th className="py-3 px-4 text-right">RMA Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {filtered.map((unit) => (
                <tr
                  key={unit.id}
                  className="hover:bg-slate-50/70 dark:hover:bg-slate-950/40"
                >
                  <td className="py-3 px-4 font-mono font-bold text-cyan-600 dark:text-cyan-400">
                    <span className="inline-flex items-center gap-1.5">
                      <Cpu className="w-3.5 h-3.5 text-cyan-500" />
                      {unit.serial}
                    </span>
                  </td>

                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-900 dark:text-white">
                      {unit.product.name}
                    </div>
                    <div className="font-mono text-[10px] text-slate-500">
                      {unit.product.sku}
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full font-mono font-bold text-[10px] ${
                        unit.status === 'IN_STOCK'
                          ? 'bg-emerald-500/15 text-emerald-500'
                          : unit.status === 'SOLD'
                          ? 'bg-cyan-500/15 text-cyan-400'
                          : 'bg-amber-500/15 text-amber-500'
                      }`}
                    >
                      {unit.status}
                    </span>
                  </td>

                  <td className="py-3 px-4">
                    {unit.customerName ? (
                      <div>
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {unit.customerName}
                        </div>
                        {unit.order && (
                          <div className="font-mono text-[10px] text-slate-500">
                            {unit.order.orderNumber} ({unit.order.channel})
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-slate-400">Warehouse Vault</span>
                    )}
                  </td>

                  <td className="py-3 px-4">
                    {unit.warrantyUntil ? (
                      <span className="inline-flex items-center gap-1 font-mono text-emerald-500">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Until {new Date(unit.warrantyUntil).toLocaleDateString()}
                      </span>
                    ) : (
                      <span className="text-slate-500">
                        {unit.product.warrantyMonths}M on Sale
                      </span>
                    )}
                  </td>

                  <td className="py-3 px-4 text-right">
                    {unit.status !== 'RMA' ? (
                      <button
                        type="button"
                        onClick={() =>
                          onStartRmaForSerial(
                            unit.serial,
                            unit.customerName || 'Warehouse QA Bench'
                          )
                        }
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-amber-500 hover:text-amber-500 font-semibold"
                      >
                        <Wrench className="w-3.5 h-3.5" />
                        <span>Open RMA</span>
                      </button>
                    ) : (
                      <span className="font-mono text-[11px] text-amber-500">
                        In Repair Bench
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
