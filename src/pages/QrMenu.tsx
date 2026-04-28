import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import logoUrl from '../assets/Umutdoner_Logo.png';
import { getMenuItems, MenuItem } from '../lib/storage';

export default function QrMenu() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMenu() {
      try {
        const items = await getMenuItems();
        const availableItems = items.filter(item => item.isAvailable);
        const cats = Array.from(new Set(availableItems.map(item => item.category)));
        setMenuItems(availableItems);
        setCategories(cats);
      } catch (error) {
        console.error("Menü yüklenirken hata oluştu:", error);
      } finally {
        setLoading(false);
      }
    }
    loadMenu();
  }, []);

  const nextCategory = () => {
    if (currentCategoryIndex < categories.length - 1) setCurrentCategoryIndex(currentCategoryIndex + 1);
  };

  const prevCategory = () => {
    if (currentCategoryIndex > 0) setCurrentCategoryIndex(currentCategoryIndex - 1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin text-gold-500">
           <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24">
             <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
             <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
           </svg>
        </div>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="min-h-screen bg-neutral-900 text-white flex flex-col items-center justify-center p-4 text-center">
        <img src={logoUrl} alt="Logo" className="h-20 mb-6" />
        <p className="text-neutral-400 text-lg">Menü yakında eklenecektir veya yüklenemedi.</p>
        <Link to="/" className="mt-8 text-gold-500 flex items-center gap-2 hover:text-gold-400">
           <Home size={20} /> Ana Sayfaya Dön
        </Link>
      </div>
    );
  }

  const currentCategory = categories[currentCategoryIndex];
  const itemsInCurrentCategory = menuItems.filter(item => item.category === currentCategory);

  const getCategoryBackground = (category: string) => {
    const cat = category.toLowerCase().trim();

    // Et Döner
    if (cat.includes('et d')) return 'https://i.pinimg.com/1200x/0f/d8/2c/0fd82cc19c5142bd469562bf465d5dcd.jpg';

    // Tavuk Döner
    if (cat.includes('tavuk d')) return 'https://i.pinimg.com/736x/95/30/31/953031a5a9a4f5a98b695ae4fc21e173.jpg';

    // Kebap
    if (cat.includes('kebap')) return 'https://i.pinimg.com/1200x/02/61/4f/02614f78d76f6415cb97d691c90dd1ee.jpg';

    // Sulu Yemek
    if (cat.includes('sulu') || cat.includes('yemek')) return 'https://images.unsplash.com/photo-1547592166-23ac45744acd?q=80&w=2000&auto=format&fit=crop';

    // Meze
    if (cat.includes('meze') || cat.includes('soğuk')) return 'https://images.unsplash.com/photo-1541529086526-db283c563270?q=80&w=2000&auto=format&fit=crop';

    // İçecekler
    if (cat.includes('içecek') || cat.includes('kola') || cat.includes('ayran')) return 'https://images.unsplash.com/photo-1544145945-f904253d0c7b?q=80&w=2000&auto=format&fit=crop';

    // Varsayılan
    return 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2000&auto=format&fit=crop';
  };

  const bgImage = getCategoryBackground(currentCategory);

  return (
    <div className="min-h-screen bg-black text-[#E0E0E0] overflow-hidden flex flex-col font-sans relative">
      {/* Full Page Dynamic Background - Fixed for whole view */}
      <div className="fixed inset-0 z-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={bgImage}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0"
          >
            <img src={bgImage} alt="" className="w-full h-full object-cover brightness-[0.5] contrast-125" />
            <div className="absolute inset-0 bg-black/30" />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Header */}
      <header className="fixed top-0 inset-x-0 bg-black/80 backdrop-blur-md border-b border-gold-600/30 z-50 shadow-md">
        <div className="py-3 px-4 flex justify-between items-center">
          <Link to="/" className="text-gold-500 p-2 bg-neutral-900/50 rounded-full hover:bg-neutral-800 transition">
            <Home size={20} />
          </Link>
          <div className="text-center">
            <img src={logoUrl} alt="Umut Döner" className="h-14 mx-auto object-contain" />
          </div>
          <div className="w-10"></div>
        </div>

        {/* Category Navigation Bar */}
        <div className="flex overflow-x-auto no-scrollbar py-2 px-4 gap-4 border-t border-gold-600/10 bg-black/60">
          {categories.map((cat, idx) => (
            <button
              key={cat}
              onClick={() => setCurrentCategoryIndex(idx)}
              className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-bold transition-all uppercase tracking-wider ${
                idx === currentCategoryIndex
                ? 'bg-gold-500 text-black shadow-lg'
                : 'bg-black/40 text-neutral-400 border border-neutral-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </header>

      {/* Content Container */}
      <main className="flex-1 mt-36 pt-6 pb-24 px-4 max-w-lg mx-auto w-full flex flex-col relative z-10">
        <div className="flex justify-between items-center mb-6 px-4">
          <button 
             onClick={prevCategory} 
             disabled={currentCategoryIndex === 0}
             className="p-2 text-gold-500 disabled:opacity-30 hover:bg-neutral-800 rounded-full transition"
          >
            <ChevronLeft size={28} />
          </button>
          
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white uppercase tracking-widest drop-shadow-lg">{currentCategory}</h2>
            <div className="h-0.5 w-12 bg-umutred-600 mx-auto mt-2 shadow-lg"></div>
          </div>
          
          <button 
             onClick={nextCategory} 
             disabled={currentCategoryIndex === categories.length - 1}
             className="p-2 text-gold-500 disabled:opacity-30 hover:bg-neutral-800 rounded-full transition"
          >
            <ChevronRight size={28} />
          </button>
        </div>

        <div className="relative flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentCategoryIndex}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
              className="space-y-4 bg-black/50 backdrop-blur-md p-4 md:p-6 rounded-2xl border border-gold-600/20 min-h-[400px] shadow-2xl"
            >
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                 <img src={logoUrl} alt="" className="w-32 h-32 object-contain grayscale" />
              </div>
              {itemsInCurrentCategory.map(item => (
                <div key={item.id} className="flex flex-col gap-1 border-b border-dashed border-neutral-700/50 pb-3 last:border-0 last:pb-0 relative z-10">
                  <div className="flex justify-between items-start gap-4">
                    <h3 className="font-bold text-lg text-gold-400 leading-tight tracking-wide drop-shadow-md">{item.name}</h3>
                    <div className="font-bold text-lg text-white whitespace-nowrap bg-neutral-900/60 px-2 py-0.5 border border-gold-600/30 rounded-lg shadow-md">
                      {item.price} ₺
                    </div>
                  </div>
                  {item.description && (
                    <p className="text-neutral-300 text-sm leading-relaxed drop-shadow-md">{item.description}</p>
                  )}
                </div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Page Indicator */}
      <div className="fixed bottom-6 inset-x-0 flex justify-center items-center gap-2 z-40">
        {categories.map((_, idx) => (
          <button 
             key={idx}
             onClick={() => setCurrentCategoryIndex(idx)}
             className={`h-2 rounded-full transition-all duration-300 ${idx === currentCategoryIndex ? 'w-8 bg-gold-500' : 'w-2 bg-neutral-700'}`}
             aria-label={`Go to page ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
