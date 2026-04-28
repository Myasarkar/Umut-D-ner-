import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  writeBatch
} from 'firebase/firestore';
import { db, hasFirebaseConfig } from './firebase';
import { DEFAULT_MENU } from './defaultMenu';

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  isAvailable: boolean;
  order: number;
  imageUrl?: string;
}

const COLLECTION_NAME = 'menu_items';

export async function getMenuItems(): Promise<MenuItem[]> {
  if (!hasFirebaseConfig) {
    console.warn("Firebase not configured, using default menu.");
    return DEFAULT_MENU;
  }

  try {
    const q = query(collection(db, COLLECTION_NAME), orderBy('order', 'asc'));
    const querySnapshot = await getDocs(q);
    const items: MenuItem[] = [];

    querySnapshot.forEach((doc) => {
      items.push({ id: doc.id, ...doc.data() } as MenuItem);
    });

    // Removed: if (items.length === 0) { return DEFAULT_MENU; }
    return items;
  } catch (e) {
    console.error('Error fetching menu items:', e);
    return []; // Return empty instead of default to trigger seed button
  }
}

export async function addMenuItem(item: Omit<MenuItem, 'id'>) {
  if (!hasFirebaseConfig) throw new Error("Firebase not configured");
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), item);
    return { id: docRef.id, ...item };
  } catch (e) {
    console.error('Error adding menu item:', e);
    throw e;
  }
}

export async function updateMenuItem(id: string, updates: Partial<MenuItem>) {
  if (!hasFirebaseConfig) throw new Error("Firebase not configured");
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, updates);
  } catch (e) {
    console.error('Error updating menu item:', e);
    throw e;
  }
}

export async function deleteMenuItem(id: string) {
  if (!hasFirebaseConfig) throw new Error("Firebase not configured");
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, id));
  } catch (e) {
    console.error('Error deleting menu item:', e);
    throw e;
  }
}

export async function seedDefaultMenu() {
  if (!hasFirebaseConfig) throw new Error("Firebase not configured");
  try {
    const batch = writeBatch(db);

    // Use a fixed set of items to avoid confusion
    DEFAULT_MENU.forEach((item) => {
      const { id, ...itemWithoutId } = item;
      // Use addDoc style by creating a new doc ref without specifying ID
      const newDocRef = doc(collection(db, COLLECTION_NAME));
      batch.set(newDocRef, itemWithoutId);
    });

    await batch.commit();
  } catch (e) {
    console.error('Error seeding default menu:', e);
    throw e;
  }
}
