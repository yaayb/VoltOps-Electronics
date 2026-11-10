import React from 'react';
import {
  Cpu,
  Eye,
  HardDrive,
  Heart,
  Layers,
  Monitor,
  Search,
  ShieldCheck,
  ShoppingBag,
  SlidersHorizontal,
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { Product, ProductCategory } from '../../types';

interface ProductGridProps {
  products: Product[];
  isLoading: boolean;
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  sortBy: 'featured' | 'price_asc' | 'price_desc' | 'newest';
  onSortChange: (sort: 'featured' | 'price_asc' | 'price_desc' | 'newest') => void;
  inStockOnly: boolean;
  onToggleInStockOnly: () => void;
  lowStockThreshold: number;
  onQuickView: (product: Product) => void;
}

const CATEGORIES: Array<'ALL' | ProductCategory> = [
  'ALL',
  'Laptops',
  'Smartphones',
  'Tablets',
  'Gaming',
  'Audio',
];

export function ProductGrid({
  products,
  isLoading,
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  inStockOnly,
  onToggleInStockOnly,
  lowStockThreshold,
  onQuickView,
}: ProductGridProps): React.ReactElement {
  const {
    addToCart,
    wishlistIds,
    toggleWishlist,
    compareIds,
    toggleCompare,
    openCompare,
  } = useCart();

  return (
    <section id="catalog-section" className="space-y-6">
      {/* Filter & Search Toolbar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-1.5">
            {CATEGORIES.map((category) => {
              const active = selectedCategory === category;
              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => onSelectCategory(category)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    active
                      ? 'bg-cyan-500 text-slate-950 shadow-sm shadow-cyan-500/25'
                      : 'bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-transparent dark:border-slate-800'
                  }`}
                >
                  {category === 'ALL' ? 'All Hardware' : category}
                </button>
              );
            })}
          </div>

          {/* Compare Tray Banner */}
          {compareIds.length > 0 && (
            <button
              type="button"
              onClick={openCompare}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-cyan-500/15 border border-cyan-500/40 text-cyan-600 dark:text-cyan-400 text-xs font-semibold hover:bg-cyan-500/25 transition-colors"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Compare {compareIds.length} Selected SKU(s)</span>
            </button>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Technical Spec & SKU Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Filter by model, SKU, M4, Snapdragon, OLED, RAM..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="flex items-center gap-2.5">
            <label className="inline-flex items-center gap-2 px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={onToggleInStockOnly}
                className="rounded accent-cyan-500"
              />
              <span>In-Stock Only</span>
            </label>

            <div className="relative flex items-center">
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
              <select
                value={sortBy}
                onChange={(e) =>
                  onSortChange(
                    e.target.value as 'featured' | 'price_asc' | 'price_desc' | 'newest'
                  )
                }
                className="pl-8 pr-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                <option value="featured">Sort: Featured</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="newest">Newest Arrivals</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Product Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div
              key={idx}
              className="h-96 rounded-2xl bg-slate-200/60 dark:bg-slate-900/60 animate-pulse border border-slate-200 dark:border-slate-800"
            />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="p-12 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-center space-y-2">
          <p className="text-base font-bold text-slate-800 dark:text-slate-200">
            No matching electronics hardware found
          </p>
          <p className="text-xs text-slate-500">
            Try clearing your technical search filter or switching hardware categories.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => {
            const isWishlisted = wishlistIds.includes(product.id);
            const isCompared = compareIds.includes(product.id);
            const isOutOfStock = product.stock <= 0;
            const isLowStock = product.stock > 0 && product.stock <= lowStockThreshold;

            return (
              <article
                key={product.id}
                className="group rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/90 hover:border-cyan-500/50 transition-all duration-200 overflow-hidden flex flex-col shadow-sm hover:shadow-xl hover:shadow-cyan-500/5"
              >
                {/* Image Stage */}
                <div className="relative h-52 bg-slate-100 dark:bg-slate-950 overflow-hidden">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />

                  {/* Top Left Status Badges */}
                  <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold uppercase bg-slate-950/85 text-cyan-400 backdrop-blur-md border border-slate-800">
                      {product.category}
                    </span>
                    {isOutOfStock ? (
                      <span className="px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold uppercase bg-rose-500 text-white">
                        Out of Stock
                      </span>
                    ) : isLowStock ? (
                      <span className="px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold uppercase bg-amber-500 text-slate-950">
                        Only {product.stock} Left
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold uppercase bg-emerald-500/90 text-slate-950">
                        {product.stock} Serialized
                      </span>
                    )}
                  </div>

                  {/* Top Right Action Icons */}
                  <div className="absolute top-3 right-3 flex flex-col gap-1.5">
                    <button
                      type="button"
                      onClick={() => toggleWishlist(product.id)}
                      title="Toggle Wishlist"
                      className={`p-2 rounded-xl backdrop-blur-md border transition-colors ${
                        isWishlisted
                          ? 'bg-rose-500 text-white border-rose-400'
                          : 'bg-slate-950/70 text-slate-200 border-slate-800 hover:text-rose-400'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
                    </button>
                    <button
                      type="button"
                      onClick={() => onQuickView(product)}
                      title="Hardware Datasheet Quick View"
                      className="p-2 rounded-xl bg-slate-950/70 text-slate-200 border border-slate-800 hover:text-cyan-400 backdrop-blur-md transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-slate-400">
                        <span>{product.brand}</span>
                        <span>{product.sku}</span>
                      </div>
                      <h3
                        onClick={() => onQuickView(product)}
                        className="font-bold text-base text-slate-900 dark:text-white mt-0.5 group-hover:text-cyan-500 dark:group-hover:text-cyan-400 cursor-pointer transition-colors"
                      >
                        {product.name}
                      </h3>
                    </div>

                    {/* Structured Hardware Spec Matrix */}
                    <div className="space-y-1.5 pt-1 text-xs text-slate-600 dark:text-slate-300">
                      <div className="flex items-center gap-2">
                        <Cpu className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
                        <span className="truncate">{product.specProcessor}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <HardDrive className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
                        <span className="truncate">{product.specMemory}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Monitor className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
                        <span className="truncate">{product.specDisplay}</span>
                      </div>
                    </div>
                  </div>

                  {/* Price & Actions Footer */}
                  <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-3">
                    <div className="flex items-baseline justify-between">
                      <div>
                        <span className="text-xl font-extrabold font-mono text-slate-900 dark:text-white">
                          ${product.price.toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </span>
                        <div className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5">
                          <ShieldCheck className="w-3 h-3" />
                          <span>{product.warrantyMonths}M Factory Warranty</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => toggleCompare(product.id)}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-semibold border transition-colors ${
                          isCompared
                            ? 'bg-cyan-500/15 border-cyan-500 text-cyan-600 dark:text-cyan-400'
                            : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:border-cyan-500/50 hover:text-cyan-500'
                        }`}
                      >
                        {isCompared ? '✓ Comparing' : '+ Compare'}
                      </button>
                    </div>

                    <button
                      type="button"
                      disabled={isOutOfStock}
                      onClick={() => addToCart(product, 1)}
                      className="w-full py-2.5 rounded-xl bg-slate-900 dark:bg-cyan-500 hover:bg-cyan-500 dark:hover:bg-cyan-400 text-white dark:text-slate-950 hover:text-slate-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span>
                        {isOutOfStock ? 'Depleted — Awaiting Restock' : 'Add to Hardware Bag'}
                      </span>
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
