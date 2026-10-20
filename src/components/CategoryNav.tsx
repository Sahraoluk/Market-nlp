import React from 'react';
import { ProductCategory } from '../types';

interface CategoryNavProps {
  selectedCategory: ProductCategory;
  onSelectCategory: (cat: ProductCategory) => void;
  productCounts: Record<ProductCategory, number>;
}

export const CATEGORIES: Array<{ id: ProductCategory; label: string; icon: string }> = [
  { id: 'hepsi', label: 'Tüm Ürünler', icon: '🛒' },
  { id: 'meyve-sebze', label: 'Meyve & Sebze', icon: '🍏' },
  { id: 'abur-cubur', label: 'Abur Cubur & Atıştırmalık', icon: '🍫' },
  { id: 'temizlik', label: 'Temizlik & Hijyen', icon: '🧼' },
  { id: 'sut-kahvaltilik', label: 'Süt & Kahvaltılık', icon: '🧀' },
  { id: 'temel-gida', label: 'Temel Gıda & Kiler', icon: '🍝' },
];

export const CategoryNav: React.FC<CategoryNavProps> = ({
  selectedCategory,
  onSelectCategory,
  productCounts,
}) => {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-3 pt-1 scrollbar-none no-scrollbar">
      {CATEGORIES.map(({ id, label, icon }) => {
        const isSelected = selectedCategory === id;
        const count = productCounts[id] || 0;

        return (
          <button
            key={id}
            onClick={() => onSelectCategory(id)}
            className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-all shrink-0 cursor-pointer ${
              isSelected
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20 scale-102'
                : 'bg-white hover:bg-stone-100 text-stone-700 border border-stone-200/90 hover:border-stone-300'
            }`}
          >
            <span className="text-base">{icon}</span>
            <span>{label}</span>
            <span
              className={`text-[11px] px-2 py-0.5 rounded-full font-mono ${
                isSelected
                  ? 'bg-emerald-700/60 text-emerald-100'
                  : 'bg-stone-100 text-stone-500'
              }`}
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
};
