
import { useMemo } from 'react';
import { getDaysInMonth, differenceInCalendarDays, startOfYear, endOfYear, format } from 'date-fns';
import type { Habit } from '../types';

export const useProgress = (habits: Habit[] = [], currentDate: Date) => {
    const progress = useMemo(() => {
        const currentMonthStr = format(currentDate, 'yyyy-MM');
        const currentYear = currentDate.getFullYear();
        const daysInMonth = getDaysInMonth(currentDate);
        const todayDate = new Date().getDate();
        const isCurrentMonth = new Date().getMonth() === currentDate.getMonth() && new Date().getFullYear() === currentDate.getFullYear();
        const isRealCurrentYear = new Date().getFullYear() === currentYear;

        // Filter habits: active if they are global OR match the current month
        const activeHabits = habits.filter(h => !h.month || h.month === currentMonthStr);

        if (activeHabits.length === 0) return { monthly: 0, yearly: 0 };

        // Monthly Progress
        let monthlyCompleted = 0;
        const totalPossibleMonthly = activeHabits.length * daysInMonth;

        // Yearly Progress (Using ALL habits logic)
        let yearlyCompleted = 0;
        const daysElapsedInYear = isRealCurrentYear
            ? differenceInCalendarDays(new Date(), startOfYear(currentDate)) + 1
            : differenceInCalendarDays(endOfYear(currentDate), startOfYear(currentDate)) + 1;
        const totalPossibleYearly = habits.length * daysElapsedInYear;

        // Calculate Monthly Completions (using activeHabits)
        activeHabits.forEach(habit => {
            habit.completedDates.forEach(dateStr => {
                const date = new Date(dateStr);
                if (date.getMonth() === currentDate.getMonth() && date.getFullYear() === currentYear) {
                    const isFuture = isCurrentMonth && date.getDate() > todayDate;
                    if (!isFuture) {
                        monthlyCompleted++;
                    }
                }
            });
        });

        // Calculate Yearly Completions (using ALL habits)
        habits.forEach(habit => {
            habit.completedDates.forEach(dateStr => {
                const date = new Date(dateStr);
                if (date.getFullYear() === currentYear) {
                    const isFuture = isRealCurrentYear && date > new Date();
                    if (!isFuture) {
                        yearlyCompleted++;
                    }
                }
            });
        });

        return {
            monthly: totalPossibleMonthly > 0 ? Math.min(100, Math.round((monthlyCompleted / totalPossibleMonthly) * 100)) : 0,
            yearly: totalPossibleYearly > 0 ? Math.min(100, Math.round((yearlyCompleted / totalPossibleYearly) * 100)) : 0
        };
    }, [habits, currentDate]);

    return progress;
};
