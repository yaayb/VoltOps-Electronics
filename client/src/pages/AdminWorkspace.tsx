import React, { useState } from 'react';
import {
  BarChart3,
  Boxes,
  Cpu,
  Lock,
  PackageCheck,
  Settings,
  ShieldCheck,
  Terminal,
  Wrench,
  Zap,
} from 'lucide-react';
import { AnalyticsOverview } from '../components/admin/AnalyticsOverview';
import { InventoryManager } from '../components/admin/InventoryManager';
import { OrderFulfillmentTable } from '../components/admin/OrderFulfillmentTable';
import { PosTerminal } from '../components/admin/PosTerminal';
import { RmaRepairDesk } from '../components/admin/RmaRepairDesk';
import { SerialRegistry } from '../components/admin/SerialRegistry';
import { StoreSettingsPanel } from '../components/admin/StoreSettingsPanel';
import { useAuth } from '../context/AuthContext';
import { useOrders } from '../hooks/useOrders';
import { useProducts, useStoreSettings } from '../hooks/useProducts';
import { useRmaTickets, useSerials } from '../hooks/useSerials';

type AdminTab =
  | 'analytics'
  | 'inventory'
  | 'pos'
  | 'orders'
  | 'serials'
  | 'rma'
  | 'settings';

export function AdminWorkspace(): React.ReactElement {
  const { user, login, openAuthModal } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>('analytics');
  const [rmaPrefill, setRmaPrefill] = useState<{
    serial: string;
    customer: string;
  } | null>(null);
  const [gateLoading, setGateLoading] = useState(false);

  const isAuthorized = user?.role === 'ADMIN' || user?.role === 'STAFF';

  const { data: products = [] } = useProducts({});
  const { data: settingsData } = useStoreSettings();
  const { data: orders = [] } = useOrders({}, isAuthorized);
  const { data: serials = [] } = useSerials({}, isAuthorized);
  const { data: rmaTickets = [] } = useRmaTickets({}, isAuthorized);

  const handleQuickRoleSignIn = async (
    email: string,
    password: string
  ): Promise<void> => {
    setGateLoading(true);
    try {
      await login(email, password);
    } finally {
      setGateLoading(false);
    }
  };

  if (!isAuthorized) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-16">
        <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl text-center space-y-6">
          <div className="w-14 h-14 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center mx-auto">
            <Lock className="w-7 h-7 text-cyan-500" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-mono uppercase tracking-widest text-cyan-500 font-bold">
              RBAC Protected Back-Office
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              Merchant SaaS Console Access Required
            </h1>
            <p className="text-sm text-slate-500 max-w-lg mx-auto">
              Inventory valuation analytics, serialized SKU minting, Walk-In POS register, and the RMA hardware repair bench require an active{' '}
              <strong className="font-mono text-cyan-500">ADMIN</strong> or{' '}
              <strong className="font-mono text-emerald-500">STAFF</strong> JWT session.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg mx-auto">
            <button
              type="button"
              disabled={gateLoading}
              onClick={() =>
                void handleQuickRoleSignIn('admin@voltops.io', 'Admin123!')
              }
              className="p-4 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-left transition-all shadow-lg shadow-cyan-500/20"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs uppercase">Sign in as ADMIN</span>
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="text-sm mt-1">admin@voltops.io</div>
              <div className="text-[11px] opacity-80 font-normal">
                Full SKU Minting, POS, Orders, RMA &amp; Settings
              </div>
            </button>

            <button
              type="button"
              disabled={gateLoading}
              onClick={() =>
                void handleQuickRoleSignIn('staff@voltops.io', 'Staff123!')
              }
              className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-950 hover:border-emerald-500 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold text-left transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs uppercase text-emerald-500">
                  Sign in as STAFF
                </span>
                <Terminal className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-sm mt-1">staff@voltops.io</div>
              <div className="text-[11px] text-slate-500 font-normal">
                Walk-In POS, Stock Sync, Fulfillment &amp; RMA Bench
              </div>
            </button>
          </div>

          <button
            type="button"
            onClick={openAuthModal}
            className="text-xs font-mono text-slate-500 hover:text-cyan-500 underline"
          >
            Or sign in manually with custom credentials
          </button>
        </div>
      </main>
    );
  }

  const lowStockThreshold = settingsData?.settings.lowStockThreshold ?? 3;
  const taxRatePercent = settingsData?.settings.taxRatePercent ?? 0;
  const openRmaCount = rmaTickets.filter((t) => t.status !== 'RESOLVED').length;
  const pendingOrdersCount = orders.filter((o) => o.status === 'PENDING').length;

  const navItems: Array<{
    id: AdminTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
  }> = [
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'inventory', label: 'SKU & Stock', icon: Boxes, badge: products.length },
    { id: 'pos', label: 'Walk-In POS', icon: Zap },
    {
      id: 'orders',
      label: 'Orders',
      icon: PackageCheck,
      badge: pendingOrdersCount > 0 ? pendingOrdersCount : undefined,
    },
    { id: 'serials', label: 'Serial / IMEI', icon: Cpu, badge: serials.length },
    {
      id: 'rma',
      label: 'RMA Desk',
      icon: Wrench,
      badge: openRmaCount > 0 ? openRmaCount : undefined,
    },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Console Header & Sub-Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono uppercase tracking-wider text-cyan-500 font-bold">
              Merchant SaaS Back-Office Console
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-500">
              {user.role} SESSION
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-0.5">
            Omnichannel Operations &amp; Serialized Inventory Control
          </h1>
        </div>
      </div>

      {/* Horizontal Module Switcher */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {navItems.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap border transition-all ${
                active
                  ? 'bg-cyan-500 text-slate-950 border-cyan-500 shadow-md shadow-cyan-500/20'
                  : 'bg-white dark:bg-slate-900/80 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-cyan-500/40'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span
                  className={`px-1.5 py-0.5 rounded-md font-mono text-[10px] ${
                    active
                      ? 'bg-slate-950 text-cyan-400'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Active SaaS Module */}
      {activeTab === 'analytics' && (
        <AnalyticsOverview
          products={products}
          orders={orders}
          serials={serials}
          lowStockThreshold={lowStockThreshold}
          onNavigateTab={(target) => setActiveTab(target)}
        />
      )}

      {activeTab === 'inventory' && (
        <InventoryManager
          products={products}
          lowStockThreshold={lowStockThreshold}
        />
      )}

      {activeTab === 'pos' && (
        <PosTerminal products={products} taxRatePercent={taxRatePercent} />
      )}

      {activeTab === 'orders' && <OrderFulfillmentTable orders={orders} />}

      {activeTab === 'serials' && (
        <SerialRegistry
          serials={serials}
          onStartRmaForSerial={(serial, customer) => {
            setRmaPrefill({ serial, customer });
            setActiveTab('rma');
          }}
        />
      )}

      {activeTab === 'rma' && (
        <RmaRepairDesk
          tickets={rmaTickets}
          serials={serials}
          prefillSerial={rmaPrefill?.serial}
          prefillCustomer={rmaPrefill?.customer}
          onClearPrefill={() => setRmaPrefill(null)}
        />
      )}

      {activeTab === 'settings' && settingsData && (
        <StoreSettingsPanel
          settings={settingsData.settings}
          promoCodes={settingsData.promoCodes}
        />
      )}
    </main>
  );
}
