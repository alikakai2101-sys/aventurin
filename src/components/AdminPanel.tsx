import React, { useState, useEffect } from 'react';
import {
  Plus, Trash2, Edit3, Package, Users, DollarSign, AlertCircle, Search,
  RefreshCw, Eye, CheckCircle, Clock, Settings, Tag, FileText, ChevronDown,
  ToggleLeft, Lock, ArrowRight, BookOpen, Compass, ShieldAlert, CheckSquare, X,
  Database, Server, AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Product, Order } from '../types';
import { formatPersianPrice, formatPersianNumber } from './ProductCard';
import { Coupon } from './UserPages';
import { api } from '../lib/api';
import AdminHandmades from './AdminHandmades';

interface AdminPanelProps {
  products: Product[];
  orders: Order[];
  onAddProduct: (product: Omit<Product, 'id'>) => void;
  onEditProduct: (id: string, product: Partial<Product>) => void;
  onDeleteProduct: (id: string) => void;
  onUpdateOrderStatus: (id: string, status: string) => void;

  // New features
  categories: Array<{ id: string; name: string }>;
  onAddCategory: (id: string, name: string) => void;
  onDeleteCategory: (id: string) => void;

  users: Array<{ id: string; name: string; email: string; role: 'admin' | 'user'; status: 'active' | 'blocked' }>;
  onUpdateUser: (id: string, updates: any) => void;

  coupons: Coupon[];
  onAddCoupon: (coupon: Coupon) => void;
  onDeleteCoupon: (code: string) => void;

  cmsTexts: { about: string; terms: string; contact: string };
  onUpdateCMSTexts: (cms: any) => void;

  storeSettings: { currencyUnit: 'تومان' | 'ریال'; shippingCost: number; taxPercent: number };
  onUpdateStoreSettings: (settings: any) => void;
}

