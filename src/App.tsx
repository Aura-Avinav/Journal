import { useState } from 'react';
import { Layout } from './components/Layout';
import { AuthPage } from './components/AuthPage';
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
  const { data, user } = useStore();

  if (!user) {
    return <AuthPage />;
  }

  const currentMonthName = currentDate.toLocaleString('default', { month: 'long' });
  const currentYear = currentDate.getFullYear();
  // ... rest of component starts ...

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
    <Layout currentView={view} onNavigate={setView} currentDate={currentDate}>
      {view === 'dashboard' ? (
        <div className="space-y-8 pb-10">
          <header className="flex flex-col gap-6 md:flex-row md:items-end justify-between border-b border-surfaceHighlight pb-6">
            <div className="space-y-4 flex-1">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-blue-100 to-secondary bg-clip-text text-transparent pb-1">
                  {isCurrentYear ? 'Year of Growth' : `${currentYear} Overview`}
                </h1>
                <p className="text-secondary text-lg mt-1">
                  {currentMonthName} {currentYear}
                </p>
              </div>

              {!isCurrentYear && (
                <button
                  onClick={() => handleMonthSelect(new Date())}
                  className="text-xs px-2 py-1 bg-accent/10 text-accent rounded hover:bg-accent/20 transition-colors"
                >
                  Back to Today
                </button>
              )}

              <div className="flex gap-8 max-w-md">
                <div className="flex-1 space-y-2">
                  <div className="flex justify-between text-xs font-medium text-secondary uppercase tracking-wider">
                    <span>Monthly Progress</span>
                    <span className="text-primary">{progress.monthly}%</span>
                  </div>
                  <div className="h-2 w-full bg-surfaceHighlight rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-1000 ease-out"
                      style={{ width: `${progress.monthly}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-end gap-2 shrink-0">
              <div className="px-4 py-2 bg-surfaceHighlight/30 rounded-xl border border-surfaceHighlight/50 backdrop-blur-sm text-center min-w-[120px]">
                <span className="block text-2xl font-bold text-foreground">{isCurrentMonth ? todayDate : daysInMonth}</span>
                <span className="text-xs text-secondary font-medium uppercase tracking-wider">
                  {isCurrentMonth ? 'Current Day' : 'Total Days'}
                </span>
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
