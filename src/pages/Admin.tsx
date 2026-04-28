import { useState, useEffect } from 'react';
import { LogOut, Plus, Trash2, Save, Utensils, Home, Check, RotateCcw } from 'lucide-react';
import { Link } from 'react-router-dom';
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

export default function Admin() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isSaving, setIsSaving] = useState<string | null>(null);

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
      alert("Kaydedilemedi");
      setIsSaving(null);
    }
  };

  const handleAddNew = async () => {
    const newItem = {
      name: 'Yeni Ürün',
      description: 'Açıklama yazın...',
      price: 0,
      category: menuItems[0]?.category || 'Dönerler',
      isAvailable: true,
      order: menuItems.length + 1
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
    return <div className="min-h-screen bg-black flex items-center justify-center text-gold-500">Yükleniyor...</div>;
  }

  if (!user || !isAuthorized) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
        <div className="bg-neutral-900 p-8 rounded-2xl border border-neutral-800 text-center max-w-md w-full shadow-2xl">
           <img src={logoUrl} alt="Logo" className="h-16 mx-auto mb-8" />
           <h1 className="text-2xl font-bold text-white mb-6">Yönetim Paneli</h1>
           {!user ? (
             <button onClick={() => signInWithPopup(auth, googleProvider)} className="w-full bg-white text-black font-bold py-3 rounded-xl flex items-center justify-center gap-3">
               <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-6 h-6" alt="" />
               Google ile Giriş Yap
             </button>
           ) : (
             <p className="text-red-500 italic">Yetkisiz Erişim: {user.email}</p>
           )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#111] text-[#E0E0E0] font-sans">
      <header className="fixed top-0 inset-x-0 bg-black/80 backdrop-blur-md border-b border-gold-600/30 z-50 py-3 px-4 flex justify-between items-center shadow-md">
        <div className="flex items-center gap-4">
          <Link to="/" className="text-gold-500 p-2 bg-neutral-900/50 rounded-full hover:bg-neutral-800 transition">
            <Home size={20} />
          </Link>
          <span className="font-bold text-gold-500 hidden sm:block">DÜZENLEME MODU</span>
        </div>
        <img src={logoUrl} alt="Logo" className="h-12 object-contain" />
        <button onClick={() => signOut(auth)} className="p-2 text-neutral-400 hover:text-umutred-600 transition">
          <LogOut size={20} />
        </button>
      </header>

      <main className="max-w-3xl mx-auto mt-24 px-4 pb-32">
        <div className="flex justify-between items-center mb-8 bg-neutral-900/50 p-4 rounded-xl border border-gold-600/20">
          <h2 className="text-xl font-bold text-white uppercase tracking-widest">Menü Listesi</h2>
          <button onClick={handleAddNew} className="bg-gold-500 text-black px-4 py-2 rounded-lg font-bold flex items-center gap-2 text-sm">
            <Plus size={18} /> YENİ EKLE
          </button>
        </div>

        <div className="space-y-6">
          {menuItems.map((item) => (
            <div key={item.id} className="bg-black/40 backdrop-blur-md p-5 rounded-2xl border border-gold-600/20 shadow-xl relative group">
              <div className="flex flex-col gap-4">
                {/* Ürün Adı ve Fiyat - Doğrudan Düzenlenebilir */}
                <div className="flex justify-between items-start gap-4">
                  <input
                    className="bg-transparent border-b border-transparent focus:border-gold-500/50 outline-none text-xl font-bold text-gold-400 w-full transition-colors"
                    value={item.name}
                    onChange={(e) => handleFieldChange(item.id, 'name', e.target.value)}
                    onBlur={() => saveChanges(item)}
                  />
                  <div className="flex items-center gap-2 bg-neutral-900 rounded-lg px-2 py-1 border border-gold-600/20">
                    <input
                      type="number"
                      className="bg-transparent outline-none text-white font-bold w-16 text-right"
                      value={item.price}
                      onChange={(e) => handleFieldChange(item.id, 'price', e.target.value)}
                      onBlur={() => saveChanges(item)}
                    />
                    <span className="text-white">₺</span>
                  </div>
                </div>

                {/* Açıklama */}
                <textarea
                  className="bg-transparent border-b border-transparent focus:border-neutral-700 outline-none text-neutral-400 text-sm w-full resize-none leading-relaxed"
                  rows={2}
                  value={item.description}
                  onChange={(e) => handleFieldChange(item.id, 'description', e.target.value)}
                  onBlur={() => saveChanges(item)}
                />

                {/* Alt Bilgiler */}
                <div className="flex flex-wrap justify-between items-center pt-4 border-t border-neutral-800/50 gap-4">
                  <div className="flex items-center gap-4">
                    <input
                      className="bg-neutral-900 border border-neutral-800 rounded px-2 py-1 text-xs font-bold text-neutral-500 uppercase outline-none focus:border-gold-500/30"
                      value={item.category}
                      onChange={(e) => handleFieldChange(item.id, 'category', e.target.value)}
                      onBlur={() => saveChanges(item)}
                    />
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded border-neutral-800 text-gold-500 focus:ring-0 focus:ring-offset-0 bg-transparent"
                        checked={item.isAvailable}
                        onChange={(e) => {
                          handleFieldChange(item.id, 'isAvailable', e.target.checked);
                          saveChanges({...item, isAvailable: e.target.checked});
                        }}
                      />
                      <span className="text-xs text-neutral-500 uppercase">Satışta</span>
                    </label>
                  </div>

                  <div className="flex items-center gap-2">
                    {isSaving === item.id ? (
                      <span className="text-gold-500 text-xs animate-pulse flex items-center gap-1">
                        <Check size={14} /> KAYDEDİLDİ
                      </span>
                    ) : null}
                    <button onClick={() => handleDelete(item.id)} className="p-2 text-neutral-600 hover:text-red-500 transition">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {menuItems.length === 0 && (
          <div className="text-center py-20 bg-neutral-900/30 rounded-3xl border border-dashed border-neutral-800">
            <p className="text-neutral-500 mb-6 font-medium">Menüde ürün bulunmuyor.</p>
            <button onClick={() => seedDefaultMenu().then(loadMenu)} className="bg-gold-500 text-black px-6 py-3 rounded-xl font-bold flex items-center gap-2 mx-auto">
              <RotateCcw size={20} /> VARSAYILAN MENÜYÜ YÜKLE
            </button>
          </div>
        )}
      </main>

      <div className="fixed bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black to-transparent pointer-events-none">
         <p className="text-center text-[10px] text-neutral-600 pointer-events-auto">Değişiklikler otomatik kaydedilir.</p>
      </div>
    </div>
  );
}
