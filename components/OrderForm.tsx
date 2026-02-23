"use client";

import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createOrder } from "@/lib/orders";
import { Plus, Trash2, Loader2 } from "lucide-react";

// ── Zod Schema ─────────────────────────────────────────────────────────────
// Use z.number() — paired with valueAsNumber: true in register() so HTML
// inputs supply native numbers. Zod v4 + RHF: zodResolver is cast to any
// to bypass the upstream type mismatch.
const orderItemSchema = z.object({
    productId: z.string().default("manual"),
    name: z.string().min(1, "Item name is required"),
    qty: z.number().min(1, "Qty must be at least 1"),
    unitPrice: z.number().min(0, "Price must be positive"),
});

const orderSchema = z.object({
    customer: z.object({
        name: z.string().min(2, "Customer name is required"),
        phone: z.string().min(7, "Valid phone number required"),
        email: z.string().email("Invalid email").optional().or(z.literal("")),
        address: z.string().min(5, "Address is required"),
        city: z.string().min(2, "City is required"),
    }),
    items: z.array(orderItemSchema).min(1, "At least one item is required"),
    shippingCost: z.number().min(0).default(0),
    discount: z.number().min(0).default(0),
    tax: z.number().min(0).default(0),
    notes: z.string().optional(),
});

type OrderFormValues = z.infer<typeof orderSchema>;

function formatPKR(n: number) {
    return `PKR ${n.toLocaleString("en-PK")}`;
}

// ── Input component ────────────────────────────────────────────────────────
function Field({
    label,
    error,
    children,
}: {
    label: string;
    error?: string;
    children: React.ReactNode;
}) {
    return (
        <div>
            <label className="label-luxury">{label}</label>
            {children}
            {error && <p className="mt-1 text-[11px] text-red-600">{error}</p>}
        </div>
    );
}

