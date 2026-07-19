import React, { useState } from 'react';
import { Mail, Phone, MapPin, Instagram, ShieldCheck, Heart, ArrowUp, Calendar, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Footer() {
  const [activeTrust, setActiveTrust] = useState<'enamad' | 'samandehi' | null>(null);

  const handleScrollTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openCert = (type: 'enamad' | 'samandehi') => {
    setActiveTrust(type);
  };

  return (
    <footer className="relative bg-stone-950 text-stone-300 pt-16 pb-8 border-t border-gold-800/30 overflow-hidden">
      {/* Background radial gold glow pattern */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[350px] w-[500px] bg-gradient-radial from-gold-900/10 to-transparent blur-3xl pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Call to action section */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 border-b border-stone-800 pb-12">
          
          {/* Column 1: Brand intro */}
          <div className="md:col-span-5 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <img 
                src="/src/assets/images/aventurin_logo_1784399850455.jpg" 
                alt="Aventurin Gallery" 
                className="h-12 w-12 rounded-full border border-gold-500/50 shadow-md shadow-gold-500/10 object-cover" 
                referrerPolicy="no-referrer"
              />
              <span className="font-serif text-2xl font-bold tracking-tight text-white">
                گالری <span className="text-gold-400">آونتورین</span>
              </span>
            </div>
            <p className="text-stone-400 text-sm leading-relaxed max-w-md">
              در گالری آونتورین، ما با تلفیق هنر سنتی جواهرسازی و ترندهای نوین جهانی، مجموعه‌ای بی‌نظیر از بدلیجات مدرن، اکسسوری‌های خاص و جواهرات لوکس آبکاری‌شده را با بالاترین کیفیت و قیمتی منصفانه برای شما گردآوری کرده‌ایم. درخشش شما، تخصص ماست.
            </p>
            <div className="flex flex-col gap-2 mt-2">
              <span className="text-xs text-stone-500 font-bold">شبکه‌های اجتماعی گالری اونتورین:</span>
              <div className="flex flex-wrap gap-2.5">
                {[
                  {
                    name: 'اینستاگرام',
                    url: 'https://instagram.com/galeriaventurin',
                    bg: 'bg-gradient-to-tr from-purple-600 via-pink-500 to-yellow-500 hover:shadow-pink-500/20',
                    icon: <Instagram size={18} />
                  },
                  {
                    name: 'تلگرام',
                    url: 'https://t.me/galeriaventurin',
                    bg: 'bg-sky-500 hover:shadow-sky-500/20',
                    icon: (
                      <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                        <path d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zm5.56 8.61l-1.91 9c-.14.65-.53.81-1.08.5l-2.91-2.15-1.4 1.35c-.15.15-.28.27-.58.27l.2-2.94 5.35-4.83c.23-.21-.05-.32-.35-.12L9.83 13.3l-2.85-.89c-.62-.19-.63-.62.13-.92l11.12-4.29c.51-.19.97.12.73 1.41z" />
                      </svg>
                    )
                  },
                  {
                    name: 'واتساپ',
                    url: 'https://wa.me/989399311875',
                    bg: 'bg-emerald-500 hover:shadow-emerald-500/20',
                    icon: (
                      <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                        <path d="M12.012 0C5.398 0 .051 5.348.051 11.957c0 2.112.553 4.177 1.602 5.992L0 24l6.19-1.623c1.768.961 3.758 1.468 5.811 1.468 6.615 0 11.964-5.348 11.964-11.957C23.965 5.348 18.62 0 12.012 0zm5.952 16.924c-.244.688-1.22 1.254-1.688 1.313-.467.06-1.061.104-3.11-.756-2.622-1.1-4.298-3.795-4.428-3.968-.131-.173-1.06-1.413-1.06-2.694s.666-1.913.903-2.156c.236-.244.515-.304.688-.304.173 0 .346.002.497.01.163.008.38-.063.595.456.223.535.759 1.854.825 1.986.066.132.11.285.022.46-.088.175-.131.285-.262.438-.131.152-.276.34-.394.456-.131.126-.268.263-.116.525.152.262.678 1.118 1.455 1.81.997.89 1.833 1.166 2.093 1.296.26.13.411.109.564-.066.153-.175.656-.763.83-1.025.175-.262.35-.219.591-.131.242.088 1.534.723 1.797.854.262.131.438.197.503.307.066.11.066.634-.178 1.322z" />
                      </svg>
                    )
                  },
                  {
                    name: 'ایتا',
                    url: 'https://eitaa.com/galeriaventurin',
                    bg: 'bg-orange-600 hover:shadow-orange-500/20',
                    icon: <span className="text-[10px] font-black tracking-tighter">ایتا</span>
                  },
                  {
                    name: 'بله',
                    url: 'https://ble.ir/galeriaventurin',
                    bg: 'bg-teal-600 hover:shadow-teal-500/20',
                    icon: <span className="text-[10px] font-black tracking-tighter">بله</span>
                  },
                  {
                    name: 'روبیکا',
                    url: 'https://rubika.ir/galeriaventurin',
                    bg: 'bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 hover:shadow-purple-500/20',
                    icon: <span className="text-[10px] font-black tracking-tighter">روبیکا</span>
                  }
                ].map((social, idx) => (
                  <motion.a
                    key={idx}
                    href={social.url}
                    target="_blank"
                    rel="noreferrer"
                    whileHover={{ scale: 1.15, rotate: 5 }}
                    whileTap={{ scale: 0.95 }}
                    className={`flex h-9 w-9 items-center justify-center rounded-full text-white transition-all duration-300 shadow ${social.bg}`}
                    title={social.name}
                  >
                    {social.icon}
                  </motion.a>
                ))}
              </div>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="md:col-span-3 flex flex-col gap-4">
            <h3 className="font-bold text-white text-base relative inline-block after:content-[''] after:absolute after:bottom-[-6px] after:right-0 after:w-10 after:h-0.5 after:bg-gold-400">
              دسترسی سریع
            </h3>
            <ul className="flex flex-col gap-2.5 text-stone-400 text-sm mt-2">
              <li>
                <a href="#hero" className="hover:text-gold-400 transition-colors">صفحه اصلی</a>
              </li>
              <li>
                <a href="#shop-gallery" className="hover:text-gold-400 transition-colors">گالری محصولات</a>
              </li>
              <li>
                <a href="#about-sec" className="hover:text-gold-400 transition-colors">درباره آونتورین</a>
              </li>
              <li>
                <a href="#faq-sec" className="hover:text-gold-400 transition-colors">سوالات متداول</a>
              </li>
            </ul>
          </div>

          {/* Column 3: Contact & Info */}
          <div className="md:col-span-4 flex flex-col gap-4">
            <h3 className="font-bold text-white text-base relative inline-block after:content-[''] after:absolute after:bottom-[-6px] after:right-0 after:w-10 after:h-0.5 after:bg-gold-400">
              تماس با گالری
            </h3>
            <div className="flex flex-col gap-3 text-stone-400 text-sm mt-2">
              <div className="flex items-start gap-2">
                <MapPin size={16} className="text-gold-400 shrink-0 mt-0.5" />
                <span>مرکزی، محلات، میدان مصطفی خمینی، گالری اونتورین</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={16} className="text-gold-400 shrink-0" />
                <span className="font-en-nums">۰۹۳۹۹۳۱۱۸۷۵</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={16} className="text-gold-400 shrink-0" />
                <span>galeriaventurin@gmail.com</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-gold-400 shrink-0" />
                <span>ساعات کاری: ۱۰:۰۰ الی ۲۲:۰۰ همه روزه</span>
              </div>
            </div>
          </div>

        </div>

        {/* Middle trust indicators and badges */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-8 py-8 border-b border-stone-800">
          <div className="text-right">
            <h4 className="text-white font-medium text-sm">نمادهای اعتماد و کیفیت الکترونیک</h4>
            <p className="text-xs text-stone-500 mt-1">
              خرید کاملاً امن و ثبت‌شده تحت نظارت مراجع قانونی توسعه تجارت الکترونیکی کشور
            </p>
          </div>
          
          <div className="flex gap-4">
            {/* ENAMAD Clickable Widget */}
            <button
              onClick={() => openCert('enamad')}
              className="group relative flex h-24 w-24 flex-col items-center justify-center rounded-2xl bg-white p-2 border border-stone-200 hover:border-gold-400 transition-all duration-300 shadow-md cursor-pointer hover:scale-105"
              id="badge-enamad"
            >
              <div className="relative flex flex-col items-center justify-center">
                <span className="text-sky-600 font-extrabold text-[15px] font-sans">e</span>
                <span className="text-sky-700 font-extrabold text-xs">NAMAD</span>
                <span className="text-[10px] text-stone-400 mt-1">نماد اعتماد</span>
                <span className="absolute -top-1 -right-1 text-[8px] bg-sky-500 text-white rounded-full px-1 py-0.2">تایید شده</span>
              </div>
            </button>

            {/* SAMANDEHI Clickable Widget */}
            <button
              onClick={() => openCert('samandehi')}
              className="group relative flex h-24 w-24 flex-col items-center justify-center rounded-2xl bg-white p-2 border border-stone-200 hover:border-gold-400 transition-all duration-300 shadow-md cursor-pointer hover:scale-105"
              id="badge-samandehi"
            >
              <div className="relative flex flex-col items-center justify-center">
                <ShieldCheck className="text-emerald-600" size={28} />
                <span className="text-[10px] text-stone-500 font-bold mt-1">ساماندهی</span>
                <span className="text-[9px] text-stone-400">ستاد پایگاه‌ها</span>
                <span className="absolute -top-1 -right-1 text-[8px] bg-emerald-500 text-white rounded-full px-1 py-0.2">رسمی</span>
              </div>
            </button>
          </div>
        </div>

        {/* Footer Bottom copyright and scroll top */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 text-xs text-stone-500">
          <div className="flex items-center gap-1.5">
            <span>© ۱۴۰۵ تمامی حقوق برای</span>
            <span className="text-stone-300 font-medium">گالری اکسسوری آونتورین</span>
            <span>محفوظ است. طراحی شده با</span>
            <Heart size={12} className="text-rose-500 fill-rose-500 animate-pulse" />
          </div>

          <button
            onClick={handleScrollTop}
            className="flex items-center gap-1.5 rounded-full bg-stone-900 border border-stone-800 text-stone-400 hover:text-white px-3.5 py-1.5 text-xs transition-colors hover:border-gold-600/50"
            id="btn-scroll-top"
          >
            بازگشت به بالا
            <ArrowUp size={14} />
          </button>
        </div>

      </div>

      {/* Trust Certificates popups */}
      <AnimatePresence>
        {activeTrust && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveTrust(null)}
              className="absolute inset-0 bg-stone-950/80 backdrop-blur-sm"
            />

            {/* Certificate Window */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-md rounded-3xl bg-white p-6 text-stone-900 shadow-2xl border-2 border-gold-300 overflow-hidden"
              dir="rtl"
            >
              {/* Premium Top border */}
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-gold-600 to-gold-400" />

              <div className="flex flex-col items-center text-center mt-2">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gold-50 text-gold-600 mb-3 border border-gold-200">
                  <ShieldCheck size={32} />
                </div>
                
                {activeTrust === 'enamad' ? (
                  <>
                    <h3 className="text-lg font-bold text-stone-900">نماد اعتماد الکترونیکی دو ستاره</h3>
                    <p className="text-xs text-gold-600 font-medium">مرکز توسعه تجارت الکترونیکی وزارت صمت</p>
                    
                    <div className="w-full bg-stone-50 rounded-2xl p-4 my-5 text-right text-xs space-y-2.5 border border-stone-100">
                      <div className="flex justify-between">
                        <span className="text-stone-400">صاحب امتیاز:</span>
                        <span className="text-stone-800 font-semibold">گالری آونتورین (تحت مدیریت گالریا آونتورین)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-stone-400">رتبه اعتماد:</span>
                        <span className="text-emerald-600 font-bold">۲ ستاره (عالی)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-stone-400">کد رهگیری صمت:</span>
                        <span className="font-serif font-semibold text-stone-800">EN-2026-987441</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-stone-400">تاریخ صدور اعتبار:</span>
                        <span className="text-stone-800 font-semibold">۱۴۰۵/۰۲/۱۵</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-stone-400">نشانی فیزیکی:</span>
                        <span className="text-stone-800 text-left">مرکزی، محلات، میدان مصطفی خمینی، گالری اونتورین</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <h3 className="text-lg font-bold text-stone-900">نشان ملی ثبت رسانه‌های دیجیتال</h3>
                    <p className="text-xs text-gold-600 font-medium">مرکز فناوری اطلاعات و رسانه‌های دیجیتال وزارت ارشاد</p>
                    
                    <div className="w-full bg-stone-50 rounded-2xl p-4 my-5 text-right text-xs space-y-2.5 border border-stone-100">
                      <div className="flex justify-between">
                        <span className="text-stone-400">نوع پایگاه:</span>
                        <span className="text-stone-800 font-semibold">فروشگاهی - بدلیجات و اکسسوری</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-stone-400">وضعیت پایگاه:</span>
                        <span className="text-emerald-600 font-bold">تایید هویت شده و معتبر</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-stone-400">کد شامد (رسانه):</span>
                        <span className="font-serif font-semibold text-stone-800">1-1-789456-65-0-4</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-stone-400">مدیر مسئول:</span>
                        <span className="text-stone-800 font-semibold">گالری آونتورین</span>
                      </div>
                    </div>
                  </>
                )}

                <p className="text-[10px] text-stone-400 leading-normal mb-4">
                  این شناسنامه به صورت شبیه‌سازی در محیط آزمایشی صادر گردیده و نماینده صحت فرایندهای امنیتی پرداخت و اصالت کسب‌وکار گالری آونتورین می‌باشد.
                </p>

                <button
                  onClick={() => setActiveTrust(null)}
                  className="w-full rounded-xl bg-stone-900 hover:bg-stone-800 text-white py-2.5 text-sm font-semibold transition-colors"
                  id="btn-close-cert"
                >
                  بستن شناسنامه
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </footer>
  );
}
