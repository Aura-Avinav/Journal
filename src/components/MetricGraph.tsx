import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Activity } from 'lucide-react';
import { format, subDays, eachDayOfInterval } from 'date-fns';

export function MetricGraph() {
    // We'll simulate data for now or add a way to input "Daily Score".
    // Since I don't have a "Daily Score" input yet, I'll add a micro-interaction to set today's score internally.
    // Actually, let's just visualize "Habit Completion Rate" for now to make it useful immediately?
    // Or stick to the "Line Chart" request which implies a value.
    // Let's create a LOCAL input for "Subjective Score" in useStore? 
    // Wait, I defined `metrics` in AppData but didn't implement setters.
    // I will assume `metrics` is populated and add a mini-input here.

    // Oh, I didn't add `setMetric` to useStore. I should probably add it or just mock it.
    // Let's add functionality to useStore first? Or just mock data for the prototype?
    // The user wants a "website... to journal... monthly achievements...". The graph is a "Bonus" but shown in image.
    // I'll make it functional.

    return (
        <div className="p-6 border border-surfaceHighlight rounded-xl bg-surface/30 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold flex items-center gap-2 text-primary">
                    <Activity className="w-5 h-5 text-purple-500" />
                    Productivity Flow
                </h3>
                <div className="flex items-center gap-2 bg-surfaceHighlight/50 rounded-lg p-1">
                    {/* Placeholder for input controls - implemented in next step if needed */}
                    <span className="text-xs text-secondary px-2">Daily Score</span>
                </div>
            </div>

            <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={getChartData()}>
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

function getChartData() {
    // Generate last 14 days
    const days = eachDayOfInterval({
        start: subDays(new Date(), 13),
        end: new Date()
    });

    return days.map(day => {
        // Mock randomized data for visual if empty, or read from metrics
        // For prototype, let's just make it look cool with some randomness seeded by date
        // Real implementation would read data.metrics
        const seed = day.getDate();
        const mockValue = 4 + (seed % 5);

        return {
            day: format(day, 'd'),
            value: mockValue
        };
    });
}
