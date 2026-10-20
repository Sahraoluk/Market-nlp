import React from 'react';
import { Filter, SlidersHorizontal, ArrowUpDown, Check } from 'lucide-react';
import { FilterOptions } from '../types';

interface FilterControlsProps {
  filters: FilterOptions;
  onChangeFilters: (newFilters: FilterOptions) => void;
  onResetFilters: () => void;
  totalFilteredCount: number;
}

export const FilterControls: React.FC<FilterControlsProps> = ({
  filters,
  onChangeFilters,
  onResetFilters,
  totalFilteredCount,
}) => {
  const isFiltered =
    filters.onlyDiscounted ||
    filters.onlyOrganic ||
    filters.maxPrice < 350 ||
    filters.sortBy !== 'relevance';

  return (
    <div className="bg-white p-4 sm:p-5 rounded-3xl border border-stone-200/90 shadow-2xs mb-6 space-y-4">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        
        {/* Left: Active Count & Fast Toggle Chips */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1.5 mr-1">
            <Filter className="w-3.5 h-3.5 text-emerald-600" />
            Filtreler ({totalFilteredCount} Ürün)
          </span>

          {/* Discount toggle */}
          <button
            onClick={() =>
              onChangeFilters({ ...filters, onlyDiscounted: !filters.onlyDiscounted })
            }
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              filters.onlyDiscounted
                ? 'bg-rose-50 text-rose-700 border border-rose-300'
                : 'bg-stone-50 hover:bg-stone-100 text-stone-600 border border-stone-200'
            }`}
          >
            {filters.onlyDiscounted && <Check className="w-3.5 h-3.5" />}
            <span>🏷️ İndirimli Fırsatlar</span>
          </button>

          {/* Organic toggle */}
          <button
            onClick={() =>
              onChangeFilters({ ...filters, onlyOrganic: !filters.onlyOrganic })
            }
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              filters.onlyOrganic
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                : 'bg-stone-50 hover:bg-stone-100 text-stone-600 border border-stone-200'
            }`}
          >
            {filters.onlyOrganic && <Check className="w-3.5 h-3.5" />}
            <span>🌱 Organik Sertifikalı</span>
          </button>

          {/* In Stock toggle */}
          <button
            onClick={() =>
              onChangeFilters({ ...filters, inStockOnly: !filters.inStockOnly })
            }
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              filters.inStockOnly
                ? 'bg-blue-50 text-blue-700 border border-blue-300'
                : 'bg-stone-50 hover:bg-stone-100 text-stone-600 border border-stone-200'
            }`}
          >
            {filters.inStockOnly && <Check className="w-3.5 h-3.5" />}
            <span>Hemen Teslimat</span>
          </button>

          {isFiltered && (
            <button
              onClick={onResetFilters}
              className="text-xs text-stone-400 hover:text-stone-700 underline underline-offset-2 ml-1 cursor-pointer"
            >
              Filtreleri Temizle
            </button>
          )}
        </div>

        {/* Right: Price slider & Sort Dropdown */}
        <div className="flex items-center gap-4 flex-wrap">
          {/* Price Range */}
          <div className="flex items-center gap-2 bg-stone-50 px-3 py-1.5 rounded-xl border border-stone-200 text-xs text-stone-700">
            <span className="font-semibold text-stone-500">Maks. Fiyat:</span>
            <input
              type="range"
              min="20"
              max="350"
              step="10"
              value={filters.maxPrice}
              onChange={(e) =>
                onChangeFilters({ ...filters, maxPrice: Number(e.target.value) })
              }
              className="w-24 accent-emerald-600 cursor-pointer"
            />
            <span className="font-mono font-bold text-stone-900 min-w-[50px]">
              {filters.maxPrice} ₺
            </span>
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-2 bg-stone-50 px-3 py-1.5 rounded-xl border border-stone-200 text-xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-stone-500" />
            <span className="font-semibold text-stone-500">Sırala:</span>
            <select
              value={filters.sortBy}
              onChange={(e) =>
                onChangeFilters({
                  ...filters,
                  sortBy: e.target.value as FilterOptions['sortBy'],
                })
              }
              className="bg-transparent font-bold text-stone-900 focus:outline-hidden cursor-pointer"
            >
              <option value="relevance">Gensim NLP &amp; İlgi Sırası</option>
              <option value="price-asc">Fiyat: Düşükten Yükseğe</option>
              <option value="price-desc">Fiyat: Yüksekten Düşüğe</option>
              <option value="rating">En Yüksek Puanlılar</option>
              <option value="discount">En Çok İndirim Alanlar</option>
            </select>
          </div>
        </div>

      </div>
    </div>
  );
};
