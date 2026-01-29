import { useState } from 'react';
import { Layout } from './components/Layout';
import { HabitGrid } from './components/HabitGrid';
import { AchievementBoard } from './components/AchievementBoard';
import { WeeklyTodo } from './components/WeeklyTodo';
import { JournalEditor } from './components/JournalEditor';
import { MetricGraph } from './components/MetricGraph';

type ViewState = 'dashboard' | 'journal' | 'achievements';

function App() {
  const [view, setView] = useState<ViewState>('dashboard');
  const currentMonthName = new Date().toLocaleString('default', { month: 'long' });

  return (
    <Layout currentView={view} onNavigate={setView}>
      {view === 'dashboard' ? (
        <div className="space-y-8 pb-10">
          <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-surfaceHighlight pb-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-white to-secondary bg-clip-text text-transparent">
                Year of Growth
              </h1>
              <p className="text-secondary mt-1 text-lg">
                {currentMonthName} Dashboard
              </p>
            </div>
            <div className="text-right hidden md:block">
              <div className="text-sm text-secondary font-mono">
                Day {new Date().getDate()} / {new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate()}
              </div>
            </div>
          </header>

          {/* Section 1: Protocols (Habits) */}
          <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
            <HabitGrid />
          </section>

          {/* Section 2: Achievements & ToDo */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
            <AchievementBoard />
            <WeeklyTodo />
          </section>

          {/* Section 3: Metrics */}
          <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
            <MetricGraph />
          </section>
        </div>
      ) : (
        <JournalEditor />
      )}
    </Layout>
  );
}

export default App;
