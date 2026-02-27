import Dexie, { Table } from 'dexie';
import { Product, Variant } from './types';

export interface OfflineMutation {
    id?: number;
    collection: 'products' | 'variants' | 'orders' | 'customers' | 'settings';
    action: 'CREATE' | 'UPDATE' | 'DELETE' | 'SOFT_DELETE';
    documentId: string;
    data: any;
    timestamp: number;
}

export class EliteOMSDatabase extends Dexie {
    products!: Table<Product, string>;
    variants!: Table<Variant, string>;
    offlineQueue!: Table<OfflineMutation, number>;

    constructor() {
        super('EliteOMSDatabase');

        this.version(1).stores({
            products: 'id, name, collectionId',
            variants: 'id, productId, sku, size, color',
            offlineQueue: '++id, collection, action, timestamp'
        });
    }
}

export const db = new EliteOMSDatabase();
