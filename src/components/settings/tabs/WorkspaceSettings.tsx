import { useState } from 'react';
import { useStore } from '../../../hooks/useStore';
import { Download } from 'lucide-react';

export function WorkspaceSettings() {
    const { exportData } = useStore();
    const [workspaceName, setWorkspaceName] = useState("My Workspace");

    return (
        <div className="space-y-8 animate-in fade-in duration-300 max-w-2xl">
            <div>
                <h2 className="text-lg font-medium text-foreground mb-1">Workspace</h2>
                <p className="text-sm text-secondary">Manage workspace settings and exports.</p>
            </div>

            <section className="space-y-6">
                {/* Workspace Name */}
                <div className="grid gap-2">
                    <label className="text-sm font-medium text-foreground">Workspace Name</label>
                    <input
                        type="text"
                        value={workspaceName}
                        onChange={(e) => setWorkspaceName(e.target.value)}
                        className="w-full p-2 bg-surfaceHighlight/30 rounded-md border border-border/10 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
                    />
                </div>

                {/* Analytics Toggle (Mock) */}
                <div className="flex items-center justify-between py-4 border-t border-border/10">
                    <div className="pr-8">
                        <div className="font-medium text-foreground">Analytics</div>
                        <p className="text-sm text-secondary">
                            Save and display page view analytics.
                        </p>
                    </div>
                    {/* Simple Toggle Switch Mockup */}
                    <div className="w-10 h-6 bg-accent rounded-full relative cursor-pointer">
                        <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div>
                    </div>
                </div>

                {/* Export Content */}
                <div className="flex items-center justify-between py-4 border-t border-border/10">
                    <div>
                        <div className="font-medium text-foreground">Export Content</div>
                        <p className="text-sm text-secondary">
                            Download all your data (JSON).
                        </p>
                    </div>
                    <button
                        onClick={exportData}
                        className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-foreground bg-surfaceHighlight hover:bg-surfaceHighlight/80 rounded-md transition-colors"
                    >
                        <Download className="w-3.5 h-3.5" />
                        Export
                    </button>
                </div>
            </section>
        </div>
    );
}
