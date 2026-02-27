'use client';

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface InventoryValuationChartProps {
    data: any[];
}

export default function InventoryValuationChart({ data }: InventoryValuationChartProps) {
    return (
        <div className="card-luxury p-6 h-[400px]">
            <h3 className="text-lg font-display mb-6">Inventory Valuation Trend</h3>
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                    data={data}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                    <defs>
                        <linearGradient id="colorValuation" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#000000" stopOpacity={0.1} />
                            <stop offset="95%" stopColor="#000000" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis
                        dataKey="date"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#6B7280', fontSize: 12, fontFamily: 'monospace' }}
                        dy={10}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#6B7280', fontSize: 12, fontFamily: 'monospace' }}
                        tickFormatter={(value) => `$${value}`}
                        dx={-10}
                    />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#000000', color: '#FFFFFF', border: 'none', borderRadius: '0', fontFamily: 'monospace' }}
                    />
                    <Area
                        type="monotone"
                        dataKey="valuation"
                        stroke="#000000"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorValuation)"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
