import React, { useState } from 'react';
import { X, Sparkles, Terminal, Copy, Check, BarChart3, Search, Cpu, BookOpen, Layers } from 'lucide-react';
import { gensimModel } from '../nlp/gensimEngine';

interface NlpPlaygroundModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectWordToSearch?: (word: string) => void;
}

export const NlpPlaygroundModal: React.FC<NlpPlaygroundModalProps> = ({
  isOpen,
  onClose,
  onSelectWordToSearch,
}) => {
  const [activeTab, setActiveTab] = useState<'similarity' | 'most_similar' | 'python_code'>('most_similar');
  
  // Similarity State
  const [word1, setWord1] = useState('elma');
  const [word2, setWord2] = useState('armut');
  const [similarityScore, setSimilarityScore] = useState<number | null>(() => {
    return Math.round(gensimModel.similarity('elma', 'armut') * 1000) / 1000;
  });

  // Most Similar State
  const [queryWord, setQueryWord] = useState('cips');
  const [isRafine, setIsRafine] = useState(true);
  const [mostSimilarResults, setMostSimilarResults] = useState<Array<[string, number]>>(() => {
    return gensimModel.most_similar('cips', 8, true);
  });

  // Copied state
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleComputeSimilarity = () => {
    if (!word1 || !word2) return;
    const sim = gensimModel.similarity(word1, word2);
    setSimilarityScore(Math.round(sim * 1000) / 1000);
  };

  const handleComputeMostSimilar = (wordToQuery = queryWord, rafine = isRafine) => {
    if (!wordToQuery) return;
    const res = gensimModel.most_similar(wordToQuery, 8, rafine);
    setMostSimilarResults(res);
  };

  const pythonSimilarityCode = `# Similarity Example (Gensim KeyedVectors)
from gensim.models import KeyedVectors

print("Model Yükleniyor...")
# trModel100 Türkçe Word2Vec modeli yüklenir
kelimeVektoru = KeyedVectors.load_word2vec_format('trModel100', binary=True)
print(kelimeVektoru)

def benzerlikHesapla():
    anahtarKelime1 = input("İlk Anahtar Kelime: ").lower()
    anahtarKelime2 = input("İkinci Anahtar Kelime: ").lower()

    # Cosine Similarity hesaplama (-1.0 ile +1.0 arası)
    benzerlik = kelimeVektoru.similarity(anahtarKelime1, anahtarKelime2)
    print("Vektör Benzerliği:", benzerlik)
    print("----------")

benzerlikHesapla()`;

  const pythonMostSimilarRafineCode = `# Most Similar Rafine (Gensim KeyedVectors)
from gensim.models import KeyedVectors

print("Model Yükleniyor...")
kelimeVektoru = KeyedVectors.load_word2vec_format('trModel100', binary=True)
print(kelimeVektoru)

def benzerKelimeler():
    anahtarKelime = input("Anahtar Kelime: ").lower()
    print("Girilen Kelime : " + str(anahtarKelime))
    
    # En yakın komşu kelime vektörlerini getir
    oneriler = kelimeVektoru.most_similar(positive=anahtarKelime)
    print("Tüm Öneriler:", oneriler)

    # Önerileri rafine et (kök kelimeyi içerenleri filtrele)
    print("\\nRafine Edilmiş Öneriler:")
    for oneri in oneriler:
        if anahtarKelime not in oneri[0]:
            print(f"- {oneri[0]} (Benzerlik Skoru: {oneri[1]:.4f})")

benzerKelimeler()`;

  const copyToClipboard = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-stone-200 max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-stone-200 flex items-center justify-between bg-stone-900 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold flex items-center gap-2 text-white">
                Gensim Word2Vec &amp; NLP Laboratuvarı
                <span className="text-xs bg-emerald-500/30 text-emerald-300 font-mono px-2 py-0.5 rounded-full border border-emerald-400/30">
                  trModel100
                </span>
              </h2>
              <p className="text-xs text-stone-300">
                Gensim KeyedVectors dil modeli ve Türkçe market semantik analizi
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-white hover:bg-stone-800 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-stone-200 bg-stone-50 px-6 pt-2 gap-2 text-sm font-medium">
          <button
            onClick={() => setActiveTab('most_similar')}
            className={`py-3 px-4 border-b-2 font-semibold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'most_similar'
                ? 'border-emerald-600 text-emerald-700 bg-white rounded-t-lg'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <Search className="w-4 h-4" />
            <span>most_similar() [En Yakın Terimler]</span>
          </button>

          <button
            onClick={() => setActiveTab('similarity')}
            className={`py-3 px-4 border-b-2 font-semibold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'similarity'
                ? 'border-emerald-600 text-emerald-700 bg-white rounded-t-lg'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>similarity(w1, w2) [Kosinüs Benzerliği]</span>
          </button>

          <button
            onClick={() => setActiveTab('python_code')}
            className={`py-3 px-4 border-b-2 font-semibold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'python_code'
                ? 'border-emerald-600 text-emerald-700 bg-white rounded-t-lg'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span>Python Gensim Kodları</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* TAB 1: MOST SIMILAR */}
          {activeTab === 'most_similar' && (
            <div className="space-y-6">
              <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 text-xs text-stone-700 space-y-1.5">
                <p className="font-semibold text-emerald-900 flex items-center gap-1.5 text-sm">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  Gensim KeyedVectors.most_similar(positive=...) Mantığı
                </p>
                <p>
                  Kullanıcının girdiği kelime, 100 boyutlu Word2Vec vektör uzayında konumlandırılır.
                  En yüksek kosinüs benzerliğine sahip komşu kelimeler sıralanarak 
                  <strong className="text-emerald-950 font-semibold"> &quot;Bunu aramak istemiştiniz&quot;</strong> öneri motoruna ve akıllı ürün filtrelerine beslenir.
                </p>
              </div>

              {/* Input Area */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block">
                  Sorgulanacak Market Kelimesi:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={queryWord}
                    onChange={(e) => setQueryWord(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleComputeMostSimilar()}
                    placeholder="Örn: cips, elma, deterjan, kahvaltılık..."
                    className="flex-1 px-4 py-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-medium text-stone-800 text-sm"
                  />
                  <button
                    onClick={() => handleComputeMostSimilar()}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer"
                  >
                    <Search className="w-4 h-4" />
                    <span>Analiz Et</span>
                  </button>
                </div>

                {/* Quick Samples */}
                <div className="flex items-center gap-2 flex-wrap text-xs">
                  <span className="text-stone-500">Hızlı Test:</span>
                  {['cips', 'elma', 'deterjan', 'peynir', 'makarna', 'kahve'].map((sample) => (
                    <button
                      key={sample}
                      onClick={() => {
                        setQueryWord(sample);
                        handleComputeMostSimilar(sample);
                      }}
                      className="px-2.5 py-1 bg-stone-100 hover:bg-emerald-100 hover:text-emerald-900 text-stone-700 rounded-lg border border-stone-200 transition-colors cursor-pointer"
                    >
                      {sample}
                    </button>
                  ))}
                </div>

                {/* Rafine Toggle */}
                <div className="pt-2 flex items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-medium text-stone-700">
                    <input
                      type="checkbox"
                      checked={isRafine}
                      onChange={(e) => {
                        setIsRafine(e.target.checked);
                        handleComputeMostSimilar(queryWord, e.target.checked);
                      }}
                      className="w-4 h-4 text-emerald-600 rounded-sm border-stone-300 focus:ring-emerald-500"
                    />
                    <span>
                      <strong className="text-emerald-800">_mostSimilarRafine.py</strong> kuralını uygula (kelimenin kendisini içeren alt kelimeleri filtrele)
                    </span>
                  </label>
                </div>
              </div>

              {/* Results List */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wider flex items-center justify-between">
                  <span>Vektör Komşuluğu Sonuçları (Cosine Similarity)</span>
                  <span className="text-stone-500 font-normal lowercase">{mostSimilarResults.length} eşleşme</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {mostSimilarResults.map(([word, score], index) => {
                    const percentage = Math.round(score * 100);
                    return (
                      <div
                        key={word}
                        className="p-3 bg-stone-50 border border-stone-200 hover:border-emerald-300 rounded-xl transition-all group flex flex-col justify-between"
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-sm font-bold text-stone-800 flex items-center gap-1.5">
                            <span className="text-xs text-stone-400 font-mono">#{index + 1}</span>
                            {word}
                          </span>
                          <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full">
                            %{percentage}
                          </span>
                        </div>

                        {/* Visual Progress Bar */}
                        <div className="w-full bg-stone-200 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>

                        {onSelectWordToSearch && (
                          <button
                            onClick={() => {
                              onSelectWordToSearch(word);
                              onClose();
                            }}
                            className="mt-2 text-[11px] text-emerald-700 hover:text-emerald-950 font-semibold self-end transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <span>Bu kelimeyle mağazada ara</span>
                            <span>→</span>
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SIMILARITY CALCULATOR */}
          {activeTab === 'similarity' && (
            <div className="space-y-6">
              <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 text-xs text-stone-700 space-y-1">
                <p className="font-semibold text-stone-900 text-sm flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-emerald-600" />
                  kelimeVektoru.similarity(kelime1, kelime2)
                </p>
                <p>
                  Gensim&apos;in Word2Vec modelindeki iki kelime vektörü arasındaki açının kosinüsünü (Cosine Similarity) hesaplar.
                  1.0 değeri özdeş semantik bağlamı, 0.0 değeri tamamen alakasız anlam kümelerini ifade eder.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-stone-700 uppercase">1. Anahtar Kelime</label>
                  <input
                    type="text"
                    value={word1}
                    onChange={(e) => setWord1(e.target.value)}
                    className="w-full px-4 py-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-medium text-stone-800 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-stone-700 uppercase">2. Anahtar Kelime</label>
                  <input
                    type="text"
                    value={word2}
                    onChange={(e) => setWord2(e.target.value)}
                    className="w-full px-4 py-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-medium text-stone-800 text-sm"
                  />
                </div>
              </div>

              <div className="flex justify-center">
                <button
                  onClick={handleComputeSimilarity}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer"
                >
                  <BarChart3 className="w-4 h-4" />
                  <span>Kosinüs Benzerliğini Hesapla</span>
                </button>
              </div>

              {similarityScore !== null && (
                <div className="p-6 bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl text-center space-y-3">
                  <span className="text-xs font-semibold text-emerald-800 uppercase tracking-widest">
                    Word2Vec Vektör Benzerliği
                  </span>
                  <div className="text-4xl font-extrabold text-emerald-950 font-mono">
                    {similarityScore.toFixed(3)}
                    <span className="text-lg font-sans font-medium text-emerald-700 ml-2">
                      (%{Math.round(similarityScore * 100)})
                    </span>
                  </div>

                  <p className="text-xs text-stone-600 max-w-md mx-auto">
                    {similarityScore > 0.75
                      ? `"${word1}" ve "${word2}" aynı mutfak/market kategorisinde çok yüksek anlamsal yakınlığa sahip.`
                      : similarityScore > 0.40
                      ? `"${word1}" ve "${word2}" orta düzeyde ilişkili (aynı öğün veya dolaylı bağlantı).`
                      : `"${word1}" ve "${word2}" farklı market reyonlarına ait, aralarında anlamsal bağ bulunmuyor.`}
                  </p>
                </div>
              )}

              {/* Sample pairs */}
              <div className="space-y-2">
                <span className="text-xs text-stone-500 font-medium">Örnek Karşılaştırmalar:</span>
                <div className="flex gap-2 flex-wrap">
                  {[
                    ['elma', 'armut'],
                    ['cips', 'çikolata'],
                    ['deterjan', 'çamaşır suyu'],
                    ['peynir', 'zeytin'],
                    ['elma', 'deterjan'],
                  ].map(([w1, w2]) => (
                    <button
                      key={`${w1}-${w2}`}
                      onClick={() => {
                        setWord1(w1);
                        setWord2(w2);
                        const sim = gensimModel.similarity(w1, w2);
                        setSimilarityScore(Math.round(sim * 1000) / 1000);
                      }}
                      className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                    >
                      {w1} ↔ {w2}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PYTHON GENSIM CODES */}
          {activeTab === 'python_code' && (
            <div className="space-y-6">
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900 space-y-1">
                <p className="font-semibold text-sm flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-amber-700" />
                  Gönderdiğiniz Gensim Python Paketleri
                </p>
                <p>
                  Aşağıdaki Python kodları, projeye eklediğiniz <code className="font-mono bg-amber-100 px-1 py-0.5 rounded">similarity.py</code> ve <code className="font-mono bg-amber-100 px-1 py-0.5 rounded">_mostSimilarRafine.py</code> dosyalarının birebir kaynak kodudur.
                  Sistemimiz bu Python gensim mantığını web tarayıcısında gerçek zamanlı çalışacak şekilde entegre etmiştir.
                </p>
              </div>

              {/* Code Box 1 */}
              <div className="rounded-2xl border border-stone-800 bg-stone-950 overflow-hidden shadow-lg">
                <div className="px-4 py-2.5 bg-stone-900 border-b border-stone-800 flex items-center justify-between text-xs text-stone-300">
                  <span className="font-mono flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                    similarity.py
                  </span>
                  <button
                    onClick={() => copyToClipboard(pythonSimilarityCode, 'code1')}
                    className="flex items-center gap-1 text-stone-400 hover:text-white transition-colors cursor-pointer"
                  >
                    {copiedCode === 'code1' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Kopyalandı</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Kopyala</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="p-4 text-xs font-mono text-emerald-300 overflow-x-auto leading-relaxed">
                  <code>{pythonSimilarityCode}</code>
                </pre>
              </div>

              {/* Code Box 2 */}
              <div className="rounded-2xl border border-stone-800 bg-stone-950 overflow-hidden shadow-lg">
                <div className="px-4 py-2.5 bg-stone-900 border-b border-stone-800 flex items-center justify-between text-xs text-stone-300">
                  <span className="font-mono flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                    _mostSimilarRafine.py
                  </span>
                  <button
                    onClick={() => copyToClipboard(pythonMostSimilarRafineCode, 'code2')}
                    className="flex items-center gap-1 text-stone-400 hover:text-white transition-colors cursor-pointer"
                  >
                    {copiedCode === 'code2' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Kopyalandı</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Kopyala</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="p-4 text-xs font-mono text-emerald-300 overflow-x-auto leading-relaxed">
                  <code>{pythonMostSimilarRafineCode}</code>
                </pre>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-stone-200 bg-stone-50 flex items-center justify-between text-xs text-stone-500">
          <span>Gensim KeyedVectors Word2Vec API &bull; Türkçe NLP</span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-stone-900 hover:bg-stone-800 text-white font-semibold rounded-xl transition-all cursor-pointer"
          >
            Tamam
          </button>
        </div>

      </div>
    </div>
  );
};
