import React from 'react';
import { Book, CheckSquare, Settings } from 'lucide-react';
import { cn } from '../lib/utils';

interface LayoutProps {
    children: React.ReactNode;
    currentView: 'dashboard' | 'journal' | 'achievements';
    onNavigate: (view: 'dashboard' | 'journal' | 'achievements') => void;
}

export function Layout({ children, currentView, onNavigate }: LayoutProps) {
    return (
        <div className="min-h-screen bg-background text-foreground flex font-sans selection:bg-accent/20">
            {/* Sidebar - Desktop */}
            <aside className="w-16 md:w-64 border-r border-surfaceHighlight bg-surface/50 hidden md:flex flex-col p-4 fixed h-full z-10 backdrop-blur-md">
                <div className="flex items-center gap-3 mb-8 px-2">
                    <Book className="w-6 h-6 text-accent" />
                    <span className="text-xl font-bold tracking-tight hidden md:block">LifeOS</span>
                </div>

                <nav className="space-y-2">
                    <NavItem
                        icon={<CheckSquare />}
                        label="Tracker"
                        active={currentView === 'dashboard'}
                        onClick={() => onNavigate('dashboard')}
                    />
                    <NavItem
                        icon={<Book />}
                        label="Journal"
                        active={currentView === 'journal'}
                        onClick={() => onNavigate('journal')}
                    />
                    {/* <NavItem icon={<Award />} label="Achievements" /> */}
                    {/* <NavItem icon={<BarChart />} label="Analytics" /> */}
                </nav>

                <div className="mt-auto">
                    <NavItem icon={<Settings />} label="Settings" />
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 md:ml-64 p-4 md:p-8 overflow-x-hidden w-full max-w-[1920px] mx-auto animate-in fade-in duration-500">
                <div className="max-w-7xl mx-auto">
                    {children}
                </div>
            </main>

            {/* Mobile Nav could go here (bottom bar) */}
        </div>
    );
}

function NavItem({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick?: () => void }) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 group",
                active
                    ? "bg-accent/10 text-accent"
                    : "text-secondary hover:bg-surfaceHighlight hover:text-primary"
            )}>
            <div className="w-5 h-5 flex-shrink-0 group-hover:scale-110 transition-transform">{icon}</div>
            <span className="font-medium hidden md:block">{label}</span>
        </button>
    )
}
