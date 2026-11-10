import React, { useMemo, useState } from 'react';
import { useCart } from '../context/CartContext';
import { useProducts, useStoreSettings } from '../hooks/useProducts';
import { Product } from '../types';
import { CheckoutModal } from '../components/storefront/CheckoutModal';
import { ProductGrid } from '../components/storefront/ProductGrid';
import { QuickViewModal } from '../components/storefront/QuickViewModal';
import { SpecCompareModal } from '../components/storefront/SpecCompareModal';
import { StoreHero } from '../components/storefront/StoreHero';

interface StorefrontWorkspaceProps {
  wishlistOnly: boolean;
}

export function StorefrontWorkspace({
  wishlistOnly,
}: StorefrontWorkspaceProps): React.ReactElement {
  const { wishlistIds, openCompare } = useCart();

  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<
    'featured' | 'price_asc' | 'price_desc' | 'newest'
  >('featured');
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  const { data: settingsData } = useStoreSettings();
  const { data: allVisibleProducts = [], isLoading } = useProducts({
    visibleOnly: true,
    category: selectedCategory,
    search: searchQuery,
    stockStatus: inStockOnly ? 'IN_STOCK' : 'ALL',
    sort: sortBy,
  });

  // Unfiltered catalog for Spec Comparator & Hero unit count
  const { data: fullCatalog = [] } = useProducts({ visibleOnly: true });

  const displayedProducts = useMemo(() => {
    if (!wishlistOnly) return allVisibleProducts;
    return allVisibleProducts.filter((p) => wishlistIds.includes(p.id));
  }, [allVisibleProducts, wishlistIds, wishlistOnly]);

  const totalAvailableUnits = useMemo(
    () => fullCatalog.reduce((sum, p) => sum + p.stock, 0),
    [fullCatalog]
  );

  const storeName = settingsData?.settings.storeName ?? 'VoltOps Electronics';
  const freeShippingThreshold =
    settingsData?.settings.freeShippingThreshold ?? 500;
  const lowStockThreshold = settingsData?.settings.lowStockThreshold ?? 3;
  const promoCodes = settingsData?.promoCodes ?? [];

  const scrollToCatalog = (): void => {
    const el = document.getElementById('catalog-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      <StoreHero
        storeName={storeName}
        freeShippingThreshold={freeShippingThreshold}
        promoCodes={promoCodes}
        totalAvailableUnits={totalAvailableUnits}
        onExploreCatalog={scrollToCatalog}
        onOpenCompare={openCompare}
      />

      <ProductGrid
        products={displayedProducts}
        isLoading={isLoading}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        sortBy={sortBy}
        onSortChange={setSortBy}
        inStockOnly={inStockOnly}
        onToggleInStockOnly={() => setInStockOnly((v) => !v)}
        lowStockThreshold={lowStockThreshold}
        onQuickView={(p) => setQuickViewProduct(p)}
      />

      <SpecCompareModal allProducts={fullCatalog} />
      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
      <CheckoutModal />
    </main>
  );
}
