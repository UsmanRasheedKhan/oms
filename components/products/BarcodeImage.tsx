'use client';

import { useEffect, useRef } from 'react';
import JsBarcode from 'jsbarcode';

interface BarcodeImageProps {
    sku: string;
    width?: number;
    height?: number;
}

export default function BarcodeImage({ sku, width = 1.5, height = 40 }: BarcodeImageProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (canvasRef.current && sku) {
            try {
                JsBarcode(canvasRef.current, sku, {
                    format: 'CODE128',
                    width,
                    height,
                    displayValue: true,
                    font: 'monospace',
                    fontSize: 12,
                    margin: 0,
                    background: '#FBFBFB', // match paper gray
                    lineColor: '#000000', // pure black
                });
            } catch (err) {
                console.error('Invalid SKU for barcode', err);
            }
        }
    }, [sku, width, height]);

    if (!sku) {
        return (
            <div className="w-full h-[40px] bg-slate-mid flex items-center justify-center text-xs text-muted-light font-mono border border-dashed border-border">
                NO SKU
            </div>
        );
    }

    return (
        <div className="p-2 border border-border bg-slate inline-block">
            <canvas ref={canvasRef} className="block w-full h-auto object-contain"></canvas>
        </div>
    );
}
