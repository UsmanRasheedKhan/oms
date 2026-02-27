import { collection, getDocs, setDoc, doc, updateDoc, writeBatch } from 'firebase/firestore';
import { db } from './firebase';
import { GlobalSize, Collection } from './types';

export const getGlobalSizes = async (): Promise<GlobalSize[]> => {
    const snap = await getDocs(collection(db, 'settings_sizes'));
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as GlobalSize)).filter(s => !s.isSoftDeleted);
};

export const getCollections = async (): Promise<Collection[]> => {
    const snap = await getDocs(collection(db, 'settings_collections'));
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Collection)).filter(c => !c.isSoftDeleted);
};

export const addGlobalSize = async (size: Omit<GlobalSize, 'id'>) => {
    const ref = doc(collection(db, 'settings_sizes'));
    await setDoc(ref, { ...size, id: ref.id, isActive: true, isSoftDeleted: false });
    return ref.id;
};

export const addCollection = async (coll: Omit<Collection, 'id'>) => {
    const ref = doc(collection(db, 'settings_collections'));
    await setDoc(ref, { ...coll, id: ref.id, isActive: true, isSoftDeleted: false });
    return ref.id;
};

export const softDeleteSize = async (id: string) => {
    const ref = doc(db, 'settings_sizes', id);
    await updateDoc(ref, { isSoftDeleted: true });
};

export const softDeleteCollection = async (id: string) => {
    const ref = doc(db, 'settings_collections', id);
    await updateDoc(ref, { isSoftDeleted: true });
};

export const toggleSizeActive = async (id: string, currentStatus: boolean) => {
    const ref = doc(db, 'settings_sizes', id);
    await updateDoc(ref, { isActive: !currentStatus });
};

export const toggleCollectionActive = async (id: string, currentStatus: boolean) => {
    const ref = doc(db, 'settings_collections', id);
    await updateDoc(ref, { isActive: !currentStatus });
};
