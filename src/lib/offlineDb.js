// src/lib/offlineDb.ts
import { openDB } from 'idb';
const DB_NAME = 'school-db';
const STORE_NAME = 'students';
export async function initDB() {
    return openDB(DB_NAME, 1, {
        upgrade(db) {
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                const store = db.createObjectStore(STORE_NAME, {
                    keyPath: 'id',
                    autoIncrement: true,
                });
                store.createIndex('syncedIndex', 'synced', { unique: false });
            }
        },
    });
}
export async function saveStudentOffline(student) {
    const db = await initDB();
    await db.put(STORE_NAME, Object.assign(Object.assign({}, student), { synced: false, updated_at: new Date().toISOString() }));
}
export async function getUnsyncedStudents() {
    const db = await initDB();
    return db.getAllFromIndex(STORE_NAME, 'syncedIndex');
}
export async function markStudentSynced(id) {
    const db = await initDB();
    const record = await db.get(STORE_NAME, id);
    if (record) {
        record.synced = true;
        await db.put(STORE_NAME, record);
    }
}
