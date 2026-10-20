import { Product, ProductCategory, SearchHistoryItem, UserPreferences } from '../types';
import { gensimModel, normalizeTurkish } from './gensimEngine';

const STORAGE_KEY = 'gurmepazar_user_prefs_v1';

const DEFAULT_CATEGORY_SCORES: Record<ProductCategory, number> = {
  'hepsi': 1,
  'meyve-sebze': 1,
  'abur-cubur': 1,
  'temizlik': 1,
  'sut-kahvaltilik': 1,
  'temel-gida': 1,
};

// Initial state
const INITIAL_PREFERENCES: UserPreferences = {
  searchHistory: [
    { query: 'cips', timestamp: Date.now() - 1000 * 60 * 30, categoryAffinity: 'abur-cubur' },
    { query: 'amasya elma', timestamp: Date.now() - 1000 * 60 * 120, categoryAffinity: 'meyve-sebze' },
  ],
  categoryScores: {
    ...DEFAULT_CATEGORY_SCORES,
    'abur-cubur': 3,
    'meyve-sebze': 2.5,
  },
  favoriteProductIds: ['prod-cips-baharatli'],
};

/**
 * Loads preferences from localStorage or returns default
 */
export function loadUserPreferences(): UserPreferences {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.searchHistory)) {
        return parsed;
      }
    }
  } catch {
    // ignore
  }
  return INITIAL_PREFERENCES;
}

/**
 * Saves preferences to localStorage
 */
export function saveUserPreferences(prefs: UserPreferences): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    // ignore
  }
}

/**
 * Maps query keywords to probable category
 */
export function inferCategoryFromQuery(query: string): ProductCategory {
  const norm = normalizeTurkish(query);
  if (['elma', 'armut', 'muz', 'cilek', 'portakal', 'limon', 'meyve', 'domates', 'salatalik', 'patates', 'sogan', 'biber', 'havuc', 'avokado', 'sebze'].some(k => norm.includes(k))) {
    return 'meyve-sebze';
  }
  if (['cips', 'cikolata', 'biskuvi', 'kraker', 'gofret', 'jelibon', 'kuruyemis', 'atistirmalik', 'aburcubur', 'abur'].some(k => norm.includes(k))) {
    return 'abur-cubur';
  }
  if (['deterjan', 'camasir', 'sabun', 'sunger', 'yuzey', 'kagit', 'sampuan', 'temizlik', 'hijyen'].some(k => norm.includes(k))) {
    return 'temizlik';
  }
  if (['sut', 'peynir', 'kasar', 'zeytin', 'yumurta', 'bal', 'tereyagi', 'kahvalti', 'kahvaltilik'].some(k => norm.includes(k))) {
    return 'sut-kahvaltilik';
  }
  if (['makarna', 'pirinc', 'yag', 'zeytinyagi', 'salca', 'un', 'seker', 'tuz', 'mercimek', 'kahve', 'cay', 'kiler'].some(k => norm.includes(k))) {
    return 'temel-gida';
  }
  return 'hepsi';
}

/**
 * Records a search query in history and updates category affinity scores
 */
export function recordSearch(
  query: string,
  correctedTo?: string
): UserPreferences {
  const current = loadUserPreferences();
  const trimmed = query.trim();
  if (!trimmed) return current;

  const category = inferCategoryFromQuery(correctedTo || trimmed);

  // Prepend to history, filter out duplicates within top 5
  const newHistory: SearchHistoryItem[] = [
    {
      query: trimmed,
      timestamp: Date.now(),
      correctedTo,
      categoryAffinity: category !== 'hepsi' ? category : undefined,
    },
    ...current.searchHistory.filter(h => h.query.toLowerCase() !== trimmed.toLowerCase()),
  ].slice(0, 15); // Keep last 15 searches

  // Update category weights
  const updatedScores = { ...current.categoryScores };
  if (category !== 'hepsi') {
    updatedScores[category] = (updatedScores[category] || 1) + 1.5;
  }

  const updated: UserPreferences = {
    ...current,
    searchHistory: newHistory,
    categoryScores: updatedScores,
  };

  saveUserPreferences(updated);
  return updated;
}

/**
 * Clears search history
 */
export function clearSearchHistory(): UserPreferences {
  const reset: UserPreferences = {
    searchHistory: [],
    categoryScores: { ...DEFAULT_CATEGORY_SCORES },
    favoriteProductIds: [],
  };
  saveUserPreferences(reset);
  return reset;
}

/**
 * Applies a demo profile to test recommendation engine
 */
