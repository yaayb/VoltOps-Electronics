import React, { useState } from 'react';
import { AlertTriangle, Cpu, Plus, X } from 'lucide-react';
import { useCreateProduct } from '../../hooks/useProducts';
import { ProductCategory } from '../../types';

interface AddSkuModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const IMAGE_PRESETS: Array<{ label: string; url: string }> = [
  {
    label: 'Laptop Studio',
    url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=900&q=85',
  },
  {
    label: 'Flagship Smartphone',
    url: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&w=900&q=85',
  },
  {
    label: 'Pro Tablet',
    url: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=900&q=85',
  },
  {
    label: 'Gaming Console',
    url: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=900&q=85',
  },
  {
    label: 'Studio Headphones',
    url: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&w=900&q=85',
  },
];

export function AddSkuModal({
  isOpen,
  onClose,
}: AddSkuModalProps): React.ReactElement | null {
  const createProductMutation = useCreateProduct();

  const [sku, setSku] = useState('ASU-ROG16-4080');
  const [name, setName] = useState('ASUS ROG Zephyrus G16 OLED (RTX 4080)');
  const [brand, setBrand] = useState('ASUS');
  const [category, setCategory] = useState<ProductCategory>('Laptops');
  const [price, setPrice] = useState('2299.00');
  const [stock, setStock] = useState('4');
  const [warrantyMonths, setWarrantyMonths] = useState('12');
  const [specProcessor, setSpecProcessor] = useState(
    'Intel Core Ultra 9 185H · NVIDIA RTX 4080'
  );
  const [specMemory, setSpecMemory] = useState('32GB LPDDR5X · 1TB PCIe 4.0 SSD');
  const [specDisplay, setSpecDisplay] = useState('16" 2.5K 240Hz ROG Nebula OLED');
  const [imageUrl, setImageUrl] = useState(IMAGE_PRESETS[0].url);
  const [featured, setFeatured] = useState(true);
  const [visible, setVisible] = useState(true);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setError(null);

    const parsedPrice = Number.parseFloat(price);
    const parsedStock = Number.parseInt(stock, 10);
    const parsedWarranty = Number.parseInt(warrantyMonths, 10);

    if (Number.isNaN(parsedPrice) || parsedPrice <= 0) {
      setError('Enter a valid positive MSRP price.');
      return;
    }
    if (Number.isNaN(parsedStock) || parsedStock < 0) {
      setError('Enter a valid non-negative initial stock count.');
      return;
    }

    try {
      await createProductMutation.mutateAsync({
        sku: sku.trim().toUpperCase(),
        name: name.trim(),
        brand: brand.trim(),
        category,
        price: parsedPrice,
        stock: parsedStock,
        warrantyMonths: Number.isNaN(parsedWarranty) ? 12 : parsedWarranty,
        visible,
        featured,
        specProcessor: specProcessor.trim(),
        specMemory: specMemory.trim(),
        specDisplay: specDisplay.trim(),
        imageUrl: imageUrl.trim(),
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create SKU');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-2xl rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-8">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-cyan-500" />
            <h2 className="font-bold text-slate-900 dark:text-white">
              Mint New Electronics SKU &amp; Serialized Batch
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={(e) => void handleSubmit(e)} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-500 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">
                SKU Code
              </label>
              <input
                type="text"
                required
                value={sku}
                onChange={(e) => setSku(e.target.value.toUpperCase())}
                className="w-full px-3 py-2 rounded-xl font-mono text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">
                Brand
              </label>
              <input
                type="text"
                required
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ProductCategory)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white"
              >
                <option value="Laptops">Laptops</option>
                <option value="Smartphones">Smartphones</option>
                <option value="Tablets">Tablets</option>
                <option value="Gaming">Gaming</option>
                <option value="Audio">Audio</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">
              Product Model Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-sm bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">
                MSRP Price (USD)
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-3 py-2 rounded-xl font-mono text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">
                Serial Units to Mint
              </label>
              <input
                type="number"
                min={0}
                max={200}
                required
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className="w-full px-3 py-2 rounded-xl font-mono text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">
                Warranty (Months)
              </label>
              <input
                type="number"
                min={1}
                max={60}
                required
                value={warrantyMonths}
                onChange={(e) => setWarrantyMonths(e.target.value)}
                className="w-full px-3 py-2 rounded-xl font-mono text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">
                Processor / Chipset
              </label>
              <input
                type="text"
                required
                value={specProcessor}
                onChange={(e) => setSpecProcessor(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">
                Memory / Storage
              </label>
              <input
                type="text"
                required
                value={specMemory}
                onChange={(e) => setSpecMemory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">
                Display / Acoustic Spec
              </label>
              <input
                type="text"
                required
                value={specDisplay}
                onChange={(e) => setSpecDisplay(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">
              Studio Hardware Image URL
            </label>
            <input
              type="url"
              required
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-xs font-mono bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white"
            />
            <div className="flex flex-wrap gap-1.5 mt-2">
              {IMAGE_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => setImageUrl(preset.url)}
                  className="px-2.5 py-1 rounded-lg text-[11px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-cyan-400"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-6 pt-1">
            <label className="inline-flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={visible}
                onChange={(e) => setVisible(e.target.checked)}
                className="accent-cyan-500"
              />
              <span>Visible on Customer Storefront</span>
            </label>
            <label className="inline-flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="accent-cyan-500"
              />
              <span>Featured Flagship Badge</span>
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createProductMutation.isPending}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs"
            >
              <Plus className="w-4 h-4" />
              <span>
                {createProductMutation.isPending
                  ? 'Minting Serials...'
                  : `Create SKU & Mint ${stock || 0} Serials`}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