export default function AdminPanel({
  products,
  orders,
  onAddProduct,
  onEditProduct,
  onDeleteProduct,
  onUpdateOrderStatus,
  categories,
  onAddCategory,
  onDeleteCategory,
  users,
  onUpdateUser,
  coupons,
  onAddCoupon,
  onDeleteCoupon,
  cmsTexts,
  onUpdateCMSTexts,
  storeSettings,
  onUpdateStoreSettings,
}: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'categories' | 'orders' | 'users' | 'cms' | 'coupons' | 'settings' | 'handmades'>('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [dbStatus, setDbStatus] = useState<{ isMongo: boolean; hasUri: boolean; provider: 'mongodb' | 'json-db' } | null>(null);

  useEffect(() => {
    api.getDbStatus()
      .then(status => setDbStatus(status))
      .catch(err => console.error("Could not fetch database connection status", err));
  }, []);

  // 1. PRODUCT FORM STATE
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<number | ''>('');
  const [discount, setDiscount] = useState<number | ''>('');
  const [category, setCategory] = useState<string>('necklace');
  const [stock, setStock] = useState<number | ''>('');
  const [image, setImage] = useState('');
  const [variantsText, setVariantsText] = useState('طلایی، نقره‌ای');

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Preset accessory images
  const imagePresets = [
    { name: 'گردنبند تک‌نگین', path: '/src/assets/images/luxury_necklace_1784386427279.jpg' },
    { name: 'انگشتر زمرد کلمبیا', path: '/src/assets/images/luxury_ring_1784386441851.jpg' },
    { name: 'گوشواره مروارید', path: '/src/assets/images/luxury_earrings_1784386456583.jpg' },
    { name: 'دستبند زنجیری', path: '/src/assets/images/luxury_bracelet_1784386471951.jpg' },
  ];

  const handleProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !price || !category || !stock || !image) {
      alert('لطفاً تمامی فیلدهای الزامی ستاره‌دار را پر کنید.');
      return;
    }

    const variants = variantsText
      .split(/[,،]/)
      .map((v) => v.trim())
      .filter((v) => v.length > 0);

    const productData = {
      title,
      description,
      price: Number(price),
      discount: discount !== '' ? Number(discount) : 0,
      category,
      stock: Number(stock),
      image,
      variants,
      rating: 4.8,
    };

    if (editingId) {
      onEditProduct(editingId, productData);
      setEditingId(null);
    } else {
      onAddProduct(productData);
    }

    // Reset Form
    setTitle('');
    setDescription('');
    setPrice('');
    setDiscount('');
    setCategory('necklace');
    setStock('');
    setImage('');
    setVariantsText('طلایی، نقره‌ای');
  };

  const handleEditInit = (p: Product) => {
    setEditingId(p.id);
    setTitle(p.title);
    setDescription(p.description);
    setPrice(p.price);
    setDiscount(p.discount || '');
    setCategory(p.category);
    setStock(p.stock);
    setImage(p.image);
    setVariantsText(p.variants.join('، '));
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setTitle('');
    setDescription('');
    setPrice('');
    setDiscount('');
    setCategory('necklace');
    setStock('');
    setImage('');
    setVariantsText('طلایی، نقره‌ای');
  };

  // 2. CATEGORY FORM STATE
  const [newCatId, setNewCatId] = useState('');
  const [newCatName, setNewCatName] = useState('');
  const handleCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatId || !newCatName) return;
    onAddCategory(newCatId.toLowerCase().trim(), newCatName.trim());
    setNewCatId('');
    setNewCatName('');
  };

  // 3. COUPONS FORM STATE
  const [couponCode, setCouponCode] = useState('');
  const [couponType, setCouponType] = useState<'percent' | 'amount'>('percent');
  const [couponValue, setCouponValue] = useState<number | ''>('');
  const [couponExpiry, setCouponExpiry] = useState('');
  const [couponLimit, setCouponLimit] = useState<number | ''>('');

  const handleCouponSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode || !couponValue || !couponExpiry || !couponLimit) return;
    onAddCoupon({
      code: couponCode.toUpperCase().trim(),
      type: couponType,
      value: Number(couponValue),
      expiryDate: couponExpiry,
      usageLimit: Number(couponLimit),
      usageCount: 0,
    });
    setCouponCode('');
    setCouponValue('');
    setCouponExpiry('');
    setCouponLimit('');
  };

  // 4. CMS FORM STATE
  const [cmsAbout, setCmsAbout] = useState(cmsTexts.about);
  const [cmsTerms, setCmsTerms] = useState(cmsTexts.terms);
  const [cmsContact, setCmsContact] = useState(cmsTexts.contact);

  const handleCmsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateCMSTexts({
      about: cmsAbout,
      terms: cmsTerms,
      contact: cmsContact,
    });
    alert('تغییرات محتوای صفحات ایستا با موفقیت ذخیره شد!');
  };

  // 5. SETTINGS FORM STATE
  const [setCurrency, setSetCurrency] = useState<'تومان' | 'ریال'>(storeSettings.currencyUnit);
  const [setShipping, setSetShipping] = useState<number>(storeSettings.shippingCost);
  const [setTax, setSetTax] = useState<number>(storeSettings.taxPercent);

  const handleSettingsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateStoreSettings({
      currencyUnit: setCurrency,
      shippingCost: Number(setShipping),
      taxPercent: Number(setTax),
    });
    alert('تنظیمات پایه درگاه و فروشگاه با موفقیت به‌روزرسانی شد!');
  };

  // Calculations for Dashboard
  const totalRevenue = orders
    .filter((o) => o.paymentStatus === 'success')
    .reduce((sum, o) => sum + o.totalPrice, 0);

  const totalSalesCount = orders.filter((o) => o.paymentStatus === 'success').length;
  const lowStockCount = products.filter((p) => p.stock <= 3 && p.stock > 0).length;
  const outOfStockCount = products.filter((p) => p.stock === 0).length;

  const filteredProducts = products.filter((p) =>
    p.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 text-right text-slate-100" dir="rtl">
      
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-800 pb-5 mb-8">
        <div>
          <h2 className="text-xl font-black text-slate-100">پنل مدیریت پیشرفته گالری آونتورین</h2>
          <p className="text-xs text-slate-500 mt-1">
            کنترل انبار، تعریف کوپن‌های تخفیف، ویرایش اطلاعات ایستای CMS و مانیتورینگ سفارشات
          </p>
        </div>

        {/* Tab Switching row */}
        <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
          {[
            { id: 'dashboard', name: 'داشبورد آمار', icon: <DollarSign size={14} /> },
            { id: 'products', name: 'محصولات', icon: <Package size={14} /> },
            { id: 'categories', name: 'دسته‌بندی‌ها', icon: <Compass size={14} /> },
            { id: 'orders', name: 'سفارش‌ها', icon: <Clock size={14} /> },
            { id: 'users', name: 'کاربران', icon: <Users size={14} /> },
            { id: 'coupons', name: 'کوپن تخفیف', icon: <Tag size={14} /> },
            { id: 'cms', name: 'محتوای CMS', icon: <FileText size={14} /> },
            { id: 'handmades', name: 'سفارشات دست‌ساز', icon: <RefreshCw size={14} /> },
            { id: 'settings', name: 'تنظیمات', icon: <Settings size={14} /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition-all cursor-pointer ${
                activeTab === tab.id ? 'bg-gold-500 text-slate-950 font-bold shadow' : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
              }`}
            >
              {tab.icon}
              <span>{tab.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Database Connection Status Notification Banner */}
      {dbStatus && (
        <div className="mb-8">
          {dbStatus.isMongo ? (
            <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 text-xs text-emerald-400">
              <Database size={18} className="shrink-0" />
              <div>
                <span className="font-extrabold block">اتصال امن به پایگاه داده ابری (MongoDB Atlas) برقرار است</span>
                <span className="text-[10px] text-emerald-500/80 mt-0.5 block">تمام اطلاعات فروشگاه شما به طور خودکار روی سرویس ابری همگام‌سازی می‌شود.</span>
              </div>
            </div>
          ) : dbStatus.hasUri ? (
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 text-xs text-amber-400">
              <div className="flex items-start gap-3 flex-1">
                <AlertTriangle size={20} className="shrink-0 text-amber-500 mt-0.5" />
                <div>
                  <span className="font-extrabold block text-sm">⚠️ هشدار: عدم امکان اتصال به خوشه MongoDB Atlas (احتمالاً به دلیل محدودیت IP)</span>
                  <p className="text-[10px] text-amber-500/80 mt-1 leading-relaxed">
                    متغیر MONGODB_URI در محیط برنامه شما تعریف شده است، اما ارتباط با سرور MongoDB به دلیل مسدود بودن IP سرور در فایروال اطلس با شکست مواجه شد.
                    <span className="font-bold text-slate-100 block mt-1.5 bg-slate-950/40 p-2 rounded-xl border border-slate-800">
                      💡 راه‌حل هوشمند سیستم: جای نگرانی نیست! جهت تداوم فروشگاه و جلوگیری از اختلال در کارکرد سبد خرید، کاتالوگ و ثبت سفارش، سیستم به صورت کاملاً خودکار به بانک اطلاعاتی محلی JSON-DB سوئیچ کرده است. پس از ثبت و مجوزدهی به آی‌پی در پنل اطلس، سیستم به شکل زنده به دیتابیس ابری متصل خواهد شد.
                    </span>
                  </p>
                </div>
              </div>
              <div className="mt-3 sm:mt-0 shrink-0 text-left">
                <a
                  href="https://www.mongodb.com/docs/atlas/security-whitelist/"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-block bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-lg px-4 py-2 text-xs text-center transition-all shadow"
                >
                  آموزش ثبت IP اطلس
                </a>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 rounded-2xl p-4 text-xs text-slate-400">
              <Server size={18} className="shrink-0" />
              <div>
                <span className="font-extrabold block">پایگاه داده محلی بسیار بهینه فعال است</span>
                <span className="text-[10px] text-slate-500 mt-0.5 block">برای استفاده از دیتابیس ابری، متغیر MONGODB_URI را در بخش تنظیمات AI Studio اضافه کنید.</span>
              </div>
            </div>
          )}
        </div>
      )}

      <AnimatePresence mode="wait">
        
        {/* ================= TAB 1: DASHBOARD ================= */}
        {activeTab === 'dashboard' && (
          <motion.div
            key="dash-tab"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-8"
          >
            {/* Bento Grid counters */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
                <span className="text-[10px] text-slate-500 block">کل فروش موفق درگاه</span>
                <h4 className="text-base sm:text-lg font-black text-emerald-400 font-en-nums">{formatPersianPrice(totalRevenue)}</h4>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
                <span className="text-[10px] text-slate-500 block">سفارشات تحویل شده</span>
                <h4 className="text-base sm:text-lg font-black text-slate-100 font-en-nums">{formatPersianNumber(totalSalesCount)} فاکتور</h4>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
                <span className="text-[10px] text-slate-500 block">آیتم‌های روبه اتمام</span>
                <h4 className="text-base sm:text-lg font-black text-amber-500 font-en-nums">{formatPersianNumber(lowStockCount)} محصول</h4>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
                <span className="text-[10px] text-slate-500 block">اقلام کاملا ناموجود</span>
                <h4 className="text-base sm:text-lg font-black text-rose-500 font-en-nums">{formatPersianNumber(outOfStockCount)} تنوع</h4>
              </div>
            </div>

            {/* Simulated monthly sales bar-chart */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
              <div>
                <h3 className="text-xs font-extrabold text-gold-400">نمودار ستونی فروش ماهانه ۱۴۰۵ (تومان)</h3>
                <p className="text-[10px] text-slate-500 mt-0.5">شبیه‌سازی تراکنش‌های مالی گالری</p>
              </div>

              <div className="flex h-36 items-end gap-3 pt-6 border-b border-slate-800">
                {[
                  { month: 'فروردین', sales: 4500000, h: 'h-[30%]' },
                  { month: 'اردیبهشت', sales: 6200000, h: 'h-[45%]' },
                  { month: 'خرداد', sales: 8100000, h: 'h-[60%]' },
                  { month: 'تیر', sales: 12500000, h: 'h-[95%]', active: true },
                ].map((item, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                    <div className="w-full text-center text-[9px] text-slate-400 font-en-nums truncate">{formatPersianPrice(item.sales)}</div>
                    <div className={`w-full rounded-t-lg ${item.active ? 'bg-gold-500' : 'bg-slate-800'} ${item.h} transition-all hover:opacity-85`} />
                    <span className="text-[10px] text-slate-500 pt-1">{item.month}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Orders inside Dashboard */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4">
                <h3 className="text-xs font-black text-slate-100">سفارشات اخیر فاکتور شده</h3>
                {orders.length === 0 ? (
                  <p className="text-xs text-slate-500">هیچ سفارش ثبت شده‌ای پیدا نشد.</p>
                ) : (
                  <div className="divide-y divide-slate-850">
                    {orders.slice(-4).reverse().map(o => (
                      <div key={o.id} className="flex justify-between items-center py-2.5 text-xs font-en-nums">
                        <div>
                          <span className="font-bold text-slate-200 block">{o.customerName}</span>
                          <span className="text-[10px] text-slate-500">کد رهگیری: {o.trackingCode}</span>
                        </div>
                        <div className="text-left">
                          <span className="font-black text-gold-400 block">{formatPersianPrice(o.totalPrice)}</span>
                          <span className={`text-[9px] rounded-full px-1.5 py-0.5 ${o.paymentStatus === 'success' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                            {o.paymentStatus === 'success' ? 'موفق' : 'ناموفق / منتظر'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Stock alerts column */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4">
                <h3 className="text-xs font-black text-slate-100">محصولات با موجودی بحرانی</h3>
                <div className="space-y-3">
                  {products.filter(p => p.stock <= 4).slice(0, 4).map(p => (
                    <div key={p.id} className="flex items-center gap-3 bg-slate-950 p-2 rounded-xl border border-slate-850">
                      <img src={p.image} className="h-10 w-10 rounded-lg object-cover bg-slate-900" referrerPolicy="no-referrer" />
                      <div className="flex-1 min-w-0 text-right">
                        <span className="text-xs font-bold text-slate-200 truncate block">{p.title}</span>
                        <span className="text-[9px] text-slate-500">موجودی انبار: {formatPersianNumber(p.stock)} عدد</span>
                      </div>
                      <span className={`text-[9px] font-bold px-2 py-1 rounded ${p.stock === 0 ? 'bg-rose-500/10 text-rose-400' : 'bg-amber-500/10 text-amber-400'}`}>
                        {p.stock === 0 ? 'اتمام موجودی' : 'روبه اتمام'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </motion.div>
        )}

        {/* ================= TAB 2: PRODUCTS ================= */}
        {activeTab === 'products' && (
          <motion.div
            key="prod-tab"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8"
          >
            {/* Form to Add/Edit Products */}
            <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-6 h-fit space-y-5">
              <h3 className="text-xs font-black text-gold-400 border-b border-slate-850 pb-3">
                {editingId ? 'ویرایش اطلاعات کالا' : 'افزودن محصول جدید به انبار'}
              </h3>

              <form onSubmit={handleProductSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1.5">نام کامل کالا *</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="مثال: انگشتر زمرد سلطنتی آبکاری شده"
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2.5 text-xs text-slate-100 outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1.5">قیمت کالا (تومان) *</label>
                    <input
                      type="number"
                      required
                      value={price}
                      onChange={(e) => setPrice(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="مثال: 980000"
                      className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2.5 text-xs text-slate-100 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1.5">موجودی عددی انبار *</label>
                    <input
                      type="number"
                      required
                      value={stock}
                      onChange={(e) => setStock(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="مثال: 15"
                      className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2.5 text-xs text-slate-100 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1.5">تخفیف ویژه (٪)</label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={discount}
                      onChange={(e) => setDiscount(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="مثال: 15"
                      className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2.5 text-xs text-slate-100 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1.5">انتخاب دسته‌بندی *</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2.5 text-xs text-slate-350 outline-none"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1.5">تنوع طرح / رنگ کالا</label>
                  <input
                    type="text"
                    value={variantsText}
                    onChange={(e) => setVariantsText(e.target.value)}
                    placeholder="با ویرگول تفکیک کنید: طلایی، نقره‌ای، رزگلد"
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2.5 text-xs text-slate-100 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1.5">آدرس تصویر محصول *</label>
                  <input
                    type="text"
                    required
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    placeholder="/src/assets/images/..."
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2.5 text-xs text-slate-100 outline-none mb-3"
                  />
                  <div className="flex flex-wrap gap-1.5">
                    {imagePresets.map((pr, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setImage(pr.path)}
                        className={`text-[9px] rounded px-2 py-1.5 border transition-all ${
                          image === pr.path ? 'border-gold-500 text-gold-400 bg-gold-500/10' : 'border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {pr.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1.5">توضیحات و خصوصیات فنی کالا</label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="ابعاد، ضد حساسیت بودن عیار آبکاری و ..."
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2.5 text-xs text-slate-100 outline-none resize-none"
                  />
                </div>

                <div className="flex gap-2 pt-2 border-t border-slate-800">
                  <button type="submit" className="flex-1 rounded-xl bg-gold-500 hover:bg-gold-400 text-slate-950 font-extrabold py-3 text-xs cursor-pointer">
                    {editingId ? 'ثبت تغییرات نهایی کالا' : 'افزودن محصول به لیست فروشگاه'}
                  </button>
                  {editingId && (
                    <button type="button" onClick={cancelEdit} className="rounded-xl border border-slate-800 text-slate-400 px-4 py-3 text-xs cursor-pointer">لغو</button>
                  )}
                </div>
              </form>
            </div>

            {/* Products interactive search list */}
            <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
              <div className="flex items-center justify-between gap-4 border-b border-slate-850 pb-3">
                <h3 className="text-xs font-black text-slate-100">لیست محصولات فعال انبار</h3>
                <div className="relative w-48">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="جستجو در انبار..."
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-1.5 text-xs text-slate-100 outline-none"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-500 font-bold">
                      <th className="py-2">تصویر</th>
                      <th className="py-2">نام کالا</th>
                      <th className="py-2">قیمت اصلی</th>
                      <th className="py-2 text-center">موجودی انبار</th>
                      <th className="py-2 text-center">حذف / ویرایش</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850 font-en-nums">
                    {filteredProducts.map(p => (
                      <tr key={p.id} className="hover:bg-slate-950/20">
                        <td className="py-3">
                          <img src={p.image} className="h-9 w-9 rounded-lg object-cover bg-slate-950 border border-slate-800" referrerPolicy="no-referrer" />
                        </td>
                        <td className="py-3 text-slate-200 font-bold truncate max-w-[150px]" title={p.title}>{p.title}</td>
                        <td className="py-3 text-slate-300 font-bold">{formatPersianPrice(p.price)}</td>
                        <td className="py-3 text-center">
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${p.stock === 0 ? 'bg-rose-500/10 text-rose-400' : 'bg-slate-950 text-slate-400'}`}>
                            {p.stock === 0 ? 'ناموجود' : `${formatPersianNumber(p.stock)} عدد`}
                          </span>
                        </td>
                        <td className="py-3 text-center flex items-center justify-center gap-2 h-14">
                          <button onClick={() => handleEditInit(p)} className="text-blue-400 hover:text-blue-300 p-1 cursor-pointer"><Edit3 size={14} /></button>
                          <button onClick={() => onDeleteProduct(p.id)} className="text-rose-400 hover:text-rose-300 p-1 cursor-pointer"><Trash2 size={14} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* ================= TAB 3: CATEGORIES ================= */}
        {activeTab === 'categories' && (
          <motion.div
            key="cat-tab"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            {/* Add Category */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 h-fit space-y-4">
              <h3 className="text-xs font-black text-gold-400 pb-3 border-b border-slate-850">افزودن دسته‌بندی جدید</h3>
              <form onSubmit={handleCategorySubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1.5">کد یکتا دسته‌بندی (انگلیسی و بدون فاصله) *</label>
                  <input
                    type="text"
                    required
                    value={newCatId}
                    onChange={(e) => setNewCatId(e.target.value)}
                    placeholder="مثال: necklace, ring, anklet"
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2.5 text-xs text-slate-100 outline-none text-left"
                    dir="ltr"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1.5">نام فارسی دسته‌بندی *</label>
                  <input
                    type="text"
                    required
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    placeholder="مثال: گردنبندهای چند ردیفه"
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2.5 text-xs text-slate-100 outline-none"
                  />
                </div>
                <button type="submit" className="w-full rounded-xl bg-gold-500 hover:bg-gold-400 text-slate-950 font-extrabold py-3 text-xs cursor-pointer">
                  افزودن دسته‌بندی به سیستم
                </button>
              </form>
            </div>

            {/* Categories List */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
              <h3 className="text-xs font-black text-slate-100 pb-3 border-b border-slate-850">دسته‌بندی‌های فعال فروشگاه</h3>
              <div className="divide-y divide-slate-850">
                {categories.map((c) => (
                  <div key={c.id} className="flex justify-between items-center py-3">
                    <div>
                      <span className="font-bold text-slate-200 block text-xs">{c.name}</span>
                      <span className="text-[9px] text-slate-500 font-mono" dir="ltr">{c.id}</span>
                    </div>
                    {c.id !== 'all' && (
                      <button
                        onClick={() => onDeleteCategory(c.id)}
                        className="text-slate-500 hover:text-rose-400 p-1.5 transition-colors cursor-pointer"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* ================= TAB 4: ORDERS ================= */}
        {activeTab === 'orders' && (
          <motion.div
            key="order-tab"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4"
          >
            <div className="flex justify-between items-center border-b border-slate-850 pb-3">
              <h3 className="text-xs font-black text-slate-100">تراکنش‌ها و فاکتورهای رسمی درگاه</h3>
              <span className="text-[10px] bg-slate-950 px-2.5 py-1 rounded-full text-slate-400 font-en-nums">کل خریدها: {formatPersianNumber(orders.length)} ثبت</span>
            </div>

            {orders.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-10">سفارشی هنوز ثبت نشده است.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-500 font-bold">
                      <th className="py-2.5">کد رهگیری</th>
                      <th className="py-2.5">مشتری گیرنده</th>
                      <th className="py-2.5">تلفن همراه</th>
                      <th className="py-2.5">جمع کل پرداختی</th>
                      <th className="py-2.5 text-center">وضعیت مالی</th>
                      <th className="py-2.5 text-center">جزئیات فاکتور</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850 font-en-nums">
                    {orders.slice().reverse().map(o => (
                      <tr key={o.id} className="hover:bg-slate-950/20">
                        <td className="py-3 font-mono font-bold text-gold-400 text-xs">{o.trackingCode}</td>
                        <td className="py-3 text-slate-200 font-semibold">{o.customerName}</td>
                        <td className="py-3 text-slate-400">{o.customerPhone}</td>
                        <td className="py-3 text-slate-200 font-bold">{formatPersianPrice(o.totalPrice)}</td>
                        <td className="py-3 text-center">
                          <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${
                            o.paymentStatus === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                            o.paymentStatus === 'pending' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                            'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          }`}>
                            {o.paymentStatus === 'success' ? 'پرداخت موفق' :
                             o.paymentStatus === 'pending' ? 'در انتظار تایید' : 'تراکنش ناموفق'}
                          </span>
                        </td>
                        <td className="py-3 text-center">
                          <button
                            onClick={() => setSelectedOrder(o)}
                            className="bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-850 text-[10px] font-bold text-slate-400 hover:text-gold-400 transition-colors cursor-pointer"
                          >
                            نمایش فاکتور
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        )}

        {/* ================= TAB 5: USERS ================= */}
        {activeTab === 'users' && (
          <motion.div
            key="user-tab"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4"
          >
            <h3 className="text-xs font-black text-slate-100 pb-3 border-b border-slate-850">لیست کاربران ثبت نام شده فروشگاه</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-500 font-bold">
                    <th className="py-2">نام کاربری</th>
                    <th className="py-2">پست الکترونیکی</th>
                    <th className="py-2">نقش کاربری</th>
                    <th className="py-2 text-center">وضعیت حساب</th>
                    <th className="py-2 text-center">تغییر وضعیت</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-950/20">
                      <td className="py-3 font-bold text-slate-200">{u.name}</td>
                      <td className="py-3 text-slate-400 text-xs font-serif">{u.email}</td>
                      <td className="py-3">
                        <select
                          value={u.role}
                          onChange={(e) => onUpdateUser(u.id, { role: e.target.value })}
                          className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-[10px] text-slate-300 outline-none"
                        >
                          <option value="user">کاربر عادی</option>
                          <option value="admin">مدیر سیستم</option>
                        </select>
                      </td>
                      <td className="py-3 text-center">
                        <span className={`rounded px-2 py-0.5 text-[9px] font-bold ${u.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                          {u.status === 'active' ? 'فعال' : 'مسدود شده'}
                        </span>
                      </td>
                      <td className="py-3 text-center">
                        <button
                          onClick={() => onUpdateUser(u.id, { status: u.status === 'active' ? 'blocked' : 'active' })}
                          className="text-[10px] text-slate-400 hover:text-gold-400 border border-slate-800 bg-slate-950 px-2 py-1 rounded transition-all cursor-pointer"
                        >
                          {u.status === 'active' ? 'مسدود ساختن' : 'فعال کردن مجدد'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* ================= TAB 6: COUPONS ================= */}
        {activeTab === 'coupons' && (
          <motion.div
            key="coupon-tab"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 md:grid-cols-12 gap-8"
          >
            {/* Create Coupon form */}
            <div className="md:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-6 h-fit space-y-4">
              <h3 className="text-xs font-black text-gold-400 pb-3 border-b border-slate-850">ایجاد کد تخفیف جدید</h3>
              <form onSubmit={handleCouponSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1.5">کد تخفیف (ترجیحاً حروف بزرگ انگلیسی) *</label>
                  <input
                    type="text"
                    required
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="مثال: GOLD1405"
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2.5 text-xs text-slate-100 outline-none text-left"
                    dir="ltr"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1.5">نوع تخفیف *</label>
                    <select
                      value={couponType}
                      onChange={(e: any) => setCouponType(e.target.value)}
                      className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2.5 text-xs text-slate-350 outline-none"
                    >
                      <option value="percent">درصدی (٪)</option>
                      <option value="amount">مبلغ ثابت (تومان)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1.5">میزان تخفیف *</label>
                    <input
                      type="number"
                      required
                      value={couponValue}
                      onChange={(e) => setCouponValue(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="درصد یا مبلغ کسر شده"
                      className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2.5 text-xs text-slate-100 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1.5">مهلت اعتبار (تاریخ میلادی) *</label>
                    <input
                      type="date"
                      required
                      value={couponExpiry}
                      onChange={(e) => setCouponExpiry(e.target.value)}
                      className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2.5 text-xs text-slate-350 outline-none text-left"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1.5">سقف تعداد استفاده کل *</label>
                    <input
                      type="number"
                      required
                      value={couponLimit}
                      onChange={(e) => setCouponLimit(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="مثال: 50"
                      className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2.5 text-xs text-slate-100 outline-none"
                    />
                  </div>
                </div>

                <button type="submit" className="w-full rounded-xl bg-gold-500 hover:bg-gold-400 text-slate-950 font-extrabold py-3 text-xs cursor-pointer">
                  تولید و ثبت کد تخفیف
                </button>
              </form>
            </div>

            {/* Coupons list */}
            <div className="md:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
              <h3 className="text-xs font-black text-slate-100 pb-3 border-b border-slate-850">کدهای تخفیف معتبر فروشگاه</h3>
              
              {coupons.length === 0 ? (
                <p className="text-xs text-slate-500">کد تخفیفی تعریف نشده است.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-right text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-500 font-bold">
                        <th className="py-2">کد</th>
                        <th className="py-2">نوع و میزان تخفیف</th>
                        <th className="py-2">مهلت اعتبار</th>
                        <th className="py-2 text-center">تعداد مصرف شده</th>
                        <th className="py-2 text-center">حذف</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-850 font-en-nums">
                      {coupons.map((c) => (
                        <tr key={c.code} className="hover:bg-slate-950/20">
                          <td className="py-3 font-mono font-bold text-gold-400 text-xs">{c.code}</td>
                          <td className="py-3 text-slate-200">
                            {c.type === 'percent' ? `${formatPersianNumber(c.value)}٪ تخفیف کل` : `${formatPersianPrice(c.value)} کسر مبلغ`}
                          </td>
                          <td className="py-3 text-slate-400 font-serif text-[11px]">{c.expiryDate}</td>
                          <td className="py-3 text-center text-slate-400">
                            {formatPersianNumber(c.usageCount)} از {formatPersianNumber(c.usageLimit)}
                          </td>
                          <td className="py-3 text-center">
                            <button onClick={() => onDeleteCoupon(c.code)} className="text-slate-500 hover:text-rose-400 p-1 cursor-pointer">
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* ================= TAB 7: CMS ================= */}
        {activeTab === 'cms' && (
          <motion.div
            key="cms-tab"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="bg-slate-900 border border-slate-800 rounded-3xl p-6"
          >
            <h3 className="text-xs font-black text-slate-100 pb-3 border-b border-slate-850 mb-5">ویرایش محتوای صفحات فرعی (داستان برند، قوانین، راهنما)</h3>
            
            <form onSubmit={handleCmsSubmit} className="space-y-6">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2">متن صفحه «داستان برند و درباره ما»</label>
                <textarea
                  rows={4}
                  value={cmsAbout}
                  onChange={(e) => setCmsAbout(e.target.value)}
                  className="w-full rounded-2xl bg-slate-950 border border-slate-800 p-4 text-xs text-slate-100 outline-none resize-none leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2">متن صفحه «قوانین، مقررات و حریم خصوصی»</label>
                <textarea
                  rows={4}
                  value={cmsTerms}
                  onChange={(e) => setCmsTerms(e.target.value)}
                  className="w-full rounded-2xl bg-slate-950 border border-slate-800 p-4 text-xs text-slate-100 outline-none resize-none leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2">نشانی، تلفن و اطلاعات تماس «تماس با ما»</label>
                <textarea
                  rows={3}
                  value={cmsContact}
                  onChange={(e) => setCmsContact(e.target.value)}
                  className="w-full rounded-2xl bg-slate-950 border border-slate-800 p-4 text-xs text-slate-100 outline-none resize-none leading-relaxed"
                />
              </div>

              <button type="submit" className="w-full rounded-xl bg-gold-500 hover:bg-gold-400 text-slate-950 font-extrabold py-3.5 text-xs transition-colors cursor-pointer">
                ثبت و اعمال همزمان تغییرات در سراسر کاتالوگ فرانت‌اند
              </button>
            </form>
          </motion.div>
        )}

        {/* ================= TAB 8: SETTINGS ================= */}
        {activeTab === 'settings' && (
          <motion.div
            key="set-tab"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-2xl mx-auto"
          >
            <h3 className="text-xs font-black text-slate-100 pb-3 border-b border-slate-850 mb-5">تنظیمات پایه و تعرفه های حمل و مالیات فروشگاه</h3>
            
            <form onSubmit={handleSettingsSubmit} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-2">واحد پول سیستم</label>
                  <select
                    value={setCurrency}
                    onChange={(e: any) => setSetCurrency(e.target.value)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2.5 text-xs text-slate-350 outline-none"
                  >
                    <option value="تومان">تومان ایران</option>
                    <option value="ریال">ریال ایران</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-2">مالیات بر ارزش افزوده (٪)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={setTax}
                    onChange={(e) => setSetTax(Number(e.target.value))}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2.5 text-xs text-slate-100 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2">هزینه ثابت ارسال پستی (تومان)</label>
                <input
                  type="number"
                  value={setShipping}
                  onChange={(e) => setSetShipping(Number(e.target.value))}
                  placeholder="مثال: 35000"
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2.5 text-xs text-slate-100 outline-none"
                />
                <p className="text-[10px] text-slate-500 mt-1.5">خریدهای بیش از ۵۰۰,۰۰۰ تومان به صورت خودکار واجد شرایط ارسال رایگان می‌گردند.</p>
              </div>

              <button type="submit" className="w-full rounded-xl bg-gold-500 hover:bg-gold-400 text-slate-950 font-extrabold py-3.5 text-xs transition-colors cursor-pointer">
                به‌روزرسانی و اعمال تنظیمات پایه فروشگاه
              </button>
            </form>
          </motion.div>
        )}

        {/* ================= TAB 9: HANDMADES & CUSTOM ORDERS ================= */}
        {activeTab === 'handmades' && (
          <motion.div
            key="handmades-tab"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <AdminHandmades />
          </motion.div>
        )}

      </AnimatePresence>

      {/* FACTURE INVOICE POPUP FOR ADMIN ORDERS */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.8 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedOrder(null)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-2xl rounded-3xl bg-slate-900 p-6 border border-gold-500/20 shadow-2xl text-right overflow-hidden"
            >
              <div className="flex justify-between items-center border-b border-slate-800 pb-3 mb-4">
                <span className="text-xs font-black text-slate-100">فاکتور تراکنش رسمی گالری آونتورین</span>
                <button onClick={() => setSelectedOrder(null)} className="text-slate-500 hover:text-slate-300"><X size={18} /></button>
              </div>

              {/* Order Info Details Grid */}
              <div className="grid grid-cols-2 gap-4 text-xs bg-slate-950 p-4 border border-slate-850 rounded-2xl mb-4 font-en-nums">
                <div>
                  <span className="text-slate-500">مشتری تحویل‌گیرنده:</span>
                  <span className="text-slate-200 font-bold block mt-1">{selectedOrder.customerName}</span>
                </div>
                <div>
                  <span className="text-slate-500">شماره موبایل:</span>
                  <span className="text-slate-200 font-semibold block mt-1">{selectedOrder.customerPhone}</span>
                </div>
                <div>
                  <span className="text-slate-500">کد رهگیری بانکی تراکنش:</span>
                  <span className="text-gold-400 font-mono font-bold block mt-1 text-sm">{selectedOrder.trackingCode}</span>
                </div>
                <div>
                  <span className="text-slate-500">تاریخ ثبت خرید:</span>
                  <span className="text-slate-300 block mt-1">{selectedOrder.date}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-500">آدرس دقیق تحویل:</span>
                  <span className="text-slate-300 block mt-1">{selectedOrder.province}، {selectedOrder.city}، {selectedOrder.address}</span>
                </div>
              </div>

              {/* Items Table inside facture */}
              <div className="border border-slate-850 rounded-2xl overflow-hidden mb-4 text-xs font-en-nums">
                <table className="w-full">
                  <thead className="bg-slate-950 text-slate-500 border-b border-slate-850">
                    <tr>
                      <th className="py-2.5 px-3">محصول</th>
                      <th className="py-2.5 px-3">رنگ/طرح</th>
                      <th className="py-2.5 px-3 text-center">تعداد</th>
                      <th className="py-2.5 px-3">قیمت واحد</th>
                      <th className="py-2.5 px-3">مبلغ کل</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850 text-slate-300">
                    {selectedOrder.items.map((it, idx) => (
                      <tr key={idx}>
                        <td className="py-2.5 px-3 font-semibold text-slate-100">{it.productTitle}</td>
                        <td className="py-2.5 px-3">{it.variant}</td>
                        <td className="py-2.5 px-3 text-center">{formatPersianNumber(it.quantity)}</td>
                        <td className="py-2.5 px-3">{formatPersianPrice(it.price)}</td>
                        <td className="py-2.5 px-3 font-bold text-slate-100">{formatPersianPrice(it.price * it.quantity)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-between items-center bg-gold-500/10 border border-gold-500/20 rounded-2xl p-4 font-en-nums">
                <span className="text-xs font-bold text-gold-400">کل دریافتی خالص سفارش:</span>
                <span className="text-sm font-black text-gold-300">{formatPersianPrice(selectedOrder.totalPrice)}</span>
              </div>

              {/* Status Update Trigger for simulator */}
              {selectedOrder.paymentStatus === 'pending' && (
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => {
                      onUpdateOrderStatus(selectedOrder.id, 'success');
                      setSelectedOrder(null);
                    }}
                    className="flex-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle size={14} />
                    تایید تراکنش و ارسال سفارش
                  </button>
                  <button
                    onClick={() => {
                      onUpdateOrderStatus(selectedOrder.id, 'failed');
                      setSelectedOrder(null);
                    }}
                    className="flex-1 rounded-xl bg-rose-600 hover:bg-rose-500 text-white py-2.5 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    لغو و رد تراکنش
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