export function applyPresetProfile(
  preset: 'saglikli' | 'sinema' | 'temizlik' | 'kahvalti'
): UserPreferences {
  let queries: Array<{ q: string; cat: ProductCategory }> = [];
  if (preset === 'saglikli') {
    queries = [
      { q: 'organik avokado', cat: 'meyve-sebze' },
      { q: 'amasya elma', cat: 'meyve-sebze' },
      { q: 'taze salatalık', cat: 'meyve-sebze' },
      { q: 'çiçek balı', cat: 'sut-kahvaltilik' },
    ];
  } else if (preset === 'sinema') {
    queries = [
      { q: 'baharatlı cips', cat: 'abur-cubur' },
      { q: 'fındıklı çikolata', cat: 'abur-cubur' },
      { q: 'kakaolu bisküvi', cat: 'abur-cubur' },
      { q: 'karışık kuruyemiş', cat: 'abur-cubur' },
    ];
  } else if (preset === 'temizlik') {
    queries = [
      { q: 'çamaşır deterjanı', cat: 'temizlik' },
      { q: 'yoğun çamaşır suyu', cat: 'temizlik' },
      { q: 'bulaşık süngeri', cat: 'temizlik' },
      { q: 'kağıt havlu', cat: 'temizlik' },
    ];
  } else {
    queries = [
      { q: 'ezine peynir', cat: 'sut-kahvaltilik' },
      { q: 'gemlik zeytin', cat: 'sut-kahvaltilik' },
      { q: 'günlük süt', cat: 'sut-kahvaltilik' },
      { q: 'organik yumurta', cat: 'sut-kahvaltilik' },
    ];
  }

  const scores = { ...DEFAULT_CATEGORY_SCORES };
  const history: SearchHistoryItem[] = queries.map((item, idx) => {
    scores[item.cat] = (scores[item.cat] || 1) + 2.5;
    return {
      query: item.q,
      timestamp: Date.now() - idx * 60000,
      categoryAffinity: item.cat,
    };
  });

  const updated: UserPreferences = {
    searchHistory: history,
    categoryScores: scores,
    favoriteProductIds: [],
  };
  saveUserPreferences(updated);
  return updated;
}

export interface PersonalizedRecommendationResult {
  product: Product;
  score: number;
  reason: string;
}

/**
 * Computes personalized product recommendations using Gensim vector similarity
 * and search category affinity.
 */
export function getPersonalizedRecommendations(
  allProducts: Product[],
  preferences: UserPreferences,
  limit: number = 6
): PersonalizedRecommendationResult[] {
  const { searchHistory, categoryScores } = preferences;

  // Extract recent search words
  const recentSearchTerms = searchHistory
    .slice(0, 6)
    .map(h => (h.correctedTo || h.query).toLowerCase());

  // Determine top category affinity
  let topCategory: ProductCategory = 'hepsi';
  let highestScore = 0;
  for (const [cat, score] of Object.entries(categoryScores)) {
    if (cat !== 'hepsi' && score > highestScore) {
      highestScore = score;
      topCategory = cat as ProductCategory;
    }
  }

  const results: PersonalizedRecommendationResult[] = allProducts.map(product => {
    let score = 0;
    let reason = 'Popüler ve yüksek puanlı ürün';

    // 1. Category affinity boost
    const catScore = categoryScores[product.category] || 1;
    score += catScore * 15;

    // 2. Gensim Semantic Vector Similarity with user recent searches
    let maxVectorSim = 0;
    let matchedSearchWord = '';

    for (const searchWord of recentSearchTerms) {
      for (const keyword of product.keywords) {
        const sim = gensimModel.similarity(searchWord, keyword);
        if (sim > maxVectorSim) {
          maxVectorSim = sim;
          matchedSearchWord = searchWord;
        }
      }
    }

    score += maxVectorSim * 45;

    if (maxVectorSim > 0.65 && matchedSearchWord) {
      reason = `Son aramanız '${matchedSearchWord}' ile %${Math.round(maxVectorSim * 100)} semantik benzerlik`;
    } else if (catScore > 2.5) {
      reason = `${product.categoryLabel} kategorisine yüksek ilginize göre önerildi`;
    } else if (product.originalPrice && product.originalPrice > product.price) {
      reason = 'Sizin için seçilen özel indirimli fırsat';
    }

    // 3. Rating & discount factor
    score += product.rating * 5;
    if (product.originalPrice) {
      score += 10;
    }

    return {
      product,
      score: Math.round(score * 10) / 10,
      reason,
    };
  });

  // Sort descending by calculated personalization score
  results.sort((a, b) => b.score - a.score);

  return results.slice(0, limit);
}
