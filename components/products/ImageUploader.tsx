'use client';

import { useState } from 'react';
import { UploadCloud, X, Star } from 'lucide-react';
import toast from 'react-hot-toast';

interface UploadedImage {
    url: string;
    isPrimary: boolean;
}

interface ImageUploaderProps {
    images: UploadedImage[];
    onChange: (images: UploadedImage[]) => void;
    folder?: string;
}

export default function ImageUploader({ images, onChange, folder = 'products' }: ImageUploaderProps) {
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setUploading(true);
        setProgress(0);

        const newImages = [...images];

        try {
            const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
            const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

            if (!CLOUD_NAME || !UPLOAD_PRESET) {
                toast.error("Cloudinary credentials missing in .env.local!");
                setUploading(false);
                return;
            }

            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const formData = new FormData();
                formData.append('file', file);
                formData.append('upload_preset', UPLOAD_PRESET);
                formData.append('folder', `elite_oms/${folder}`);

                const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
                    method: 'POST',
                    body: formData,
                });

                if (!response.ok) throw new Error('Cloudinary upload failed');

                const data = await response.json();

                // First image uploaded is primary if none exists
                newImages.push({ url: data.secure_url, isPrimary: newImages.length === 0 });
                setProgress(((i + 1) / files.length) * 100);
            }

            onChange(newImages);
        } catch (error) {
            console.error('Failed to upload image(s):', error);
            toast.error('Failed to upload image. Please check your permissions or network.');
        } finally {
            setUploading(false);
            setProgress(0);
        }
    };

    const removeImage = (index: number) => {
        const newImages = [...images];
        const removedWasPrimary = newImages[index].isPrimary;
        newImages.splice(index, 1);

        // Assign primary to the first one if the primary was removed
        if (removedWasPrimary && newImages.length > 0) {
            newImages[0].isPrimary = true;
        }

        onChange(newImages);
    };

    const setPrimary = (index: number) => {
        const newImages = images.map((img, i) => ({
            ...img,
            isPrimary: i === index,
        }));
        onChange(newImages);
    };

    return (
        <div className="space-y-4">
            {/* Upload Zone */}
            <div className="relative border-2 border-dashed border-border p-6 flex flex-col items-center justify-center bg-chalk hover:bg-slate transition-colors">
                <UploadCloud className="w-8 h-8 text-muted mb-2" />
                <p className="text-sm font-medium">Click or drag images to upload</p>
                <p className="text-xs text-muted mt-1">PNG, JPG up to 5MB</p>
                <input
                    type="file"
                    multiple
                    accept="image/*"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={handleUpload}
                    disabled={uploading}
                />
                {uploading && (
                    <div className="absolute bottom-0 left-0 h-1 bg-accent transition-all duration-300" style={{ width: `${progress}%` }} />
                )}
            </div>

            {/* Image Preview Grid */}
            {images.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {images.map((img, index) => (
                        <div key={index} className={`relative group border ${img.isPrimary ? 'border-accent shadow-luxury-md' : 'border-border'}`}>
                            <img src={img.url} alt="Product upload" className="w-full h-32 object-cover" />

                            {/* Overlay Actions */}
                            <div className="absolute inset-0 bg-obsidian bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                {!img.isPrimary && (
                                    <button
                                        type="button"
                                        title="Set as Primary"
                                        onClick={() => setPrimary(index)}
                                        className="p-1.5 bg-chalk text-obsidian rounded-full hover:bg-accent hover:text-chalk transition-colors"
                                    >
                                        <Star className="w-4 h-4" />
                                    </button>
                                )}
                                <button
                                    type="button"
                                    title="Remove Image"
                                    onClick={() => removeImage(index)}
                                    className="p-1.5 bg-chalk text-obsidian rounded-full hover:bg-red-600 hover:text-chalk transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Primary Badge */}
                            {img.isPrimary && (
                                <div className="absolute top-2 left-2 bg-accent text-chalk text-[10px] uppercase font-bold px-2 py-0.5 shadow-sm">
                                    Primary
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
