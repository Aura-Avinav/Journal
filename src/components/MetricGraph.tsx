import { useStore } from '../hooks/useStore';
import type { AppData } from '../types';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Activity } from 'lucide-react';
import { format, subDays, eachDayOfInterval } from 'date-fns';

export function MetricGraph({ date }: { date: Date }) {
    void date; // Silence unused warning
    const { data } = useStore();
    // For now, metrics are generic, but accepting date allows future filtering

    return (
        <div className="h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold flex items-center gap-2 text-foreground">
                    <Activity className="w-5 h-5 text-indigo-500" />
                    Productivity Flow
                </h3>
                <div className="flex items-center gap-2 bg-surfaceHighlight/30 rounded-md p-1">
                    <span className="text-[10px] text-secondary px-2 uppercase tracking-wider font-medium">Daily Score</span>
                </div>
            </div>

            <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={getChartData(data)}>
                        <defs>
                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                        <XAxis
                            dataKey="day"
                            stroke="#666"
                            tick={{ fontSize: 10, fill: '#6b7280' }}
                            tickLine={false}
                            axisLine={false}
                            dy={10}
                        />
                        <YAxis hide domain={[0, 10]} />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'rgba(24, 24, 27, 0.8)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '8px',
                                backdropFilter: 'blur(4px)'
                            }}
                            itemStyle={{ color: '#fff', fontSize: '12px' }}
                            cursor={{ stroke: 'rgba(255,255,255,0.1)' }}
                        />
                        <Area
                            type="basis"
                            dataKey="value"
                            stroke="#6366f1"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorValue)"
                            animationDuration={1500}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}


function getChartData(data: AppData) {
    // Generate last 14 days
    const days = eachDayOfInterval({
        start: subDays(new Date(), 13),
        end: new Date()
    });

    const metricsMap = new Map(data.metrics.map(m => [m.date, m.value]));

    return days.map(day => {
        const dateStr = format(day, 'yyyy-MM-dd');
        return {
            day: format(day, 'd'),
            value: metricsMap.get(dateStr) || 0
        };
    });
}
