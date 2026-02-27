import { UseFormReturn, Controller } from 'react-hook-form';
import { Trash2 } from 'lucide-react';
import { useUIStore } from '@/store/useUIStore';
import BarcodeImage from './BarcodeImage';
import toast from 'react-hot-toast';

interface VariantRowProps {
    index: number;
    form: UseFormReturn<any>;
    remove: (index: number) => void;
    availableSizes: { id: string, name: string }[];
}

export default function VariantRow({ index, form, remove, availableSizes }: VariantRowProps) {
    const { register, watch } = form;
    const currency = useUIStore((state) => state.currency);

    // Watch necessary fields for the UI
    const sku = watch(`variants.${index}.sku`);
    const customBarcode = watch(`variants.${index}.barcodeUrl`);

    return (
        <div className="card-luxury p-6 relative border-l-4 border-l-accent animate-in">
            <button
                type="button"
                onClick={() => remove(index)}
                className="absolute top-4 right-4 text-muted hover:text-red-600 transition-colors"
                title="Remove Variant"
            >
                <Trash2 className="w-5 h-5" />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                {/* Core Info */}
                <div className="col-span-12 md:col-span-4 space-y-4">
                    <div>
                        <label className="label-luxury">Size</label>
                        <Controller
                            control={form.control}
                            name={`variants.${index}.size`}
                            render={({ field }) => (
                                <select
                                    {...field}
                                    className="input-luxury uppercase bg-chalk"
                                >
                                    <option value="">Select Size...</option>
                                    {availableSizes.map(s => (
                                        <option key={s.id} value={s.name}>{s.name}</option>
                                    ))}
                                </select>
                            )}
                        />
                    </div>
                    <div>
                        <label className="label-luxury">Color</label>
                        <input
                            {...register(`variants.${index}.color`)}
                            className="input-luxury capitalize"
                            placeholder="e.g. Matte Black"
                        />
                    </div>
                    <div>
                        <label className="label-luxury">SKU</label>
                        <input
                            {...register(`variants.${index}.sku`)}
                            className="input-luxury font-mono uppercase"
                            placeholder="Unique Identifier"
                        />
                    </div>
                </div>

                {/* Pricing & Stock */}
                <div className="col-span-12 md:col-span-4 space-y-4">
                    <div>
                        <label className="label-luxury">Cost Price</label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted font-mono">{currency === 'USD' ? '$' : '₨'}</span>
                            <input
                                type="number"
                                step="0.01"
                                {...register(`variants.${index}.costPrice`, { valueAsNumber: true })}
                                className="input-luxury pl-12 font-mono"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="label-luxury">Selling Price</label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted font-mono">{currency === 'USD' ? '$' : '₨'}</span>
                            <input
                                type="number"
                                step="0.01"
                                {...register(`variants.${index}.sellPrice`, { valueAsNumber: true })}
                                className="input-luxury pl-12 font-mono"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="label-luxury">Quantity</label>
                        <input
                            type="number"
                            {...register(`variants.${index}.quantity`, { valueAsNumber: true })}
                            className="input-luxury font-mono box-border"
                        />
                    </div>
                </div>

                {/* Barcode */}
                <div className="col-span-12 md:col-span-4 flex flex-col space-y-4">
                    <div>
                        <div className="flex justify-between items-end mb-2">
                            <label className="label-luxury block">Variant Barcode</label>
                        </div>
                        {customBarcode ? (
                            <img src={customBarcode} alt="Custom Barcode" className="h-14 object-contain mb-2 p-2 border border-border bg-slate inline-block" />
                        ) : (
                            <BarcodeImage sku={sku} />
                        )}
                        <input
                            type="file"
                            accept="image/*"
                            className="text-xs file:btn file:btn-secondary file:border-0 file:mr-2 mt-4 block w-full text-muted"
                            onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                try {
                                    const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
                                    const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

                                    if (!CLOUD_NAME || !UPLOAD_PRESET) {
                                        toast.error("Cloudinary credentials missing!");
                                        return;
                                    }

                                    const formData = new FormData();
                                    formData.append('file', file);
                                    formData.append('upload_preset', UPLOAD_PRESET);
                                    formData.append('folder', 'elite_oms/barcodes');

                                    const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
                                        method: 'POST',
                                        body: formData,
                                    });

                                    if (!response.ok) throw new Error('Cloudinary failed');

                                    const data = await response.json();
                                    form.setValue(`variants.${index}.barcodeUrl`, data.secure_url, { shouldDirty: true });
                                    toast.success('Custom barcode attached!');
                                } catch (err) {
                                    console.error('Barcode upload failed', err);
                                    toast.error('Failed to upload barcode.');
                                }
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
