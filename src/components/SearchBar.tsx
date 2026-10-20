import React, { useState, useRef, useEffect } from 'react';
import { Search, X, Sparkles, Clock, Trash2, ArrowRight } from 'lucide-react';
import { SearchHistoryItem } from '../types';
import { detectSpellingCorrection } from '../nlp/gensimEngine';

interface SearchBarProps {
  value: string;
  onChange: (val: string) => void;
  onSearch: (query: string) => void;
  searchHistory: SearchHistoryItem[];
  onClearHistory: () => void;
  onSelectHistoryItem: (query: string) => void;
  placeholder?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  onSearch,
  searchHistory,
  onClearHistory,
  onSelectHistoryItem,
  placeholder = 'Meyve, sebze, abur cubur, temizlik ürünü arayın... (Örn: elmma, domts, detarjan)',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) {
      onSearch(value.trim());
      setIsOpen(false);
    }
  };

  // Instant typo prediction while typing
  const liveCorrection = value.length >= 2 ? detectSpellingCorrection(value) : null;

  const popularSearches = [
    { label: 'elmma (yazım testi)', term: 'elmma' },
    { label: 'domts (yazım testi)', term: 'domts' },
    { label: 'detarjan (yazım testi)', term: 'detarjan' },
    { label: 'cipsi (yazım testi)', term: 'cipsi' },
    { label: 'çikolata', term: 'çikolata' },
    { label: 'çamaşır suyu', term: 'çamaşır suyu' },
  ];

  return (
    <div ref={containerRef} className="relative w-full max-w-2xl">
      <form onSubmit={handleSubmit} className="relative flex items-center">
        <div className="absolute left-4 text-stone-400 pointer-events-none flex items-center">
          <Search className="w-5 h-5 text-stone-400" />
        </div>

        <input
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full pl-12 pr-28 py-3.5 bg-white border-2 border-stone-200 hover:border-stone-300 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 rounded-2xl shadow-xs text-sm sm:text-base font-medium text-stone-900 placeholder:text-stone-400 focus:outline-hidden transition-all"
        />

        {/* Clear & Submit buttons */}
        <div className="absolute right-2.5 flex items-center gap-1.5">
          {value && (
            <button
              type="button"
              onClick={() => {
                onChange('');
                onSearch('');
              }}
              className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-full transition-colors cursor-pointer"
              title="Aramayı Temizle"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <button
            type="submit"
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-all flex items-center gap-1 cursor-pointer"
          >
            <span>Ara</span>
          </button>
        </div>
      </form>

      {/* Dropdown with Live NLP Correction, History and Popular Searches */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-stone-200 z-40 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          
          {/* 1. Live NLP Typo Detection Indicator */}
          {liveCorrection && liveCorrection.isCorrected && (
            <div className="p-3.5 bg-emerald-50 border-b border-emerald-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-emerald-600 text-white shrink-0">
                  <Sparkles className="w-4 h-4 animate-spin-slow" />
                </div>
                <div>
                  <span className="text-xs text-stone-600">Bunu aramak istemiştiniz: </span>
                  <span className="text-sm font-bold text-emerald-900">&quot;{liveCorrection.correctedWord}&quot;</span>
                  <span className="text-[11px] text-emerald-700 font-mono ml-2">(Gensim Word2Vec: %{Math.round(liveCorrection.confidence * 100)})</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  onChange(liveCorrection.correctedWord);
                  onSearch(liveCorrection.correctedWord);
                  setIsOpen(false);
                }}
                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span>Uygula</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* 2. Son Aramalarınız (Search History) */}
          {searchHistory.length > 0 && (
            <div className="p-4 border-b border-stone-100">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-stone-400" />
                  Son Aramalarınız (Geçmiş)
                </span>
                <button
                  type="button"
                  onClick={onClearHistory}
                  className="text-[11px] text-stone-400 hover:text-rose-600 flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Geçmişi Temizle</span>
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {searchHistory.slice(0, 8).map((item, index) => (
                  <button
                    key={`${item.query}-${index}`}
                    type="button"
                    onClick={() => {
                      onSelectHistoryItem(item.query);
                      setIsOpen(false);
                    }}
                    className="px-3 py-1.5 bg-stone-100 hover:bg-emerald-50 hover:text-emerald-900 hover:border-emerald-200 border border-stone-200 text-stone-700 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>{item.query}</span>
                    {item.correctedTo && item.correctedTo !== item.query && (
                      <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100/70 px-1.5 py-0.2 rounded-full">
                        → {item.correctedTo}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 3. Popüler Aramalar / Test Kelimeleri */}
          <div className="p-4 bg-stone-50/50">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider block mb-2.5">
              NLP &amp; Gensim Yazım Düzeltme Testleri
            </span>
            <div className="flex flex-wrap gap-2">
              {popularSearches.map((item) => (
                <button
                  key={item.term}
                  type="button"
                  onClick={() => {
                    onChange(item.term);
                    onSearch(item.term);
                    setIsOpen(false);
                  }}
                  className="px-3 py-1.5 bg-white hover:bg-emerald-50 hover:border-emerald-300 border border-stone-200 text-stone-800 rounded-xl text-xs font-medium transition-all shadow-2xs flex items-center gap-1 cursor-pointer"
                >
                  <Search className="w-3 h-3 text-emerald-600" />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>

        </div>
      )}
    </div>
  );
};
