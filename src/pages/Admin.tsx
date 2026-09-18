import React, { useState, useEffect, useRef } from 'react';
import { signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db, googleProvider, hasFirebaseConfig } from '../lib/firebase';
import {
  MenuItem,
  getMenuItems,
  addMenuItem,
  updateMenuItem,
  deleteMenuItem,
  seedDefaultMenu
} from '../lib/storage';

const styles: Record<string, React.CSSProperties> = {
  page: {
    fontFamily: 'sans-serif',
    maxWidth: 700,
    margin: '0 auto',
    padding: '20px 16px 100px',
    background: '#fff',
    minHeight: '100vh',
    color: '#000',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid #ccc',
    paddingBottom: 12,
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerBtns: {
    display: 'flex',
    gap: 8,
  },
  btn: {
    padding: '6px 14px',
    border: '1px solid #999',
    background: '#f5f5f5',
    cursor: 'pointer',
    fontSize: 13,
  },
  btnDanger: {
    padding: '6px 14px',
    border: '1px solid #c00',
    background: '#fff',
    color: '#c00',
    cursor: 'pointer',
    fontSize: 13,
  },
  btnPrimary: {
    padding: '6px 14px',
    border: '1px solid #000',
    background: '#000',
    color: '#fff',
    cursor: 'pointer',
    fontSize: 13,
  },
  categorySection: {
    marginBottom: 32,
  },
  categoryHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '2px solid #000',
    paddingBottom: 6,
    marginBottom: 12,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    textTransform: 'uppercase' as const,
  },
  itemRow: {
    display: 'flex',
    gap: 8,
    alignItems: 'center',
    padding: '8px 0',
    borderBottom: '1px solid #eee',
  },
  input: {
    border: '1px solid #ccc',
    padding: '4px 8px',
    fontSize: 14,
    background: '#fff',
  },
  inputName: {
    flex: 1,
    border: '1px solid #ccc',
    padding: '4px 8px',
    fontSize: 14,
    fontWeight: 'bold' as const,
  },
  inputPrice: {
    width: 70,
    border: '1px solid #ccc',
    padding: '4px 8px',
    fontSize: 14,
    textAlign: 'right' as const,
  },
  inputDesc: {
    flex: 1,
    border: '1px solid #ccc',
    padding: '4px 8px',
    fontSize: 13,
    color: '#555',
  },
  savedLabel: {
    fontSize: 11,
    color: 'green',
    fontWeight: 'bold',
  },
  loginPage: {
    fontFamily: 'sans-serif',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    background: '#fff',
    color: '#000',
  },
  emptyBox: {
    textAlign: 'center' as const,
    padding: 40,
    border: '1px dashed #ccc',
    marginTop: 20,
  },
  btnMove: {
    padding: '2px 6px',
    border: '1px solid #999',
    background: '#f5f5f5',
    cursor: 'pointer',
    fontSize: 12,
    lineHeight: 1,
  },
  btnMoveDisabled: {
    padding: '2px 6px',
    border: '1px solid #ddd',
    background: '#f9f9f9',
    color: '#ccc',
    cursor: 'default',
    fontSize: 12,
    lineHeight: 1,
  },
  moveGroup: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 2,
  },
};

