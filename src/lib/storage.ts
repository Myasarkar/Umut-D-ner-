import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  setDoc,
  writeBatch
} from 'firebase/firestore';
import { db } from './firebase';
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
  try {
    const q = query(collection(db, COLLECTION_NAME), orderBy('order', 'asc'));
    const querySnapshot = await getDocs(q);
    const items: MenuItem[] = [];

    querySnapshot.forEach((doc) => {
      items.push({ id: doc.id, ...doc.data() } as MenuItem);
    });

    if (items.length === 0) {
      return DEFAULT_MENU;
    }

    return items;
  } catch (e) {
    console.error('Error fetching menu items:', e);
    return DEFAULT_MENU;
  }
}

export async function addMenuItem(item: Omit<MenuItem, 'id'>) {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), item);
    return { id: docRef.id, ...item };
  } catch (e) {
    console.error('Error adding menu item:', e);
    throw e;
  }
}

export async function updateMenuItem(id: string, updates: Partial<MenuItem>) {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, updates);
  } catch (e) {
    console.error('Error updating menu item:', e);
    throw e;
  }
}

export async function deleteMenuItem(id: string) {
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, id));
  } catch (e) {
    console.error('Error deleting menu item:', e);
    throw e;
  }
}

export async function seedDefaultMenu() {
  try {
    const batch = writeBatch(db);

    // First, get all existing items to delete them (optional, but keep it consistent with previous logic)
    const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
    querySnapshot.forEach((doc) => {
      batch.delete(doc.ref);
    });

    // Add default menu items
    DEFAULT_MENU.forEach((item) => {
      const { id, ...itemWithoutId } = item;
      const newDocRef = doc(collection(db, COLLECTION_NAME));
      batch.set(newDocRef, itemWithoutId);
    });

    await batch.commit();
  } catch (e) {
    console.error('Error seeding default menu:', e);
    throw e;
  }
}
