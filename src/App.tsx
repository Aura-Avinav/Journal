import { useState } from 'react';
import { Layout } from './components/Layout';
import { HabitGrid } from './components/HabitGrid';
import { AchievementBoard } from './components/AchievementBoard';
import { WeeklyTodo } from './components/WeeklyTodo';
import { JournalEditor } from './components/JournalEditor';
import { MetricGraph } from './components/MetricGraph';
import { YearView } from './components/YearView';
import { SettingsView } from './components/SettingsView';
import { getDaysInMonth, differenceInCalendarDays, startOfYear, endOfYear } from 'date-fns';
import { useStore } from './hooks/useStore';

type ViewState = 'dashboard' | 'journal' | 'achievements' | 'year' | 'settings';

function App() {
  const [view, setView] = useState<ViewState>('dashboard');
  const [currentDate, setCurrentDate] = useState(new Date());
  const { data } = useStore();

  const currentMonthName = currentDate.toLocaleString('default', { month: 'long' });
  const currentYear = currentDate.getFullYear();

  const handleMonthSelect = (date: Date) => {
    setCurrentDate(date);
    setView('dashboard'); // Switch to dashboard to see that month
  };

  const isCurrentYear = new Date().getFullYear() === currentYear && new Date().getMonth() === currentDate.getMonth();

  // Day Count Logic
  const daysInMonth = getDaysInMonth(currentDate);
  const todayDate = new Date().getDate();
  const isCurrentMonth = new Date().getMonth() === currentDate.getMonth() && new Date().getFullYear() === currentDate.getFullYear();
  const isRealCurrentYear = new Date().getFullYear() === currentYear;

  const dayDisplay = isCurrentMonth
    ? `Day ${todayDate} / ${daysInMonth}`
    : `${daysInMonth} Days`;

  // Progress Calculations
  const calculateProgress = () => {
    const habits = data.habits;
    if (habits.length === 0) return { monthly: 0, yearly: 0 };

    // Monthly Progress
    let monthlyCompleted = 0;
    const daysElapsedInMonth = isCurrentMonth ? todayDate : daysInMonth;
    const totalPossibleMonthly = habits.length * daysElapsedInMonth;

    // Yearly Progress
    let yearlyCompleted = 0;
    const daysElapsedInYear = isRealCurrentYear
      ? differenceInCalendarDays(new Date(), startOfYear(currentDate)) + 1
      : differenceInCalendarDays(endOfYear(currentDate), startOfYear(currentDate)) + 1;
    const totalPossibleYearly = habits.length * daysElapsedInYear;

    habits.forEach(habit => {
      habit.completedDates.forEach(dateStr => {
        const date = new Date(dateStr);
        // Monthly check
        if (date.getMonth() === currentDate.getMonth() && date.getFullYear() === currentYear) {
          // Only count if within "elapsed" days (future days shouldn't count mainly to cap at 100% logically, 
          // but technically user can't check future dates usually. Let's just count all for simplicty if they checked it)
          // Actually, strictly following "elapsed" denominator means we should count all found completions 
          // but if user checked future days it might go > 100%. 
          // For now assuming no future checks possible.
          monthlyCompleted++;
        }
        // Yearly check
        if (date.getFullYear() === currentYear) {
          yearlyCompleted++;
        }
      });
    });

    return {
      monthly: totalPossibleMonthly > 0 ? Math.round((monthlyCompleted / totalPossibleMonthly) * 100) : 0,
      yearly: totalPossibleYearly > 0 ? Math.round((yearlyCompleted / totalPossibleYearly) * 100) : 0
    };
  };

  const progress = calculateProgress();

  return (
    <Layout currentView={view} onNavigate={setView}>
      {view === 'dashboard' ? (
        <div className="space-y-8 pb-10">
          <header className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-surfaceHighlight pb-6">
            <div>
              <div className="flex items-center gap-4">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-white to-secondary bg-clip-text text-transparent">
                  {isCurrentYear ? 'Year of Growth' : `${currentYear} Overview`}
                </h1>
                {!isCurrentYear && (
                  <button
                    onClick={() => handleMonthSelect(new Date())}
                    className="text-xs px-2 py-1 bg-accent/10 text-accent rounded hover:bg-accent/20 transition-colors"
                  >
                    Back to Today
                  </button>
                )}
              </div>
              <div className="flex items-center gap-6 mt-2">
                <p className="text-secondary text-lg">
                  {currentMonthName} {currentYear} Dashboard
                </p>
                <div className="flex items-center gap-4 text-sm font-medium">
                  <div className="px-3 py-1 rounded-full bg-surfaceHighlight/30 text-primary border border-surfaceHighlight/50 backdrop-blur-sm">
                    Monthly: {progress.monthly}%
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-end gap-2">
              {/* Professional Progress Box */}
              <div className="flex items-center gap-3 bg-surfaceHighlight/10 border border-surfaceHighlight/20 rounded-xl p-3 px-5 backdrop-blur-md">
                <div className="flex flex-col items-end">
                  <span className="text-xs uppercase tracking-wider text-secondary font-medium">Year Completion</span>
                  <span className="text-2xl font-bold text-primary">{progress.yearly}%</span>
                </div>
                <div className="h-10 w-10 rounded-full border-2 border-surfaceHighlight/30 flex items-center justify-center relative">
                  {/* Simple visual indicator */}
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-surfaceHighlight/30"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                    />
                    <path
                      className="text-accent"
                      strokeDasharray={`${progress.yearly}, 100`}
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                    />
                  </svg>
                </div>
              </div>

              <div className="text-sm text-secondary font-mono hidden md:block">
                {dayDisplay}
              </div>
            </div>
          </header>

          {/* Section 1: Protocols (Habits) */}
          <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
            <HabitGrid date={currentDate} />
          </section>

          {/* Section 2: Achievements & ToDo */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
            <AchievementBoard date={currentDate} />
            <WeeklyTodo />
          </section>

          {/* Section 3: Metrics */}
          <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
            <MetricGraph date={currentDate} />
          </section>
        </div>
      ) : view === 'journal' ? (
        <JournalEditor />
      ) : view === 'year' ? (
        <YearView onSelectMonth={handleMonthSelect} />
      ) : view === 'settings' ? (
        <SettingsView onBack={() => setView('dashboard')} />
      ) : null}
    </Layout>
  );
}

export default App;
