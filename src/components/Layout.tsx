import React from 'react';
import { Book, CheckSquare, Settings, Calendar, Trash2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { useStore } from '../hooks/useStore';

interface LayoutProps {
    children: React.ReactNode;
    currentView: 'dashboard' | 'journal' | 'achievements' | 'year' | 'settings';
    onNavigate: (view: 'dashboard' | 'journal' | 'achievements' | 'year' | 'settings') => void;
}

export function Layout({ children, currentView, onNavigate }: LayoutProps) {
    return (
        <div className="min-h-screen bg-background text-foreground flex font-sans selection:bg-accent/20">
            {/* Sidebar - Desktop */}
            <aside className="w-16 md:w-64 border-r border-surfaceHighlight bg-surface/50 hidden md:flex flex-col p-4 fixed h-full z-10 backdrop-blur-md">
                <div className="flex items-center gap-3 mb-8 px-2">
                    <Book className="w-6 h-6 text-accent" />
                    <span className="text-2xl font-bold tracking-tighter lowercase font-mono hidden md:block">ituts</span>
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
                    <NavItem
                        icon={<Calendar />}
                        label="2026 Overview"
                        active={currentView === 'year'}
                        onClick={() => onNavigate('year')}
                    />
                    {/* <NavItem icon={<Award />} label="Achievements" /> */}
                    {/* <NavItem icon={<BarChart />} label="Analytics" /> */}
                </nav>

                <div className="mt-auto space-y-2">
                    <ResetButton />
                    <NavItem
                        icon={<Settings />}
                        label="Settings"
                        active={currentView === 'settings'}
                        onClick={() => onNavigate('settings')}
                    />
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



import { Modal } from './ui/Modal';

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

function ResetButton() {
    const { resetData } = useStore();
    const [isConfirmOpen, setIsConfirmOpen] = React.useState(false);

    return (
        <>
            <NavItem
                icon={<Trash2 className="text-red-400" />}
                label="Reset Data"
                onClick={() => setIsConfirmOpen(true)}
            />

            <Modal
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                title="Reset All Data?"
            >
                <div className="space-y-4">
                    <p className="text-secondary">
                        This will <span className="text-red-400 font-bold">permanently delete</span> all your habits, todos, and achievements. This action cannot be undone.
                    </p>
                    <div className="flex justify-end gap-2">
                        <button
                            onClick={() => setIsConfirmOpen(false)}
                            className="px-4 py-2 rounded-lg font-medium bg-surfaceHighlight text-secondary hover:text-foreground hover:bg-surfaceHighlight/80 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => {
                                resetData();
                                setIsConfirmOpen(false);
                            }}
                            className="px-4 py-2 rounded-lg font-medium bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20 transition-colors"
                        >
                            Reset Everything
                        </button>
                    </div>
                </div>
            </Modal>
        </>
    );
}
