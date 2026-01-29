import { useState } from 'react';
import { useStore } from '../hooks/useStore';
import { cn } from '../lib/utils';
import { Check, Plus, RefreshCw } from 'lucide-react';
import { format, getDaysInMonth } from 'date-fns';

export function HabitGrid() {
    const { data, toggleHabit, addHabit, resetProgress } = useStore();
    const today = new Date();
    const defaultYear = today.getFullYear();
    // Default to February (user request)
    const [selectedYear, setSelectedYear] = useState<number>(defaultYear);
    const [selectedMonth, setSelectedMonth] = useState<number>(1); // 0-indexed, 1 = February

    // Force February to 28 days per user request; otherwise compute normally
    const daysInMonth = selectedMonth === 1
        ? 28
        : getDaysInMonth(new Date(selectedYear, selectedMonth, 1));
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    const handleAddHabit = () => {
        const name = prompt("Enter new habit name:");
        if (name) addHabit(name);
    };

    const handleReset = () => {
        if (confirm('Reset all habit progress and switch view to February (28 days)?')) {
            resetProgress();
            setSelectedMonth(1);
            setSelectedYear(defaultYear);
            alert('Progress reset. View set to February (28 days).');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold tracking-tight text-primary">Protocols</h2>

                <div className="flex items-center gap-3">
                    <select
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(Number(e.target.value))}
                        className="bg-surfaceHighlight/50 border border-surfaceHighlight text-white text-sm rounded-lg p-2"
                    >
                        <option value={0}>Jan</option>
                        <option value={1}>Feb</option>
                        <option value={2}>Mar</option>
                        <option value={3}>Apr</option>
                        <option value={4}>May</option>
                        <option value={5}>Jun</option>
                        <option value={6}>Jul</option>
                        <option value={7}>Aug</option>
                        <option value={8}>Sep</option>
                        <option value={9}>Oct</option>
                        <option value={10}>Nov</option>
                        <option value={11}>Dec</option>
                    </select>

                    <button
                        onClick={handleAddHabit}
                        className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium bg-surfaceHighlight hover:bg-accent/20 text-secondary hover:text-accent rounded-md transition-colors border border-surfaceHighlight"
                    >
                        <Plus className="w-4 h-4" />
                        Add Protocol
                    </button>

                    <button
                        onClick={handleReset}
                        className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium bg-danger/10 hover:bg-danger/20 text-danger rounded-md transition-colors border border-danger/30"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Reset Progress
                    </button>
                </div>
            </div>

            <div className="relative overflow-x-auto border border-surfaceHighlight rounded-xl bg-surface/30 backdrop-blur-sm shadow-2xl pb-2">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs uppercase bg-surfaceHighlight/50 text-secondary">
                        <tr>
                            <th scope="col" className="sticky left-0 z-20 px-4 py-3 bg-surfaceHighlight/90 backdrop-blur-md min-w-[150px] border-r border-surfaceHighlight font-semibold">
                                Habit
                            </th>
                            {days.map(d => (
                                <th key={d} scope="col" className="px-1 py-3 text-center min-w-[32px] font-medium border-l border-surfaceHighlight/20">
                                    {d}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {data.habits.map((habit) => (
                            <tr key={habit.id} className="border-b border-surfaceHighlight/50 hover:bg-surfaceHighlight/10 transition-colors group">
                                <th scope="row" className="sticky left-0 z-20 px-4 py-3 font-medium text-primary bg-surface/95 backdrop-blur-md border-r border-surfaceHighlight whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px] group-hover:bg-surfaceHighlight/20 transition-colors">
                                    {habit.name}
                                </th>
                                {days.map(day => {
                                    // Construct date string YYYY-MM-DD reliably
                                    const dateObj = new Date(currentYear, currentMonth, day);
                                    // Format to YYYY-MM-DD local time manually to avoid timezone shifts if not careful, 
                                    // but date-fns format() handles Date objects well.
                                    // However, for consistency with 'completedDates' usually being strict ISO dates or 'YYYY-MM-DD'.
                                    // Let's use a helper or just strict string construction.
                                    const dateStr = format(dateObj, 'yyyy-MM-dd');

                                    const isCompleted = habit.completedDates.includes(dateStr);
                                    const isToday = day === today.getDate();

                                    return (
                                        <td key={day} className={cn(
                                            "p-0 text-center border-l border-surfaceHighlight/20 relative",
                                            isToday && "bg-accent/5"
                                        )}>
                                            <button
                                                onClick={() => toggleHabit(habit.id, dateStr)}
                                                className={cn(
                                                    "w-full h-10 flex items-center justify-center transition-all duration-200",
                                                    isCompleted ? "text-accent" : "text-surfaceHighlight/20 hover:text-secondary/50"
                                                )}
                                            >
                                                {isCompleted ? (
                                                    <Check className="w-5 h-5" strokeWidth={3} />
                                                ) : (
                                                    // Show a dot or X or nothing? The image shows X for some, Check for others?
                                                    // Actually the image shows Checks.
                                                    // User image row 1: X X Check X ...
                                                    // Let's stick to Check for completed, empty (or faint dot) for not.
                                                    <div className="w-1.5 h-1.5 rounded-full bg-current opacity-20" />
                                                )}
                                            </button>
                                        </td>
                                    )
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>

                {data.habits.length === 0 && (
                    <div className="p-8 text-center text-secondary">
                        No habits protocols defined. Add one to start tracking.
                    </div>
                )}
            </div>
        </div>
    );
}
