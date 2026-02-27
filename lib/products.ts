import { collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, query, where, writeBatch } from 'firebase/firestore';
import { db } from './firebase';
import { Product, Variant } from './types';

// Products Collection
export const getProducts = async (): Promise<Product[]> => {
    const q = query(collection(db, 'products'), where('isSoftDeleted', '!=', true));
    const snapshot = await getDocs(q);

    // Fetch variants for each product to support the new ProductCard summary UI
    const products = await Promise.all(snapshot.docs.map(async (d) => {
        const p = { id: d.id, ...d.data() } as Product;
        const vQ = query(collection(db, `products/${d.id}/variants`), where('isSoftDeleted', '!=', true));
        const vS = await getDocs(vQ);
        p.variants = vS.docs.map(vd => ({ id: vd.id, ...vd.data() } as Variant));
        return p;
    }));

    return products;
};

export const getProductTree = async (productId: string): Promise<Product | null> => {
    const productDoc = await getDoc(doc(db, 'products', productId));
    if (!productDoc.exists()) return null;
    const product = { id: productDoc.id, ...productDoc.data() } as Product;

    const variantsQuery = query(collection(db, `products/${productId}/variants`), where('isSoftDeleted', '!=', true));
    const variantsSnap = await getDocs(variantsQuery);
    product.variants = variantsSnap.docs.map(d => ({ id: d.id, ...d.data() } as Variant));

    return product;
};

export const saveProductTree = async (product: Omit<Product, 'id'>, variants: Omit<Variant, 'id'>[]): Promise<string> => {
    const batch = writeBatch(db);
    const productRef = doc(collection(db, 'products'));
    const productId = productRef.id;

    batch.set(productRef, {
        ...product,
        id: productId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isSoftDeleted: false
    });

    variants.forEach(variant => {
        const variantRef = doc(collection(db, `products/${productId}/variants`));
        batch.set(variantRef, {
            ...variant,
            id: variantRef.id,
            productId,
            isSoftDeleted: false
        });
    });

    await batch.commit();
    return productId;
};

export const updateProduct = async (id: string, data: Partial<Product>) => {
    const ref = doc(db, 'products', id);
    await updateDoc(ref, { ...data, updatedAt: new Date().toISOString() });
};

export const softDeleteProduct = async (id: string) => {
    await updateProduct(id, { isSoftDeleted: true });
};
