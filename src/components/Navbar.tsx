import React from 'react';
import { ShoppingBag, Cpu, Sparkles, Store, History } from 'lucide-react';
import { SearchBar } from './SearchBar';
import { SearchHistoryItem } from '../types';

interface NavbarProps {
  searchQuery: string;
  onSearchChange: (val: string) => void;
  onSearchSubmit: (val: string) => void;
  searchHistory: SearchHistoryItem[];
  onClearHistory: () => void;
  onSelectHistoryItem: (query: string) => void;
  cartTotalCount: number;
  cartTotalPrice: number;
  onOpenCart: () => void;
  onOpenNlpLab: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  searchQuery,
  onSearchChange,
  onSearchSubmit,
  searchHistory,
  onClearHistory,
  onSelectHistoryItem,
  cartTotalCount,
  cartTotalPrice,
  onOpenCart,
  onOpenNlpLab,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-stone-200/80 shadow-2xs">
      
      {/* Top Banner */}
      <div className="bg-stone-900 text-stone-200 text-[11px] sm:text-xs py-1.5 px-4 text-center font-medium flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
        <span>
          <strong className="text-white">Gensim Word2Vec Destekli Akıllı Market:</strong> Yanlış yazımları otomatik düzeltir, &quot;Bunu aramak istemiştiniz&quot; ile aradığınızı anında bulur!
        </span>
        <button
          onClick={onOpenNlpLab}
          className="underline text-emerald-400 hover:text-emerald-300 font-bold ml-1 cursor-pointer"
        >
          Python &amp; NLP Kodlarını Gör
        </button>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex items-center justify-between gap-4">
          
          {/* Brand Logo */}
          <div className="flex items-center gap-3 shrink-0">
            <a href="#" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/30 group-hover:scale-105 transition-transform">
                <Store className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-lg sm:text-xl font-black text-stone-900 tracking-tight">
                    Gurme<span className="text-emerald-600">Pazar</span>
                  </span>
                  <span className="text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded-md">
                    NLP
                  </span>
                </div>
                <span className="text-[10px] font-medium text-stone-500 hidden sm:block -mt-1">
                  Akıllı Mutfak &amp; Market
                </span>
              </div>
            </a>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-2xl hidden md:block">
            <SearchBar
              value={searchQuery}
              onChange={onSearchChange}
              onSearch={onSearchSubmit}
              searchHistory={searchHistory}
              onClearHistory={onClearHistory}
              onSelectHistoryItem={onSelectHistoryItem}
            />
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Gensim NLP Lab Modal Button */}
            <button
              onClick={onOpenNlpLab}
              className="px-3 sm:px-4 py-2 sm:py-2.5 bg-stone-100 hover:bg-emerald-50 text-stone-800 hover:text-emerald-900 border border-stone-200 hover:border-emerald-300 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer group"
              title="Gensim Word2Vec Modeli ve Python Kod Laboratuvarı"
            >
              <div className="p-1 bg-stone-200 group-hover:bg-emerald-600 group-hover:text-white rounded-lg transition-colors">
                <Cpu className="w-3.5 h-3.5" />
              </div>
              <span className="hidden sm:inline">Gensim NLP Lab</span>
              <span className="sm:hidden font-mono text-xs">NLP</span>
            </button>

            {/* Shopping Cart Button */}
            <button
              onClick={onOpenCart}
              className="relative px-3.5 sm:px-4 py-2 sm:py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs sm:text-sm font-extrabold flex items-center gap-2 shadow-md shadow-emerald-600/25 transition-all cursor-pointer active:scale-95"
            >
              <div className="relative">
                <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
                {cartTotalCount > 0 && (
                  <span className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-mono font-bold flex items-center justify-center animate-in zoom-in-50">
                    {cartTotalCount}
                  </span>
                )}
              </div>
              <div className="hidden sm:flex flex-col text-left leading-tight">
                <span className="text-[10px] font-normal text-emerald-100">Sepetim</span>
                <span className="text-xs font-bold">{cartTotalPrice.toFixed(2)} ₺</span>
              </div>
            </button>
          </div>

        </div>

        {/* Mobile Search Bar View */}
        <div className="mt-3 md:hidden">
          <SearchBar
            value={searchQuery}
            onChange={onSearchChange}
            onSearch={onSearchSubmit}
            searchHistory={searchHistory}
            onClearHistory={onClearHistory}
            onSelectHistoryItem={onSelectHistoryItem}
          />
        </div>

      </div>

    </header>
  );
};
