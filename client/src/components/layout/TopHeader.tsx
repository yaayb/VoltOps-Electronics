import React, { useState } from 'react';
import {
  Cpu,
  Heart,
  Layers,
  LogIn,
  LogOut,
  Moon,
  ShieldCheck,
  ShoppingBag,
  Store,
  Sun,
  Terminal,
  UserCheck,
  X,
  Search,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useTheme } from '../../context/ThemeContext';
import { useStoreSettings } from '../../hooks/useProducts';
import { useLookupSerial } from '../../hooks/useSerials';
import { WorkspaceMode } from '../../types';

interface TopHeaderProps {
  workspace: WorkspaceMode;
  onSelectWorkspace: (mode: WorkspaceMode) => void;
  wishlistOnly: boolean;
  onToggleWishlistOnly: () => void;
}

export function TopHeader({
  workspace,
  onSelectWorkspace,
  wishlistOnly,
  onToggleWishlistOnly,
}: TopHeaderProps): React.ReactElement {
  const {
    user,
    isAuthModalOpen,
    openAuthModal,
    closeAuthModal,
    login,
    register,
    logout,
  } = useAuth();
  const { itemCount, subtotal, openCart, compareIds, openCompare, wishlistIds } = useCart();
  const { theme, toggleTheme } = useTheme();
  const { data: settingsData } = useStoreSettings();

  const [authTab, setAuthTab] = useState<'login' | 'register'>('login');
  const [nameInput, setNameInput] = useState('');
  const [emailInput, setEmailInput] = useState('admin@voltops.io');
  const [passwordInput, setPasswordInput] = useState('Admin123!');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSubmitting, setAuthSubmitting] = useState(false);

  const [isVerifyOpen, setIsVerifyOpen] = useState(false);
  const [serialQuery, setSerialQuery] = useState('SN-APLMBP1-1001');
  const lookupMutation = useLookupSerial();

  const storeName = settingsData?.settings.storeName ?? 'VoltOps Electronics';

  const handleAuthSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setAuthError(null);
    setAuthSubmitting(true);
    try {
      if (authTab === 'login') {
        const loggedIn = await login(emailInput, passwordInput);
        closeAuthModal();
        if (loggedIn.role === 'ADMIN' || loggedIn.role === 'STAFF') {
          onSelectWorkspace('ADMIN');
        }
      } else {
        await register(nameInput, emailInput, passwordInput);
        closeAuthModal();
      }
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setAuthSubmitting(false);
    }
  };

  const handleQuickDemoLogin = async (
    email: string,
    password: string,
    targetWorkspace: WorkspaceMode
  ): Promise<void> => {
    setAuthError(null);
    setAuthSubmitting(true);
    try {
      await login(email, password);
      closeAuthModal();
      onSelectWorkspace(targetWorkspace);
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'Demo login failed');
    } finally {
      setAuthSubmitting(false);
    }
  };

  const handleSerialLookup = (e: React.FormEvent): void => {
    e.preventDefault();
    if (!serialQuery.trim()) return;
    lookupMutation.mutate(serialQuery.trim().toUpperCase());
  };

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-slate-200/80 dark:border-slate-800/90 bg-white/90 dark:bg-[#020617]/90 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
          {/* Brand Identity */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => onSelectWorkspace('STOREFRONT')}
              className="flex items-center gap-2.5 group text-left"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center shadow-lg shadow-cyan-500/25">
                <Cpu className="w-5 h-5 text-slate-950 stroke-[2.25]" />
              </div>
              <div className="hidden sm:block">
                <div className="flex items-center gap-2">
                  <span className="font-bold tracking-tight text-slate-900 dark:text-white text-base">
                    {storeName}
                  </span>
                  <span className="text-[10px] font-mono uppercase tracking-widest px-1.5 py-0.5 rounded bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30">
                    Cloud v2
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                  Serialized Omnichannel Hardware OS
                </p>
              </div>
            </button>
          </div>

          {/* Synchronized Workspace Switcher */}
          <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => onSelectWorkspace('STOREFRONT')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                workspace === 'STOREFRONT'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-cyan-400 shadow-sm border border-slate-200/80 dark:border-cyan-500/30'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Store className="w-4 h-4" />
              <span>Storefront</span>
            </button>
            <button
              type="button"
              onClick={() => onSelectWorkspace('ADMIN')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                workspace === 'ADMIN'
                  ? 'bg-cyan-500 text-slate-950 shadow-sm shadow-cyan-500/25'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Terminal className="w-4 h-4" />
              <span>SaaS Console</span>
            </button>
          </div>

          {/* Right Action Cluster */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Public Serial / IMEI Authenticity Verifier */}
            <button
              type="button"
              onClick={() => setIsVerifyOpen(true)}
              title="Verify Serial / IMEI Warranty"
              className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono font-medium border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-cyan-500/50 hover:text-cyan-500 transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-500" />
              <span>Verify SN</span>
            </button>

            {workspace === 'STOREFRONT' && (
              <>
                {/* Spec Comparator Trigger */}
                <button
                  type="button"
                  onClick={openCompare}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    compareIds.length > 0
                      ? 'border-cyan-500/50 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                  title="Side-by-Side Hardware Spec Comparator"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Compare</span>
                  {compareIds.length > 0 && (
                    <span className="font-mono text-[11px] font-bold px-1.5 rounded bg-cyan-500 text-slate-950">
                      {compareIds.length}
                    </span>
                  )}
                </button>

                {/* Wishlist Filter Trigger */}
                <button
                  type="button"
                  onClick={onToggleWishlistOnly}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    wishlistOnly
                      ? 'border-rose-500/50 bg-rose-500/10 text-rose-500'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                  title="Saved Hardware Wishlist"
                >
                  <Heart
                    className={`w-3.5 h-3.5 ${
                      wishlistIds.length > 0 ? 'fill-rose-500 text-rose-500' : ''
                    }`}
                  />
                  {wishlistIds.length > 0 && (
                    <span className="font-mono text-[11px]">{wishlistIds.length}</span>
                  )}
                </button>
              </>
            )}

            {/* Theme Switcher */}
            <button
              type="button"
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-cyan-500 dark:hover:text-cyan-400 transition-colors"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Auth Account / Role Badge */}
            {user ? (
              <div className="flex items-center gap-1.5 pl-1">
                <button
                  type="button"
                  onClick={openAuthModal}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-cyan-500/40 transition-colors"
                  title="Switch Account or Role"
                >
                  <UserCheck className="w-3.5 h-3.5 text-cyan-500" />
                  <span className="hidden md:inline text-xs font-medium text-slate-800 dark:text-slate-200 max-w-[100px] truncate">
                    {user.name}
                  </span>
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-cyan-500/15 text-cyan-600 dark:text-cyan-400">
                    {user.role}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => void logout()}
                  title="Sign Out"
                  className="p-2 rounded-lg text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={openAuthModal}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:border-cyan-500 dark:hover:border-cyan-500 transition-colors"
              >
                <LogIn className="w-3.5 h-3.5 text-cyan-500" />
                <span>Sign In</span>
              </button>
            )}

            {/* Slide-Over Cart Button */}
            <button
              type="button"
              onClick={openCart}
              className="relative inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs sm:text-sm shadow-md shadow-cyan-500/20 transition-all"
            >
              <ShoppingBag className="w-4 h-4 stroke-[2.25]" />
              <span className="hidden sm:inline font-mono">
                ${subtotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className="px-1.5 py-0.5 text-[11px] font-mono font-bold rounded-md bg-slate-950 text-cyan-400">
                {itemCount}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Auth & Quick Role Switcher Modal */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cpu className="w-5 h-5 text-cyan-500" />
                <h2 className="font-bold text-slate-900 dark:text-white">
                  VoltOps Cloud Identity
                </h2>
              </div>
              <button
                type="button"
                onClick={closeAuthModal}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Instant Seeded RBAC Role Presets */}
              <div>
                <p className="text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                  One-Click Seeded RBAC Credentials
                </p>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    disabled={authSubmitting}
                    onClick={() =>
                      void handleQuickDemoLogin('admin@voltops.io', 'Admin123!', 'ADMIN')
                    }
                    className="p-2.5 rounded-xl border border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/20 text-left transition-colors"
                  >
                    <div className="text-xs font-bold text-cyan-600 dark:text-cyan-400 font-mono">
                      ADMIN
                    </div>
                    <div className="text-[11px] text-slate-600 dark:text-slate-300 truncate">
                      Full Console
                    </div>
                  </button>
                  <button
                    type="button"
                    disabled={authSubmitting}
                    onClick={() =>
                      void handleQuickDemoLogin('staff@voltops.io', 'Staff123!', 'ADMIN')
                    }
                    className="p-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-left transition-colors"
                  >
                    <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                      STAFF
                    </div>
                    <div className="text-[11px] text-slate-600 dark:text-slate-300 truncate">
                      POS &amp; RMA
                    </div>
                  </button>
                  <button
                    type="button"
                    disabled={authSubmitting}
                    onClick={() =>
                      void handleQuickDemoLogin('client@voltops.io', 'Client123!', 'STOREFRONT')
                    }
                    className="p-2.5 rounded-xl border border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/20 text-left transition-colors"
                  >
                    <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400 font-mono">
                      CUSTOMER
                    </div>
                    <div className="text-[11px] text-slate-600 dark:text-slate-300 truncate">
                      Storefront
                    </div>
                  </button>
                </div>
              </div>

              <div className="flex rounded-lg bg-slate-100 dark:bg-slate-950 p-1">
                <button
                  type="button"
                  onClick={() => {
                    setAuthTab('login');
                    setAuthError(null);
                  }}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                    authTab === 'login'
                      ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-500'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthTab('register');
                    setEmailInput('');
                    setPasswordInput('');
                    setAuthError(null);
                  }}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                    authTab === 'register'
                      ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-500'
                  }`}
                >
                  Create Customer Account
                </button>
              </div>

              {authError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-500">
                  {authError}
                </div>
              )}

              <form onSubmit={(e) => void handleAuthSubmit(e)} className="space-y-3.5">
                {authTab === 'register' && (
                  <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      placeholder="Taylor Reed"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="admin@voltops.io"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={authSubmitting}
                  className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-semibold text-sm transition-colors"
                >
                  {authSubmitting
                    ? 'Authenticating...'
                    : authTab === 'login'
                    ? 'Sign In with httpOnly JWT'
                    : 'Register & Sign In'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Public Hardware Serial / Warranty Verifier Modal */}
      {isVerifyOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-cyan-500" />
                <h2 className="font-bold text-slate-900 dark:text-white">
                  Serial / IMEI Authenticity &amp; Warranty Check
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsVerifyOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <form onSubmit={handleSerialLookup} className="flex gap-2">
                <input
                  type="text"
                  value={serialQuery}
                  onChange={(e) => setSerialQuery(e.target.value)}
                  placeholder="e.g. SN-APLMBP1-1001"
                  className="flex-1 px-3.5 py-2.5 rounded-xl font-mono text-sm bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                />
                <button
                  type="submit"
                  disabled={lookupMutation.isPending}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-sm"
                >
                  <Search className="w-4 h-4" />
                  <span>Verify</span>
                </button>
              </form>

              {lookupMutation.isError && (
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-500 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>
                    {lookupMutation.error instanceof Error
                      ? lookupMutation.error.message
                      : 'Serial not found'}
                  </span>
                </div>
              )}

              {lookupMutation.data && (
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        <span className="font-mono font-bold text-sm text-cyan-600 dark:text-cyan-400">
                          {lookupMutation.data.serialUnit.serial}
                        </span>
                      </div>
                      <p className="font-semibold text-slate-900 dark:text-white mt-1">
                        {lookupMutation.data.serialUnit.product.name}
                      </p>
                      <p className="text-xs font-mono text-slate-500">
                        SKU: {lookupMutation.data.serialUnit.product.sku}
                      </p>
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-mono font-bold ${
                        lookupMutation.data.serialUnit.status === 'IN_STOCK'
                          ? 'bg-emerald-500/15 text-emerald-500'
                          : lookupMutation.data.serialUnit.status === 'SOLD'
                          ? 'bg-cyan-500/15 text-cyan-400'
                          : 'bg-amber-500/15 text-amber-400'
                      }`}
                    >
                      {lookupMutation.data.serialUnit.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200 dark:border-slate-800 text-xs">
                    <div>
                      <span className="text-slate-500 block">Factory Warranty Term</span>
                      <span className="font-semibold text-slate-900 dark:text-slate-200">
                        {lookupMutation.data.serialUnit.product.warrantyMonths} Months
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Coverage Valid Until</span>
                      <span className="font-mono font-semibold text-slate-900 dark:text-slate-200">
                        {lookupMutation.data.serialUnit.warrantyUntil
                          ? new Date(
                              lookupMutation.data.serialUnit.warrantyUntil
                            ).toLocaleDateString()
                          : 'Activates Upon Purchase'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
