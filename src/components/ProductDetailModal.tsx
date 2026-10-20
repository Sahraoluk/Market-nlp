import React from 'react';
import { X, Star, ShoppingBag, Plus, Minus, Cpu, Check, ShieldCheck, MapPin } from 'lucide-react';
import { Product } from '../types';
import { gensimModel } from '../nlp/gensimEngine';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  quantityInCart: number;
  onAddToCart: (product: Product) => void;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  allProducts: Product[];
  onSelectSimilarProduct: (product: Product) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  quantityInCart,
  onAddToCart,
  onUpdateQuantity,
  allProducts,
  onSelectSimilarProduct,
}) => {
  if (!product) return null;

  // Compute semantically similar products using Gensim similarity
  const primaryKeyword = product.keywords[0] || product.name.split(' ')[0].toLowerCase();
  const similarProducts = allProducts
    .filter((p) => p.id !== product.id)
    .map((p) => {
      let maxSim = 0;
      for (const k of p.keywords) {
        const sim = gensimModel.similarity(primaryKeyword, k);
        if (sim > maxSim) maxSim = sim;
      }
      return { product: p, similarity: maxSim };
    })
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, 3);

  const discountPercent = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-stone-200 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        
        {/* Header Bar */}
        <div className="relative">
          <div className="h-64 sm:h-72 w-full overflow-hidden bg-stone-100 relative">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2.5 rounded-full bg-white/90 hover:bg-white text-stone-800 shadow-md transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Floating Title on image */}
            <div className="absolute bottom-4 left-6 right-6 text-white">
              <span className="text-xs uppercase tracking-wider font-bold bg-emerald-600/90 backdrop-blur-xs px-2.5 py-1 rounded-full inline-block mb-1.5">
                {product.categoryLabel}
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold leading-tight">
                {product.name}
              </h2>
            </div>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6">
          
          {/* Price & Rating Bar */}
          <div className="flex items-center justify-between flex-wrap gap-4 pb-4 border-b border-stone-100">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-stone-900">
                  {product.price.toFixed(2)} ₺
                </span>
                {product.originalPrice && (
                  <span className="text-sm text-stone-400 line-through">
                    {product.originalPrice.toFixed(2)} ₺
                  </span>
                )}
                {discountPercent > 0 && (
                  <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
                    %{discountPercent} Fırsat
                  </span>
                )}
              </div>
              <span className="text-xs text-stone-500 font-medium">Birim: {product.unit} (KDV Dahil)</span>
            </div>

            <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200/60 px-3 py-1.5 rounded-xl">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span className="text-sm font-bold text-stone-900">{product.rating}</span>
              <span className="text-xs text-stone-500">({product.reviewCount} Değerlendirme)</span>
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-1.5">
              Ürün Açıklaması
            </h4>
            <p className="text-sm text-stone-700 leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Nutrition & Features */}
          {product.nutrition && (
            <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200/80 space-y-2.5 text-xs text-stone-700">
              <h4 className="font-bold text-stone-900 flex items-center gap-1.5 text-xs uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Kalite &amp; Besin Değerleri
              </h4>
              <div className="grid grid-cols-2 gap-2 pt-1">
                {product.nutrition.origin && (
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-stone-400" />
                    <span>Menşei: <strong>{product.nutrition.origin}</strong></span>
                  </div>
                )}
                {product.nutrition.calories && (
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>Enerji: <strong>{product.nutrition.calories}</strong></span>
                  </div>
                )}
              </div>
              {product.nutrition.features && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {product.nutrition.features.map((feat) => (
                    <span
                      key={feat}
                      className="px-2 py-0.5 bg-white border border-stone-200 rounded-md text-[11px] font-medium text-stone-700 flex items-center gap-1"
                    >
                      <Check className="w-3 h-3 text-emerald-600" />
                      {feat}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Gensim Word2Vec Semantic Relations Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-stone-600 uppercase tracking-wider flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-emerald-600" />
                Gensim NLP Semantik Eşleşen Ürünler
              </h4>
              <span className="text-[11px] text-emerald-700 font-mono">Word2Vec Proximity</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {similarProducts.map(({ product: simProd, similarity }) => (
                <div
                  key={simProd.id}
                  onClick={() => onSelectSimilarProduct(simProd)}
                  className="p-2.5 bg-stone-50 hover:bg-emerald-50/60 border border-stone-200 hover:border-emerald-300 rounded-xl transition-all cursor-pointer flex flex-col justify-between group"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <img
                      src={simProd.image}
                      alt={simProd.name}
                      className="w-10 h-10 rounded-lg object-cover bg-stone-200 shrink-0"
                    />
                    <div className="min-w-0">
                      <h5 className="text-xs font-bold text-stone-800 truncate group-hover:text-emerald-900">
                        {simProd.name}
                      </h5>
                      <span className="text-[11px] font-bold text-emerald-700">
                        {simProd.price.toFixed(2)} ₺
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-stone-500 pt-1 border-t border-stone-200/60">
                    <span>NLP Skoru:</span>
                    <span className="font-mono font-bold text-emerald-700">
                      %{Math.round(similarity * 100)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-stone-100 flex items-center justify-between gap-4">
            {quantityInCart > 0 ? (
              <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-2xl p-1.5">
                <button
                  onClick={() => onUpdateQuantity(product.id, quantityInCart - 1)}
                  className="w-8 h-8 flex items-center justify-center rounded-xl bg-white text-emerald-900 shadow-2xs hover:bg-emerald-100 cursor-pointer"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-8 text-center text-sm font-extrabold font-mono text-emerald-950">
                  {quantityInCart}
                </span>
                <button
                  onClick={() => onUpdateQuantity(product.id, quantityInCart + 1)}
                  className="w-8 h-8 flex items-center justify-center rounded-xl bg-emerald-600 text-white shadow-2xs hover:bg-emerald-700 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => onAddToCart(product)}
                className="flex-1 py-3 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Sepete Ekle ({product.price.toFixed(2)} ₺)</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="py-3 px-5 border border-stone-200 hover:bg-stone-50 text-stone-700 font-semibold rounded-2xl transition-colors cursor-pointer"
            >
              Kapat
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