// ── Main Form ──────────────────────────────────────────────────────────────
export default function OrderForm() {
    const router = useRouter();
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const resolver = zodResolver(orderSchema) as any;

    const {
        register,
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<OrderFormValues>({
        resolver,
        defaultValues: {
            items: [{ productId: "manual", name: "", qty: 1, unitPrice: 0 }],
            shippingCost: 250,
            discount: 0,
            tax: 0,
        },
    });

    const { fields, append, remove } = useFieldArray({ control, name: "items" });

    // ── Real-time cost calculation ──────────────────────────────────────────
    const items = useWatch({ control, name: "items" });
    const shippingCost = useWatch({ control, name: "shippingCost" }) ?? 0;
    const discount = useWatch({ control, name: "discount" }) ?? 0;
    const tax = useWatch({ control, name: "tax" }) ?? 0;

    const subtotal = items.reduce(
        (sum, item) => sum + (Number(item.qty) || 0) * (Number(item.unitPrice) || 0),
        0
    );
    const total = subtotal + Number(shippingCost) + Number(tax) - Number(discount);

    // ── Submit ──────────────────────────────────────────────────────────────
    async function onSubmit(data: OrderFormValues) {
        setSubmitting(true);
        setSubmitError(null);
        try {
            const id = await createOrder({
                ...data,
                subtotal,
                total,
                notes: data.notes ?? "",
            });
            router.push(`/orders/${id}`);
        } catch (err) {
            setSubmitError("Failed to create order. Please check your connection.");
            console.error(err);
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* ── Customer Details ── */}
            <section>
                <div className="mb-5">
                    <span className="gold-line" />
                    <h2 className="heading-serif text-lg font-semibold text-[#0B0B0B]">Customer Details</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Full Name" error={errors.customer?.name?.message}>
                        <input
                            {...register("customer.name")}
                            className="input-luxury"
                            placeholder="e.g. Ayesha Tariq"
                        />
                    </Field>
                    <Field label="Phone Number" error={errors.customer?.phone?.message}>
                        <input
                            {...register("customer.phone")}
                            className="input-luxury"
                            placeholder="+92-300-0000000"
                            type="tel"
                        />
                    </Field>
                    <Field label="Email (optional)" error={errors.customer?.email?.message}>
                        <input
                            {...register("customer.email")}
                            className="input-luxury"
                            placeholder="customer@email.com"
                            type="email"
                        />
                    </Field>
                    <Field label="City" error={errors.customer?.city?.message}>
                        <input
                            {...register("customer.city")}
                            className="input-luxury"
                            placeholder="e.g. Lahore"
                        />
                    </Field>
                    <div className="sm:col-span-2">
                        <Field label="Delivery Address" error={errors.customer?.address?.message}>
                            <input
                                {...register("customer.address")}
                                className="input-luxury"
                                placeholder="House #, Street, Area, City"
                            />
                        </Field>
                    </div>
                </div>
            </section>

            {/* ── Order Items ── */}
            <section>
                <div className="mb-5 flex items-center justify-between">
                    <div>
                        <span className="gold-line" />
                        <h2 className="heading-serif text-lg font-semibold text-[#0B0B0B]">Order Items</h2>
                    </div>
                    <button
                        type="button"
                        onClick={() => append({ productId: "manual", name: "", qty: 1, unitPrice: 0 })}
                        className="btn btn-secondary text-xs gap-1.5"
                    >
                        <Plus size={13} />
                        Add Item
                    </button>
                </div>

                {errors.items?.root && (
                    <p className="mb-3 text-[11px] text-red-600">{errors.items.root.message}</p>
                )}

                <div className="space-y-3">
                    {fields.map((field, index) => (
                        <div
                            key={field.id}
                            className="bg-[#F8F9FA] border border-[#E5E7EB] p-4 animate-in"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <span className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest">
                                    Item {index + 1}
                                </span>
                                {fields.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => remove(index)}
                                        className="text-red-400 hover:text-red-600 transition-colors p-0.5"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                )}
                            </div>
                            <div className="grid grid-cols-12 gap-3">
                                <div className="col-span-12 sm:col-span-6">
                                    <label className="label-luxury">Item Name</label>
                                    <input
                                        {...register(`items.${index}.name`)}
                                        className="input-luxury"
                                        placeholder="e.g. Embroidered Lawn Suit"
                                    />
                                    {errors.items?.[index]?.name && (
                                        <p className="mt-1 text-[11px] text-red-600">
                                            {errors.items[index].name?.message}
                                        </p>
                                    )}
                                </div>
                                <div className="col-span-4 sm:col-span-2">
                                    <label className="label-luxury">Qty</label>
                                    <input
                                        {...register(`items.${index}.qty`, { valueAsNumber: true })}
                                        type="number"
                                        min={1}
                                        className="input-luxury"
                                    />
                                </div>
                                <div className="col-span-8 sm:col-span-4">
                                    <label className="label-luxury">Unit Price (PKR)</label>
                                    <input
                                        {...register(`items.${index}.unitPrice`, { valueAsNumber: true })}
                                        type="number"
                                        min={0}
                                        step={50}
                                        className="input-luxury"
                                        placeholder="0"
                                    />
                                </div>
                            </div>
                            {/* Line total */}
                            <div className="mt-2 text-right">
                                <span className="text-[11px] text-[#9CA3AF]">
                                    Line total:{" "}
                                    <strong className="text-[#0B0B0B]">
                                        {formatPKR((Number(items[index]?.qty) || 0) * (Number(items[index]?.unitPrice) || 0))}
                                    </strong>
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── Cost Summary ── */}
            <section>
                <div className="mb-5">
                    <span className="gold-line" />
                    <h2 className="heading-serif text-lg font-semibold text-[#0B0B0B]">Cost Breakdown</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                    <Field label="Shipping Cost (PKR)" error={errors.shippingCost?.message}>
                        <input
                            {...register("shippingCost", { valueAsNumber: true })}
                            type="number"
                            min={0}
                            step={50}
                            className="input-luxury"
                        />
                    </Field>
                    <Field label="Discount (PKR)" error={errors.discount?.message}>
                        <input
                            {...register("discount", { valueAsNumber: true })}
                            type="number"
                            min={0}
                            step={50}
                            className="input-luxury"
                        />
                    </Field>
                    <Field label="Tax (PKR)" error={errors.tax?.message}>
                        <input
                            {...register("tax", { valueAsNumber: true })}
                            type="number"
                            min={0}
                            step={50}
                            className="input-luxury"
                        />
                    </Field>
                </div>

                {/* Live calculation */}
                <div className="bg-[#0B0B0B] text-white p-5">
                    {[
                        { label: "Subtotal", value: subtotal },
                        { label: "Shipping", value: Number(shippingCost) },
                        { label: "Tax", value: Number(tax) },
                        { label: "Discount", value: -Number(discount) },
                    ].map(({ label, value }) => (
                        <div key={label} className="flex justify-between py-1.5 border-b border-white/10 last:border-0">
                            <span className="text-xs text-white/60 uppercase tracking-widest">{label}</span>
                            <span className={`text-sm font-medium ${value < 0 ? "text-red-400" : "text-white"}`}>
                                {value < 0 ? `- ${formatPKR(-value)}` : formatPKR(value)}
                            </span>
                        </div>
                    ))}
                    <div className="flex justify-between pt-3 mt-1">
                        <span className="font-serif text-white text-base font-semibold">Total</span>
                        <span className="font-serif text-[#C9A96E] text-xl font-semibold">
                            {formatPKR(Math.max(0, total))}
                        </span>
                    </div>
                </div>
            </section>

            {/* ── Notes ── */}
            <section>
                <Field label="Order Notes (optional)" error={errors.notes?.message}>
                    <textarea
                        {...register("notes")}
                        className="input-luxury resize-none"
                        rows={3}
                        placeholder="e.g. Gift wrap required, fragile items…"
                    />
                </Field>
            </section>

            {/* ── Submit ── */}
            {submitError && (
                <div className="bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                    {submitError}
                </div>
            )}

            <button type="submit" disabled={submitting} className="btn btn-primary w-full py-4 text-sm">
                {submitting ? (
                    <>
                        <Loader2 size={16} className="animate-spin" />
                        Creating Order…
                    </>
                ) : (
                    "Create Order"
                )}
            </button>
        </form>
    );
}
