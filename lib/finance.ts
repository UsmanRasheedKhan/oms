import { collection, addDoc, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from './firebase';
import { LedgerEntry } from './types';

export const getLedgerEntries = async (): Promise<LedgerEntry[]> => {
    const q = query(collection(db, 'finance_ledger'), orderBy('date', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as LedgerEntry));
};

export const addLedgerEntry = async (entry: Omit<LedgerEntry, 'id'>) => {
    const docRef = await addDoc(collection(db, 'finance_ledger'), {
        ...entry,
        date: entry.date || new Date().toISOString()
    });
    return docRef.id;
};
