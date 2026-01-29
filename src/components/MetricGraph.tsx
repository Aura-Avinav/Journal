import { useStore } from '../hooks/useStore';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Activity } from 'lucide-react';
import { format, subDays, eachDayOfInterval } from 'date-fns';

export function MetricGraph() {
    const { data } = useStore();

    return (
        <div className="p-6 border border-surfaceHighlight rounded-xl bg-surface/30 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold flex items-center gap-2 text-primary">
                    <Activity className="w-5 h-5 text-purple-500" />
                    Productivity Flow
                </h3>
                <div className="flex items-center gap-2 bg-surfaceHighlight/50 rounded-lg p-1">
                    <span className="text-xs text-secondary px-2">Daily Score</span>
                </div>
            </div>

            <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={getChartData(data)}>
                        <defs>
                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                        <XAxis
                            dataKey="day"
                            stroke="#666"
                            tick={{ fontSize: 12 }}
                            tickLine={false}
                            axisLine={false}
                        />
                        <YAxis hide domain={[0, 10]} />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#18181b', border: '1px solid #333' }}
                            itemStyle={{ color: '#fff' }}
                        />
                        <Area
                            type="monotone"
                            dataKey="value"
                            stroke="#8b5cf6"
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#colorValue)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

// @ts-ignore - Ignoring unused data param warning for mock function
function getChartData(data: any) {
    const days = eachDayOfInterval({
        start: subDays(new Date(), 13),
        end: new Date()
    });

    return days.map(day => {
        // const dateStr = format(day, 'yyyy-MM-dd');
        const seed = day.getDate();
        const mockValue = 4 + (seed % 5);

        return {
            day: format(day, 'd'),
            value: mockValue
        };
    });
}
