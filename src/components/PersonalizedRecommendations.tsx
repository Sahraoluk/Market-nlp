import React from 'react';
import { Sparkles, SlidersHorizontal, RefreshCw, Zap } from 'lucide-react';
import { Product, UserPreferences } from '../types';
import { ProductCard } from './ProductCard';
import { PersonalizedRecommendationResult } from '../nlp/recommendationEngine';

interface PersonalizedRecommendationsProps {
  recommendations: PersonalizedRecommendationResult[];
  preferences: UserPreferences;
  onApplyPreset: (preset: 'saglikli' | 'sinema' | 'temizlik' | 'kahvalti') => void;
  onResetPreferences: () => void;
  getCartQuantity: (id: string) => number;
  onAddToCart: (p: Product) => void;
  onUpdateQuantity: (id: string, q: number) => void;
  onOpenDetail: (p: Product) => void;
}

export const PersonalizedRecommendations: React.FC<PersonalizedRecommendationsProps> = ({
  recommendations,
  preferences,
  onApplyPreset,
  onResetPreferences,
  getCartQuantity,
  onAddToCart,
  onUpdateQuantity,
  onOpenDetail,
}) => {
  if (recommendations.length === 0) return null;

  const recentQueries = preferences.searchHistory.slice(0, 4);

  return (
    <section className="mb-10 p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-emerald-500/8 via-teal-500/5 to-amber-500/5 border border-emerald-200/70 shadow-xs">
      
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
            <span>Kişiselleştirilmiş AI Öneri Sistemi</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
            Arama Geçmişinize Özel Öneriler
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 mt-0.5">
            {recentQueries.length > 0 ? (
              <span>
                Son aramalarınız:{' '}
                <strong className="text-emerald-900">
                  {recentQueries.map((q) => `"${q.query}"`).join(', ')}
                </strong>{' '}
                ve mutfak kategorisi ilginize göre dinamik filtrelendi.
              </span>
            ) : (
              <span>Gensim Word2Vec semantik ilgi modelinize göre ürünler derlendi.</span>
            )}
          </p>
        </div>

        {/* Persona Simulator & Reset Controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
          <div className="flex items-center gap-1.5 bg-white/90 border border-stone-200 p-1 rounded-2xl shadow-2xs">
            <span className="text-[11px] font-bold text-stone-400 px-2 flex items-center gap-1">
              <SlidersHorizontal className="w-3 h-3" />
              Test Profili:
            </span>
            <button
              onClick={() => onApplyPreset('sinema')}
              className="px-2.5 py-1 text-xs font-medium rounded-xl hover:bg-stone-100 text-stone-700 transition-colors cursor-pointer"
              title="Atıştırmalık & Cips profilini simüle et"
            >
              🍿 Atıştırmalık
            </button>
            <button
              onClick={() => onApplyPreset('saglikli')}
              className="px-2.5 py-1 text-xs font-medium rounded-xl hover:bg-stone-100 text-stone-700 transition-colors cursor-pointer"
              title="Meyve Sebze & Fit profilini simüle et"
            >
              🍏 Fit &amp; Taze
            </button>
            <button
              onClick={() => onApplyPreset('temizlik')}
              className="px-2.5 py-1 text-xs font-medium rounded-xl hover:bg-stone-100 text-stone-700 transition-colors cursor-pointer"
              title="Temizlik ürünleri profilini simüle et"
            >
              🧼 Hijyen
            </button>
            <button
              onClick={() => onApplyPreset('kahvalti')}
              className="px-2.5 py-1 text-xs font-medium rounded-xl hover:bg-stone-100 text-stone-700 transition-colors cursor-pointer"
              title="Peynir, zeytin, kahvaltı profilini simüle et"
            >
              🍳 Kahvaltı
            </button>
          </div>

          <button
            onClick={onResetPreferences}
            className="p-2 text-stone-400 hover:text-stone-700 hover:bg-white border border-stone-200/60 rounded-xl transition-all cursor-pointer"
            title="Öneri Profilini Sıfırla"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Grid of Recommended Products */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
        {recommendations.slice(0, 4).map(({ product, reason }) => (
          <ProductCard
            key={`rec-${product.id}`}
            product={product}
            quantityInCart={getCartQuantity(product.id)}
            onAddToCart={onAddToCart}
            onUpdateQuantity={onUpdateQuantity}
            onOpenDetail={onOpenDetail}
            highlightReason={reason}
          />
        ))}
      </div>

    </section>
  );
};
