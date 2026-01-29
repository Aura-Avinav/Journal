import { useStore } from '../hooks/useStore';
import { Award, Plus, Trash2 } from 'lucide-react';

export function AchievementBoard() {
    const { data, addAchievement, removeAchievement } = useStore();
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM

    const monthAchievements = data.achievements.filter(a => a.month === currentMonth);

    const handleAdd = () => {
        const text = prompt("What did you achieve?");
        if (text) addAchievement(text);
    };

    return (
        <div className="h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold flex items-center gap-2 text-primary">
                    <Award className="w-5 h-5 text-accent" />
                    Achievements
                </h3>
                <button
                    onClick={handleAdd}
                    className="p-1.5 hover:bg-surfaceHighlight rounded-md transition-colors text-secondary hover:text-primary"
                >
                    <Plus className="w-4 h-4" />
                </button>
            </div>

            <div className="flex-1 bg-surface/30 border border-surfaceHighlight rounded-xl p-4 overflow-y-auto min-h-[300px]">
                {monthAchievements.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center text-secondary/50">
                        <Award className="w-12 h-12 mb-2 opacity-20" />
                        <p className="text-sm">No achievements yet.</p>
                        <button onClick={handleAdd} className="mt-4 text-accent text-sm hover:underline">Add your first win</button>
                    </div>
                ) : (
                    <ul className="space-y-3">
                        {monthAchievements.map((achievement, index) => (
                            <li key={achievement.id} className="group flex items-start gap-3 p-3 rounded-lg hover:bg-surfaceHighlight/30 transition-colors border border-transparent hover:border-surfaceHighlight/50">
                                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-accent/10 text-accent flex items-center justify-center text-xs font-bold font-mono mt-0.5">
                                    {index + 1}
                                </span>
                                <span className="flex-1 text-sm text-foreground/90 leading-relaxed">
                                    {achievement.text}
                                </span>
                                <button
                                    onClick={() => removeAchievement(achievement.id)}
                                    className="opacity-0 group-hover:opacity-100 p-1 text-danger/70 hover:text-danger transition-opacity"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
