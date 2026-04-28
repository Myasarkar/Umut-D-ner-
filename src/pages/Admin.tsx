import { useState, useEffect, useRef } from 'react';
import { LogOut, Plus, Trash2, Home, Check, RotateCcw, ChevronDown, ChevronUp, GripVertical, Layers } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Reorder, useDragControls } from 'framer-motion';
import { signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { auth, googleProvider, hasFirebaseConfig } from '../lib/firebase';
import logoUrl from '../assets/Umutdoner_Logo.png';
import {
  MenuItem, 
  getMenuItems, 
  addMenuItem, 
  updateMenuItem, 
  deleteMenuItem, 
  seedDefaultMenu 
} from '../lib/storage';

// Ürün Bileşeni
function DraggableItem({
  item,
  handleFieldChange,
  saveChanges,
  handleDelete,
  isSaving
}: {
  item: MenuItem;
  handleFieldChange: (id: string, field: keyof MenuItem, value: any) => void;
  saveChanges: (item: MenuItem) => void;
  handleDelete: (id: string) => void;
  isSaving: boolean;
}) {
  const dragControls = useDragControls();

  return (
    <Reorder.Item
      value={item}
      id={item.id}
      dragListener={false}
      dragControls={dragControls}
      className="bg-black/40 backdrop-blur-md p-5 rounded-2xl border border-gold-600/10 shadow-xl flex items-center gap-4 hover:border-gold-500/30 transition-colors"
    >
      <div
        className="cursor-grab active:cursor-grabbing text-neutral-600 hover:text-gold-500 p-2 -ml-2 transition-colors touch-none"
        onPointerDown={(e) => dragControls.start(e)}
      >
        <GripVertical size={24} />
      </div>

      <div className="flex-1 flex flex-col gap-3">
        <div className="flex justify-between items-start gap-4">
          <input
            className="bg-transparent border-b border-transparent focus:border-gold-500/50 outline-none text-lg font-bold text-gold-400 w-full transition-colors"
            value={item.name}
            onChange={(e) => handleFieldChange(item.id, 'name', e.target.value)}
            onBlur={() => saveChanges(item)}
          />
          <div className="flex items-center gap-1 bg-neutral-900 rounded-lg px-2 py-1 border border-gold-600/20">
            <input
              type="number"
              className="bg-transparent outline-none text-white font-bold w-14 text-right"
              value={item.price}
              onChange={(e) => handleFieldChange(item.id, 'price', Number(e.target.value))}
              onBlur={() => saveChanges(item)}
            />
            <span className="text-white text-xs">₺</span>
          </div>
        </div>

        <textarea
          className="bg-transparent border-b border-transparent focus:border-neutral-800 outline-none text-neutral-400 text-sm w-full resize-none leading-relaxed"
          rows={1}
          placeholder="Açıklama ekle..."
          value={item.description}
          onChange={(e) => handleFieldChange(item.id, 'description', e.target.value)}
          onBlur={() => saveChanges(item)}
        />

        <div className="flex justify-between items-center pt-3 border-t border-neutral-900/50">
          <label className="flex items-center gap-2 cursor-pointer scale-75 origin-left">
            <input
              type="checkbox"
              className="w-4 h-4 rounded border-neutral-800 text-gold-500 focus:ring-0 bg-transparent"
              checked={item.isAvailable}
              onChange={(e) => {
                handleFieldChange(item.id, 'isAvailable', e.target.checked);
                saveChanges({...item, isAvailable: e.target.checked});
              }}
            />
            <span className="text-xs text-neutral-500 uppercase font-bold">Satışta</span>
          </label>

          <div className="flex items-center gap-3">
            {isSaving && (
              <span className="text-gold-500 text-[10px] font-bold animate-pulse">KAYDEDİLDİ</span>
            )}
            <button onClick={() => handleDelete(item.id)} className="text-neutral-600 hover:text-red-500 transition p-1">
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      </div>
    </Reorder.Item>
  );
}

export default function Admin() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categoriesOrder, setCategoriesOrder] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!hasFirebaseConfig) {
      setIsLoading(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const adminEmailConfig = import.meta.env.VITE_ADMIN_EMAIL || '';
        const authorizedEmails = adminEmailConfig.split(',').map((email: string) => email.trim().toLowerCase());
        if (authorizedEmails.includes(currentUser.email?.toLowerCase() || '') || !adminEmailConfig) {
          setIsAuthorized(true);
          loadMenu();
        } else {
          setIsAuthorized(false);
          setIsLoading(false);
        }
      } else {
        setIsAuthorized(false);
        setIsLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const loadMenu = async () => {
    setIsLoading(true);
    try {
      const items = await getMenuItems();
      setMenuItems(items);

      const cats = Array.from(new Set(items.map(i => i.category)));
      setCategoriesOrder(cats);

      const expanded: Record<string, boolean> = {};
      cats.forEach(c => expanded[c] = true);
      setExpandedCategories(expanded);
    } catch (error) {
      console.error("Hata:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFieldChange = (id: string, field: keyof MenuItem, value: any) => {
    setMenuItems(items => items.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const saveChanges = async (item: MenuItem) => {
    setIsSaving(item.id);
    try {
      const { id, ...data } = item;
      await updateMenuItem(id, data);
      setTimeout(() => setIsSaving(null), 1000);
    } catch (error) {
      setIsSaving(null);
    }
  };

  const syncAllOrders = async (items: MenuItem[]) => {
    // Debounced Firebase Sync for all modified orders
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(async () => {
      for (const item of items) {
        const { id, ...data } = item;
        await updateMenuItem(id, data);
      }
    }, 2000);
  };

  const handleItemReorder = (category: string, newOrder: MenuItem[]) => {
    const otherItems = menuItems.filter(i => i.category !== category);
    const reorderedInCategory = newOrder.map((item, index) => ({ ...item, order: index }));

    // Recalculate global orders based on category list
    const finalItems: MenuItem[] = [];
    let currentGlobalOrder = 0;

    categoriesOrder.forEach(cat => {
      const categoryItems = cat === category ? reorderedInCategory : menuItems.filter(i => i.category === cat);
      categoryItems.forEach(item => {
        finalItems.push({ ...item, order: currentGlobalOrder++ });
      });
    });

    setMenuItems(finalItems);
    syncAllOrders(finalItems);
  };

  const handleCategoryReorder = (newCatOrder: string[]) => {
    setCategoriesOrder(newCatOrder);

    // Recalculate all items' global order based on new category sequence
    const finalItems: MenuItem[] = [];
    let currentGlobalOrder = 0;

    newCatOrder.forEach(cat => {
      const categoryItems = menuItems.filter(i => i.category === cat);
      categoryItems.forEach(item => {
        finalItems.push({ ...item, order: currentGlobalOrder++ });
      });
    });

    setMenuItems(finalItems);
    syncAllOrders(finalItems);
  };

  const handleAddNew = async (category?: string) => {
    const newItem = {
      name: 'Yeni Ürün',
      description: 'Açıklama...',
      price: 0,
      category: category || categoriesOrder[0] || 'Dönerler',
      isAvailable: true,
      order: menuItems.length
    };
    try {
      await addMenuItem(newItem);
      loadMenu();
    } catch (error) {
      alert("Eklenemedi");
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Bu ürünü silmek istediğinize emin misiniz?')) {
      try {
        await deleteMenuItem(id);
        loadMenu();
      } catch (error) {
        alert('Silinemedi');
      }
    }
  };

  if (isLoading && !user) {
    return <div className="min-h-screen bg-black flex items-center justify-center text-gold-500 font-sans">Yükleniyor...</div>;
  }

  if (!user || !isAuthorized) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 text-center font-sans">
        <img src={logoUrl} alt="Logo" className="h-16 mb-8" />
        <h1 className="text-2xl font-bold text-white mb-6">Yönetim Paneli</h1>
        {!user ? (
          <button onClick={() => signInWithPopup(auth, googleProvider)} className="bg-white text-black font-bold py-3 px-8 rounded-xl flex items-center gap-3">
             <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-6 h-6" alt="" />
             Google ile Giriş Yap
          </button>
        ) : (
          <p className="text-red-500 italic">Yetkisiz Erişim: {user.email}</p>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#111] text-[#E0E0E0] font-sans pb-40 overflow-x-hidden">
      <header className="fixed top-0 inset-x-0 bg-black/80 backdrop-blur-md border-b border-gold-600/30 z-50 py-3 px-4 flex justify-between items-center shadow-md">
        <div className="flex items-center gap-4">
          <Link to="/" className="text-gold-500 p-2 bg-neutral-900/50 rounded-full hover:bg-neutral-800 transition">
            <Home size={20} />
          </Link>
          <span className="font-bold text-gold-500 text-sm tracking-widest uppercase">Yönetici</span>
        </div>
        <img src={logoUrl} alt="Logo" className="h-12 object-contain" />
        <button onClick={() => signOut(auth)} className="p-2 text-neutral-400 hover:text-umutred-600 transition">
          <LogOut size={20} />
        </button>
      </header>

      <main className="max-w-3xl mx-auto mt-24 px-4">
        {/* Kategori Sürükleme Grubu */}
        <Reorder.Group axis="y" values={categoriesOrder} onReorder={handleCategoryReorder} className="space-y-12">
          {categoriesOrder.map((category) => (
            <Reorder.Item key={category} value={category} className="relative">
              {/* Kategori Başlığı (Sürükleme Tutamacı ile) */}
              <div
                className="flex justify-between items-center bg-neutral-900/90 p-4 rounded-xl border border-gold-600/30 mb-4 sticky top-20 z-30 backdrop-blur-md"
              >
                <div className="flex items-center gap-3">
                  <div className="cursor-grab active:cursor-grabbing text-gold-600 hover:text-gold-400 p-1">
                    <Layers size={22} />
                  </div>
                  <div className="flex items-center gap-2 cursor-pointer" onClick={() => setExpandedCategories(p => ({...p, [category]: !p[category]}))}>
                    {expandedCategories[category] ? <ChevronUp size={18} className="text-neutral-500" /> : <ChevronDown size={18} className="text-neutral-500" />}
                    <h2 className="text-lg font-bold text-white uppercase tracking-widest">{category}</h2>
                  </div>
                </div>
                <button
                  onClick={() => handleAddNew(category)}
                  className="text-gold-500 hover:bg-gold-500/10 p-2 rounded-lg transition"
                >
                  <Plus size={20} />
                </button>
              </div>

              {/* Kategori İçindeki Ürünler Sürükleme Grubu */}
              {expandedCategories[category] && (
                <Reorder.Group
                  axis="y"
                  values={menuItems.filter(i => i.category === category)}
                  onReorder={(newOrder) => handleItemReorder(category, newOrder)}
                  className="space-y-4 px-2"
                >
                  {menuItems.filter(i => i.category === category).map((item) => (
                    <DraggableItem
                      key={item.id}
                      item={item}
                      handleFieldChange={handleFieldChange}
                      saveChanges={saveChanges}
                      handleDelete={handleDelete}
                      isSaving={isSaving === item.id}
                    />
                  ))}
                </Reorder.Group>
              )}
            </Reorder.Item>
          ))}
        </Reorder.Group>

        {menuItems.length === 0 && !isLoading && (
          <div className="text-center py-20 bg-neutral-900/30 rounded-3xl border border-dashed border-neutral-800 mt-10">
            <p className="text-neutral-500 mb-6 font-medium">Menü boş.</p>
            <button onClick={() => seedDefaultMenu().then(loadMenu)} className="bg-gold-500 text-black px-6 py-3 rounded-xl font-bold flex items-center gap-2 mx-auto">
              <RotateCcw size={20} /> VARSAYILAN MENÜYÜ YÜKLE
            </button>
          </div>
        )}

        <button
          onClick={() => handleAddNew()}
          className="fixed bottom-10 right-10 bg-gold-500 text-black w-14 h-14 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform active:scale-95 z-50 border-4 border-black"
        >
          <Plus size={32} />
        </button>
      </main>

      <div className="fixed bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black to-transparent pointer-events-none">
         <p className="text-center text-[10px] text-neutral-600 pointer-events-auto">Kategorileri sol taraftaki ikonlardan tutup sürükleyebilirsiniz.</p>
      </div>
    </div>
  );
}
