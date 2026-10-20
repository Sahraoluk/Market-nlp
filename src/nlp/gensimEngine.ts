/**
 * Gensim KeyedVectors & Turkish NLP Similarity Engine
 * 
 * Replicates gensim.models.KeyedVectors with cosine similarity,
 * most_similar, and phonetic-vector fuzzy spell correction.
 */

// Turkish character mapping and normalization
export function normalizeTurkish(text: string): string {
  if (!text) return '';
  return text
    .replace(/İ/g, 'i')
    .replace(/I/g, 'ı')
    .toLowerCase()
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .trim();
}

export function turkishToLower(text: string): string {
  if (!text) return '';
  return text
    .replace(/İ/g, 'i')
    .replace(/I/g, 'ı')
    .toLowerCase()
    .trim();
}

/**
 * High-dimensional semantic vectors for Turkish grocery & kitchen domain
 * (representing semantic clusters: meyve, sebze, atıştırmalık/abur cubur, temizlik, kahvaltı, kiler)
 * Dimensions: [meyve, sebze, sekerli, tuzlu, atistirmalik, hijyen, kimyasal, sut urunu, tahil, sivi, taze, kahvalti]
 */
const BASE_VECTORS: Record<string, number[]> = {
  // Meyveler
  'elma':      [0.92, 0.40, 0.65, 0.05, 0.35, 0.00, 0.00, 0.00, 0.05, 0.30, 0.95, 0.30],
  'armut':     [0.90, 0.38, 0.68, 0.04, 0.30, 0.00, 0.00, 0.00, 0.05, 0.35, 0.94, 0.25],
  'muz':       [0.93, 0.30, 0.75, 0.05, 0.45, 0.00, 0.00, 0.00, 0.10, 0.15, 0.92, 0.50],
  'cilek':     [0.94, 0.25, 0.80, 0.02, 0.40, 0.00, 0.00, 0.00, 0.00, 0.40, 0.96, 0.35],
  'portakal':  [0.91, 0.35, 0.70, 0.03, 0.25, 0.00, 0.00, 0.00, 0.00, 0.65, 0.93, 0.35],
  'limon':     [0.85, 0.60, 0.20, 0.05, 0.10, 0.20, 0.00, 0.00, 0.00, 0.60, 0.95, 0.20],
  'meyve':     [0.98, 0.45, 0.70, 0.04, 0.40, 0.00, 0.00, 0.00, 0.05, 0.30, 0.95, 0.35],

  // Sebzeler
  'domates':   [0.35, 0.95, 0.25, 0.10, 0.10, 0.00, 0.00, 0.00, 0.05, 0.50, 0.96, 0.65],
  'salatalik': [0.30, 0.94, 0.15, 0.10, 0.15, 0.00, 0.00, 0.00, 0.00, 0.60, 0.97, 0.60],
  'patates':   [0.10, 0.90, 0.10, 0.15, 0.35, 0.00, 0.00, 0.00, 0.60, 0.05, 0.85, 0.20],
  'sogan':     [0.10, 0.92, 0.20, 0.15, 0.05, 0.00, 0.00, 0.00, 0.10, 0.20, 0.88, 0.15],
  'biber':     [0.25, 0.93, 0.20, 0.15, 0.10, 0.00, 0.00, 0.00, 0.05, 0.30, 0.94, 0.55],
  'havuc':     [0.40, 0.91, 0.45, 0.10, 0.25, 0.00, 0.00, 0.00, 0.15, 0.25, 0.92, 0.20],
  'avokado':   [0.65, 0.80, 0.20, 0.10, 0.20, 0.00, 0.00, 0.00, 0.10, 0.10, 0.91, 0.60],
  'sebze':     [0.35, 0.98, 0.20, 0.12, 0.10, 0.00, 0.00, 0.00, 0.15, 0.30, 0.96, 0.45],

  // Abur Cubur / Atıştırmalık
  'cips':      [0.05, 0.15, 0.10, 0.95, 0.96, 0.00, 0.00, 0.00, 0.50, 0.02, 0.10, 0.05],
  'cikolata':  [0.15, 0.05, 0.96, 0.10, 0.94, 0.00, 0.00, 0.25, 0.20, 0.05, 0.10, 0.25],
  'biskuvi':   [0.10, 0.05, 0.85, 0.35, 0.92, 0.00, 0.00, 0.15, 0.80, 0.02, 0.15, 0.40],
  'kraker':    [0.05, 0.08, 0.20, 0.92, 0.93, 0.00, 0.00, 0.10, 0.85, 0.02, 0.15, 0.25],
  'gofret':    [0.10, 0.05, 0.92, 0.20, 0.93, 0.00, 0.00, 0.15, 0.70, 0.02, 0.12, 0.20],
  'jelibon':   [0.25, 0.02, 0.95, 0.05, 0.90, 0.00, 0.00, 0.00, 0.05, 0.05, 0.10, 0.05],
  'kuruyemis': [0.15, 0.20, 0.25, 0.80, 0.88, 0.00, 0.00, 0.00, 0.40, 0.02, 0.50, 0.40],
  'atistirmalik': [0.12, 0.10, 0.85, 0.85, 0.98, 0.00, 0.00, 0.10, 0.60, 0.05, 0.15, 0.25],
  'aburcubur':    [0.10, 0.08, 0.90, 0.85, 0.99, 0.00, 0.00, 0.08, 0.55, 0.04, 0.12, 0.20],

  // Temizlik & Hijyen
  'deterjan':      [0.00, 0.00, 0.00, 0.00, 0.00, 0.98, 0.95, 0.00, 0.00, 0.60, 0.00, 0.00],
  'camasirsuyu':   [0.00, 0.00, 0.00, 0.00, 0.00, 0.99, 0.98, 0.00, 0.00, 0.80, 0.00, 0.00],
  'sabun':         [0.02, 0.00, 0.00, 0.00, 0.00, 0.96, 0.85, 0.00, 0.00, 0.40, 0.00, 0.00],
  'sunger':        [0.00, 0.00, 0.00, 0.00, 0.00, 0.90, 0.50, 0.00, 0.00, 0.05, 0.00, 0.00],
  'yuzeytemizleyici': [0.00, 0.00, 0.00, 0.00, 0.00, 0.97, 0.94, 0.00, 0.00, 0.85, 0.00, 0.00],
  'kagithavlu':    [0.00, 0.00, 0.00, 0.00, 0.00, 0.88, 0.20, 0.00, 0.20, 0.00, 0.00, 0.00],
  'sampuan':       [0.05, 0.00, 0.05, 0.00, 0.00, 0.95, 0.80, 0.00, 0.00, 0.70, 0.00, 0.00],
  'temizlik':      [0.00, 0.00, 0.00, 0.00, 0.00, 0.99, 0.90, 0.00, 0.00, 0.50, 0.00, 0.00],
  'hijyen':        [0.00, 0.00, 0.00, 0.00, 0.00, 0.98, 0.85, 0.00, 0.00, 0.40, 0.00, 0.00],

  // Süt & Kahvaltılık
  'sut':       [0.20, 0.05, 0.35, 0.05, 0.15, 0.00, 0.00, 0.98, 0.10, 0.90, 0.90, 0.85],
  'peynir':    [0.10, 0.05, 0.15, 0.65, 0.25, 0.00, 0.00, 0.95, 0.10, 0.10, 0.85, 0.96],
  'kasar':     [0.10, 0.05, 0.10, 0.60, 0.25, 0.00, 0.00, 0.96, 0.10, 0.10, 0.85, 0.94],
  'zeytin':    [0.15, 0.30, 0.05, 0.75, 0.20, 0.00, 0.00, 0.10, 0.10, 0.15, 0.80, 0.95],
  'yumurta':   [0.05, 0.05, 0.05, 0.20, 0.15, 0.00, 0.00, 0.40, 0.10, 0.20, 0.90, 0.96],
  'bal':       [0.40, 0.05, 0.95, 0.00, 0.30, 0.00, 0.00, 0.05, 0.05, 0.50, 0.85, 0.90],
  'tereyagi':  [0.05, 0.05, 0.10, 0.35, 0.20, 0.00, 0.00, 0.92, 0.05, 0.20, 0.82, 0.92],
  'kahvalti':  [0.25, 0.25, 0.45, 0.50, 0.35, 0.00, 0.00, 0.85, 0.35, 0.45, 0.85, 0.99],
  'kahvaltilik':[0.25, 0.25, 0.45, 0.50, 0.35, 0.00, 0.00, 0.85, 0.35, 0.45, 0.85, 0.99],

  // Temel Gıda & Kiler
  'makarna':   [0.05, 0.10, 0.10, 0.20, 0.25, 0.00, 0.00, 0.05, 0.98, 0.00, 0.40, 0.10],
  'pirinc':    [0.05, 0.10, 0.10, 0.15, 0.15, 0.00, 0.00, 0.05, 0.97, 0.00, 0.40, 0.10],
  'yag':       [0.05, 0.15, 0.05, 0.10, 0.10, 0.00, 0.00, 0.20, 0.10, 0.90, 0.50, 0.30],
  'zeytinyagi':[0.15, 0.25, 0.05, 0.10, 0.10, 0.00, 0.00, 0.10, 0.10, 0.92, 0.65, 0.40],
  'salca':     [0.20, 0.85, 0.20, 0.50, 0.05, 0.00, 0.00, 0.00, 0.10, 0.40, 0.70, 0.30],
  'un':        [0.05, 0.05, 0.15, 0.05, 0.20, 0.00, 0.00, 0.05, 0.95, 0.00, 0.30, 0.15],
  'seker':     [0.10, 0.05, 0.99, 0.00, 0.40, 0.00, 0.00, 0.00, 0.30, 0.00, 0.20, 0.35],
  'tuz':       [0.00, 0.05, 0.00, 0.99, 0.10, 0.00, 0.00, 0.00, 0.10, 0.00, 0.20, 0.20],
  'mercimek':  [0.05, 0.40, 0.10, 0.15, 0.10, 0.00, 0.00, 0.00, 0.92, 0.00, 0.45, 0.10],

  // İçecekler
  'kahve':     [0.10, 0.05, 0.25, 0.05, 0.35, 0.00, 0.00, 0.10, 0.20, 0.85, 0.50, 0.60],
  'cay':       [0.10, 0.05, 0.20, 0.05, 0.30, 0.00, 0.00, 0.05, 0.15, 0.90, 0.60, 0.80],
  'madensuyu': [0.05, 0.05, 0.05, 0.10, 0.20, 0.00, 0.00, 0.00, 0.00, 0.99, 0.75, 0.25],
  'su':        [0.05, 0.05, 0.00, 0.05, 0.10, 0.10, 0.00, 0.00, 0.00, 1.00, 0.80, 0.40],
};

