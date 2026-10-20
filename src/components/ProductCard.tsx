import React from 'react';
import { Star, Plus, Minus, ShoppingBag, Eye, Sparkles } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  quantityInCart: number;
  onAddToCart: (product: Product) => void;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onOpenDetail: (product: Product) => void;
  highlightReason?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  quantityInCart,
  onAddToCart,
  onUpdateQuantity,
  onOpenDetail,
  highlightReason,
}) => {
  const discountPercent = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div className="group relative bg-white rounded-3xl border border-stone-200/80 hover:border-emerald-300 shadow-2xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden">
      
      {/* Top Media & Badges */}
      <div className="relative aspect-4/3 overflow-hidden bg-stone-100 cursor-pointer" onClick={() => onOpenDetail(product)}>
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-106 transition-transform duration-500"
          loading="lazy"
        />

        {/* Badges container */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 items-start">
          {discountPercent > 0 && (
            <span className="px-2.5 py-1 text-[11px] font-extrabold tracking-wide text-white bg-rose-600 rounded-full shadow-sm">
              %{discountPercent} İNDİRİM
            </span>
          )}
          {product.badges?.map((badge) => (
            <span
              key={badge}
              className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full shadow-2xs ${
                badge.includes('Organik')
                  ? 'bg-emerald-600 text-white'
                  : badge.includes('Yerli')
                  ? 'bg-blue-600 text-white'
                  : 'bg-stone-900/80 text-white backdrop-blur-xs'
              }`}
            >
              {badge}
            </span>
          ))}
        </div>

        {/* Quick View Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onOpenDetail(product);
          }}
          className="absolute top-2.5 right-2.5 p-2 rounded-full bg-white/90 hover:bg-white text-stone-700 hover:text-stone-900 shadow-md opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer"
          title="Ürün Detayları & Semantik Analiz"
        >
          <Eye className="w-4 h-4" />
        </button>
      </div>

      {/* Card Body */}
      <div className="p-4 flex flex-col flex-1 justify-between">
        <div>
          {/* Highlight Reason (if personalized) */}
          {highlightReason && (
            <div className="mb-2 inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-md">
              <Sparkles className="w-3 h-3 text-emerald-600 shrink-0" />
              <span className="truncate">{highlightReason}</span>
            </div>
          )}

          {/* Category & Rating */}
          <div className="flex items-center justify-between text-xs text-stone-500 mb-1">
            <span className="font-semibold text-emerald-700 tracking-wide uppercase text-[10px]">
              {product.categoryLabel}
            </span>
            <div className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span className="font-bold text-stone-800">{product.rating}</span>
              <span className="text-[10px] text-stone-400">({product.reviewCount})</span>
            </div>
          </div>

          {/* Product Title */}
          <h3
            onClick={() => onOpenDetail(product)}
            className="font-bold text-stone-900 text-sm sm:text-base leading-snug line-clamp-2 hover:text-emerald-700 transition-colors cursor-pointer"
          >
            {product.name}
          </h3>

          {/* Unit / Weight */}
          <span className="text-xs text-stone-500 mt-0.5 block">
            Birim: {product.unit}
          </span>
        </div>

        {/* Price & Cart Actions */}
        <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between">
          <div className="flex flex-col">
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-xs text-stone-400 line-through font-medium">
                {product.originalPrice.toFixed(2)} ₺
              </span>
            )}
            <div className="flex items-baseline gap-1">
              <span className="text-lg sm:text-xl font-extrabold text-stone-900">
                {product.price.toFixed(2)}
              </span>
              <span className="text-xs font-bold text-stone-700">₺</span>
            </div>
          </div>

          {/* Quantity Stepper or Add to Cart Button */}
          {quantityInCart > 0 ? (
            <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 rounded-2xl p-1">
              <button
                onClick={() => onUpdateQuantity(product.id, quantityInCart - 1)}
                className="w-7 h-7 flex items-center justify-center rounded-xl bg-white hover:bg-emerald-100 text-emerald-800 shadow-2xs transition-colors cursor-pointer"
                title="Azalt"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="w-6 text-center text-xs font-extrabold text-emerald-950 font-mono">
                {quantityInCart}
              </span>
              <button
                onClick={() => onUpdateQuantity(product.id, quantityInCart + 1)}
                className="w-7 h-7 flex items-center justify-center rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs transition-colors cursor-pointer"
                title="Arttır"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => onAddToCart(product)}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs sm:text-sm font-bold rounded-2xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Sepete Ekle</span>
            </button>
          )}
        </div>
      </div>

    </div>
  );
};
