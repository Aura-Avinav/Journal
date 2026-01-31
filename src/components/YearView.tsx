import { format, differenceInCalendarDays, startOfYear, endOfYear } from 'date-fns';
import { useStore } from '../hooks/useStore';

interface YearViewProps {
    onSelectMonth: (date: Date) => void;
}

export function YearView({ onSelectMonth }: YearViewProps) {
    const year = 2026;
    const months = Array.from({ length: 12 }, (_, i) => new Date(year, i, 1));
    const { data } = useStore();

    // Calculate Yearly Progress
    const calculateYearlyProgress = () => {
        const habits = data.habits;
        if (habits.length === 0) return 0;

        const currentDate = new Date();
        const viewDate = new Date(year, 0, 1);
        const isCurrentYear = currentDate.getFullYear() === year;

        // If viewing future year, progress is 0. If past, it's based on full year.
        if (year > currentDate.getFullYear()) return 0;

        // Days elapsed calculation
        const daysElapsedInYear = isCurrentYear
            ? differenceInCalendarDays(currentDate, startOfYear(viewDate)) + 1
            : differenceInCalendarDays(endOfYear(viewDate), startOfYear(viewDate)) + 1;

        const totalPossibleYearly = habits.length * daysElapsedInYear;

        let yearlyCompleted = 0;
        habits.forEach(habit => {
            habit.completedDates.forEach(dateStr => {
                const date = new Date(dateStr);
                if (date.getFullYear() === year) {
                    yearlyCompleted++;
                }
            });
        });

        return totalPossibleYearly > 0 ? Math.round((yearlyCompleted / totalPossibleYearly) * 100) : 0;
    };

    const yearlyProgress = calculateYearlyProgress();

    return (
        <div className="space-y-8 pb-10">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-surfaceHighlight pb-6">
                <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-white to-secondary bg-clip-text text-transparent flex items-center gap-4">
                        {year} Overview
                        <span className="text-2xl opacity-80 font-normal text-white">
                            {yearlyProgress}%
                        </span>
                    </h1>
                    <p className="text-secondary mt-1 text-lg">
                        Year at a Glance
                    </p>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
                {months.map((monthDate) => (
                    <button
                        key={monthDate.toString()}
                        onClick={() => {
                            console.log("Month selected:", monthDate);
                            onSelectMonth(monthDate);
                        }}
                        className="w-full text-left bg-surface/30 backdrop-blur-sm border border-surfaceHighlight rounded-xl p-6 hover:bg-surfaceHighlight/10 transition-colors group cursor-pointer"
                    >
                        <h3 className="text-2xl font-bold text-primary mb-2 group-hover:text-accent transition-colors">
                            {format(monthDate, 'MMMM')}
                        </h3>
                        <p className="text-secondary opacity-60">
                            {format(monthDate, 'yyyy')}
                        </p>
                        {/* Placeholder for future summary stats */}
                        <div className="mt-4 flex gap-2">
                            <div className="h-1.5 w-full bg-surfaceHighlight/30 rounded-full overflow-hidden">
                                <div className="h-full bg-accent/50 w-0 group-hover:w-full transition-all duration-1000" />
                            </div>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}
