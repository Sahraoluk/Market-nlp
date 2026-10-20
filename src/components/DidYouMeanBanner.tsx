import React from 'react';
import { Sparkles, ArrowRight, RotateCcw, Cpu } from 'lucide-react';
import { SearchCorrection } from '../types';

interface DidYouMeanBannerProps {
  correction: SearchCorrection | null;
  onAcceptCorrection: (word: string) => void;
  onRevertToOriginal: (word: string) => void;
  onSelectSimilar: (word: string) => void;
}

export const DidYouMeanBanner: React.FC<DidYouMeanBannerProps> = ({
  correction,
  onAcceptCorrection,
  onRevertToOriginal,
  onSelectSimilar,
}) => {
  if (!correction || !correction.isCorrected) return null;

  return (
    <div className="mb-6 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-100/60 border border-emerald-200/80 p-4 sm:p-5 shadow-sm transition-all">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="mt-0.5 p-2.5 rounded-xl bg-emerald-600 text-white shadow-md shadow-emerald-600/20 shrink-0">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold tracking-wide uppercase px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900 flex items-center gap-1">
                <Cpu className="w-3 h-3" />
                Gensim NLP Düzeltmesi
              </span>
              <span className="text-xs text-emerald-700 font-medium">
                Güven Skoru: %{Math.round(correction.confidence * 100)}
              </span>
            </div>

            <div className="mt-1.5 flex items-baseline gap-2 flex-wrap">
              <span className="text-stone-700 text-sm sm:text-base font-normal">
                Bunu aramak istemiştiniz:
              </span>
              <button
                onClick={() => onAcceptCorrection(correction.correctedWord)}
                className="group inline-flex items-center gap-1.5 text-base sm:text-lg font-bold text-emerald-800 underline decoration-2 decoration-emerald-500 underline-offset-4 hover:text-emerald-950 transition-colors cursor-pointer"
              >
                <span>&quot;{correction.correctedWord}&quot;</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1 text-emerald-600" />
              </button>
            </div>

            <p className="text-xs text-stone-500 mt-1">
              &quot;{correction.originalQuery}&quot; ifadesi Türkçe mutfak &amp; market sözlüğümüzle karşılaştırıldı ve Word2Vec vektör benzerliği ile otomatik düzeltildi.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 sm:self-center shrink-0">
          <button
            onClick={() => onRevertToOriginal(correction.originalQuery)}
            className="px-3.5 py-1.5 text-xs font-semibold text-stone-600 hover:text-stone-900 bg-white/80 hover:bg-white border border-stone-200 rounded-lg shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
            title="Orijinal kelime ile aramayı koru"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>&quot;{correction.originalQuery}&quot; ile ara</span>
          </button>

          <button
            onClick={() => onAcceptCorrection(correction.correctedWord)}
            className="px-4 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-all cursor-pointer"
          >
            Düzeltmeyi Uygula
          </button>
        </div>
      </div>

      {/* Semantic Word2Vec Related Words Chips (most_similar) */}
      {correction.similarTerms && correction.similarTerms.length > 0 && (
        <div className="mt-3.5 pt-3 border-t border-emerald-200/60 flex items-center gap-2 flex-wrap">
          <span className="text-xs text-emerald-900 font-semibold flex items-center gap-1">
            Gensim Word2Vec En Yakın Terimler:
          </span>
          {correction.similarTerms.map((term) => (
            <button
              key={term.word}
              onClick={() => onSelectSimilar(term.word)}
              className="text-xs bg-white/90 hover:bg-white text-emerald-800 hover:text-emerald-950 font-medium px-2.5 py-1 rounded-full border border-emerald-200 hover:border-emerald-400 transition-all shadow-2xs flex items-center gap-1 cursor-pointer"
            >
              <span>{term.word}</span>
              <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1 rounded">
                %{term.score}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
