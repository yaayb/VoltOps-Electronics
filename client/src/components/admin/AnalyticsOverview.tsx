import React, { useMemo } from 'react';
import {
  AlertTriangle,
  BarChart3,
  Boxes,
  Cpu,
  DollarSign,
  ShieldAlert,
  TrendingUp,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Order, Product, ProductCategory, SerialUnitDetail } from '../../types';

interface AnalyticsOverviewProps {
  products: Product[];
  orders: Order[];
  serials: SerialUnitDetail[];
  lowStockThreshold: number;
  onNavigateTab: (
    tab: 'inventory' | 'pos' | 'orders' | 'serials' | 'rma'
  ) => void;
}

const CATEGORY_LIST: ProductCategory[] = [
  'Laptops',
  'Smartphones',
  'Tablets',
  'Gaming',
  'Audio',
];

const PIE_COLORS = ['#06B6D4', '#10B981', '#F59E0B'];

export function AnalyticsOverview({
  products,
  orders,
  serials,
  lowStockThreshold,
  onNavigateTab,
}: AnalyticsOverviewProps): React.ReactElement {
  const inventoryValuation = useMemo(
    () =>
      products.reduce((sum, p) => sum + p.price * p.stock, 0),
    [products]
  );

  const totalUnitsInStock = useMemo(
    () => products.reduce((sum, p) => sum + p.stock, 0),
    [products]
  );

  const grossRevenue = useMemo(
    () => orders.reduce((sum, o) => sum + o.total, 0),
    [orders]
  );

  const posOrdersCount = useMemo(
    () => orders.filter((o) => o.channel === 'POS').length,
    [orders]
  );

  const storefrontOrdersCount = useMemo(
    () => orders.filter((o) => o.channel === 'STOREFRONT').length,
    [orders]
  );

  const lowStockProducts = useMemo(
    () => products.filter((p) => p.stock <= lowStockThreshold),
    [products, lowStockThreshold]
  );

  const categoryValuationData = useMemo(() => {
    return CATEGORY_LIST.map((cat) => {
      const catProducts = products.filter((p) => p.category === cat);
      const valuation = Math.round(
        catProducts.reduce((sum, p) => sum + p.price * p.stock, 0)
      );
      const units = catProducts.reduce((sum, p) => sum + p.stock, 0);
      return {
        category: cat,
        valuation,
        units,
      };
    });
  }, [products]);

  const serialLifecycleData = useMemo(() => {
    const inStock = serials.filter((s) => s.status === 'IN_STOCK').length;
    const sold = serials.filter((s) => s.status === 'SOLD').length;
    const rma = serials.filter((s) => s.status === 'RMA').length;
    return [
      { name: 'IN_STOCK', value: inStock },
      { name: 'SOLD', value: sold },
      { name: 'RMA', value: rma },
    ];
  }, [serials]);

  const activeRmaCount = serialLifecycleData[2]?.value ?? 0;

  return (
    <div className="space-y-6">
      {/* KPI Telemetry Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-slate-500">
              Live Warehouse Valuation
            </span>
            <div className="p-2 rounded-xl bg-cyan-500/15 text-cyan-500">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-mono font-extrabold text-slate-900 dark:text-white">
            ${inventoryValuation.toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </div>
          <p className="text-xs text-slate-500">
            Across {products.length} SKUs &amp; {totalUnitsInStock} IN_STOCK units
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-slate-500">
              Omnichannel Revenue
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-500">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-mono font-extrabold text-slate-900 dark:text-white">
            ${grossRevenue.toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </div>
          <p className="text-xs text-slate-500">
            {storefrontOrdersCount} Storefront · {posOrdersCount} Walk-In POS
          </p>
        </div>

        <div
          onClick={() => onNavigateTab('serials')}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 hover:border-cyan-500/40 cursor-pointer transition-colors space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-slate-500">
              Tracked Serials / IMEIs
            </span>
            <div className="p-2 rounded-xl bg-indigo-500/15 text-indigo-400">
              <Cpu className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-mono font-extrabold text-slate-900 dark:text-white">
            {serials.length} Units
          </div>
          <p className="text-xs text-slate-500">
            {serialLifecycleData[0]?.value ?? 0} Ready ·{' '}
            {serialLifecycleData[1]?.value ?? 0} Sold · {activeRmaCount} RMA
          </p>
        </div>

        <div
          onClick={() => onNavigateTab('inventory')}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 hover:border-amber-500/40 cursor-pointer transition-colors space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-slate-500">
              Low-Stock Watchlist
            </span>
            <div className="p-2 rounded-xl bg-amber-500/15 text-amber-500">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-mono font-extrabold text-amber-500">
            {lowStockProducts.length} SKUs
          </div>
          <p className="text-xs text-slate-500">
            Alert threshold ≤ {lowStockThreshold} serialized units
          </p>
        </div>
      </div>

      {/* Recharts Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Category Inventory Valuation BarChart */}
        <div className="lg:col-span-8 p-6 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-cyan-500" />
              <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                Warehouse Capital Valuation by Hardware Category (USD)
              </h3>
            </div>
            <span className="text-xs font-mono text-slate-500">Live Prisma Sync</span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={categoryValuationData}
                margin={{ top: 8, right: 16, left: 8, bottom: 4 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.35} />
                <XAxis
                  dataKey="category"
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(val: number) => `$${(val / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#1e293b',
                    borderRadius: '12px',
                    color: '#f8fafc',
                    fontSize: '12px',
                  }}
                />
                <Bar
                  dataKey="valuation"
                  name="Inventory Value ($)"
                  fill="#06B6D4"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Serialized Unit Lifecycle PieChart */}
        <div className="lg:col-span-4 p-6 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-4">
          <div className="flex items-center gap-2">
            <Boxes className="w-4 h-4 text-cyan-500" />
            <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
              Serial / IMEI Fleet Status
            </h3>
          </div>

          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={serialLifecycleData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={78}
                  paddingAngle={3}
                >
                  {serialLifecycleData.map((entry, index) => (
                    <Cell
                      key={entry.name}
                      fill={PIE_COLORS[index % PIE_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#1e293b',
                    borderRadius: '12px',
                    color: '#f8fafc',
                    fontSize: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            {serialLifecycleData.map((item, idx) => (
              <div
                key={item.name}
                className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800"
              >
                <div
                  className="text-[10px] font-mono font-bold"
                  style={{ color: PIE_COLORS[idx] }}
                >
                  {item.name}
                </div>
                <div className="text-base font-mono font-extrabold text-slate-900 dark:text-white mt-0.5">
                  {item.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Low Stock Watchlist Table */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-500" />
            <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
              Replenishment Watchlist (Stock ≤ {lowStockThreshold} Units)
            </h3>
          </div>
          <button
            type="button"
            onClick={() => onNavigateTab('inventory')}
            className="text-xs font-semibold text-cyan-600 dark:text-cyan-400 hover:underline"
          >
            Manage SKU Stock →
          </button>
        </div>

        {lowStockProducts.length === 0 ? (
          <p className="text-xs text-emerald-500 font-medium">
            All hardware SKUs exceed the minimum threshold ({lowStockThreshold} units).
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-slate-500 font-mono uppercase border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-2 pr-4">SKU</th>
                  <th className="py-2 pr-4">Hardware Model</th>
                  <th className="py-2 pr-4">Category</th>
                  <th className="py-2 pr-4">Unit Price</th>
                  <th className="py-2 text-right">Remaining Serials</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {lowStockProducts.map((p) => (
                  <tr key={p.id}>
                    <td className="py-2.5 pr-4 font-mono text-cyan-600 dark:text-cyan-400">
                      {p.sku}
                    </td>
                    <td className="py-2.5 pr-4 font-semibold text-slate-900 dark:text-white">
                      {p.name}
                    </td>
                    <td className="py-2.5 pr-4 text-slate-500">{p.category}</td>
                    <td className="py-2.5 pr-4 font-mono text-slate-700 dark:text-slate-300">
                      ${p.price.toFixed(2)}
                    </td>
                    <td className="py-2.5 text-right">
                      <span
                        className={`px-2.5 py-0.5 rounded-full font-mono font-bold ${
                          p.stock === 0
                            ? 'bg-rose-500/15 text-rose-500'
                            : 'bg-amber-500/15 text-amber-500'
                        }`}
                      >
                        {p.stock} IN_STOCK
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
