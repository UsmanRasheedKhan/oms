import { db, OfflineMutation } from './db';
import { collection, doc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db as firestore } from './firebase';

export class SyncEngine {
    private isSyncing = false;

    constructor() {
        if (typeof window !== 'undefined') {
            window.addEventListener('online', this.flushQueue.bind(this));

            // Initial check
            if (navigator.onLine) {
                this.flushQueue();
            }
        }
    }

    async queueMutation(mutation: Omit<OfflineMutation, 'id' | 'timestamp'>) {
        await db.offlineQueue.add({
            ...mutation,
            timestamp: Date.now()
        });

        if (typeof navigator !== 'undefined' && navigator.onLine) {
            this.flushQueue();
        }
    }

    async flushQueue() {
        if (this.isSyncing) return;
        this.isSyncing = true;

        try {
            const queue = await db.offlineQueue.orderBy('timestamp').toArray();

            for (const mutation of queue) {
                try {
                    await this.processMutation(mutation);
                    // Remove from queue upon success
                    if (mutation.id) {
                        await db.offlineQueue.delete(mutation.id);
                    }
                } catch (error) {
                    console.error(`Failed to process mutation ${mutation.id}:`, error);
                    // Opting to break the loop on first failure to preserve order
                    break;
                }
            }
        } finally {
            this.isSyncing = false;
        }
    }

    private async processMutation(mutation: OfflineMutation) {
        const ref = doc(collection(firestore, mutation.collection), mutation.documentId);

        switch (mutation.action) {
            case 'CREATE':
            case 'UPDATE':
                await setDoc(ref, mutation.data, { merge: true });
                break;
            case 'DELETE':
                await deleteDoc(ref);
                break;
            case 'SOFT_DELETE':
                await updateDoc(ref, { isSoftDeleted: true, updatedAt: new Date().toISOString() });
                break;
            default:
                throw new Error(`Unknown action: ${mutation.action}`);
        }
    }
}

export const syncEngine = typeof window !== 'undefined' ? new SyncEngine() : null;
