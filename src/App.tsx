import { useState } from 'react';
import { Layout } from './components/Layout';
import { HabitGrid } from './components/HabitGrid';
import { AchievementBoard } from './components/AchievementBoard';
import { WeeklyTodo } from './components/WeeklyTodo';
import { JournalEditor } from './components/JournalEditor';
import { MetricGraph } from './components/MetricGraph';
import { YearView } from './components/YearView';
import { SettingsView } from './components/SettingsView';
import { getDaysInMonth } from 'date-fns';

type ViewState = 'dashboard' | 'journal' | 'achievements' | 'year' | 'settings';

function App() {
  const [view, setView] = useState<ViewState>('dashboard');
  const [currentDate, setCurrentDate] = useState(new Date());

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

  const dayDisplay = isCurrentMonth
    ? `Day ${todayDate} / ${daysInMonth}`
    : `${daysInMonth} Days`;

  return (
    <Layout currentView={view} onNavigate={setView}>
      {view === 'dashboard' ? (
        <div className="space-y-8 pb-10">
          <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-surfaceHighlight pb-6">
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
              <p className="text-secondary mt-1 text-lg">
                {currentMonthName} {currentYear} Dashboard
              </p>
            </div>
            <div className="text-right hidden md:block">
              <div className="text-sm text-secondary font-mono">
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
