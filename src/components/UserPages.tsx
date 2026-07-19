import React, { useState, useEffect } from 'react';
import {
  Sparkles, Gift, Truck, RotateCcw, ShieldCheck, Star, ChevronRight,
  ShoppingBag, Trash2, Plus, Minus, CheckCircle2, User, Phone, MapPin, Mail,
  Send, Compass, HelpCircle, ShieldAlert, Heart, Calendar, Percent, CreditCard,
  Eye, Edit, ToggleLeft, Lock, Info, Share2, Map, Users, Settings, Tag, ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Product, CartItem, Order } from '../types';
import { formatPersianPrice, formatPersianNumber } from './ProductCard';
import { PROVINCES } from '../data';
import HandmadesView from './HandmadesView';

// Definition of additional type helpers
export interface Coupon {
  code: string;
  type: 'percent' | 'amount';
  value: number;
  expiryDate: string;
  usageLimit: number;
  usageCount: number;
}

interface UserPagesProps {
  products: Product[];
  cart: CartItem[];
  orders: Order[];
  activeCategory: string | null;
  setActiveCategory: (cat: string | null) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onAddToCart: (product: Product, variant: string) => void;
  onUpdateQuantity: (productId: string, variant: string, change: number) => void;
  onRemoveItem: (productId: string, variant: string) => void;
  onProceedToPayment: (customerData: any) => void;
  userView: 'home' | 'catalog' | 'categories' | 'product' | 'cart' | 'checkout' | 'account' | 'about' | 'contact' | 'terms' | 'handmades';
  setUserView: (view: any) => void;
  selectedProduct: Product | null;
  setSelectedProduct: (p: Product | null) => void;
  
  // Custom CMS texts from Settings
  aboutText: string;
  termsText: string;
  contactText: string;
  
  // Settings values
  currencyUnit: 'تومان' | 'ریال';
  shippingCostSetting: number;
  taxPercent: number;

  // Profile data
  profile: {
    name: string;
    phone: string;
    email: string;
    address: string;
    postalCode: string;
  };
  onUpdateProfile: (p: any) => void;

  // Active coupons list
  coupons: Coupon[];
  currentUser?: any;
  onAuthRequired?: (target: 'account' | 'handmades') => void;
}

