import React, { useState } from 'react';
import {
  ArrowRight,
  FileText,
  PackageCheck,
  Search,
  Store,
  Truck,
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useUpdateOrderStatus } from '../../hooks/useOrders';
import { Order, OrderStatus } from '../../types';

interface OrderFulfillmentTableProps {
  orders: Order[];
}

const NEXT_STATUS_MAP: Record<OrderStatus, OrderStatus | null> = {
  PENDING: 'PACKED',
  PACKED: 'SHIPPED',
  SHIPPED: 'COMPLETED',
  COMPLETED: null,
};

export function OrderFulfillmentTable({
  orders,
}: OrderFulfillmentTableProps): React.ReactElement {
  const { setReceiptOrder } = useCart();
  const updateStatusMutation = useUpdateOrderStatus();

  const [channelFilter, setChannelFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  const filteredOrders = orders.filter((o) => {
    if (channelFilter !== 'ALL' && o.channel !== channelFilter) return false;
    if (statusFilter !== 'ALL' && o.status !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const serialHit = o.serialUnits.some((u) =>
        u.serial.toLowerCase().includes(q)
      );
      return (
        o.orderNumber.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.customerEmail.toLowerCase().includes(q) ||
        serialHit
      );
    }
    return true;
  });

  return (
    <div className="space-y-5">
      {/* Filter Toolbar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search order #, buyer name, email, or allocated serial..."
            className="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
          />
        </div>

        <select
          value={channelFilter}
          onChange={(e) => setChannelFilter(e.target.value)}
          className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200"
        >
          <option value="ALL">All Channels</option>
          <option value="STOREFRONT">Storefront E-Commerce</option>
          <option value="POS">Walk-In POS Register</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200"
        >
          <option value="ALL">All Stages</option>
          <option value="PENDING">PENDING</option>
          <option value="PACKED">PACKED</option>
          <option value="SHIPPED">SHIPPED</option>
          <option value="COMPLETED">COMPLETED</option>
        </select>
      </div>

      {/* Orders Table */}
      <div className="rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 overflow-hidden">
        {filteredOrders.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <PackageCheck className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
              No omnichannel orders match your filter
            </p>
            <p className="text-xs text-slate-500">
              Place an order in the Storefront or Walk-In POS Terminal to see real-time fulfillment and serial allocation here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 font-mono uppercase border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">Order &amp; Channel</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Allocated Serials</th>
                  <th className="py-3 px-4">Total</th>
                  <th className="py-3 px-4">Stage</th>
                  <th className="py-3 px-4 text-right">Fulfillment Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {filteredOrders.map((order) => {
                  const nextStage = NEXT_STATUS_MAP[order.status];
                  const serialList =
                    order.serialUnits.length > 0
                      ? order.serialUnits.map((u) => u.serial)
                      : order.items.flatMap((i) => i.allocatedSerials);

                  return (
                    <tr
                      key={order.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-950/40"
                    >
                      <td className="py-3.5 px-4">
                        <div className="font-mono font-bold text-cyan-600 dark:text-cyan-400">
                          {order.orderNumber}
                        </div>
                        <div className="inline-flex items-center gap-1 text-[11px] text-slate-500 mt-0.5">
                          {order.channel === 'POS' ? (
                            <Store className="w-3 h-3 text-emerald-500" />
                          ) : (
                            <Truck className="w-3 h-3 text-cyan-500" />
                          )}
                          <span>{order.channel}</span>
                          <span>·</span>
                          <span>
                            {new Date(order.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {order.customerName}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {order.customerEmail}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-1 max-w-[260px]">
                          {serialList.map((sn) => (
                            <span
                              key={sn}
                              className="px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/25 font-mono text-[10px] text-cyan-700 dark:text-cyan-300"
                            >
                              {sn}
                            </span>
                          ))}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">
                        ${order.total.toFixed(2)}
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-full font-mono font-bold text-[10px] ${
                            order.status === 'COMPLETED'
                              ? 'bg-emerald-500/15 text-emerald-500'
                              : order.status === 'SHIPPED'
                              ? 'bg-cyan-500/15 text-cyan-400'
                              : order.status === 'PACKED'
                              ? 'bg-indigo-500/15 text-indigo-400'
                              : 'bg-amber-500/15 text-amber-500'
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setReceiptOrder(order)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-cyan-500"
                            title="View Digital Warranty Receipt"
                          >
                            <FileText className="w-3.5 h-3.5 text-cyan-500" />
                            <span>Cert</span>
                          </button>

                          {nextStage && (
                            <button
                              type="button"
                              disabled={updateStatusMutation.isPending}
                              onClick={() =>
                                updateStatusMutation.mutate({
                                  id: order.id,
                                  status: nextStage,
                                })
                              }
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold"
                            >
                              <span>Mark {nextStage}</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
