import { collection, query, where, getDocs, writeBatch, doc } from 'firebase/firestore';
import { db } from './firebase';
import { Variant, Product } from './types';

// Fetch all products with variants for the balance sheet
export const getInventoryBalanceSheet = async () => {
    const productsQuery = query(collection(db, 'products'), where('isSoftDeleted', '!=', true));
    const productsSnap = await getDocs(productsQuery);

    const balanceSheet: Product[] = [];

    for (const pSnap of productsSnap.docs) {
        const product = { id: pSnap.id, ...pSnap.data() } as Product;
        const variantsQuery = query(collection(db, `products/${pSnap.id}/variants`), where('isSoftDeleted', '!=', true));
        const variantsSnap = await getDocs(variantsQuery);

        product.variants = variantsSnap.docs.map(v => ({ id: v.id, ...v.data() } as Variant));
        balanceSheet.push(product);
    }

    return balanceSheet;
};

export const updateVariantQuantity = async (productId: string, variantId: string, newQuantity: number) => {
    const batch = writeBatch(db);

    // Update variant qty
    const variantRef = doc(db, `products/${productId}/variants`, variantId);
    batch.update(variantRef, { quantity: newQuantity });

    // Optionally update product timestamp
    const productRef = doc(db, 'products', productId);
    batch.update(productRef, { updatedAt: new Date().toISOString() });

    await batch.commit();
};

export const liveSearchProducts = async (term: string): Promise<Product[]> => {
    // Simple client-side filtered search for demo purposes instead of ElasticSearch/Algolia
    // In production with thousands of items, use Algolia/Typesense.
    const productsQuery = query(collection(db, 'products'), where('isSoftDeleted', '!=', true));
    const snap = await getDocs(productsQuery);

    const products = snap.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as Product))
        .filter(p => p.name.toLowerCase().includes(term.toLowerCase()));

    for (const p of products) {
        const variantsQuery = query(collection(db, `products/${p.id}/variants`), where('isSoftDeleted', '!=', true));
        const vSnap = await getDocs(variantsQuery);
        p.variants = vSnap.docs.map(v => ({ id: v.id, ...v.data() } as Variant));
    }

    return products;
};
