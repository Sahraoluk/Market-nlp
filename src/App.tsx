import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { PRODUCTS } from './data/products';
import {
  Product,
  ProductCategory,
  CartItem,
  FilterOptions,
  SearchCorrection,
  UserPreferences,
} from './types';
import {
  detectSpellingCorrection,
  gensimModel,
  normalizeTurkish,
} from './nlp/gensimEngine';
import {
  loadUserPreferences,
  recordSearch,
  clearSearchHistory,
  applyPresetProfile,
  getPersonalizedRecommendations,
} from './nlp/recommendationEngine';
import { Navbar } from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
import { DidYouMeanBanner } from './components/DidYouMeanBanner';
import { CategoryNav } from './components/CategoryNav';
import { FilterControls } from './components/FilterControls';
import { ProductCard } from './components/ProductCard';
import { PersonalizedRecommendations } from './components/PersonalizedRecommendations';
import { CartDrawer } from './components/CartDrawer';
import { ProductDetailModal } from './components/ProductDetailModal';
import { NlpPlaygroundModal } from './components/NlpPlaygroundModal';
import { Sparkles, ShoppingBasket, SearchX, CheckCircle, Heart } from 'lucide-react';

const CART_STORAGE_KEY = 'gurmepazar_cart_v1';

export default function App() {
  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSearchTerm, setActiveSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory>('hepsi');
  const [correction, setCorrection] = useState<SearchCorrection | null>(null);

  // Filters State
  const [filters, setFilters] = useState<FilterOptions>({
    category: 'hepsi',
    minPrice: 0,
    maxPrice: 350,
    sortBy: 'relevance',
    onlyDiscounted: false,
    onlyOrganic: false,
    inStockOnly: false,
  });

  // User preferences & Search history
  const [preferences, setPreferences] = useState<UserPreferences>(() => loadUserPreferences());

  // Cart State
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [
      { product: PRODUCTS[0], quantity: 1 }, // Amasya Elması
      { product: PRODUCTS[10], quantity: 2 }, // Patates Cipsi
    ];
  });

  // Modals
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isNlpLabOpen, setIsNlpLabOpen] = useState(false);
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);

  // Save cart
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
    } catch {
      // ignore
    }
  }, [cartItems]);

  // Execute Search
  const handlePerformSearch = useCallback(
    (query: string, overrideCorrectionWord?: string) => {
      const clean = query.trim();
      setActiveSearchTerm(clean);

      if (!clean) {
        setCorrection(null);
        return;
      }

      // Check NLP correction
      const corr = detectSpellingCorrection(clean);
      
      if (overrideCorrectionWord) {
        // User accepted or picked a specific word
        corr.isCorrected = true;
        corr.correctedWord = overrideCorrectionWord;
      }

      setCorrection(corr);

      // Record to search history and update recommendation profile
      const updatedPrefs = recordSearch(clean, corr.isCorrected ? corr.correctedWord : undefined);
      setPreferences(updatedPrefs);
    },
    []
  );

  // Quick typo test from banner
  const handleQuickTypoTest = (typo: string) => {
    setSearchQuery(typo);
    handlePerformSearch(typo);
    window.scrollTo({ top: 380, behavior: 'smooth' });
  };

  // Accept NLP correction
  const handleAcceptCorrection = (correctedWord: string) => {
    setSearchQuery(correctedWord);
    handlePerformSearch(correctedWord, correctedWord);
  };

  // Revert to raw typo query
  const handleRevertToOriginal = (originalQuery: string) => {
    setSearchQuery(originalQuery);
    setActiveSearchTerm(originalQuery);
    setCorrection((prev) => (prev ? { ...prev, isCorrected: false } : null));
  };

  // Cart operations
  const handleAddToCart = (product: Product) => {
    setCartItems((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const handleUpdateCartQuantity = (productId: string, quantity: number) => {
    setCartItems((prev) => {
      if (quantity <= 0) {
        return prev.filter((i) => i.product.id !== productId);
      }
      return prev.map((i) =>
        i.product.id === productId ? { ...i, quantity } : i
      );
    });
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  const getCartQuantity = (productId: string) => {
    const item = cartItems.find((i) => i.product.id === productId);
    return item ? item.quantity : 0;
  };

  // Preferences operations
  const handleClearSearchHistory = () => {
    const reset = clearSearchHistory();
    setPreferences(reset);
  };

  const handleApplyPreset = (preset: 'saglikli' | 'sinema' | 'temizlik' | 'kahvalti') => {
    const updated = applyPresetProfile(preset);
    setPreferences(updated);
  };

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<ProductCategory, number> = {
      'hepsi': PRODUCTS.length,
      'meyve-sebze': 0,
      'abur-cubur': 0,
      'temizlik': 0,
      'sut-kahvaltilik': 0,
      'temel-gida': 0,
    };
    for (const p of PRODUCTS) {
      counts[p.category] = (counts[p.category] || 0) + 1;
    }
    return counts;
  }, []);

  // Filtered & Searched Products List
  const filteredProducts = useMemo(() => {
    let result = [...PRODUCTS];

    // 1. Category Filter
    if (selectedCategory !== 'hepsi') {
      result = result.filter((p) => p.category === selectedCategory);
    }

    // 2. Search query matching (with NLP and typo support)
    if (activeSearchTerm) {
      const searchTarget = correction?.isCorrected
        ? correction.correctedWord
        : activeSearchTerm;
      const normalizedQuery = normalizeTurkish(searchTarget);
      const originalNorm = normalizeTurkish(activeSearchTerm);

      result = result.filter((product) => {
        // Direct title or tag match
        const normName = normalizeTurkish(product.name);
        const normDesc = normalizeTurkish(product.description);
        const normCategory = normalizeTurkish(product.categoryLabel);

        if (
          normName.includes(normalizedQuery) ||
          normName.includes(originalNorm) ||
          normDesc.includes(normalizedQuery) ||
          normCategory.includes(normalizedQuery)
        ) {
          return true;
        }

        // Tag matching
        if (
          product.tags.some(
            (t) =>
              normalizeTurkish(t).includes(normalizedQuery) ||
              normalizeTurkish(t).includes(originalNorm)
          )
        ) {
          return true;
        }

        // Gensim Vector semantic proximity match
        for (const kw of product.keywords) {
          const sim = gensimModel.similarity(normalizedQuery, kw);
          if (sim >= 0.70) return true;
        }

        return false;
      });
    }

    // 3. Additional interactive filters
    if (filters.onlyDiscounted) {
      result = result.filter((p) => p.originalPrice && p.originalPrice > p.price);
    }

    if (filters.onlyOrganic) {
      result = result.filter(
        (p) =>
          p.badges?.some((b) => b.includes('Organik')) ||
          p.tags.some((t) => t.includes('organik'))
      );
    }

    if (filters.inStockOnly) {
      result = result.filter((p) => p.inStock);
    }

    // Max Price
    result = result.filter((p) => p.price <= filters.maxPrice);

    // 4. Sorting
    result.sort((a, b) => {
      if (filters.sortBy === 'price-asc') {
        return a.price - b.price;
      }
      if (filters.sortBy === 'price-desc') {
        return b.price - a.price;
      }
      if (filters.sortBy === 'rating') {
        return b.rating - a.rating;
      }
      if (filters.sortBy === 'discount') {
        const discA = a.originalPrice ? a.originalPrice - a.price : 0;
        const discB = b.originalPrice ? b.originalPrice - b.price : 0;
        return discB - discA;
      }

      // Default: NLP & User Personalization relevance
      if (activeSearchTerm) {
        const targetWord = correction?.isCorrected
          ? correction.correctedWord
          : activeSearchTerm;
        const simA = Math.max(
          ...a.keywords.map((k) => gensimModel.similarity(targetWord, k))
        );
        const simB = Math.max(
          ...b.keywords.map((k) => gensimModel.similarity(targetWord, k))
        );
        return simB - simA;
      }

      // Otherwise user preference category boost
      const scoreA = preferences.categoryScores[a.category] || 1;
      const scoreB = preferences.categoryScores[b.category] || 1;
      return scoreB - scoreA;
    });

    return result;
  }, [
    selectedCategory,
    activeSearchTerm,
    correction,
    filters,
    preferences.categoryScores,
  ]);

  // Personalized recommendations
  const personalizedRecommendations = useMemo(() => {
    return getPersonalizedRecommendations(PRODUCTS, preferences, 4);
  }, [preferences]);

  // Cart totals
  const cartTotalCount = cartItems.reduce((acc, i) => acc + i.quantity, 0);
  const cartTotalPrice = cartItems.reduce(
    (acc, i) => acc + i.product.price * i.quantity,
    0
  );

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col text-stone-900">
      
      {/* Navbar */}
      <Navbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSearchSubmit={handlePerformSearch}
        searchHistory={preferences.searchHistory}
        onClearHistory={handleClearSearchHistory}
        onSelectHistoryItem={(q) => {
          setSearchQuery(q);
          handlePerformSearch(q);
        }}
        cartTotalCount={cartTotalCount}
        cartTotalPrice={cartTotalPrice}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenNlpLab={() => setIsNlpLabOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {/* Hero Section */}
        <HeroBanner
          onQuickSearchTest={handleQuickTypoTest}
          onOpenNlpLab={() => setIsNlpLabOpen(true)}
        />

        {/* NLP Did You Mean Banner */}
        <DidYouMeanBanner
          correction={correction}
          onAcceptCorrection={handleAcceptCorrection}
          onRevertToOriginal={handleRevertToOriginal}
          onSelectSimilar={(word) => {
            setSearchQuery(word);
            handlePerformSearch(word, word);
          }}
        />

        {/* Personalized Recommendations Section (Based on Search History) */}
        <PersonalizedRecommendations
          recommendations={personalizedRecommendations}
          preferences={preferences}
          onApplyPreset={handleApplyPreset}
          onResetPreferences={handleClearSearchHistory}
          getCartQuantity={getCartQuantity}
          onAddToCart={handleAddToCart}
          onUpdateQuantity={handleUpdateCartQuantity}
          onOpenDetail={(prod) => setDetailProduct(prod)}
        />

        {/* Category Navigation Tabs */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight flex items-center gap-2">
              <ShoppingBasket className="w-6 h-6 text-emerald-600" />
              <span>Tüm Market &amp; Mutfak Reyonları</span>
            </h2>
            {activeSearchTerm && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setActiveSearchTerm('');
                  setCorrection(null);
                }}
                className="text-xs font-semibold text-rose-600 hover:text-rose-700 underline cursor-pointer"
              >
                Aramayı Sıfırla
              </button>
            )}
          </div>

          <CategoryNav
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            productCounts={categoryCounts}
          />
        </div>

        {/* Filter Controls */}
        <FilterControls
          filters={filters}
          onChangeFilters={setFilters}
          onResetFilters={() =>
            setFilters({
              category: 'hepsi',
              minPrice: 0,
              maxPrice: 350,
              sortBy: 'relevance',
              onlyDiscounted: false,
              onlyOrganic: false,
              inStockOnly: false,
            })
          }
          totalFilteredCount={filteredProducts.length}
        />

        {/* Products Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                quantityInCart={getCartQuantity(product.id)}
                onAddToCart={handleAddToCart}
                onUpdateQuantity={handleUpdateCartQuantity}
                onOpenDetail={(prod) => setDetailProduct(prod)}
              />
            ))}
          </div>
        ) : (
          /* Empty Search State */
          <div className="py-16 px-6 text-center bg-white rounded-3xl border border-stone-200/80 shadow-xs max-w-lg mx-auto">
            <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4 text-stone-400">
              <SearchX className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-stone-900 mb-1">
              Aradığınız Kriterlere Uygun Ürün Bulunamadı
            </h3>
            <p className="text-xs sm:text-sm text-stone-500 mb-5 leading-relaxed">
              &quot;{activeSearchTerm}&quot; için sonuç yok veya seçili filtreler çok dar. 
              Gensim NLP sözlüğümüzdeki meyve, sebze, abur cubur veya temizlik terimlerini deneyebilirsiniz.
            </p>
            <div className="flex justify-center gap-2 flex-wrap">
              <button
                onClick={() => {
                  setSearchQuery('');
                  setActiveSearchTerm('');
                  setCorrection(null);
                  setSelectedCategory('hepsi');
                  setFilters((prev) => ({ ...prev, maxPrice: 350, onlyDiscounted: false, onlyOrganic: false }));
                }}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                Tüm Filtreleri Temizle
              </button>
            </div>
          </div>
        )}

      </main>

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateCartQuantity}
        onClearCart={handleClearCart}
      />

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={detailProduct}
        onClose={() => setDetailProduct(null)}
        quantityInCart={detailProduct ? getCartQuantity(detailProduct.id) : 0}
        onAddToCart={handleAddToCart}
        onUpdateQuantity={handleUpdateCartQuantity}
        allProducts={PRODUCTS}
        onSelectSimilarProduct={(simProd) => setDetailProduct(simProd)}
      />

      {/* Gensim NLP & Python Lab Modal */}
      <NlpPlaygroundModal
        isOpen={isNlpLabOpen}
        onClose={() => setIsNlpLabOpen(false)}
        onSelectWordToSearch={(word) => {
          setSearchQuery(word);
          handlePerformSearch(word, word);
          setIsNlpLabOpen(false);
        }}
      />

      {/* Footer */}
      <footer className="mt-16 bg-stone-900 text-stone-400 border-t border-stone-800 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-white font-extrabold text-base">
                <span>GurmePazar</span>
                <span className="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded-full font-mono">
                  Gensim NLP
                </span>
              </div>
              <p className="text-xs text-stone-400 leading-relaxed">
                Türkçe doğal dil işleme (NLP) ve Gensim Word2Vec vektör modelleri ile güçlendirilmiş akıllı mutfak ve market alışveriş platformu.
              </p>
            </div>

            <div>
              <h4 className="text-white font-bold mb-3 uppercase tracking-wider text-[11px]">
                Kategoriler
              </h4>
              <ul className="space-y-1.5 text-stone-400">
                <li>Meyve &amp; Taze Sebzeler</li>
                <li>Abur Cubur &amp; Atıştırmalıklar</li>
                <li>Ev Temizlik &amp; Hijyen Ürünleri</li>
                <li>Süt &amp; Kahvaltılık Çeşitleri</li>
                <li>Temel Gıda &amp; Kiler</li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold mb-3 uppercase tracking-wider text-[11px]">
                NLP &amp; Gensim Özellikleri
              </h4>
              <ul className="space-y-1.5 text-stone-400">
                <li>KeyedVectors trModel100 simülasyonu</li>
                <li>Kosinüs Benzerliği (Cosine Similarity)</li>
                <li>&quot;Bunu aramak istemiştiniz&quot; düzeltmesi</li>
                <li>Arama geçmişine dayalı kişiselleştirme</li>
                <li>Rafine komşuluk filtreleme</li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold mb-3 uppercase tracking-wider text-[11px]">
                Geliştirici &amp; Model
              </h4>
              <p className="text-stone-400 text-xs leading-relaxed mb-3">
                Eklenen Gensim Python paketleri (<code className="text-emerald-400">similarity.py</code>, <code className="text-emerald-400">_mostSimilarRafine.py</code>) temel alınarak statik web motorunda derlenmiştir.
              </p>
              <button
                onClick={() => setIsNlpLabOpen(true)}
                className="px-3.5 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-xl font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>Gensim Lab&apos;ı Aç</span>
              </button>
            </div>
          </div>

          <div className="pt-6 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-stone-500 text-[11px]">
            <span>&copy; 2026 GurmePazar &bull; Gensim NLP Mutfak &amp; Market Alışveriş Sistemi</span>
            <div className="flex items-center gap-4">
              <span>Python &bull; JavaScript &bull; React &bull; Tailwind CSS</span>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