export default function Admin() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categoriesOrder, setCategoriesOrder] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState<string | null>(null);

  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!hasFirebaseConfig) {
      setIsLoading(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser && currentUser.email) {
        try {
          const adminDoc = await getDoc(doc(db, 'admins', currentUser.email.toLowerCase()));
          if (adminDoc.exists()) {
            setIsAuthorized(true);
            loadMenu();
          } else {
            setIsAuthorized(false);
            setIsLoading(false);
          }
        } catch (error) {
          console.error('Admin kontrol hatası:', error);
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
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(async () => {
      for (const item of items) {
        const { id, ...data } = item;
        await updateMenuItem(id, data);
      }
    }, 2000);
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

  // Kategoriyi yukarı veya aşağı taşı
  const kategoriTasi = (kategori: string, yon: 'yukari' | 'asagi') => {
    const index = categoriesOrder.indexOf(kategori);
    if (yon === 'yukari' && index <= 0) return;
    if (yon === 'asagi' && index >= categoriesOrder.length - 1) return;

    const yeniSira = [...categoriesOrder];
    const hedefIndex = yon === 'yukari' ? index - 1 : index + 1;
    [yeniSira[index], yeniSira[hedefIndex]] = [yeniSira[hedefIndex], yeniSira[index]];
    setCategoriesOrder(yeniSira);

    // Global order'ları yeniden hesapla
    const guncelUrunler: MenuItem[] = [];
    let sirano = 0;
    yeniSira.forEach(kat => {
      menuItems.filter(i => i.category === kat).forEach(urun => {
        guncelUrunler.push({ ...urun, order: sirano++ });
      });
    });
    setMenuItems(guncelUrunler);
    syncAllOrders(guncelUrunler);
  };

  // Ürünü kendi kategorisi içinde yukarı veya aşağı taşı
  const urunTasi = (kategori: string, urunId: string, yon: 'yukari' | 'asagi') => {
    const kategoriUrunleri = menuItems.filter(i => i.category === kategori);
    const index = kategoriUrunleri.findIndex(i => i.id === urunId);
    if (yon === 'yukari' && index <= 0) return;
    if (yon === 'asagi' && index >= kategoriUrunleri.length - 1) return;

    const yeniKategoriSirasi = [...kategoriUrunleri];
    const hedefIndex = yon === 'yukari' ? index - 1 : index + 1;
    [yeniKategoriSirasi[index], yeniKategoriSirasi[hedefIndex]] = [yeniKategoriSirasi[hedefIndex], yeniKategoriSirasi[index]];

    // Global order'ları yeniden hesapla
    const guncelUrunler: MenuItem[] = [];
    let sirano = 0;
    categoriesOrder.forEach(kat => {
      const katUrunleri = kat === kategori ? yeniKategoriSirasi : menuItems.filter(i => i.category === kat);
      katUrunleri.forEach(urun => {
        guncelUrunler.push({ ...urun, order: sirano++ });
      });
    });
    setMenuItems(guncelUrunler);
    syncAllOrders(guncelUrunler);
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

  // Loading
  if (isLoading && !user) {
    return <div style={styles.loginPage}>Yükleniyor...</div>;
  }

  // Login / Unauthorized
  if (!user || !isAuthorized) {
    return (
      <div style={styles.loginPage}>
        <h1 style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 24 }}>Yönetim Paneli</h1>
        {!user ? (
          <button
            onClick={() => signInWithPopup(auth, googleProvider)}
            style={styles.btnPrimary}
          >
            Google ile Giriş Yap
          </button>
        ) : (
          <p style={{ color: 'red' }}>Yetkisiz Erişim: {user.email}</p>
        )}
      </div>
    );
  }

  // Main Admin Panel
  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <span style={styles.headerTitle}>Yönetim Paneli</span>
        <div style={styles.headerBtns}>
          <a href="/" style={{ ...styles.btn, textDecoration: 'none', color: '#000' }}>Ana Sayfa</a>
          <button onClick={() => signOut(auth)} style={styles.btnDanger}>
            Çıkış
          </button>
        </div>
      </div>

      {/* All categories — always open */}
      {categoriesOrder.map((category, catIndex) => (
        <div key={category} style={styles.categorySection}>
          {/* Kategori başlığı */}
          <div style={styles.categoryHeader}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={styles.moveGroup}>
                <button
                  onClick={() => kategoriTasi(category, 'yukari')}
                  style={catIndex === 0 ? styles.btnMoveDisabled : styles.btnMove}
                  disabled={catIndex === 0}
                  title="Kategoriyi yukarı taşı"
                >▲</button>
                <button
                  onClick={() => kategoriTasi(category, 'asagi')}
                  style={catIndex === categoriesOrder.length - 1 ? styles.btnMoveDisabled : styles.btnMove}
                  disabled={catIndex === categoriesOrder.length - 1}
                  title="Kategoriyi aşağı taşı"
                >▼</button>
              </div>
              <span style={styles.categoryTitle}>{category}</span>
            </div>
            <button onClick={() => handleAddNew(category)} style={styles.btn}>
              + Ekle
            </button>
          </div>

          {/* Kategorideki ürünler */}
          {(() => {
            const kategoriUrunleri = menuItems.filter(i => i.category === category);
            return kategoriUrunleri.map((item, itemIndex) => (
              <div key={item.id} style={styles.itemRow}>
                {/* Yukarı / Aşağı butonları */}
                <div style={styles.moveGroup}>
                  <button
                    onClick={() => urunTasi(category, item.id, 'yukari')}
                    style={itemIndex === 0 ? styles.btnMoveDisabled : styles.btnMove}
                    disabled={itemIndex === 0}
                    title="Yukarı taşı"
                  >▲</button>
                  <button
                    onClick={() => urunTasi(category, item.id, 'asagi')}
                    style={itemIndex === kategoriUrunleri.length - 1 ? styles.btnMoveDisabled : styles.btnMove}
                    disabled={itemIndex === kategoriUrunleri.length - 1}
                    title="Aşağı taşı"
                  >▼</button>
                </div>

                {/* Satışta checkbox */}
                <input
                  type="checkbox"
                  checked={item.isAvailable}
                  title="Satışta"
                  onChange={(e) => {
                    handleFieldChange(item.id, 'isAvailable', e.target.checked);
                    saveChanges({ ...item, isAvailable: e.target.checked });
                  }}
                />

                {/* İsim */}
                <input
                  style={styles.inputName}
                  value={item.name}
                  onChange={(e) => handleFieldChange(item.id, 'name', e.target.value)}
                  onBlur={() => saveChanges(item)}
                />

                {/* Açıklama */}
                <input
                  style={styles.inputDesc}
                  value={item.description}
                  placeholder="Açıklama"
                  onChange={(e) => handleFieldChange(item.id, 'description', e.target.value)}
                  onBlur={() => saveChanges(item)}
                />

                {/* Fiyat */}
                <input
                  type="number"
                  style={styles.inputPrice}
                  value={item.price}
                  onChange={(e) => handleFieldChange(item.id, 'price', Number(e.target.value))}
                  onBlur={() => saveChanges(item)}
                />
                <span style={{ fontSize: 13 }}>₺</span>

                {/* Kaydedildi göstergesi */}
                {isSaving === item.id && (
                  <span style={styles.savedLabel}>✓</span>
                )}

                {/* Sil */}
                <button
                  onClick={() => handleDelete(item.id)}
                  style={{ ...styles.btn, color: '#c00', borderColor: '#c00', padding: '4px 8px' }}
                  title="Sil"
                >
                  Sil
                </button>
              </div>
            ));
          })()}
        </div>
      ))}

      {/* Empty state */}
      {menuItems.length === 0 && !isLoading && (
        <div style={styles.emptyBox}>
          <p style={{ marginBottom: 16, color: '#666' }}>Menü boş.</p>
          <button onClick={() => seedDefaultMenu().then(loadMenu)} style={styles.btnPrimary}>
            Varsayılan Menüyü Yükle
          </button>
        </div>
      )}

      {/* Add new button (bottom) */}
      <div style={{ marginTop: 24, textAlign: 'center' }}>
        <button onClick={() => handleAddNew()} style={styles.btnPrimary}>
          + Yeni Ürün Ekle
        </button>
      </div>
    </div>
  );
}
