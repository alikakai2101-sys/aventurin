import React, { useState } from 'react';
import { ShoppingBag, Menu, X, User, Search, Heart, Sparkles, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface HeaderProps {
  cartCount: number;
  onCartClick: () => void;
  onAdminClick: () => void;
  onHomeClick: () => void;
  onCategorySelect: (category: string | null) => void;
  activeCategory: string | null;
  currentView: 'shop' | 'admin';
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onHandmadesClick?: () => void;
  onAboutClick?: () => void;
  onContactClick?: () => void;
  userView?: string;
}

export default function Header({
  cartCount,
  onCartClick,
  onAdminClick,
  onHomeClick,
  onCategorySelect,
  activeCategory,
  currentView,
  searchTerm,
  setSearchTerm,
  onHandmadesClick,
  onAboutClick,
  onContactClick,
  userView,
}: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const handleCategoryClick = (catId: string) => {
    onCategorySelect(catId === 'all' ? null : catId);
    onHomeClick(); // Switch to shop view
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-850 bg-slate-950 shadow-md transition-all duration-300">
      {/* Top Banner Alert */}
      <div className="bg-gradient-to-r from-gold-700 via-gold-500 to-gold-800 text-stone-50 text-xs py-1.5 px-4 text-center font-medium tracking-wide">
        ✨ ارسال رایگان برای خریدهای بالای ۵۰۰ هزار تومان + هدیه ویژه گالری آونتورین ✨
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          
          {/* Right section: Logo and Brand Name */}
          <div className="flex items-center gap-4">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="rounded-full p-2 text-slate-300 hover:bg-slate-800 hover:text-gold-400 focus:outline-none lg:hidden"
              aria-label="منو"
              id="btn-mobile-menu"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            <div 
              onClick={() => {
                onHomeClick();
                onCategorySelect(null);
              }}
              className="flex cursor-pointer items-center gap-2 group"
            >
              <div className="relative flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-tr from-gold-600 to-gold-400 p-0.5 shadow-md shadow-gold-500/20 transition-transform duration-300 group-hover:rotate-12 overflow-hidden">
                <img 
                  src="/src/assets/images/aventurin_logo_1784399850455.jpg" 
                  alt="Aventurin" 
                  className="h-full w-full object-cover rounded-full"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div>
                <h1 className="font-serif text-lg font-bold tracking-tight text-slate-100 sm:text-2xl">
                  گالری <span className="text-gold-400 font-extrabold">آونتورین</span>
                </h1>
                <p className="text-[10px] text-slate-400 tracking-wider font-light -mt-1 hidden sm:block">
                  AVENTURIN ACCESSORIES
                </p>
              </div>
            </div>
          </div>

          {/* Center section: Main Navigation (Desktop) */}
          <nav className="hidden lg:flex items-center gap-1.5">
            {/* 1. Handmade Crafts */}
            <button
              onClick={() => {
                if (onHandmadesClick) onHandmadesClick();
              }}
              className={`relative rounded-xl px-4.5 py-2 text-sm font-bold transition-all duration-300 flex items-center gap-1.5 cursor-pointer ${
                userView === 'handmades'
                  ? 'text-gold-400 bg-slate-800 border border-slate-700/80 shadow-md shadow-black/20'
                  : 'text-slate-200 hover:text-gold-400 hover:bg-slate-800/40'
              }`}
              id="nav-handmades"
            >
              <Sparkles size={14} className="text-gold-400 animate-pulse" />
              <span>طراحی و سفارش دست‌ساز</span>
              {userView === 'handmades' && (
                <motion.div
                  layoutId="activeIndicator"
                  className="absolute bottom-0 left-4 right-4 h-0.5 bg-gold-400"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
            </button>

            {/* 2. About Us */}
            <button
              onClick={() => {
                if (onAboutClick) onAboutClick();
              }}
              className={`relative rounded-xl px-4.5 py-2 text-sm font-bold transition-all duration-300 cursor-pointer ${
                userView === 'about'
                  ? 'text-gold-400 bg-slate-800 border border-slate-700/80 shadow-md shadow-black/20'
                  : 'text-slate-200 hover:text-gold-400 hover:bg-slate-800/40'
              }`}
              id="nav-about"
            >
              <span>درباره ما</span>
              {userView === 'about' && (
                <motion.div
                  layoutId="activeIndicator"
                  className="absolute bottom-0 left-4 right-4 h-0.5 bg-gold-400"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
            </button>

            {/* 3. Contact Us */}
            <button
              onClick={() => {
                if (onContactClick) onContactClick();
              }}
              className={`relative rounded-xl px-4.5 py-2 text-sm font-bold transition-all duration-300 cursor-pointer ${
                userView === 'contact'
                  ? 'text-gold-400 bg-slate-800 border border-slate-700/80 shadow-md shadow-black/20'
                  : 'text-slate-200 hover:text-gold-400 hover:bg-slate-800/40'
              }`}
              id="nav-contact"
            >
              <span>تماس با ما</span>
              {userView === 'contact' && (
                <motion.div
                  layoutId="activeIndicator"
                  className="absolute bottom-0 left-4 right-4 h-0.5 bg-gold-400"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
            </button>
          </nav>

          {/* Left section: Actions */}
          <div className="flex items-center gap-1 sm:gap-3">
            {/* Search toggler */}
            <div className="relative">
              <div className={`flex items-center overflow-hidden rounded-full border bg-slate-950 transition-all duration-300 ${
                isSearchOpen ? 'w-48 sm:w-64 px-3 border-gold-500/50 shadow-lg shadow-gold-500/5' : 'w-10 h-10 border-transparent bg-transparent'
              }`}>
                <button
                  onClick={() => setIsSearchOpen(!isSearchOpen)}
                  className="flex h-10 w-10 items-center justify-center text-slate-300 hover:text-gold-400 transition-colors"
                  id="btn-search-toggle"
                >
                  <Search size={20} />
                </button>
                {isSearchOpen && (
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="جستجو در زیورآلات..."
                    className="w-full bg-transparent py-1 text-sm text-slate-100 outline-none placeholder:text-slate-500"
                    dir="rtl"
                    autoFocus
                  />
                )}
              </div>
            </div>

            {/* Admin Panel / User Profile Toggle */}
            <button
              onClick={onAdminClick}
              className={`flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium transition-all duration-300 ${
                currentView === 'admin'
                  ? 'bg-slate-800 text-gold-400 border border-slate-700 shadow-md'
                  : 'text-slate-300 hover:text-gold-400 hover:bg-slate-800/40'
              }`}
              title="پنل مدیریت / حساب کاربری"
              id="btn-admin-panel"
            >
              <User size={20} className={currentView === 'admin' ? 'text-gold-400 animate-pulse' : ''} />
              <span className="hidden md:inline">
                {currentView === 'admin' ? 'بازگشت به فروشگاه' : 'ورود / پنل مدیریت'}
              </span>
            </button>

            {/* Cart Trigger */}
            <button
              onClick={onCartClick}
              className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-gold-500/10 border border-gold-500/20 text-gold-400 shadow-lg hover:bg-gold-500/20 hover:scale-105 active:scale-95 transition-all duration-300"
              id="btn-shopping-cart"
            >
              <ShoppingBag size={20} className="stroke-[2.5]" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow animate-bounce">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 z-40 bg-slate-950/70 lg:hidden"
            />

            {/* Drawer container */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed bottom-0 right-0 top-0 z-50 w-72 bg-slate-950 p-6 shadow-2xl border-l border-slate-850 lg:hidden flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
                  <div className="flex items-center gap-2">
                    <img 
                      src="/src/assets/images/aventurin_logo_1784399850455.jpg" 
                      alt="Aventurin Gallery" 
                      className="h-8 w-8 rounded-full object-cover border border-gold-500/30"
                      referrerPolicy="no-referrer"
                    />
                    <span className="font-bold text-slate-100 font-serif text-sm">منوی گالری</span>
                  </div>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="rounded-full p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-100"
                    id="btn-close-mobile-menu"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="flex flex-col gap-2.5">
                  {/* Mobile Handmade jewelry link */}
                  <button
                    onClick={() => {
                      if (onHandmadesClick) {
                        onHandmadesClick();
                      }
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full rounded-xl px-4 py-3.5 text-right text-sm font-bold transition-all duration-200 flex items-center justify-between cursor-pointer ${
                      userView === 'handmades'
                        ? 'bg-gold-500 text-slate-950 font-black'
                        : 'text-slate-200 bg-slate-900 hover:bg-slate-805 hover:text-gold-400'
                    }`}
                    id="mob-handmades"
                  >
                    <span>طراحی و سفارش دست‌ساز</span>
                    <Sparkles size={16} className={userView === 'handmades' ? 'text-slate-950' : 'text-gold-400 animate-pulse'} />
                  </button>

                  {/* Mobile About link */}
                  <button
                    onClick={() => {
                      if (onAboutClick) {
                        onAboutClick();
                      }
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full rounded-xl px-4 py-3.5 text-right text-sm font-bold transition-all duration-200 flex items-center justify-between cursor-pointer ${
                      userView === 'about'
                        ? 'bg-gold-500 text-slate-950 font-black'
                        : 'text-slate-200 bg-slate-900 hover:bg-slate-805 hover:text-gold-400'
                    }`}
                    id="mob-about"
                  >
                    <span>درباره ما</span>
                  </button>

                  {/* Mobile Contact link */}
                  <button
                    onClick={() => {
                      if (onContactClick) {
                        onContactClick();
                      }
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full rounded-xl px-4 py-3.5 text-right text-sm font-bold transition-all duration-200 flex items-center justify-between cursor-pointer ${
                      userView === 'contact'
                        ? 'bg-gold-500 text-slate-950 font-black'
                        : 'text-slate-200 bg-slate-900 hover:bg-slate-805 hover:text-gold-400'
                    }`}
                    id="mob-contact"
                  >
                    <span>تماس با ما</span>
                  </button>
                </div>
              </div>

              {/* Quick Info Box at bottom of drawer */}
              <div className="border-t border-slate-800 pt-6 text-xs text-slate-400 flex flex-col gap-2.5">
                <div className="flex items-start gap-2">
                  <MapPin size={14} className="text-gold-400 mt-0.5 shrink-0" />
                  <span className="leading-relaxed">مرکزی، محلات، میدان مصطفی خمینی، گالری اونتورین</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                  <span>ساعات کاری: ۱۰ صبح الی ۱۰ شب</span>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
