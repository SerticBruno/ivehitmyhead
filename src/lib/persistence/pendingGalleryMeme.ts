const DB_NAME = 'ivehitmyhead-pending-gallery';
/** Bump if object store schema changes (recreates missing store on upgrade). */
const DB_VERSION = 2;
const STORE_NAME = 'pending-gallery';
/** Single slot for “finish save after login” flow. */
const PENDING_KEY = 'gallery-upload';

export type PendingGalleryMemePayload = {
  blob: Blob;
  title: string;
  templateName: string | null;
};

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onerror = () => reject(req.error ?? new Error('IndexedDB failed to open'));
    req.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    req.onsuccess = () => resolve(req.result);
  });
}

/** Store PNG (or other image blob) locally until user signs in. */
export async function setPendingGalleryMeme(payload: PendingGalleryMemePayload): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.put(payload, PENDING_KEY);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error('IndexedDB write failed'));
  });
}

export async function getPendingGalleryMeme(): Promise<PendingGalleryMemePayload | null> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const req = tx.objectStore(STORE_NAME).get(PENDING_KEY);
    req.onsuccess = () => resolve((req.result as PendingGalleryMemePayload | undefined) ?? null);
    req.onerror = () => reject(req.error ?? new Error('IndexedDB read failed'));
  });
}

export async function clearPendingGalleryMeme(): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).delete(PENDING_KEY);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error('IndexedDB delete failed'));
  });
}
