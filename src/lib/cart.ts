"use client";

import { openDB, type IDBPDatabase } from "idb";
import type { CartItem, CustomerDetails } from "@/types";

const DB_NAME = "pvc-cards-cart";
const DB_VERSION = 1;
const CART_STORE = "cart";
const DETAILS_STORE = "customer";

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDb() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(CART_STORE)) {
          db.createObjectStore(CART_STORE, { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains(DETAILS_STORE)) {
          db.createObjectStore(DETAILS_STORE);
        }
      },
    });
  }
  return dbPromise;
}

export async function getCartItems(): Promise<CartItem[]> {
  try {
    const db = await getDb();
    return (await db.getAll(CART_STORE)) as CartItem[];
  } catch {
    return [];
  }
}

export async function addToCart(item: CartItem): Promise<void> {
  const db = await getDb();
  await db.put(CART_STORE, item);
}

export async function updateCartItem(item: CartItem): Promise<void> {
  const db = await getDb();
  await db.put(CART_STORE, item);
}

export async function removeFromCart(id: string): Promise<void> {
  const db = await getDb();
  await db.delete(CART_STORE, id);
}

export async function clearCart(): Promise<void> {
  const db = await getDb();
  await db.clear(CART_STORE);
}

export async function getCartSubtotal(): Promise<number> {
  const items = await getCartItems();
  return items.reduce((s, i) => s + i.price * i.quantity, 0);
}

export async function getCartCount(): Promise<number> {
  const items = await getCartItems();
  return items.reduce((s, i) => s + i.quantity, 0);
}

export async function getCustomerDetails(): Promise<CustomerDetails | null> {
  try {
    const db = await getDb();
    return ((await db.get(DETAILS_STORE, "details")) as CustomerDetails) || null;
  } catch {
    return null;
  }
}

export async function saveCustomerDetails(details: CustomerDetails): Promise<void> {
  const db = await getDb();
  await db.put(DETAILS_STORE, details, "details");
}

export async function clearCustomerDetails(): Promise<void> {
  const db = await getDb();
  await db.delete(DETAILS_STORE, "details");
}
