import { openDB } from 'idb';
const DB_NAME = 'OfflineDB';
const STORE_NAME = 'registrations';
export async function getDb() {
    return openDB(DB_NAME, 1, {
        upgrade(db) {
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, {
                    keyPath: 'tempId',
                    autoIncrement: true,
                });
            }
        },
    });
}
export async function saveOfflineRegistration(data) {
    const db = await getDb();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    await tx.store.add(Object.assign(Object.assign({}, data), { tempId: Date.now() })); // add tempId for later removal
    await tx.done;
}
export async function getOfflineRegistrations() {
    const db = await getDb();
    return db.getAll(STORE_NAME);
}
export async function removeOfflineRegistration(tempId) {
    const db = await getDb();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    await tx.store.delete(tempId);
    await tx.done;
}
