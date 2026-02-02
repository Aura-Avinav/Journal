import { useState } from 'react';
import { useStore } from '../hooks/useStore';
import { cn } from '../lib/utils';
import { Check, Plus, Trash2, Sparkles } from 'lucide-react';
import { format, getDaysInMonth } from 'date-fns';
import { Modal, Button } from './ui/Modal';

export function HabitGrid({ date }: { date: Date }) {
    const { data, toggleHabit, addHabit, removeHabit } = useStore();
    const currentYear = date.getFullYear();
    const currentMonth = date.getMonth(); // 0-indexed

    const daysInMonth = getDaysInMonth(date);
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    // Modal State
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [newHabitName, setNewHabitName] = useState('');
    const [habitToDelete, setHabitToDelete] = useState<{ id: string, name: string } | null>(null);

    const handleAddClick = () => {
        setNewHabitName('');
        setIsAddModalOpen(true);
    };

    const confirmAddHabit = () => {
        if (newHabitName.trim()) {
            addHabit(newHabitName.trim());
            setIsAddModalOpen(false);
        }
    };

    const handleDeleteClick = (id: string, name: string) => {
        setHabitToDelete({ id, name });
        setIsDeleteModalOpen(true);
    };

    const confirmDeleteHabit = () => {
        if (habitToDelete) {
            removeHabit(habitToDelete.id);
            setHabitToDelete(null);
            setIsDeleteModalOpen(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold tracking-tight text-primary">Habit Tracker</h2>
                <button
                    onClick={handleAddClick}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium bg-surfaceHighlight hover:bg-accent/20 text-secondary hover:text-accent rounded-md transition-colors border border-surfaceHighlight"
                >
                    <Plus className="w-4 h-4" />
                    Add Protocol
                </button>
            </div>

            <div className="relative overflow-x-auto">
                <table className="w-full text-sm text-left border-separate border-spacing-0">
                    <thead className="text-xs uppercase text-secondary">
                        <tr>
                            <th scope="col" className="sticky left-0 z-20 px-4 py-3 bg-background/95 backdrop-blur-md min-w-[150px] font-semibold text-primary/80 border-b border-surfaceHighlight/20">
                                Habit
                            </th>
                            {days.map(d => (
                                <th key={d} scope="col" className="px-1 py-3 text-center min-w-[32px] font-medium border-b border-surfaceHighlight/20 text-secondary/70">
                                    {d}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {data.habits.map((habit) => (
                            <tr key={habit.id} className="group hover:bg-surfaceHighlight/5 transition-colors">
                                <th scope="row" className="sticky left-0 z-20 px-4 py-3 font-medium text-primary bg-background/95 backdrop-blur-md whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px] border-b border-surfaceHighlight/10">
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="truncate">{habit.name}</span>
                                        <button
                                            onClick={() => handleDeleteClick(habit.id, habit.name)}
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
                                    const dateStr = format(dateObj, 'yyyy-MM-dd');

                                    const isCompleted = habit.completedDates.includes(dateStr);

                                    // Highlight today if looking at current month/year
                                    const today = new Date();
                                    const isToday = day === today.getDate() &&
                                        currentMonth === today.getMonth() &&
                                        currentYear === today.getFullYear();

                                    // Check if date is in the future
                                    const isFuture = dateObj > new Date(new Date().setHours(23, 59, 59, 999));

                                    return (
                                        <td key={day} className={cn(
                                            "p-0 text-center border-b border-surfaceHighlight/10 relative",
                                            isToday && "bg-accent/5",
                                            isFuture && "bg-surface/5"
                                        )}>
                                            <button
                                                onClick={() => !isFuture && toggleHabit(habit.id, dateStr)}
                                                disabled={isFuture}
                                                className={cn(
                                                    "w-full h-10 flex items-center justify-center transition-all duration-200",
                                                    isFuture ? "cursor-not-allowed opacity-20" :
                                                        isCompleted ? "text-accent scale-110" : "text-surfaceHighlight/20 hover:text-secondary/50 hover:scale-105"
                                                )}
                                            >
                                                {isCompleted ? (
                                                    <Check className="w-5 h-5 shadow-sm" strokeWidth={3} />
                                                ) : (
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
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="w-16 h-16 bg-surfaceHighlight/30 rounded-full flex items-center justify-center mb-4 text-accent animate-pulse">
                            <Sparkles className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-bold text-primary mb-2">Start Your Journey</h3>
                        <p className="text-secondary max-w-sm mb-6">
                            "We are what we repeatedly do. Excellence, then, is not an act, but a habit."
                        </p>
                        <button
                            onClick={handleAddClick}
                            className="px-6 py-2.5 bg-accent text-background font-bold rounded-lg hover:bg-accent/90 focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-accent/20"
                        >
                            Create First Protocol
                        </button>
                    </div>
                )}
            </div>

            {/* Add Habit Modal */}
            <Modal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                title="Add New Protocol"
            >
                <div className="space-y-4">
                    <div>
                        <label htmlFor="habitName" className="block text-sm font-medium text-secondary mb-1">
                            Protocol Name
                        </label>
                        <input
                            id="habitName"
                            type="text"
                            value={newHabitName}
                            onChange={(e) => setNewHabitName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && confirmAddHabit()}
                            placeholder="e.g. Read 30 mins"
                            className="w-full bg-surfaceHighlight/10 border border-surfaceHighlight rounded-md px-3 py-2 text-primary focus:outline-none focus:ring-2 focus:ring-accent/50"
                            autoFocus
                        />
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <Button variant="secondary" onClick={() => setIsAddModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={confirmAddHabit} disabled={!newHabitName.trim()}>
                            Add Protocol
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Delete Habit Modal */}
            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                title="Remove Protocol"
            >
                <div className="space-y-4">
                    <p className="text-secondary">
                        Are you sure you want to remove <span className="text-primary font-medium">"{habitToDelete?.name}"</span>?
                        <br />
                        This action cannot be undone.
                    </p>
                    <div className="flex justify-end gap-3 pt-2">
                        <Button variant="secondary" onClick={() => setIsDeleteModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="danger" onClick={confirmDeleteHabit}>
                            Remove
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
