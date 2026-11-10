import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { CartItem, Order, Product, ValidatedPromoResult } from '../types';

interface CartContextValue {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  appliedPromo: ValidatedPromoResult['promo'] | null;
  discount: number;
  isCartOpen: boolean;
  isCheckoutOpen: boolean;
  isCompareOpen: boolean;
  wishlistIds: string[];
  compareIds: string[];
  receiptOrder: Order | null;
  openCart: () => void;
  closeCart: () => void;
  openCheckout: () => void;
  closeCheckout: () => void;
  openCompare: () => void;
  closeCompare: () => void;
  setReceiptOrder: (order: Order | null) => void;
  addToCart: (product: Product, qty?: number) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  applyValidatedPromo: (result: ValidatedPromoResult | null) => void;
  toggleWishlist: (productId: string) => void;
  toggleCompare: (productId: string) => void;
  clearCompare: () => void;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

const WISHLIST_KEY = 'voltops_wishlist_ids';

export function CartProvider({ children }: { children: React.ReactNode }): React.ReactElement {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [isCompareOpen, setIsCompareOpen] = useState<boolean>(false);
  const [appliedPromo, setAppliedPromo] = useState<ValidatedPromoResult['promo'] | null>(null);
  const [receiptOrder, setReceiptOrder] = useState<Order | null>(null);

  const [wishlistIds, setWishlistIds] = useState<string[]>(() => {
    try {
      const raw = window.localStorage.getItem(WISHLIST_KEY);
      if (!raw) return [];
      const parsed: unknown = JSON.parse(raw);
      return Array.isArray(parsed)
        ? parsed.filter((id): id is string => typeof id === 'string')
        : [];
    } catch {
      return [];
    }
  });

  const [compareIds, setCompareIds] = useState<string[]>([]);

  useEffect(() => {
    window.localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlistIds));
  }, [wishlistIds]);

  const subtotal = useMemo(() => {
    const raw = items.reduce((sum, entry) => sum + entry.product.price * entry.quantity, 0);
    return Math.round((raw + Number.EPSILON) * 100) / 100;
  }, [items]);

  const itemCount = useMemo(
    () => items.reduce((sum, entry) => sum + entry.quantity, 0),
    [items]
  );

  const discount = useMemo(() => {
    if (!appliedPromo) return 0;
    if (subtotal < appliedPromo.minSpend) return 0;
    const raw =
      appliedPromo.type === 'PERCENT'
        ? subtotal * (appliedPromo.value / 100)
        : appliedPromo.value;
    return Math.round((Math.min(subtotal, raw) + Number.EPSILON) * 100) / 100;
  }, [appliedPromo, subtotal]);

  useEffect(() => {
    if (appliedPromo && subtotal < appliedPromo.minSpend) {
      setAppliedPromo(null);
    }
  }, [appliedPromo, subtotal]);

  const addToCart = (product: Product, qty = 1): void => {
    if (product.stock <= 0) return;
    setItems((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        const nextQty = Math.min(product.stock, existing.quantity + qty);
        return prev.map((i) =>
          i.product.id === product.id ? { product, quantity: nextQty } : i
        );
      }
      return [...prev, { product, quantity: Math.min(product.stock, qty) }];
    });
    setIsCartOpen(true);
  };

  const updateQuantity = (productId: string, quantity: number): void => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((i) => i.product.id !== productId));
      return;
    }
    setItems((prev) =>
      prev.map((i) =>
        i.product.id === productId
          ? { ...i, quantity: Math.min(i.product.stock, quantity) }
          : i
      )
    );
  };

  const removeFromCart = (productId: string): void => {
    setItems((prev) => prev.filter((i) => i.product.id !== productId));
  };

  const clearCart = (): void => {
    setItems([]);
    setAppliedPromo(null);
  };

  const applyValidatedPromo = (result: ValidatedPromoResult | null): void => {
    setAppliedPromo(result ? result.promo : null);
  };

  const toggleWishlist = (productId: string): void => {
    setWishlistIds((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  const toggleCompare = (productId: string): void => {
    setCompareIds((prev) => {
      if (prev.includes(productId)) {
        return prev.filter((id) => id !== productId);
      }
      if (prev.length >= 4) {
        return [...prev.slice(1), productId];
      }
      return [...prev, productId];
    });
  };

  const clearCompare = (): void => {
    setCompareIds([]);
    setIsCompareOpen(false);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        subtotal,
        appliedPromo,
        discount,
        isCartOpen,
        isCheckoutOpen,
        isCompareOpen,
        wishlistIds,
        compareIds,
        receiptOrder,
        openCart: () => setIsCartOpen(true),
        closeCart: () => setIsCartOpen(false),
        openCheckout: () => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        },
        closeCheckout: () => setIsCheckoutOpen(false),
        openCompare: () => setIsCompareOpen(true),
        closeCompare: () => setIsCompareOpen(false),
        setReceiptOrder,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        applyValidatedPromo,
        toggleWishlist,
        toggleCompare,
        clearCompare,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error('useCart must be used inside CartProvider');
  }
  return ctx;
}
