import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CartDrawer } from './components/layout/CartDrawer';
import { TopHeader } from './components/layout/TopHeader';
import { WarrantyReceiptModal } from './components/storefront/WarrantyReceiptModal';
import { AuthProvider } from './context/AuthContext';
import { CartProvider, useCart } from './context/CartContext';
import { ThemeProvider } from './context/ThemeContext';
import { AdminWorkspace } from './pages/AdminWorkspace';
import { StorefrontWorkspace } from './pages/StorefrontWorkspace';
import { WorkspaceMode } from './types';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 15_000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function VoltOpsShell(): React.ReactElement {
  const [workspace, setWorkspace] = useState<WorkspaceMode>('STOREFRONT');
  const [wishlistOnly, setWishlistOnly] = useState<boolean>(false);
  const { receiptOrder, setReceiptOrder } = useCart();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-[#020617] dark:text-slate-100 flex flex-col transition-colors">
      <TopHeader
        workspace={workspace}
        onSelectWorkspace={setWorkspace}
        wishlistOnly={wishlistOnly}
        onToggleWishlistOnly={() => setWishlistOnly((prev) => !prev)}
      />

      <div className="flex-1">
        {workspace === 'STOREFRONT' ? (
          <StorefrontWorkspace wishlistOnly={wishlistOnly} />
        ) : (
          <AdminWorkspace />
        )}
      </div>

      <footer className="border-t border-slate-200 dark:border-slate-800/80 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500 font-mono">
          <span>VoltOps Cloud — Full-Stack Electronics SaaS &amp; Omnichannel Platform</span>
          <span>Express + Prisma SQLite ACID Serial Locking · React 18 + TypeScript Strict</span>
        </div>
      </footer>

      <CartDrawer />
      <WarrantyReceiptModal
        order={receiptOrder}
        onClose={() => setReceiptOrder(null)}
      />
    </div>
  );
}

export function App(): React.ReactElement {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <CartProvider>
            <VoltOpsShell />
          </CartProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
