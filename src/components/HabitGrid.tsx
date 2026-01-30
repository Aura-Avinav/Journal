import { useStore } from '../hooks/useStore';
import { cn } from '../lib/utils';
import { Check, Plus, Trash2 } from 'lucide-react';
import { format, getDaysInMonth } from 'date-fns';

export function HabitGrid({ date }: { date: Date }) {
    const { data, toggleHabit, addHabit, removeHabit } = useStore();
    const currentYear = date.getFullYear();
    const currentMonth = date.getMonth(); // 0-indexed

    const daysInMonth = getDaysInMonth(date);
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    const handleAddHabit = () => {
        const name = prompt("Enter new habit name:");
        if (name) addHabit(name);
    };

    const handleRemoveHabit = (id: string, name: string) => {
        if (confirm(`Are you sure you want to remove "${name}"?`)) {
            removeHabit(id);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold tracking-tight text-primary">Productivity Flow</h2>
                <button
                    onClick={handleAddHabit}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium bg-surfaceHighlight hover:bg-accent/20 text-secondary hover:text-accent rounded-md transition-colors border border-surfaceHighlight"
                >
                    <Plus className="w-4 h-4" />
                    Add Protocol
                </button>
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
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="truncate">{habit.name}</span>
                                        <button
                                            onClick={() => handleRemoveHabit(habit.id, habit.name)}
                                            className="opacity-0 group-hover:opacity-100 text-secondary hover:text-red-500 transition-all"
                                            title="Remove habit"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
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

                                    // Highlight today if looking at current month/year
                                    const today = new Date();
                                    const isToday = day === today.getDate() &&
                                        currentMonth === today.getMonth() &&
                                        currentYear === today.getFullYear();

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
                        No flow defined. Add a protocol to start tracking.
                    </div>
                )}
            </div>
        </div>
    );
}
