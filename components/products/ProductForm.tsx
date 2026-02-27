'use client';

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { Plus, Save, ArrowLeft, Loader2 } from 'lucide-react';
import { Product, Variant } from '@/lib/types';
import { saveProductTree, updateProduct } from '@/lib/products';
import { getCollections, getGlobalSizes } from '@/lib/settings';
import { useQuery } from '@tanstack/react-query';
import BarcodeImage from './BarcodeImage';
import ImageUploader from './ImageUploader';
import { useUIStore } from '@/store/useUIStore';
import toast from 'react-hot-toast';
import { syncEngine } from '@/lib/syncEngine';
import VariantRow from './VariantRow';

interface ProductFormProps {
    initialData?: Product;
}

export default function ProductForm({ initialData }: ProductFormProps) {
    const router = useRouter();
    const [isSaving, setIsSaving] = useState(false);

    const form = useForm<Product>({
        defaultValues: initialData || {
            name: '',
            description: '',
            collectionId: '',
            images: [],
            variants: [
                { size: '', color: '', sku: '', costPrice: 0, sellPrice: 0, quantity: 0 }
            ]
        }
    });

    const { data: collections = [], isLoading: colsLoading } = useQuery({
        queryKey: ['globalCollections'],
        queryFn: getCollections
    });

    const { data: globalSizes = [], isLoading: sizesLoading } = useQuery({
        queryKey: ['globalSizes'],
        queryFn: getGlobalSizes
    });

    // Only allow selecting ACTIVE settings
    const activeCollections = collections.filter(c => c.isActive);
    const activeSizes = globalSizes.filter(s => s.isActive);

    const { register, control, handleSubmit, watch, setValue, formState: { errors } } = form;
    const productImages = watch('images') || [];

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'variants'
    });

    const onSubmit = async (data: Product) => {
        setIsSaving(true);
        try {
            const { variants, ...productBase } = data;

            if (initialData?.id) {
                // Edit mode (simplified for demo, assumes online or syncEngine handles updates)
                if (navigator.onLine) {
                    await updateProduct(initialData.id, productBase);
                    toast.success("Product updated successfully!");
                } else if (syncEngine) {
                    await syncEngine.queueMutation({
                        collection: 'products',
                        action: 'UPDATE',
                        documentId: initialData.id,
                        data: productBase
                    });
                    toast.success("Product update queued for sync!");
                }
            } else {
                // Create mode
                if (navigator.onLine) {
                    await saveProductTree(productBase, variants || []);
                    toast.success("Product created successfully!");
                } else if (syncEngine) {
                    // If offline, generate temporary IDs
                    const tempProductId = `temp_${Date.now()}`;
                    await syncEngine.queueMutation({
                        collection: 'products',
                        action: 'CREATE',
                        documentId: tempProductId,
                        data: { ...productBase, isSoftDeleted: false, createdAt: new Date().toISOString() }
                    });

                    variants?.forEach((v, idx) => {
                        syncEngine?.queueMutation({
                            collection: 'variants',
                            action: 'CREATE',
                            documentId: `temp_var_${Date.now()}_${idx}`,
                            data: { ...v, productId: tempProductId, isSoftDeleted: false }
                        });
                    });
                    toast.success("Product creation queued for sync!");
                }
            }

            router.push('/products');
            router.refresh();
        } catch (error) {
            console.error('Failed to save product', error);
            toast.error('Failed to save product. If offline, changes are queued.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Sticky Header Actions */}
            <div className="sticky top-0 z-10 bg-slate/90 backdrop-blur-md py-4 border-b border-border flex justify-between items-center">
                <button type="button" onClick={() => router.back()} className="btn btn-ghost !px-2">
                    <ArrowLeft className="w-5 h-5 mr-1" /> Back
                </button>
                <button type="submit" disabled={isSaving} className="btn btn-primary">
                    <Save className="w-4 h-4 mr-2" />
                    {isSaving ? 'Saving...' : 'Save Product'}
                </button>
            </div>

            {/* Base Details */}
            <section className="card-luxury p-6 md:p-8 animate-in" style={{ animationDelay: '0.1s' }}>
                <h2 className="text-xl font-display mb-6 border-b border-border pb-2">Core Identity</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="label-luxury">Product Name</label>
                        <input
                            {...register('name', { required: 'Name is required' })}
                            className={`input-luxury ${errors.name ? 'border-red-500' : ''}`}
                            placeholder="e.g. The Obsidian Trench"
                        />
                        {errors.name && <span className="text-xs text-red-500 mt-1 block">{errors.name.message}</span>}
                    </div>
                    <div>
                        <label className="label-luxury">Collection</label>
                        <select
                            {...register('collectionId')}
                            className="input-luxury bg-chalk"
                            disabled={colsLoading}
                        >
                            <option value="">Select Collection...</option>
                            {activeCollections.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                        {colsLoading && <span className="text-xs text-muted mt-1 block flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" /> Loading collections...</span>}
                    </div>
                    <div className="md:col-span-2">
                        <label className="label-luxury">Description</label>
                        <textarea
                            {...register('description')}
                            className="input-luxury min-h-[120px] resize-y"
                            placeholder="Rich description of the product or material..."
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="label-luxury mb-2 block">Product Media</label>
                        <ImageUploader
                            images={productImages}
                            onChange={(imgs) => setValue('images', imgs)}
                            folder="products"
                        />
                    </div>
                </div>
            </section>

            {/* Variants Section */}
            <section className="space-y-6 animate-in" style={{ animationDelay: '0.2s' }}>
                <div className="flex justify-between items-end border-b border-border pb-2">
                    <h2 className="text-xl font-display">Variants Engine</h2>
                    <button
                        type="button"
                        onClick={() => append({ size: '', color: '', sku: '', costPrice: 0, sellPrice: 0, quantity: 0 })}
                        className="btn btn-secondary text-xs !py-1.5"
                    >
                        <Plus className="w-3 h-3 mr-1" /> Add Variant
                    </button>
                </div>

                {fields.length === 0 && (
                    <div className="p-8 text-center border-2 border-dashed border-border text-muted font-mono">
                        No variants configured. A product needs at least one variant.
                    </div>
                )}

                <div className="space-y-4">
                    {fields.map((field, index) => (
                        <VariantRow
                            key={field.id}
                            index={index}
                            form={form}
                            remove={remove}
                            availableSizes={activeSizes as { id: string, name: string }[]}
                        />
                    ))}
                </div>
            </section>
        </form>
    );
}
