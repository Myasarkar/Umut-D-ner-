import { useState, useEffect } from 'react';
import { LogOut, Plus, Edit2, Trash2, Save, X, Utensils } from 'lucide-react';
import { Link } from 'react-router-dom';
import { signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';
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
  const [editingItem, setEditingItem] = useState<Partial<MenuItem> | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        // Check if the user email is authorized
        const adminEmail = import.meta.env.VITE_ADMIN_EMAIL;
        if (currentUser.email === adminEmail || !adminEmail) {
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
      console.error("Menü yüklenirken hata oluştu:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Giriş hatası:", error);
      alert('Giriş yapılamadı.');
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Çıkış hatası:", error);
    }
  };

  const handleSeedMenu = async () => {
    if (window.confirm('Bu işlem mevcut menüyü silip varsayılan menüyü yükleyecektir. Onaylıyor musunuz?')) {
      setIsLoading(true);
      try {
        await seedDefaultMenu();
        await loadMenu();
        alert('Örnek menü başarıyla yüklendi!');
      } catch (error) {
        alert('Menü yüklenirken bir hata oluştu.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    
    setIsLoading(true);
    try {
      const itemData = {
        name: editingItem.name || '',
        description: editingItem.description || '',
        price: Number(editingItem.price) || 0,
        category: editingItem.category || '',
        isAvailable: editingItem.isAvailable !== false,
        order: Number(editingItem.order) || 0
      };

      if (editingItem.id) {
        await updateMenuItem(editingItem.id, itemData);
      } else {
        await addMenuItem(itemData);
      }

      setEditingItem(null);
      await loadMenu();
    } catch (error) {
      alert('Kaydetme sırasında bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Bu ürünü silmek istediğinize emin misiniz?')) {
      setIsLoading(true);
      try {
        await deleteMenuItem(id);
        await loadMenu();
      } catch (error) {
        alert('Silme işlemi başarısız oldu.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  if (isLoading && !user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-umutred-600"></div>
      </div>
    );
  }

  if (!user || !isAuthorized) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center font-sans">
        <div className="bg-neutral-900 p-8 rounded-2xl border border-neutral-800 text-center max-w-md w-full mx-4 shadow-2xl">
           <img src={logoUrl} alt="Umut Döner" className="h-16 mx-auto mb-8" />
           <h1 className="text-2xl font-bold text-white mb-2">Yönetim Paneli</h1>

           {!user ? (
             <>
               <p className="text-neutral-400 mb-8">Devam etmek için Google hesabınızla giriş yapın.</p>
               <button
                 onClick={handleLogin}
                 className="w-full bg-white text-black font-bold py-3 rounded-xl hover:bg-neutral-200 transition shadow-lg flex items-center justify-center gap-3"
               >
                 <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-6 h-6" alt="" />
                 Google ile Giriş Yap
               </button>
             </>
           ) : (
             <>
               <p className="text-red-500 mb-6">Bu e-posta adresi yetkili değil: <br/><span className="font-mono text-sm">{user.email}</span></p>
               <button onClick={handleLogout} className="text-neutral-400 hover:text-white underline text-sm">Farklı bir hesapla dene</button>
             </>
           )}
           
           <p className="mt-8 text-xs text-neutral-500">
             Yetkisiz erişimler kayıt altına alınmaktadır.
           </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 font-sans">
      <header className="bg-white shadow border-b border-neutral-200">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2">
            <img src={logoUrl} alt="Logo" className="h-14 object-contain drop-shadow-md" />
            <span className="font-bold text-neutral-800 text-xl hidden sm:block">Yönetim Paneli</span>
          </Link>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-sm font-bold text-neutral-800">{user.displayName}</span>
              <span className="text-xs text-neutral-500">{user.email}</span>
            </div>
            <button onClick={handleLogout} className="p-2 text-neutral-400 hover:text-umutred-600 hover:bg-red-50 rounded-lg transition" title="Çıkış Yap">
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-neutral-900">Menü Yönetimi</h2>
          <button 
             onClick={() => setEditingItem({ name: '', description: '', price: 0, category: 'Dönerler', isAvailable: true, order: menuItems.length })}
             className="bg-neutral-900 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-neutral-800 transition"
          >
             <Plus size={18} /> Yeni Ürün
          </button>
        </div>

        {/* Form Modal */}
        {editingItem && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
              <div className="p-4 border-b border-neutral-100 flex justify-between items-center bg-neutral-50">
                <h3 className="font-bold text-lg text-neutral-800">{editingItem.id ? 'Ürünü Düzenle' : 'Yeni Ürün'}</h3>
                <button onClick={() => setEditingItem(null)} className="text-neutral-400 hover:text-neutral-800 p-1 rounded-md transition">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleSave} className="p-6 space-y-4 overflow-y-auto">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Ürün Adı *</label>
                  <input required type="text" className="w-full border border-neutral-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-neutral-900 focus:border-neutral-900 outline-none transition" 
                    value={editingItem.name || ''} onChange={e => setEditingItem({...editingItem, name: e.target.value})} 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Kategori *</label>
                  <input required type="text" placeholder="Örn: Dönerler, İçecekler" className="w-full border border-neutral-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-neutral-900 focus:border-neutral-900 outline-none transition" 
                    value={editingItem.category || ''} onChange={e => setEditingItem({...editingItem, category: e.target.value})} 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Açıklama</label>
                  <textarea className="w-full border border-neutral-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-neutral-900 focus:border-neutral-900 outline-none transition" rows={2}
                    value={editingItem.description || ''} onChange={e => setEditingItem({...editingItem, description: e.target.value})} 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">Fiyat (₺) *</label>
                    <input required type="number" min="0" step="0.5" className="w-full border border-neutral-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-neutral-900 focus:border-neutral-900 outline-none transition" 
                      value={editingItem.price || 0} onChange={e => setEditingItem({...editingItem, price: Number(e.target.value)})} 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">Sıra *</label>
                    <input required type="number" className="w-full border border-neutral-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-neutral-900 focus:border-neutral-900 outline-none transition" 
                      value={editingItem.order || 0} onChange={e => setEditingItem({...editingItem, order: Number(e.target.value)})} 
                    />
                  </div>
                </div>
                <div className="pt-2">
                   <label className="flex items-center gap-3 cursor-pointer">
                     <input type="checkbox" className="w-5 h-5 rounded text-neutral-900 focus:ring-neutral-900 border-neutral-300" 
                        checked={editingItem.isAvailable !== false} 
                        onChange={e => setEditingItem({...editingItem, isAvailable: e.target.checked})} 
                     />
                     <span className="font-medium text-neutral-700">Müsait (Satışta)</span>
                   </label>
                </div>
                
                <div className="pt-4 border-t border-neutral-100 flex justify-end gap-3">
                  <button type="button" onClick={() => setEditingItem(null)} className="px-5 py-2 font-medium text-neutral-600 hover:bg-neutral-100 rounded-lg transition">İptal</button>
                  <button type="submit" disabled={isLoading} className="px-5 py-2 font-medium text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg transition flex items-center gap-2 disabled:opacity-50">
                    <Save size={18} /> {isLoading ? 'Kaydediliyor...' : 'Kaydet'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden">
          <div className="overflow-x-auto">
            {isLoading && !editingItem ? (
              <div className="p-12 text-center text-neutral-500">Veriler yükleniyor...</div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-neutral-50 text-neutral-500 text-sm border-b border-neutral-200">
                    <th className="px-6 py-4 font-medium">Sıra/Kategori</th>
                    <th className="px-6 py-4 font-medium">Ürün Adı</th>
                    <th className="px-6 py-4 font-medium">Fiyat</th>
                    <th className="px-6 py-4 font-medium">Durum</th>
                    <th className="px-6 py-4 font-medium text-right">İşlemler</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {menuItems.map(item => (
                    <tr key={item.id} className="hover:bg-neutral-50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono bg-neutral-100 text-neutral-500 px-2 py-1 rounded inline-block">{item.order}</span>
                          <span className="text-sm font-medium text-neutral-600">{item.category}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-neutral-900">{item.name}</p>
                        {item.description && <p className="text-sm text-neutral-500 truncate max-w-xs">{item.description}</p>}
                      </td>
                      <td className="px-6 py-4 font-bold text-neutral-900">{item.price} ₺</td>
                      <td className="px-6 py-4">
                         <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${item.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                           {item.isAvailable ? 'Aktif' : 'Pasif'}
                         </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                          <button onClick={() => setEditingItem(item)} className="p-2 text-neutral-400 hover:text-blue-600 hover:bg-blue-50 rounded transition" title="Düzenle">
                             <Edit2 size={18} />
                          </button>
                          <button onClick={() => handleDelete(item.id)} className="p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded transition" title="Sil">
                             <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {menuItems.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-neutral-500">
                        <div className="flex flex-col items-center gap-4">
                          <span className="block mb-2">Menüde ürün bulunmuyor. Varsayılan menüyü yükleyebilirsiniz.</span>
                          <button
                             onClick={handleSeedMenu}
                             className="bg-gold-500 text-black px-6 py-2 rounded-lg font-bold hover:bg-gold-400 transition inline-flex items-center gap-2"
                          >
                            <Utensils size={18} /> Örnek Menüyü Yükle
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>

      </main>
    </div>
  );
}
