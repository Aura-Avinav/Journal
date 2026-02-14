import { useState, useEffect } from 'react';
import { useStore } from '../hooks/useStore';
import { cn } from '../lib/utils';
import { Battery, BatteryLow, BatteryMedium, BatteryFull } from 'lucide-react';
import { format } from 'date-fns';

const MOODS = [
    { value: 1, emoji: '😫', label: 'Awful', color: 'bg-red-500/20 text-red-500 border-red-500/30' },
    { value: 2, emoji: '😕', label: 'Bad', color: 'bg-orange-500/20 text-orange-500 border-orange-500/30' },
    { value: 3, emoji: '😐', label: 'Okay', color: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30' },
    { value: 4, emoji: '🙂', label: 'Good', color: 'bg-lime-500/20 text-lime-500 border-lime-500/30' },
    { value: 5, emoji: '🤩', label: 'Great', color: 'bg-green-500/20 text-green-500 border-green-500/30' },
];

export function MoodSelector({ date }: { date: Date }) {
    const { data, updateMetric } = useStore();
    const dateStr = format(date, 'yyyy-MM-dd');

    // Find existing mood/energy for this day
    const existingMood = data.metrics.find(m => m.date === dateStr && m.label === 'mood');
    const existingEnergy = data.metrics.find(m => m.date === dateStr && m.label === 'energy');

    const [mood, setMood] = useState<number | null>(existingMood?.value || null);
    const [energy, setEnergy] = useState<number | null>(existingEnergy?.value || null);

    // Sync specific day selection
    useEffect(() => {
        const foundMood = data.metrics.find(m => m.date === dateStr && m.label === 'mood');
        const foundEnergy = data.metrics.find(m => m.date === dateStr && m.label === 'energy');
        setMood(foundMood?.value || null);
        setEnergy(foundEnergy?.value || null);
    }, [dateStr, data.metrics]);

    const handleMoodSelect = (value: number) => {
        setMood(value);
        updateMetric(dateStr, 'mood', value);
    };

    const handleEnergySelect = (value: number) => {
        setEnergy(value);
        updateMetric(dateStr, 'energy', value);
    };

    return (
        <div className="flex flex-col gap-6">
            {/* Mood Section */}
            <div>
                <h3 className="text-xs font-semibold text-secondary uppercase tracking-wider mb-3">Daily Mood</h3>
                <div className="grid grid-cols-5 gap-2">
                    {MOODS.map((m) => (
                        <button
                            key={m.value}
                            onClick={() => handleMoodSelect(m.value)}
                            className={cn(
                                "flex flex-col items-center justify-center p-3 rounded-xl border transition-all duration-300 group",
                                mood === m.value
                                    ? m.color + " scale-105 shadow-lg ring-2 ring-offset-2 ring-offset-background " + m.color.split(' ')[0].replace('/20', '')
                                    : "bg-surface/50 border-transparent hover:bg-surfaceHighlight text-secondary opacity-70 hover:opacity-100 hover:scale-105"
                            )}
                        >
                            <span className="text-2xl mb-1 filter drop-shadow-sm transition-transform duration-300 group-hover:scale-110">{m.emoji}</span>
                            <span className="text-[10px] font-medium">{m.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Energy Section */}
            <div>
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-semibold text-secondary uppercase tracking-wider">Energy Level</h3>
                    {energy && (
                        <span className={cn(
                            "text-xs font-bold px-2 py-0.5 rounded-full",
                            energy >= 8 ? "bg-green-500/20 text-green-500" :
                                energy >= 5 ? "bg-yellow-500/20 text-yellow-500" :
                                    "bg-red-500/20 text-red-500"
                        )}>
                            {energy}/10
                        </span>
                    )}
                </div>

                <div className="relative h-12 bg-surface/50 rounded-xl border border-surfaceHighlight flex items-center px-4 overflow-hidden group">
                    {/* Interactive Slider Area */}
                    <div className="absolute inset-0 z-10 grid grid-cols-10 opacity-0 hover:opacity-10 cursor-pointer">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(v => (
                            <div
                                key={v}
                                onClick={() => handleEnergySelect(v)}
                                className="h-full hover:bg-white transition-colors"
                            />
                        ))}
                    </div>

                    {/* Battery Icon */}
                    <div className="z-0 mr-4 text-secondary">
                        {energy === null ? <Battery className="w-5 h-5 opacity-50" /> :
                            energy >= 8 ? <BatteryFull className="w-5 h-5 text-green-500" /> :
                                energy >= 4 ? <BatteryMedium className="w-5 h-5 text-yellow-500" /> :
                                    <BatteryLow className="w-5 h-5 text-red-500" />
                        }
                    </div>

                    {/* Progress Bar */}
                    <div className="flex-1 h-2 bg-surfaceHighlight rounded-full overflow-hidden relative">
                        <div
                            className={cn(
                                "h-full rounded-full transition-all duration-500 ease-out",
                                !energy ? "w-0" :
                                    energy >= 8 ? "bg-gradient-to-r from-green-500 to-emerald-400" :
                                        energy >= 5 ? "bg-gradient-to-r from-yellow-500 to-orange-400" :
                                            "bg-gradient-to-r from-red-500 to-rose-400"
                            )}
                            style={{ width: `${(energy || 0) * 10}%` }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