// Normalize all base vectors to unit vectors for fast cosine similarity: dot(u, v)
const NORMALIZED_VECTORS: Record<string, number[]> = {};
for (const [key, vec] of Object.entries(BASE_VECTORS)) {
  const norm = Math.sqrt(vec.reduce((sum, val) => sum + val * val, 0));
  NORMALIZED_VECTORS[key] = norm > 0 ? vec.map(v => v / norm) : vec;
}

/**
 * Standard Levenshtein Distance
 */
export function levenshteinDistance(s1: string, s2: string): number {
  const a = normalizeTurkish(s1);
  const b = normalizeTurkish(s2);
  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

/**
 * String similarity ratio (0.0 to 1.0) based on normalized Levenshtein
 */
export function stringSimilarity(s1: string, s2: string): number {
  const a = normalizeTurkish(s1);
  const b = normalizeTurkish(s2);
  if (a === b) return 1.0;
  if (!a.length || !b.length) return 0.0;
  const dist = levenshteinDistance(a, b);
  const maxLen = Math.max(a.length, b.length);
  return Math.max(0, 1 - dist / maxLen);
}

/**
 * Gensim KeyedVectors Simulator Class
 * Replicates KeyedVectors.similarity() and KeyedVectors.most_similar()
 */
export class GensimKeyedVectors {
  private vectors: Record<string, number[]>;

  constructor() {
    this.vectors = NORMALIZED_VECTORS;
  }

  /**
   * Checks if word exists in vocabulary
   */
  has(word: string): boolean {
    const norm = normalizeTurkish(word);
    return Boolean(this.vectors[norm]);
  }

  /**
   * Get vector embedding for word
   */
  getVector(word: string): number[] | null {
    const norm = normalizeTurkish(word);
    return this.vectors[norm] || null;
  }

  /**
   * Replicates: kelimeVektoru.similarity(anahtarKelime1, anahtarKelime2)
   * Cosine similarity between two words
   */
  similarity(word1: string, word2: string): number {
    const norm1 = normalizeTurkish(word1);
    const norm2 = normalizeTurkish(word2);

    if (norm1 === norm2) return 1.0;

    const v1 = this.vectors[norm1];
    const v2 = this.vectors[norm2];

    if (!v1 || !v2) {
      // Fallback to fuzzy string similarity if vector not in vocabulary
      return stringSimilarity(norm1, norm2);
    }

    // Dot product of unit vectors
    let dot = 0;
    for (let i = 0; i < v1.length; i++) {
      dot += v1[i] * v2[i];
    }
    // Clip between -1 and 1, normalize to 0..1 for UI display
    return Math.max(0, Math.min(1, dot));
  }

  /**
   * Replicates: kelimeVektoru.most_similar(positive=anahtarKelime)
   * With rafine option from user's `_mostSimilarRafine.py`:
   * if (anahtarKelime not in oneri[0]) filter out substrings!
   */
  most_similar(
    positive: string,
    topN: number = 8,
    rafine: boolean = false
  ): Array<[string, number]> {
    const normPos = normalizeTurkish(positive);
    const targetVec = this.vectors[normPos];

    const results: Array<[string, number]> = [];

    for (const [vocabWord, vocabVec] of Object.entries(this.vectors)) {
      if (vocabWord === normPos) continue;

      // In _mostSimilarRafine.py: if anahtarKelime not in oneri[0]: print(...)
      if (rafine && vocabWord.includes(normPos)) {
        continue;
      }

      let score = 0;
      if (targetVec) {
        for (let i = 0; i < targetVec.length; i++) {
          score += targetVec[i] * vocabVec[i];
        }
      } else {
        // If word not in vocabulary, score by fuzzy similarity
        score = stringSimilarity(normPos, vocabWord);
      }

      results.push([vocabWord, Math.max(0, Math.min(1, score))]);
    }

    results.sort((a, b) => b[1] - a[1]);
    return results.slice(0, topN);
  }

  /**
   * Returns list of all known vocabulary terms
   */
  getVocabulary(): string[] {
    return Object.keys(this.vectors);
  }
}

// Singleton instance
export const gensimModel = new GensimKeyedVectors();

/**
 * Common Turkish grocery typo mappings dictionary
 * Provides instant high-precision corrections for frequent typos
 */
export const COMMON_TYPOS: Record<string, string> = {
  // Meyve & Sebze
  'elmma': 'elma',
  'elam': 'elma',
  'alma': 'elma',
  'elma': 'elma',
  'armud': 'armut',
  'armt': 'armut',
  'mzu': 'muz',
  'muzz': 'muz',
  'çlek': 'çilek',
  'cilek': 'çilek',
  'cilekk': 'çilek',
  'prtakal': 'portakal',
  'portakla': 'portakal',
  'lmon': 'limon',
  'limonn': 'limon',
  'domts': 'domates',
  'domates': 'domates',
  'domatis': 'domates',
  'domatez': 'domates',
  'domatesi': 'domates',
  'salatalık': 'salatalık',
  'saltalik': 'salatalık',
  'salatalik': 'salatalık',
  'salata': 'salatalık',
  'patates': 'patates',
  'patatez': 'patates',
  'patats': 'patates',
  'pates': 'patates',
  'sogan': 'soğan',
  'soan': 'soğan',
  'soğan': 'soğan',
  'bibr': 'biber',
  'biberr': 'biber',
  'havuc': 'havuç',
  'havuç': 'havuç',
  'havc': 'havuç',
  'avkado': 'avokado',
  'avakado': 'avokado',
  'avocado': 'avokado',

  // Abur Cubur / Atıştırmalık
  'cips': 'cips',
  'cipsi': 'cips',
  'cipsler': 'cips',
  'cipss': 'cips',
  'çikolata': 'çikolata',
  'cikolata': 'çikolata',
  'çikolota': 'çikolata',
  'cikotla': 'çikolata',
  'çkolata': 'çikolata',
  'cikolataa': 'çikolata',
  'bisküvi': 'bisküvi',
  'biskuvi': 'bisküvi',
  'biskivi': 'bisküvi',
  'piskevit': 'bisküvi',
  'biskuvu': 'bisküvi',
  'kraker': 'kraker',
  'krakr': 'kraker',
  'krakerr': 'kraker',
  'gofret': 'gofret',
  'gofrett': 'gofret',
  'gofert': 'gofret',
  'jelibon': 'jelibon',
  'jelbon': 'jelibon',
  'jelibonn': 'jelibon',
  'kuruyemis': 'kuruyemiş',
  'kuruyemiş': 'kuruyemiş',
  'kuru yemis': 'kuruyemiş',

  // Temizlik
  'deterjan': 'deterjan',
  'detarjan': 'deterjan',
  'detrjan': 'deterjan',
  'diterjan': 'deterjan',
  'camasirsuyu': 'çamaşır suyu',
  'camasir suyu': 'çamaşır suyu',
  'çamaşır suyu': 'çamaşır suyu',
  'camsir suyu': 'çamaşır suyu',
  'sabun': 'sabun',
  'sabn': 'sabun',
  'sabunn': 'sabun',
  'sunger': 'sünger',
  'sünger': 'sünger',
  'sngr': 'sünger',
  'sampua': 'şampuan',
  'sampuan': 'şampuan',
  'şampuan': 'şampuan',
  'yuzey temizleyici': 'yüzey temizleyici',
  'kagit havlu': 'kağıt havlu',
  'kagithavlu': 'kağıt havlu',

  // Süt & Kahvaltılık
  'süt': 'süt',
  'sut': 'süt',
  'sutt': 'süt',
  'peynir': 'peynir',
  'peynr': 'peynir',
  'peynirr': 'peynir',
  'penir': 'peynir',
  'kaşar': 'kaşar',
  'kasar': 'kaşar',
  'ksar': 'kaşar',
  'zeytin': 'zeytin',
  'zeytn': 'zeytin',
  'zeytinn': 'zeytin',
  'yumurta': 'yumurta',
  'ymurta': 'yumurta',
  'yumurt': 'yumurta',
  'bal': 'bal',
  'ball': 'bal',
  'tereyağı': 'tereyağı',
  'tereyagi': 'tereyağı',
  'tereyag': 'tereyağı',

  // Temel Gıda
  'makarna': 'makarna',
  'makarne': 'makarna',
  'makarnaa': 'makarna',
  'pirinc': 'pirinç',
  'pirinç': 'pirinç',
  'pirnc': 'pirinç',
  'zeytinyağı': 'zeytinyağı',
  'zeytinyagi': 'zeytinyağı',
  'salca': 'salça',
  'salça': 'salça',
  'un': 'un',
  'seker': 'şeker',
  'şeker': 'şeker',
  'tuz': 'tuz',
  'mercimek': 'mercimek',

  // İçecekler
  'kahve': 'kahve',
  'khve': 'kahve',
  'kahvee': 'kahve',
  'çay': 'çay',
  'cay': 'çay',
  'cy': 'çay',
  'maden suyu': 'maden suyu',
  'madensuyu': 'maden suyu',
};

// Target dictionary of canonical grocery terms
export const CANONICAL_TERMS = [
  'elma', 'armut', 'muz', 'çilek', 'portakal', 'limon', 'meyve',
  'domates', 'salatalık', 'patates', 'soğan', 'biber', 'havuç', 'avokado', 'sebze',
  'cips', 'çikolata', 'bisküvi', 'kraker', 'gofret', 'jelibon', 'kuruyemiş', 'atıştırmalık',
  'deterjan', 'çamaşır suyu', 'sabun', 'sünger', 'yüzey temizleyici', 'kağıt havlu', 'şampuan', 'temizlik',
  'süt', 'peynir', 'kaşar', 'zeytin', 'yumurta', 'bal', 'tereyağı', 'kahvaltılık',
  'makarna', 'pirinç', 'zeytinyağı', 'salça', 'un', 'şeker', 'tuz', 'mercimek',
  'kahve', 'çay', 'maden suyu',
];

/**
 * Intelligent NLP Spell Corrector & "Bunu aramak istemiştiniz" Detector
 * Combines Gensim Vector Proximity + Normalized Levenshtein + Phonetic Mapping
 */
export function detectSpellingCorrection(rawQuery: string): {
  isCorrected: boolean;
  correctedWord: string;
  originalQuery: string;
  confidence: number;
  similarTerms: Array<{ word: string; score: number }>;
} {
  const query = rawQuery.trim();
  if (!query || query.length < 2) {
    return {
      isCorrected: false,
      correctedWord: query,
      originalQuery: query,
      confidence: 1.0,
      similarTerms: [],
    };
  }

  const normalizedInput = normalizeTurkish(query);

  // 1. Direct typo dictionary check
  if (COMMON_TYPOS[normalizedInput]) {
    const target = COMMON_TYPOS[normalizedInput];
    const isDifferent = normalizeTurkish(target) !== normalizedInput;
    if (isDifferent) {
      const similar = gensimModel.most_similar(target, 4, true).map(([w, s]) => ({
        word: w,
        score: Math.round(s * 100),
      }));
      return {
        isCorrected: true,
        correctedWord: target,
        originalQuery: query,
        confidence: 0.96,
        similarTerms: similar,
      };
    }
  }

  // 2. Exact match in canonical terms?
  const exactCanonical = CANONICAL_TERMS.find(
    term => normalizeTurkish(term) === normalizedInput
  );
  if (exactCanonical) {
    const similar = gensimModel.most_similar(exactCanonical, 4, true).map(([w, s]) => ({
      word: w,
      score: Math.round(s * 100),
    }));
    return {
      isCorrected: false,
      correctedWord: exactCanonical,
      originalQuery: query,
      confidence: 1.0,
      similarTerms: similar,
    };
  }

  // 3. NLP Fuzzy + Vector Search across canonical dictionary
  let bestCandidate = '';
  let bestScore = 0;

  for (const term of CANONICAL_TERMS) {
    const normTerm = normalizeTurkish(term);
    const strSim = stringSimilarity(normalizedInput, normTerm);

    // Vector similarity if term exists in KeyedVectors
    const vecSim = gensimModel.has(normTerm)
      ? gensimModel.similarity(normalizedInput, normTerm)
      : strSim;

    // Weighted ensemble score: 65% edit/phonetic similarity + 35% semantic embedding
    const combined = strSim * 0.65 + vecSim * 0.35;

    // Bonus if input is prefix or contains
    let bonus = 0;
    if (normTerm.startsWith(normalizedInput) && normalizedInput.length >= 3) {
      bonus = 0.15;
    }

    const finalScore = Math.min(1.0, combined + bonus);

    if (finalScore > bestScore) {
      bestScore = finalScore;
      bestCandidate = term;
    }
  }

  // Threshold: if best candidate has good confidence (>= 0.62) and is not exact match
  if (
    bestScore >= 0.62 &&
    normalizeTurkish(bestCandidate) !== normalizedInput &&
    bestCandidate.length > 0
  ) {
    const similar = gensimModel.most_similar(bestCandidate, 4, true).map(([w, s]) => ({
      word: w,
      score: Math.round(s * 100),
    }));

    return {
      isCorrected: true,
      correctedWord: bestCandidate,
      originalQuery: query,
      confidence: Math.round(bestScore * 100) / 100,
      similarTerms: similar,
    };
  }

  // No correction found with high confidence
  return {
    isCorrected: false,
    correctedWord: query,
    originalQuery: query,
    confidence: 1.0,
    similarTerms: [],
  };
}
