import React, { useState } from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, CheckCircle2, Sparkles, Tag } from 'lucide-react';
import confetti from 'canvas-confetti';
import { CartItem } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onClearCart: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onClearCart,
}) => {
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; discountRate: number } | null>(null);
  const [promoError, setPromoError] = useState('');
  const [isOrderPlaced, setIsOrderPlaced] = useState(false);

  if (!isOpen) return null;

  const FREE_SHIPPING_THRESHOLD = 250;
  const SHIPPING_COST = 29.90;

  const subtotal = items.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const discountAmount = appliedPromo ? subtotal * appliedPromo.discountRate : 0;
  const isFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;
  const shippingFee = items.length === 0 || isFreeShipping ? 0 : SHIPPING_COST;
  const total = Math.max(0, subtotal - discountAmount + shippingFee);

  const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const shippingProgress = Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100));

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    setPromoError('');
    const cleanCode = promoCode.trim().toUpperCase();

    if (cleanCode === 'GENSIM10') {
      setAppliedPromo({ code: 'GENSIM10', discountRate: 0.10 });
    } else if (cleanCode === 'GURME20') {
      setAppliedPromo({ code: 'GURME20', discountRate: 0.20 });
    } else {
      setPromoError('Geçersiz indirim kodu. (Deneyin: GENSIM10 veya GURME20)');
    }
  };

  const handleCheckout = () => {
    // Confetti celebration
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 },
    });
    setIsOrderPlaced(true);
  };

  const handleResetAfterOrder = () => {
    setIsOrderPlaced(false);
    onClearCart();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-stone-900/50 backdrop-blur-xs transition-opacity animate-in fade-in"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          
          {/* Header */}
          <div className="px-6 py-5 border-b border-stone-200 flex items-center justify-between bg-stone-50">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-emerald-600 text-white rounded-xl shadow-xs">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-stone-900">Alışveriş Sepetim</h2>
                <span className="text-xs text-stone-500 font-medium">
                  {items.reduce((s, i) => s + i.quantity, 0)} Ürün
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          {isOrderPlaced ? (
            <div className="flex-1 p-8 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-extrabold text-stone-900">Siparişiniz Alındı!</h3>
              <p className="text-sm text-stone-600 max-w-xs">
                Gensim NLP destekli mutfak alışverişiniz özenle hazırlanıyor. Kuryemiz en kısa sürede kapınızda olacak!
              </p>
              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 w-full text-xs text-stone-600 text-left space-y-1">
                <div className="flex justify-between">
                  <span className="text-stone-400">Sipariş No:</span>
                  <span className="font-mono font-bold text-stone-800">#GP-{Math.floor(100000 + Math.random() * 900000)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-400">Ödenen Tutar:</span>
                  <span className="font-bold text-emerald-700">{total.toFixed(2)} ₺</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-400">Tahmini Teslimat:</span>
                  <span className="font-semibold text-stone-800">25 - 35 Dakika</span>
                </div>
              </div>
              <button
                onClick={handleResetAfterOrder}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl shadow-sm transition-all cursor-pointer"
              >
                Alışverişe Devam Et
              </button>
            </div>
          ) : items.length === 0 ? (
            <div className="flex-1 p-8 flex flex-col items-center justify-center text-center space-y-3 text-stone-500">
              <div className="p-4 bg-stone-100 text-stone-400 rounded-full">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-stone-800">Sepetiniz Boş</h3>
              <p className="text-xs text-stone-400 max-w-xs">
                Taze meyveler, sebzeler, atıştırmalıklar veya temizlik ürünlerinden ekleyerek başlayın.
              </p>
              <button
                onClick={onClose}
                className="mt-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                Ürünleri Keşfet
              </button>
            </div>
          ) : (
            <>
              {/* Free Shipping Progress */}
              <div className="px-6 py-3 bg-emerald-50 border-b border-emerald-100 text-xs">
                {isFreeShipping ? (
                  <div className="flex items-center gap-2 text-emerald-800 font-bold">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    <span>Tebrikler! Ücretsiz Kargo Kazandınız.</span>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <div className="flex justify-between font-medium text-emerald-900">
                      <span>Ücretsiz Kargo için:</span>
                      <span className="font-bold">{remainingForFreeShipping.toFixed(2)} ₺ kaldı</span>
                    </div>
                    <div className="w-full bg-emerald-200/70 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-600 h-full rounded-full transition-all duration-300"
                        style={{ width: `${shippingProgress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Items List */}
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3.5">
                {items.map(({ product, quantity }) => (
                  <div
                    key={product.id}
                    className="p-3 bg-stone-50 hover:bg-stone-100/70 rounded-2xl border border-stone-200/80 flex items-center gap-3 transition-colors"
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-16 h-16 rounded-xl object-cover shrink-0 bg-stone-200"
                    />

                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs sm:text-sm font-bold text-stone-900 truncate">
                        {product.name}
                      </h4>
                      <div className="text-xs text-stone-500 flex items-center gap-1.5 mt-0.5">
                        <span>{product.unit}</span>
                        <span>&bull;</span>
                        <span className="font-bold text-stone-800">
                          {product.price.toFixed(2)} ₺
                        </span>
                      </div>

                      {/* Stepper */}
                      <div className="mt-2 flex items-center justify-between">
                        <div className="flex items-center gap-1 bg-white border border-stone-200 rounded-xl p-0.5">
                          <button
                            onClick={() => onUpdateQuantity(product.id, quantity - 1)}
                            className="w-6 h-6 flex items-center justify-center text-stone-600 hover:text-stone-950 rounded-lg hover:bg-stone-100 transition-colors cursor-pointer"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-5 text-center text-xs font-bold font-mono">
                            {quantity}
                          </span>
                          <button
                            onClick={() => onUpdateQuantity(product.id, quantity + 1)}
                            className="w-6 h-6 flex items-center justify-center text-stone-600 hover:text-stone-950 rounded-lg hover:bg-stone-100 transition-colors cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <span className="text-xs font-extrabold text-stone-900">
                          {(product.price * quantity).toFixed(2)} ₺
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => onUpdateQuantity(product.id, 0)}
                      className="p-1.5 text-stone-400 hover:text-rose-600 transition-colors cursor-pointer"
                      title="Sepetten Sil"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Promo Code & Order Summary */}
              <div className="p-6 border-t border-stone-200 bg-stone-50/80 space-y-4">
                {/* Promo Code input */}
                <form onSubmit={handleApplyPromo} className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="w-4 h-4 text-stone-400 absolute left-3 top-3 pointer-events-none" />
                    <input
                      type="text"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      placeholder="İndirim Kodu (GENSIM10)"
                      className="w-full pl-9 pr-3 py-2 text-xs uppercase font-medium bg-white border border-stone-300 rounded-xl focus:border-emerald-500 focus:outline-hidden"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    Uygula
                  </button>
                </form>

                {appliedPromo && (
                  <div className="text-xs text-emerald-800 bg-emerald-100/70 border border-emerald-200 px-3 py-1.5 rounded-lg flex items-center justify-between">
                    <span>&quot;{appliedPromo.code}&quot; kodu uygulandı (%{appliedPromo.discountRate * 100} indirim)</span>
                    <button
                      onClick={() => setAppliedPromo(null)}
                      className="text-stone-500 hover:text-stone-800 font-bold ml-2"
                    >
                      ✕
                    </button>
                  </div>
                )}
                {promoError && (
                  <p className="text-xs text-rose-600 font-medium">{promoError}</p>
                )}

                {/* Totals */}
                <div className="space-y-1.5 text-xs text-stone-600">
                  <div className="flex justify-between">
                    <span>Ara Toplam</span>
                    <span className="font-semibold text-stone-900">{subtotal.toFixed(2)} ₺</span>
                  </div>
                  {appliedPromo && (
                    <div className="flex justify-between text-emerald-700 font-medium">
                      <span>İndirim ({appliedPromo.code})</span>
                      <span>-{discountAmount.toFixed(2)} ₺</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Kurye &amp; Teslimat</span>
                    <span className="font-semibold text-stone-900">
                      {isFreeShipping ? (
                        <span className="text-emerald-700 font-bold">Ücretsiz</span>
                      ) : (
                        `${shippingFee.toFixed(2)} ₺`
                      )}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-stone-200 flex justify-between text-base font-extrabold text-stone-900">
                    <span>Toplam Tutar</span>
                    <span className="text-emerald-700">{total.toFixed(2)} ₺</span>
                  </div>
                </div>

                {/* Checkout Button */}
                <button
                  onClick={handleCheckout}
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-extrabold text-sm rounded-2xl shadow-md shadow-emerald-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Siparişi Tamamla</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
};
