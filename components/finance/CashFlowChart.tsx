'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface CashFlowChartProps {
    data: any[];
}

export default function CashFlowChart({ data }: CashFlowChartProps) {
    return (
        <div className="card-luxury p-6 h-[400px]">
            <h3 className="text-lg font-display mb-6">Monthly Cash Flow</h3>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={data}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis
                        dataKey="month"
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
                        cursor={{ fill: '#F8F9FA' }}
                        contentStyle={{ backgroundColor: '#000000', color: '#FFFFFF', border: 'none', borderRadius: '0', fontFamily: 'monospace' }}
                    />
                    <Legend iconType="square" wrapperStyle={{ paddingTop: '20px' }} />
                    <Bar dataKey="cashIn" name="Sales" fill="#000000" radius={[2, 2, 0, 0]} />
                    <Bar dataKey="cashOut" name="Cost" fill="#D4AF37" radius={[2, 2, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
