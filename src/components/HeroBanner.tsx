import React from 'react';
import { Sparkles, Zap, ShieldCheck, Truck, ArrowRight, Cpu } from 'lucide-react';

interface HeroBannerProps {
  onQuickSearchTest: (term: string) => void;
  onOpenNlpLab: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  onQuickSearchTest,
  onOpenNlpLab,
}) => {
  const testTypoPills = [
    { typo: 'elmma', target: 'Elma' },
    { typo: 'domts', target: 'Domates' },
    { typo: 'detarjan', target: 'Deterjan' },
    { typo: 'cikotla', target: 'Çikolata' },
    { typo: 'cipsi', target: 'Cips' },
    { typo: 'penir', target: 'Peynir' },
  ];

  return (
    <div className="relative mb-8 rounded-3xl overflow-hidden bg-gradient-to-br from-stone-900 via-emerald-950 to-stone-900 text-white shadow-xl border border-emerald-900/40">
      
      {/* Background glow effects */}
      <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 -mb-12 w-64 h-64 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 p-6 sm:p-10 lg:p-12 max-w-4xl">
        
        {/* Top Badges */}
        <div className="flex items-center gap-2 flex-wrap mb-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold tracking-wide">
            <Cpu className="w-3.5 h-3.5 text-emerald-400" />
            <span>Gensim KeyedVectors &bull; trModel100 NLP Entegrasyonu</span>
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/10 text-stone-300 text-xs font-medium">
            <Zap className="w-3 h-3 text-amber-400" />
            <span>Statik &amp; Anlık Client-Side NLP</span>
          </span>
        </div>

        {/* Headline */}
        <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight sm:leading-none mb-3">
          Mutfak Alışverişinizde <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-200">
            Akıllı NLP Arama &amp; Düzeltme
          </span>
        </h1>

        <p className="text-sm sm:text-base text-stone-300 max-w-2xl leading-relaxed mb-6 font-normal">
          Meyve, sebze, abur cubur veya temizlik ürünlerini ararken yazım yanlışı yapsanız bile; Gensim Word2Vec semantik vektör modelimiz ne aramak istediğinizi anlar, <strong className="text-white">&quot;Bunu aramak istemiştiniz&quot;</strong> diyerek doğru ürünleri getirir.
        </p>

        {/* Interactive Try-it Typo Pills */}
        <div className="pt-2 border-t border-white/10">
          <span className="text-xs font-bold text-stone-400 uppercase tracking-wider block mb-2.5">
            Canlı NLP Yazım Düzeltmesini Deneyin (Tıklayın):
          </span>
          <div className="flex items-center gap-2 flex-wrap">
            {testTypoPills.map(({ typo, target }) => (
              <button
                key={typo}
                onClick={() => onQuickSearchTest(typo)}
                className="group px-3 py-1.5 rounded-xl bg-white/10 hover:bg-emerald-500/30 border border-white/15 hover:border-emerald-400/50 text-xs font-medium text-stone-200 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span className="line-through text-stone-400 group-hover:text-stone-300">{typo}</span>
                <span className="text-emerald-400 font-bold">→ {target}</span>
              </button>
            ))}

            <button
              onClick={onOpenNlpLab}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all flex items-center gap-1 shadow-md shadow-emerald-900/40 cursor-pointer ml-auto"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Gensim Kodunu İncele</span>
            </button>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="mt-8 pt-6 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-stone-300">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-white">Akıllı Öneri Sistemi</p>
              <p className="text-[11px] text-stone-400">Arama geçmişinize özel filtreleme</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-white">30 Dk. Hızlı Teslimat</p>
              <p className="text-[11px] text-stone-400">250 ₺ üzeri kargo ücretsiz</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-white">%100 Taze &amp; Güvenilir</p>
              <p className="text-[11px] text-stone-400">Yerli üretim &amp; organik seçenekler</p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