export default function UserPages({
  products,
  cart,
  orders,
  activeCategory,
  setActiveCategory,
  searchTerm,
  setSearchTerm,
  onAddToCart,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToPayment,
  userView,
  setUserView,
  selectedProduct,
  setSelectedProduct,
  aboutText,
  termsText,
  contactText,
  currencyUnit,
  shippingCostSetting,
  taxPercent,
  profile,
  onUpdateProfile,
  coupons,
  currentUser,
  onAuthRequired,
}: UserPagesProps) {
  
  // Local state helper
  const [selectedVariant, setSelectedVariant] = useState('');
  const [reviewName, setReviewName] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [customReviews, setCustomReviews] = useState<Record<string, Array<{name: string, rating: number, comment: string, date: string}>>>({});
  
  // Contact state
  const [contactForm, setContactForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [contactSuccess, setContactSuccess] = useState(false);

  // Profile edit state
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({ ...profile });

  // Coupon applied state
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState('');

  // Checkout Form State (Full screen Cart/Checkout option)
  const [checkoutName, setCheckoutName] = useState(profile.name || '');
  const [checkoutPhone, setCheckoutPhone] = useState(profile.phone || '');
  const [checkoutProvince, setCheckoutProvince] = useState('');
  const [checkoutCity, setCheckoutCity] = useState('');
  const [checkoutPostalCode, setCheckoutPostalCode] = useState(profile.postalCode || '');
  const [checkoutAddress, setCheckoutAddress] = useState(profile.address || '');
  const [checkoutShippingMethod, setCheckoutShippingMethod] = useState<'express' | 'post'>('post');
  const [checkoutError, setCheckoutError] = useState('');

  const availableCities = PROVINCES.find((p) => p.name === checkoutProvince)?.cities || [];

  useEffect(() => {
    if (selectedProduct) {
      setSelectedVariant(selectedProduct.variants[0] || 'طلایی');
    }
  }, [selectedProduct]);

  // Sync profile edits
  useEffect(() => {
    setProfileForm({ ...profile });
    setCheckoutName(profile.name);
    setCheckoutPhone(profile.phone);
    setCheckoutPostalCode(profile.postalCode);
    setCheckoutAddress(profile.address);
  }, [profile]);

  // Catalog filters state
  const [catalogSort, setCatalogSort] = useState<'latest' | 'price-asc' | 'price-desc' | 'rating'>('latest');
  const [catalogStockOnly, setCatalogStockOnly] = useState(false);
  const [catalogPriceRange, setCatalogPriceRange] = useState<number>(3000000);

  // Filter & sort product logic
  const filteredProducts = products.filter((p) => {
    const matchesCategory = activeCategory === null || p.category === activeCategory;
    const matchesSearch =
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStock = !catalogStockOnly || p.stock > 0;
    const matchesPrice = p.price <= catalogPriceRange;
    return matchesCategory && matchesSearch && matchesStock && matchesPrice;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (catalogSort === 'price-asc') return a.price - b.price;
    if (catalogSort === 'price-desc') return b.price - a.price;
    if (catalogSort === 'rating') return b.rating - a.rating;
    return 1; // latest/default unchanged
  });

  // Calculate cart metrics
  const cartSubtotal = cart.reduce((sum, item) => {
    const hasDiscount = item.product.discount && item.product.discount > 0;
    const finalPrice = hasDiscount
      ? item.product.price * (1 - (item.product.discount || 0) / 100)
      : item.product.price;
    return sum + finalPrice * item.quantity;
  }, 0);

  // Apply Coupon Discount Calculation
  let discountAmount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.type === 'percent') {
      discountAmount = (cartSubtotal * appliedCoupon.value) / 100;
    } else {
      discountAmount = appliedCoupon.value;
    }
  }

  const shippingCost = cartSubtotal >= 500000 || cartSubtotal === 0 ? 0 : shippingCostSetting;
  const taxAmount = (cartSubtotal - discountAmount) * (taxPercent / 100);
  const cartTotal = Math.max(cartSubtotal - discountAmount + shippingCost + taxAmount, 0);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError('');
    const matched = coupons.find(c => c.code.toLowerCase() === couponInput.trim().toLowerCase());
    if (!matched) {
      setCouponError('کد تخفیف وارد شده معتبر نمی‌باشد.');
      setAppliedCoupon(null);
      return;
    }
    
    // Check expiry
    const exp = new Date(matched.expiryDate);
    if (exp < new Date()) {
      setCouponError('مهلت استفاده از این کد تخفیف به پایان رسیده است.');
      setAppliedCoupon(null);
      return;
    }

    if (matched.usageCount >= matched.usageLimit) {
      setCouponError('سقف استفاده از این کد تخفیف تکمیل شده است.');
      setAppliedCoupon(null);
      return;
    }

    setAppliedCoupon(matched);
    setCouponInput('');
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
  };

  const submitContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.message) return;
    setContactSuccess(true);
    setTimeout(() => {
      setContactSuccess(false);
      setContactForm({ name: '', email: '', subject: '', message: '' });
    }, 4000);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile(profileForm);
    setEditingProfile(false);
  };

  const handleAddReview = (e: React.FormEvent, prodId: string) => {
    e.preventDefault();
    if (!reviewName || !reviewComment) return;
    const newRev = {
      name: reviewName,
      rating: reviewRating,
      comment: reviewComment,
      date: new Intl.DateTimeFormat('fa-IR', { dateStyle: 'short' }).format(new Date())
    };
    const current = customReviews[prodId] || [];
    setCustomReviews({
      ...customReviews,
      [prodId]: [...current, newRev]
    });
    setReviewName('');
    setReviewComment('');
    setReviewRating(5);
  };

  const handleProductClick = (p: Product) => {
    setSelectedProduct(p);
    setUserView('product');
  };

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCheckoutError('');

    if (!checkoutName || !checkoutPhone || !checkoutProvince || !checkoutCity || !checkoutPostalCode || !checkoutAddress) {
      setCheckoutError('لطفاً تمامی فیلدهای الزامی ستاره‌دار آدرس گیرنده را پر فرمایید.');
      return;
    }

    if (checkoutPhone.length < 11 || !/^09[0-9]{9}$/.test(checkoutPhone)) {
      setCheckoutError('لطفاً شماره موبایل معتبر ۱۱ رقمی ایرانی (مثلاً ۰۹۱۲۳۴۵۶۷۸۹) وارد کنید.');
      return;
    }

    if (checkoutPostalCode.length < 10) {
      setCheckoutError('کد پستی باید ۱۰ رقمی باشد.');
      return;
    }

    // Call checkout trigger from App
    onProceedToPayment({
      name: checkoutName,
      phone: checkoutPhone,
      province: checkoutProvince,
      city: checkoutCity,
      postalCode: checkoutPostalCode,
      address: checkoutAddress,
      shippingMethod: checkoutShippingMethod,
      appliedCouponCode: appliedCoupon?.code || undefined,
      discountValue: discountAmount
    });
  };

  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen" dir="rtl">
      
      {/* SECONDARY NAVIGATION HEADER FOR FRONTPAGE */}
      <div className="bg-slate-900/60 border-b border-slate-800 sticky top-20 z-30 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 overflow-x-auto scrollbar-none py-3">
          <div className="flex items-center gap-2 md:gap-4 text-xs font-semibold whitespace-nowrap">
            <button
              onClick={() => setUserView('home')}
              className={`px-3 py-1.5 rounded-lg transition-all ${userView === 'home' ? 'bg-gold-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-gold-300'}`}
              id="view-tab-home"
            >
              صفحه اصلی
            </button>
            <button
              onClick={() => setUserView('catalog')}
              className={`px-3 py-1.5 rounded-lg transition-all ${userView === 'catalog' ? 'bg-gold-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-gold-300'}`}
              id="view-tab-catalog"
            >
              کاتالوگ و لیست محصولات
            </button>
            <button
              onClick={() => setUserView('categories')}
              className={`px-3 py-1.5 rounded-lg transition-all ${userView === 'categories' ? 'bg-gold-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-gold-300'}`}
              id="view-tab-categories"
            >
              دسته‌بندی‌ها
            </button>
            <button
              onClick={() => setUserView('cart')}
              className={`relative px-3 py-1.5 rounded-lg transition-all ${userView === 'cart' || userView === 'checkout' ? 'bg-gold-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-gold-300'}`}
              id="view-tab-cart"
            >
              سبد خرید
              {cart.length > 0 && (
                <span className="mr-1.5 bg-rose-500 text-white rounded-full px-1.5 py-0.5 text-[9px] font-bold">
                  {cart.reduce((sum, i) => sum + i.quantity, 0)}
                </span>
              )}
            </button>
            <button
              onClick={() => setUserView('account')}
              className={`px-3 py-1.5 rounded-lg transition-all ${userView === 'account' ? 'bg-gold-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-gold-300'}`}
              id="view-tab-account"
            >
              حساب کاربری و سفارش‌ها
            </button>
            <span className="text-slate-800">|</span>
            <button
              onClick={() => setUserView('about')}
              className={`px-3 py-1.5 rounded-lg transition-all ${userView === 'about' ? 'bg-gold-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-gold-300'}`}
              id="view-tab-about"
            >
              درباره ما
            </button>
            <button
              onClick={() => setUserView('contact')}
              className={`px-3 py-1.5 rounded-lg transition-all ${userView === 'contact' ? 'bg-gold-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-gold-300'}`}
              id="view-tab-contact"
            >
              تماس با ما
            </button>
            <button
              onClick={() => setUserView('terms')}
              className={`px-3 py-1.5 rounded-lg transition-all ${userView === 'terms' ? 'bg-gold-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-gold-300'}`}
              id="view-tab-terms"
            >
              قوانین و شرایط مرجوعی
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        
        {/* =============== VIEW 1: HOME =============== */}
        {userView === 'home' && (
          <motion.div
            key="home-screen"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="pb-16"
          >
            {/* Elegant luxury intro banner block */}
            <div className="relative h-[65vh] w-full flex items-center overflow-hidden border-b border-slate-900">
              <div className="absolute inset-0 z-0 bg-slate-950">
                <img
                  src="/src/assets/images/jewelry_hero_banner_1784386410125.jpg"
                  alt="Aventurin Gallery"
                  className="h-full w-full object-cover opacity-25 scale-105"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-slate-950/70 via-transparent to-slate-950/70" />
              </div>

              <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full text-right">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-gold-500/10 border border-gold-400/30 px-3 py-1 text-[10px] text-gold-300 font-bold mb-4">
                  <Sparkles size={12} className="animate-pulse" />
                  <span>کلکسیون جدید زیورآلات طلایی آبکاری شده ۱۴۰۵</span>
                </div>
                <h2 className="text-3xl sm:text-5xl font-black text-slate-100 leading-tight">
                  زیبایی اصیل در <br />
                  <span className="text-gradient bg-gradient-to-l from-gold-300 via-gold-400 to-gold-200 bg-clip-text text-transparent">
                    جزییات درخشان گالری آونتورین
                  </span>
                </h2>
                <p className="mt-4 text-slate-400 text-xs sm:text-sm max-w-md font-light leading-relaxed">
                  طراحی لوکس، رنگ ثابت تضمینی و ضدحساسیت برآمده از بهترین مرواریدها و نگین‌های طبیعی کوبیک زیرکونیا.
                </p>
                <div className="mt-6 flex flex-wrap gap-3 justify-start">
                  <button
                    onClick={() => setUserView('catalog')}
                    className="rounded-xl bg-gold-500 hover:bg-gold-400 text-slate-950 font-extrabold px-6 py-3 text-xs transition-all shadow-lg shadow-gold-500/10"
                  >
                    مشاهده کاتالوگ فروشگاه
                  </button>
                  <button
                    onClick={() => setUserView('about')}
                    className="rounded-xl border border-slate-700 hover:border-gold-400 text-slate-300 px-5 py-3 text-xs transition-all"
                  >
                    داستان برند ما
                  </button>
                </div>
              </div>
            </div>

            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 space-y-16">
              
              {/* Category Showcase Ribbon */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-black text-slate-100">جستجوی هوشمند دسته‌بندی‌ها</h3>
                    <p className="text-[10px] text-slate-500">اکسسوری‌های مورد پسند خود را تفکیک‌شده بیابید</p>
                  </div>
                  <button onClick={() => setUserView('categories')} className="text-xs text-gold-400 hover:underline">مشاهده همه</button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { id: 'necklace', name: 'گردنبندها', desc: 'ظریف و نگین‌دار', count: products.filter(p => p.category === 'necklace').length },
                    { id: 'ring', name: 'انگشترها', desc: 'لوکس و مارکیز', count: products.filter(p => p.category === 'ring').length },
                    { id: 'earrings', name: 'گوشواره‌ها', desc: 'مرواریدی و حلقه‌ای', count: products.filter(p => p.category === 'earrings').length },
                    { id: 'bracelet', name: 'دستبندها', desc: 'کارتیر و زنجیری', count: products.filter(p => p.category === 'bracelet').length }
                  ].map((cat) => (
                    <div
                      key={cat.id}
                      onClick={() => { setActiveCategory(cat.id); setUserView('catalog'); }}
                      className="cursor-pointer bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-gold-500/40 transition-all hover:scale-[1.02] text-center space-y-2 group"
                    >
                      <span className="text-gold-400 font-bold block text-sm group-hover:text-gold-300">{cat.name}</span>
                      <span className="text-[10px] text-slate-500 block">{cat.desc}</span>
                      <span className="text-[9px] text-slate-400 font-bold font-en-nums block bg-slate-950 py-1 px-2.5 rounded-full inline-block">
                        {formatPersianNumber(cat.count)} کالا
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Featured products ribbon */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-black text-slate-100">⭐ کارهای ویژه و برگزیده گالری</h3>
                    <p className="text-[10px] text-slate-500">محبوب‌ترین و ظریف‌ترین کارهای گالری آونتورین</p>
                  </div>
                  <button onClick={() => { setActiveCategory(null); setUserView('catalog'); }} className="text-xs text-gold-400 hover:underline">مشاهده همه</button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                  {products.slice(0, 4).map((p) => (
                    <div
                      key={p.id}
                      onClick={() => handleProductClick(p)}
                      className="cursor-pointer bg-slate-900 border border-slate-850 rounded-2xl overflow-hidden hover:border-gold-500/20 transition-all flex flex-col justify-between group"
                    >
                      <div className="relative aspect-square overflow-hidden bg-slate-950">
                        <img src={p.image} alt={p.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" referrerPolicy="no-referrer" />
                        {p.discount && p.discount > 0 && (
                          <span className="absolute top-2 right-2 rounded-lg bg-rose-500 px-2 py-0.5 text-[10px] font-bold text-white shadow">
                            {formatPersianNumber(p.discount)}٪ تخفیف
                          </span>
                        )}
                      </div>
                      <div className="p-4 space-y-2 text-right">
                        <h4 className="text-xs font-bold text-slate-200 truncate">{p.title}</h4>
                        <div className="flex justify-between items-center">
                          <span className="text-gold-400 font-extrabold text-xs font-en-nums">{formatPersianPrice(p.price)}</span>
                          <span className="text-[9px] text-slate-500 bg-slate-950 px-2 py-0.5 rounded">موجود: {formatPersianNumber(p.stock)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Best sellers & New Arrivals tabs combo */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Best sellers */}
                <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 space-y-4">
                  <h3 className="text-sm font-extrabold text-gold-400 flex items-center gap-1">
                    <Sparkles size={14} />
                    پرفروش‌ترین کارهای فصل
                  </h3>
                  <div className="divide-y divide-slate-800">
                    {products.slice(1, 4).map(p => (
                      <div key={p.id} onClick={() => handleProductClick(p)} className="cursor-pointer flex items-center gap-4 py-3 hover:bg-slate-950/20 px-2 rounded-xl transition-all">
                        <img src={p.image} className="h-12 w-12 rounded-lg object-cover bg-slate-950" referrerPolicy="no-referrer" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-200 truncate">{p.title}</p>
                          <span className="text-[9px] text-slate-500">امتیاز {formatPersianNumber(p.rating)} از ۵</span>
                        </div>
                        <span className="text-xs font-black text-slate-100 font-en-nums">{formatPersianPrice(p.price)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* New arrivals */}
                <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 space-y-4">
                  <h3 className="text-sm font-extrabold text-gold-400 flex items-center gap-1">
                    <Gift size={14} />
                    جدیدترین زیورآلات اضافه شده
                  </h3>
                  <div className="divide-y divide-slate-800">
                    {products.slice(4, 7).map(p => (
                      <div key={p.id} onClick={() => handleProductClick(p)} className="cursor-pointer flex items-center gap-4 py-3 hover:bg-slate-950/20 px-2 rounded-xl transition-all">
                        <img src={p.image} className="h-12 w-12 rounded-lg object-cover bg-slate-950" referrerPolicy="no-referrer" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-200 truncate">{p.title}</p>
                          <span className="text-[9px] text-emerald-400">انبار آماده ارسال</span>
                        </div>
                        <span className="text-xs font-black text-slate-100 font-en-nums">{formatPersianPrice(p.price)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          </motion.div>
        )}

        {/* =============== VIEW 2: CATALOG (SHOP) =============== */}
        {userView === 'catalog' && (
          <motion.div
            key="catalog-screen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8"
          >
            {/* Filter and Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              
              {/* Filter Sidebar Left (Catalog) */}
              <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 h-fit space-y-6">
                <div>
                  <h3 className="text-sm font-black text-slate-100 pb-3 border-b border-slate-800">فیلترهای پیشرفته اکسسوری</h3>
                </div>

                {/* Categories filtering selection */}
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-slate-400 block">دسته‌بندی اکسسوری</span>
                  <div className="space-y-1">
                    {[
                      { id: null, name: 'همه محصولات' },
                      { id: 'necklace', name: 'گردنبندها' },
                      { id: 'ring', name: 'انگشترها' },
                      { id: 'earrings', name: 'گوشواره‌ها' },
                      { id: 'bracelet', name: 'دستبندها' }
                    ].map(cat => (
                      <button
                        key={cat.id || 'all'}
                        onClick={() => setActiveCategory(cat.id as any)}
                        className={`w-full text-right text-xs py-2 px-3 rounded-lg transition-all ${
                          activeCategory === cat.id ? 'bg-gold-500/10 text-gold-400 font-bold border border-gold-500/20' : 'text-slate-400 hover:bg-slate-950/40 hover:text-slate-200'
                        }`}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Range Slider */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-[11px] text-slate-400">
                    <span>حداکثر قیمت کالا</span>
                    <span className="font-bold font-en-nums text-gold-400">{formatPersianPrice(catalogPriceRange)}</span>
                  </div>
                  <input
                    type="range"
                    min={200000}
                    max={3000000}
                    step={50000}
                    value={catalogPriceRange}
                    onChange={(e) => setCatalogPriceRange(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-gold-500"
                  />
                  <div className="flex justify-between text-[9px] text-slate-500 font-en-nums">
                    <span>۲۰۰,۰۰۰ تومان</span>
                    <span>۳,۰۰۰,۰۰۰ تومان</span>
                  </div>
                </div>

                {/* Stock Toggle */}
                <div className="flex items-center justify-between py-2 border-t border-b border-slate-800">
                  <span className="text-xs text-slate-400">فقط کالاهای موجود در انبار</span>
                  <button
                    onClick={() => setCatalogStockOnly(!catalogStockOnly)}
                    className={`h-5 w-10 rounded-full p-0.5 transition-colors ${catalogStockOnly ? 'bg-gold-500' : 'bg-slate-950'}`}
                  >
                    <div className={`h-4 w-4 rounded-full bg-slate-100 transition-transform ${catalogStockOnly ? '-translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </div>

                {/* Sorting Select */}
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-slate-400 block">مرتب‌سازی بر اساس</span>
                  <select
                    value={catalogSort}
                    onChange={(e: any) => setCatalogSort(e.target.value)}
                    className="w-full bg-slate-950 text-slate-300 border border-slate-800 rounded-xl px-3 py-2 text-xs outline-none focus:border-gold-500"
                  >
                    <option value="latest">جدیدترین‌ها</option>
                    <option value="price-asc">ارزان‌ترین‌ها</option>
                    <option value="price-desc">گران‌ترین‌ها</option>
                    <option value="rating">محبوب‌ترین‌ها</option>
                  </select>
                </div>

                {/* Reset button */}
                <button
                  onClick={() => {
                    setActiveCategory(null);
                    setSearchTerm('');
                    setCatalogSort('latest');
                    setCatalogStockOnly(false);
                    setCatalogPriceRange(3000000);
                  }}
                  className="w-full py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-[11px] font-bold text-slate-400 hover:text-gold-400 transition-all cursor-pointer"
                >
                  پاک کردن همه فیلترها
                </button>
              </div>

              {/* Main Products Listing Grid Right (Catalog) */}
              <div className="lg:col-span-3 space-y-6">
                
                {/* Search Bar & Result counts */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900 p-4 rounded-2xl border border-slate-800">
                  <div className="relative w-full sm:max-w-xs">
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="نام یا ویژگی کالا را جستجو کنید..."
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-xs text-slate-100 outline-none focus:border-gold-500"
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 font-semibold font-en-nums">
                    یافت شده: {formatPersianNumber(sortedProducts.length)} محصول زینتی
                  </span>
                </div>

                {sortedProducts.length === 0 ? (
                  <div className="text-center py-20 bg-slate-900 rounded-3xl border border-slate-800 space-y-3">
                    <HelpCircle size={40} className="text-slate-600 mx-auto" />
                    <h4 className="text-sm font-bold text-slate-300">هیچ محصولی با شرایط بالا پیدا نشد</h4>
                    <p className="text-xs text-slate-500">فیلترهای کاتالوگ را تغییر داده یا مجدد تلاش کنید.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {sortedProducts.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => handleProductClick(p)}
                        className="bg-slate-900 border border-slate-850 rounded-2xl overflow-hidden hover:border-gold-500/20 transition-all flex flex-col justify-between group cursor-pointer"
                      >
                        <div className="relative aspect-square overflow-hidden bg-slate-950">
                          <img src={p.image} alt={p.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" referrerPolicy="no-referrer" />
                          {p.discount && p.discount > 0 && (
                            <span className="absolute top-2.5 right-2.5 rounded-lg bg-rose-500 px-2 py-0.5 text-[10px] font-bold text-white shadow">
                              {formatPersianNumber(p.discount)}٪ تخفیف
                            </span>
                          )}
                        </div>
                        <div className="p-4 space-y-3">
                          <h4 className="text-xs font-bold text-slate-100 truncate">{p.title}</h4>
                          <p className="text-[10px] text-slate-500 line-clamp-2 leading-relaxed">{p.description}</p>
                          <div className="flex justify-between items-center pt-2 border-t border-slate-850">
                            <span className="text-gold-400 font-extrabold text-xs font-en-nums">{formatPersianPrice(p.price)}</span>
                            <span className="text-[9px] text-emerald-400 font-semibold">موجود در انبار</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </motion.div>
        )}

        {/* =============== VIEW 3: CATEGORIES =============== */}
        {userView === 'categories' && (
          <motion.div
            key="categories-screen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mx-auto max-w-4xl px-4 py-12 space-y-8"
          >
            <div className="text-center space-y-2">
              <h3 className="text-xl font-black text-slate-100">تفکیک دسته‌بندی زیورآلات</h3>
              <p className="text-xs text-slate-500">مجموعه نفیس اکسسوری و تزئینات زنانه گالری آونتورین</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[
                { id: 'necklace', name: 'گردنبندها (Necklaces)', desc: 'انواع مدال طلا، زنجیر چند ردیف کارتیر و مروارید طبیعی آویز شده', icon: <Sparkles className="text-gold-400" size={24} /> },
                { id: 'ring', name: 'انگشترها (Rings)', desc: 'رینگ‌های کلاسیک ظریف و تک‌نگین‌های زمرد و یاقوت طبیعی شناسنامه‌دار', icon: <Compass className="text-gold-400" size={24} /> },
                { id: 'earrings', name: 'گوشواره‌ها (Earrings)', desc: 'آویزهای مجلسی پرکار مروارید آب شیرین و حلقه‌ای‌های اسپرت تراش الماسی', icon: <Gift className="text-gold-400" size={24} /> },
                { id: 'bracelet', name: 'دستبندها (Bracelets)', desc: 'رولکس، کارتیر کلاسیک و طرح‌های ظریف مینیمال استیل جراحی آبکاری طلا', icon: <Truck className="text-gold-400" size={24} /> }
              ].map(cat => (
                <div
                  key={cat.id}
                  onClick={() => { setActiveCategory(cat.id as any); setUserView('catalog'); }}
                  className="cursor-pointer bg-slate-900 border border-slate-800 rounded-3xl p-6 hover:border-gold-500/40 transition-all flex items-start gap-4 group"
                >
                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl group-hover:bg-gold-500/10 transition-colors">
                    {cat.icon}
                  </div>
                  <div className="space-y-2 text-right">
                    <h4 className="text-sm font-black text-slate-100 group-hover:text-gold-300 transition-colors">{cat.name}</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">{cat.desc}</p>
                    <span className="text-[10px] text-gold-400 font-bold block">مشاهده این دسته‌بندی ←</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* =============== VIEW 4: PRODUCT PAGE =============== */}
        {userView === 'product' && selectedProduct && (
          <motion.div
            key="product-screen"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="mx-auto max-w-5xl px-4 py-8 space-y-8"
          >
            {/* Back Button */}
            <button
              onClick={() => setUserView('catalog')}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-gold-300 transition-all cursor-pointer"
            >
              <ChevronRight size={16} />
              <span>بازگشت به لیست محصولات</span>
            </button>

            {/* Product visual grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-800">
              
              {/* Product Large image panel */}
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-slate-950 border border-slate-800">
                <img src={selectedProduct.image} alt={selectedProduct.title} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                {selectedProduct.discount && selectedProduct.discount > 0 && (
                  <span className="absolute top-4 right-4 rounded-xl bg-rose-500 px-3 py-1 text-xs font-black text-white shadow-lg shadow-rose-500/10">
                    {formatPersianNumber(selectedProduct.discount)}٪ تخفیف ویژه
                  </span>
                )}
              </div>

              {/* Product Info details */}
              <div className="flex flex-col justify-between space-y-6 text-right">
                <div className="space-y-4">
                  
                  {/* Category, Rating, Stock status */}
                  <div className="flex items-center justify-between text-xs border-b border-slate-800 pb-3">
                    <span className="text-gold-400 font-extrabold bg-slate-950 px-3 py-1 rounded-full">
                      {selectedProduct.category === 'necklace' ? 'گردنبند' :
                       selectedProduct.category === 'ring' ? 'انگشتر' :
                       selectedProduct.category === 'earrings' ? 'گوشواره' : 'دستبند'}
                    </span>
                    <div className="flex items-center gap-1 text-amber-500 font-bold font-en-nums">
                      <Star size={14} className="fill-amber-500" />
                      <span>{formatPersianNumber(selectedProduct.rating)}</span>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl sm:text-2xl font-black text-slate-100 leading-snug">
                    {selectedProduct.title}
                  </h3>

                  {/* Pricing */}
                  <div className="flex items-center gap-3">
                    {selectedProduct.discount && selectedProduct.discount > 0 ? (
                      <>
                        <span className="text-slate-500 line-through text-xs font-en-nums">
                          {formatPersianPrice(selectedProduct.price)}
                        </span>
                        <span className="text-xl font-black text-gold-400 font-en-nums">
                          {formatPersianPrice(
                            selectedProduct.price * (1 - (selectedProduct.discount || 0) / 100)
                          )}
                        </span>
                      </>
                    ) : (
                      <span className="text-xl font-black text-gold-400 font-en-nums">
                        {formatPersianPrice(selectedProduct.price)}
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-400 leading-relaxed text-justify">
                    {selectedProduct.description}
                  </p>

                  {/* Specs & variants */}
                  <div className="space-y-3">
                    <span className="block text-xs font-extrabold text-slate-300">طرح آبکاری کالا:</span>
                    <div className="flex flex-wrap gap-2">
                      {selectedProduct.variants.map((v) => (
                        <button
                          key={v}
                          onClick={() => setSelectedVariant(v)}
                          className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                            selectedVariant === v
                              ? 'bg-gold-500 text-slate-950 font-bold'
                              : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-slate-200'
                          }`}
                        >
                          {v}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="text-xs pt-2">
                    {selectedProduct.stock === 0 ? (
                      <span className="text-rose-500 font-bold flex items-center gap-1">
                        <ShieldAlert size={14} />
                        متأسفانه این گزینه در حال حاضر اتمام موجودی است
                      </span>
                    ) : (
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle2 size={14} />
                        آماده تحویل (موجود در انبار، تعداد باقی‌مانده: {formatPersianNumber(selectedProduct.stock)})
                      </span>
                    )}
                  </div>

                </div>

                {/* Add to Cart submit */}
                <div className="pt-6 border-t border-slate-800 flex gap-3">
                  {selectedProduct.stock > 0 ? (
                    <button
                      onClick={() => onAddToCart(selectedProduct, selectedVariant)}
                      className="flex-1 rounded-xl bg-gold-500 hover:bg-gold-400 text-slate-950 font-extrabold py-3.5 text-sm transition-all shadow-lg shadow-gold-500/10 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <ShoppingBag size={16} />
                      <span>افزودن به سبد خرید</span>
                    </button>
                  ) : (
                    <button
                      disabled
                      className="flex-1 rounded-xl bg-slate-950 text-slate-500 font-bold py-3.5 text-xs cursor-not-allowed border border-slate-850"
                    >
                      موجودی این اکسسوری تمام شده است
                    </button>
                  )}
                </div>

              </div>
            </div>

            {/* User reviews tab section inside Product Page */}
            <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 space-y-6">
              <h4 className="text-sm font-black text-slate-100 flex items-center gap-1 border-b border-slate-800 pb-3">
                <Star size={15} className="fill-amber-500 text-amber-500" />
                دیدگاه‌ها و نظرات خریداران این کالا ({formatPersianNumber((customReviews[selectedProduct.id] || []).length + 3)})
              </h4>

              {/* Add feedback reviews form */}
              <form onSubmit={(e) => handleAddReview(e, selectedProduct.id)} className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-950 p-4 rounded-2xl border border-slate-850">
                <div className="sm:col-span-2 space-y-3 text-right">
                  <span className="text-[11px] font-bold text-slate-300 block">ارسال نظر جدید شما</span>
                  <input
                    type="text"
                    required
                    placeholder="نام و نام خانوادگی خود را بنویسید"
                    value={reviewName}
                    onChange={(e) => setReviewName(e.target.value)}
                    className="w-full rounded-xl bg-slate-900 border border-slate-800 px-3 py-2 text-xs text-slate-100 outline-none"
                  />
                  <textarea
                    required
                    rows={2}
                    placeholder="تجربه خود از خرید یا کیفیت محصول را با دیگران به اشتراک بگذارید..."
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    className="w-full rounded-xl bg-slate-900 border border-slate-800 px-3 py-2 text-xs text-slate-100 outline-none resize-none"
                  />
                </div>
                <div className="flex flex-col justify-between text-right space-y-3">
                  <div className="space-y-1.5">
                    <span className="text-[10px] text-slate-400 block">امتیاز شما به کالا</span>
                    <div className="flex gap-1 text-amber-500">
                      {[1, 2, 3, 4, 5].map((r) => (
                        <Star
                          key={r}
                          size={15}
                          className={`cursor-pointer ${reviewRating >= r ? 'fill-amber-500' : 'text-slate-600'}`}
                          onClick={() => setReviewRating(r)}
                        />
                      ))}
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="rounded-xl bg-slate-900 hover:bg-slate-800 text-gold-400 border border-slate-800 font-bold py-2 text-xs transition-all cursor-pointer"
                  >
                    ثبت دیدگاه من
                  </button>
                </div>
              </form>

              {/* Review Feed list */}
              <div className="space-y-4">
                {/* Simulated default feedback reviews */}
                <div className="p-4 bg-slate-950/40 rounded-2xl space-y-2 text-right">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="font-extrabold text-slate-300">بهاره صادقی</span>
                    <span className="text-slate-500 font-en-nums">۱۴۰۵/۰۴/۱۲</span>
                  </div>
                  <div className="flex text-amber-500 gap-0.5"><Star size={10} className="fill-amber-500" /><Star size={10} className="fill-amber-500" /><Star size={10} className="fill-amber-500" /><Star size={10} className="fill-amber-500" /><Star size={10} className="fill-amber-500" /></div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">فوق‌العاده زیباست! آبکاری طلا زردش اونقدر درخشان و طبیعیه که شبیه طلای عیار بالا به چشم میاد. حساسیت ایجاد نکرد و جعبه همراهش هم عالیه.</p>
                </div>

                <div className="p-4 bg-slate-950/40 rounded-2xl space-y-2 text-right">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="font-extrabold text-slate-300">مریم احمدی</span>
                    <span className="text-slate-500 font-en-nums">۱۴۰۵/۰۳/۲۵</span>
                  </div>
                  <div className="flex text-amber-500 gap-0.5"><Star size={10} className="fill-amber-500" /><Star size={10} className="fill-amber-500" /><Star size={10} className="fill-amber-500" /><Star size={10} className="fill-amber-500" /><Star size={10} className="fill-amber-500" /></div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">بسیار شیک و مینیاتوری. دوام رنگش هم تا به امروز که یک ماهه مداوم دستم هست کاملاً ثابته و مثل روز اول درخشش داره.</p>
                </div>

                {/* Newly submitted reviews */}
                {(customReviews[selectedProduct.id] || []).map((rev, idx) => (
                  <div key={idx} className="p-4 bg-slate-950 border border-slate-850 rounded-2xl space-y-2 text-right">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="font-extrabold text-slate-300">{rev.name}</span>
                      <span className="text-slate-500 font-en-nums">{rev.date}</span>
                    </div>
                    <div className="flex text-amber-500 gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} size={10} className={rev.rating > i ? 'fill-amber-500' : 'text-slate-600'} />
                      ))}
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">{rev.comment}</p>
                  </div>
                ))}
              </div>

            </div>

            {/* Similar Products Section */}
            {(() => {
              const similarProducts = products
                .filter((p) => p.category === selectedProduct.category && p.id !== selectedProduct.id)
                .slice(0, 4);

              if (similarProducts.length === 0) return null;

              return (
                <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 space-y-6">
                  <h4 className="text-sm font-black text-slate-100 flex items-center gap-1 border-b border-slate-800 pb-3">
                    <Sparkles size={15} className="text-gold-400" />
                    محصولات مشابه
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                    {similarProducts.map((p) => {
                      const hasDiscount = p.discount && p.discount > 0;
                      const discountedPrice = hasDiscount
                        ? p.price * (1 - (p.discount || 0) / 100)
                        : p.price;
                      return (
                        <div
                          key={p.id}
                          onClick={() => {
                            setSelectedProduct(p);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className="cursor-pointer bg-slate-950 border border-slate-850 rounded-2xl overflow-hidden hover:border-gold-500/20 transition-all flex flex-col justify-between group"
                        >
                          <div className="relative aspect-square overflow-hidden bg-slate-900">
                            <img
                              src={p.image}
                              alt={p.title}
                              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                              referrerPolicy="no-referrer"
                            />
                            {hasDiscount && (
                              <span className="absolute top-2 right-2 rounded-lg bg-rose-500 px-2 py-0.5 text-[10px] font-bold text-white shadow">
                                {formatPersianNumber(p.discount || 0)}٪ تخفیف
                              </span>
                            )}
                          </div>
                          <div className="p-4 space-y-2 text-right">
                            <h4 className="text-xs font-bold text-slate-200 truncate group-hover:text-gold-400 transition-colors duration-200">{p.title}</h4>
                            <div className="flex justify-between items-center">
                              <span className="text-gold-400 font-extrabold text-xs font-en-nums">
                                {formatPersianPrice(discountedPrice)}
                              </span>
                              <span className="text-[9px] text-slate-500 bg-slate-900 px-2 py-0.5 rounded">
                                موجود: {formatPersianNumber(p.stock)}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

          </motion.div>
        )}

        {/* =============== VIEW 5: CART SUMMARY =============== */}
        {userView === 'cart' && (
          <motion.div
            key="cart-screen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mx-auto max-w-4xl px-4 py-8 space-y-8"
          >
            <div className="text-center space-y-1">
              <h3 className="text-xl font-black text-slate-100 flex items-center justify-center gap-1.5">
                <ShoppingBag size={20} className="text-gold-400" />
                سبد خرید شما
              </h3>
              <p className="text-xs text-slate-500">زیورآلات انتخابی خود را مدیریت یا ویرایش فرمایید</p>
            </div>

            {cart.length === 0 ? (
              <div className="text-center py-20 bg-slate-900 border border-slate-800 rounded-3xl space-y-4">
                <ShoppingBag size={48} className="text-slate-700 mx-auto" />
                <h4 className="text-sm font-bold text-slate-300">سبد خرید شما خالی است</h4>
                <p className="text-xs text-slate-500">با بازدید از کاتالوگ فروشگاه می‌توانید محصولات مورد علاقه خود را انتخاب کنید.</p>
                <button
                  onClick={() => setUserView('catalog')}
                  className="rounded-xl bg-gold-500 hover:bg-gold-400 text-slate-950 font-extrabold px-6 py-2.5 text-xs transition-all cursor-pointer"
                >
                  بازدید از گالری
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Cart list items */}
                <div className="lg:col-span-2 space-y-4">
                  {cart.map((item) => {
                    const priceWithDiscount = item.product.discount && item.product.discount > 0
                      ? item.product.price * (1 - (item.product.discount || 0) / 100)
                      : item.product.price;
                    return (
                      <div
                        key={`${item.product.id}-${item.selectedVariant}`}
                        className="bg-slate-900 rounded-2xl p-4 border border-slate-800 flex gap-4 items-center"
                      >
                        <img src={item.product.image} className="h-16 w-16 rounded-xl object-cover bg-slate-950 shrink-0" referrerPolicy="no-referrer" />
                        
                        <div className="flex-1 min-w-0 text-right space-y-1">
                          <h4 className="text-xs font-bold text-slate-100 truncate">{item.product.title}</h4>
                          <span className="inline-block text-[9px] bg-slate-950 px-2 py-0.5 rounded text-slate-400">طرح: {item.selectedVariant}</span>
                          <div className="text-xs font-black text-gold-400 font-en-nums">{formatPersianPrice(priceWithDiscount)}</div>
                        </div>

                        {/* Quantity management */}
                        <div className="flex items-center gap-2 bg-slate-950 border border-slate-850 rounded-xl p-1 shrink-0">
                          <button
                            onClick={() => onUpdateQuantity(item.product.id, item.selectedVariant, 1)}
                            className="p-1 hover:text-gold-400 transition-colors cursor-pointer"
                          >
                            <Plus size={14} />
                          </button>
                          <span className="text-xs font-bold px-2 font-en-nums text-slate-200">{formatPersianNumber(item.quantity)}</span>
                          <button
                            onClick={() => onUpdateQuantity(item.product.id, item.selectedVariant, -1)}
                            className="p-1 hover:text-rose-400 transition-colors cursor-pointer"
                          >
                            <Minus size={14} />
                          </button>
                        </div>

                        {/* Remove button */}
                        <button
                          onClick={() => onRemoveItem(item.product.id, item.selectedVariant)}
                          className="text-slate-500 hover:text-rose-500 transition-colors p-1.5 shrink-0 cursor-pointer"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    );
                  })}

                  {/* Free shipping banner */}
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-right text-xs">
                    {cartSubtotal >= 500000 ? (
                      <span className="text-emerald-400 font-bold">🎉 شگفت‌انگیز! خرید شما واجد شرایط ارسال رایگان در سراسر کشور می‌باشد.</span>
                    ) : (
                      <span className="text-slate-400">خرید شما {formatPersianPrice(500000 - cartSubtotal)} با ارسال رایگان پستی فاصله دارد.</span>
                    )}
                  </div>
                </div>

                {/* Cart summary and billing */}
                <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 h-fit space-y-6">
                  <h4 className="text-sm font-black text-slate-100 pb-3 border-b border-slate-800 text-right">خلاصه پیش‌فاکتور</h4>

                  {/* Coupon section */}
                  <form onSubmit={handleApplyCoupon} className="space-y-2">
                    <span className="text-[10px] text-slate-400 block text-right">کد تخفیف دارید؟</span>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="کد تخفیف را وارد کنید"
                        value={couponInput}
                        onChange={(e) => { setCouponError(''); setCouponInput(e.target.value); }}
                        className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-slate-100 outline-none"
                      />
                      <button
                        type="submit"
                        className="rounded-xl bg-gold-500 text-slate-950 font-bold px-4 py-2 text-xs hover:bg-gold-400 transition-all cursor-pointer"
                      >
                        اعمال
                      </button>
                    </div>
                    {couponError && <p className="text-[10px] text-rose-500 text-right">{couponError}</p>}
                    {appliedCoupon && (
                      <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-2 text-xs text-emerald-400">
                        <span className="font-bold font-en-nums">تخفیف کد ({appliedCoupon.code}): {appliedCoupon.type === 'percent' ? `${formatPersianNumber(appliedCoupon.value)}٪` : formatPersianPrice(appliedCoupon.value)}</span>
                        <button type="button" onClick={handleRemoveCoupon} className="text-rose-400 hover:text-rose-500">حذف</button>
                      </div>
                    )}
                  </form>

                  {/* Financials details */}
                  <div className="text-xs space-y-3 pt-3 border-t border-slate-800 text-right">
                    <div className="flex justify-between text-slate-400">
                      <span>جمع اقلام سبد:</span>
                      <span className="font-bold text-slate-200 font-en-nums">{formatPersianPrice(cartSubtotal)}</span>
                    </div>
                    {appliedCoupon && (
                      <div className="flex justify-between text-emerald-400">
                        <span>کسر تخفیف کد:</span>
                        <span className="font-bold font-en-nums">-{formatPersianPrice(discountAmount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-slate-400">
                      <span>هزینه بسته‌بندی و ارسال:</span>
                      <span className="font-bold text-slate-200 font-en-nums">
                        {shippingCost === 0 ? 'ارسال رایگان' : formatPersianPrice(shippingCost)}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>مالیات بر ارزش افزوده ({formatPersianNumber(taxPercent)}٪):</span>
                      <span className="font-bold text-slate-200 font-en-nums">{formatPersianPrice(taxAmount)}</span>
                    </div>
                    <div className="flex justify-between border-t border-slate-800 pt-3 text-sm font-black text-gold-400">
                      <span>مبلغ قابل پرداخت نهایی:</span>
                      <span className="font-en-nums">{formatPersianPrice(cartTotal)}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setUserView('checkout')}
                    className="w-full rounded-xl bg-gold-500 hover:bg-gold-400 text-slate-950 font-extrabold py-3.5 text-xs transition-all shadow-lg shadow-gold-500/10 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>تکمیل و ثبت نهایی اطلاعات گیرنده</span>
                    <ArrowRight size={14} />
                  </button>
                </div>

              </div>
            )}
          </motion.div>
        )}

        {/* =============== VIEW 6: CHECKOUT =============== */}
        {userView === 'checkout' && (
          <motion.div
            key="checkout-screen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mx-auto max-w-4xl px-4 py-8 space-y-8"
          >
            <div className="text-center space-y-1">
              <h3 className="text-xl font-black text-slate-100">ثبت آدرس و تسویه حساب</h3>
              <p className="text-xs text-slate-500">اطلاعات ارسال مرسوله پستی خود را به دقت بررسی نمایید</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Form address entry block Left */}
              <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 text-right">
                <h4 className="text-xs font-extrabold text-gold-400 border-b border-slate-800 pb-3 mb-5">مشخصات گیرنده و مقصد</h4>
                
                {checkoutError && (
                  <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-3.5 text-xs text-rose-400 mb-4 flex items-center gap-2">
                    <ShieldAlert size={14} className="shrink-0" />
                    <span>{checkoutError}</span>
                  </div>
                )}

                <form onSubmit={handleCheckoutSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1.5">نام و نام خانوادگی گیرنده *</label>
                      <input
                        type="text"
                        required
                        value={checkoutName}
                        onChange={(e) => { setCheckoutError(''); setCheckoutName(e.target.value); }}
                        placeholder="مثال: مریم صادقی"
                        className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2.5 text-xs text-slate-100 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1.5">شماره موبایل تماس *</label>
                      <input
                        type="text"
                        required
                        value={checkoutPhone}
                        onChange={(e) => { setCheckoutError(''); setCheckoutPhone(e.target.value); }}
                        placeholder="مثال: 09123456789"
                        className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2.5 text-xs text-slate-100 outline-none text-left"
                        dir="ltr"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1.5">استان مقصد *</label>
                      <select
                        required
                        value={checkoutProvince}
                        onChange={(e) => { setCheckoutError(''); setCheckoutProvince(e.target.value); setCheckoutCity(''); }}
                        className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2.5 text-xs text-slate-350 outline-none"
                      >
                        <option value="">انتخاب استان</option>
                        {PROVINCES.map((p) => (
                          <option key={p.name} value={p.name}>{p.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1.5">شهر مقصد *</label>
                      <select
                        required
                        disabled={!checkoutProvince}
                        value={checkoutCity}
                        onChange={(e) => { setCheckoutError(''); setCheckoutCity(e.target.value); }}
                        className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2.5 text-xs text-slate-350 outline-none disabled:opacity-40"
                      >
                        <option value="">انتخاب شهر</option>
                        {availableCities.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5">کد پستی ۱۰ رقمی *</label>
                    <input
                      type="text"
                      required
                      maxLength={10}
                      value={checkoutPostalCode}
                      onChange={(e) => { setCheckoutError(''); setCheckoutPostalCode(e.target.value.replace(/\D/g, '')); }}
                      placeholder="مثال: ۱۲۳۴۵۶۷۸۹۰"
                      className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2.5 text-xs text-slate-100 outline-none text-left"
                      dir="ltr"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5">آدرس پستی دقیق محل دریافت کالا *</label>
                    <textarea
                      required
                      rows={3}
                      value={checkoutAddress}
                      onChange={(e) => { setCheckoutError(''); setCheckoutAddress(e.target.value); }}
                      placeholder="خیابان، کوچه، پلاک، واحد و جزئیات تکمیلی..."
                      className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2.5 text-xs text-slate-100 outline-none resize-none"
                    />
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-800">
                    <span className="text-xs font-extrabold text-slate-300 block">روش حمل و ارسال سفارش:</span>
                    <div className="grid grid-cols-2 gap-4">
                      <div
                        onClick={() => setCheckoutShippingMethod('post')}
                        className={`cursor-pointer rounded-2xl p-4 text-right border transition-all ${
                          checkoutShippingMethod === 'post' ? 'border-gold-500 bg-gold-500/5' : 'border-slate-800 bg-slate-950'
                        }`}
                      >
                        <span className="text-xs font-bold block text-slate-200">📬 پست پیشتاز کشوری</span>
                        <span className="text-[10px] text-slate-500 block mt-1">تحویل ۲ الی ۴ روزه (هزینه طبق تعرفه مصوب)</span>
                      </div>
                      <div
                        onClick={() => setCheckoutShippingMethod('express')}
                        className={`cursor-pointer rounded-2xl p-4 text-right border transition-all ${
                          checkoutShippingMethod === 'express' ? 'border-gold-500 bg-gold-500/5' : 'border-slate-800 bg-slate-950'
                        }`}
                      >
                        <span className="text-xs font-bold block text-slate-200">🚀 پیک موتوری اکسپرس (ویژه محلات)</span>
                        <span className="text-[10px] text-slate-500 block mt-1">تحویل کمتر از ۳ ساعت هماهنگ شده</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 flex gap-3 border-t border-slate-800">
                    <button
                      type="submit"
                      className="flex-1 rounded-xl bg-gold-500 hover:bg-gold-400 text-slate-950 font-extrabold py-3.5 text-xs transition-colors shadow-lg shadow-gold-500/10 flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Lock size={14} />
                      <span>اتصال امن به درگاه و پرداخت فاکتور</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setUserView('cart')}
                      className="rounded-xl border border-slate-800 text-slate-400 px-4 py-3 text-xs hover:text-slate-200 cursor-pointer"
                    >
                      ویرایش سبد خرید
                    </button>
                  </div>
                </form>
              </div>

              {/* Mini Cart invoice review Right */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 h-fit text-right space-y-4">
                <h4 className="text-xs font-extrabold text-slate-100 border-b border-slate-800 pb-2">اقلام سفارش شما</h4>
                <div className="max-h-[250px] overflow-y-auto space-y-3 pr-1">
                  {cart.map((item) => (
                    <div key={`${item.product.id}-${item.selectedVariant}`} className="flex items-center gap-3 border-b border-slate-850 pb-2.5 last:border-0 last:pb-0">
                      <img src={item.product.image} className="h-10 w-10 rounded-lg object-cover bg-slate-950" referrerPolicy="no-referrer" />
                      <div className="flex-1 min-w-0 text-xs">
                        <span className="font-bold text-slate-200 truncate block">{item.product.title}</span>
                        <span className="text-[9px] text-slate-500 block font-en-nums">{formatPersianNumber(item.quantity)} عدد - طرح: {item.selectedVariant}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-slate-800 pt-3 space-y-2.5 text-xs">
                  <div className="flex justify-between text-slate-500">
                    <span>مجموع کالاها:</span>
                    <span className="font-bold text-slate-300 font-en-nums">{formatPersianPrice(cartSubtotal)}</span>
                  </div>
                  {appliedCoupon && (
                    <div className="flex justify-between text-emerald-400">
                      <span>تخفیف کد ({appliedCoupon.code}):</span>
                      <span className="font-bold font-en-nums">-{formatPersianPrice(discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-500">
                    <span>هزینه حمل و نقل:</span>
                    <span className="font-bold text-slate-300 font-en-nums">
                      {shippingCost === 0 ? 'ارسال رایگان' : formatPersianPrice(shippingCost)}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>مالیات بر ارزش افزوده ({formatPersianNumber(taxPercent)}٪):</span>
                    <span className="font-bold text-slate-300 font-en-nums">{formatPersianPrice(taxAmount)}</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-800 pt-3 font-black text-sm text-gold-400">
                    <span>فاکتور نهایی پرداخت:</span>
                    <span className="font-en-nums">{formatPersianPrice(cartTotal)}</span>
                  </div>
                </div>
              </div>

            </div>
          </motion.div>
        )}

        {/* =============== VIEW 7: USER ACCOUNT & ORDERS =============== */}
        {userView === 'account' && (
          <motion.div
            key="account-screen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mx-auto max-w-4xl px-4 py-8 space-y-8"
          >
            <div className="text-center space-y-1">
              <h3 className="text-xl font-black text-slate-100 flex items-center justify-center gap-1.5">
                <User size={20} className="text-gold-400" />
                حساب کاربری و سوابق خرید
              </h3>
              <p className="text-xs text-slate-500">ویرایش پروفایل شخصی و رهگیری لحظه‌ای کدهای سفارش و مرسولات</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              {/* Profile card left column */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 h-fit text-right space-y-5">
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-full bg-gold-500/10 border border-gold-400/20 text-gold-400 flex items-center justify-center">
                    <User size={20} />
                  </div>
                  <div>
                    <span className="text-xs font-black text-slate-100 block">{profile.name || 'کاربر گرامی'}</span>
                    <span className="text-[10px] text-slate-500 block font-en-nums">{profile.phone || 'فاقد شماره'}</span>
                  </div>
                </div>

                {editingProfile ? (
                  <form onSubmit={handleSaveProfile} className="space-y-3.5 border-t border-slate-800 pt-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1">نام و نام خانوادگی</label>
                      <input
                        type="text"
                        required
                        value={profileForm.name}
                        onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                        className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-slate-100 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1">شماره موبایل</label>
                      <input
                        type="text"
                        required
                        value={profileForm.phone}
                        onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                        className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-slate-100 outline-none text-left"
                        dir="ltr"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1">آدرس پیش‌فرض</label>
                      <textarea
                        rows={2}
                        value={profileForm.address}
                        onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                        className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-slate-100 outline-none resize-none"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button type="submit" className="flex-1 rounded-lg bg-gold-500 text-slate-950 font-bold py-1.5 text-xs transition-colors cursor-pointer">ذخیره</button>
                      <button type="button" onClick={() => setEditingProfile(false)} className="rounded-lg border border-slate-800 text-slate-400 px-3 py-1.5 text-xs cursor-pointer">لغو</button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-3 border-t border-slate-800 pt-4 text-xs text-right">
                    <div className="flex justify-between">
                      <span className="text-slate-500">پست الکترونیکی:</span>
                      <span className="text-slate-300">{profile.email || 'ثبت نشده'}</span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-slate-500 block">آدرس ارسال پیش‌فرض:</span>
                      <p className="text-slate-400 leading-relaxed text-justify">{profile.address || 'آدرسی ثبت نشده است'}</p>
                    </div>
                    <button
                      onClick={() => setEditingProfile(true)}
                      className="w-full rounded-xl bg-slate-950 border border-slate-800 text-[10px] font-bold py-2.5 text-gold-400 hover:text-gold-300 transition-all cursor-pointer"
                    >
                      ویرایش اطلاعات کاربری
                    </button>
                  </div>
                )}
              </div>

              {/* Order history tracking column Right (double size) */}
              <div className="md:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 text-right space-y-4">
                <h4 className="text-xs font-extrabold text-gold-400 border-b border-slate-800 pb-3 mb-2">سوابق سفارش‌ها و فاکتورها</h4>
                
                {orders.length === 0 ? (
                  <div className="text-center py-12 text-slate-500 space-y-2">
                    <HelpCircle size={32} className="mx-auto text-slate-700" />
                    <p className="text-xs">هنوز هیچ سفارشی در سوابق خرید شما یافت نشد.</p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[450px] overflow-y-auto pr-1">
                    {orders.slice().reverse().map((o) => (
                      <div key={o.id} className="bg-slate-950 border border-slate-850 rounded-2xl p-4 space-y-3">
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="font-extrabold text-slate-200">کد مرجع: <span className="font-mono font-bold text-gold-400 font-en-nums">{o.trackingCode}</span></span>
                          <span className="text-slate-500 font-en-nums">{o.date}</span>
                        </div>

                        {/* Order items listing */}
                        <div className="text-[11px] text-slate-400 space-y-1">
                          {o.items.map((it, idx) => (
                            <div key={idx} className="flex justify-between font-en-nums">
                              <span>• {it.productTitle} (طرح: {it.variant})</span>
                              <span>{formatPersianNumber(it.quantity)} عدد</span>
                            </div>
                          ))}
                        </div>

                        <div className="flex justify-between items-center border-t border-slate-900 pt-2.5 text-[10px]">
                          <div className="flex items-center gap-1">
                            <span className="text-slate-500">مجموع تراکنش:</span>
                            <span className="font-bold text-slate-200 font-en-nums">{formatPersianPrice(o.totalPrice)}</span>
                          </div>
                          
                          {/* Order Status Display indicator with Iranian colors */}
                          <span className={`rounded-full px-2.5 py-0.5 text-[9px] font-bold ${
                            o.paymentStatus === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                            o.paymentStatus === 'pending' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                            'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          }`}>
                            {o.paymentStatus === 'success' ? '✓ تحویل انبار (آماده ارسال پستی)' :
                             o.paymentStatus === 'pending' ? '● در انتظار تایید مالی' : '✕ لغو شده / خطای تراکنش'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </motion.div>
        )}

        {/* =============== VIEW 7.5: HANDMADES DESIGN PORTFOLIO =============== */}
        {userView === 'handmades' && (
          <motion.div
            key="handmades-screen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <HandmadesView
              currentUser={currentUser}
              onAuthRequired={onAuthRequired || (() => {})}
              currencyUnit={currencyUnit}
            />
          </motion.div>
        )}

        {/* =============== VIEW 8: ABOUT US =============== */}
        {userView === 'about' && (
          <motion.div
            key="about-screen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mx-auto max-w-3xl px-4 py-12 space-y-8 text-right"
          >
            <div className="text-center space-y-1">
              <h3 className="text-xl font-black text-slate-100">داستان درخشش گالری آونتورین</h3>
              <p className="text-xs text-slate-500">درباره ارزش‌ها، ایده طراحی و تضمین کیفیت بدلیجات لوکس</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 leading-relaxed text-xs text-slate-300">
              <p className="text-justify whitespace-pre-line leading-relaxed">
                {aboutText || `گالری زیورآلات آونتورین در سال ۱۳۹۸ با ایده طراحی کارهایی نفیس، ظریف، چشم‌نواز و هم تراز با طلا که با بودجه اقتصادی در دسترس همگان باشد آغاز به کار کرد. تعهد همیشگی ما ثبات رنگ تمام اکسسوری‌ها، عدم استفاده از نیکل (ضدحساسیت شدید) و استفاده از باکیفیت‌ترین نگین‌های تراش مارکیز و مروارید‌های صدفی طبیعی آب شیرین می‌باشد.

                شعبه حضوری ما واقع در مرکزی، محلات، میدان مصطفی خمینی، گالری اونتورین، همه روزه میزبان علاقه‌مندان به اکسسوری‌های خاص است. در بخش فروشگاه آنلاین، ارسال بسیار سریع پستی و پیک شهری همراه بسته‌بندی نفیس کادویی هاردباکس را برای تک تک هموطنان ارجمند به ارمغان آورده‌ایم.`}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-slate-800 text-center">
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-850">
                  <h5 className="font-extrabold text-gold-400">آبکاری چندلایه</h5>
                  <p className="text-[10px] text-slate-500 mt-1">آبکاری طلا و رادیوم استاندارد</p>
                </div>
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-850">
                  <h5 className="font-extrabold text-gold-400">۱۰۰٪ ضد حساسیت</h5>
                  <p className="text-[10px] text-slate-500 mt-1">عاری از نیکل و فلزات مضر</p>
                </div>
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-850">
                  <h5 className="font-extrabold text-gold-400">هاردباکس لوکس</h5>
                  <p className="text-[10px] text-slate-500 mt-1">بسته‌بندی کادویی اختصاصی رایگان</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* =============== VIEW 9: CONTACT US =============== */}
        {userView === 'contact' && (
          <motion.div
            key="contact-screen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mx-auto max-w-4xl px-4 py-12 space-y-8"
          >
            <div className="text-center space-y-1">
              <h3 className="text-xl font-black text-slate-100">ارتباط با کارشناسان آونتورین</h3>
              <p className="text-xs text-slate-500">پاسخگویی سریع به ابهامات، تعویض‌ها، همکاری‌ها و سفارش‌های سازمانی</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
              
              {/* Contact information details */}
              <div className="md:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-6 text-right space-y-6">
                <h4 className="text-xs font-extrabold text-gold-400 pb-2 border-b border-slate-800">نشانی و خطوط ارتباطی</h4>
                
                <p className="text-xs text-slate-400 leading-relaxed text-justify whitespace-pre-line">
                  {contactText || `📍 مرکزی، محلات، میدان مصطفی خمینی، گالری اونتورین
                  
                  📞 شماره تلفن پشتیبانی: ۰۹۳۹۹۳۱۱۸۷۵
                  ✉️ پست الکترونیک: galeriaventurin@gmail.com`}
                </p>

                <div className="pt-4 border-t border-slate-800 space-y-4 text-xs">
                  <span className="text-slate-400 font-semibold block">پشتیبانی آنلاین شبکه‌های اجتماعی:</span>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      {
                        name: 'اینستاگرام',
                        url: 'https://instagram.com/galeriaventurin',
                        color: 'text-pink-500 hover:text-pink-400 border-pink-500/20 hover:border-pink-500/50 bg-pink-500/5'
                      },
                      {
                        name: 'تلگرام',
                        url: 'https://t.me/galeriaventurin',
                        color: 'text-sky-400 hover:text-sky-300 border-sky-400/20 hover:border-sky-400/50 bg-sky-400/5'
                      },
                      {
                        name: 'واتساپ',
                        url: 'https://wa.me/989399311875',
                        color: 'text-emerald-400 hover:text-emerald-300 border-emerald-400/20 hover:border-emerald-400/50 bg-emerald-400/5'
                      },
                      {
                        name: 'ایتا',
                        url: 'https://eitaa.com/galeriaventurin',
                        color: 'text-orange-400 hover:text-orange-300 border-orange-400/20 hover:border-orange-400/50 bg-orange-400/5'
                      },
                      {
                        name: 'بله',
                        url: 'https://ble.ir/galeriaventurin',
                        color: 'text-teal-400 hover:text-teal-300 border-teal-400/20 hover:border-teal-400/50 bg-teal-400/5'
                      },
                      {
                        name: 'روبیکا',
                        url: 'https://rubika.ir/galeriaventurin',
                        color: 'text-indigo-400 hover:text-indigo-300 border-indigo-400/20 hover:border-indigo-400/50 bg-indigo-400/5'
                      }
                    ].map((social, sIdx) => (
                      <motion.a
                        key={sIdx}
                        href={social.url}
                        target="_blank"
                        rel="noreferrer"
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer shadow-sm ${social.color}`}
                      >
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-current"></span>
                        </span>
                        <span>{social.name}</span>
                      </motion.a>
                    ))}
                  </div>
                </div>
              </div>

              {/* Form submit interactive Contact block */}
              <div className="md:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-6 text-right space-y-4">
                <h4 className="text-xs font-extrabold text-gold-400 pb-2 border-b border-slate-800">ارسال پیام مستقیم</h4>
                
                {contactSuccess && (
                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 text-xs text-emerald-400">
                    ✓ پیام شما با موفقیت به واحد فروش گالری مخابره گردید. کارشناسان ما به زودی با شما تماس خواهند گرفت.
                  </div>
                )}

                <form onSubmit={submitContact} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 mb-1.5">نام شما *</label>
                      <input
                        type="text"
                        required
                        value={contactForm.name}
                        onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                        placeholder="مثال: زهرا مرادی"
                        className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2.5 text-xs text-slate-100 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 mb-1.5">پست الکترونیک</label>
                      <input
                        type="email"
                        value={contactForm.email}
                        onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                        placeholder="مثال: support@email.com"
                        className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2.5 text-xs text-slate-100 outline-none text-left"
                        dir="ltr"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 mb-1.5">موضوع پیام</label>
                    <input
                      type="text"
                      value={contactForm.subject}
                      onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                      placeholder="همکاری، سفارش عمده، تعویض کالا..."
                      className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2.5 text-xs text-slate-100 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 mb-1.5">متن پیام مستقیم شما *</label>
                    <textarea
                      required
                      rows={3}
                      value={contactForm.message}
                      onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                      placeholder="پیغام خود را در این بخش تشریح فرمایید..."
                      className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2.5 text-xs text-slate-100 outline-none resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full rounded-xl bg-gold-500 hover:bg-gold-400 text-slate-950 font-extrabold py-3 text-xs transition-all shadow-lg shadow-gold-500/10 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Send size={14} />
                    <span>ارسال پیام مستقیم برای مدیر گالری</span>
                  </button>
                </form>
              </div>

            </div>
          </motion.div>
        )}

        {/* =============== VIEW 10: TERMS =============== */}
        {userView === 'terms' && (
          <motion.div
            key="terms-screen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mx-auto max-w-3xl px-4 py-12 space-y-8 text-right"
          >
            <div className="text-center space-y-1">
              <h3 className="text-xl font-black text-slate-100">قوانین، مقررات و حریم خصوصی</h3>
              <p className="text-xs text-slate-500">شرایط تعویض کالا، مرجوعی‌ها و قوانین کسب نماد اعتماد الکترونیکی (اینماد)</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 leading-relaxed text-xs text-slate-300">
              <p className="text-justify whitespace-pre-line leading-relaxed text-slate-400">
                {termsText || `۱. قوانین مرجوعی زیورآلات:
                به دلیل رعایت کامل مسائل بهداشتی کالاها در صنف لوازم شخصی و بدلیجات، مرجوع کردن کالا تنها در صورت داشتن عیب فیزیکی ملموس، نقص مخراج‌کاری نگین‌ها یا تفاوت مشخص با تصاویر کاتالوگ حداکثر تا ۴۸ ساعت پس از تحویل پستی امکان‌پذیر خواهد بود.

                ۲. تعهد ثبات رنگ عیار کارها:
                تمامی بدلیجات گالری آونتورین دارای آبکاری چند لایه طلا یا رادیوم با ضمانت ثبات رنگ یک الی سه ساله می‌باشند. خواهشمندیم جهت افزایش عمر کالا از برخورد مستقیم کار با ادکلن، الکل، شامپو و مواد اسیدی قوی جلوگیری فرمایید.

                ۳. حریم خصوصی کاربران گرامی:
                تمامی شماره تلفن‌ها، آدرس‌ها و کدهای پستی ثبت شده مشتریان جهت پردازش و ارسال دقیق اداره پست نزد گالری محفوظ مانده و با بهترین الگوریتم‌های رمزنگاری شده محافظت می‌گردد.`}
              </p>

              <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-[10px] text-slate-500">
                  <ShieldCheck size={18} className="text-gold-400" />
                  <span>پایگاه داده امن و حریم خصوصی حفاظت‌شده مشتریان</span>
                </div>
                <div className="flex gap-2">
                  <div className="h-10 w-10 rounded-xl bg-slate-950 border border-slate-850 flex items-center justify-center font-bold text-[9px] text-slate-500">اینماد</div>
                  <div className="h-10 w-10 rounded-xl bg-slate-950 border border-slate-850 flex items-center justify-center font-bold text-[9px] text-slate-500">ساماندهی</div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

      </AnimatePresence>

    </div>
  );
}
